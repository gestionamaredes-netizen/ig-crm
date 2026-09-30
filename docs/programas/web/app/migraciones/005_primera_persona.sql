-- La primera fila de personas, para que alguien pueda entrar.
--
-- Es la del huevo y la gallina: personas solo la edita direccion, asi que la
-- primera direccion no puede cargarse desde la web. Va por SQL una sola vez.
-- De ahi en mas el resto del equipo se carga desde la pagina de direccion.
--
-- El mail es el que importa: es por donde el trigger de la 003 engancha la fila
-- con la cuenta cuando esa persona se registra. Si no coincide con el mail con
-- el que entra, la fila queda sin enganchar y la persona entra sin rol.

insert into personas (nombre, mail, rol) values
  ('Fabricio Benjamín Ortega', 'Nexostudios.adm@gmail.com', 'direccion')
on conflict do nothing;
