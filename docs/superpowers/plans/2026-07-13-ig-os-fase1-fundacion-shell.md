# IG OS — Fase 1, Plan 1: Fundación y Shell premium — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Levantar el proyecto Next.js de IG OS con el branding exacto de Iniciativa Global y un shell navegable (dashboard global + workspaces por empresa + panel IG AI), alimentado por datos locales — sin base de datos todavía.

**Architecture:** App Router de Next.js 16 con componentes React. Los datos de las 4 empresas y del embudo viven en archivos TypeScript (`lib/`) como fuente única; las páginas los renderizan. El acento de color cambia por workspace vía CSS variables. Todo el estilo sale de tokens CSS derivados del branding oficial. Este plan produce una app browseable que replica el mockup aprobado, lista para que el Plan 2 le conecte Supabase.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui · framer-motion · lucide-react.

## Global Constraints

- **Next.js 16 tiene cambios que rompen respecto a versiones previas.** Antes de escribir código de framework, leer la guía relevante en `web/node_modules/next/dist/docs/` (igual que exige `GESTIONES MA/web/AGENTS.md`). Heed deprecation notices.
- **Sin suite de tests** (convención del repo hermano `GESTIONES MA/web`): la verificación de cada task es `npm run build` + `npm run lint` + chequeo en el navegador. No inventar frameworks de test.
- **Ubicación del proyecto:** todo el código vive en `IG OS/web/` (mismo patrón que `GESTIONES MA/web`).
- **Branding (valores verbatim, no aproximar):**
  - Fondo `#0B0B0D` · Cards `#17181C` · Bordes `rgba(255,255,255,.06)` · Hover `rgba(255,255,255,.04)`
  - Gradiente principal `linear-gradient(120deg,#5E5CE6,#B14BFF 42%,#FF6B6B 74%,#FF9966)`
  - Tipografía objetivo: Inter / SF Pro Display (con fallback de sistema).
  - Tema oscuro como identidad. Glassmorphism sutil, blur, sombras suaves, microinteracciones. Nada recargado.
- **Acentos por empresa:** NYPRO `#3B82F6` (azul) · Gestiones MA `#D9A84E` (dorado) · Premoldeados MA `#B8BDC4` (gris cemento) · Dollar Drop `#8A8F98` (gris, en desarrollo).
- **Idioma de la UI:** español. Copy en voz activa, nombres que la persona reconoce.
- **Commits frecuentes**, uno por task como mínimo. Firmar con `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

## File Structure

```
IG OS/web/
├── app/
│   ├── layout.tsx                 # root layout: fuentes, <body>, tema oscuro
│   ├── globals.css                # tokens de branding + reset
│   ├── page.tsx                   # redirect a /dashboard
│   ├── (app)/
│   │   ├── layout.tsx             # shell: Sidebar + Topbar + IG AI, envuelve páginas
│   │   ├── dashboard/page.tsx     # dashboard global
│   │   └── empresas/[slug]/page.tsx  # workspace por empresa
├── components/
│   ├── shell/sidebar.tsx
│   ├── shell/topbar.tsx
│   ├── shell/ambient-glow.tsx
│   ├── shell/ig-ai-panel.tsx
│   ├── dashboard/big-stat.tsx
│   ├── dashboard/company-card.tsx
│   ├── dashboard/activity-list.tsx
│   ├── dashboard/task-list.tsx
│   ├── dashboard/mini-calendar.tsx
│   └── workspace/funnel-board.tsx
├── lib/
│   ├── companies.ts               # datos de las 4 empresas (fuente única)
│   ├── modules.ts                 # módulos habilitados por empresa
│   ├── funnel.ts                  # etapas del embudo + leads de ejemplo
│   ├── dashboard-data.ts          # cards, actividad, tareas, eventos
│   └── utils.ts                   # cn() helper (clsx + tailwind-merge)
└── (config: package.json, tsconfig.json, next.config, postcss, tailwind, eslint)
```

---

### Task 1: Scaffold del proyecto Next.js

**Files:**
- Create: `IG OS/web/` (proyecto completo vía CLI)

- [ ] **Step 1: Crear la app**

Desde `IG OS/`:
```bash
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --no-turbopack
```
Aceptar defaults. Esto crea `IG OS/web/` con Next.js 16, React 19, Tailwind 4.

- [ ] **Step 2: Leer la doc de Next 16 antes de tocar código**

```bash
ls web/node_modules/next/dist/docs/
```
Abrir la guía de App Router y de `app/layout.tsx`. Confirmar convenciones vigentes (metadata, fuentes, server/client components).

- [ ] **Step 3: Verificar que arranca**

Run: `cd web && npm run dev`
Expected: servidor en `http://localhost:3000`, página default de Next visible. Cortar con Ctrl+C.

- [ ] **Step 4: Commit**

```bash
cd "IG OS/web" && git rm -r --cached . >/dev/null 2>&1; cd .. && git add -A
git commit -m "Scaffold del proyecto Next.js de IG OS (web/)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
> Nota: el repo git ya existe en `IG OS/`. La app queda como subcarpeta `web/`.

---

### Task 2: Dependencias e utilidades base

**Files:**
- Modify: `IG OS/web/package.json`
- Create: `IG OS/web/lib/utils.ts`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` — merge de clases Tailwind, usado por todos los componentes.

- [ ] **Step 1: Instalar dependencias**

```bash
cd "IG OS/web"
npm install framer-motion lucide-react class-variance-authority clsx tailwind-merge
```

- [ ] **Step 2: Crear el helper `cn`**

