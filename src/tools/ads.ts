import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TelegramAdsClient } from '../client.js';

// Schemas for Ad Target
const ChannelsTargetSchema = z.object({
  type: z.literal('channels'),
  language_codes: z.array(z.string()).optional().describe('0-8 IETF language tags (e.g. ["en", "ru"]).'),
  topic_ids: z.array(z.number()).optional().describe('0-20 topic IDs. Total with exclude_topic_ids <= 20.'),
  exclude_topic_ids: z.array(z.number()).optional().describe('Topic IDs to exclude.'),
  channel_ids: z.array(z.union([z.number(), z.string()])).optional().describe('0-100 channel IDs or usernames (@username).'),
  exclude_channel_ids: z.array(z.union([z.number(), z.string()])).optional().describe('Channels to exclude.'),
});

const UsersTargetSchema = z.object({
  type: z.literal('users'),
  country_codes: z.array(z.string()).describe('0-8 ISO 3166-1 alpha-2 country codes (e.g. ["US"]).'),
  location_ids: z.array(z.number()).optional().describe('0-20 locations within the chosen country.'),
  language_codes: z.array(z.string()).optional().describe('0-8 language tags of the user.'),
  topic_ids: z.array(z.number()).optional().describe('0-20 topic IDs representing user interests.'),
  intersect_topics: z.boolean().optional().describe('If true, user must match ALL topics.'),
  exclude_topic_ids: z.array(z.number()).optional().describe('Topics to exclude.'),
  channel_ids: z.array(z.union([z.number(), z.string()])).optional().describe('0-100 channel IDs/@usernames whose audience to target.'),
  exclude_channel_ids: z.array(z.union([z.number(), z.string()])).optional().describe('Channels whose audience to exclude.'),
  audience_ids: z.array(z.number()).optional().describe('0-4 retargeting audience IDs.'),
  exclude_audience_ids: z.array(z.number()).optional().describe('Retargeting audience IDs to exclude.'),
  device: z.enum(['ios', 'android', 'mobile', 'desktop']).optional().describe('Target specific device platform.'),
  exclude_political_channels: z.boolean().optional().describe('Exclude political channels.'),
  political_channels_only: z.boolean().optional().describe('Target only political channels.'),
});

const BotsTargetSchema = z.object({
  type: z.literal('bots'),
  bot_ids: z.array(z.union([z.number(), z.string()])).describe('0-100 bot IDs or @usernamebot.'),
});

const SearchTargetSchema = z.object({
  type: z.literal('search'),
  country_codes: z.array(z.string()).optional().describe('0-8 ISO 3166-1 alpha-2 country codes.'),
  location_ids: z.array(z.number()).optional().describe('0-20 locations within chosen country.'),
  language_codes: z.array(z.string()).optional().describe('0-8 language tags.'),
  channel_ids: z.array(z.union([z.number(), z.string()])).optional().describe('0-100 channels/@usernames to search within.'),
  exclude_channel_ids: z.array(z.union([z.number(), z.string()])).optional().describe('Channels to exclude.'),
  queries: z.array(z.string()).optional().describe('Search search query strings (1-64 chars each).'),
  exclude_queries: z.array(z.string()).optional().describe('Search queries to exclude.'),
});

const InputAdTargetSchema = z.union([
  ChannelsTargetSchema,
  UsersTargetSchema,
  BotsTargetSchema,
  SearchTargetSchema,
]);

const InputScheduleSchema = z.object({
  week_hours_mask: z.array(z.number()).length(7).describe('Array of 7 integers (bitwise masks 0-16777215) Mon-Sun.'),
  timezone: z.number().optional().describe('Timezone offset in seconds from UTC (e.g. 0, 3600, 12600).'),
  use_viewer_timezone: z.boolean().optional().describe('Use timezone of the viewer (target: users only).'),
});

