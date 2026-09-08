-- Renombra las cajas a las "formas de dinero" de Gestiones MA.
-- Correr en el editor SQL de Supabase (proyecto zjetaihjddoxxvrpzwsb), editor
-- VACÍO antes de pegar. Idempotente (renombra solo si todavía tiene el nombre viejo).
--   Efectivo USD → USD Físico | Banco USD → USD Digital
--   Efectivo $   → Pesos Físico | Banco $  → Pesos Digital | USDT queda igual

update exchange_accounts a set name = 'USD Físico'
from companies c
where a.company_id = c.id and c.name ilike '%gestiones%ma%' and lower(a.name) = 'efectivo usd';

update exchange_accounts a set name = 'USD Digital'
from companies c
where a.company_id = c.id and c.name ilike '%gestiones%ma%' and lower(a.name) = 'banco usd';

update exchange_accounts a set name = 'Pesos Físico'
from companies c
where a.company_id = c.id and c.name ilike '%gestiones%ma%' and lower(a.name) = 'efectivo $';

update exchange_accounts a set name = 'Pesos Digital'
from companies c
where a.company_id = c.id and c.name ilike '%gestiones%ma%' and lower(a.name) = 'banco $';

-- Verificación: las formas de dinero activas de Gestiones MA.
select a.name, a.currency
from exchange_accounts a
join companies c on c.id = a.company_id
where c.name ilike '%gestiones%ma%' and a.active = true
order by a.currency, a.name;
