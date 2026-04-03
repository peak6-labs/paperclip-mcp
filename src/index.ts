import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { paperclipFetch, type PaperclipConfig } from "./client.js";

const config: PaperclipConfig = {
  baseUrl: process.env.PAPERCLIP_BASE_URL ?? "http://localhost:3100",
  apiKey: process.env.PAPERCLIP_API_KEY,
};

const server = new McpServer({
  name: "paperclip-mcp",
  version: "0.1.0",
});

// ── Health ────────────────────────────────────────────────────────────────────

server.tool("health_check", "Check Paperclip server health", {}, async () => {
  const data = await paperclipFetch(config, "/api/health");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

// ── Companies ─────────────────────────────────────────────────────────────────

server.tool("list_companies", "List all companies", {}, async () => {
  const data = await paperclipFetch(config, "/api/companies");
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
});

server.tool(
  "get_company",
  "Get a company by ID",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(config, `/api/companies/${companyId}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_company",
  "Create a new company",
  {
    name: z.string().describe("Company name"),
    description: z.string().optional().describe("Company description"),
  },
  async (args) => {
    const data = await paperclipFetch(config, "/api/companies", {
      method: "POST",
      body: JSON.stringify(args),
    });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Agents ────────────────────────────────────────────────────────────────────

server.tool(
  "list_agents",
  "List agents for a company",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/agents`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_agent",
  "Get an agent by ID",
  { agentId: z.string().describe("Agent ID") },
  async ({ agentId }) => {
    const data = await paperclipFetch(config, `/api/agents/${agentId}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Projects ──────────────────────────────────────────────────────────────────

server.tool(
  "list_projects",
  "List projects for a company",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/projects`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_project",
  "Get a project by ID",
  { projectId: z.string().describe("Project ID") },
  async ({ projectId }) => {
    const data = await paperclipFetch(config, `/api/projects/${projectId}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_project",
  "Create a new project",
  {
    companyId: z.string().describe("Company ID"),
    name: z.string().describe("Project name"),
    description: z.string().optional().describe("Project description"),
  },
  async ({ companyId, ...body }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/projects`,
      { method: "POST", body: JSON.stringify(body) }
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Issues ────────────────────────────────────────────────────────────────────

server.tool(
  "list_issues",
  "List issues for a company",
  {
    companyId: z.string().describe("Company ID"),
    projectId: z.string().optional().describe("Filter by project ID"),
  },
  async ({ companyId, projectId }) => {
    const query = projectId ? `?projectId=${projectId}` : "";
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/issues${query}`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_issue",
  "Get an issue by ID",
  { issueId: z.string().describe("Issue ID") },
  async ({ issueId }) => {
    const data = await paperclipFetch(config, `/api/issues/${issueId}`);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_issue",
  "Create a new issue/task",
  {
    companyId: z.string().describe("Company ID"),
    title: z.string().describe("Issue title"),
    description: z.string().optional().describe("Issue description"),
    projectId: z.string().optional().describe("Project ID"),
    assigneeAgentId: z.string().optional().describe("Agent ID to assign"),
    assigneeUserId: z.string().optional().describe("User ID to assign"),
    status: z.string().optional().describe("Issue status (backlog, todo, in_progress, done, cancelled)"),
    priority: z.string().optional().describe("Issue priority (low, medium, high, urgent)"),
  },
  async ({ companyId, ...body }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/issues`,
      { method: "POST", body: JSON.stringify(body) }
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Goals ─────────────────────────────────────────────────────────────────────

server.tool(
  "list_goals",
  "List goals for a company",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/goals`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "create_goal",
  "Create a new goal",
  {
    companyId: z.string().describe("Company ID"),
    title: z.string().describe("Goal title"),
    description: z.string().optional().describe("Goal description"),
  },
  async ({ companyId, ...body }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/goals`,
      { method: "POST", body: JSON.stringify(body) }
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Costs ─────────────────────────────────────────────────────────────────────

server.tool(
  "get_costs",
  "Get cost summary for a company",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/costs/summary`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Activity ──────────────────────────────────────────────────────────────────

server.tool(
  "get_activity",
  "Get recent activity for a company",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/activity`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Approvals ─────────────────────────────────────────────────────────────────

server.tool(
  "list_approvals",
  "List pending approvals for a company",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/approvals`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "approve",
  "Approve a pending approval",
  {
    approvalId: z.string().describe("Approval ID"),
    comment: z.string().optional().describe("Approval comment"),
  },
  async ({ approvalId, comment }) => {
    const data = await paperclipFetch(
      config,
      `/api/approvals/${approvalId}/approve`,
      { method: "POST", body: JSON.stringify({ comment }) }
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "reject_approval",
  "Reject a pending approval",
  {
    approvalId: z.string().describe("Approval ID"),
    reason: z.string().optional().describe("Rejection reason"),
  },
  async ({ approvalId, reason }) => {
    const data = await paperclipFetch(
      config,
      `/api/approvals/${approvalId}/reject`,
      { method: "POST", body: JSON.stringify({ comment: reason }) }
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Dashboard ─────────────────────────────────────────────────────────────────

server.tool(
  "get_dashboard",
  "Get dashboard summary for a company",
  { companyId: z.string().describe("Company ID") },
  async ({ companyId }) => {
    const data = await paperclipFetch(
      config,
      `/api/companies/${companyId}/dashboard`
    );
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }
);

// ── Start ─────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