Create `lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila sin errores (aún la página default).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Sumar dependencias de UI y helper cn()

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Sistema de branding (tokens + tema oscuro)

**Files:**
- Modify: `IG OS/web/app/globals.css`
- Modify: `IG OS/web/app/layout.tsx`

**Interfaces:**
- Produces: variables CSS globales `--bg, --card, --card-2, --glass, --border, --border-2, --hover, --text, --muted, --faint, --g1..--g4, --grad, --accent, --ok, --warn, --info, --radius` disponibles en toda la app. La variable `--accent` se sobreescribe por workspace (Task 7).

- [ ] **Step 1: Escribir los tokens en `globals.css`**

Reemplazar el contenido de `app/globals.css` por:
```css
@import "tailwindcss";

:root{
  --bg:#0B0B0D; --card:#17181C; --card-2:#1c1d23; --glass:rgba(23,24,28,.72);
  --border:rgba(255,255,255,.06); --border-2:rgba(255,255,255,.10); --hover:rgba(255,255,255,.04);
  --text:#F5F6F8; --muted:#9A9CA5; --faint:#63656E;
  --g1:#5E5CE6; --g2:#B14BFF; --g3:#FF6B6B; --g4:#FF9966;
  --accent:#7d7bf0; --ok:#4ade80; --warn:#f5b13c; --info:#5b9dff;
  --grad:linear-gradient(120deg,var(--g1),var(--g2) 42%,var(--g3) 74%,var(--g4));
  --radius:16px;
}
*{box-sizing:border-box;}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);}
body{
  font-family:"Inter","SF Pro Display",-apple-system,"Segoe UI",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;text-decoration:none;}
.tnum{font-variant-numeric:tabular-nums;}
.gt{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;}
::-webkit-scrollbar{width:9px;height:9px;}
::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:8px;}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;}}
```

- [ ] **Step 2: Ajustar el root layout**

Reemplazar `app/layout.tsx` por:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IG OS — Iniciativa Global",
  description: "Centro de operaciones de Iniciativa Global",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Redirect de la home a dashboard**

Reemplazar `app/page.tsx` por:
```tsx
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 4: Verificar**

Run: `npm run build && npm run lint`
Expected: compila y lint OK. `npm run dev` → entrar a `/` redirige a `/dashboard` (404 por ahora, esperado).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Sistema de branding IG OS: tokens, tema oscuro, gradiente

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Datos de empresas, módulos y embudo (fuente única)

**Files:**
- Create: `IG OS/web/lib/companies.ts`
- Create: `IG OS/web/lib/funnel.ts`
- Create: `IG OS/web/lib/dashboard-data.ts`

**Interfaces:**
- Produces:
  - `type Company = { slug: string; name: string; category: string; init: string; color: string; grad: string; status: "activo"|"desarrollo"; statusLabel: string; stats: [string,string][]; kpis: [string,string][]; modules: string[] }`
  - `companies: Company[]` y `getCompany(slug: string): Company | undefined`
  - `type Stage = { key: string; label: string; color: string }`; `funnelStages: Stage[]`
  - `type Lead = { stage: string; name: string; desc: string; value: string; who: string }`; `leadsByCompany: Record<string, Lead[]>`
  - `bigStats: { label:string; value:string; delta:string; tone:"up"|"down"|"flat"; hero?:boolean }[]`
  - `activity: { color:string; company:string; text:string; when:string }[]`
  - `tasks: { title:string; meta:string; done:boolean }[]`
  - `calendarDays: { d:string; n:string; today?:boolean }[]`, `calendarEvents: string[]`

- [ ] **Step 1: Crear `lib/companies.ts`**

```ts
export type Company = {
  slug: string; name: string; category: string; init: string;
  color: string; grad: string; status: "activo" | "desarrollo"; statusLabel: string;
  stats: [string, string][]; kpis: [string, string][]; modules: string[];
};

export const companies: Company[] = [
  {
    slug: "nypro", name: "NYPRO IMPORTS", category: "E-commerce · tecnología", init: "NY",
    color: "#3B82F6", grad: "linear-gradient(140deg,#3B82F6,#1e5fd0)", status: "activo", statusLabel: "Activo",
    stats: [["37", "Pedidos mes"], ["$0.9M", "Ventas"]],
    kpis: [["37", "Pedidos del mes"], ["11", "Consultas abiertas"], ["$0.9M", "Ventas mes"], ["3.1%", "Conversión"]],
    modules: ["Dashboard", "Productos", "Pedidos", "Clientes", "WhatsApp", "Meta Ads", "Facturación", "Stock", "Importaciones", "Reportes", "IA Comercial"],
  },
  {
    slug: "gestiones", name: "Gestiones MA", category: "Servicios financieros", init: "GM",
    color: "#D9A84E", grad: "linear-gradient(140deg,#D9A84E,#a9791f)", status: "activo", statusLabel: "Activo",
    stats: [["24", "Clientes"], ["$8.2M", "Volumen"]],
    kpis: [["24", "Clientes activos"], ["63", "Operaciones mes"], ["$8.2M", "Volumen"], ["4.9★", "Reputación"]],
    modules: ["Dashboard", "Clientes", "Divisas", "Operaciones", "Documentación", "Importaciones", "Cobros", "Facturación", "Seguimiento", "IA Jurídica"],
  },
  {
    slug: "premoldeados", name: "Premoldeados MA", category: "Construcción · premoldeados", init: "PM",
    color: "#B8BDC4", grad: "linear-gradient(140deg,#c9ced4,#7d8288)", status: "activo", statusLabel: "Activo",
    stats: [["8", "Leads"], ["$1.9M", "Ventas"]],
    kpis: [["8", "Leads activos"], ["5", "Presupuestos"], ["$1.9M", "Ventas mes"], ["$475K", "Ticket prom."]],
    modules: ["Dashboard", "Obras", "Presupuestos", "Clientes", "Pedidos", "Producción", "Entregas", "Cobros", "Calendario", "Fotos"],
  },
  {
    slug: "dollardrop", name: "Dollar Drop", category: "Cambio · cripto · en desarrollo", init: "DD",
    color: "#8A8F98", grad: "linear-gradient(140deg,#9aa0a8,#5b6067)", status: "desarrollo", statusLabel: "En desarrollo",
    stats: [["12", "Waitlist"], ["—", "Pre-launch"]],
    kpis: [["12", "Lista de espera"], ["0", "Operaciones"], ["—", "Ventas"], ["Ago '26", "Lanzamiento"]],
    modules: ["Dashboard", "Mystery Box", "USDT", "Usuarios", "Transacciones", "Wallet", "Recompensas", "Analytics"],
  },
];

export function getCompany(slug: string): Company | undefined {
  return companies.find((c) => c.slug === slug);
}
```

