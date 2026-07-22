-- Alinea las tablas de pautas con el resto del CRM: RLS activo con acceso
-- para usuarios autenticados. Corregí acá el desvío del 21/07, cuando se
-- desactivó RLS en estas tres tablas por un diagnóstico equivocado.
--
-- Correr en el editor SQL de Supabase, con el editor VACÍO antes de pegar.

alter table ad_accounts      enable row level security;
alter table campaigns        enable row level security;
alter table campaign_metrics enable row level security;

drop policy if exists "auth_all_ad_accounts" on ad_accounts;
create policy "auth_all_ad_accounts" on ad_accounts
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_campaigns" on campaigns;
create policy "auth_all_campaigns" on campaigns
  for all to authenticated using (true) with check (true);

drop policy if exists "auth_all_campaign_metrics" on campaign_metrics;
create policy "auth_all_campaign_metrics" on campaign_metrics
  for all to authenticated using (true) with check (true);

-- Verificación: las tres deben quedar en true.
select relname, relrowsecurity
from pg_class
where relname in ('ad_accounts', 'campaigns', 'campaign_metrics');
