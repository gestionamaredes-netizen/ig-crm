-- Celulares Operativos — módulo Cambio. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO antes de pegar. Idempotente.

-- 1. Teléfonos
create table if not exists phones (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  alias      text not null default '',
  model      text not null default '',
  runner_id  uuid references runners(id) on delete set null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists phones_company_idx on phones(company_id);

-- 2. Cuentas operativas de cada teléfono
create table if not exists phone_accounts (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  phone_id      uuid not null references phones(id) on delete cascade,
  holder_name   text not null default '',
  dni           text not null default '',
  cbu_pesos     text not null default '',
  alias_pesos   text not null default '',
  cbu_dolares   text not null default '',
  alias_dolares text not null default '',
  status        text not null default 'activa',   -- activa | bloqueada
  notes         text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists phone_accounts_phone_idx on phone_accounts(company_id, phone_id);

-- 3. RLS
alter table phones         enable row level security;
alter table phone_accounts enable row level security;
drop policy if exists "auth_all_phones" on phones;
create policy "auth_all_phones" on phones for all to authenticated using (true) with check (true);
drop policy if exists "auth_all_phone_accounts" on phone_accounts;
create policy "auth_all_phone_accounts" on phone_accounts for all to authenticated using (true) with check (true);

-- 4. Cuarto runner: Ale
insert into runners (company_id, name)
select c.id, 'Ale' from companies c where c.name ilike '%gestiones%ma%'
on conflict do nothing;

-- 5. Precarga de 18 teléfonos: Owen 5, Zurdo 5, Ale 8 (alias listo, modelo vacío).
--    Idempotente por `not exists` sobre el alias (no hay índice único en alias
--    porque los que crea el usuario pueden quedar sin alias).
insert into phones (company_id, alias, runner_id)
select r.company_id, v.alias, r.id
from runners r
join companies c on c.id = r.company_id
join (values
  ('Owen','Owen 1'),('Owen','Owen 2'),('Owen','Owen 3'),('Owen','Owen 4'),('Owen','Owen 5'),
  ('Zurdo','Zurdo 1'),('Zurdo','Zurdo 2'),('Zurdo','Zurdo 3'),('Zurdo','Zurdo 4'),('Zurdo','Zurdo 5'),
  ('Ale','Ale 1'),('Ale','Ale 2'),('Ale','Ale 3'),('Ale','Ale 4'),
  ('Ale','Ale 5'),('Ale','Ale 6'),('Ale','Ale 7'),('Ale','Ale 8')
) as v(runner, alias) on lower(r.name) = lower(v.runner)
where c.name ilike '%gestiones%ma%'
  and not exists (
    select 1 from phones p where p.company_id = r.company_id and lower(p.alias) = lower(v.alias)
  );

-- 6. Verificación
select tablename, rowsecurity from pg_tables where tablename in ('phones','phone_accounts');
-- 18 filas: 5 Owen, 5 Zurdo, 8 Ale.
select r.name as runner, count(*) from phones p
join runners r on r.id = p.runner_id
join companies c on c.id = p.company_id
where c.name ilike '%gestiones%ma%' group by r.name order by r.name;
