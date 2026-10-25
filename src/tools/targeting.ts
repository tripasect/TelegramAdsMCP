import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TelegramAdsClient } from '../client.js';

export function registerTargetingTools(server: McpServer, client: TelegramAdsClient) {
  // 1. getTargetLanguagesList
  server.tool(
    'get_target_languages_list',
    'Get the list of available target languages supported by Telegram Ads (returns language codes and names).',
    {},
    async () => {
      const result = await client.call('getTargetLanguagesList', {}, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 2. getTargetTopicsList
  server.tool(
    'get_target_topics_list',
    'Get the list of available targeting topics/interests (topic IDs and names).',
    {},
    async () => {
      const result = await client.call('getTargetTopicsList', {}, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 3. getTargetCountriesList
  server.tool(
    'get_target_countries_list',
    'Get the list of available countries supported for user targeting.',
    {},
    async () => {
      const result = await client.call('getTargetCountriesList', {}, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 4. getTargetLocationsById
  server.tool(
    'get_target_locations_by_id',
    'Get target geographic locations by their location identifiers.',
    {
      location_ids: z.array(z.number()).describe('Array of location IDs.'),
    },
    async ({ location_ids }) => {
      const result = await client.call('getTargetLocationsById', { location_ids }, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 5. getTargetLocationsList
  server.tool(
    'get_target_locations_list',
    'Search for target locations within a specific country (e.g., cities, regions).',
    {
      country_code: z.string().length(2).describe('Two-letter ISO 3166-1 alpha-2 country code (e.g. "US", "DE").'),
      query: z.string().describe('Search query for location name.'),
      offset: z.string().optional().describe('Pagination offset.'),
      limit: z.number().min(1).max(100).optional().describe('Limit of results (defaults to 100).'),
    },
    async (params) => {
      const result = await client.call('getTargetLocationsList', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 6. getTargetChannel
  server.tool(
    'get_target_channel',
    'Resolve and validate a channel by its username (e.g. "@durov") or ID. Must be called to resolve channels before using numeric IDs in ads targeting.',
    {
      channel_id: z.union([z.number(), z.string()]).describe('Channel username (format: "@channelusername") or numeric ID.'),
      for_excluding: z.boolean().optional().describe('Pass true if the channel is meant to be excluded.'),
    },
    async (params) => {
      const result = await client.call('getTargetChannel', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 7. getTargetBot
  server.tool(
    'get_target_bot',
    'Resolve and validate a bot by its username (e.g. "@samplebot") or ID for bot targeting.',
    {
      bot_id: z.union([z.number(), z.string()]).describe('Bot username (format: "@usernamebot") or numeric ID.'),
    },
    async (params) => {
      const result = await client.call('getTargetBot', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}
