import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import * as db from "./db";

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
