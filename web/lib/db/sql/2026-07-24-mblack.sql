-- MBlack como runner + sus 5 celulares. Correr en Supabase (zjetaihjddoxxvrpzwsb),
-- editor VACÍO antes de pegar. Idempotente.

insert into runners (company_id, name)
select c.id, 'MBlack' from companies c where c.name ilike '%gestiones%ma%'
on conflict do nothing;

insert into phones (company_id, alias, runner_id)
select r.company_id, v.alias, r.id
from runners r
join companies c on c.id = r.company_id
cross join (values ('MBlack 1'),('MBlack 2'),('MBlack 3'),('MBlack 4'),('MBlack 5')) as v(alias)
where lower(r.name) = 'mblack' and c.name ilike '%gestiones%ma%'
  and not exists (select 1 from phones p where p.company_id = r.company_id and lower(p.alias) = lower(v.alias));

-- Verificación: MBlack tiene que aparecer con 5.
select r.name as runner, count(*) from phones p
join runners r on r.id = p.runner_id
join companies c on c.id = p.company_id
where c.name ilike '%gestiones%ma%' group by r.name order by r.name;
