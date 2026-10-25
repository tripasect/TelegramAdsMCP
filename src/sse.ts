#!/usr/bin/env node

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createTelegramAdsServer } from './server.js';

dotenv.config();

const app = express();
app.use(cors());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const AUTH_KEY = process.env.MCP_AUTH_KEY; // Optional secret key for securing remote MCP access

// Track active transports by session id
const transports = new Map<string, SSEServerTransport>();

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'telegram-ads-mcp' });
});

// Middleware for optional bearer token auth on SSE / messages
app.use((req, res, next) => {
  if (req.path === '/health') return next();
  if (AUTH_KEY) {
    const authHeader = req.headers.authorization;
    const keyParam = req.query.key as string;
    const provided = (authHeader && authHeader.replace(/^Bearer\s+/i, '')) || keyParam;
    if (provided !== AUTH_KEY) {
      res.status(401).json({ error: 'Unauthorized: Invalid MCP_AUTH_KEY' });
      return;
    }
  }
  next();
});

// SSE endpoint to establish connection
app.get('/sse', async (req, res) => {
  console.log(`[SSE] New connection from ${req.ip}`);
  const { server } = createTelegramAdsServer();

  // If client used query param ?key=..., preserve it in the messages endpoint
  const keyParam = req.query.key as string;
  const messagesEndpoint = keyParam ? `/messages?key=${encodeURIComponent(keyParam)}` : '/messages';

  const transport = new SSEServerTransport(messagesEndpoint, res);
  transports.set(transport.sessionId, transport);

  transport.onclose = () => {
    console.log(`[SSE] Session closed: ${transport.sessionId}`);
    transports.delete(transport.sessionId);
  };

  await server.connect(transport);
});

// Message endpoint to handle incoming client messages
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports.get(sessionId);

  if (!transport) {
    res.status(404).send(`Session not found for ID: ${sessionId}`);
    return;
  }

  await transport.handlePostMessage(req, res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Telegram Ads MCP SSE Server listening on port ${PORT}`);
  console.log(`SSE Endpoint: http://0.0.0.0:${PORT}/sse`);
  console.log(`Healthcheck: http://0.0.0.0:${PORT}/health`);
});
