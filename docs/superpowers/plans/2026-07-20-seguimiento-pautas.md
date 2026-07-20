# Seguimiento de pautas — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar a IG CRM un módulo para seguir las pautas de Google Ads y Meta Ads, cruzando la
inversión con los leads y las ventas que cada campaña genera.

**Architecture:** Tres tablas nuevas en Supabase (`ad_accounts`, `campaigns`, `campaign_metrics`)
más dos campos de atribución en `leads`. Toda la lógica de cálculo vive en funciones puras bajo
`lib/pautas/` para que Vitest la cubra; las páginas son Server Components que leen vía el cliente de
Supabase, siguiendo el patrón de `lib/data.ts`. La carga de métricas entra por un formulario manual
o por un script externo (`npm run sync:pautas`) que Claude alimenta desde el MCP de Supermetrics.

**Tech Stack:** Next.js 16 (App Router, Server Components), React 19, Drizzle ORM, Supabase
(postgres-js), Vitest, TypeScript, estilos inline con variables CSS.

## Global Constraints

- Spec de referencia: `docs/superpowers/specs/2026-07-19-seguimiento-pautas-design.md`.
- Nombres de dominio en español (`campanas`, `metricas`, `costoPorLead`), igual que `lib/seo-local/`.
  Los nombres de tablas y columnas en la base van en inglés y `snake_case`, igual que `schema.ts`.
- Vitest sólo levanta `lib/**/*.test.ts` (ver `vitest.config.ts`). **Toda lógica que deba testearse
  tiene que vivir en `lib/`.** Los componentes no tienen tests unitarios en este repo; se verifican
  con build y navegador.
- Estilos: inline con variables CSS (`var(--card)`, `var(--border)`, `var(--muted)`, `var(--accent)`,
  `var(--ok)`, `var(--warn)`, `var(--faint)`, `var(--glass)`, `var(--radius)`). No hay clases de
  Tailwind en estos componentes; se copia el objeto `panel` del dashboard.
- Nunca guardar métricas derivadas (CTR, CPC, CPA). Se computan al leer.
- Las divisiones por cero devuelven `null`, nunca `Infinity` ni `NaN`.
- Dos conteos distintos, siempre rotulados por separado en la UI: **"Clics a WhatsApp"**
  (`campaign_metrics.conversions`, lo que reporta la plataforma) y **"Leads"** (filas de `leads` con
  `campaign_id`). Nunca sumarlos ni presentarlos como el mismo número.
- Moneda ARS, formato `$1.234.567` (separador de miles con punto, sin decimales).
- Commits en español, sin prefijos tipo `feat:` — el repo usa mensajes en prosa.
- Antes de empezar: crear la rama `feat/pautas` desde `feat/seo-local`.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `web/lib/db/schema.ts` | MODIFICAR — 3 tablas nuevas + 2 columnas en `leads` |
| `web/lib/pautas/tipos.ts` | CREAR — tipos del dominio, sin lógica |
| `web/lib/pautas/metricas.ts` | CREAR — suma de períodos, derivadas, solapamiento |
| `web/lib/pautas/metricas.test.ts` | CREAR — tests de lo anterior |
| `web/lib/pautas/frescura.ts` | CREAR — antigüedad del dato y su etiqueta |
| `web/lib/pautas/frescura.test.ts` | CREAR — tests de lo anterior |
| `web/lib/pautas/datos.ts` | CREAR — lecturas desde Supabase |
| `web/app/(app)/marketing/page.tsx` | CREAR — vista principal |
| `web/app/(app)/marketing/[id]/page.tsx` | CREAR — detalle de campaña |
| `web/app/(app)/marketing/actions.ts` | CREAR — server actions de carga |
| `web/components/marketing/tabla-campanas.tsx` | CREAR — tabla de campañas |
| `web/components/marketing/form-periodo.tsx` | CREAR — modal de carga manual |
| `web/components/dashboard/pautas-card.tsx` | CREAR — card del dashboard |
| `web/app/(app)/dashboard/page.tsx` | MODIFICAR — insertar la card |
| `web/components/workspace/new-lead-form.tsx` | MODIFICAR — campos de atribución |
| `web/app/(app)/empresas/[slug]/actions.ts` | MODIFICAR — guardar atribución |
| `web/scripts/sync-pautas.ts` | CREAR — carga desde JSON |
| `web/package.json` | MODIFICAR — script `sync:pautas` |

---

## Task 1: Esquema de base de datos

**Files:**
- Modify: `web/lib/db/schema.ts`

**Interfaces:**
- Consumes: nada.
- Produces: tablas `adAccounts`, `campaigns`, `campaignMetrics` exportadas desde
  `@/lib/db/schema`; columnas `campaign_id` y `gclid` en `leads`.

- [ ] **Step 1: Crear la rama**

```bash
cd "C:/Users/Gesti/INICIATIVA GLOBAL/IG OS"
git checkout -b feat/pautas
```

- [ ] **Step 2: Ampliar el import de drizzle**

En `web/lib/db/schema.ts` línea 1, agregar `date` a la lista:

```ts
import { pgTable, uuid, text, integer, numeric, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
```

- [ ] **Step 3: Agregar las dos columnas de atribución a `leads`**

En la definición de `leads`, después de la línea `notes: text("notes")...`, agregar:

```ts
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  gclid: text("gclid").notNull().default(""),
```

`campaigns` se define más abajo en el archivo. Drizzle acepta la referencia porque la flecha es
perezosa: no se evalúa hasta que se construye el esquema. No hace falta reordenar el archivo.

- [ ] **Step 4: Agregar las tres tablas al final del archivo**

```ts
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
```

- [ ] **Step 5: Verificar que TypeScript compila**

Run: `cd web && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Aplicar el esquema a Supabase**

Run: `cd web && npm run db:push`
Expected: drizzle-kit lista las 3 tablas nuevas y las 2 columnas, y pide confirmación. Aceptar.

Si `db:push` falla por falta de `DATABASE_URL`, verificar `web/.env.local`. Ese archivo no está
versionado; sin él la tarea queda bloqueada.

- [ ] **Step 7: Confirmar en Supabase**

Abrir el editor SQL de Supabase (proyecto `zjetaihjddoxxvrpzwsb`) y correr:

```sql
select table_name from information_schema.tables
where table_name in ('ad_accounts','campaigns','campaign_metrics');
```
Expected: 3 filas.

Nota: RLS sigue desactivado en este proyecto, igual que el resto de las tablas. Activarlo es un
pendiente global previo al deploy, no de esta tarea.

- [ ] **Step 8: Commit**

```bash
git add web/lib/db/schema.ts
git commit -m "Esquema de pautas: cuentas, campañas, métricas y atribución en leads"
```

---

## Task 2: Tipos del dominio y métricas derivadas

**Files:**
- Create: `web/lib/pautas/tipos.ts`
- Create: `web/lib/pautas/metricas.ts`
- Test: `web/lib/pautas/metricas.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `Plataforma`, `EstadoCampana`, `OrigenMetrica`, `PeriodoMetrica`, `TotalesPauta`,
    `MetricasDerivadas` desde `@/lib/pautas/tipos`
  - `sumarPeriodos(periodos: PeriodoMetrica[]): TotalesPauta`
  - `derivar(totales: TotalesPauta, leadsAtribuidos: number): MetricasDerivadas`
  - `formatearPesos(n: number): string`

- [ ] **Step 1: Escribir los tipos**

Crear `web/lib/pautas/tipos.ts`:

```ts
export type Plataforma = "google" | "meta";
export type EstadoCampana = "borrador" | "activa" | "pausada" | "finalizada";
export type OrigenMetrica = "manual" | "sync";

/** Un tramo de performance. `desde` y `hasta` son YYYY-MM-DD y `hasta` es inclusivo. */
export type PeriodoMetrica = {
  id: string;
  campanaId: string;
  desde: string;
  hasta: string;
  origen: OrigenMetrica;
  impresiones: number;
  clics: number;
  costo: number;
  /** Conversiones que reporta la plataforma (clics a wa.me). NO son leads del CRM. */
  clicsWhatsapp: number;
};

export type TotalesPauta = {
  impresiones: number;
  clics: number;
  costo: number;
  clicsWhatsapp: number;
};

/** Todo puede ser null: sin denominador no hay ratio que valga. */
export type MetricasDerivadas = {
  ctr: number | null;
  costoPorClic: number | null;
  costoPorClicWhatsapp: number | null;
  costoPorLead: number | null;
};
```

- [ ] **Step 2: Escribir el test que falla**

