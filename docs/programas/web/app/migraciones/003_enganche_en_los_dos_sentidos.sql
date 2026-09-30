-- El enganche entre una persona y su cuenta, ahora en los dos sentidos.
--
-- La 001 solo cubria un orden: primero se carga la persona con su mail, despues
-- esa persona se registra, y el trigger sobre auth.users la engancha. El otro
-- orden quedaba colgado: si alguien ya tenia cuenta y su fila en personas se
-- cargaba despues, nada la enganchaba nunca y la persona entraba sin rol.
--
-- Lo mostro la prueba: las dos personas de test quedaron con usuario en nulo,
-- porque las cuentas se habian creado antes que las filas.

create function public.enlazar_cuenta()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if new.usuario is null then
    select id into new.usuario from auth.users
     where lower(email) = lower(new.mail) limit 1;
  end if;
  return new;
end $$;

-- Before, no after: le escribe a new.usuario antes de que la fila se guarde.
create trigger al_cargar_persona
  before insert or update of mail on personas
  for each row execute function public.enlazar_cuenta();

-- Y las que ya estaban cargadas sin enganchar.
update personas p set usuario = u.id from auth.users u
 where p.usuario is null and lower(u.email) = lower(p.mail);