- [ ] **Step 2: Crear `lib/funnel.ts`**

```ts
export type Stage = { key: string; label: string; color: string };
export type Lead = { stage: string; name: string; desc: string; value: string; who: string };

export const funnelStages: Stage[] = [
  { key: "lead", label: "Lead", color: "#5b9dff" },
  { key: "contactado", label: "Contactado", color: "#7d7bf0" },
  { key: "reunion", label: "Reunión", color: "#B14BFF" },
  { key: "presupuesto", label: "Presupuesto", color: "#FF6B6B" },
  { key: "negociacion", label: "Negociación", color: "#FF9966" },
  { key: "cliente", label: "Cliente", color: "#4ade80" },
  { key: "postventa", label: "Postventa", color: "#2dd4bf" },
];

export const leadsByCompany: Record<string, Lead[]> = {
  nypro: [
    { stage: "lead", name: "Consulta iPhone 15", desc: "128GB stock/precio", value: "$1.1M", who: "JP" },
    { stage: "contactado", name: "Reserva notebook", desc: "Lenovo i5 — seña", value: "$950K", who: "MR" },
    { stage: "reunion", name: "Combo gamer corporativo", desc: "10 setups oficina", value: "$2.4M", who: "LT" },
    { stage: "presupuesto", name: "Mayorista accesorios", desc: "Fundas + cables x200", value: "$680K", who: "CG" },
    { stage: "negociacion", name: "Pedido AirPods x15", desc: "Revendedor", value: "$1.3M", who: "SA" },
    { stage: "cliente", name: "Pedido #1042", desc: "Powerful Pods x2", value: "$90K", who: "VE" },
    { stage: "postventa", name: "Cliente frecuente", desc: "Seguimiento garantía", value: "$140K", who: "DM" },
  ],
  gestiones: [
    { stage: "lead", name: "Cliente — compra USD", desc: "USD 3.000 blue", value: "$3.6M", who: "AR" },
    { stage: "contactado", name: "Cambio Euro", desc: "EUR 1.500", value: "$1.9M", who: "MB" },
    { stage: "reunion", name: "Empresa — venta oro", desc: "Onza + fracciones", value: "$4.2M", who: "EO" },
    { stage: "presupuesto", name: "Envío exterior", desc: "Transfer USDT", value: "$5.5M", who: "CE" },
    { stage: "negociacion", name: "Cartera mensual", desc: "Cliente corporativo", value: "$6.0M", who: "PP" },
    { stage: "cliente", name: "Operación USDT", desc: "Compra 4.000", value: "$4.9M", who: "US" },
    { stage: "postventa", name: "Cambio recurrente", desc: "Cliente mensual", value: "$2.0M", who: "RC" },
  ],
  premoldeados: [
    { stage: "lead", name: "Constructora del Sur", desc: "40 placas 6m", value: "$1.2M", who: "CS" },
    { stage: "contactado", name: "Vecino B° Norte", desc: "Muro perimetral", value: "$380K", who: "VN" },
    { stage: "reunion", name: "Loteo Las Lomas", desc: "Cordones cuneta", value: "$820K", who: "LL" },
    { stage: "presupuesto", name: "Municipalidad", desc: "Pavimento articulado", value: "$2.1M", who: "MU" },
    { stage: "negociacion", name: "Estudio Arq. Rossi", desc: "Viguetas + bloques", value: "$640K", who: "AR" },
    { stage: "cliente", name: "Obra Ruta 8", desc: "Alcantarillas H°", value: "$1.9M", who: "R8" },
  ],
  dollardrop: [
    { stage: "lead", name: "Interesado waitlist", desc: "Desde bio de IG", value: "—", who: "W1" },
    { stage: "contactado", name: "Beta tester", desc: "Probará la app", value: "—", who: "BT" },
  ],
};
```

- [ ] **Step 3: Crear `lib/dashboard-data.ts`**