Crear `web/lib/pautas/metricas.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { sumarPeriodos, derivar, formatearPesos } from "@/lib/pautas/metricas";
import type { PeriodoMetrica } from "@/lib/pautas/tipos";

function periodo(p: Partial<PeriodoMetrica> = {}): PeriodoMetrica {
  return {
    id: "p1",
    campanaId: "c1",
    desde: "2026-07-20",
    hasta: "2026-07-20",
    origen: "sync",
    impresiones: 100,
    clics: 10,
    costo: 1000,
    clicsWhatsapp: 2,
    ...p,
  };
}

describe("sumarPeriodos", () => {
  it("suma tramos de distinto tamaño", () => {
    const t = sumarPeriodos([
      periodo({ id: "a", desde: "2026-07-01", hasta: "2026-07-07", origen: "manual", costo: 14000, clics: 70, impresiones: 700, clicsWhatsapp: 9 }),
      periodo({ id: "b", desde: "2026-07-08", hasta: "2026-07-08", costo: 2000, clics: 11, impresiones: 120, clicsWhatsapp: 1 }),
    ]);
    expect(t).toEqual({ impresiones: 820, clics: 81, costo: 16000, clicsWhatsapp: 10 });
  });

  it("devuelve todo en cero si no hay períodos", () => {
    expect(sumarPeriodos([])).toEqual({ impresiones: 0, clics: 0, costo: 0, clicsWhatsapp: 0 });
  });
});

describe("derivar", () => {
  it("calcula los cuatro ratios", () => {
    const d = derivar({ impresiones: 1000, clics: 50, costo: 20000, clicsWhatsapp: 10 }, 4);
    expect(d.ctr).toBeCloseTo(0.05);
    expect(d.costoPorClic).toBe(400);
    expect(d.costoPorClicWhatsapp).toBe(2000);
    expect(d.costoPorLead).toBe(5000);
  });

  it("devuelve null en vez de Infinity cuando no hay denominador", () => {
    const d = derivar({ impresiones: 0, clics: 0, costo: 5000, clicsWhatsapp: 0 }, 0);
    expect(d.ctr).toBeNull();
    expect(d.costoPorClic).toBeNull();
    expect(d.costoPorClicWhatsapp).toBeNull();
    expect(d.costoPorLead).toBeNull();
  });

  it("una campaña con gasto y cero clics no rompe", () => {
    const d = derivar({ impresiones: 900, clics: 0, costo: 3000, clicsWhatsapp: 0 }, 0);
    expect(d.ctr).toBe(0);
    expect(d.costoPorClic).toBeNull();
  });
});

describe("formatearPesos", () => {
  it("usa punto como separador de miles y no muestra decimales", () => {
    expect(formatearPesos(1234567)).toBe("$1.234.567");
    expect(formatearPesos(0)).toBe("$0");
    expect(formatearPesos(2000.4)).toBe("$2.000");
  });
});
```

- [ ] **Step 3: Correr el test para verificar que falla**

Run: `cd web && npx vitest run lib/pautas/metricas.test.ts`
Expected: FAIL — no resuelve el módulo `@/lib/pautas/metricas`.

- [ ] **Step 4: Implementar**

Crear `web/lib/pautas/metricas.ts`:

```ts
import type { PeriodoMetrica, TotalesPauta, MetricasDerivadas } from "./tipos";

export function sumarPeriodos(periodos: PeriodoMetrica[]): TotalesPauta {
  return periodos.reduce<TotalesPauta>(
    (acc, p) => ({
      impresiones: acc.impresiones + p.impresiones,
      clics: acc.clics + p.clics,
      costo: acc.costo + p.costo,
      clicsWhatsapp: acc.clicsWhatsapp + p.clicsWhatsapp,
    }),
    { impresiones: 0, clics: 0, costo: 0, clicsWhatsapp: 0 },
  );
}

/** Sin denominador no hay ratio: devolvemos null y la UI muestra un guion. */
function ratio(numerador: number, denominador: number): number | null {
  return denominador > 0 ? numerador / denominador : null;
}

export function derivar(totales: TotalesPauta, leadsAtribuidos: number): MetricasDerivadas {
  return {
    ctr: ratio(totales.clics, totales.impresiones),
    costoPorClic: ratio(totales.costo, totales.clics),
    costoPorClicWhatsapp: ratio(totales.costo, totales.clicsWhatsapp),
    costoPorLead: ratio(totales.costo, leadsAtribuidos),
  };
}

export function formatearPesos(n: number): string {
  return `$${Math.round(n).toLocaleString("es-AR")}`;
}
```

- [ ] **Step 5: Correr el test para verificar que pasa**

Run: `cd web && npx vitest run lib/pautas/metricas.test.ts`
Expected: PASS, 6 tests.

Si `formatearPesos` falla, revisar que el entorno tenga ICU completo. Node 20+ lo trae por defecto;
`toLocaleString("es-AR")` debe dar `1.234.567`. Si diera `1,234,567`, reemplazar por:
`` `$${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}` ``

- [ ] **Step 6: Commit**

```bash
git add web/lib/pautas/tipos.ts web/lib/pautas/metricas.ts web/lib/pautas/metricas.test.ts
git commit -m "Métricas de pautas: suma de períodos y ratios derivados"
```

---

## Task 3: Regla de solapamiento

Protege el número de gasto, que es el que se usa para decidir si escalar una campaña. Si existe una
fila manual del 20 al 26 y el sync escribe los 7 días sueltos, sumar todo duplica el gasto.

**Files:**
- Modify: `web/lib/pautas/metricas.ts`
- Test: `web/lib/pautas/metricas.test.ts`

**Interfaces:**
- Consumes: `PeriodoMetrica` de Task 2.
- Produces:
  - `seSolapan(a: RangoFechas, b: RangoFechas): boolean`
  - `periodosVigentes(periodos: PeriodoMetrica[]): PeriodoMetrica[]`
  - tipo `RangoFechas = { desde: string; hasta: string }` exportado desde `tipos.ts`

- [ ] **Step 1: Agregar el tipo `RangoFechas`**

Al final de `web/lib/pautas/tipos.ts`:

```ts
export type RangoFechas = { desde: string; hasta: string };
```

- [ ] **Step 2: Escribir el test que falla**

Agregar al final de `web/lib/pautas/metricas.test.ts`:

```ts
import { seSolapan, periodosVigentes } from "@/lib/pautas/metricas";

describe("seSolapan", () => {
  it("detecta solapamiento parcial", () => {
    expect(seSolapan({ desde: "2026-07-20", hasta: "2026-07-26" }, { desde: "2026-07-25", hasta: "2026-07-30" })).toBe(true);
  });

  it("trata el borde como solapado porque hasta es inclusivo", () => {
    expect(seSolapan({ desde: "2026-07-20", hasta: "2026-07-26" }, { desde: "2026-07-26", hasta: "2026-07-26" })).toBe(true);
  });

  it("rangos contiguos no se solapan", () => {
    expect(seSolapan({ desde: "2026-07-20", hasta: "2026-07-26" }, { desde: "2026-07-27", hasta: "2026-07-31" })).toBe(false);
  });
});

describe("periodosVigentes", () => {
  it("descarta la fila manual que el sync ya cubre", () => {
    const manualSemana = periodo({ id: "m", desde: "2026-07-20", hasta: "2026-07-26", origen: "manual", costo: 14000, clics: 70, impresiones: 700, clicsWhatsapp: 9 });
    const sync1 = periodo({ id: "s1", desde: "2026-07-20", hasta: "2026-07-20", costo: 2000, clics: 10, impresiones: 100, clicsWhatsapp: 1 });
    const sync2 = periodo({ id: "s2", desde: "2026-07-21", hasta: "2026-07-21", costo: 2000, clics: 10, impresiones: 100, clicsWhatsapp: 1 });

    const vigentes = periodosVigentes([manualSemana, sync1, sync2]);

    expect(vigentes.map((p) => p.id).sort()).toEqual(["s1", "s2"]);
    expect(sumarPeriodos(vigentes).costo).toBe(4000);
  });

  it("conserva la fila manual que ningún sync toca", () => {
    const manualVieja = periodo({ id: "m", desde: "2026-07-01", hasta: "2026-07-07", origen: "manual" });
    const sync = periodo({ id: "s", desde: "2026-07-20", hasta: "2026-07-20" });
    expect(periodosVigentes([manualVieja, sync]).map((p) => p.id).sort()).toEqual(["m", "s"]);
  });

  it("no descarta filas de sync entre sí aunque se solapen", () => {
    const a = periodo({ id: "a", desde: "2026-07-20", hasta: "2026-07-20" });
    const b = periodo({ id: "b", desde: "2026-07-20", hasta: "2026-07-20" });
    expect(periodosVigentes([a, b])).toHaveLength(2);
  });
});
```

