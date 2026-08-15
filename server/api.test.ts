import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as db from "./db";
import { hashPassword } from "./auth";

let baseUrl = "";
let server: import("node:http").Server;

describe("LeadForge JSON API", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const module = await import("./index");
    const created = await module.createApp();
    server = created.server;
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server did not bind");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it("reports a healthy API", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("protects dashboard stats for unauthenticated visitors", async () => {
    const response = await fetch(`${baseUrl}/api/dashboard/stats`);
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Authentication required" });
  });

  it("serves authenticated dashboard data from persistence", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    vi.spyOn(db, "getDashboardStats").mockResolvedValue({ leads: { total: 3, newCount: 2, contacted: 1, converted: 0 }, campaigns: { total: 1, active: 1 }, opportunities: { total: 0, wonValue: 0 } });
    vi.spyOn(db, "getRecentLeads").mockResolvedValue([{ id: 7, companyName: "Acme", status: "new", score: 87 }] as never);
    vi.spyOn(db, "getAnalytics").mockResolvedValue([{ date: new Date("2026-08-01"), revenue: "1200.00", leadsDiscovered: 3, emailsSent: 10 }] as never);

    const headers = { Cookie: "leadforge_session=authenticated-test" };
    const [statsResponse, leadsResponse, analyticsResponse] = await Promise.all([
      fetch(`${baseUrl}/api/dashboard/stats`, { headers }),
      fetch(`${baseUrl}/api/dashboard/leads?limit=10`, { headers }),
      fetch(`${baseUrl}/api/dashboard/analytics?days=30`, { headers }),
    ]);

    expect(statsResponse.status).toBe(200);
    expect(leadsResponse.status).toBe(200);
    expect(analyticsResponse.status).toBe(200);
    await expect(statsResponse.json()).resolves.toMatchObject({ leads: { total: 3 } });
    await expect(leadsResponse.json()).resolves.toEqual([{ id: 7, companyName: "Acme", status: "new", score: 87 }]);
    await expect(analyticsResponse.json()).resolves.toHaveLength(1);
  });

  it("updates authenticated account details", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    vi.spyOn(db, "getUserByEmail").mockResolvedValue(undefined);
    vi.spyOn(db, "updateUserProfile").mockResolvedValue({ id: 42, name: "Updated User", email: "updated@example.com", plan: "free_trial" } as never);

    const response = await fetch(`${baseUrl}/api/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ name: "Updated User", email: "UPDATED@example.com" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ name: "Updated User", email: "updated@example.com" });
    expect(db.updateUserProfile).toHaveBeenCalledWith(42, { name: "Updated User", email: "updated@example.com" });
  });

  it("updates authenticated notification preferences", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    vi.spyOn(db, "updateNotificationPreferences").mockResolvedValue({
      id: 42,
      name: "Test User",
      email: "test@example.com",
      plan: "free_trial",
      emailAlertsEnabled: true,
      campaignAlertsEnabled: false,
      weeklyReportsEnabled: true,
      productUpdatesEnabled: false,
    } as never);

    const response = await fetch(`${baseUrl}/api/profile/notifications`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ emailAlertsEnabled: true, campaignAlertsEnabled: false, weeklyReportsEnabled: true, productUpdatesEnabled: false }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ campaignAlertsEnabled: false, weeklyReportsEnabled: true });
    expect(db.updateNotificationPreferences).toHaveBeenCalledWith(42, { emailAlertsEnabled: true, campaignAlertsEnabled: false, weeklyReportsEnabled: true, productUpdatesEnabled: false });
  });

  it("rejects a password change when the current password is incorrect", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    vi.spyOn(db, "getUserById").mockResolvedValue({ id: 42, passwordHash: hashPassword("correct-current-password") } as never);
    const updatePassword = vi.spyOn(db, "updateUserPassword");

    const response = await fetch(`${baseUrl}/api/profile/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ currentPassword: "wrong-password", newPassword: "new-password-123" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Current password is incorrect" });
    expect(updatePassword).not.toHaveBeenCalled();
  });

  it("changes the password after validating the current password", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    vi.spyOn(db, "getUserById").mockResolvedValue({ id: 42, passwordHash: hashPassword("correct-current-password") } as never);
    const updatePassword = vi.spyOn(db, "updateUserPassword").mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/api/profile/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ currentPassword: "correct-current-password", newPassword: "new-password-123" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(updatePassword).toHaveBeenCalledOnce();
    expect(updatePassword.mock.calls[0]?.[0]).toBe(42);
    expect(updatePassword.mock.calls[0]?.[1]).toMatch(/^scrypt\$/);
  });

  it("creates a saved filter view for the authenticated search mode", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    vi.spyOn(db, "createSavedFilterView").mockResolvedValue({ id: 9, userId: 42, name: "Weak Website + Email", searchMode: "individual", filtersJson: JSON.stringify({ selectedTab: "Weak Website", selectedDataFilters: ["Email"] }), createdAt: new Date("2026-08-12T18:00:00Z"), updatedAt: new Date("2026-08-12T18:00:00Z") } as never);

    const response = await fetch(`${baseUrl}/api/saved-filters`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ name: "Weak Website + Email", searchMode: "individual", filters: { selectedTab: "Weak Website", selectedDataFilters: ["Email"] } }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ id: 9, name: "Weak Website + Email", searchMode: "individual", filters: { selectedTab: "Weak Website", selectedDataFilters: ["Email"] } });
    expect(db.createSavedFilterView).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, name: "Weak Website + Email", searchMode: "individual" }));
  });

  it("lists saved filters only for the authenticated search mode", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    vi.spyOn(db, "listSavedFilterViews").mockResolvedValue([{ id: 9, userId: 42, name: "Company Emails", searchMode: "company", filtersJson: JSON.stringify({ selectedTab: "All", selectedDataFilters: ["Email"] }), createdAt: new Date("2026-08-12T18:00:00Z"), updatedAt: new Date("2026-08-12T18:00:00Z") }] as never);

    const response = await fetch(`${baseUrl}/api/saved-filters?searchMode=company`, { headers: { Cookie: "leadforge_session=authenticated-test" } });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([expect.objectContaining({ id: 9, searchMode: "company", filters: { selectedTab: "All", selectedDataFilters: ["Email"] } })]);
    expect(db.listSavedFilterViews).toHaveBeenCalledWith(42, "company");
  });

  it("deletes a saved filter view only for the authenticated user", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    const deleteSavedFilterView = vi.spyOn(db, "deleteSavedFilterView").mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/api/saved-filters/9`, { method: "DELETE", headers: { Cookie: "leadforge_session=authenticated-test" } });

    expect(response.status).toBe(204);
    expect(deleteSavedFilterView).toHaveBeenCalledWith(42, 9);
  });

  it("validates login input before consulting persistence", async () => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "" }),
    });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Enter a valid email and password" });
  });
});


describe("Company Lead Search outreach persistence", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const module = await import("./index");
    const created = await module.createApp();
    server = created.server;
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Parent-company API test server did not bind");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it("stores parent-company contact and branch rollup fields", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "free_trial" } } as never);
    const insertIntoOutreachLists = vi.spyOn(db, "insertIntoOutreachLists").mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/api/outreach`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({
        leads: [{
          companyName: "Pacific Table Hospitality Group",
          parentCompanyName: "Pacific Table Hospitality Group",
          parentCompanyEmail: "partnerships@pacifictablehospitality.com",
          parentFounderEmail: "elena.rossi@pacifictablehospitality.com",
          branchCount: 4,
          branchLocations: ["Los Angeles, CA", "Santa Monica, CA", "Pasadena, CA", "San Diego, CA"],
          category: "Restaurant",
          opportunity: "Weak Website",
          score: 92,
          email: "partnerships@pacifictablehospitality.com",
          searchMode: "company",
        }],
      }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true, count: 1 });
    expect(insertIntoOutreachLists).toHaveBeenCalledWith([expect.objectContaining({
      userId: 42,
      companyName: "Pacific Table Hospitality Group",
      parentCompanyEmail: "partnerships@pacifictablehospitality.com",
      branchCount: 4,
      branchLocationsJson: JSON.stringify(["Los Angeles, CA", "Santa Monica, CA", "Pasadena, CA", "San Diego, CA"]),
      searchMode: "company",
    })]);
  });
});