```ts
export const bigStats = [
  { label: "Clientes", value: "96", delta: "▲ 8 esta semana", tone: "up" as const, hero: true },
  { label: "Facturación", value: "$4.7M", delta: "▲ 18% vs. mes", tone: "up" as const },
  { label: "Leads", value: "28", delta: "12 sin contactar", tone: "flat" as const },
  { label: "Conversión", value: "32%", delta: "▲ 4 pts", tone: "up" as const },
  { label: "Pendientes", value: "7", delta: "2 vencen hoy", tone: "down" as const },
];

export const activity = [
  { color: "#4ade80", company: "Gestiones MA", text: "cerró operación de USD 4.000", when: "Hace 1 h" },
  { color: "#3B82F6", company: "NYPRO IMPORTS", text: "nuevo pedido #1043 pagado", when: "Hace 3 h" },
  { color: "#B8BDC4", company: "Premoldeados MA", text: "presupuesto enviado a Municipalidad", when: "Hace 6 h" },
  { color: "#8A8F98", company: "Dollar Drop", text: "sumó 3 interesados a la waitlist", when: "Ayer" },
];

export const tasks = [
  { title: "Enviar presupuesto pavimento", meta: "Premoldeados · hoy", done: false },
  { title: "Confirmar operación USDT", meta: "Gestiones · hoy", done: false },
  { title: "Responder IG de NYPRO", meta: "6 sin leer", done: false },
  { title: "Actualizar cotización", meta: "recurrente", done: true },
];

export const calendarDays = [
  { d: "L", n: "7" }, { d: "M", n: "8" }, { d: "X", n: "9" }, { d: "J", n: "10" },
  { d: "V", n: "11" }, { d: "D", n: "13", today: true }, { d: "L", n: "14" },
];
export const calendarEvents = [
  "🟣 15:00 — Entrega Premoldeados (Ruta 8)",
  "🔵 17:30 — Reunión cliente NYPRO",
  "🟡 Mañana — Cierre operación USDT",
];
```

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sin errores de tipos.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Datos fuente de empresas, embudo y dashboard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Shell de la app (sidebar, topbar, glow, layout)

**Files:**
- Create: `IG OS/web/components/shell/ambient-glow.tsx`
- Create: `IG OS/web/components/shell/sidebar.tsx`
- Create: `IG OS/web/components/shell/topbar.tsx`
- Create: `IG OS/web/app/(app)/layout.tsx`

**Interfaces:**
- Consumes: `companies` de `lib/companies.ts`.
- Produces: `<Sidebar />`, `<Topbar title/>`, `<AmbientGlow />`, y el layout `(app)` que compone el shell alrededor de `children`.

- [ ] **Step 1: `AmbientGlow` (glows de fondo)**

Create `components/shell/ambient-glow.tsx`:
```tsx
export function AmbientGlow() {
  const base: React.CSSProperties = { position: "fixed", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none", zIndex: 0 };
  return (
    <>
      <div style={{ ...base, width: 520, height: 520, background: "var(--g1)", top: -160, left: 120, opacity: 0.16 }} />
      <div style={{ ...base, width: 440, height: 440, background: "var(--g2)", top: -80, right: 60, opacity: 0.13 }} />
      <div style={{ ...base, width: 520, height: 520, background: "var(--g3)", bottom: -260, right: 200, opacity: 0.1 }} />
    </>
  );
}
```

- [ ] **Step 2: `Sidebar` (client component, marca ruta activa)**

Create `components/shell/sidebar.tsx`:
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { companies } from "@/lib/companies";
import { LayoutDashboard, Users, TrendingUp, Megaphone, Wallet, Settings } from "lucide-react";

const globalNav = [
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/ventas", label: "Ventas", icon: TrendingUp },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
  { href: "/finanzas", label: "Finanzas", icon: Wallet },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/");
  return (
    <aside style={{ borderRight: "1px solid var(--border)", background: "rgba(13,13,15,.6)", backdropFilter: "blur(20px)", padding: "20px 14px", position: "sticky", top: 0, height: "100vh", display: "flex", flexDirection: "column", gap: 20, zIndex: 2 }}>
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 8px" }}>
        <span style={{ width: 36, height: 36, borderRadius: 11, background: "var(--grad)", display: "grid", placeItems: "center", color: "#fff", fontWeight: 800, fontSize: 14, letterSpacing: "-.5px", boxShadow: "0 6px 18px -6px rgba(177,75,255,.6)" }}>IG</span>
        <span><b style={{ fontSize: 15, fontWeight: 750, letterSpacing: "-.3px", display: "block" }}>IG&nbsp;OS</b><span style={{ fontSize: 10, color: "var(--faint)", letterSpacing: "1.6px", textTransform: "uppercase" }}>Iniciativa Global</span></span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <NavItem href="/dashboard" label="Dashboard" icon={LayoutDashboard} active={active("/dashboard")} />
        <Label>Empresas</Label>
        {companies.map((c) => {
          const href = `/empresas/${c.slug}`;
          return (
            <Link key={c.slug} href={href} className="nav-row" data-active={active(href)}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: c.color, flex: "none" }} />
              {c.name}
            </Link>
          );
        })}
        <Label>Global</Label>
        {globalNav.map((n) => <NavItem key={n.href} href={n.href} label={n.label} icon={n.icon} active={active(n.href)} />)}
      </nav>

      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--grad)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 750, color: "#fff" }}>F</span>
        <span><b style={{ fontSize: 12.5, display: "block" }}>Fabricio</b><span style={{ fontSize: 11, color: "var(--faint)" }}>Fundador · IG</span></span>
      </div>
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 9.5, letterSpacing: "1.4px", textTransform: "uppercase", color: "var(--faint)", padding: "8px 10px 4px" }}>{children}</span>;
}
function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
  return (
    <Link href={href} className="nav-row" data-active={active}>
      <Icon size={17} style={{ opacity: 0.85 }} /> {label}
    </Link>
  );
}
```

Agregar al final de `app/globals.css` los estilos de `.nav-row`:
```css
.nav-row{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:10px;color:var(--muted);font-size:13.5px;font-weight:500;transition:background .14s,color .14s;}
.nav-row:hover{background:var(--hover);color:var(--text);}
.nav-row[data-active="true"]{background:rgba(125,123,240,.14);color:#fff;font-weight:600;}
```

- [ ] **Step 3: `Topbar`**

Create `components/shell/topbar.tsx`:
```tsx
import { Search, Sparkles } from "lucide-react";

export function Topbar({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 6, display: "flex", alignItems: "center", gap: 14, padding: "18px 30px", background: "linear-gradient(180deg,rgba(11,11,13,.9),rgba(11,11,13,.55))", backdropFilter: "blur(14px)", borderBottom: "1px solid var(--border)" }}>
      {children}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: "9px 13px", width: 230, color: "var(--faint)", fontSize: 13 }}>
        <Search size={15} /> Buscar en IG OS…
      </div>
      <button style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--grad)", color: "#fff", border: "none", borderRadius: 11, padding: "10px 16px", fontSize: 13, fontWeight: 650, cursor: "pointer", boxShadow: "0 8px 22px -8px rgba(177,75,255,.55)" }}>
        <Sparkles size={15} /> IG&nbsp;AI
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Layout `(app)`**

