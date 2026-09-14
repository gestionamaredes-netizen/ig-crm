# Prospección — papeleras de La Matanza

Tablero para salir a vender: dónde está cada papelera del partido, cómo
contactarla y en qué quedó la última visita. Vive en `/comercial/prospeccion`.

## De dónde salen los datos

El relevamiento inicial son **30 papeleras** repartidas en 11 localidades de La
Matanza. Está en `lib/datos/papeleras-matanza.ts` y cada ficha guarda en
`fuente` de dónde se sacó: directorios comerciales de zona oeste (Páginas
Amarillas, Firmania, Cylex, cercanooeste.com, argentino.com.ar, lazonaoeste.com)
y los perfiles públicos del propio comercio (sitio, Instagram, Facebook).

**Ninguno de esos datos está confirmado con el comercio.** Por eso toda ficha
entra con `verificado = false` y el tablero la muestra como "Datos sin
confirmar". Cuando alguien llama o pasa por el local, registra el contacto y la
ficha queda marcada como verificada. Lo que se corrige a mano ya no se vuelve a
pisar: la reimportación reconoce cada comercio por un id fijo y **solo agrega lo
que falta**.

Algunas fichas entran incompletas a propósito. Un teléfono que el directorio
publica cortado —"011 4486-00.."— se deja vacío con una nota, en vez de
completarlo a ojo. Un teléfono inventado hace perder una mañana.

## El mapa

Es OpenStreetMap con Leaflet: se comporta como el de Google —arrastrar, zoom,
pin con ficha— y no pide clave de API ni tarjeta. Cada pin lleva además un link
"Abrir en Google Maps", que es lo que se usa para ir manejando.

El color del pin es el escalón del embudo. **El borde punteado significa que el
pin está en el centro del barrio, no en la puerta**: es lo que pasa mientras
nadie geocodificó esa dirección. El botón "Ubicar direcciones en el mapa"
resuelve las pendientes contra el geocodificador público de OpenStreetMap, de a
una por segundo —lo que su política de uso admite—, y guarda el punto. Corre en
el navegador y a pedido, no cada vez que alguien abre el tablero.

## El seguimiento

Un prospecto recorre: `sin contactar → contactado → interesado → visita
agendada → muestra entregada → cotizado → cliente`, con `descartado` como
salida.

El estado no se puede cambiar suelto: se cambia registrando un contacto (qué
canal, qué pasó, en qué quedó, qué sigue y cuándo). Sin eso, el segundo vendedor
que pasa no sabe que el primero ya dejó una muestra. El historial se acumula en
`contactos_prospecto` y no se reemplaza.

Cuando el comercio compra, "Convertir en cliente" le crea la ficha en
`clientes` con su link de acceso y deja el puente apuntado desde el prospecto.
El prospecto **no se borra**: es la única forma de medir cuántos de los
relevados se convirtieron, que es para qué sirve el tablero.

## Sumar papeleras al relevamiento

Agregar la ficha a `PAPELERAS_MATANZA` con un `id` nuevo y entrar al tablero: el
botón "Importar las que faltan" aparece solo cuando hay alguna sin cargar. Si la
localidad es nueva, sumarle el centro en `CENTROS_LOCALIDAD` o el pin va a
quedar sin ubicar.