La última prueba fija una decisión importante: la regla sólo arbitra **manual contra sync**. Dos
filas de sync duplicadas serían un bug del cargador, y esconderlo acá lo volvería invisible. El
cargador previene ese caso con su propio borrado (Task 11).

- [ ] **Step 3: Correr el test para verificar que falla**

Run: `cd web && npx vitest run lib/pautas/metricas.test.ts`
Expected: FAIL — `seSolapan` y `periodosVigentes` no existen.

- [ ] **Step 4: Implementar**

Agregar a `web/lib/pautas/metricas.ts`:

```ts
import type { RangoFechas } from "./tipos";

/**
 * Las fechas son YYYY-MM-DD, así que la comparación de strings equivale a la
 * cronológica y evita entrar en zonas horarias.
 */
export function seSolapan(a: RangoFechas, b: RangoFechas): boolean {
  return a.desde <= b.hasta && b.desde <= a.hasta;
}

/**
 * El dato automático manda; el manual es respaldo. Descarta las filas manuales
 * que pisen cualquier tramo traído por sync, para no contar el gasto dos veces.
 */
export function periodosVigentes(periodos: PeriodoMetrica[]): PeriodoMetrica[] {
  const deSync = periodos.filter((p) => p.origen === "sync");
  return periodos.filter(
    (p) => p.origen === "sync" || !deSync.some((s) => seSolapan(p, s)),
  );
}
```

Recordá agregar `RangoFechas` al import existente de `./tipos` en vez de duplicar la línea de
import.

- [ ] **Step 5: Correr el test para verificar que pasa**

Run: `cd web && npx vitest run lib/pautas/metricas.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 6: Commit**

```bash
git add web/lib/pautas/
git commit -m "Regla de solapamiento: el sync pisa la carga manual sin duplicar gasto"
```

---

## Task 4: Frescura del dato

El modo de falla peligroso no es que el sync explote, es que falle en silencio y los números viejos
pasen por actuales.

**Files:**
- Create: `web/lib/pautas/frescura.ts`
- Test: `web/lib/pautas/frescura.test.ts`

**Interfaces:**
- Consumes: `EstadoCampana` de Task 2.
- Produces: `estadoDeFrescura(ultimaCarga: Date | null, ahora: Date, estado: EstadoCampana): Frescura`
  con `Frescura = { etiqueta: string; tono: "gris" | "ambar" | "neutro" }`

- [ ] **Step 1: Escribir el test que falla**

Crear `web/lib/pautas/frescura.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { estadoDeFrescura } from "@/lib/pautas/frescura";

const AHORA = new Date("2026-07-20T12:00:00.000Z");
const hace = (horas: number) => new Date(AHORA.getTime() - horas * 3600_000);

