# paperclip-mcp

MCP (Model Context Protocol) server for the [Paperclip](https://github.com/paperclipai/paperclip) AI agent orchestration API.

Exposes Paperclip's REST API as MCP tools so any MCP-compatible AI client (Claude Desktop, Cursor, Kiro, etc.) can manage your AI companies, agents, projects, and tasks.

## Tools

| Tool | Description |
|------|-------------|
| `health_check` | Check server health |
| `list_companies` | List all companies |
| `get_company` | Get a company by ID |
| `create_company` | Create a new company |
| `list_agents` | List agents for a company |
| `get_agent` | Get an agent by ID |
| `list_projects` | List projects for a company |
| `get_project` | Get a project by ID |
| `create_project` | Create a new project |
| `list_issues` | List issues for a company (optionally filtered by project) |
| `get_issue` | Get an issue by ID |
| `create_issue` | Create a new issue/task |
| `list_goals` | List goals for a company |
| `create_goal` | Create a new goal |
| `get_costs` | Get cost summary for a company |
| `get_activity` | Get recent activity for a company |
| `list_approvals` | List pending approvals for a company |
| `approve` | Approve a pending approval |
| `reject_approval` | Reject a pending approval |
| `get_dashboard` | Get dashboard summary for a company |

## Prerequisites

- Node.js >= 18
- A running [Paperclip](https://github.com/paperclipai/paperclip) instance
- A **Board API Key** (required when Paperclip runs in `authenticated` mode)

### Obtaining a Board API Key

Paperclip instances running in `authenticated` mode require a Board API Key for API access. To get one:

1. Open the Paperclip UI in your browser (e.g. `http://localhost:3100`)
2. Sign in with your account
3. Use the CLI auth flow — the Paperclip CLI (`pnpm paperclipai`) can generate a Board API Key via the challenge/approval process
4. Alternatively, use the API directly:
   ```bash
   # Create a CLI auth challenge
   curl -X POST http://localhost:3100/api/cli-auth/challenges \
     -H 'Content-Type: application/json' \
     -d '{"command": "paperclip-mcp", "clientName": "Paperclip MCP", "requestedAccess": "board"}'
   ```
   This returns an `approvalUrl` — open it in your browser while signed in to approve the challenge. The `boardApiToken` from the response is your API key.

## Setup

### Kiro CLI

Add to `~/.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "paperclip": {
      "command": "node",
      "args": ["/path/to/paperclip-mcp/dist/index.js"],
      "env": {
        "PAPERCLIP_BASE_URL": "http://localhost:3100",
        "PAPERCLIP_API_KEY": "pcp_board_your-api-key-here"
      }
    }
  }
}
```

Then restart Kiro CLI to load the MCP server.

### npx (no install required)

```bash
PAPERCLIP_BASE_URL=http://localhost:3100 PAPERCLIP_API_KEY=pcp_board_... npx paperclip-mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "paperclip": {
      "command": "npx",
      "args": ["paperclip-mcp"],
      "env": {
        "PAPERCLIP_BASE_URL": "http://localhost:3100",
        "PAPERCLIP_API_KEY": "pcp_board_your-api-key-here"
      }
    }
  }
}
```

### Cursor

Add to your MCP config (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "paperclip": {
      "command": "npx",
      "args": ["paperclip-mcp"],
      "env": {
        "PAPERCLIP_BASE_URL": "http://localhost:3100",
        "PAPERCLIP_API_KEY": "pcp_board_your-api-key-here"
      }
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PAPERCLIP_BASE_URL` | `http://localhost:3100` | Paperclip server URL |
| `PAPERCLIP_API_KEY` | _(none)_ | Board API key (required for `authenticated` mode) |

## Development

```bash
git clone https://github.com/darljed/paperclip-mcp
cd paperclip-mcp
npm install
npm run build
PAPERCLIP_BASE_URL=http://localhost:3100 PAPERCLIP_API_KEY=pcp_board_... node dist/index.js
```

## License

MIT
