# La app con permisos de verdad

Esto es la opción 3 de `PROYECTO-app.md`: una sola web donde el permiso lo
decide el servidor. La diferencia con las seis páginas publicadas no es de
diseño, es de fondo: **una página web no puede esconder lo que lleva adentro.**
Si los números del estudio viajaran en la página de los integrantes, cualquiera
con el link los encuentra mirando el código. Acá no viajan: el servidor no los
manda.

```
python3 contenido.py     regenera sitio/datos.sql, estilo.css y la prueba
```

## Lo que está hecho

Proyecto Supabase `nexo-produccion` (`yjcuatjsbyaluirdshnb`), región São Paulo.

| | |
|---|---|
| `001_base_y_permisos.sql` | 9 tablas, 18 políticas, 4 funciones de identidad |
| `002_los_cinco_programas.sql` | los 5 programas, generados desde `estructuras/datos.py` |
| `003_enganche_en_los_dos_sentidos.sql` | persona ↔ cuenta, en cualquier orden |
| `004_cerrar_funciones_a_la_api.sql` | las funciones dejan de ser endpoints abiertos |
| `005_primera_persona.sql` | la primera dirección, la única que va por SQL |
| `006_una_persona_existe_antes_que_su_mail.sql` | el mail deja de ser obligatorio |
| `007_la_mesa_de_tercer_tiempo.sql` | los seis de Tercer Tiempo y su lugar en la mesa |
| `008_el_contenido_tambien_vive_en_la_base.sql` | la escaleta y los precios dejan el HTML |

Se replantan en orden sobre una base vacía y queda lo mismo que hay hoy. El
contenido en sí no es esquema: lo escribe `contenido.py` en `sitio/datos.sql`.

## Los cuatro roles

| | ve | no ve |
|---|---|---|
| `direccion` | todo: los cinco programas, las horas, lo facturado, los costos | — |
| `productor` | su programa entero, venta incluida | los costos y la facturación del estudio |
| `integrante` | su programa, sus ideas, el auspicio que trajo él | todo lo comercial del estudio |
| `tecnica` | grilla, checklists y fechas | todo lo comercial |

Una persona existe antes de tener cuenta, y antes de tener mail: se carga el
nombre y la fila espera. Cuando esa persona se registra con un mail que
coincide, se engancha sola, en cualquiera de los dos órdenes.

## El sitio

`sitio/` es todo lo que se publica. Son cinco archivos y un logo, sin build.

| | |
|---|---|
| `index.html` | el cascarón: la puerta y los tres contenedores. Sin contenido |
| `app.js` | entra, pide lo que te toca y lo dibuja |
| `app.css` | la puerta, el selector y el tablero |
| `estilo.css` | generado desde `sitio.py`, para que los dos diseños no se separen |
| `vercel.json` · `robots.txt` | que no se indexe |

**La clave que está en `app.js` es pública a propósito.** Identifica al
proyecto, no a la persona, y sola no abre nada: el rol anónimo no tiene ninguna
política a favor. Está verificado tabla por tabla.

Se entra por link al mail, sin contraseña: no hay nada que recordar ni que
filtrar.

## Está probado, y lo que no

**Los permisos, contra la base, con dos cuentas de distinto rol.** La misma
consulta desde cada una:

```
integrante:  costos 0   sesiones 0   facturas 0   ideas 1   programas 5
direccion:   costos 3   sesiones 1   facturas 0   ideas 1   programas 5
```

Las cuatro escrituras que un integrante no debería poder hacer, rechazadas; las
dos que sí, aceptadas. Las cuentas y los datos de prueba ya se borraron.

Un detalle del camino que vale dejar escrito: la primera prueba de escritura
decía `insert into costos … select id from sesiones`, y "pasó". No había
agujero: RLS escondía `sesiones`, el select traía cero filas y no se insertaba
nada, así que no había nada que rechazar. Una prueba que pasa porque no probó
nada es peor que una que falla. La segunda versión hardcodea los ids.

**El dibujo, con un Supabase falso.** `prueba.html?rol=direccion` (o
`integrante`, o `nadie`) levanta la app con los datos reales y sin red, porque
este contenedor no llega ni a Supabase ni al CDN. Sirvió: destapó que
`.centro{display:flex}` le gana al atributo `hidden`, así que la pantalla de
espera y la puerta quedaban encima del contenido. El DOM se veía bien y la
pantalla no; eso no lo encuentra un volcado de DOM, hay que mirar.

**Lo que no está probado: la vuelta completa contra Supabase de verdad.** El
proxy de este contenedor bloquea `supabase.co`, así que el login por mail, la
lectura con sesión y el alta de ideas se prueban recién al publicar.

## Para publicarlo

1. En Vercel, importar el repositorio y apuntar el proyecto a
   `docs/programas/web/app/sitio`. Sin build: son archivos estáticos.
2. En Supabase → Authentication → URL Configuration, agregar la URL de Vercel
   como Site URL y como Redirect URL. **Sin esto el link del mail no vuelve.**
3. Cargar al equipo con su mail desde SQL, o darles de alta en `personas`.

## Lo que queda abierto

**Re-sembrar el contenido.** Hoy `datos.sql` se aplica a mano. Cuando cambie un
horario hay que volver a aplicarlo. Lo que corresponde es una acción de GitHub
que lo corra sola en cada push, con la clave de servicio como secreto.

**Contraseñas.** No hay, y es mejor así. El aviso de Supabase sobre contraseñas
filtradas queda sin efecto mientras se entre por link.

**El plan es gratis.** La organización está en el plan free, y un proyecto free
se pausa solo después de más o menos una semana sin uso. Pausado, la web no
anda hasta que alguien lo despierta desde el panel. Para probar está bien; el
día que el equipo dependa de esto, hay que pasarlo a pago.