describe("Inbox rotation API", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const module = await import("./index");
    const created = await module.createApp();
    server = created.server;
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Inbox API test server did not bind");
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  it("lists only the authenticated user's inboxes and rotation state", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "growth" } } as never);
    vi.spyOn(db, "listInboxes").mockResolvedValue([{ id: 3, userId: 42, email: "sender@example.com", provider: "gmail", isActive: true, connectionStatus: "pending", lastConnectedAt: null, dailyLimit: 50, sentToday: 0, createdAt: new Date(), updatedAt: new Date() }] as never);
    vi.spyOn(db, "getInboxRotationSettings").mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/api/inboxes`, { headers: { Cookie: "leadforge_session=authenticated-test" } });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ connectedCount: 0, rotation: { enabled: false, selectedInboxIds: [] }, inboxes: [expect.objectContaining({ email: "sender@example.com", connectionStatus: "pending" })] });
  });

  it("creates a Gmail inbox without accepting credentials", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "growth" } } as never);
    const createInbox = vi.spyOn(db, "createInbox").mockResolvedValue({ id: 4, userId: 42, email: "second@example.com", provider: "gmail", isActive: true, connectionStatus: "pending", lastConnectedAt: null, dailyLimit: 75, sentToday: 0, createdAt: new Date(), updatedAt: new Date() } as never);

    const response = await fetch(`${baseUrl}/api/inboxes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ email: "SECOND@EXAMPLE.COM", dailyLimit: 75 }),
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ email: "second@example.com", connectionStatus: "pending" });
    expect(createInbox).toHaveBeenCalledWith(42, expect.objectContaining({ email: "second@example.com", provider: "gmail", dailyLimit: 75, connectionStatus: "pending" }));
  });

  it("rejects enabling rotation when no selected inbox is connected", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "growth" } } as never);
    vi.spyOn(db, "listInboxes").mockResolvedValue([{ id: 3, userId: 42, email: "sender@example.com", provider: "gmail", isActive: true, connectionStatus: "pending", lastConnectedAt: null, dailyLimit: 50, sentToday: 0, createdAt: new Date(), updatedAt: new Date() }] as never);
    vi.spyOn(db, "getInboxRotationSettings").mockResolvedValue(undefined);
    const upsert = vi.spyOn(db, "upsertInboxRotationSettings");

    const response = await fetch(`${baseUrl}/api/inboxes/rotation/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ enabled: true, delaySeconds: 60, selectedInboxIds: [3] }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Connect at least one active Gmail inbox with remaining daily capacity before enabling rotation" });
    expect(upsert).not.toHaveBeenCalled();
  });

  it("persists a round-robin rotation after a connected inbox is available", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "growth" } } as never);
    vi.spyOn(db, "listInboxes").mockResolvedValue([
      { id: 3, userId: 42, email: "sender@example.com", provider: "gmail", isActive: true, connectionStatus: "connected", lastConnectedAt: new Date(), dailyLimit: 50, sentToday: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, userId: 42, email: "second@example.com", provider: "gmail", isActive: true, connectionStatus: "connected", lastConnectedAt: new Date(), dailyLimit: 50, sentToday: 4, createdAt: new Date(), updatedAt: new Date() },
    ] as never);
    vi.spyOn(db, "getInboxRotationSettings").mockResolvedValue(undefined);
    const upsert = vi.spyOn(db, "upsertInboxRotationSettings").mockResolvedValue({ userId: 42, enabled: true, strategy: "round_robin", delaySeconds: 90, selectedInboxIdsJson: "[3,4]", nextInboxIndex: 0, createdAt: new Date(), updatedAt: new Date() } as never);

    const response = await fetch(`${baseUrl}/api/inboxes/rotation/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ enabled: true, delaySeconds: 90, selectedInboxIds: [3, 4] }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ enabled: true, strategy: "round_robin", delaySeconds: 90, selectedInboxIds: [3, 4], eligibleCount: 2 });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, enabled: true, strategy: "round_robin", delaySeconds: 90, selectedInboxIdsJson: "[3,4]" }));
  });

  it("returns the next connected inbox and advances the persisted cursor", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "growth" } } as never);
    vi.spyOn(db, "getInboxRotationSettings").mockResolvedValue({ userId: 42, enabled: true, strategy: "round_robin", delaySeconds: 90, selectedInboxIdsJson: "[3,4]", nextInboxIndex: 1, createdAt: new Date(), updatedAt: new Date() } as never);
    vi.spyOn(db, "listInboxes").mockResolvedValue([
      { id: 3, userId: 42, email: "sender@example.com", provider: "gmail", isActive: true, connectionStatus: "connected", lastConnectedAt: new Date(), dailyLimit: 50, sentToday: 2, createdAt: new Date(), updatedAt: new Date() },
      { id: 4, userId: 42, email: "second@example.com", provider: "gmail", isActive: true, connectionStatus: "connected", lastConnectedAt: new Date(), dailyLimit: 50, sentToday: 4, createdAt: new Date(), updatedAt: new Date() },
    ] as never);
    const upsert = vi.spyOn(db, "upsertInboxRotationSettings").mockResolvedValue({ userId: 42, enabled: true, strategy: "round_robin", delaySeconds: 90, selectedInboxIdsJson: "[3,4]", nextInboxIndex: 0, createdAt: new Date(), updatedAt: new Date() } as never);

    const response = await fetch(`${baseUrl}/api/inboxes/rotation/next`, { method: "POST", headers: { Cookie: "leadforge_session=authenticated-test" } });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ inbox: { id: 4, email: "second@example.com" }, nextInboxIndex: 0 });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ userId: 42, nextInboxIndex: 0 }));
  });

  it("pauses an inbox through an authenticated, user-scoped update", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "growth" } } as never);
    const updateInbox = vi.spyOn(db, "updateInbox").mockResolvedValue({ id: 3, userId: 42, email: "sender@example.com", provider: "gmail", isActive: false, connectionStatus: "pending", lastConnectedAt: null, dailyLimit: 50, sentToday: 0, createdAt: new Date(), updatedAt: new Date() } as never);

    const response = await fetch(`${baseUrl}/api/inboxes/3`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: "leadforge_session=authenticated-test" },
      body: JSON.stringify({ isActive: false }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ id: 3, isActive: false });
    expect(updateInbox).toHaveBeenCalledWith(42, 3, { isActive: false });
  });

  it("deletes an inbox through an authenticated, user-scoped action", async () => {
    vi.spyOn(db, "getSessionByHash").mockResolvedValue({ user: { id: 42, name: "Test User", email: "test@example.com", plan: "growth" } } as never);
    const deleteInbox = vi.spyOn(db, "deleteInbox").mockResolvedValue(undefined);
    vi.spyOn(db, "getInboxRotationSettings").mockResolvedValue(undefined);

    const response = await fetch(`${baseUrl}/api/inboxes/3`, { method: "DELETE", headers: { Cookie: "leadforge_session=authenticated-test" } });

    expect(response.status).toBe(204);
    expect(deleteInbox).toHaveBeenCalledWith(42, 3);
  });
});