export function registerAdTools(server: McpServer, client: TelegramAdsClient) {
  // 1. createAd
  server.tool(
    'create_ad',
    'Create a new advertisement in Telegram Ads platform.',
    {
      account_id: z.string().optional().describe('Account ID. Defaults to current account.'),
      title: z.string().min(1).max(128).describe('Internal ad title (1-128 bytes, for dashboard only).'),
      text: z.string().min(1).max(160).optional().describe('Public ad copy text (1-160 chars). Required for non-search ads.'),
      promote_url: z.string().min(1).max(256).describe('Destination URL (channel @username or t.me link, bot link, post link, or external website).'),
      cpm: z.number().positive().describe('Price per 1000 impressions in account currency (e.g. TON, EUR, XTR).'),
      placement: z.enum(['channel_post', 'bot_banner', 'search_result', 'video_banner']).describe('Ad placement.'),
      target: InputAdTargetSchema.describe('Targeting settings (by channels, users demographics/interests, bots, or search).'),
      photo_id: z.string().optional().describe('Photo ID from upload_ad_photo (applicable for channels/users).'),
      video_id: z.string().optional().describe('Video ID from upload_ad_video (applicable for channels/users).'),
      website_name: z.string().max(40).optional().describe('Website name if promoting an external link (1-40 chars).'),
      website_photo_id: z.string().optional().describe('Website icon photo ID from upload_website_photo.'),
      button: z.enum(['subscribe', 'view', 'read', 'learn_more', 'download', 'open', 'sign_up', 'buy', 'order', 'play', 'try', 'leave_request']).optional().describe('Call-to-action button label.'),
      conversion_event_id: z.string().optional().describe('Pixel event ID for conversion tracking.'),
      impression_frequency: z.number().min(1).max(4).optional().describe('Impressions per single user per day (1-4, default 1).'),
      initial_budget: z.number().nonnegative().optional().describe('Initial budget to allocate from account balance.'),
      daily_budget_limit: z.number().nonnegative().optional().describe('Daily spending cap in account currency (0 = unlimited).'),
      is_paused: z.boolean().optional().describe('Whether to keep ad paused immediately after creation.'),
      activate_date: z.number().optional().describe('Unix timestamp when ad should activate.'),
      deactivate_date: z.number().optional().describe('Unix timestamp when ad should pause.'),
      schedule: InputScheduleSchema.optional().describe('Hourly display schedule.'),
      show_userpic: z.boolean().optional().describe('Show avatar/profile picture of channel/bot (+30% CPM average).'),
      return_target: z.boolean().optional().describe('Whether to include targeting in the returned Ad object.'),
      idempotency_key: z.string().optional().describe('Idempotency key to safely prevent duplicate ad creation.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('createAd', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 2. editAd
  server.tool(
    'edit_ad',
    'Edit an existing advertisement (text, CPM, budget limits, pause/resume, creative, schedule).',
    {
      account_id: z.string().optional().describe('Account ID. Defaults to current account.'),
      ad_id: z.number().describe('ID of the advertisement to edit.'),
      title: z.string().optional().describe('New title (1-128 bytes).'),
      text: z.string().optional().describe('New text (1-160 chars).'),
      promote_url: z.string().optional().describe('New destination URL.'),
      cpm: z.number().positive().optional().describe('New CPM bid in account currency.'),
      photo_id: z.string().optional().describe('New photo ID from upload_ad_photo.'),
      video_id: z.string().optional().describe('New video ID from upload_ad_video.'),
      website_name: z.string().optional().describe('Website name.'),
      website_photo_id: z.string().optional().describe('Website icon ID.'),
      button: z.enum(['subscribe', 'view', 'read', 'learn_more', 'download', 'open', 'sign_up', 'buy', 'order', 'play', 'try', 'leave_request']).optional().describe('CTA button.'),
      impression_frequency: z.number().min(1).max(4).optional().describe('Impression frequency.'),
      daily_budget_limit: z.number().optional().describe('Daily budget limit.'),
      is_paused: z.boolean().optional().describe('Set true to pause ad, false to resume.'),
      activate_date: z.number().optional().describe('Activation timestamp.'),
      deactivate_date: z.number().optional().describe('Deactivation timestamp.'),
      schedule: InputScheduleSchema.optional().describe('Display schedule.'),
      show_userpic: z.boolean().optional().describe('Show userpic avatar.'),
      return_target: z.boolean().optional().describe('Return target settings in response.'),
    },
    async (params) => {
      const result = await client.call('editAd', params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 3. editAdStatus (Helper tool providing pause/resume convenience)
  server.tool(
    'edit_ad_status',
    'Change the status of an ad (pause or resume). Uses editAd with is_paused.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_id: z.number().describe('Ad ID.'),
      status: z.enum(['active', 'paused']).describe('Desired status: "active" to resume, "paused" to hold.'),
    },
    async ({ account_id, ad_id, status }) => {
      const is_paused = status === 'paused';
      const result = await client.call('editAd', { account_id, ad_id, is_paused });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 4. increaseAdBudget
  server.tool(
    'increase_ad_budget',
    'Add budget to an existing advertisement from the account balance.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_id: z.number().describe('Ad ID.'),
      amount: z.number().positive().describe('Amount to add to ad budget.'),
      return_target: z.boolean().optional().describe('Return target settings in response.'),
      idempotency_key: z.string().optional().describe('Unique key to prevent duplicate funding.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('increaseAdBudget', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 5. decreaseAdBudget
  server.tool(
    'decrease_ad_budget',
    'Withdraw budget from an ad back to the account balance. Ad must be inactive for >= 10 mins.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_id: z.number().describe('Ad ID.'),
      amount: z.number().positive().describe('Amount to withdraw.'),
      return_target: z.boolean().optional().describe('Return target settings in response.'),
      idempotency_key: z.string().optional().describe('Unique idempotency key.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('decreaseAdBudget', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 6. submitAdForReview
  server.tool(
    'submit_ad_for_review',
    'Submit an ad for moderation review. Ad must be in "ready_for_review" status and have funds.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_id: z.number().describe('Ad ID.'),
      return_target: z.boolean().optional().describe('Return target settings.'),
    },
    async (params) => {
      const result = await client.call('submitAdForReview', params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 7. deleteAd
  server.tool(
    'delete_ad',
    'Delete an advertisement. Ad must be inactive for at least 10 minutes.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_id: z.number().describe('Ad ID to delete.'),
    },
    async (params) => {
      const result = await client.call('deleteAd', params);
      return { content: [{ type: 'text', text: JSON.stringify({ success: result }) }] };
    }
  );

  // 8. getAdsById
  server.tool(
    'get_ads_by_id',
    'Get details of specific ads by their IDs.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_ids: z.array(z.number()).describe('Array of ad IDs.'),
      return_target: z.boolean().optional().describe('Include targeting settings in response.'),
    },
    async (params) => {
      const result = await client.call('getAdsById', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 9. getAdsList
  server.tool(
    'get_ads_list',
    'List advertisements in the account with pagination.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      offset: z.string().optional().describe('Offset cursor/string for pagination.'),
      limit: z.number().min(1).max(100).optional().describe('Number of ads to retrieve (1-100, default 100).'),
      return_target: z.boolean().optional().describe('Include targeting settings in response.'),
    },
    async (params) => {
      const result = await client.call('getAdsList', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 10. getAdTransactionsList
  server.tool(
    'get_ad_transactions_list',
    'Get transactions history for a specific ad.',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_id: z.number().describe('Ad ID.'),
      offset: z.number().optional().describe('Offset.'),
      limit: z.number().optional().describe('Max transactions to retrieve.'),
    },
    async (params) => {
      const result = await client.call('getAdTransactionsList', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 11. getAdStats
  server.tool(
    'get_ad_stats',
    'Get performance statistics for an advertisement over a time range (views, clicks, opens, conversions, spent budget).',
    {
      account_id: z.string().optional().describe('Account ID.'),
      ad_id: z.number().describe('Ad ID to get statistics for.'),
      from_time: z.number().describe('Start of period in Unix timestamp (seconds).'),
      to_time: z.number().describe('End of period in Unix timestamp (seconds).'),
      interval: z.union([z.literal(300), z.literal(86400)]).describe('Interval: 300 (5 min) or 86400 (1 day).'),
    },
    async (params) => {
      const result = await client.call('getAdStats', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}
