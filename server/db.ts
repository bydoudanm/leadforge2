import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

let pool: ReturnType<typeof mysql.createPool> | null = null;
let db: any = null;

export async function getDb() {
  if (db) return db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[Database] DATABASE_URL is not configured");
    return null;
  }

  try {
    pool = mysql.createPool(connectionString);
    db = drizzle(pool, { schema, mode: "default" });
    return db;
  } catch (error) {
    console.error("[Database] Failed to connect:", error);
    pool = null;
    db = null;
    return null;
  }
}

export async function getUserByEmail(email: string) {
  const database = await getDb();
  if (!database) return undefined;
  const rows = await database.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return rows[0];
}

export async function getUserById(id: number) {
  const database = await getDb();
  if (!database) return undefined;
  const rows = await database.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return rows[0];
}

export async function updateUserProfile(userId: number, input: { name: string; email: string }) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  await database
    .update(schema.users)
    .set({ name: input.name, email: input.email })
    .where(eq(schema.users.id, userId));
  return getUserById(userId);
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  await database
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, userId));
}

export async function createUser(input: schema.InsertUser) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  const result = await database.insert(schema.users).values(input);
  return getUserById(Number(result[0].insertId));
}

export async function createSession(input: schema.InsertSession) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  await database.insert(schema.sessions).values(input);
}

export async function getSessionByHash(tokenHash: string) {
  const database = await getDb();
  if (!database) return undefined;
  const rows = await database
    .select({ session: schema.sessions, user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.tokenHash, tokenHash), sql`${schema.sessions.expiresAt} > NOW()`))
    .limit(1);
  return rows[0];
}

export async function deleteSession(tokenHash: string) {
  const database = await getDb();
  if (!database) return;
  await database.delete(schema.sessions).where(eq(schema.sessions.tokenHash, tokenHash));
}

export async function getDashboardStats(userId: number) {
  const database = await getDb();
  if (!database) return null;

  const [leadStats, campaignStats, opportunityStats] = await Promise.all([
    database
      .select({
        total: sql<number>`COUNT(*)`,
        newCount: sql<number>`SUM(CASE WHEN ${schema.leads.status} = 'new' THEN 1 ELSE 0 END)`,
        contacted: sql<number>`SUM(CASE WHEN ${schema.leads.status} = 'contacted' THEN 1 ELSE 0 END)`,
        converted: sql<number>`SUM(CASE WHEN ${schema.leads.status} = 'converted' THEN 1 ELSE 0 END)`,
      })
      .from(schema.leads)
      .where(eq(schema.leads.userId, userId)),
    database
      .select({
        total: sql<number>`COUNT(*)`,
        active: sql<number>`SUM(CASE WHEN ${schema.campaigns.status} = 'active' THEN 1 ELSE 0 END)`,
      })
      .from(schema.campaigns)
      .where(eq(schema.campaigns.userId, userId)),
    database
      .select({
        total: sql<number>`COUNT(*)`,
        wonValue: sql<number>`COALESCE(SUM(CASE WHEN ${schema.opportunities.stage} = 'won' THEN ${schema.opportunities.value} ELSE 0 END), 0)`,
      })
      .from(schema.opportunities)
      .where(eq(schema.opportunities.userId, userId)),
  ]);

  return {
    leads: leadStats[0] ?? { total: 0, newCount: 0, contacted: 0, converted: 0 },
    campaigns: campaignStats[0] ?? { total: 0, active: 0 },
    opportunities: opportunityStats[0] ?? { total: 0, wonValue: 0 },
  };
}

export async function getRecentLeads(userId: number, limit = 10) {
  const database = await getDb();
  if (!database) return [];
  return database
    .select()
    .from(schema.leads)
    .where(eq(schema.leads.userId, userId))
    .orderBy(desc(schema.leads.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));
}

export async function getActiveCampaigns(userId: number) {
  const database = await getDb();
  if (!database) return [];
  return database
    .select()
    .from(schema.campaigns)
    .where(and(eq(schema.campaigns.userId, userId), eq(schema.campaigns.status, "active")))
    .orderBy(desc(schema.campaigns.updatedAt));
}

export async function getAnalytics(userId: number, days = 30) {
  const database = await getDb();
  if (!database) return [];
  const since = new Date();
  since.setDate(since.getDate() - Math.min(Math.max(days, 1), 365));
  return database
    .select()
    .from(schema.analytics)
    .where(and(eq(schema.analytics.userId, userId), sql`${schema.analytics.date} >= ${since}`))
    .orderBy(desc(schema.analytics.date));
}

export async function getOpportunities(userId: number, limit = 20) {
  const database = await getDb();
  if (!database) return [];
  return database
    .select()
    .from(schema.opportunities)
    .where(eq(schema.opportunities.userId, userId))
    .orderBy(desc(schema.opportunities.updatedAt))
    .limit(Math.min(Math.max(limit, 1), 100));
}

export async function createLead(userId: number, input: Omit<schema.InsertLead, "userId">) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  return database.insert(schema.leads).values({ ...input, userId });
}

export async function updateLead(userId: number, leadId: number, input: Partial<schema.InsertLead>) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  return database
    .update(schema.leads)
    .set(input)
    .where(and(eq(schema.leads.id, leadId), eq(schema.leads.userId, userId)));
}

export async function createCampaign(userId: number, input: Omit<schema.InsertCampaign, "userId">) {
  const database = await getDb();
  if (!database) throw new Error("Database is not configured");
  return database.insert(schema.campaigns).values({ ...input, userId });
}
