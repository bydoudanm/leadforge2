import express, { type NextFunction, type Request, type Response } from "express";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import * as db from "./db";
import { endSession, getRequestUser, hashPassword, startSession, verifyPassword } from "./auth";
import { isIso2Code, listLocationCities, listLocationCountries, listLocationStates } from "./locationData";
import { buildOutreachAgentMessages, buildOutreachFallback } from "./outreachAgent";
// Built-in forge LLM proxy helper
import type { Inbox, SavedFilterView } from "../drizzle/schema";
import { normalizeRotationSettings, selectNextRotationInbox } from "../shared/inboxRotation";

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
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    plan: user.plan,
    emailAlertsEnabled: user.emailAlertsEnabled,
    campaignAlertsEnabled: user.campaignAlertsEnabled,
    weeklyReportsEnabled: user.weeklyReportsEnabled,
    productUpdatesEnabled: user.productUpdatesEnabled,
  };
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

  const locationApi = express.Router();
  locationApi.use(requireUser);
  locationApi.get("/countries", async (_request, response) => {
    try {
      response.json(await listLocationCountries());
    } catch (error) {
      safeError(response, error);
    }
  });
  locationApi.get("/countries/:countryCode/states", async (request, response) => {
    const countryCode = request.params.countryCode.toUpperCase();
    if (!isIso2Code(countryCode)) {
      response.status(400).json({ error: "Country code must be a valid ISO2 code" });
      return;
    }
    try {
      response.json(await listLocationStates(countryCode));
    } catch (error) {
      safeError(response, error);
    }
  });
  locationApi.get("/countries/:countryCode/states/:stateCode/cities", async (request, response) => {
    const countryCode = request.params.countryCode.toUpperCase();
    const stateCode = request.params.stateCode.toUpperCase();
    if (!isIso2Code(countryCode) || !stateCode) {
      response.status(400).json({ error: "Country and state codes are required" });
      return;
    }
    try {
      response.json(await listLocationCities(countryCode, stateCode));
    } catch (error) {
      safeError(response, error);
    }
  });
  app.use("/api/locations", locationApi);

  const aiApi = express.Router();
  aiApi.use(requireUser);
  aiApi.post("/generate-outreach", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      searchMode: z.enum(["individual", "company"]).default("company"),
      businessName: z.string().min(1).optional(),
      recipientName: z.string().min(1).optional(),
      recipientRole: z.string().min(1).optional(),
      parentCompanyName: z.string().min(1).optional(),
      branchName: z.string().min(1).optional(),
      branchCount: z.number().int().positive().default(1),
      opportunity: z.string().optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      language: z.string().default("English"),
      socialProfiles: z.array(z.string()).optional(),
      latestNews: z.string().optional(),
    }).refine((value) => value.searchMode === "company"
      ? Boolean(value.parentCompanyName && value.branchName)
      : Boolean(value.businessName), { message: "Mode-specific outreach fields are required" }).safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: "Invalid mode-specific outreach parameters" });
      return;
    }

    const { searchMode, businessName, recipientName, recipientRole, parentCompanyName, branchName, branchCount, opportunity, category, location, language, socialProfiles, latestNews } = parsed.data;
    const agentInput = { searchMode, businessName, recipientName, recipientRole, parentCompanyName, branchName, branchCount, opportunity, category, location, language, socialProfiles, latestNews } as const;
    const messages = buildOutreachAgentMessages(agentInput);

    try {
      const forgeUrl = process.env.BUILT_IN_FORGE_API_URL || "https://forge.api.manus.im";
      const forgeKey = process.env.BUILT_IN_FORGE_API_KEY || "";
      const llmResponse = await fetch(`${forgeUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${forgeKey}`,
        },
        body: JSON.stringify({
          model: "gemini-3-flash-preview",
          max_tokens: 800,
          messages: [
            { role: "system", content: messages.system },
            { role: "user", content: messages.user },
          ],
        }),
      });

      if (!llmResponse.ok) {
        throw new Error(`Forge LLM error: ${llmResponse.statusText}`);
      }

      const data = await llmResponse.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      const fallback = buildOutreachFallback(agentInput);
      response.json({ generatedEmail: typeof content === "string" ? content : fallback, searchMode });
    } catch (error) {
      console.error("[AI Outreach]", error);
      response.json({
        generatedEmail: buildOutreachFallback(agentInput),
        searchMode,
      });
    }
  });
  app.use("/api/ai", aiApi);

  const outreachApi = express.Router();
  outreachApi.use(requireUser);
  outreachApi.get("/", async (request: AuthedRequest, response) => {
    try {
      const database = await db.getDb();
      if (!database) {
        response.json([]);
        return;
      }
      const items = await database.select().from(db.outreachLists).where(db.eq(db.outreachLists.userId, request.user!.id)).orderBy(db.desc(db.outreachLists.createdAt));
      response.json(items);
    } catch (error) {
      safeError(response, error);
    }
  });
  outreachApi.post("/", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      leads: z.array(z.object({
        companyName: z.string().min(1),
        parentCompanyName: z.string().optional(),
        parentCompanyEmail: z.string().optional(),
        parentFounderEmail: z.string().optional(),
        branchCount: z.number().int().positive().optional(),
        branchLocations: z.array(z.string()).optional(),
        category: z.string().optional(),
        opportunity: z.string().optional(),
        score: z.number().default(0),
        email: z.string().optional(),
        phone: z.string().optional(),
        website: z.string().optional(),
        location: z.string().optional(),
        searchMode: z.string().default("individual"),
      })).min(1),
    }).safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ error: "Provide at least one lead to add to outreach" });
      return;
    }

    try {
      const values = parsed.data.leads.map((lead) => ({
        userId: request.user!.id,
        companyName: lead.companyName,
        parentCompanyName: lead.parentCompanyName ?? null,
        parentCompanyEmail: lead.parentCompanyEmail ?? null,
        parentFounderEmail: lead.parentFounderEmail ?? null,
        branchCount: lead.branchCount ?? 1,
        branchLocationsJson: lead.branchLocations ? JSON.stringify(lead.branchLocations) : null,
        category: lead.category ?? null,
        opportunity: lead.opportunity ?? null,
        score: lead.score ?? 0,
        email: lead.email ?? null,
        phone: lead.phone ?? null,
        website: lead.website ?? null,
        location: lead.location ?? null,
        searchMode: lead.searchMode ?? "individual",
      }));
      await db.insertIntoOutreachLists(values);
      response.json({ success: true, count: values.length });
    } catch (error) {
      safeError(response, error);
    }
  });
  app.use("/api/outreach", outreachApi);

  const inboxApi = express.Router();
  inboxApi.use(requireUser);
  inboxApi.get("/", async (request: AuthedRequest, response) => {
    try {
      const inboxes = await db.listInboxes(request.user!.id) as Inbox[];
      const stored = await db.getInboxRotationSettings(request.user!.id);
      const rotation = stored ? {
        enabled: stored.enabled,
        strategy: stored.strategy,
        delaySeconds: stored.delaySeconds,
        selectedInboxIds: JSON.parse(stored.selectedInboxIdsJson) as number[],
        nextInboxIndex: stored.nextInboxIndex,
      } : {
        enabled: false,
        strategy: "round_robin" as const,
        delaySeconds: 60,
        selectedInboxIds: [],
        nextInboxIndex: 0,
      };
      response.json({ inboxes, rotation, connectedCount: inboxes.filter((inbox) => inbox.connectionStatus === "connected").length });
    } catch (error) {
      safeError(response, error);
    }
  });
  inboxApi.post("/", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      email: z.string().trim().email().transform((value) => value.toLowerCase()),
      provider: z.enum(["gmail", "outlook", "custom"]).default("gmail"),
      dailyLimit: z.number().int().min(1).max(500).default(50),
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Provide a valid inbox email and a daily limit between 1 and 500" });
      return;
    }
    try {
      const inbox = await db.createInbox(request.user!.id, {
        email: parsed.data.email,
        provider: parsed.data.provider,
        dailyLimit: parsed.data.dailyLimit,
        isActive: true,
        connectionStatus: "pending",
        sentToday: 0,
      });
      response.status(201).json(inbox);
    } catch (error) {
      safeError(response, error);
    }
  });
  inboxApi.patch("/:id", async (request: AuthedRequest, response) => {
    const id = Number(request.params.id);
    const parsed = z.object({
      isActive: z.boolean().optional(),
      dailyLimit: z.number().int().min(1).max(500).optional(),
    }).refine((value) => value.isActive !== undefined || value.dailyLimit !== undefined).safeParse(request.body);
    if (!Number.isInteger(id) || id < 1 || !parsed.success) {
      response.status(400).json({ error: "Provide a valid inbox id and at least one editable setting" });
      return;
    }
    try {
      const inbox = await db.updateInbox(request.user!.id, id, parsed.data);
      if (!inbox) {
        response.status(404).json({ error: "Inbox not found" });
        return;
      }
      response.json(inbox);
    } catch (error) {
      safeError(response, error);
    }
  });
  inboxApi.delete("/:id", async (request: AuthedRequest, response) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id < 1) {
      response.status(400).json({ error: "Inbox id must be a positive integer" });
      return;
    }
    try {
      await db.deleteInbox(request.user!.id, id);
      const stored = await db.getInboxRotationSettings(request.user!.id);
      if (stored) {
        const inboxes = await db.listInboxes(request.user!.id) as Inbox[];
        const rotation = normalizeRotationSettings({
          enabled: stored.enabled,
          strategy: stored.strategy,
          delaySeconds: stored.delaySeconds,
          selectedInboxIds: JSON.parse(stored.selectedInboxIdsJson) as number[],
          nextInboxIndex: stored.nextInboxIndex,
        }, inboxes);
        await db.upsertInboxRotationSettings({
          userId: request.user!.id,
          enabled: rotation.enabled,
          strategy: rotation.strategy,
          delaySeconds: rotation.delaySeconds,
          selectedInboxIdsJson: JSON.stringify(rotation.selectedInboxIds),
          nextInboxIndex: rotation.nextInboxIndex,
        });
      }
      response.status(204).end();
    } catch (error) {
      safeError(response, error);
    }
  });
  inboxApi.patch("/rotation/settings", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      enabled: z.boolean(),
      delaySeconds: z.number().int().min(30).max(3600),
      selectedInboxIds: z.array(z.number().int().positive()).max(50),
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Provide rotation settings with a delay between 30 and 3600 seconds" });
      return;
    }
    try {
      const inboxes = await db.listInboxes(request.user!.id) as Inbox[];
      const ownedIds = new Set(inboxes.map((inbox) => inbox.id));
      if (parsed.data.selectedInboxIds.some((id) => !ownedIds.has(id))) {
        response.status(400).json({ error: "Rotation can only use inboxes belonging to the current account" });
        return;
      }
      const stored = await db.getInboxRotationSettings(request.user!.id);
      const normalized = normalizeRotationSettings({
        enabled: parsed.data.enabled,
        strategy: "round_robin",
        delaySeconds: parsed.data.delaySeconds,
        selectedInboxIds: parsed.data.selectedInboxIds,
        nextInboxIndex: stored?.nextInboxIndex ?? 0,
      }, inboxes);
      const eligibleCount = inboxes.filter((inbox) => normalized.selectedInboxIds.includes(inbox.id) && inbox.isActive && inbox.connectionStatus === "connected" && (inbox.sentToday ?? 0) < (inbox.dailyLimit ?? 0)).length;
      if (normalized.enabled && eligibleCount === 0) {
        response.status(400).json({ error: "Connect at least one active Gmail inbox with remaining daily capacity before enabling rotation" });
        return;
      }
      const saved = await db.upsertInboxRotationSettings({
        userId: request.user!.id,
        enabled: normalized.enabled,
        strategy: normalized.strategy,
        delaySeconds: normalized.delaySeconds,
        selectedInboxIdsJson: JSON.stringify(normalized.selectedInboxIds),
        nextInboxIndex: normalized.nextInboxIndex,
      });
      response.json({
        enabled: saved?.enabled ?? normalized.enabled,
        strategy: saved?.strategy ?? normalized.strategy,
        delaySeconds: saved?.delaySeconds ?? normalized.delaySeconds,
        selectedInboxIds: normalized.selectedInboxIds,
        nextInboxIndex: saved?.nextInboxIndex ?? normalized.nextInboxIndex,
        eligibleCount,
      });
    } catch (error) {
      safeError(response, error);
    }
  });
  inboxApi.post("/rotation/next", async (request: AuthedRequest, response) => {
    try {
      const stored = await db.getInboxRotationSettings(request.user!.id);
      if (!stored?.enabled) {
        response.status(409).json({ error: "Inbox rotation is not enabled" });
        return;
      }
      const inboxes = await db.listInboxes(request.user!.id) as Inbox[];
      const selection = selectNextRotationInbox(inboxes, {
        enabled: stored.enabled,
        strategy: stored.strategy,
        delaySeconds: stored.delaySeconds,
        selectedInboxIds: JSON.parse(stored.selectedInboxIdsJson) as number[],
        nextInboxIndex: stored.nextInboxIndex,
      });
      if (!selection.inbox) {
        response.status(409).json({ error: "No selected inbox is connected and under its daily capacity" });
        return;
      }
      await db.upsertInboxRotationSettings({
        userId: request.user!.id,
        enabled: stored.enabled,
        strategy: stored.strategy,
        delaySeconds: stored.delaySeconds,
        selectedInboxIdsJson: stored.selectedInboxIdsJson,
        nextInboxIndex: selection.nextInboxIndex,
      });
      response.json({ inbox: selection.inbox, nextInboxIndex: selection.nextInboxIndex });
    } catch (error) {
      safeError(response, error);
    }
  });
  app.use("/api/inboxes", inboxApi);

  const savedFiltersApi = express.Router();
  savedFiltersApi.use(requireUser);
  savedFiltersApi.get("/", async (request: AuthedRequest, response) => {
    const searchMode = request.query.searchMode === "company" ? "company" : "individual";
    try {
      const views = await db.listSavedFilterViews(request.user!.id, searchMode);
      response.json((views as SavedFilterView[]).map((view) => ({
        id: view.id,
        name: view.name,
        searchMode: view.searchMode,
        filters: JSON.parse(view.filtersJson),
        createdAt: view.createdAt,
        updatedAt: view.updatedAt,
      })));
    } catch (error) {
      safeError(response, error);
    }
  });
  savedFiltersApi.post("/", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      name: z.string().trim().min(1).max(120),
      searchMode: z.enum(["individual", "company"]),
      filters: z.record(z.string(), z.unknown()),
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Provide a filter name and valid filter settings" });
      return;
    }
    try {
      const view = await db.createSavedFilterView({
        userId: request.user!.id,
        name: parsed.data.name,
        searchMode: parsed.data.searchMode,
        filtersJson: JSON.stringify(parsed.data.filters),
      });
      response.status(201).json({
        id: view.id,
        name: view.name,
        searchMode: view.searchMode,
        filters: parsed.data.filters,
        createdAt: view.createdAt,
        updatedAt: view.updatedAt,
      });
    } catch (error) {
      safeError(response, error);
    }
  });
  savedFiltersApi.delete("/:id", async (request: AuthedRequest, response) => {
    const id = Number(request.params.id);
    if (!Number.isInteger(id) || id < 1) {
      response.status(400).json({ error: "Saved filter id must be a positive integer" });
      return;
    }
    try {
      await db.deleteSavedFilterView(request.user!.id, id);
      response.status(204).end();
    } catch (error) {
      safeError(response, error);
    }
  });
  app.use("/api/saved-filters", savedFiltersApi);

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

  const profileApi = express.Router();
  profileApi.use(requireUser);
  profileApi.get("/", async (request: AuthedRequest, response) => {
    try {
      const user = await db.getUserById(request.user!.id);
      if (!user) {
        response.status(404).json({ error: "User account not found" });
        return;
      }
      response.json(publicUser(user));
    } catch (error) {
      safeError(response, error);
    }
  });
  profileApi.patch("/", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      name: z.string().trim().min(1, "Name is required").max(120),
      email: z.string().trim().email("Enter a valid email").transform((value) => value.toLowerCase()),
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Enter valid account details" });
      return;
    }
    try {
      const existing = await db.getUserByEmail(parsed.data.email);
      if (existing && existing.id !== request.user!.id) {
        response.status(409).json({ error: "That email is already in use" });
        return;
      }
      const user = await db.updateUserProfile(request.user!.id, parsed.data);
      if (!user) {
        response.status(404).json({ error: "User account not found" });
        return;
      }
      response.json(publicUser(user));
    } catch (error) {
      safeError(response, error);
    }
  });
  profileApi.patch("/notifications", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      emailAlertsEnabled: z.boolean(),
      campaignAlertsEnabled: z.boolean(),
      weeklyReportsEnabled: z.boolean(),
      productUpdatesEnabled: z.boolean(),
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: "Notification preferences must be boolean values" });
      return;
    }
    try {
      const user = await db.updateNotificationPreferences(request.user!.id, parsed.data);
      if (!user) {
        response.status(404).json({ error: "User account not found" });
        return;
      }
      response.json(publicUser(user));
    } catch (error) {
      safeError(response, error);
    }
  });
  profileApi.post("/password", async (request: AuthedRequest, response) => {
    const parsed = z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
    }).safeParse(request.body);
    if (!parsed.success) {
      response.status(400).json({ error: parsed.error.issues[0]?.message ?? "Enter valid password details" });
      return;
    }
    try {
      const user = await db.getUserById(request.user!.id);
      if (!user || !verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
        response.status(401).json({ error: "Current password is incorrect" });
        return;
      }
      if (parsed.data.currentPassword === parsed.data.newPassword) {
        response.status(400).json({ error: "New password must be different from the current password" });
        return;
      }
      await db.updateUserPassword(user.id, hashPassword(parsed.data.newPassword));
      response.json({ success: true });
    } catch (error) {
      safeError(response, error);
    }
  });
  app.use("/api/profile", profileApi);

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
