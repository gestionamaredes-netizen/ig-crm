-- Módulo Cambio — personas (emisores / receptores)
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb),
-- con el editor VACÍO antes de pegar. Es idempotente.

-- Personas que actúan como emisor o receptor. Una misma persona puede ser
-- ambos, por eso es una sola tabla. En exchange_ops el emisor/receptor se
-- sigue guardando como TEXTO; esta tabla solo alimenta el buscador del alta.
create table if not exists exchange_people (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists exchange_people_name_idx
  on exchange_people(company_id, lower(name));

alter table exchange_people enable row level security;

drop policy if exists "auth_all_exchange_people" on exchange_people;
create policy "auth_all_exchange_people" on exchange_people
  for all to authenticated using (true) with check (true);

-- Verificación: debe devolver una fila con rowsecurity = true.
select tablename, rowsecurity from pg_tables where tablename = 'exchange_people';
