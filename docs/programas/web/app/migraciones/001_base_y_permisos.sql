-- Nexo Studios · la base de la web interna
--
-- Lo que esta version resuelve, y que las seis paginas publicadas no pueden:
-- que el permiso lo decida el servidor. Un integrante no ve los costos de
-- produccion porque el servidor no se los manda, no porque la pantalla se los
-- esconda. Esa es toda la diferencia entre no mostrar y no enviar.
--
-- Las politicas viven pegadas a cada tabla. No hay forma de saltarlas desde el
-- front: una consulta que pida costos siendo integrante vuelve vacia.

-- ---------------------------------------------------------------- la gente

-- Una persona existe antes de tener cuenta. Los elencos todavia no estan
-- cerrados, asi que se carga el mail y la fila queda esperando; cuando esa
-- persona se registra, el trigger de abajo la engancha sola.
create table personas (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  mail      text not null,
  rol       text not null check (rol in ('direccion','productor','integrante','tecnica')),
  usuario   uuid unique references auth.users(id) on delete set null,
  activo    boolean not null default true,
  creado    timestamptz not null default now()
);
create unique index personas_mail_unico on personas (lower(mail));
comment on column personas.rol is
  'direccion: todo. productor: su programa entero, venta incluida. '
  'integrante: su programa sin costos, mas lo que trajo el. '
  'tecnica: grilla, checklists y fechas; nada comercial.';

-- Cuando alguien se registra con un mail que ya estaba cargado, se enlaza.
create function public.enlazar_persona()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update personas set usuario = new.id
   where usuario is null and lower(mail) = lower(new.email);
  return new;
end $$;

create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.enlazar_persona();

-- ------------------------------------------------------------ los programas

create table programas (
  id      uuid primary key default gen_random_uuid(),
  slug    text not null unique,
  nombre  text not null,
  corto   text not null,
  bajada  text,
  acento  text,
  activo  boolean not null default true,
  orden   smallint not null default 0
);

create table integrantes (
  id          uuid primary key default gen_random_uuid(),
  persona_id  uuid not null references personas(id) on delete cascade,
  programa_id uuid not null references programas(id) on delete cascade,
  columna     text,
  en_camara   boolean not null default true,
  desde       date not null default current_date,
  hasta       date,
  unique (persona_id, programa_id)
);

-- ------------------------------------------------- quien es quien, por SQL
--
-- Van en security definer a proposito: una politica sobre personas que
-- consulte personas se llama a si misma y Postgres corta con error de
-- recursion. En definer la funcion lee sin pasar por RLS y el problema no
-- existe. El search_path queda fijo para que nadie pueda apuntarlas a otra
-- tabla.

create function public.mi_persona()
returns uuid language sql stable security definer set search_path = public as $$
  select id from personas where usuario = auth.uid() and activo
$$;

create function public.mi_rol()
returns text language sql stable security definer set search_path = public as $$
  select rol from personas where usuario = auth.uid() and activo
$$;

create function public.es_direccion()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select rol = 'direccion' from personas where usuario = auth.uid() and activo),
    false)
$$;

-- Los programas que le tocan a quien pregunta. Direccion los tiene todos.
create function public.mis_programas()
returns setof uuid language sql stable security definer set search_path = public as $$
  select case when public.es_direccion() then p.id else null end
    from programas p where public.es_direccion()
  union
  select i.programa_id
    from integrantes i
    join personas pe on pe.id = i.persona_id
   where pe.usuario = auth.uid() and pe.activo
     and (i.hasta is null or i.hasta >= current_date)
$$;

-- ---------------------------------------------------------------- las ideas

create table ideas (
  id          uuid primary key default gen_random_uuid(),
  programa_id uuid not null references programas(id) on delete cascade,
  autor_id    uuid references personas(id) on delete set null,
  texto       text not null check (length(trim(texto)) > 0),
  bloque      text,
  tipo        text,
  estado      text not null default 'nueva'
              check (estado in ('nueva','en estudio','va','no va')),
  creado      timestamptz not null default now()
);
create index ideas_por_programa on ideas (programa_id, creado desc);

-- ------------------------------------------- el estudio: horas y facturacion

create table sesiones (
  id          uuid primary key default gen_random_uuid(),
  fecha       date not null,
  cliente     text not null,
  programa_id uuid references programas(id) on delete set null,
  servicio    text not null,
  horas       numeric(5,2) not null check (horas >= 2),   -- jornada minima
  monto       numeric(12,2) not null default 0 check (monto >= 0),
  estado      text not null default 'pendiente'
              check (estado in ('pendiente','cobrado','interno')),
  nota        text,
  creado      timestamptz not null default now()
);
create index sesiones_por_fecha on sesiones (fecha desc);
comment on column sesiones.estado is
  'interno: es un programa propio y no se factura. No suma a lo facturado.';