Create `app/(app)/layout.tsx`:
```tsx
import { Sidebar } from "@/components/shell/sidebar";
import { AmbientGlow } from "@/components/shell/ambient-glow";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "236px 1fr", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <AmbientGlow />
      <Sidebar />
      <div style={{ position: "relative", zIndex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Verificar** (necesita la página de Task 6 para verse completa; por ahora build)

Run: `npm run build`
Expected: compila. (El dashboard llega en Task 6.)

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Shell de IG OS: sidebar, topbar y glow ambiental

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Dashboard global

**Files:**
- Create: `IG OS/web/components/dashboard/big-stat.tsx`
- Create: `IG OS/web/components/dashboard/company-card.tsx`
- Create: `IG OS/web/components/dashboard/activity-list.tsx`
- Create: `IG OS/web/components/dashboard/task-list.tsx`
- Create: `IG OS/web/components/dashboard/mini-calendar.tsx`
- Create: `IG OS/web/app/(app)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `companies`, `bigStats`, `activity`, `tasks`, `calendarDays`, `calendarEvents`.
- Produces: `<BigStat {...}/>`, `<CompanyCard company/>`, `<ActivityList/>`, `<TaskList/>`, `<MiniCalendar/>` y la ruta `/dashboard`.

- [ ] **Step 1: `BigStat`**

Create `components/dashboard/big-stat.tsx`:
```tsx
const tones: Record<string, string> = { up: "var(--ok)", down: "var(--g3)", flat: "var(--faint)" };

export function BigStat({ label, value, delta, tone, hero }: { label: string; value: string; delta: string; tone: "up" | "down" | "flat"; hero?: boolean }) {
  return (
    <div style={{ background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 18px 20px", position: "relative", overflow: "hidden" }}>
      {hero && <div style={{ position: "absolute", inset: 0, background: "var(--grad)", opacity: 0.09, pointerEvents: "none" }} />}
      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 30, fontWeight: 780, letterSpacing: "-1px", marginTop: 14 }}>{value}</div>
      <div style={{ fontSize: 11.5, marginTop: 6, color: tones[tone] }}>{delta}</div>
    </div>
  );
}
```

- [ ] **Step 2: `CompanyCard`**

Create `components/dashboard/company-card.tsx`:
```tsx
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Company } from "@/lib/companies";

export function CompanyCard({ company: c }: { company: Company }) {
  const pill = c.status === "activo"
    ? { background: "rgba(74,222,128,.13)", color: "var(--ok)" }
    : { background: "rgba(245,177,60,.14)", color: "var(--warn)" };
  return (
    <Link href={`/empresas/${c.slug}`} style={{ display: "block", background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 17, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, height: 3, width: "100%", background: c.grad }} />
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <span style={{ width: 38, height: 38, borderRadius: 10, background: c.grad, display: "grid", placeItems: "center", fontWeight: 750, fontSize: 13, color: "#fff", letterSpacing: "-.5px" }}>{c.init}</span>
        <span style={{ minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 680, letterSpacing: "-.2px", display: "block" }}>{c.name}</span>
          <span style={{ fontSize: 11, color: "var(--faint)" }}>{c.category}</span>
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, letterSpacing: ".3px", ...pill }}>{c.statusLabel}</span>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 15 }}>
        {c.stats.map(([v, l], i) => (
          <div key={i}><b className="tnum" style={{ fontSize: 16, fontWeight: 730, letterSpacing: "-.3px" }}>{v}</b><span style={{ fontSize: 10, color: "var(--faint)", display: "block", marginTop: 1 }}>{l}</span></div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 15, paddingTop: 13, borderTop: "1px solid var(--border)", fontSize: 11.5, color: "var(--faint)" }}>
        Entrar al workspace <ChevronRight size={13} style={{ marginLeft: "auto" }} />
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: `ActivityList`, `TaskList`, `MiniCalendar`**

Create `components/dashboard/activity-list.tsx`:
```tsx
import { activity } from "@/lib/dashboard-data";
export function ActivityList() {
  return (
    <div>
      {activity.map((a, i) => (
        <div key={i} style={{ display: "flex", gap: 11, padding: "11px 0", fontSize: 12.5, borderBottom: i < activity.length - 1 ? "1px solid var(--border)" : "none" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, flex: "none", background: a.color }} />
          <span style={{ color: "var(--muted)", lineHeight: 1.45 }}><b style={{ color: "var(--text)", fontWeight: 600 }}>{a.company}</b> {a.text}<span style={{ color: "var(--faint)", fontSize: 11, display: "block", marginTop: 1 }}>{a.when}</span></span>
        </div>
      ))}
    </div>
  );
}
```

Create `components/dashboard/task-list.tsx`:
```tsx
import { Check } from "lucide-react";
import { tasks } from "@/lib/dashboard-data";
export function TaskList() {
  return (
    <div>
      {tasks.map((t, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "10px 0", borderBottom: i < tasks.length - 1 ? "1px solid var(--border)" : "none" }}>
          <span style={{ width: 17, height: 17, borderRadius: 6, border: `1.6px solid ${t.done ? "var(--ok)" : "var(--faint)"}`, background: t.done ? "var(--ok)" : "transparent", flex: "none", marginTop: 1, display: "grid", placeItems: "center" }}>{t.done && <Check size={11} color="#07130b" strokeWidth={3} />}</span>
          <span><b style={{ fontSize: 12.5, fontWeight: 550, display: "block", textDecoration: t.done ? "line-through" : "none", color: t.done ? "var(--faint)" : "var(--text)" }}>{t.title}</b><span style={{ fontSize: 11, color: "var(--faint)" }}>{t.meta}</span></span>
        </div>
      ))}
    </div>
  );
}
```

Create `components/dashboard/mini-calendar.tsx`:
```tsx
import { calendarDays, calendarEvents } from "@/lib/dashboard-data";
export function MiniCalendar() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 6, marginBottom: 12 }}>
        {calendarDays.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, padding: "9px 0", borderRadius: 9, border: d.today ? "1px solid transparent" : "1px solid var(--border)", background: d.today ? "var(--grad)" : "transparent", color: d.today ? "#fff" : "var(--faint)", fontWeight: d.today ? 700 : 400 }}>{d.d}<br />{d.n}</div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.7 }}>
        {calendarEvents.map((e, i) => <div key={i}>{e}</div>)}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Página `/dashboard`**

