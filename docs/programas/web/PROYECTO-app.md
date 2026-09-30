# La app con permisos de verdad

Lo que hay hoy son seis páginas generadas, donde el link es el acceso. Alcanza
para repartir material y juntar ideas, y no alcanza para dos cosas: que el
equipo entre sin cuenta de Claude, y que la parte financiera tenga permisos
que los sostenga un servidor y no una interfaz.

Esto es el planteo de lo segundo. **La primera capa ya está construida y andando**: las tablas con sus políticas, probadas con dos cuentas de distinto rol. Está en `app/`, con su README. Falta el front, y ahí entran las tres decisiones del final.

## Qué resuelve que hoy no se resuelve

**Permisos reales.** Hoy la separación es por link: los números no están en la
página de los integrantes, así que no hay nada que mirar. Funciona, pero no
escala. Cuando haya que mostrarle a un integrante *parte* de un número —lo que
trajo él, su porcentaje— eso ya no se puede hacer escondiendo: hay que decidir
en el servidor qué se le manda a cada uno. Es la diferencia entre no mostrar y
no enviar.

**Entrar sin cuenta de Claude.** Hoy, para dejar una idea hay que estar
identificado con una cuenta que tenga acceso a la página. Los elencos todavía
no existen y, cuando existan, no van a tener cuenta. Con login propio, entran
con su mail.

**La parte financiera como sistema y no como planilla.** Hoy se cargan
jornadas y auspicios a mano y se suman en el mes. Lo que falta es lo que
convierte eso en administración: facturas con su vencimiento, cobros parciales,
qué auspicio corresponde a qué integrante, y el costo real de cada jornada
contra lo que se cobró.

## Cómo se arma

Supabase, que es lo que ya está conectado en este proyecto. Postgres con RLS
—las reglas de acceso viven en la base, no en la pantalla—, auth por mail, y
storage para los archivos que hoy están en el Drive.

Tres capas y ninguna opcional:

1. **Las tablas y sus políticas.** Una política por tabla que diga quién ve
   qué. Un integrante ve las filas de su programa; producción general, todas.
   Esto se escribe una vez y después nadie lo puede saltar desde el front.
2. **El front.** Puede ser lo mismo que hay hoy, servido desde un lado propio:
   el diseño y la estructura ya están resueltos y probados en las seis páginas.
3. **La migración del Drive.** Los 56 documentos siguen donde están; la app los
   lista y linkea igual que ahora. Mover el contenido adentro es un paso
   posterior y probablemente innecesario: el Drive se imprime bien desde el
   celular y ya funciona.

## El modelo de datos

Sale de lo que las páginas de hoy ya guardan, más lo que les falta.

| Tabla | Qué es | Quién la ve |
|---|---|---|
| `programas` | los cinco, con su franja y su acento | todos |
| `personas` | mail, nombre, rol | producción general y dirección |
| `integrantes` | quién está en qué programa y con qué columna | su programa |
| `ideas` | lo que hoy junta cada página | su programa; producción, todas |
| `sesiones` | jornada de estudio: fecha, cliente, servicio, horas | dirección |
| `facturas` | lo que se emitió, con vencimiento | dirección |
| `cobros` | lo que entró, parcial o total, contra una factura | dirección |
| `auspicios` | marca, programa, producto, monto por mes, quién lo trajo | dirección; el integrante ve el suyo |
| `costos` | operador, asistente, producción, por jornada | sólo dirección |

Las dos últimas son las que hoy no pueden convivir en una misma página con las
demás. Con RLS sí: `costos` no sale del servidor si quien pregunta no es
dirección.

## Los roles

- **Producción general y dirección**: todo.
- **Productor de un programa**: su programa entero, incluida la venta.
- **Integrante**: su programa sin los costos, más lo que él mismo trajo.
- **Técnica**: la grilla, los checklists y las fechas. Nada comercial.

## Lo que hay que decidir antes de empezar

1. Si el estudio va a facturar a terceros desde acá o sólo llevar el registro.
   Cambia si hace falta emitir comprobantes o alcanza con anotar.
2. Dónde se hospeda y quién paga esa cuenta.
3. Quién lo sostiene cuando haya que cambiar algo. Una app tiene dueño; seis
   páginas generadas se regeneran con un comando.

Mientras eso no esté decidido, lo que hay hoy funciona y no estorba: el mismo
diseño y el mismo modelo de datos se reusan cuando se arme.
