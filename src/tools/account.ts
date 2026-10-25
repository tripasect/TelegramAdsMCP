import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TelegramAdsClient } from '../client.js';

export function registerAccountTools(server: McpServer, client: TelegramAdsClient) {
  // 1. getCurrentAccount
  server.tool(
    'get_current_account',
    'Get information about the current authenticated Telegram Ads account (ID, title, currency, remaining_budget, spent_budget, ads_budget).',
    {},
    async () => {
      const result = await client.call('getCurrentAccount', {}, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 2. getAccountInfo
  server.tool(
    'get_account_info',
    'Get company contact and legal information for an account (title, full_name, email, phone_number, country, city, legal_name).',
    {
      account_id: z.string().optional().describe('Unique identifier of the account. Defaults to current account.'),
    },
    async ({ account_id }) => {
      const result = await client.call('getAccountInfo', { account_id }, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 3. editAccountInfo
  server.tool(
    'edit_account_info',
    'Edit company info of an account (title, full_name, email, phone_number, country, city, legal_name).',
    {
      account_id: z.string().optional().describe('Unique identifier of the account. Defaults to current account.'),
      title: z.string().optional().describe('New title of the account, 1-128 chars.'),
      full_name: z.string().optional().describe('New company full name, 1-256 chars.'),
      email: z.string().optional().describe('New company email, 1-64 chars.'),
      phone_number: z.string().optional().describe('New phone number.'),
      country: z.string().optional().describe('Company country, 1-128 chars.'),
      city: z.string().optional().describe('Company city, 1-128 chars.'),
      legal_name: z.string().optional().describe('Advertiser legal name for users to view, 0-256 chars.'),
    },
    async (params) => {
      const result = await client.call('editAccountInfo', params);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 4. getAccountsById
  server.tool(
    'get_accounts_by_id',
    'Get information about specific Telegram Ads accounts by their IDs.',
    {
      account_ids: z.array(z.string()).describe('Array of account identifiers.'),
    },
    async ({ account_ids }) => {
      const result = await client.call('getAccountsById', { account_ids }, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 5. getRelatedAccountsList
  server.tool(
    'get_related_accounts_list',
    'Get the list of accounts related to or managed by the main advertiser account.',
    {
      offset: z.number().optional().describe('Offset of related accounts list.'),
      limit: z.number().optional().describe('Maximum number of related accounts to retrieve.'),
    },
    async (params) => {
      const result = await client.call('getRelatedAccountsList', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 6. getAccountStats
  server.tool(
    'get_account_stats',
    'Get aggregated statistics related to the account (views, clicks, spent_budget, etc.) over a time interval.',
    {
      account_id: z.string().optional().describe('Unique identifier of the account. Defaults to current account.'),
      from_time: z.number().describe('Start of period in Unix timestamp (seconds).'),
      to_time: z.number().describe('End of period in Unix timestamp (seconds). Not included in result.'),
      interval: z.union([z.literal(300), z.literal(86400)]).describe('Interval in seconds: 300 (5 min) or 86400 (1 day).'),
    },
    async (params) => {
      const result = await client.call('getAccountStats', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 7. getAccountReport
  server.tool(
    'get_account_report',
    'Get report of active advertisements for an account for a given year and month.',
    {
      account_id: z.string().optional().describe('Account ID. Defaults to current account.'),
      year: z.number().describe('Year of the report, e.g. 2024, 2025.'),
      month: z.number().min(1).max(12).describe('Month of the report (1-12).'),
    },
    async (params) => {
      const result = await client.call('getAccountReport', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 8. increaseAccountBudget
  server.tool(
    'increase_account_budget',
    'Transfer budget into a child/related account from the current main account budget.',
    {
      account_id: z.string().describe('Target account ID to increase budget for.'),
      amount: z.number().positive().describe('Amount in account currency.'),
      idempotency_key: z.string().optional().describe('Unique key to prevent duplicate funding.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('increaseAccountBudget', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 9. decreaseAccountBudget
  server.tool(
    'decrease_account_budget',
    'Withdraw budget from a child/related account back to current account.',
    {
      account_id: z.string().describe('Target account ID to decrease budget from.'),
      amount: z.number().positive().describe('Amount in account currency.'),
      idempotency_key: z.string().optional().describe('Unique key to prevent duplicate operations.'),
    },
    async ({ idempotency_key, ...params }) => {
      const result = await client.call('decreaseAccountBudget', params, { idempotencyKey: idempotency_key });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 10. getAccountTransactionsList
  server.tool(
    'get_account_transactions_list',
    'Get list of financial balance transactions (deposits, transfers, ad spends) related to the account.',
    {
      account_id: z.string().optional().describe('Account ID. Defaults to current account.'),
      offset: z.number().optional().describe('Offset of transaction list.'),
      limit: z.number().optional().describe('Maximum transactions to retrieve (defaults to 100).'),
    },
    async (params) => {
      const result = await client.call('getAccountTransactionsList', params, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );

  // 11. getTransactionStatus
  server.tool(
    'get_transaction_status',
    'Check the status of a budget transaction.',
    {
      transaction_id: z.string().describe('Unique identifier of the transaction.'),
    },
    async ({ transaction_id }) => {
      const result = await client.call('getTransactionStatus', { transaction_id }, { httpMethod: 'GET' });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    }
  );
}
