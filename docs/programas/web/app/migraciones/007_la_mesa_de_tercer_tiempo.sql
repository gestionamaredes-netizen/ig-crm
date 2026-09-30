-- Los seis de Tercer Tiempo. Sin mail todavía: figuran en el elenco pero no
-- pueden entrar hasta que se les cargue uno.
--
-- El rol es 'integrante' para los seis. Fede Aguirre y Nicolás Lahargou
-- figuran como dirección general del proyecto en estructuras/datos.py, pero esa
-- es la dirección del programa y no la de Nexo: el rol 'direccion' de esta base
-- abre los costos y la facturación del estudio, que es otra cosa. Si tienen que
-- verlos, se cambia a mano.
insert into personas (nombre, rol) values
  ('Fede Aguirre',           'integrante'),
  ('Guido Arrellano',        'integrante'),
  ('Juan Carnez',            'integrante'),
  ('Nicolás Lahargou',       'integrante'),
  ('Diego Ojeda',            'integrante'),
  ('Ezequiel Maxi Papagol',  'integrante');

-- Y su lugar en la mesa. La columna es lo que todavía falta repartir: sólo
-- están las dos que la biblia de formato ya da por decididas.
insert into integrantes (persona_id, programa_id, columna, en_camara)
select p.id, g.id, c.columna, true
  from (values
        ('Fede Aguirre',          'Conducción'),
        ('Guido Arrellano',       'Co-conducción · Nostalgia'),
        ('Nicolás Lahargou',      'Titulando'),
        ('Juan Carnez',            null),
        ('Diego Ojeda',            null),
        ('Ezequiel Maxi Papagol',  null)
       ) as c(nombre, columna)
  join personas  p on p.nombre = c.nombre
  join programas g on g.slug   = 'tercer-tiempo';
