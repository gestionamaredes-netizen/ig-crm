import { pgTable, uuid, text, integer, numeric, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

// Empresas (workspaces)
export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default(""),
  init: text("init").notNull().default(""),
  logo: text("logo").notNull().default(""),
  color: text("color").notNull().default("#7d7bf0"),
  grad: text("grad").notNull().default(""),
  status: text("status").notNull().default("activo"), // activo | desarrollo | pausado
  modules: jsonb("modules").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Etapas del embudo, propias por empresa
export const stages = pgTable("stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#7d7bf0"),
  order: integer("order").notNull().default(0),
});

// Leads / clientes
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  stageId: uuid("stage_id").references(() => stages.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  value: numeric("value").notNull().default("0"),
  channel: text("channel").notNull().default("otro"), // ig | wa | web | otro
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Contactos
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  notes: text("notes").notNull().default(""),
});

// Tareas
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  dueAt: timestamp("due_at", { withTimezone: true }),
  done: boolean("done").notNull().default(false),
  priority: text("priority").notNull().default("Media"), // Alta | Media | Baja
});

// Eventos de calendario
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  start: timestamp("start", { withTimezone: true }).notNull(),
  end: timestamp("end", { withTimezone: true }),
  type: text("type").notNull().default("general"),
});

// Actividad (log)
export const activity = pgTable("activity", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  type: text("type").notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Cuentas vinculadas (Fase 1: enlaces + estado)
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // ig | wa | web | meta | tiktok | email
  url: text("url").notNull().default(""),
  linked: boolean("linked").notNull().default(false),
});
