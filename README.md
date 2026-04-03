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
| `list_issues` | List issues for a project |
| `get_issue` | Get an issue by ID |
| `create_issue` | Create a new issue/task |
| `list_goals` | List goals for a company |
| `create_goal` | Create a new goal |
| `get_costs` | Get cost summary for a company |
| `get_activity` | Get recent activity for a company |
| `list_approvals` | List pending approvals |
| `approve` | Approve a pending approval |
| `reject_approval` | Reject a pending approval |
| `get_dashboard` | Get dashboard summary |

## Usage

### npx (no install required)

```bash
PAPERCLIP_BASE_URL=http://localhost:3100 npx paperclip-mcp
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
        "PAPERCLIP_API_KEY": "your-api-key-if-needed"
      }
    }
  }
}
```

### Cursor / Kiro

Add to your MCP config:

```json
{
  "mcpServers": {
    "paperclip": {
      "command": "npx",
      "args": ["paperclip-mcp"],
      "env": {
        "PAPERCLIP_BASE_URL": "http://localhost:3100"
      }
    }
  }
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PAPERCLIP_BASE_URL` | `http://localhost:3100` | Paperclip server URL |
| `PAPERCLIP_API_KEY` | _(none)_ | API key (if authentication is enabled) |

## Development

```bash
git clone https://github.com/darljed/paperclip-mcp
cd paperclip-mcp
npm install
npm run build
PAPERCLIP_BASE_URL=http://localhost:3100 node dist/index.js
```

## License

MIT
