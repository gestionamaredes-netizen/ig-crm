-- ============================================================
-- AQUA MAR · Esquema de la base de datos (Supabase / Postgres)
-- ============================================================
-- Cómo usarlo: en el proyecto de Supabase → SQL Editor →
-- pegar TODO este archivo → Run. Se puede correr más de una vez
-- sin romper nada (usa IF NOT EXISTS / OR REPLACE).
--
-- Seguridad: todas las tablas tienen RLS activado y solo dejan
-- leer/escribir a usuarios logueados (el equipo, creado desde
-- Authentication → Users). La anon key sola no accede a nada.
-- ============================================================

-- ---------- Clientes (minoristas y mayoristas) ----------
create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,
  ciudad text,
  provincia text,
  tipo text not null default 'retail' check (tipo in ('retail', 'wholesale')),
  empresa text,
  notas text,
  creado_en timestamptz not null default now()
);

-- ---------- Pedidos ----------
create table if not exists public.pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes (id) on delete cascade,
  producto text not null,
  presentacion text not null,
  cantidad integer,
  estado text not null default 'nuevo' check (estado in (
    'nuevo', 'contactado', 'presupuestado', 'esperando_confirmacion',
    'confirmado', 'preparando', 'despachado', 'entregado',
    'cancelado', 'sin_respuesta'
  )),
  provincia text,
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists pedidos_cliente_idx on public.pedidos (cliente_id);
create index if not exists pedidos_creado_idx on public.pedidos (creado_en desc);

-- ---------- Consultas mayoristas (pipeline) ----------
create table if not exists public.consultas_mayoristas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  empresa text,
  telefono text not null,
  ciudad text,
  provincia text,
  volumen_estimado text,
  estado text not null default 'nuevo' check (estado in (
    'nuevo', 'calificado', 'informacion_enviada', 'negociacion',
    'cliente', 'seguimiento', 'no_interesado'
  )),
  proximo_seguimiento date,
  notas text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index if not exists consultas_creado_idx
  on public.consultas_mayoristas (creado_en desc);

-- ---------- actualizado_en automático ----------
create or replace function public.tocar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists pedidos_tocar on public.pedidos;
create trigger pedidos_tocar
  before update on public.pedidos
  for each row execute function public.tocar_actualizado_en();

drop trigger if exists consultas_tocar on public.consultas_mayoristas;
create trigger consultas_tocar
  before update on public.consultas_mayoristas
  for each row execute function public.tocar_actualizado_en();

-- ---------- Seguridad: RLS solo para el equipo logueado ----------
alter table public.clientes enable row level security;
alter table public.pedidos enable row level security;
alter table public.consultas_mayoristas enable row level security;

drop policy if exists "equipo_clientes" on public.clientes;
create policy "equipo_clientes" on public.clientes
  for all to authenticated using (true) with check (true);

drop policy if exists "equipo_pedidos" on public.pedidos;
create policy "equipo_pedidos" on public.pedidos
  for all to authenticated using (true) with check (true);

drop policy if exists "equipo_consultas" on public.consultas_mayoristas;
create policy "equipo_consultas" on public.consultas_mayoristas
  for all to authenticated using (true) with check (true);
