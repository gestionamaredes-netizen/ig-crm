-- Accesos por rol — módulo Cambio. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO antes de pegar. Idempotente.
-- PRE-REQUISITO: crear antes en Auth → Users (con Auto Confirm) los usuarios
--   marce@gestionesma.store, zurdo@gestionesma.store, ale@gestionesma.store.

-- 1. Perfil de cada usuario de la caja: su rol y, si es runner, a qué runner mapea.
create table if not exists perfiles_cambio (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  rol        text not null check (rol in ('admin','runner')),
  runner_id  uuid references runners(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2. Funciones para las políticas. SECURITY DEFINER + search_path fijo: leen
--    perfiles_cambio saltando su propia RLS, sin depender del search_path del
--    llamador. STABLE: no escriben.
create or replace function es_admin_cambio() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles_cambio p
    where p.user_id = auth.uid() and p.rol = 'admin'
  );
$$;

create or replace function mi_runner_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select runner_id from perfiles_cambio
  where user_id = auth.uid() and rol = 'runner';
$$;

-- 3. Políticas runner-scoped: el runner ve/edita SOLO lo suyo; el admin, todo.
alter table phones         enable row level security;
alter table phone_accounts enable row level security;

drop policy if exists "auth_all_phones" on phones;
drop policy if exists "cambio_phones" on phones;
create policy "cambio_phones" on phones for all to authenticated
  using (es_admin_cambio() or runner_id = mi_runner_id())
  with check (es_admin_cambio() or runner_id = mi_runner_id());

drop policy if exists "auth_all_phone_accounts" on phone_accounts;
drop policy if exists "cambio_phone_accounts" on phone_accounts;
create policy "cambio_phone_accounts" on phone_accounts for all to authenticated
  using (
    es_admin_cambio()
    or phone_id in (select id from phones where runner_id = mi_runner_id())
  )
  with check (
    es_admin_cambio()
    or phone_id in (select id from phones where runner_id = mi_runner_id())
  );

-- 4. runners y perfiles_cambio: el runner lee solo su propia fila.
drop policy if exists "auth_all_runners" on runners;
drop policy if exists "cambio_runners" on runners;
create policy "cambio_runners" on runners for all to authenticated
  using (es_admin_cambio() or id = mi_runner_id())
  with check (es_admin_cambio());

alter table perfiles_cambio enable row level security;
drop policy if exists "cambio_perfiles" on perfiles_cambio;
create policy "cambio_perfiles" on perfiles_cambio for all to authenticated
  using (es_admin_cambio() or user_id = auth.uid())
  with check (es_admin_cambio());

-- 5. Todo lo sensible: SOLO admins.
do $$
declare t text;
begin
  foreach t in array array[
    'exchange_clients','exchange_accounts','exchange_ops','exchange_people',
    'runner_accounts','runner_gestiones','runner_payments','cuentas',
    'cobros_clientes','cobros','cobros_costos','cobros_pagos'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "auth_all_%s" on %I', t, t);
    execute format('drop policy if exists "cambio_admin_%s" on %I', t, t);
    execute format(
      'create policy "cambio_admin_%s" on %I for all to authenticated using (es_admin_cambio()) with check (es_admin_cambio())',
      t, t);
  end loop;
end $$;

-- 6. Seed de perfiles. Admin = todos los que hoy ven todo (Capi, Marce y los
--    mails viejos/owner), para no cortarle el acceso a nadie. Runner = Zurdo, Ale.
--    Idempotente: on conflict actualiza rol/runner.
insert into perfiles_cambio (user_id, rol, runner_id)
select u.id, 'admin', null from auth.users u
where lower(u.email) in (
  'capi@gestionesma.store','marce@gestionesma.store','crm@gestionesma.store',
  'blackcrm25@gmail.com','gestionama.redes@gmail.com','gestionesma.redes@gmail.com',
  'ortegafaben@gmail.com','amablur.ok@gmail.com'
)
on conflict (user_id) do update set rol = excluded.rol, runner_id = excluded.runner_id;

insert into perfiles_cambio (user_id, rol, runner_id)
select u.id, 'runner',
  (select r.id from runners r join companies c on c.id = r.company_id
   where c.name ilike '%gestiones%ma%' and lower(r.name) = 'zurdo' limit 1)
from auth.users u where lower(u.email) = 'zurdo@gestionesma.store'
on conflict (user_id) do update set rol = excluded.rol, runner_id = excluded.runner_id;

insert into perfiles_cambio (user_id, rol, runner_id)
select u.id, 'runner',
  (select r.id from runners r join companies c on c.id = r.company_id
   where c.name ilike '%gestiones%ma%' and lower(r.name) = 'ale' limit 1)
from auth.users u where lower(u.email) = 'ale@gestionesma.store'
on conflict (user_id) do update set rol = excluded.rol, runner_id = excluded.runner_id;

-- 7. Verificación
select p.rol, u.email, r.name as runner
from perfiles_cambio p
join auth.users u on u.id = p.user_id
left join runners r on r.id = p.runner_id
order by p.rol, u.email;
-- Esperado: Zurdo y Ale como runner con su runner enganchado; el resto admin.
select tablename, rowsecurity from pg_tables
where tablename in ('phones','phone_accounts','perfiles_cambio','exchange_ops');

-- 8. (post-review) Comprobantes en Storage: cerrarlos a admins. Solo los admins
--    operan la caja y suben/ven recibos; un runner autenticado no debe poder
--    listar ni descargar comprobantes de operaciones ajenas. Reemplaza las
--    políticas abiertas de 2026-07-23-comprobantes.sql.
drop policy if exists "comprobantes_insert" on storage.objects;
create policy "comprobantes_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'comprobantes' and es_admin_cambio());

drop policy if exists "comprobantes_select" on storage.objects;
create policy "comprobantes_select" on storage.objects
  for select to authenticated using (bucket_id = 'comprobantes' and es_admin_cambio());

drop policy if exists "comprobantes_update" on storage.objects;
create policy "comprobantes_update" on storage.objects
  for update to authenticated using (bucket_id = 'comprobantes' and es_admin_cambio());

-- 9. (post-review) Tablas del CRM general: cerrarlas también a admins, para que
--    un runner autenticado no pueda leerlas por API. Todos los usuarios que hoy
--    ven el CRM están sembrados como admin, así que no pierden acceso; solo el
--    runner queda afuera. Reemplaza las políticas abiertas de pautas/gastos.
do $$
declare t text;
begin
  foreach t in array array['expenses','ad_accounts','campaigns','campaign_metrics']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "auth_all_%s" on %I', t, t);
    execute format('drop policy if exists "cambio_admin_%s" on %I', t, t);
    execute format(
      'create policy "cambio_admin_%s" on %I for all to authenticated using (es_admin_cambio()) with check (es_admin_cambio())',
      t, t);
  end loop;
end $$;
