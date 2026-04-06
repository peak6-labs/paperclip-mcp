import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { AsyncLocalStorage } from "node:async_hooks";
import { createServer } from "node:http";
import { z } from "zod";
import { paperclipFetch, type PaperclipConfig } from "./client.js";

const defaultConfig: PaperclipConfig = {
  baseUrl: process.env.PAPERCLIP_BASE_URL ?? "http://localhost:3100",
  apiKey: process.env.PAPERCLIP_API_KEY,
};

const defaultAgentId = process.env.PAPERCLIP_AGENT_ID;
const defaultCompanyId = process.env.PAPERCLIP_COMPANY_ID;
const defaultProjectId = process.env.PAPERCLIP_PROJECT_ID;

interface RequestContext {
  agentId?: string;
  companyId?: string;
  projectId?: string;
  apiKey?: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

function getContext(): RequestContext {
  const ctx = requestContext.getStore();
  return {
    agentId: ctx?.agentId ?? defaultAgentId,
    companyId: ctx?.companyId ?? defaultCompanyId,
    projectId: ctx?.projectId ?? defaultProjectId,
    apiKey: ctx?.apiKey ?? defaultConfig.apiKey,
  };
}

function getConfig(): PaperclipConfig {
  const ctx = getContext();
  return { baseUrl: defaultConfig.baseUrl, apiKey: ctx.apiKey };
}

function registerTools(s: McpServer) {
  s.tool("health_check", "Check Paperclip server health", {}, async () => {
    const data = await paperclipFetch(getConfig(), "/api/health");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  s.tool("list_companies", "List all companies", {}, async () => {
    const data = await paperclipFetch(getConfig(), "/api/companies");
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  s.tool("get_company", "Get a company by ID",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("create_company", "Create a new company",
    { name: z.string().describe("Company name"), description: z.string().optional().describe("Company description") },
    async (args) => {
      const data = await paperclipFetch(getConfig(), "/api/companies", { method: "POST", body: JSON.stringify(args) });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("list_agents", "List agents for a company",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/agents`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("get_agent", "Get an agent by ID",
    { agentId: z.string().describe("Agent ID") },
    async ({ agentId }) => {
      const data = await paperclipFetch(getConfig(), `/api/agents/${agentId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("list_projects", "List projects for a company",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/projects`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("get_project", "Get a project by ID",
    { projectId: z.string().describe("Project ID") },
    async ({ projectId }) => {
      const data = await paperclipFetch(getConfig(), `/api/projects/${projectId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("create_project", "Create a new project",
    { companyId: z.string().describe("Company ID"), name: z.string().describe("Project name"), description: z.string().optional().describe("Project description") },
    async ({ companyId, ...body }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/projects`, { method: "POST", body: JSON.stringify(body) });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("list_issues", "List issues for a company",
    { companyId: z.string().describe("Company ID"), projectId: z.string().optional().describe("Filter by project ID") },
    async ({ companyId, projectId }) => {
      const query = projectId ? `?projectId=${projectId}` : "";
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/issues${query}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("get_issue", "Get an issue by ID",
    { issueId: z.string().describe("Issue ID") },
    async ({ issueId }) => {
      const data = await paperclipFetch(getConfig(), `/api/issues/${issueId}`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("create_issue", "Create a new issue/task",
    {
      companyId: z.string().describe("Company ID"), title: z.string().describe("Issue title"),
      description: z.string().optional().describe("Issue description"), projectId: z.string().optional().describe("Project ID"),
      assigneeAgentId: z.string().optional().describe("Agent ID to assign"), assigneeUserId: z.string().optional().describe("User ID to assign"),
      status: z.string().optional().describe("Issue status (backlog, todo, in_progress, done, cancelled)"),
      priority: z.string().optional().describe("Issue priority (low, medium, high, urgent)"),
    },
    async ({ companyId, ...body }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/issues`, { method: "POST", body: JSON.stringify(body) });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("list_goals", "List goals for a company",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/goals`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("create_goal", "Create a new goal",
    { companyId: z.string().describe("Company ID"), title: z.string().describe("Goal title"), description: z.string().optional().describe("Goal description") },
    async ({ companyId, ...body }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/goals`, { method: "POST", body: JSON.stringify(body) });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("get_costs", "Get cost summary for a company",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/costs/summary`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("get_activity", "Get recent activity for a company",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/activity`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("list_approvals", "List pending approvals for a company",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/approvals`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("approve", "Approve a pending approval",
    { approvalId: z.string().describe("Approval ID"), comment: z.string().optional().describe("Approval comment") },
    async ({ approvalId, comment }) => {
      const data = await paperclipFetch(getConfig(), `/api/approvals/${approvalId}/approve`, { method: "POST", body: JSON.stringify({ comment }) });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("reject_approval", "Reject a pending approval",
    { approvalId: z.string().describe("Approval ID"), reason: z.string().optional().describe("Rejection reason") },
    async ({ approvalId, reason }) => {
      const data = await paperclipFetch(getConfig(), `/api/approvals/${approvalId}/reject`, { method: "POST", body: JSON.stringify({ comment: reason }) });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("get_dashboard", "Get dashboard summary for a company",
    { companyId: z.string().describe("Company ID") },
    async ({ companyId }) => {
      const data = await paperclipFetch(getConfig(), `/api/companies/${companyId}/dashboard`);
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("list_plugin_tools",
    "List all available plugin-contributed tools (e.g., x-intelligence search, analysis, trending). Use this to discover what tools are available before calling execute_plugin_tool.",
    {},
    async () => {
      const data = await paperclipFetch(getConfig(), "/api/plugins/tools");
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );

  s.tool("execute_plugin_tool",
    "Execute a plugin tool by its fully namespaced name (e.g., 'peak6-labs.x-intelligence:search-x'). Call list_plugin_tools first to discover available tools and their parameter schemas.",
    {
      tool: z.string().describe("Fully namespaced tool name (e.g., 'peak6-labs.x-intelligence:search-x')"),
      parameters: z.string().optional().describe("Tool parameters as a JSON string — check list_plugin_tools for the schema"),
    },
    async ({ tool, parameters }) => {
      const parsed = parameters ? JSON.parse(parameters) : {};
      const ctx = getContext();
      const runContext: Record<string, string> = {
        runId: process.env.PAPERCLIP_RUN_ID ?? crypto.randomUUID(),
      };
      if (ctx.agentId) runContext.agentId = ctx.agentId;
      if (ctx.companyId) runContext.companyId = ctx.companyId;
      if (ctx.projectId) runContext.projectId = ctx.projectId;
      const data = await paperclipFetch(getConfig(), "/api/plugins/tools/execute", {
        method: "POST",
        body: JSON.stringify({ tool, parameters: parsed, runContext }),
      });
      return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }
  );
}

// ── Start ─────────────────────────────────────────────────────────────────────

const mode = process.env.MCP_TRANSPORT ?? "stdio";
const port = parseInt(process.env.PORT ?? "3000", 10);
const authToken = process.env.MCP_AUTH_TOKEN;

function checkAuth(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse): boolean {
  if (!authToken) return true;
  const provided = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (provided === authToken) return true;
  res.writeHead(401, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Unauthorized" }));
  return false;
}

function extractContext(req: import("node:http").IncomingMessage): RequestContext {
  return {
    agentId: (req.headers["x-agent-id"] as string) ?? undefined,
    companyId: (req.headers["x-company-id"] as string) ?? undefined,
    projectId: (req.headers["x-project-id"] as string) ?? undefined,
    apiKey: (req.headers["x-paperclip-api-key"] as string) ?? undefined,
  };
}

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

if (mode === "http") {
  // Session tracking for both transports
  const streamableSessions = new Map<string, { transport: InstanceType<typeof StreamableHTTPServerTransport>; context: RequestContext }>();
  const sseTransports = new Map<string, InstanceType<typeof SSEServerTransport>>();
  const sessionContexts = new Map<string, RequestContext>();

  const httpServer = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    const pathname = url.pathname;

    // Health check (no auth)
    if (pathname === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    // ── Streamable HTTP transport: /mcp ────────────────────────────────────
    if (pathname === "/mcp") {
      if (!checkAuth(req, res)) return;
      const ctx = extractContext(req);
      const sessionId = req.headers["mcp-session-id"] as string | undefined;

      // Existing session — route to its transport
      if (sessionId && streamableSessions.has(sessionId)) {
        const session = streamableSessions.get(sessionId)!;
        await requestContext.run(session.context, () => session.transport.handleRequest(req, res));
        return;
      }

      // Unknown/stale session ID — client must re-initialize
      if (sessionId) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Session not found" }, id: null }));
        return;
      }

      // No session ID — only POST with initialize request can create a new session
      if (req.method !== "POST") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32600, message: "Bad Request: session required" }, id: null }));
        return;
      }

      let parsed: unknown;
      try {
        const body = await readBody(req);
        parsed = JSON.parse(body);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }));
        return;
      }

      if (!isInitializeRequest(parsed)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32600, message: "Bad Request: expected initialize request" }, id: null }));
        return;
      }

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (id) => {
          streamableSessions.set(id, { transport, context: ctx });
          console.error(`Streamable HTTP session initialized: ${id}`);
        },
      });
      transport.onclose = () => {
        if (transport.sessionId) {
          streamableSessions.delete(transport.sessionId);
          console.error(`Streamable HTTP session closed: ${transport.sessionId}`);
        }
      };

      const sessionServer = new McpServer({ name: "paperclip-mcp", version: "0.1.0" });
      registerTools(sessionServer);
      await requestContext.run(ctx, () => sessionServer.connect(transport));
      await requestContext.run(ctx, () => transport.handleRequest(req, res, parsed));
      return;
    }

    // ── SSE transport (deprecated but needed for OpenClaw): /sse + /messages
    if (pathname === "/sse" && req.method === "GET") {
      if (!checkAuth(req, res)) return;
      try {
        const transport = new SSEServerTransport("/messages", res);
        const ctx = extractContext(req);
        sessionContexts.set(transport.sessionId, ctx);
        sseTransports.set(transport.sessionId, transport);
        res.on("close", () => {
          sessionContexts.delete(transport.sessionId);
          sseTransports.delete(transport.sessionId);
        });
        const sessionServer = new McpServer({ name: "paperclip-mcp", version: "0.1.0" });
        registerTools(sessionServer);
        await requestContext.run(ctx, () => sessionServer.connect(transport));
      } catch (err) {
        console.error("SSE handler error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: String(err) }));
        }
      }
      return;
    }

    if (pathname === "/messages" && req.method === "POST") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) {
        res.writeHead(400);
        res.end("Missing sessionId");
        return;
      }
      const transport = sseTransports.get(sessionId);
      if (!transport) {
        res.writeHead(400);
        res.end("Unknown session");
        return;
      }
      const ctx = sessionContexts.get(sessionId) ?? {};
      const body = await readBody(req);
      await requestContext.run(ctx, () => transport.handlePostMessage(req, res, JSON.parse(body)));
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  });

  httpServer.listen(port, () => {
    console.error(`Paperclip MCP server listening on port ${port}`);
    console.error(`  Streamable HTTP: /mcp`);
    console.error(`  SSE (legacy):    GET /sse + POST /messages`);
  });
} else {
  const server = new McpServer({ name: "paperclip-mcp", version: "0.1.0" });
  registerTools(server);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