describe("estadoDeFrescura", () => {
  it("una campaña en borrador no habla de actualizaciones", () => {
    expect(estadoDeFrescura(null, AHORA, "borrador")).toEqual({ etiqueta: "En borrador", tono: "neutro" });
  });

  it("una campaña activa sin datos lo dice explícitamente", () => {
    expect(estadoDeFrescura(null, AHORA, "activa")).toEqual({ etiqueta: "Sin datos cargados", tono: "neutro" });
  });

  it("muestra en gris un dato reciente", () => {
    expect(estadoDeFrescura(hace(2), AHORA, "activa")).toEqual({ etiqueta: "Actualizado hace 2 horas", tono: "gris" });
  });

  it("usa singular cuando corresponde", () => {
    expect(estadoDeFrescura(hace(1), AHORA, "activa").etiqueta).toBe("Actualizado hace 1 hora");
  });

  it("dice minutos cuando hace menos de una hora", () => {
    expect(estadoDeFrescura(new Date(AHORA.getTime() - 20 * 60_000), AHORA, "activa").etiqueta).toBe("Actualizado hace 20 minutos");
  });

  it("pasa a ámbar cuando una campaña activa lleva más de 48 horas sin datos", () => {
    expect(estadoDeFrescura(hace(72), AHORA, "activa")).toEqual({ etiqueta: "Sin actualizar hace 3 días", tono: "ambar" });
  });

  it("no alarma si la campaña está pausada", () => {
    expect(estadoDeFrescura(hace(72), AHORA, "pausada").tono).toBe("gris");
  });

  it("48 horas exactas todavía no es ámbar", () => {
    expect(estadoDeFrescura(hace(48), AHORA, "activa").tono).toBe("gris");
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `cd web && npx vitest run lib/pautas/frescura.test.ts`
Expected: FAIL — no resuelve el módulo.

- [ ] **Step 3: Implementar**

Crear `web/lib/pautas/frescura.ts`:

```ts
import type { EstadoCampana } from "./tipos";

export type Frescura = { etiqueta: string; tono: "gris" | "ambar" | "neutro" };

const HORAS_PARA_ALARMA = 48;

function plural(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

function antiguedad(horas: number): string {
  if (horas < 1) return plural(Math.max(1, Math.round(horas * 60)), "minuto", "minutos");
  if (horas < 24) return plural(Math.floor(horas), "hora", "horas");
  return plural(Math.floor(horas / 24), "día", "días");
}

export function estadoDeFrescura(
  ultimaCarga: Date | null,
  ahora: Date,
  estado: EstadoCampana,
): Frescura {
  if (estado === "borrador") return { etiqueta: "En borrador", tono: "neutro" };
  if (!ultimaCarga) return { etiqueta: "Sin datos cargados", tono: "neutro" };

  const horas = (ahora.getTime() - ultimaCarga.getTime()) / 3600_000;
  // Sólo alarmamos si la campaña debería estar produciendo datos ahora mismo.
  if (estado === "activa" && horas > HORAS_PARA_ALARMA) {
    return { etiqueta: `Sin actualizar hace ${antiguedad(horas)}`, tono: "ambar" };
  }
  return { etiqueta: `Actualizado hace ${antiguedad(horas)}`, tono: "gris" };
}
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `cd web && npx vitest run lib/pautas/frescura.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 5: Correr toda la suite**

Run: `cd web && npm test`
Expected: PASS — los tests de `seo-local` siguen verdes.

- [ ] **Step 6: Commit**

```bash
git add web/lib/pautas/frescura.ts web/lib/pautas/frescura.test.ts
git commit -m "Frescura del dato: etiqueta y alarma a las 48 horas"
```

---

## Task 5: Capa de lectura desde Supabase

**Files:**
- Create: `web/lib/pautas/datos.ts`

**Interfaces:**
- Consumes: `sumarPeriodos`, `derivar`, `periodosVigentes` (Tasks 2-3); `estadoDeFrescura` (Task 4).
- Produces:
  - tipo `FilaCampana` (ver abajo)
  - `getCampanas(): Promise<FilaCampana[]>`
  - `getResumenPautas(): Promise<ResumenPautas>`
  - `getCampana(id: string): Promise<DetalleCampana | null>`

- [ ] **Step 1: Implementar la capa de lectura**

Crear `web/lib/pautas/datos.ts`. Sigue el patrón de `lib/data.ts`: cliente de Supabase por request,
relaciones que pueden venir como objeto o array, y `?? []` defensivo.

```ts
import { createClient } from "@/lib/supabase/server";
import { sumarPeriodos, derivar, periodosVigentes } from "./metricas";
import { estadoDeFrescura, type Frescura } from "./frescura";
import type { PeriodoMetrica, EstadoCampana, Plataforma, TotalesPauta, MetricasDerivadas } from "./tipos";

export type FilaCampana = {
  id: string;
  nombre: string;
  empresa: string;
  empresaColor: string;
  plataforma: Plataforma;
  estado: EstadoCampana;
  presupuestoDiario: number;
  totales: TotalesPauta;
  leadsAtribuidos: number;
  derivadas: MetricasDerivadas;
  frescura: Frescura;
};

export type ResumenPautas = {
  inversion: number;
  leads: number;
  costoPorLead: number | null;
  serie: number[];
  campanasActivas: number;
  campanasEnBorrador: number;
  primeraEnBorrador: string | null;
};

export type DetalleCampana = FilaCampana & {
  periodos: PeriodoMetrica[];
  leads: { id: string; nombre: string; valor: number; gclid: string }[];
};

type MetricaRow = {
  id: string;
  campaign_id: string;
  period_start: string;
  period_end: string;
  source: string;
  impressions: number;
  clicks: number;
  cost: number | string;
  conversions: number;
  created_at: string;
};

function aPeriodo(r: MetricaRow): PeriodoMetrica {
  return {
    id: r.id,
    campanaId: r.campaign_id,
    desde: r.period_start,
    hasta: r.period_end,
    origen: r.source === "sync" ? "sync" : "manual",
    impresiones: r.impressions,
    clics: r.clicks,
    costo: Number(r.cost),
    clicsWhatsapp: r.conversions,
  };
}

function uno<T>(rel: T | T[] | null): T | null {
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

/** Recorta a los períodos que caen dentro del mes en curso. */
function delMesActual(periodos: PeriodoMetrica[], ahora: Date): PeriodoMetrica[] {
  const inicio = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`;
  return periodos.filter((p) => p.hasta >= inicio);
}

async function cargarTodo() {
  const sb = await createClient();
  const [{ data: campanas }, { data: metricas }, { data: leads }] = await Promise.all([
    sb.from("campaigns").select("id,name,status,objective,daily_budget,companies(name,color),ad_accounts(platform)"),
    sb.from("campaign_metrics").select("id,campaign_id,period_start,period_end,source,impressions,clicks,cost,conversions,created_at"),
    sb.from("leads").select("id,name,value,gclid,campaign_id").not("campaign_id", "is", null),
  ]);
  return { campanas: campanas ?? [], metricas: (metricas ?? []) as MetricaRow[], leads: leads ?? [] };
}

export async function getCampanas(ahora: Date = new Date()): Promise<FilaCampana[]> {
  const { campanas, metricas, leads } = await cargarTodo();

  return campanas.map((c) => {
    const propias = metricas.filter((m) => m.campaign_id === c.id);
    const vigentes = periodosVigentes(propias.map(aPeriodo));
    const totales = sumarPeriodos(vigentes);
    const leadsAtribuidos = leads.filter((l) => l.campaign_id === c.id).length;
    const empresa = uno(c.companies as { name: string; color: string } | { name: string; color: string }[] | null);
    const cuenta = uno(c.ad_accounts as { platform: string } | { platform: string }[] | null);

    const ultima = propias.length
      ? new Date(Math.max(...propias.map((m) => new Date(m.created_at).getTime())))
      : null;
    const estado = c.status as EstadoCampana;

    return {
      id: c.id as string,
      nombre: c.name as string,
      empresa: empresa?.name ?? "",
      empresaColor: empresa?.color ?? "#7d7bf0",
      plataforma: (cuenta?.platform === "meta" ? "meta" : "google") as Plataforma,
      estado,
      presupuestoDiario: Number(c.daily_budget),
      totales,
      leadsAtribuidos,
      derivadas: derivar(totales, leadsAtribuidos),
      frescura: estadoDeFrescura(ultima, ahora, estado),
    };
  }).sort((a, b) => b.totales.costo - a.totales.costo);
}

export async function getResumenPautas(ahora: Date = new Date()): Promise<ResumenPautas> {
  const { campanas, metricas, leads } = await cargarTodo();
  const vigentes = delMesActual(periodosVigentes(metricas.map(aPeriodo)), ahora);
  const totales = sumarPeriodos(vigentes);
  const leadsDelMes = leads.length;

  // Serie de gasto de los últimos 30 días, un punto por día.
  const serie: number[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(ahora.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    const delDia = vigentes.filter((p) => p.desde <= d && d <= p.hasta);
    // Un tramo semanal reparte su gasto en partes iguales entre sus días.
    serie.push(delDia.reduce((s, p) => s + p.costo / diasDelTramo(p), 0));
  }

  const borradores = campanas.filter((c) => c.status === "borrador");
  return {
    inversion: totales.costo,
    leads: leadsDelMes,
    costoPorLead: derivar(totales, leadsDelMes).costoPorLead,
    serie,
    campanasActivas: campanas.filter((c) => c.status === "activa").length,
    campanasEnBorrador: borradores.length,
    primeraEnBorrador: (borradores[0]?.name as string) ?? null,
  };
}

/** Cantidad de días que cubre un tramo, con `hasta` inclusivo. */
function diasDelTramo(p: PeriodoMetrica): number {
  const ms = new Date(p.hasta).getTime() - new Date(p.desde).getTime();
  return Math.max(1, Math.round(ms / 86_400_000) + 1);
}

export async function getCampana(id: string, ahora: Date = new Date()): Promise<DetalleCampana | null> {
  const fila = (await getCampanas(ahora)).find((c) => c.id === id);
  if (!fila) return null;

  const sb = await createClient();
  const [{ data: metricas }, { data: leads }] = await Promise.all([
    sb.from("campaign_metrics").select("id,campaign_id,period_start,period_end,source,impressions,clicks,cost,conversions,created_at").eq("campaign_id", id).order("period_start", { ascending: false }),
    sb.from("leads").select("id,name,value,gclid").eq("campaign_id", id).order("value", { ascending: false }),
  ]);

  return {
    ...fila,
    periodos: ((metricas ?? []) as MetricaRow[]).map(aPeriodo),
    leads: (leads ?? []).map((l) => ({ id: l.id as string, nombre: l.name as string, valor: Number(l.value), gclid: (l.gclid as string) ?? "" })),
  };
}
```

- [ ] **Step 2: Verificar que compila**

Run: `cd web && npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 3: Commit**

```bash
git add web/lib/pautas/datos.ts
git commit -m "Lectura de pautas desde Supabase con totales y frescura"
```

---

## Task 6: Card de pautas en el dashboard

Es lo que motivó el módulo: ver el seguimiento sin salir del dashboard.

**Files:**
- Create: `web/components/dashboard/pautas-card.tsx`
- Modify: `web/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `getResumenPautas`, `ResumenPautas` (Task 5); `formatearPesos` (Task 2).
- Produces: `<PautasCard resumen={...} />`

- [ ] **Step 1: Crear el componente**

Crear `web/components/dashboard/pautas-card.tsx`:

```tsx
import Link from "next/link";
import { formatearPesos } from "@/lib/pautas/metricas";
import type { ResumenPautas } from "@/lib/pautas/datos";

const W = 260;
const H = 44;

function sparkline(serie: number[]): string {
  const max = Math.max(...serie, 1);
  const step = W / Math.max(1, serie.length - 1);
  return serie.map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(H - (v / max) * H).toFixed(1)}`).join(" ");
}

export function PautasCard({ resumen }: { resumen: ResumenPautas }) {
  const sinDatos = resumen.inversion === 0 && resumen.leads === 0;

  return (
    <div style={{ background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--muted)" }}>Pautas</span>
        <Link href="/marketing" style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600 }}>Ver todas</Link>
      </div>

      {sinDatos ? (
        <EstadoVacio resumen={resumen} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            <Dato titulo="Inversión del mes" valor={formatearPesos(resumen.inversion)} />
            <Dato titulo="Leads" valor={String(resumen.leads)} />
            <Dato titulo="Costo por lead" valor={resumen.costoPorLead === null ? "—" : formatearPesos(resumen.costoPorLead)} />
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: H, display: "block", marginTop: 16 }}>
            <path d={sparkline(resumen.serie)} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <div style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 4 }}>Gasto de los últimos 30 días</div>
        </>
      )}
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--faint)" }}>{titulo}</div>
      <b className="tnum" style={{ fontSize: 19, fontWeight: 750 }}>{valor}</b>
    </div>
  );
}

/** Sin datos no mostramos $0: eso parecería una campaña fracasada en vez de una que todavía no salió. */
function EstadoVacio({ resumen }: { resumen: ResumenPautas }) {
  const texto = resumen.campanasEnBorrador > 0
    ? `${resumen.campanasEnBorrador} campaña${resumen.campanasEnBorrador > 1 ? "s" : ""} en borrador`
    : resumen.campanasActivas > 0
      ? "Campañas activas sin datos cargados"
      : "Todavía no cargaste ninguna campaña";

  return (
    <div style={{ padding: "18px 0 8px" }}>
      <b style={{ fontSize: 14, fontWeight: 650, display: "block" }}>{texto}</b>
      <span style={{ fontSize: 12, color: "var(--faint)", display: "block", marginTop: 5 }}>
        {resumen.primeraEnBorrador ?? "Creá una campaña para empezar a medir"}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Insertar la card en el dashboard**

En `web/app/(app)/dashboard/page.tsx`:

1. Agregar los imports junto a los existentes:

```tsx
import { getResumenPautas } from "@/lib/pautas/datos";
import { PautasCard } from "@/components/dashboard/pautas-card";
```

2. Ampliar el `Promise.all` de la línea 41:

```tsx
  const [funnelData, tasks, resumenPautas] = await Promise.all([getFunnelSummary(), getTasks(), getResumenPautas()]);
```

3. Insertar la card **después** del `</div>` que cierra el bloque `ig-trio` (línea 198) y **antes**
   del panel de Integraciones:

```tsx
          <PautasCard resumen={resumenPautas} />
```

La card va a lo ancho, debajo del trío. Meterla dentro de `ig-trio` obligaría a rehacer el
`gridTemplateColumns: "1fr 1.25fr .9fr"` y a revisar el breakpoint de `.ig-trio`; a lo ancho se lee
mejor el sparkline y no toca el CSS existente.

- [ ] **Step 3: Verificar en el navegador**

Levantar el server con la herramienta de preview (`preview_start` con el nombre de `launch.json`,
puerto 3001) y abrir `/dashboard`.

Expected: la card "PAUTAS" aparece debajo del trío mostrando "Todavía no cargaste ninguna campaña"
(no hay datos todavía). Sin errores en consola.

- [ ] **Step 4: Commit**

```bash
git add web/components/dashboard/pautas-card.tsx "web/app/(app)/dashboard/page.tsx"
git commit -m "Card de pautas en el dashboard con estado vacío informativo"
```

---

## Task 7: Página /marketing

**Files:**
- Create: `web/app/(app)/marketing/page.tsx`
- Create: `web/components/marketing/tabla-campanas.tsx`
- Modify: `web/app/(app)/[section]/page.tsx`

**Interfaces:**
- Consumes: `getCampanas`, `FilaCampana` (Task 5); `formatearPesos` (Task 2).
- Produces: ruta `/marketing`; `<TablaCampanas filas={...} />`

Al crear `app/(app)/marketing/page.tsx`, Next.js le da precedencia sobre el catch-all
`app/(app)/[section]/page.tsx`. La entrada del sidebar ya existe (`components/shell/sidebar.tsx:27`)
y no hay que tocarla.

- [ ] **Step 1: Crear la tabla**

Crear `web/components/marketing/tabla-campanas.tsx`:

```tsx
import Link from "next/link";
import { formatearPesos } from "@/lib/pautas/metricas";
import type { FilaCampana } from "@/lib/pautas/datos";

const coloresEstado: Record<string, { bg: string; c: string }> = {
  activa: { bg: "rgba(45,212,191,.15)", c: "#2dd4bf" },
  borrador: { bg: "rgba(255,255,255,.07)", c: "var(--faint)" },
  pausada: { bg: "rgba(245,177,60,.15)", c: "#f5b13c" },
  finalizada: { bg: "rgba(255,107,107,.15)", c: "#ff8585" },
};

const tonos: Record<string, string> = { gris: "var(--faint)", ambar: "var(--warn)", neutro: "var(--faint)" };

const th: React.CSSProperties = { textAlign: "right", fontSize: 10.5, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--faint)", padding: "0 0 10px" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 12.5, padding: "13px 0", borderTop: "1px solid var(--border)" };

export function TablaCampanas({ filas }: { filas: FilaCampana[] }) {
  if (filas.length === 0) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--faint)", fontSize: 13 }}>
        Todavía no hay campañas cargadas.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
        <thead>
          <tr>
            <th style={{ ...th, textAlign: "left" }}>Campaña</th>
            <th style={th}>Presup./día</th>
            <th style={th}>Gasto</th>
            <th style={th}>Clics</th>
            <th style={th}>Clics a WhatsApp</th>
            <th style={th}>Leads</th>
            <th style={th}>Costo por lead</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.id}>
              <td style={{ ...td, textAlign: "left" }}>
                <Link href={`/marketing/${f.id}`} style={{ display: "block" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: f.empresaColor, flex: "none" }} />
                    <b style={{ fontSize: 13, fontWeight: 640 }}>{f.nombre}</b>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, ...coloresEstado[f.estado] }}>{f.estado}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--faint)", marginLeft: 17 }}>
                    {f.empresa} · {f.plataforma === "google" ? "Google Ads" : "Meta Ads"} ·{" "}
                    <span style={{ color: tonos[f.frescura.tono] }}>{f.frescura.etiqueta}</span>
                  </span>
                </Link>
              </td>
              <td style={td}>{formatearPesos(f.presupuestoDiario)}</td>
              <td style={{ ...td, fontWeight: 700 }}>{formatearPesos(f.totales.costo)}</td>
              <td style={td}>{f.totales.clics}</td>
              <td style={td}>{f.totales.clicsWhatsapp}</td>
              <td style={td}>{f.leadsAtribuidos}</td>
              <td style={td}>{f.derivadas.costoPorLead === null ? "—" : formatearPesos(f.derivadas.costoPorLead)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Crear la página**

Crear `web/app/(app)/marketing/page.tsx`:

```tsx
import { getCampanas, getResumenPautas } from "@/lib/pautas/datos";
import { formatearPesos } from "@/lib/pautas/metricas";
import { TablaCampanas } from "@/components/marketing/tabla-campanas";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: 20,
};

export default async function MarketingPage() {
  const [filas, resumen] = await Promise.all([getCampanas(), getResumenPautas()]);

  const kpis = [
    { label: "Inversión del mes", valor: formatearPesos(resumen.inversion) },
    { label: "Leads atribuidos", valor: String(resumen.leads) },
    { label: "Costo por lead", valor: resumen.costoPorLead === null ? "—" : formatearPesos(resumen.costoPorLead) },
    { label: "Campañas activas", valor: String(resumen.campanasActivas) },
  ];

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Pautas</h1>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
          Inversión publicitaria y los leads que genera, por campaña.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ ...panel, padding: "16px 18px" }}>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 23, fontWeight: 780, letterSpacing: "-.6px", display: "block", marginTop: 8 }}>{k.valor}</b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <TablaCampanas filas={filas} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Sacar "marketing" del placeholder**

En `web/app/(app)/[section]/page.tsx`, borrar la línea `marketing: "Marketing",` del mapa `titles`.
La ruta ya no llega al catch-all y dejarla confunde a quien lea el archivo.

- [ ] **Step 4: Verificar en el navegador**

Abrir `/marketing`.
Expected: título "Pautas", cuatro KPIs en cero y la tabla diciendo "Todavía no hay campañas
cargadas". El item Marketing del sidebar queda marcado como activo.

- [ ] **Step 5: Commit**

```bash
git add "web/app/(app)/marketing/page.tsx" web/components/marketing/tabla-campanas.tsx "web/app/(app)/[section]/page.tsx"
git commit -m "Vista de pautas con KPIs del mes y tabla de campañas"
```

---

## Task 8: Alta de campaña y carga manual de períodos

Sin esto no hay forma de meter datos por la interfaz: el módulo depende del script o del editor SQL.

**Files:**
- Create: `web/app/(app)/marketing/actions.ts`
- Create: `web/components/marketing/form-periodo.tsx`
- Modify: `web/app/(app)/marketing/page.tsx`
- Modify: `web/lib/pautas/datos.ts`

**Interfaces:**
- Consumes: patrón de `app/(app)/empresas/[slug]/actions.ts`.
- Produces:
  - `crearCampana(formData: FormData): Promise<void>`
  - `cargarPeriodo(formData: FormData): Promise<void>`
  - `getOpcionesAlta(): Promise<{ cuentas: OpcionCuenta[]; campanas: Opcion[] }>`
  - `<BotonesCarga cuentas={} campanas={} />`

- [ ] **Step 1: Agregar el lector de opciones**

Al final de `web/lib/pautas/datos.ts`:

```ts
export type Opcion = { id: string; nombre: string };
export type OpcionCuenta = { id: string; nombre: string; empresaId: string };

export async function getOpcionesAlta() {
  const sb = await createClient();
  const [{ data: cuentas }, { data: campanas }] = await Promise.all([
    sb.from("ad_accounts").select("id,name,platform,company_id").eq("active", true),
    sb.from("campaigns").select("id,name").order("name"),
  ]);
  return {
    cuentas: (cuentas ?? []).map((c) => ({
      id: c.id as string,
      nombre: `${c.name || "Cuenta"} · ${c.platform === "meta" ? "Meta Ads" : "Google Ads"}`,
      empresaId: c.company_id as string,
    })),
    campanas: (campanas ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string })),
  };
}
```

- [ ] **Step 2: Escribir las server actions**

Crear `web/app/(app)/marketing/actions.ts`:

```ts
"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { seSolapan } from "@/lib/pautas/metricas";

