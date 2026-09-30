# La app con permisos de verdad

Esto es la opción 3 de `PROYECTO-app.md`: una sola web donde el permiso lo
decide el servidor. La diferencia con las seis páginas publicadas no es de
diseño, es de fondo: **una página web no puede esconder lo que lleva adentro.**
Hoy los números del estudio viven en una página aparte porque si viajaran en la
página de los integrantes, cualquiera con el link los encuentra mirando el
código. Acá no viajan: el servidor no los manda.

Está la base andando. Falta el front.

## Lo que está hecho

Proyecto Supabase `nexo-produccion` (`yjcuatjsbyaluirdshnb`), región São Paulo.

| | |
|---|---|
| `001_base_y_permisos.sql` | 9 tablas, 18 políticas, 4 funciones de identidad |
| `002_los_cinco_programas.sql` | los 5 programas, generados desde `estructuras/datos.py` |
| `003_enganche_en_los_dos_sentidos.sql` | persona ↔ cuenta, en cualquier orden |
| `004_cerrar_funciones_a_la_api.sql` | las funciones dejan de ser endpoints abiertos |
| `005_primera_persona.sql` | la primera dirección, la única que va por SQL |

Se replantan en orden sobre una base vacía y queda lo mismo que hay hoy.

## Los cuatro roles

| | ve | no ve |
|---|---|---|
| `direccion` | todo: los cinco programas, las horas, lo facturado, los costos | — |
| `productor` | su programa entero, venta incluida | los costos y la facturación del estudio |
| `integrante` | su programa, sus ideas, el auspicio que trajo él | todo lo comercial del estudio |
| `tecnica` | grilla, checklists y fechas | todo lo comercial |

Una persona existe antes de tener cuenta: se carga el mail y la fila espera.
Cuando esa persona se registra, se engancha sola. Funciona en los dos órdenes
—fila primero o cuenta primero— y eso fue un arreglo, no un regalo: la primera
versión solo cubría uno y la prueba lo destapó.

## Está probado, no supuesto

Con dos cuentas de prueba, la misma consulta desde cada una:

```
integrante:  costos 0   sesiones 0   facturas 0   ideas 1   programas 5
direccion:   costos 3   sesiones 1   facturas 0   ideas 1   programas 5
```

Y las escrituras desde la cuenta de integrante:

```
cargar un costo             rechazado
cargar una jornada          rechazado
idea en otro programa       rechazado
auspicio a nombre de otro   rechazado
idea en mi programa         OK
auspicio propio             OK
```

Los ceros del integrante no son una pantalla vacía: son la respuesta del
servidor. Las cuentas y los datos de prueba ya se borraron.

Un detalle del camino que vale dejar escrito: la primera prueba de escritura
decía `insert into costos … select id from sesiones`, y "pasó". No había
agujero: RLS escondía `sesiones`, el select traía cero filas y no se insertaba
nada, así que no había nada que rechazar. Una prueba que pasa porque no probó
nada es peor que una que falla. La segunda versión hardcodea los ids.

## Lo que queda abierto

**El front.** No existe todavía. La base contesta bien pero no hay pantalla:
eso es lo que sigue, y es donde entran las tres decisiones de
`PROYECTO-app.md` (si el estudio va a facturar a terceros desde acá, qué
dominio, quién lo mantiene).

**Contraseñas.** Falta activar el chequeo contra HaveIBeenPwned, que es un
interruptor del panel de Supabase. Pero para un equipo de este tamaño conviene
más entrar por link al mail y no tener contraseña ninguna: no hay nada que
filtrar ni que recordar.

**El plan es gratis.** La organización está en el plan free, y un proyecto free
se pausa solo después de más o menos una semana sin uso. Pausado, la web no
anda hasta que alguien lo despierta desde el panel. Para probar está bien; el
día que el equipo dependa de esto, hay que pasarlo a pago.
