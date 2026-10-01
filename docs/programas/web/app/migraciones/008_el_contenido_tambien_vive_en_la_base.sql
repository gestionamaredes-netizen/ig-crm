-- Hasta acá el contenido de cada programa viajaba dentro del HTML. En un
-- artifact privado eso alcanzaba. En un dominio público no: una página web no
-- puede esconder lo que lleva adentro, así que si la escaleta y los precios
-- están en el archivo, los lee cualquiera que abra la URL, entre o no entre.
--
-- Por eso el contenido pasa a la base, con las mismas políticas que todo lo
-- demás: el servidor manda el de tu programa y no el de los otros.
--
-- Va como un solo jsonb por programa y no como quince tablas a propósito: este
-- contenido se escribe entero en estructuras/datos.py y se regenera entero. No
-- se consulta campo por campo, así que partirlo en tablas sería inventar una
-- estructura que nadie usa.
create table programa_contenido (
  programa_id  uuid primary key references programas(id) on delete cascade,
  datos        jsonb not null,
  actualizado  timestamptz not null default now()
);

alter table programa_contenido enable row level security;

create policy contenido_lectura on programa_contenido
  for select to authenticated
  using (programa_id in (select public.mis_programas()));
create policy contenido_direccion on programa_contenido
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());

-- Las tarifas del estudio y el modelo comercial son de dirección. Una sola
-- fila: es la configuración de la casa, no una lista.
create table estudio (
  id           smallint primary key default 1 check (id = 1),
  datos        jsonb not null,
  actualizado  timestamptz not null default now()
);
alter table estudio enable row level security;
create policy estudio_direccion on estudio
  for all to authenticated using (public.es_direccion())
  with check (public.es_direccion());

revoke all on programa_contenido, estudio from anon;

-- El contenido en sí lo escribe app/contenido.py en sitio/datos.sql, que se
-- regenera desde estructuras/datos.py y se aplica aparte: es dato, no esquema.
