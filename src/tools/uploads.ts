import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import path from 'path';
import { TelegramAdsClient } from '../client.js';

export function registerUploadTools(server: McpServer, client: TelegramAdsClient) {
  // 1. uploadAdPhoto
  server.tool(
    'upload_ad_photo',
    'Upload a photo for an ad (JPEG/PNG, up to 5 MB, at least 640px wide, 16:9 aspect ratio). Returns photo_id and photo_url.',
    {
      file_path: z.string().describe('Absolute or relative local file path to the image.'),
      account_id: z.string().optional().describe('Account ID (optional).'),
    },
    async ({ file_path, account_id }) => {
      const fileName = path.basename(file_path);
      const result = await client.uploadFile('uploadAdPhoto', file_path, fileName, { account_id });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 2. uploadAdVideo
  server.tool(
    'upload_ad_video',
    'Upload a video for an ad (MP4, up to 20 MB, at least 640px wide, 16:9 aspect ratio, 3-60 seconds duration). Returns video_id and video_url.',
    {
      file_path: z.string().describe('Absolute or relative local file path to the video file.'),
      account_id: z.string().optional().describe('Account ID (optional).'),
    },
    async ({ file_path, account_id }) => {
      const fileName = path.basename(file_path);
      const result = await client.uploadFile('uploadAdVideo', file_path, fileName, { account_id });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 3. uploadWebsitePhoto
  server.tool(
    'upload_website_photo',
    'Upload an icon/photo of the website promoted (JPEG/PNG, up to 1 MB, at least 150x150 px). Returns photo_id and photo_url.',
    {
      file_path: z.string().describe('Absolute or relative local file path to the website icon image.'),
      account_id: z.string().optional().describe('Account ID (optional).'),
    },
    async ({ file_path, account_id }) => {
      const fileName = path.basename(file_path);
      const result = await client.uploadFile('uploadWebsitePhoto', file_path, fileName, { account_id });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}