Create `app/(app)/dashboard/page.tsx`:
```tsx
import { Topbar } from "@/components/shell/topbar";
import { BigStat } from "@/components/dashboard/big-stat";
import { CompanyCard } from "@/components/dashboard/company-card";
import { ActivityList } from "@/components/dashboard/activity-list";
import { TaskList } from "@/components/dashboard/task-list";
import { MiniCalendar } from "@/components/dashboard/mini-calendar";
import { companies } from "@/lib/companies";
import { bigStats } from "@/lib/dashboard-data";

const panel: React.CSSProperties = { background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18 };
const secH: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15 };
const h2: React.CSSProperties = { fontSize: 15, fontWeight: 720, margin: 0, letterSpacing: "-.2px" };

export default function DashboardPage() {
  return (
    <>
      <Topbar>
        <h1 style={{ fontSize: 19, fontWeight: 750, letterSpacing: "-.4px", margin: 0 }}>
          Bienvenido, Fabricio
          <small style={{ display: "block", fontSize: 12, color: "var(--faint)", fontWeight: 500, marginTop: 3 }}>4 empresas · 7 tareas hoy</small>
        </h1>
      </Topbar>
      <div style={{ padding: "26px 30px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
          {bigStats.map((s) => <BigStat key={s.label} {...s} />)}
        </div>

        <div>
          <div style={secH}><h2 style={h2}>Empresas</h2><span style={{ fontSize: 12, color: "var(--faint)" }}>Cada una es un workspace · clic para entrar →</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {companies.map((c) => <CompanyCard key={c.slug} company={c} />)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr .95fr .95fr", gap: 16, alignItems: "start" }}>
          <div style={panel}><div style={secH}><h2 style={h2}>Actividad reciente</h2></div><ActivityList /></div>
          <div style={panel}><div style={secH}><h2 style={h2}>Calendario</h2></div><MiniCalendar /></div>
          <div style={panel}><div style={secH}><h2 style={h2}>Tareas</h2></div><TaskList /></div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 5: Verificar en navegador**

Run: `npm run build && npm run dev`
Expected: `/dashboard` muestra el shell oscuro con sidebar, 5 cards enormes, las 4 empresas y los 3 paneles. Sin errores en consola.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "Dashboard global de IG OS con cards, empresas y paneles

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Workspace por empresa (acento dinámico + módulos + embudo)

**Files:**
- Create: `IG OS/web/components/workspace/funnel-board.tsx`
- Create: `IG OS/web/app/(app)/empresas/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getCompany`, `companies`, `funnelStages`, `leadsByCompany`.
- Produces: la ruta `/empresas/[slug]` con hero de empresa, tabs de módulos, KPIs propios y `<FunnelBoard leads/>`. El acento (`--accent`) se setea al color de la empresa en el contenedor de la página.

- [ ] **Step 1: `FunnelBoard`**

Create `components/workspace/funnel-board.tsx`:
```tsx
import { funnelStages, type Lead } from "@/lib/funnel";