create table facturas (
  id         uuid primary key default gen_random_uuid(),
  sesion_id  uuid references sesiones(id) on delete set null,
  cliente    text not null,
  numero     text,
  emitida    date not null default current_date,
  vence      date,
  monto      numeric(12,2) not null check (monto >= 0),
  creado     timestamptz not null default now()
);

create table cobros (
  id          uuid primary key default gen_random_uuid(),
  factura_id  uuid not null references facturas(id) on delete cascade,
  fecha       date not null default current_date,
  monto       numeric(12,2) not null check (monto > 0),
  medio       text,
  creado      timestamptz not null default now()
);

-- Lo que cuesta cada jornada: operador, asistente, produccion. Es la tabla
-- que no puede convivir con las demas en una pagina sin permisos de verdad,
-- y la razon por la que hoy hay seis paginas separadas en vez de una.
create table costos (
  id         uuid primary key default gen_random_uuid(),
  sesion_id  uuid not null references sesiones(id) on delete cascade,
  concepto   text not null,
  monto      numeric(12,2) not null check (monto >= 0),
  creado     timestamptz not null default now()
);

-- ------------------------------------------------------------ los auspicios

create table auspicios (
  id          uuid primary key default gen_random_uuid(),
  marca       text not null,
  programa_id uuid references programas(id) on delete set null,
  producto    text not null,
  monto_mes   numeric(12,2) not null check (monto_mes >= 0),
  desde       date,
  hasta       date,
  estado      text not null default 'en charla'
              check (estado in ('en charla','propuesta enviada','cerrado','caido')),
  traido_por  uuid references personas(id) on delete set null,
  nota        text,
  creado      timestamptz not null default now()
);
create index auspicios_por_programa on auspicios (programa_id);

-- ----------------------------------------------------------- las politicas

alter table personas    enable row level security;
alter table programas   enable row level security;
alter table integrantes enable row level security;
alter table ideas       enable row level security;
alter table sesiones    enable row level security;
alter table facturas    enable row level security;
alter table cobros      enable row level security;
alter table costos      enable row level security;
alter table auspicios   enable row level security;

-- La grilla la ve cualquiera que haya entrado. No hay nada sensible en ella.
create policy programas_lectura on programas
  for select to authenticated using (true);
create policy programas_direccion on programas
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());

-- Cada uno se ve a si mismo. Direccion ve a todos y es la unica que edita.
create policy personas_propia on personas
  for select to authenticated using (usuario = auth.uid() or public.es_direccion());
create policy personas_direccion on personas
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());

create policy integrantes_lectura on integrantes
  for select to authenticated
  using (public.es_direccion() or programa_id in (select public.mis_programas()));
create policy integrantes_direccion on integrantes
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());

-- Las ideas: se leen y se escriben las del programa de uno. Direccion, todas.
create policy ideas_lectura on ideas
  for select to authenticated
  using (public.es_direccion() or programa_id in (select public.mis_programas()));
create policy ideas_escritura on ideas
  for insert to authenticated
  with check (
    programa_id in (select public.mis_programas())
    and (autor_id is null or autor_id = public.mi_persona()));
-- Una idea la edita o la borra quien la escribio, mientras siga en 'nueva'.
-- Direccion puede moverle el estado a cualquiera.
create policy ideas_propia on ideas
  for update to authenticated
  using ((autor_id = public.mi_persona() and estado = 'nueva') or public.es_direccion())
  with check (public.es_direccion() or autor_id = public.mi_persona());
create policy ideas_borrar on ideas
  for delete to authenticated
  using ((autor_id = public.mi_persona() and estado = 'nueva') or public.es_direccion());

-- El estudio y su plata: solo direccion. Sin politica de lectura para nadie
-- mas, una consulta de otro rol vuelve vacia.
create policy sesiones_direccion on sesiones
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());
create policy facturas_direccion on facturas
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());
create policy cobros_direccion on cobros
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());
create policy costos_direccion on costos
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());

-- Los auspicios: direccion los ve todos; cada uno ve y carga el que trajo.
create policy auspicios_lectura on auspicios
  for select to authenticated
  using (public.es_direccion() or traido_por = public.mi_persona());
create policy auspicios_propio on auspicios
  for insert to authenticated
  with check (public.es_direccion() or traido_por = public.mi_persona());
create policy auspicios_editar on auspicios
  for update to authenticated
  using (public.es_direccion() or traido_por = public.mi_persona())
  with check (public.es_direccion() or traido_por = public.mi_persona());
create policy auspicios_direccion_borra on auspicios
  for delete to authenticated using (public.es_direccion());

-- Nadie entra sin cuenta: el rol anonimo no tiene ninguna politica.
revoke all on all tables in schema public from anon;
