# La web interna

Seis páginas: una por programa, que es la que se le pasa a su equipo, y una de
dirección con el dashboard. Se generan desde acá y se publican como Artifacts
en claude.ai.

```
python3 datos_web.py     verifica que las fuentes cierren
python3 sitio.py         escribe salida/<programa>.html, las cinco
python3 direccion.py     escribe salida/direccion.html
```

## Por qué son seis páginas y no una con roles

Una página web no puede esconder lo que lleva adentro. Si los números del
estudio viajaran en la página de los integrantes, cualquiera con el link los
encuentra mirando el código, aunque la interfaz no se los muestre. Separarlas
hace que el link sea el acceso: lo que no está en la página, no está.

Eso tiene un costo y conviene decirlo: son seis links para repartir, y un
cambio de diseño se publica seis veces. La alternativa real —permisos de
verdad, con el servidor decidiendo qué te manda— está planteada en
`PROYECTO-app.md` y es otro proyecto.

## De dónde sale cada cosa

Acá no se escribe contenido que ya exista en otro lado.

| | |
|---|---|
| `estructuras/datos.py` | la grilla, las escaletas, la semana de producción, lo que falta de cada programa, los cambios de piso |
| `presentaciones/comercial.py` | el kit de marca, cuántos hacen falta por programa, los escalones |
| `documentos/_indice.json` | los 56 documentos del Drive, con su id |
| `documentos/mapa.py` | en qué carpeta vive cada uno y de qué programa es |
| `datos_web.py` | lo único propio: las tarifas del estudio, el acento de cada logo sobre negro, y qué tres documentos abren cada página |

Si cambia un horario, un precio o un documento, cambia en su fuente y la web
se regenera. Un número escrito dos veces se contradice solo.

## Los logos

Van como archivos publicados al lado de la página, con ruta relativa
(`marca/nexo.jpg`). Un `<img>` apuntando a otro dominio queda bloqueado y sin
aviso: el artifact sólo sirve lo que se publica con él. Al publicar hay que
mandar `files` con el logo de Nexo y el del programa.

Los dos van dentro de un recuadro negro, que es la regla de la marca: el arte
del logo tiene fondo negro pleno y sobre blanco quedaría como un rectángulo
suelto.

## Las bases

Cada página tiene la suya y no se cruzan entre artifacts. Las ideas que deja
el equipo de Tercer Tiempo están en la página de Tercer Tiempo.

| Página | Colección | Qué guarda |
|---|---|---|
| cada programa | `ideas` | texto, autor, bloque, tipo, fecha |
| dirección | `sesiones` | fecha, cliente, servicio, horas, monto, estado |
| dirección | `auspicios` | marca, programa, producto, monto por mes, desde, estado, quién lo trajo |

Por defecto, cualquiera que pueda abrir la página lee; para escribir hace
falta acceso de colaborador. Está verificado: una escritura a nivel lector se
rechaza, y una lectura a nivel lector sí devuelve lo que hay.

Escribir requiere estar identificado con una cuenta. Quien abra la página sin
cuenta la lee completa pero no puede dejar una idea, y la página se lo dice en
vez de fallar callada.

## Al publicar

Las páginas de programa llevan `capabilities: {db:{}, user:{scopes:["profile"]}}`
y sus dos logos. La de dirección, lo mismo con un solo logo.

Los links de las cinco páginas de programa viven en `salida/enlaces.json`, que
lee `direccion.py` para armar la sección de programas. Si se republica una
página de programa con URL nueva, hay que actualizar ese archivo y volver a
generar la de dirección.
