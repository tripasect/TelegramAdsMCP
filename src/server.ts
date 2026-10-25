import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { TelegramAdsClient } from './client.js';
import { registerAccountTools } from './tools/account.js';
import { registerAdTools } from './tools/ads.js';
import { registerTargetingTools } from './tools/targeting.js';
import { registerAudienceAndPixelTools } from './tools/audiences_pixel.js';
import { registerUploadTools } from './tools/uploads.js';

export function createTelegramAdsServer() {
  const server = new McpServer({
    name: 'telegram-ads-mcp',
    version: '1.0.0',
  });

  const client = new TelegramAdsClient();

  registerAccountTools(server, client);
  registerAdTools(server, client);
  registerTargetingTools(server, client);
  registerAudienceAndPixelTools(server, client);
  registerUploadTools(server, client);

  return { server, client };
}