function aNumero(fd: FormData, campo: string): number {
  const limpio = String(fd.get(campo) ?? "").replace(/[^0-9]/g, "");
  return limpio ? Number(limpio) : 0;
}

export async function crearCampana(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const cuentaId = String(formData.get("cuentaId") ?? "");
  if (!nombre || !cuentaId) return;

  const sb = await createClient();
  const { data: cuenta } = await sb.from("ad_accounts").select("company_id").eq("id", cuentaId).single();
  if (!cuenta) return;

  await sb.from("campaigns").insert({
    company_id: cuenta.company_id,
    ad_account_id: cuentaId,
    name: nombre,
    external_id: String(formData.get("externalId") ?? "").trim(),
    objective: String(formData.get("objetivo") ?? "leads"),
    status: String(formData.get("estado") ?? "borrador"),
    daily_budget: aNumero(formData, "presupuesto"),
  });

  revalidatePath("/marketing");
  revalidatePath("/dashboard");
}

export async function cargarPeriodo(formData: FormData) {
  const campanaId = String(formData.get("campanaId") ?? "");
  const desde = String(formData.get("desde") ?? "");
  const hasta = String(formData.get("hasta") ?? "");
  // Sin campaña o sin rango no hay nada que guardar; un rango invertido sería
  // un tramo negativo y rompería el reparto diario del gasto.
  if (!campanaId || !desde || !hasta || desde > hasta) return;

  const sb = await createClient();

  // Una carga manual reemplaza a otra manual del mismo tramo en vez de sumarse.
  const { data: previas } = await sb
    .from("campaign_metrics")
    .select("id,period_start,period_end")
    .eq("campaign_id", campanaId)
    .eq("source", "manual");

  const pisadas = (previas ?? []).filter((p) =>
    seSolapan({ desde: p.period_start as string, hasta: p.period_end as string }, { desde, hasta }),
  );
  if (pisadas.length) {
    await sb.from("campaign_metrics").delete().in("id", pisadas.map((p) => p.id));
  }

  await sb.from("campaign_metrics").insert({
    campaign_id: campanaId,
    period_start: desde,
    period_end: hasta,
    source: "manual",
    impressions: aNumero(formData, "impresiones"),
    clicks: aNumero(formData, "clics"),
    cost: aNumero(formData, "costo"),
    conversions: aNumero(formData, "clicsWhatsapp"),
  });

  revalidatePath("/marketing");
  revalidatePath("/dashboard");
}
```

- [ ] **Step 3: Crear los formularios**

Crear `web/components/marketing/form-periodo.tsx`. Copia el patrón del modal de
`components/workspace/new-lead-form.tsx` (estado local, overlay, `action` async que cierra al
terminar):

```tsx
"use client";
import { useState } from "react";
import { Plus, X, Upload } from "lucide-react";
import { crearCampana, cargarPeriodo } from "@/app/(app)/marketing/actions";
import type { Opcion, OpcionCuenta } from "@/lib/pautas/datos";

