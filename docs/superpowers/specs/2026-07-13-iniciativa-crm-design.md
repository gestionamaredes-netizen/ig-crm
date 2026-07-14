# Iniciativa CRM — Documento de diseño

**Fecha:** 2026-07-13
**Estado:** Aprobado (diseño). Pendiente: plan de implementación.
**Autor:** Gestión MA + Claude

---

## 1. Objetivo

Construir un CRM propio, online, para gestionar 4 negocios de Iniciativa Global
en un solo lugar: verlos de un vistazo y, dentro de cada uno, llevar su embudo
de clientes/leads y ventas.

Nace de la idea del video "Claude Design + Claude Code = CRM": un panel a medida,
sin depender de plataformas de terceros como Kommo.

## 2. Alcance

### Negocios incluidos (4)
1. **Premoldeados MA** — construcción / premoldeados
2. **Gestiones MA** — servicios financieros
3. **Nypro Imports** — e-commerce de tecnología
4. **Dollar Drop** — cambio / cripto (**en desarrollo**, pre-lanzamiento)

### Dos niveles de uso
- **Nivel general (Dashboard):** los 4 negocios de un vistazo — KPIs combinados,
  embudo combinado, tarjetas por negocio, tareas de hoy y actividad reciente.
- **Nivel negocio:** al entrar a un negocio, su propio embudo (kanban) de
  leads/clientes, sus KPIs propios, sus cuentas vinculadas y sus tareas.

### Decisiones de diseño confirmadas
- **Etapas de embudo configurables por negocio:** cada negocio define y ordena
  sus propias etapas (no una lista fija global).
- **Online con base de datos:** accesible desde el celular o cualquier lado.
- **Login:** email/contraseña; solo usuarios autorizados.
- **Cuentas vinculadas (Fase 1):** enlaces + estado (vinculada / sin vincular),
  no bandeja de mensajes en vivo.

## 3. Fuera de alcance (No-goals)

- **Bandeja unificada de IG/WhatsApp en vivo** → **Fase 2** (requiere API de
  Meta y verificación de negocio).
- **Integración con Kommo u otro CRM externo.** Descartado: construimos propio.
  Kommo quedaría, como mucho, como opción paga para la bandeja de Fase 2.
- Facturación/contabilidad formal, firma de comprobantes, multi-idioma.

## 4. Stack técnico

Mismo mundo que el sitio existente `GESTIONES MA/web`, para consistencia:

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilos:** Tailwind CSS 4 + shadcn/ui + framer-motion + lucide-react
- **Base de datos:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (email/password)
- **ORM / acceso a datos:** Drizzle ORM sobre Postgres
- **Deploy:** Vercel
- **Tema:** oscuro con acentos dorados (identidad Iniciativa Global), con modo claro

> **Setup manual del usuario:** la cuenta de Supabase y sus claves las crea el
> usuario (Claude no crea cuentas ni carga contraseñas). Claude guía el paso a paso
> y consume las claves vía variables de entorno (`.env.local` / Vercel).

## 5. Arquitectura

```
Next.js (Vercel)
├── App Router
│   ├── (auth)/login              → pantalla de login (Supabase Auth)
│   ├── (app)/dashboard           → panel general (4 negocios)
│   ├── (app)/negocios/[id]       → vista de negocio (kanban + KPIs)
│   ├── (app)/negocios/[id]/config→ editar negocio, etapas, cuentas
│   ├── (app)/tareas              → tareas globales
│   └── api/… (Route Handlers)    → mutaciones server-side
├── lib/db (Drizzle + schema)     → conexión y esquema
├── lib/auth                      → helpers de sesión / guard
└── components/ (shadcn + propios)→ cards, kanban, KPIs, etc.
```

- **Datos:** los reads/writes van a Postgres (Supabase) vía Drizzle, desde Server
  Components y Route Handlers/Server Actions. Middleware protege las rutas `(app)`.
- **Estado del kanban:** drag & drop en cliente; al soltar, se persiste la nueva
  etapa/orden vía Server Action.

## 6. Modelo de datos (tablas)

- **businesses** — `id, nombre, categoria, color, iniciales, estado(activo|desarrollo|pausado), created_at`
- **stages** — `id, business_id(FK), nombre, color, orden` — *etapas propias por negocio*
- **leads** — `id, business_id(FK), stage_id(FK), nombre, valor(numeric), canal(ig|wa|web|otro), notas, created_at, updated_at`
- **contacts** — `id, business_id(FK), lead_id(FK nullable), nombre, telefono, email, notas`
- **tasks** — `id, business_id(FK nullable), lead_id(FK nullable), titulo, vence_at, done(bool), etiqueta`
- **accounts** — `id, business_id(FK), tipo(ig|wa|web), url, vinculada(bool)` — *Fase 1: enlaces + estado*
- **activity** — `id, business_id(FK), texto, tipo, created_at` — *log automático*
- **app_users** — gestionados por Supabase Auth (tabla auth.users); acceso a todos los negocios.

Relaciones clave: un **negocio** tiene muchas **etapas**, **leads**, **contactos**,
**tareas**, **cuentas** y **actividad**. Un **lead** pertenece a una **etapa** de su negocio.

## 7. Flujos principales

1. **Login** → sesión Supabase → redirect a Dashboard.
2. **Dashboard** → tarjetas de los 4 negocios + embudo combinado + tareas de hoy.
3. **Entrar a un negocio** → kanban con sus etapas propias; arrastrar leads entre
   etapas persiste el cambio y agrega actividad.
4. **Nuevo lead** → formulario (nombre, valor, canal, etapa) → aparece en el kanban.
5. **Configurar negocio** → editar datos, agregar/reordenar/renombrar etapas,
   cargar enlaces de cuentas (IG/WhatsApp/Web).
6. **Tareas** → crear/completar, ligadas a negocio o lead, con vencimiento.

## 8. Errores y casos borde

- Sin conexión a DB → pantalla de error clara con reintento (no pantalla en blanco).
- Negocio "en desarrollo" (Dollar Drop) → embudo permitido pero con estado especial.
- Borrar una etapa con leads → pedir mover esos leads a otra etapa antes de borrar.
- Validación de formularios (nombre requerido, valor numérico) del lado servidor.

## 9. Verificación (no hay suite de tests aún)

Igual que `GESTIONES MA/web`: verificar con `npm run build` + `npm run lint` y
probando en el navegador los flujos clave (login, crear lead, mover en kanban,
configurar etapas). Se puede sumar tests más adelante.

## 10. Fases

- **Fase 1 (este proyecto):** todo lo descrito arriba, online y funcionando.
  Cuentas = enlaces + estado. Carga de leads manual (con vista mobile).
- **Fase 2 (futuro):** bandeja de IG/WhatsApp en vivo vía API de Meta, para que
  los mensajes entren solos como leads. Posible integración de Telegram (ya existe
  un puente Telegram del usuario).

## 11. Costos

Arranque **gratuito**: Supabase (free tier) + Vercel (hobby) cubren este uso.
Costos solo si el volumen crece de forma significativa.

## 12. Preguntas abiertas

- ¿Nombres/colores definitivos por negocio? (se pueden ajustar en configuración).
- ¿Cantidad de usuarios que van a entrar además del admin? (afecta solo textos, no
  el modelo).
