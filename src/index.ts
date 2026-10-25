#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import { createTelegramAdsServer } from './server.js';

dotenv.config();

const { server } = createTelegramAdsServer();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Telegram Ads MCP Server running on stdio transport');
}

main().catch((error) => {
  console.error('Fatal error running Telegram Ads MCP server:', error);
  process.exit(1);
});
