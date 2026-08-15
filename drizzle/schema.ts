import {
  boolean,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("password"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free_trial", "start", "growth", "professional", "agency", "starter", "pro", "scale"]).default("free_trial").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  emailAlertsEnabled: boolean("emailAlertsEnabled").default(true).notNull(),
  campaignAlertsEnabled: boolean("campaignAlertsEnabled").default(true).notNull(),
  weeklyReportsEnabled: boolean("weeklyReportsEnabled").default(true).notNull(),
  productUpdatesEnabled: boolean("productUpdatesEnabled").default(false).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 100 }),
  website: varchar("website", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  location: varchar("location", { length: 255 }),
  status: mysqlEnum("status", ["new", "contacted", "interested", "qualified", "converted", "lost"]).default("new").notNull(),
  score: int("score").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  employees: int("employees"),
  foundDate: timestamp("foundDate").defaultNow().notNull(),
  lastContactedAt: timestamp("lastContactedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed"]).default("draft").notNull(),
  totalLeads: int("totalLeads").default(0),
  sentEmails: int("sentEmails").default(0),
  openedEmails: int("openedEmails").default(0),
  clickedEmails: int("clickedEmails").default(0),
  repliedEmails: int("repliedEmails").default(0),
  conversions: int("conversions").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

export const campaignLeads = mysqlTable("campaignLeads", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  leadId: int("leadId").notNull(),
  status: mysqlEnum("status", ["pending", "sent", "opened", "clicked", "replied", "converted"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  repliedAt: timestamp("repliedAt"),
  convertedAt: timestamp("convertedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignLead = typeof campaignLeads.$inferSelect;
export type InsertCampaignLead = typeof campaignLeads.$inferInsert;

export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),
  leadsDiscovered: int("leadsDiscovered").default(0),
  emailsSent: int("emailsSent").default(0),
  emailsOpened: int("emailsOpened").default(0),
  emailsClicked: int("emailsClicked").default(0),
  emailsReplied: int("emailsReplied").default(0),
  dealsCreated: int("dealsCreated").default(0),
  dealsWon: int("dealsWon").default(0),
  revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

export const outreachLists = mysqlTable("outreachLists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  parentCompanyName: varchar("parentCompanyName", { length: 255 }),
  parentCompanyEmail: varchar("parentCompanyEmail", { length: 320 }),
  parentFounderEmail: varchar("parentFounderEmail", { length: 320 }),
  branchCount: int("branchCount").default(1),
  branchLocationsJson: text("branchLocationsJson"),
  category: varchar("category", { length: 100 }),
  opportunity: varchar("opportunity", { length: 100 }),
  score: int("score").default(0),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  website: varchar("website", { length: 255 }),
  location: varchar("location", { length: 255 }),
  searchMode: varchar("searchMode", { length: 50 }).default("individual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OutreachListItem = typeof outreachLists.$inferSelect;
export type InsertOutreachListItem = typeof outreachLists.$inferInsert;

export const savedFilterViews = mysqlTable("savedFilterViews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  searchMode: mysqlEnum("searchMode", ["individual", "company"]).notNull(),
  filtersJson: text("filtersJson").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedFilterView = typeof savedFilterViews.$inferSelect;
export type InsertSavedFilterView = typeof savedFilterViews.$inferInsert;

export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leadId: int("leadId").notNull(),
  campaignId: int("campaignId"),
  title: varchar("title", { length: 255 }).notNull(),
  stage: mysqlEnum("stage", ["prospect", "qualified", "proposal", "negotiation", "won", "lost"]).default("prospect").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  probability: int("probability").default(0),
  expectedCloseDate: timestamp("expectedCloseDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;

export const inboxes = mysqlTable("inboxes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  provider: mysqlEnum("provider", ["gmail", "outlook", "custom"]).default("gmail").notNull(),
  isActive: boolean("isActive").default(true),
  connectionStatus: mysqlEnum("connectionStatus", ["pending", "connected", "needs_reauth"]).default("pending").notNull(),
  lastConnectedAt: timestamp("lastConnectedAt"),
  dailyLimit: int("dailyLimit").default(50),
  sentToday: int("sentToday").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inbox = typeof inboxes.$inferSelect;
export type InsertInbox = typeof inboxes.$inferInsert;

export const inboxRotationSettings = mysqlTable("inboxRotationSettings", {
  userId: int("userId").primaryKey(),
  enabled: boolean("enabled").default(false).notNull(),
  strategy: mysqlEnum("strategy", ["round_robin"]).default("round_robin").notNull(),
  delaySeconds: int("delaySeconds").default(60).notNull(),
  selectedInboxIdsJson: text("selectedInboxIdsJson").notNull(),
  nextInboxIndex: int("nextInboxIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InboxRotationSettings = typeof inboxRotationSettings.$inferSelect;
export type InsertInboxRotationSettings = typeof inboxRotationSettings.$inferInsert;

export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;
