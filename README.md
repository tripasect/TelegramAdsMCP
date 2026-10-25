# Telegram Ads MCP Server

Model Context Protocol (MCP) server providing **full-authority AI agent management** for the [Telegram Ads Platform API](https://promote.telegram.org/).

Built with the official `@modelcontextprotocol/sdk` and TypeScript.

---

## Features

- **Full Ad Lifecycle Management**: Create, edit, pause, resume, submit for review, budget, and delete ads.
- **Precision Targeting**: Channel targeting, user demographic & interest targeting, bot targeting, and search queries.
- **Account & Financial Oversight**: Account balances, transaction histories, stats reporting, and budget allocation between accounts.
- **Custom Audiences & Pixels**: Retargeting audience management and conversion pixel event configuration.
- **Creative Assets**: Direct multipart file uploads for ad photos, videos, and website icons.
- **Safety & Idempotency**: Transparent error propagation and built-in idempotency key handling to prevent duplicate spend.

---

## Prerequisites

- **Node.js** (v18+)
- A **Telegram Ads Access Token** obtained from your Telegram Ads account settings (`https://promote.telegram.org`).

---

## Quick Start & Installation

### 1. Build from Source

```bash
git clone <repo-url>
cd TelegramAdsMCP
npm install
npm run build
```

### 2. Configure Environment

Create a `.env` file or export the environment variable:

```bash
TELEGRAM_ADS_TOKEN="your_telegram_ads_bearer_token_here"
```

---

## Connecting to AI Agents / MCP Clients

### 1. OpenAI Codex / Modern MCP Clients (Streamable HTTP with Bearer Token)

Codex and modern MCP clients communicate using the standard **Streamable HTTP** transport with HTTP Bearer authentication:

- **Server URL**: `https://telegram-ads-mcp.blipmatch.social/mcp` (or `https://telegram-ads-mcp.blipmatch.social/`)
- **Transport**: `HTTP` / `Streamable HTTP`
- **Custom Headers**:
  - `Authorization: Bearer c5b2900fac3d9eb7e2f26aaa48bb29170dea166596a9529d`

#### Client Configuration Example:
```json
{
  "mcpServers": {
    "telegram-ads": {
      "url": "https://telegram-ads-mcp.blipmatch.social/mcp",
      "headers": {
        "Authorization": "Bearer c5b2900fac3d9eb7e2f26aaa48bb29170dea166596a9529d"
      }
    }
  }
}
```

### 2. Claude Desktop / Legacy SSE Clients

For clients that use legacy Server-Sent Events (SSE):

- **SSE URL**: `https://telegram-ads-mcp.blipmatch.social/sse?key=c5b2900fac3d9eb7e2f26aaa48bb29170dea166596a9529d`
- **Healthcheck**: `https://telegram-ads-mcp.blipmatch.social/health`

```json
{
  "mcpServers": {
    "telegram-ads-sse": {
      "url": "https://telegram-ads-mcp.blipmatch.social/sse?key=c5b2900fac3d9eb7e2f26aaa48bb29170dea166596a9529d"
    }
  }
}
```

### 3. Local stdio (Direct Process Execution)

---

## Available Tools Reference

### 1. Account & Finances
| Tool Name | Description |
|---|---|
| `get_current_account` | Retrieve ID, balance (`remaining_budget`, `spent_budget`), and currency (`TON`, `EUR`, `XTR`). |
| `get_account_info` | Get company name, contact info, and legal name. |
| `edit_account_info` | Update company email, phone, title, legal name, etc. |
| `get_accounts_by_id` | Query specific accounts by ID. |
| `get_related_accounts_list` | List child / managed advertiser accounts. |
| `get_account_stats` | Aggregated performance metrics over time (views, clicks, budget spent). |
| `get_account_report` | Monthly active ad breakdown and performance reports. |
| `increase_account_budget` | Fund or transfer budget to a child account. |
| `decrease_account_budget` | Reclaim budget from a child account. |
| `get_account_transactions_list` | Complete financial transaction ledger. |
| `get_transaction_status` | Status check for budget transactions. |

### 2. Campaign & Ad Management
| Tool Name | Description |
|---|---|
| `create_ad` | Create new ad campaign with CPM, text, URL, placement, targeting, and budget. |
| `edit_ad` | Update text, CPM, creatives, schedule, and pause/resume flags. |
| `edit_ad_status` | Quick helper to pause (`paused`) or resume (`active`) an ad. |
| `increase_ad_budget` | Allocate budget from account balance to an ad. |
| `decrease_ad_budget` | Return unspent budget from an ad back to the account. |
| `submit_ad_for_review` | Send ad for moderation review. |
| `delete_ad` | Delete an ad (requires ad to be paused for >= 10 mins). |
| `get_ads_list` | List all ads in account with status and metadata. |
| `get_ads_by_id` | Inspect specific ads by their IDs. |
| `get_ad_stats` | Detailed timeseries analytics for an ad (impressions, clicks, conversions). |
| `get_ad_transactions_list` | Balance and impression spend log for an ad. |

### 3. Targeting & Discovery
| Tool Name | Description |
|---|---|
| `get_target_channel` | Resolve channel by `@username` or ID (required prior to targeting by ID). |
| `get_target_bot` | Resolve and validate target bots by `@usernamebot`. |
| `get_target_languages_list` | List available languages for targeting. |
| `get_target_topics_list` | List interest topics and topic IDs. |
| `get_target_countries_list` | List supported ISO country codes. |
| `get_target_locations_list` | Search cities/regions within a country. |
| `get_target_locations_by_id` | Retrieve specific location objects. |

### 4. Audiences & Tracking Pixels
| Tool Name | Description |
|---|---|
| `create_audience` | Create custom retargeting audience with phone numbers or SHA256 hashes. |
| `edit_audience` | Add, remove, or reset phone numbers in an audience. |
| `get_audiences_list` | List retargeting audiences. |
| `get_audiences_by_id` | Retrieve audience details by ID. |
| `delete_audience` | Remove an audience. |
| `create_pixel` | Create tracking pixel tag for website. |
| `get_pixel` | Fetch pixel tag details. |
| `create_pixel_event` | Create conversion event (e.g. `purchase`, `lead`, `page_view`). |
| `edit_pixel_event` | Rename an existing pixel event. |
| `delete_pixel_event` | Remove an unused pixel event. |
| `get_pixel_events_list` | List all conversion tracking events. |

### 5. Media & Creatives Uploads
| Tool Name | Description |
|---|---|
| `upload_ad_photo` | Upload creative image (JPEG/PNG, 16:9, >= 640px). Returns `photo_id`. |
| `upload_ad_video` | Upload video creative (MP4, 16:9, 3-60s). Returns `video_id`. |
| `upload_website_photo` | Upload website avatar/icon (>= 150x150px). Returns `photo_id`. |

---

## License

MIT
