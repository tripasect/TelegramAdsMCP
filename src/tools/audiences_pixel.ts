import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TelegramAdsClient } from '../client.js';

export function registerAudienceAndPixelTools(server: McpServer, client: TelegramAdsClient) {
  // 1. createAudience
  server.tool(
    'create_audience',
    'Create a custom retargeting audience by uploading phone numbers or SHA256 hashes.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      title: z.string().min(1).max(64).describe('Audience title.'),
      add_phones: z.array(z.string()).optional().describe('List of 0-10,000 phone numbers or SHA256 hashes.'),
      idempotency_key: z.string().optional().describe('Unique key to prevent duplicate creation.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('createAudience', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 2. editAudience
  server.tool(
    'edit_audience',
    'Edit a custom audience: rename, add phone numbers, remove phone numbers, or reset numbers.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      audience_id: z.number().describe('Audience ID.'),
      title: z.string().max(64).optional().describe('New audience title.'),
      add_phones: z.array(z.string()).optional().describe('Phone numbers or SHA256 hashes to add.'),
      remove_phones: z.array(z.string()).optional().describe('Phone numbers or SHA256 hashes to remove.'),
      reset_phones: z.boolean().optional().describe('If true, clears all phone numbers from the audience.'),
    },
    async (params) => {
      const result = await client.call('editAudience', params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 3. deleteAudience
  server.tool(
    'delete_audience',
    'Delete a custom audience. The audience must not be in use by any ads.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      audience_id: z.number().describe('Audience ID.'),
    },
    async (params) => {
      const result = await client.call('deleteAudience', params);
      return { content: [{ type: 'text', text: JSON.stringify({ success: result }) }] };
    }
  );

  // 4. getAudiencesById
  server.tool(
    'get_audiences_by_id',
    'Get custom audience details by IDs.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      audience_ids: z.array(z.number()).describe('Array of audience IDs.'),
    },
    async (params) => {
      const result = await client.call('getAudiencesById', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 5. getAudiencesList
  server.tool(
    'get_audiences_list',
    'List all custom retargeting audiences for the account.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      offset: z.number().optional().describe('Pagination offset.'),
      limit: z.number().optional().describe('Pagination limit.'),
    },
    async (params) => {
      const result = await client.call('getAudiencesList', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 6. createPixel
  server.tool(
    'create_pixel',
    'Create a Telegram Ads tracking pixel tag for your website.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      idempotency_key: z.string().optional().describe('Idempotency key.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('createPixel', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 7. getPixel
  server.tool(
    'get_pixel',
    'Get the tracking pixel tag configured for the account.',
    {
      account_id: z.string().optional().describe('Account ID.'),
    },
    async (params) => {
      const result = await client.call('getPixel', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 8. createPixelEvent
  server.tool(
    'create_pixel_event',
    'Create a conversion tracking event for your website pixel.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      title: z.string().min(1).max(64).describe('Event title in dashboard.'),
      type: z.enum([
        'page_view',
        'add_to_cart',
        'add_to_wishlist',
        'customize_product',
        'initiate_checkout',
        'add_payment_info',
        'purchase',
        'contact',
        'lead',
        'schedule',
        'complete_registration',
        'submit_application',
        'start_trial',
        'subscribe',
        'view_content',
        'search',
        'find_location',
        'donate',
        'custom',
      ]).describe('Standard event conversion action to track.'),
      idempotency_key: z.string().optional().describe('Idempotency key.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('createPixelEvent', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 9. editPixelEvent
  server.tool(
    'edit_pixel_event',
    'Edit the title of an existing custom pixel event.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      event_id: z.string().describe('Pixel event ID.'),
      title: z.string().min(1).max(64).describe('New title for the event.'),
    },
    async (params) => {
      const result = await client.call('editPixelEvent', params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 10. deletePixelEvent
  server.tool(
    'delete_pixel_event',
    'Delete a pixel event that is not currently tied to any active ads.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      event_id: z.string().describe('Pixel event ID to delete.'),
    },
    async (params) => {
      const result = await client.call('deletePixelEvent', params);
      return { content: [{ type: 'text', text: JSON.stringify({ success: result }) }] };
    }
  );

  // 11. getPixelEventsById
  server.tool(
    'get_pixel_events_by_id',
    'Get pixel events by their identifiers.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      event_ids: z.array(z.string()).describe('Array of pixel event IDs.'),
    },
    async (params) => {
      const result = await client.call('getPixelEventsById', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 12. getPixelEventsList
  server.tool(
    'get_pixel_events_list',
    'Get the list of all pixel events configured for the account.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      offset: z.number().optional().describe('Pagination offset.'),
      limit: z.number().optional().describe('Pagination limit.'),
    },
    async (params) => {
      const result = await client.call('getPixelEventsList', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}