const campo: React.CSSProperties = {
  width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10,
  padding: "10px 12px", color: "var(--text)", fontSize: 13, outline: "none", fontFamily: "inherit",
};

function Modal({ titulo, onClose, onSubmit, children }: { titulo: string; onClose: () => void; onSubmit: (fd: FormData) => Promise<void>; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(3px)", zIndex: 50, display: "grid", placeItems: "center", padding: 20 }}>
      <form
        action={async (fd) => { await onSubmit(fd); onClose(); }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: 460, maxWidth: "100%", background: "var(--panel-2)", border: "1px solid var(--border-2)", borderRadius: 18, padding: 22, boxShadow: "0 30px 70px -20px #000" }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <b style={{ fontSize: 16, fontWeight: 720 }}>{titulo}</b>
          <button type="button" onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--faint)", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>{children}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button type="submit" style={{ flex: 1, background: "var(--accent)", border: "none", color: "#fff", borderRadius: 11, padding: "11px 0", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Guardar</button>
        </div>
      </form>
    </div>
  );
}

export function BotonesCarga({ cuentas, campanas }: { cuentas: OpcionCuenta[]; campanas: Opcion[] }) {
  const [abierto, setAbierto] = useState<"campana" | "periodo" | null>(null);
  const hoy = new Date().toISOString().slice(0, 10);

  const boton: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7, background: "var(--card)",
    border: "1px solid var(--border)", color: "var(--text)", borderRadius: 10,
    padding: "9px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setAbierto("campana")} style={boton}><Plus size={15} /> Nueva campaña</button>
        <button onClick={() => setAbierto("periodo")} style={boton} disabled={campanas.length === 0}><Upload size={15} /> Cargar período</button>
      </div>

      {abierto === "campana" && (
        <Modal titulo="Nueva campaña" onClose={() => setAbierto(null)} onSubmit={crearCampana}>
          <input name="nombre" placeholder="Nombre de la campaña" required style={campo} />
          <select name="cuentaId" required style={campo} defaultValue={cuentas[0]?.id}>
            {cuentas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <input name="externalId" placeholder="ID en la plataforma (opcional)" style={campo} />
          <div style={{ display: "flex", gap: 11 }}>
            <input name="presupuesto" placeholder="Presupuesto diario ($)" inputMode="numeric" style={{ ...campo, flex: 1 }} />
            <select name="estado" style={{ ...campo, flex: 1 }} defaultValue="borrador">
              <option value="borrador">Borrador</option>
              <option value="activa">Activa</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>
          <select name="objetivo" style={campo} defaultValue="leads">
            <option value="leads">Objetivo: Leads</option>
            <option value="trafico">Objetivo: Tráfico</option>
            <option value="ventas">Objetivo: Ventas</option>
          </select>
        </Modal>
      )}

      {abierto === "periodo" && (
        <Modal titulo="Cargar período" onClose={() => setAbierto(null)} onSubmit={cargarPeriodo}>
          <select name="campanaId" required style={campo} defaultValue={campanas[0]?.id}>
            {campanas.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="desde" type="date" required defaultValue={hoy} style={{ ...campo, flex: 1 }} />
            <input name="hasta" type="date" required defaultValue={hoy} style={{ ...campo, flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="impresiones" placeholder="Impresiones" inputMode="numeric" style={{ ...campo, flex: 1 }} />
            <input name="clics" placeholder="Clics" inputMode="numeric" style={{ ...campo, flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 11 }}>
            <input name="costo" placeholder="Gasto ($)" inputMode="numeric" style={{ ...campo, flex: 1 }} />
            <input name="clicsWhatsapp" placeholder="Clics a WhatsApp" inputMode="numeric" style={{ ...campo, flex: 1 }} />
          </div>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>
            Si ya cargaste este mismo tramo a mano, esta carga lo reemplaza.
          </span>
        </Modal>
      )}
    </>
  );
}
```

- [ ] **Step 4: Enganchar los botones en la página**

En `web/app/(app)/marketing/page.tsx`:

1. Agregar imports:

```tsx
import { getOpcionesAlta } from "@/lib/pautas/datos";
import { BotonesCarga } from "@/components/marketing/form-periodo";
```

2. Ampliar el `Promise.all`:

```tsx
  const [filas, resumen, opciones] = await Promise.all([getCampanas(), getResumenPautas(), getOpcionesAlta()]);
```

3. Envolver el encabezado para que los botones queden a la derecha. Reemplazar el bloque
   `<div><h1>…</h1><p>…</p></div>` por:

```tsx
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>Pautas</h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: "5px 0 0" }}>
            Inversión publicitaria y los leads que genera, por campaña.
          </p>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <BotonesCarga cuentas={opciones.cuentas} campanas={opciones.campanas} />
        </div>
      </div>
```

- [ ] **Step 5: Sembrar la cuenta de Premoldeados**

Sin una `ad_account` no se puede crear ninguna campaña. Correr en el editor SQL de Supabase:

```sql
insert into ad_accounts (company_id, platform, external_id, name, currency, active)
select id, 'google', '2961244070', 'PREMOLDEADOS MA', 'ARS', true
from companies where slug = 'premoldeados-ma';
```

Si devuelve 0 filas, verificar el slug real con `select slug from companies;` y reintentar con el
valor correcto.

- [ ] **Step 6: Probar el circuito completo en el navegador**

En `/marketing`:
1. "Nueva campaña" → nombre `Search_Muros-Premoldeados_Zona-Oeste`, cuenta PREMOLDEADOS MA,
   presupuesto `2000`, estado `borrador`. Guardar.
   Expected: aparece en la tabla con el chip "borrador" y todo en cero.
2. "Cargar período" → esa campaña, del 2026-07-01 al 2026-07-07, impresiones `700`, clics `70`,
   gasto `14000`, clics a WhatsApp `9`. Guardar.
   Expected: la fila muestra gasto `$14.000`, clics `70`, clics a WhatsApp `9`, leads `0` y costo por
   lead `—`.
3. Cargar **el mismo rango** otra vez con gasto `20000`.
   Expected: el gasto queda en `$20.000`, no en `$34.000`. Es la regla de reemplazo funcionando.

- [ ] **Step 7: Commit**

```bash
git add "web/app/(app)/marketing/" web/components/marketing/form-periodo.tsx web/lib/pautas/datos.ts
git commit -m "Alta de campañas y carga manual de períodos"
```

---

## Task 9: Atribución de leads a campañas

**Files:**
- Modify: `web/components/workspace/new-lead-form.tsx`
- Modify: `web/app/(app)/empresas/[slug]/actions.ts`
- Modify: `web/app/(app)/empresas/[slug]/page.tsx`
- Modify: `web/lib/pautas/datos.ts`

**Interfaces:**
- Consumes: `Opcion` (Task 8).
- Produces: `getCampanasDeEmpresa(slug: string): Promise<Opcion[]>`; `createLead` acepta `campaignId`
  y `gclid`.

- [ ] **Step 1: Agregar el lector de campañas por empresa**

Al final de `web/lib/pautas/datos.ts`:

```ts
export async function getCampanasDeEmpresa(slug: string): Promise<Opcion[]> {
  const sb = await createClient();
  const { data: empresa } = await sb.from("companies").select("id").eq("slug", slug).single();
  if (!empresa) return [];
  const { data } = await sb
    .from("campaigns")
    .select("id,name,status")
    .eq("company_id", empresa.id)
    .in("status", ["activa", "pausada"]) // no ofrecemos borradores: todavía no pudieron generar leads
    .order("name");
  return (data ?? []).map((c) => ({ id: c.id as string, nombre: c.name as string }));
}
```

- [ ] **Step 2: Guardar la atribución en el alta**

En `web/app/(app)/empresas/[slug]/actions.ts`, dentro de `createLead`:

Después de la línea `const channel = ...`, agregar:

```ts
  const campaignId = String(formData.get("campaignId") ?? "");
  const gclid = String(formData.get("gclid") ?? "").trim();
```

Y en el objeto del `insert`, después de `channel,`:

```ts
    campaign_id: campaignId || null,
    gclid,
```

Al final de la función, agregar `revalidatePath("/marketing");` junto a los otros dos.

- [ ] **Step 3: Agregar los campos al formulario**

En `web/components/workspace/new-lead-form.tsx`:

1. Ampliar el tipo de props de `NewLeadButton`:

```tsx
export function NewLeadButton({ slug, stages, accent, campanas }: { slug: string; stages: StageOpt[]; accent: string; campanas: StageOpt[] }) {
```

`StageOpt` ya es `{ id: string; name: string }`, que es la forma que necesitamos. Reusarlo evita un
tipo nuevo idéntico.

2. Después del `<select name="stageId">` y antes de cerrar el `div` de campos, agregar:

```tsx
              {campanas.length > 0 && (
                <>
                  <select name="campaignId" style={field} defaultValue="">
                    <option value="">Sin pauta asociada</option>
                    {campanas.map((c) => (
                      <option key={c.id} value={c.id}>Pauta: {c.name}</option>
                    ))}
                  </select>
                  <input name="gclid" placeholder="gclid (si vino con el mensaje de WhatsApp)" style={field} />
                </>
              )}
```

Los campos sólo aparecen si la empresa tiene campañas activas; en las que no pautan, el formulario
queda igual que antes.

- [ ] **Step 4: Pasar las campañas desde la página de empresa**

En `web/app/(app)/empresas/[slug]/page.tsx`:

1. Agregar el import después de la línea 5:

```tsx
import { getCampanasDeEmpresa } from "@/lib/pautas/datos";
```

2. Reemplazar la línea 19:

```tsx
  const [leads, stages, campanas] = await Promise.all([getLeadsBySlug(slug), getStageOptions(slug), getCampanasDeEmpresa(slug)]);
```

3. Buscar el `<NewLeadButton` (más abajo en el archivo) y agregarle la prop, adaptando `nombre` a
   la forma `{ id, name }` que espera el componente:

```tsx
          campanas={campanas.map((c) => ({ id: c.id, name: c.nombre }))}
```

- [ ] **Step 5: Verificar que compila y probar**

Run: `cd web && npx tsc --noEmit`
Expected: sin errores.

En el navegador:
1. Poner en `activa` la campaña de Premoldeados (editar `status` desde el editor SQL de Supabase:
   `update campaigns set status = 'activa' where name like 'Search_Muros%';`).
2. Ir a `/empresas/premoldeados-ma` → "Nuevo lead" → completar y elegir la pauta. Guardar.
3. Ir a `/marketing`.
   Expected: la fila muestra ahora `Leads: 1` y un costo por lead igual al gasto cargado.

- [ ] **Step 6: Commit**

```bash
git add web/components/workspace/new-lead-form.tsx "web/app/(app)/empresas/" web/lib/pautas/datos.ts
git commit -m "Atribuir leads a campañas con selector y gclid"
```

---

## Task 10: Detalle de campaña

**Files:**
- Create: `web/app/(app)/marketing/[id]/page.tsx`

**Interfaces:**
- Consumes: `getCampana`, `DetalleCampana` (Task 5); `formatearPesos` (Task 2).
- Produces: ruta `/marketing/[id]`.

- [ ] **Step 1: Crear la página**

Crear `web/app/(app)/marketing/[id]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCampana } from "@/lib/pautas/datos";
import { formatearPesos } from "@/lib/pautas/metricas";

export const dynamic = "force-dynamic";

const panel: React.CSSProperties = {
  background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)",
  borderRadius: "var(--radius)", padding: 20,
};
const th: React.CSSProperties = { textAlign: "right", fontSize: 10.5, fontWeight: 700, letterSpacing: ".6px", textTransform: "uppercase", color: "var(--faint)", padding: "0 0 10px" };
const td: React.CSSProperties = { textAlign: "right", fontSize: 12.5, padding: "11px 0", borderTop: "1px solid var(--border)" };

