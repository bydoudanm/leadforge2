import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import * as db from "./db";
import { endSession, getRequestUser, hashPassword, startSession, verifyPassword } from "./auth";

type AuthedRequest = Request & { user?: NonNullable<Awaited<ReturnType<typeof getRequestUser>>> };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCookies(request: Request) {
  const header = request.headers.cookie ?? "";
  return Object.fromEntries(
    header.split(";").filter(Boolean).map((part) => {
      const index = part.indexOf("=");
      return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
    }),
  );
}

function publicUser(user: NonNullable<Awaited<ReturnType<typeof getRequestUser>>>) {
  return { id: user.id, name: user.name, email: user.email, plan: user.plan };
}

async function requireUser(request: AuthedRequest, response: Response, next: NextFunction) {
  const user = await getRequestUser(request);
  if (!user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }
  request.user = user;
  next();
}

function safeError(response: Response, error: unknown) {
  console.error("[API]", error);
  response.status(500).json({ error: "Unable to complete the request" });
}

export async function createApp() {
  const app = express();
  const server = createServer(app);
  app.use(express.json({ limit: "1mb" }));
  app.use((request, _response, next) => {
    (request as AuthedRequest & { cookies: Record<string, string> }).cookies = parseCookies(request);
    next();
  });

  app.get("/api/health", (_request, response) => response.json({ ok: true }));

  app.post("/api/auth/signup", async (request, response) => {
    const parsed = z.object({ name: z.string().trim().min(1).max(120), email: z.string().email().transform((value) => value.toLowerCase()), password: z.string().min(8).max(128) }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Enter a name, valid email, and password of at least 8 characters" });
      return;
    }
    try {
      const existing = await db.getUserByEmail(parsed.data.email);
      if (existing) {
        response.status(409).json({ error: "An account with this email already exists" });
        return;
      }
      const user = await db.createUser({
        openId: `local_${randomBytes(20).toString("hex")}`,
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: hashPassword(parsed.data.password),
        loginMethod: "password",
        plan: "free_trial",
      });
      if (!user) throw new Error("User creation returned no record");
      await startSession(user.id, response);
      response.status(201).json(publicUser(user));
    } catch (error) {
      safeError(response, error);
    }
  });

  app.post("/api/auth/login", async (request, response) => {
    const parsed = z.object({ email: z.string().email().transform((value) => value.toLowerCase()), password: z.string().min(1) }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Enter a valid email and password" });
      return;
    }
    try {
      const user = await db.getUserByEmail(parsed.data.email);
      if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
        response.status(401).json({ error: "Invalid email or password" });
        return;
      }
      await startSession(user.id, response);
      response.json(publicUser(user));
    } catch (error) {
      safeError(response, error);
    }
  });

  app.get("/api/auth/me", async (request, response) => {
    try {
      const user = await getRequestUser(request);
      if (!user) {
        response.status(401).json({ error: "Authentication required" });
        return;
      }
      response.json(publicUser(user));
    } catch (error) {
      safeError(response, error);
    }
  });

  app.post("/api/auth/logout", async (request, response) => {
    try {
      await endSession(request, response);
      response.json({ success: true });
    } catch (error) {
      safeError(response, error);
    }
  });

  const protectedApi = express.Router();
  protectedApi.use(requireUser);
  protectedApi.get("/stats", async (request: AuthedRequest, response) => {
    try {
      response.json(await db.getDashboardStats(request.user!.id));
    } catch (error) {
      safeError(response, error);
    }
  });
  protectedApi.get("/leads", async (request: AuthedRequest, response) => {
    try {
      const limit = Number(request.query.limit ?? 10);
      response.json(await db.getRecentLeads(request.user!.id, Number.isFinite(limit) ? limit : 10));
    } catch (error) {
      safeError(response, error);
    }
  });
  protectedApi.get("/analytics", async (request: AuthedRequest, response) => {
    try {
      const days = Number(request.query.days ?? 30);
      response.json(await db.getAnalytics(request.user!.id, Number.isFinite(days) ? days : 30));
    } catch (error) {
      safeError(response, error);
    }
  });
  protectedApi.get("/campaigns", async (request: AuthedRequest, response) => {
    try {
      response.json(await db.getActiveCampaigns(request.user!.id));
    } catch (error) {
      safeError(response, error);
    }
  });
  protectedApi.post("/leads", async (request: AuthedRequest, response) => {
    const parsed = z.object({ companyName: z.string().trim().min(1).max(255), industry: z.string().max(100).optional(), website: z.string().max(255).optional(), email: z.string().email().optional(), phone: z.string().max(20).optional(), location: z.string().max(255).optional(), score: z.number().int().min(0).max(100).optional() }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "A company name is required" });
      return;
    }
    try {
      await db.createLead(request.user!.id, parsed.data);
      response.status(201).json({ success: true });
    } catch (error) {
      safeError(response, error);
    }
  });

  app.use("/api/dashboard", protectedApi);

  if (process.env.NODE_ENV === "test") {
    app.get("*", (_request, response) => response.status(404).send("test app"));
  } else if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, "..", "vite.config.ts"),
      server: { middlewareMode: true, hmr: { server } },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (request, response, next) => {
      try {
        const url = request.originalUrl;
        const template = await vite.transformIndexHtml(url, "<!--app-html-->");
        response.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        next(error);
      }
    });
  } else {
    const staticPath = path.resolve(__dirname, "public");
    app.use(express.static(staticPath));
    app.get("*", (_request, response) => response.sendFile(path.join(staticPath, "index.html")));
  }

  return { app, server };
}

if (process.env.NODE_ENV !== "test") {
  createApp().then(({ server }) => {
  const port = Number(process.env.PORT ?? 3000);
  server.listen(port, "0.0.0.0", () => console.log(`LeadForge server running on port ${port}`));
  }).catch((error) => {
    console.error("Failed to start LeadForge:", error);
    process.exit(1);
  });
}
