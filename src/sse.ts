#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createTelegramAdsServer } from './server.js';

dotenv.config();

const app = express();
app.use(cors());

// Parse JSON bodies for Streamable HTTP POST requests
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const AUTH_KEY = process.env.MCP_AUTH_KEY; // Secret token for securing remote MCP access

// Track active transports
const sseTransports = new Map<string, SSEServerTransport>();
const streamableTransports = new Map<string, StreamableHTTPServerTransport>();

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'telegram-ads-mcp', transports: ['streamable-http', 'sse'] });
});

// Authentication middleware (supports Bearer token in Authorization header or ?key= query parameter)
app.use((req, res, next) => {
  if (req.path === '/health') return next();

  if (AUTH_KEY) {
    const authHeader = req.headers.authorization;
    const keyParam = req.query.key as string;
    let provided = keyParam;

    if (authHeader) {
      const match = authHeader.match(/^Bearer\s+(.+)$/i);
      if (match) {
        provided = match[1];
      } else {
        provided = authHeader;
      }
    }

    if (!provided || provided !== AUTH_KEY) {
      res.status(401).json({ error: 'Unauthorized: Invalid or missing MCP_AUTH_KEY Bearer token' });
      return;
    }
  }
  next();
});

// ============================================================================
// 1. Streamable HTTP Transport (MCP Modern Specification / OpenAI Codex)
// Endpoints: POST/GET/DELETE on / or /mcp
// ============================================================================

async function handleStreamableHttpRequest(req: express.Request, res: express.Response) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  let transport: StreamableHTTPServerTransport;

  if (sessionId && streamableTransports.has(sessionId)) {
    transport = streamableTransports.get(sessionId)!;
  } else {
    // Create new transport and server instance for this session
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableJsonResponse: true,
      onsessionclosed: (closedId) => {
        console.log(`[Streamable HTTP] Session closed: ${closedId}`);
        streamableTransports.delete(closedId);
      },
    });

    const { server } = createTelegramAdsServer();
    await server.connect(transport);

    if (transport.sessionId) {
      streamableTransports.set(transport.sessionId, transport);
    }
  }

  await transport.handleRequest(req, res, req.body);

  if (transport.sessionId && !streamableTransports.has(transport.sessionId)) {
    streamableTransports.set(transport.sessionId, transport);
  }
}

// Support Streamable HTTP on both root "/" and "/mcp"
app.all('/', async (req, res) => {
  // If request is a browser GET / without MCP headers, show simple greeting or pass to transport
  const accept = req.headers.accept || '';
  if (req.method === 'GET' && !accept.includes('text/event-stream') && !accept.includes('application/json')) {
    res.json({
      service: 'telegram-ads-mcp',
      status: 'running',
      transports: {
        streamable_http: ['/', '/mcp'],
        sse: '/sse',
      },
      docs: 'https://github.com/tripasect/TelegramAdsMCP',
    });
    return;
  }
  await handleStreamableHttpRequest(req, res);
});

app.all('/mcp', async (req, res) => {
  await handleStreamableHttpRequest(req, res);
});

// ============================================================================
// 2. Legacy SSE Transport (Claude Desktop / SSE Clients)
// Endpoints: GET /sse and POST /messages
// ============================================================================

app.get('/sse', async (req, res) => {
  console.log(`[SSE] New connection from ${req.ip}`);
  const { server } = createTelegramAdsServer();

  const keyParam = req.query.key as string;
  const messagesEndpoint = keyParam ? `/messages?key=${encodeURIComponent(keyParam)}` : '/messages';

  const transport = new SSEServerTransport(messagesEndpoint, res);
  sseTransports.set(transport.sessionId, transport);

  transport.onclose = () => {
    console.log(`[SSE] Session closed: ${transport.sessionId}`);
    sseTransports.delete(transport.sessionId);
  };

  await server.connect(transport);
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = sseTransports.get(sessionId);

  if (!transport) {
    res.status(404).send(`Session not found for ID: ${sessionId}`);
    return;
  }

  await transport.handlePostMessage(req, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Telegram Ads MCP Server listening on port ${PORT}`);
  console.log(`- Streamable HTTP Endpoints: http://0.0.0.0:${PORT}/ and http://0.0.0.0:${PORT}/mcp`);
  console.log(`- SSE Endpoint: http://0.0.0.0:${PORT}/sse`);
  console.log(`- Healthcheck: http://0.0.0.0:${PORT}/health`);
});
