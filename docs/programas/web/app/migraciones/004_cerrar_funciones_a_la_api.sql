-- Cerrar las seis funciones a la API publica.
--
-- Supabase publica como endpoint REST toda funcion del esquema public: cada una
-- de estas era llamable en /rest/v1/rpc/<nombre> sin estar identificado. En las
-- cuatro de consulta eso no filtra nada (solo contestan sobre quien pregunta, y
-- sin sesion contestan nulo), pero las dos de trigger no tienen por que ser
-- llamables desde afuera: corren solas cuando se toca la tabla.
--
-- La trampa, que costo un intento: Postgres le concede EXECUTE a PUBLIC en toda
-- funcion nueva, y anon y authenticated lo heredan de ahi. Sacarselo a los roles
-- por nombre no hace absolutamente nada mientras el permiso siga colgado de
-- PUBLIC; has_function_privilege sigue contestando true. Primero se corta en
-- PUBLIC y despues se da a mano lo que corresponde.
--
-- (En la base este archivo son dos migraciones: el primer intento revocaba por
-- rol y no movio nada. Lo que esta escrito aca es lo que quedo andando.)

revoke execute on function public.enlazar_persona() from public;
revoke execute on function public.enlazar_cuenta()  from public;
revoke execute on function public.mi_persona()      from public;
revoke execute on function public.mi_rol()          from public;
revoke execute on function public.es_direccion()    from public;
revoke execute on function public.mis_programas()   from public;

-- Las cuatro de consulta si las necesita quien entro, y no es opcional: dentro
-- de una politica RLS la funcion se evalua con los permisos del que consulta,
-- no con los del dueño de la tabla. Sin este grant, toda politica que llame a
-- es_direccion() corta con error de permisos y la web entera deja de andar.
grant execute on function public.mi_persona()    to authenticated;
grant execute on function public.mi_rol()        to authenticated;
grant execute on function public.es_direccion()  to authenticated;
grant execute on function public.mis_programas() to authenticated;

comment on function public.mi_rol() is
  'Para que el front sepa que dibujar. No decide permisos: eso lo hacen las politicas.';

-- Que lo que se cree manana nazca cerrado y no haya que acordarse.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on functions from public;
