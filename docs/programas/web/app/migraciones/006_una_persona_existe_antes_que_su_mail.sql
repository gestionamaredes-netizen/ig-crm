-- El esquema ya decía que una persona existe antes de tener cuenta, pero
-- exigía el mail igual. En la práctica el orden es al revés: primero se sabe
-- quién está en la mesa y después se le pide el mail. Con el mail obligatorio,
-- un elenco cerrado no se puede cargar hasta juntar seis casillas de correo,
-- que es exactamente lo que pasó con Tercer Tiempo.
alter table personas alter column mail drop not null;

-- El índice único sobre lower(mail) sigue valiendo: en Postgres los nulos no
-- chocan entre sí, así que varias personas pueden estar sin mail a la vez y el
-- día que se les carga uno, sigue sin poder repetirse.

-- Los dos triggers de enganche comparan contra el mail; con nulo simplemente
-- no enganchan, que es lo correcto. No hay que tocarlos.
comment on column personas.mail is
  'Puede faltar. Sin mail la persona figura en el elenco pero no puede entrar: '
  'es por donde se engancha la cuenta.';