export function FunnelBoard({ leads }: { leads: Lead[] }) {
  return (
    <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(184px,1fr)", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {funnelStages.map((st) => {
        const items = leads.filter((l) => l.stage === st.key);
        return (
          <div key={st.key} style={{ background: "rgba(255,255,255,.02)", border: "1px solid var(--border)", borderRadius: 14, padding: 11, minHeight: 150 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 4px 12px", fontSize: 11.5, fontWeight: 650, color: "var(--muted)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} />{st.label}
              <span style={{ marginLeft: "auto", fontSize: 10.5, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "0 7px", color: "var(--faint)" }}>{items.length}</span>
            </div>
            {items.length === 0 && <div style={{ fontSize: 10.5, color: "var(--faint)", padding: "6px 4px" }}>—</div>}
            {items.map((l, i) => (
              <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 11, padding: 11, marginBottom: 9 }}>
                <b style={{ fontSize: 12, fontWeight: 620, display: "block", letterSpacing: "-.1px" }}>{l.name}</b>
                <div style={{ fontSize: 10.5, color: "var(--faint)", marginTop: 3, lineHeight: 1.4 }}>{l.desc}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 9 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ok)" }}>{l.value}</span>
                  <span style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "var(--card-2)", border: "1px solid var(--border)", fontSize: 9, display: "grid", placeItems: "center", color: "var(--muted)", fontWeight: 700 }}>{l.who}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Página `/empresas/[slug]`**

Create `app/(app)/empresas/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Topbar } from "@/components/shell/topbar";
import { FunnelBoard } from "@/components/workspace/funnel-board";
import { getCompany, companies } from "@/lib/companies";
import { leadsByCompany } from "@/lib/funnel";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) notFound();
  const leads = leadsByCompany[slug] ?? [];
  const pill = c.status === "activo"
    ? { background: "rgba(74,222,128,.13)", color: "var(--ok)" }
    : { background: "rgba(245,177,60,.14)", color: "var(--warn)" };

  return (
    <div style={{ ["--accent" as string]: c.color }}>
      <Topbar>
        <div style={{ fontSize: 13, color: "var(--faint)", display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/dashboard" style={{ color: "var(--accent)" }}>Dashboard</Link> › <b style={{ color: "var(--text)", fontWeight: 650 }}>{c.name}</b>
        </div>
      </Topbar>

      <div style={{ padding: "26px 30px 90px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Hero */}
        <div style={{ display: "flex", alignItems: "center", gap: 15, background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: c.grad }} />
          <span style={{ width: 52, height: 52, borderRadius: 14, background: c.grad, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 770, color: "#fff", letterSpacing: "-.5px" }}>{c.init}</span>
          <div><span style={{ fontSize: 20, fontWeight: 750, letterSpacing: "-.4px", display: "block" }}>{c.name}</span><span style={{ fontSize: 12.5, color: "var(--muted)" }}>{c.category}</span></div>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, ...pill }}>{c.statusLabel}</span>
        </div>

        {/* Módulos */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
          {c.modules.map((m, i) => (
            <button key={m} style={{ whiteSpace: "nowrap", padding: "8px 14px", borderRadius: 10, fontSize: 12.5, fontWeight: 550, color: i === 0 ? "#fff" : "var(--muted)", border: i === 0 ? "1px solid transparent" : "1px solid var(--border)", background: i === 0 ? c.grad : "var(--card)", cursor: "pointer" }}>{m}</button>
          ))}
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {c.kpis.map(([v, l]) => (
            <div key={l} style={{ background: "var(--glass)", backdropFilter: "blur(16px)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "18px" }}>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{l}</div>
              <div className="tnum" style={{ fontSize: 26, fontWeight: 780, letterSpacing: "-.8px", marginTop: 10 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Embudo */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 15 }}>
            <h2 style={{ fontSize: 15, fontWeight: 720, margin: 0 }}>CRM Comercial — Embudo</h2>
            <span style={{ fontSize: 12, color: "var(--faint)" }}>drag &amp; drop llega en el Plan 3 →</span>
          </div>
          <FunnelBoard leads={leads} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verificar en navegador**

Run: `npm run build && npm run dev`
Expected: entrar a `/empresas/nypro` muestra hero azul, módulos de NYPRO, 4 KPIs y el embudo con leads. Probar `/empresas/gestiones` (dorado), `/empresas/premoldeados` (gris), `/empresas/dollardrop` (gris, "En desarrollo"). El link "Dashboard" del breadcrumb usa el color de acento de cada empresa. `/empresas/inexistente` → 404.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Workspace por empresa: acento dinámico, módulos y embudo

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Panel IG AI (maqueta interactiva)

**Files:**
- Create: `IG OS/web/components/shell/ig-ai-panel.tsx`
- Modify: `IG OS/web/app/(app)/layout.tsx` (montar el panel global)

**Interfaces:**
- Consumes: nada externo (respuestas de ejemplo internas).
- Produces: `<IgAiPanel />` — botón flotante + panel con preguntas de ejemplo y respuestas simuladas. Marcado claramente como maqueta; la IA real es Fase 4.

- [ ] **Step 1: `IgAiPanel` (client component)**

Create `components/shell/ig-ai-panel.tsx`:
```tsx
"use client";
import { useState } from "react";
import { Sparkles, X } from "lucide-react";

const answers: Record<string, string> = {
  "¿Qué cliente hace más de 30 días que no compra?": "3 clientes inactivos +30 días: Loteo Las Lomas (Premoldeados), Cliente USDT recurrente (Gestiones) y Mayorista accesorios (NYPRO).",
  "Generame una campaña para NYPRO": "Campaña \"Upgrade Tech Julio\": 3 piezas para IG + copy, retargeting 18-35. (maqueta — la IA real llega en Fase 4)",
  "Escribime un presupuesto para Gestiones MA": "Borrador: cambio USD 3.000 al blue del día, comisión incluida, validez 24 h. (maqueta)",
  "¿Cuántas ventas hubo este mes?": "$4.7M en las 4 empresas (▲18%).",
};
const suggestions = Object.keys(answers);

export function IgAiPanel() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<{ q: string; a: string }[]>([]);
  const ask = (q: string) => setLog((l) => [...l, { q, a: answers[q] ?? "Lo estoy pensando…" }]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ position: "fixed", right: 26, bottom: 26, zIndex: 30, display: "flex", alignItems: "center", gap: 9, background: "var(--grad)", color: "#fff", border: "none", borderRadius: 30, padding: "13px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 30px -8px rgba(177,75,255,.6)" }}>
        <Sparkles size={16} /> IG&nbsp;AI
      </button>
    );
  }
  return (
    <div style={{ position: "fixed", right: 26, bottom: 26, zIndex: 31, width: 360, maxWidth: "calc(100vw - 40px)", background: "var(--glass)", backdropFilter: "blur(24px)", border: "1px solid var(--border-2)", borderRadius: 20, boxShadow: "0 30px 70px -20px #000", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 17px", borderBottom: "1px solid var(--border)" }}>
        <span style={{ width: 28, height: 28, borderRadius: 9, background: "var(--grad)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, color: "#fff" }}>IG</span>
        <div><b style={{ fontSize: 13.5 }}>IG AI</b><span style={{ fontSize: 11, color: "var(--faint)", display: "block" }}>Asistente · maqueta (Fase 4)</span></div>
        <button onClick={() => setOpen(false)} style={{ marginLeft: "auto", color: "var(--faint)", background: "none", border: "none", cursor: "pointer" }}><X size={18} /></button>
      </div>
      <div style={{ padding: "15px 17px", maxHeight: 340, overflowY: "auto" }}>
        {log.length === 0 && <div style={{ fontSize: 11, color: "var(--faint)", marginBottom: 9, letterSpacing: ".3px", textTransform: "uppercase" }}>Probá preguntar</div>}
        {log.length === 0 && suggestions.map((s) => (
          <button key={s} onClick={() => ask(s)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)", borderRadius: 11, padding: "10px 12px", fontSize: 12.5, marginBottom: 8, cursor: "pointer" }}>{s}</button>
        ))}
        {log.map((e, i) => (
          <div key={i}>
            <div style={{ background: "rgba(125,123,240,.14)", border: "1px solid var(--border)", borderRadius: 13, borderTopRightRadius: 4, padding: "12px 13px", fontSize: 12.5, marginTop: 12, marginLeft: 30 }}>{e.q}</div>
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 13, borderTopLeftRadius: 4, padding: "12px 13px", fontSize: 12.5, lineHeight: 1.5, marginTop: 8 }}>{e.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Montar en el layout**

En `app/(app)/layout.tsx`, importar y renderizar `<IgAiPanel />` dentro del contenedor de contenido (después de `{children}`):
```tsx
import { IgAiPanel } from "@/components/shell/ig-ai-panel";
// …dentro del <div de contenido>:
//   {children}
//   <IgAiPanel />
```

- [ ] **Step 3: Verificar**

Run: `npm run build && npm run dev`
Expected: botón "IG AI" flotante abajo a la derecha; al abrir muestra las 4 preguntas; al tocar una aparece la respuesta simulada. Cerrar con la X.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Panel IG AI (maqueta) montado en el shell

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Responsive, pulido y verificación final

**Files:**
- Modify: `IG OS/web/app/globals.css` (media queries)

- [ ] **Step 1: Media queries para mobile/tablet**

Agregar al final de `app/globals.css`:
```css
@media(max-width:1100px){
  .ig-bigs{grid-template-columns:repeat(2,1fr)!important;}
  .ig-comps{grid-template-columns:repeat(2,1fr)!important;}
  .ig-grid3{grid-template-columns:1fr!important;}
}
@media(max-width:720px){
  .ig-shell{grid-template-columns:1fr!important;}
  .ig-side{display:none!important;}
}
```
Aplicar las clases `ig-bigs`, `ig-comps`, `ig-grid3` a los grids del dashboard; `ig-shell` al grid del layout `(app)` y `ig-side` al `<aside>` del sidebar (agregar `className` junto a los `style` existentes).

- [ ] **Step 2: Verificar responsive**

Run: `npm run dev`, abrir DevTools, alternar a viewport 375px.
Expected: el sidebar se oculta, las cards pasan a una columna, no hay scroll horizontal del body.

- [ ] **Step 3: Verificación final completa**

Run: `npm run build && npm run lint`
Expected: build exitoso, lint sin errores. Revisar en navegador: `/dashboard`, los 4 workspaces, IG AI, y que no haya errores en consola.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Responsive y pulido final de la Fase 1 — Plan 1

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review (hecha)

- **Cobertura de la spec (Fase 1, parte de fundación/shell):** branding exacto (Task 3) ✓, dashboard con cards enormes + empresas + actividad/calendario/tareas (Task 6) ✓, workspaces con acento dinámico y módulos por empresa (Task 7) ✓, embudo comercial de 7 etapas (Task 7) ✓, IG AI como maqueta (Task 8) ✓, responsive (Task 9) ✓.
  - **Fuera de este plan (van en planes siguientes de Fase 1):** autenticación y usuarios → **Plan 2**; persistencia real, alta de leads y drag & drop → **Plan 3**; CRUD de tareas y calendario → **Plan 4**. Este plan usa datos locales a propósito, para entregar algo browseable sin depender de Supabase.
- **Placeholders:** no hay pasos vagos; cada archivo tiene su código completo. Los textos "maqueta" en IG AI y "drag & drop llega en el Plan 3" son honestidad de alcance, no placeholders de implementación.
- **Consistencia de tipos:** `Company`, `Stage`, `Lead` se definen en `lib/` (Task 4) y se consumen con los mismos nombres/campos en Tasks 5–7. `getCompany` y `funnelStages`/`leadsByCompany` se usan igual que se declaran.

## Execution Handoff

Este plan es el **Plan 1 de la Fase 1**. Al terminarlo tendrás IG OS navegable con tu branding, listo para que el **Plan 2** le sume login + base de datos.
