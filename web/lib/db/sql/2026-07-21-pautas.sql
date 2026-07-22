-- Módulo de seguimiento de pautas — esquema + datos iniciales
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb).
-- Es idempotente: se puede correr varias veces sin duplicar nada.

-- ---------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------

-- Cuentas publicitarias (una empresa puede tener varias)
create table if not exists ad_accounts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  platform      text not null,                       -- google | meta
  external_id   text not null default '',            -- ej. 2961244070
  name          text not null default '',
  currency      text not null default 'ARS',
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- Pautas / campañas
create table if not exists campaigns (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  ad_account_id  uuid not null references ad_accounts(id) on delete cascade,
  external_id    text not null default '',           -- vacío mientras es borrador
  name           text not null,
  objective      text not null default 'leads',      -- leads | trafico | ventas
  status         text not null default 'borrador',   -- borrador | activa | pausada | finalizada
  daily_budget   numeric not null default 0,
  started_at     timestamptz,
  ended_at       timestamptz,
  created_at     timestamptz not null default now()
);

-- Métricas por período. Cada fila cubre un rango: el sync escribe días sueltos,
-- la carga manual cubre semanas. Conviven en la misma tabla.
create table if not exists campaign_metrics (
  id           uuid primary key default gen_random_uuid(),
  campaign_id  uuid not null references campaigns(id) on delete cascade,
  period_start date not null,
  period_end   date not null,                        -- inclusivo
  source       text not null default 'manual',       -- manual | sync
  impressions  integer not null default 0,
  clicks       integer not null default 0,
  cost         numeric not null default 0,
  conversions  integer not null default 0,           -- lo que reporta la plataforma
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 2. Atribución en leads
-- ---------------------------------------------------------------

alter table leads add column if not exists campaign_id uuid references campaigns(id) on delete set null;
alter table leads add column if not exists gclid text not null default '';

-- ---------------------------------------------------------------
-- 3. Índices (el módulo filtra siempre por campaña)
-- ---------------------------------------------------------------

create index if not exists campaign_metrics_campaign_idx on campaign_metrics(campaign_id);
create index if not exists campaign_metrics_period_idx   on campaign_metrics(period_start, period_end);
create index if not exists leads_campaign_idx            on leads(campaign_id);

-- ---------------------------------------------------------------
-- 4. Datos reales de Premoldeados MA
-- ---------------------------------------------------------------

-- Cuenta de Google Ads
insert into ad_accounts (company_id, platform, external_id, name, currency, active)
select c.id, 'google', '2961244070', 'PREMOLDEADOS MA', 'ARS', true
from companies c
where c.slug = 'premoldeados'
  and not exists (select 1 from ad_accounts a where a.external_id = '2961244070');

-- Cuenta de Meta Ads
insert into ad_accounts (company_id, platform, external_id, name, currency, active)
select c.id, 'meta', '576563516950939', 'ma.premoldeados', 'ARS', true
from companies c
where c.slug = 'premoldeados'
  and not exists (select 1 from ad_accounts a where a.external_id = '576563516950939');

-- Campaña de Meta: publicada el 21/07/2026, corre 4 días
insert into campaigns (company_id, ad_account_id, external_id, name, objective, status, daily_budget, started_at, ended_at)
select a.company_id, a.id, '', 'Mensajes — Cierres premoldeados', 'leads', 'activa', 2972,
       '2026-07-21'::timestamptz, '2026-07-25'::timestamptz
from ad_accounts a
where a.external_id = '576563516950939'
  and not exists (select 1 from campaigns k where k.name = 'Mensajes — Cierres premoldeados');

-- Campaña de Google: todavía en borrador, esperando que se acredite el prepago
insert into campaigns (company_id, ad_account_id, external_id, name, objective, status, daily_budget)
select a.company_id, a.id, '', 'Search_Muros-Premoldeados_Zona-Oeste', 'leads', 'borrador', 2000
from ad_accounts a
where a.external_id = '2961244070'
  and not exists (select 1 from campaigns k where k.name = 'Search_Muros-Premoldeados_Zona-Oeste');

-- ---------------------------------------------------------------
-- 5. Verificación
-- ---------------------------------------------------------------

select k.name, k.status, k.daily_budget, a.platform, e.name as empresa
from campaigns k
join ad_accounts a on a.id = k.ad_account_id
join companies e on e.id = k.company_id
order by k.status, k.name;