export default async function DetalleCampanaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCampana(id);
  if (!c) notFound();

  const valorTotal = c.leads.reduce((s, l) => s + l.valor, 0);

  return (
    <div style={{ padding: "26px 30px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <Link href="/marketing" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>
          <ArrowLeft size={15} /> Volver a Pautas
        </Link>
        <h1 style={{ fontSize: 21, fontWeight: 780, letterSpacing: "-.5px", margin: 0 }}>{c.nombre}</h1>
        <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "5px 0 0" }}>
          {c.empresa} · {c.plataforma === "google" ? "Google Ads" : "Meta Ads"} · {c.estado} ·{" "}
          <span style={{ color: c.frescura.tono === "ambar" ? "var(--warn)" : "var(--faint)" }}>{c.frescura.etiqueta}</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14 }}>
        {[
          { label: "Gasto", valor: formatearPesos(c.totales.costo) },
          { label: "Clics", valor: String(c.totales.clics) },
          { label: "Clics a WhatsApp", valor: String(c.totales.clicsWhatsapp) },
          { label: "Leads", valor: String(c.leadsAtribuidos) },
          { label: "Costo por lead", valor: c.derivadas.costoPorLead === null ? "—" : formatearPesos(c.derivadas.costoPorLead) },
          { label: "Valor generado", valor: formatearPesos(valorTotal) },
        ].map((k) => (
          <div key={k.label} style={{ ...panel, padding: "15px 17px" }}>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{k.label}</div>
            <b className="tnum" style={{ fontSize: 20, fontWeight: 770, display: "block", marginTop: 6 }}>{k.valor}</b>
          </div>
        ))}
      </div>

      <div style={panel}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Períodos cargados</div>
        {c.periodos.length === 0 ? (
          <div style={{ color: "var(--faint)", fontSize: 13, padding: "16px 0" }}>Todavía no hay métricas cargadas.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead><tr>
                <th style={{ ...th, textAlign: "left" }}>Período</th>
                <th style={th}>Impresiones</th><th style={th}>Clics</th>
                <th style={th}>Clics a WhatsApp</th><th style={th}>Gasto</th>
              </tr></thead>
              <tbody>
                {c.periodos.map((p) => (
                  <tr key={p.id}>
                    <td style={{ ...td, textAlign: "left" }}>
                      {p.desde === p.hasta ? p.desde : `${p.desde} → ${p.hasta}`}
                      <span style={{ marginLeft: 9, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: p.origen === "sync" ? "rgba(45,212,191,.15)" : "rgba(255,255,255,.07)", color: p.origen === "sync" ? "#2dd4bf" : "var(--faint)" }}>
                        {p.origen === "sync" ? "automático" : "manual"}
                      </span>
                    </td>
                    <td style={td}>{p.impresiones}</td>
                    <td style={td}>{p.clics}</td>
                    <td style={td}>{p.clicsWhatsapp}</td>
                    <td style={td}>{formatearPesos(p.costo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={panel}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "var(--muted)", marginBottom: 14 }}>Leads atribuidos</div>
        {c.leads.length === 0 ? (
          <div style={{ color: "var(--faint)", fontSize: 13, padding: "16px 0" }}>
            Ningún lead cargado apunta todavía a esta campaña.
          </div>
        ) : (
          c.leads.map((l, i) => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
              <b style={{ fontSize: 13, fontWeight: 620, flex: 1, minWidth: 0 }}>{l.nombre}</b>
              {l.gclid && <span style={{ fontSize: 10, color: "var(--faint)", fontFamily: "monospace" }}>{l.gclid.slice(0, 12)}…</span>}
              <b className="tnum" style={{ fontSize: 13 }}>{formatearPesos(l.valor)}</b>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar en el navegador**

Desde `/marketing`, clickear la campaña.
Expected: seis KPIs, la tabla de períodos con el chip "manual", y el lead cargado en Task 9 en la
lista de atribuidos.

- [ ] **Step 3: Commit**

```bash
git add "web/app/(app)/marketing/[id]/page.tsx"
git commit -m "Detalle de campaña con períodos y leads atribuidos"
```

---

## Task 11: Script de sincronización

Cierra el circuito automático. Claude consulta el MCP de Supermetrics, escribe un JSON y este script
lo carga. La app nunca llama al MCP.

**Files:**
- Create: `web/scripts/sync-pautas.ts`
- Modify: `web/package.json`

**Interfaces:**
- Consumes: `db`, `campaignMetrics`, `campaigns` (Task 1); `seSolapan` (Task 3).
- Produces: comando `npm run sync:pautas -- <ruta-al-json>`.

- [ ] **Step 1: Escribir el script**

Crear `web/scripts/sync-pautas.ts`. Sigue el patrón de `lib/db/seed.ts`: carga `.env.local` antes de
importar `db`.

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "node:fs";
import { and, eq, lte, gte } from "drizzle-orm";
import { db } from "../lib/db/index";
import { campaignMetrics, campaigns } from "../lib/db/schema";

/**
 * Formato del JSON de entrada. `externalId` es el ID de la campaña en la
 * plataforma; si no matchea ninguna fila, se usa `nombre` como respaldo.
 *
 * [
 *   { "externalId": "123", "nombre": "Search_Muros…", "fecha": "2026-07-20",
 *     "impresiones": 120, "clics": 11, "costo": 2000, "clicsWhatsapp": 1 }
 * ]
 */
type FilaSync = {
  externalId?: string;
  nombre?: string;
  fecha: string;
  impresiones: number;
  clics: number;
  costo: number;
  clicsWhatsapp: number;
};

async function main() {
  const ruta = process.argv[2];
  if (!ruta) {
    console.error("Uso: npm run sync:pautas -- <ruta-al-json>");
    process.exit(1);
  }

  const filas = JSON.parse(readFileSync(ruta, "utf8")) as FilaSync[];
  const todas = await db.select({ id: campaigns.id, externalId: campaigns.externalId, name: campaigns.name }).from(campaigns);

  let escritas = 0;
  let omitidas = 0;

  for (const f of filas) {
    const campana = todas.find((c) => (f.externalId && c.externalId === f.externalId) || c.name === f.nombre);
    if (!campana) {
      console.warn(`  ⚠ sin campaña para ${f.externalId ?? f.nombre} — fila omitida`);
      omitidas++;
      continue;
    }

    // El dato automático manda: borramos cualquier fila de este día,
    // manual o de un sync anterior, antes de escribir.
    await db.delete(campaignMetrics).where(
      and(
        eq(campaignMetrics.campaignId, campana.id),
        lte(campaignMetrics.periodStart, f.fecha),
        gte(campaignMetrics.periodEnd, f.fecha),
      ),
    );

    await db.insert(campaignMetrics).values({
      campaignId: campana.id,
      periodStart: f.fecha,
      periodEnd: f.fecha,
      source: "sync",
      impressions: f.impresiones,
      clicks: f.clics,
      cost: String(f.costo),
      conversions: f.clicsWhatsapp,
    });
    escritas++;
  }

  console.log(`Sync de pautas: ${escritas} filas escritas, ${omitidas} omitidas.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

**Ojo con el borrado:** elimina cualquier tramo que *contenga* esa fecha, incluido un tramo manual
de una semana entera. Es intencional —evita el doble conteo— pero significa que un día de sync
puede borrar una semana cargada a mano. Por eso `periodosVigentes` (Task 3) sigue siendo la red de
seguridad en lectura: aunque el borrado quede a medias, los totales nunca duplican.

- [ ] **Step 2: Agregar el script a package.json**

En `web/package.json`, dentro de `"scripts"`, después de `"db:seed"`:

```json
    "sync:pautas": "tsx scripts/sync-pautas.ts",
```

- [ ] **Step 3: Probar con un JSON de ejemplo**

Crear un archivo temporal fuera del repo (por ejemplo en el scratchpad) con:

```json
[
  { "nombre": "Search_Muros-Premoldeados_Zona-Oeste", "fecha": "2026-07-20", "impresiones": 120, "clics": 11, "costo": 2000, "clicsWhatsapp": 1 },
  { "nombre": "Search_Muros-Premoldeados_Zona-Oeste", "fecha": "2026-07-21", "impresiones": 140, "clics": 13, "costo": 2000, "clicsWhatsapp": 2 }
]
```

Run: `cd web && npm run sync:pautas -- <ruta-al-json>`
Expected: `Sync de pautas: 2 filas escritas, 0 omitidas.`

Después abrir `/marketing/<id>`.
Expected: dos filas nuevas con el chip "automático", y el gasto total sumando esos $4.000.

- [ ] **Step 4: Probar que el sync gana sobre lo manual**

Cargar a mano por la interfaz el período 2026-07-20 → 2026-07-26 con gasto `50000`. Volver a correr
el sync con el mismo JSON.
Expected: en el detalle quedan sólo las filas automáticas, y el gasto total NO incluye los $50.000.
Es la regla de solapamiento funcionando de punta a punta.

- [ ] **Step 5: Commit**

```bash
git add web/scripts/sync-pautas.ts web/package.json
git commit -m "Script de sincronización de métricas desde JSON"
```

---

## Task 12: Verificación final

- [ ] **Step 1: Suite completa**

Run: `cd web && npm test`
Expected: PASS — pautas y seo-local.

- [ ] **Step 2: Tipos y lint**

Run: `cd web && npx tsc --noEmit && npm run lint`
Expected: sin errores.

- [ ] **Step 3: Build de producción**

Run: `cd web && npm run build`
Expected: build exitoso, con `/marketing` y `/marketing/[id]` en la lista de rutas.

- [ ] **Step 4: Repaso en el navegador**

Recorrer `/dashboard` (card con datos), `/marketing` (KPIs y tabla), `/marketing/<id>` (períodos y
leads). Revisar la consola: sin errores.

- [ ] **Step 5: Commit final si algo quedó suelto**

```bash
git add -A web/
git commit -m "Ajustes finales del módulo de pautas"
```

---

## Fuera de alcance de este plan

**Dos requisitos del spec que este plan NO cubre, a decisión consciente:**

- **Selector de rango de fechas en `/marketing`.** Los KPIs quedan fijos al mes en curso. El
  selector obliga a meter estado en la URL y a parametrizar todas las lecturas de `datos.ts`; con
  una campaña corriendo no paga ese costo. Cuando haya varias campañas y meses de historia, es una
  tarea acotada: pasar un rango como parámetro a `getCampanas` y `getResumenPautas`, que ya reciben
  `ahora`.
- **Gráfico de inversión en el tiempo dentro de `/marketing`.** El sparkline de la card del
  dashboard cubre la necesidad de "ver la tendencia" en la primera versión. Un gráfico grande con
  ejes y tooltip es trabajo propio y depende del selector de rango para ser útil.

Ambos están en el spec y hay que sacarlos de ahí o marcarlos como diferidos cuando se implementen.

Registrado en el spec, no se implementa acá: contenido orgánico, bloque de campañas en
`/empresas/[slug]`, reemplazo de los stat cards demo del dashboard, ajuste por inflación, y activar
RLS (pendiente global previo al deploy). El tracking de `gclid` en el sitio de Premoldeados va en
sesión aparte; sin él, el campo `gclid` se completa a mano y el selector de campaña es el mecanismo
principal de atribución.
