import { pgTable, uuid, text, integer, numeric, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";

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
  // Atribución: de qué pauta vino este lead. La referencia es perezosa porque
  // campaigns se define más abajo en este mismo archivo.
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  gclid: text("gclid").notNull().default(""),
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

// Cuentas publicitarias (una empresa puede tener varias)
export const adAccounts = pgTable("ad_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // google | meta
  externalId: text("external_id").notNull().default(""), // ej. 2961244070
  name: text("name").notNull().default(""),
  currency: text("currency").notNull().default("ARS"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Pautas / campañas
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  adAccountId: uuid("ad_account_id").notNull().references(() => adAccounts.id, { onDelete: "cascade" }),
  externalId: text("external_id").notNull().default(""), // vacío mientras es borrador
  name: text("name").notNull(),
  objective: text("objective").notNull().default("leads"), // leads | trafico | ventas
  status: text("status").notNull().default("borrador"), // borrador | activa | pausada | finalizada
  dailyBudget: numeric("daily_budget").notNull().default("0"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Métricas por período. Cada fila cubre un rango: el sync escribe días sueltos,
// la carga manual cubre semanas. Conviven en la misma tabla.
export const campaignMetrics = pgTable("campaign_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  campaignId: uuid("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(), // inclusivo
  source: text("source").notNull().default("manual"), // manual | sync
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  cost: numeric("cost").notNull().default("0"),
  conversions: integer("conversions").notNull().default(0), // lo que reporta la plataforma
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Cobros — clientes de la agencia (Iniciativa Global), separado del embudo.
export const cobrosClientes = pgTable("cobros_clientes", {
  id: uuid("id").defaultRandom().primaryKey(),
  nombre: text("nombre").notNull(),
  tipo: text("tipo").notNull().default("unico"), // unico | mensual
  notas: text("notas").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Un cobro = un trabajo facturado a un cliente.
export const cobros = pgTable("cobros", {
  id: uuid("id").defaultRandom().primaryKey(),
  clienteId: uuid("cliente_id").notNull().references(() => cobrosClientes.id, { onDelete: "cascade" }),
  concepto: text("concepto").notNull().default(""),
  total: numeric("total").notNull().default("0"), // facturado
  fecha: date("fecha").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Costos de producción de un cobro (terceros: filmaker, viáticos). NO incluye
// el trabajo de los socios: su pago sale del reparto de la ganancia.
export const cobrosCostos = pgTable("cobros_costos", {
  id: uuid("id").defaultRandom().primaryKey(),
  cobroId: uuid("cobro_id").notNull().references(() => cobros.id, { onDelete: "cascade" }),
  concepto: text("concepto").notNull().default(""),
  monto: numeric("monto").notNull().default("0"),
});

// Pagos recibidos contra un cobro.
export const cobrosPagos = pgTable("cobros_pagos", {
  id: uuid("id").defaultRandom().primaryKey(),
  cobroId: uuid("cobro_id").notNull().references(() => cobros.id, { onDelete: "cascade" }),
  monto: numeric("monto").notNull().default("0"),
  fecha: date("fecha").notNull(),
  medio: text("medio").notNull().default(""), // PREX | efectivo | transferencia | ...
  cuenta: text("cuenta").notNull().default(""), // dónde cayó, ej. "Fabricio · PREX"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
