# Aqua Mar

Gestión mayorista de Powerful 3 en 1, en tres interfaces separadas:

- **Depósito** (`/deposito`) — qué hay en el galpón: stock, entradas, ajustes y reposición.
- **Comercial** (`/comercial`) — el día a día del negocio: clientes, pedidos, precios, compras,
  proveedores, caja, gastos y reportes.
- **Panel del comercio** (`/panel`) — lo que ve cada cliente: su stock, sus entregas y sus pedidos.

Depósito y Comercial son las dos caras del administrador y se saltan con el conmutador del
encabezado. Están separadas porque se usan en momentos distintos: contar mercadería no es lo
mismo que atender comercios, y mezclarlas obliga a buscar entre pantallas que no venían al caso.

## Levantarla

No hace falta crear cuentas ni configurar nada: la base es un archivo SQLite local.

```bash
cd aquamar
npm install
npm run db:seed -- --demo   # categorías de gasto + un producto y un comercio de ejemplo
npm run dev                 # http://localhost:3000
```

La clave del panel de administración es `aquamar`. Para cambiarla, copiá `.env.example`
a `.env.local` y editá `ADMIN_PASSWORD`.

El seed imprime los links de acceso del comercio de ejemplo. Los links reales se generan
solos al crear cada cliente y se copian desde su ficha.

Otros comandos: `npm test` (lógica de negocio), `npm run build`, `npm start`.

## En el celular

Los clientes entran desde el teléfono, así que la interfaz se probó ahí primero: se
audita cada pantalla a 320, 360, 390, 768 y 1280 px buscando desbordes horizontales,
blancos táctiles chicos y texto ilegible.

Tres cosas que sostienen eso y conviene no romper:

1. **Los campos van a 16px en el celular** (`app/globals.css`). Safari en iPhone hace
   zoom automático al enfocar un campo con fuente menor, y deja la página corrida.
2. **Las tablas scrollean adentro de su tarjeta**, nunca arrastran la página. Para que
   el scroll interno actúe, la tarjeta necesita `min-w-0`: sin eso, un item de grid no
   baja de su contenido y el desborde sale para afuera.
3. **Los importes de siete cifras no entran en media pantalla.** Debajo de 380px los
   KPI van en una sola columna y el número escala con el ancho.

## Publicarla en Netlify

`netlify.toml` (en la raíz del repo) ya apunta a esta carpeta. Lo único que falta es la
base: **en Netlify el servidor no tiene disco que sobreviva al pedido**, así que un
archivo SQLite no sirve — cada invocación arrancaría con la base vacía. La app usa
[Turso](https://turso.tech), que es SQLite alojado, y por eso el esquema no cambia.

**Las tablas se crean solas.** `lib/db/index.ts` corre el esquema al abrir la conexión,
así que no hay un paso de migración: alcanza con que la base exista y las variables estén
puestas.

1. Creá la base en Turso, elegí la región **us-east-1 (Virginia)** —que es donde Netlify
   corre las funciones, así la app y la base quedan pegadas— y generá un token.

2. En Netlify → Site configuration → Environment variables, cargá las cuatro:

   | Variable | Qué va |
   |---|---|
   | `TURSO_DATABASE_URL` | la URL `libsql://...` de la base |
   | `TURSO_AUTH_TOKEN` | el token que generaste |
   | `ADMIN_PASSWORD` | la clave para entrar a la administración |
   | `APP_SECRET` | una cadena larga y al azar, para firmar la sesión |

3. Conectá el repo y desplegá. Entrás con la clave y cargás productos y clientes.

Si falta `TURSO_DATABASE_URL`, el build falla con un mensaje que lo dice: es preferible
a un sitio que anda un rato y después aparece vacío.

### En Vercel

Funciona igual y es una alternativa razonable: Vercel hace Next.js y su capa gratuita
alcanza para esto. Al importar el repo, poné **Root Directory: `aquamar`** —el resto lo
detecta solo— y cargá las mismas cuatro variables. El `netlify.toml` se ignora.

La región por defecto de Vercel también es Virginia, así que la base en `us-east-1`
sigue quedando al lado del servidor.

**No corras el seed contra la base de producción.** Las categorías de gasto las podés
crear desde la pantalla de Gastos, y el `--demo` metería un "Almacén Don Pedro" que
después hay que salir a borrar. Si querés solo las categorías, `npm run db:seed` sin
`--demo` es seguro.

## La marca

El logo y los colores salen de las piezas oficiales de Aqua Mar. Los archivos
están en `public/marca/` y las reglas de uso, con la paleta muestreada píxel por
píxel del logotipo, en [MARCA.md](MARCA.md).

Los colores viven en un solo lugar, el bloque `@theme` de `app/globals.css`: si
la marca cambia, se toca ahí y se propaga a toda la app.

## Cómo entra cada uno

| Quién | Cómo entra | Qué ve |
| --- | --- | --- |
| Administración | clave en `/login` | Depósito y Comercial |
| Comercio | link `/acceso/<token>` | solo lo suyo |
| Representante | otro link `/acceso/<token>` del mismo comercio | lo mismo que el comercio |

Cada acceso es una fila aparte: se revoca el del representante sin tocar el del dueño, y
"Generar link nuevo" invalida el anterior al instante. La cookie dura 30 días.

## Modelo de datos

`lib/db/schema.ts` (Drizzle) y su espejo en SQL, `lib/db/bootstrap.ts`, que corre en cada
arranque para que no haya paso de migración manual.

- **productos** — nombre, presentación, stock, stock mínimo, costo promedio, último costo y precio de venta.
- **movimientos_stock** — el libro del depósito: una fila por cada unidad que entra o sale.
- **clientes** — comercio, persona que compra, contacto, datos fiscales (razón social, CUIT,
  condición), tipo de cliente y la lista de precios que tiene asignada.
- **accesos** — un link por persona que entra al panel de ese comercio (dueño y representantes).
- **pedidos** / **pedido_items** — cabecera con fecha, estado, forma de pago, fecha y tipo de
  entrega y lo cobrado; y renglones con cantidad a precio congelado.
- **proveedores** — a quién se le compra: razón social, CUIT, condición fiscal, contacto.
- **compras** / **compra_items** — la factura del proveedor: neto, IVA, percepciones, otros costos y
  total, con el costo real congelado en cada renglón.
- **listas_precio** / **escalas_precio** — a partir de tantas unidades, tanto la unidad. Cada
  comercio puede tener su lista; siempre hay una predeterminada.
- **movimientos_caja** — el libro de caja: una fila por cada peso que entra o sale, con su medio.
- **configuracion** — ajustes del negocio en clave/valor; hoy, el régimen fiscal.
- **categorias_gasto** — las agrega el administrador desde el panel; no hay lista fija en código.
- **gastos** — fecha, monto, categoría y, opcionalmente, el pedido al que se imputan.
- **ventas_cliente** — lo que cada comercio declara haber vendido.

Tres decisiones que sostienen los números:

1. **Los importes se guardan en centavos** (enteros). Los float arrastran errores de redondeo
   al sumar cientos de renglones.
2. **El precio y el costo se congelan en el renglón del pedido.** Si mañana cambia la lista,
   el margen histórico sigue dando lo mismo.
3. **El costo de una compra incluye lo que no viene en el renglón.** Percepciones y fletes se
   reparten entre los productos a prorrata, y el IVA entra al costo solo si el régimen no lo deja
   computar. Ese número —el costo real puesto en el depósito— es el que alimenta el promedio.
4. **El stock solo se mueve por el libro.** `productos.stock` es el saldo corriente y
   `movimientos_stock` explica cómo se llegó a él: existencia inicial, compras, ajustes,
   entregas y devoluciones, cada una con su saldo resultante. No hay forma de cambiar el
   stock sin dejar la fila que lo justifica, ni siquiera editando el producto.

## Compras: de la factura al costo

Una compra nace en **borrador** y no toca nada. Al **confirmarla** entra la mercadería con su
movimiento y se recalcula el costo de cada producto:

```
costo real unitario = neto + parte de (percepciones + fletes) + IVA si no se computa
costo promedio      = (stock previo × costo previo + unidades nuevas × costo real) / total
```

Las ventas no mueven el promedio —salen a ese costo—, así que solo cambia con una compra. El
**último costo** se guarda aparte, para ver de un vistazo si el proveedor aumentó.

Confirmada, una compra no se borra: se **anula**, con motivo. Eso devuelve las unidades y deshace el
promedio con la cuenta inversa —exacta mientras sea la última compra del producto—. Si de esa
mercadería ya salieron unidades, la anulación se rechaza en vez de dejar el depósito en negativo.

El régimen fiscal (Responsable Inscripto o Monotributo) se elige en **Precios** y decide si el IVA es
crédito fiscal o costo. Cada compra guarda el régimen con el que se confirmó, así cambiarlo no
reescribe la historia.

## Caja

Un solo libro para toda la plata. Los cobros de pedidos, los pagos a proveedores y los gastos
escriben ahí **dentro de la misma transacción** que los genera: no se puede cobrar un pedido sin
que la plata entre a la caja, ni borrar un gasto sin que vuelva.

El saldo no se guarda en ningún lado — es la suma del libro. Si los movimientos están bien, el
saldo está bien; no hay un campo que pueda quedar desfasado.

Se cargan a mano solo las cosas que no vienen de otro lado: el saldo inicial, un retiro, una
diferencia de arqueo. Un pase entre efectivo y banco son dos movimientos, no uno: un depósito no
cambia cuánta plata hay, cambia dónde está.

```
te deben  = pedidos entregados con saldo abierto
debés     = compras confirmadas con saldo abierto
en stock  = unidades en depósito a costo promedio
```

Un pedido pendiente no cuenta como deuda del comercio: todavía no se entregó nada.

## Escalas de precio

Cada producto puede tener varias dentro de una lista: *+3 bultos*, *+10 bultos*, *+25 bultos*. Al
cargar un pedido se busca la lista del comercio (o la predeterminada, si no tiene una asignada) y se
sugiere la escala de mayor corte que la cantidad alcance. Comercial la puede pisar a mano —la escala
es la regla, no una jaula—. El precio elegido se congela en el renglón como siempre.

Una lista "Distribuidor" se arma con una escala desde 1 unidad: pisa el precio de catálogo para todo
comercio que la tenga asignada.

## Cómo se mueve el stock

```
en depósito   = saldo de productos.stock (suma de todos los movimientos)
comprometido  = unidades en pedidos pendientes o en preparación
libre         = en depósito − comprometido        ← contra esto se mide el stock mínimo
```

Un pedido no toca el depósito hasta que se marca **entregado**: ahí sale la mercadería y
queda el movimiento. Si el pedido vuelve atrás o se elimina, las unidades se reintegran con
su propio movimiento. El depósito nunca queda en negativo: si no alcanza, la entrega se
rechaza con el faltante a la vista en vez de dejar un saldo imposible.

El stock del comercio no se guarda: se calcula como *entregado − vendido*, así no puede
desincronizarse de las entregas.

## Cuánto aguanta el depósito

Sobre lo entregado en los últimos 60 días —una ventana más corta la mueve demasiado una semana
floja o un pedido grande—:

```
venta diaria = unidades entregadas en la ventana / días de la ventana
días de stock = libre / venta diaria
sugerencia   = venta diaria × días a cubrir − libre
```

Los días a cubrir se configuran en Reportes (30 por defecto). Un producto sin ventas no tiene ritmo:
en vez de decir "infinitos días" queda marcado como sin movimiento, y aparece en Reportes como
capital quieto.

## Impuestos estimados

Una herramienta para saber cuánta plata conviene apartar, **no una liquidación fiscal**: no
contempla saldos a favor de períodos anteriores, retenciones sufridas ni exenciones.

```
IVA débito   = de las ventas entregadas del período
IVA crédito  = de las compras confirmadas del período
saldo de IVA = débito − crédito − percepciones sufridas   (nunca menor a cero)
IIBB         = venta neta × alícuota configurada          (en cero, no se calcula)
```

Si los precios de venta ya llevan el IVA adentro —lo normal al cotizarle a un comercio— el neto se
saca de adentro del importe; si no, se calcula encima. Se elige en Reportes.

Para un monotributista el estimador no aplica: paga una cuota fija y no liquida IVA.

## Reportes

Sobre los pedidos entregados en el período:

```
margen bruto     = ventas − costo de mercadería
resultado neto   = margen bruto − gastos del período (operativos + logísticos)
margen del pedido = venta − costo − gastos imputados a ese pedido
```

Los gastos con pedido asignado se descuentan del margen de ese pedido; el resto pesa sobre el
resultado general. También hay corte por producto, por comercio y por categoría de gasto, ticket
promedio, margen por unidad y qué mercadería no rotó en el período.

Al cargar un pedido se ve el margen estimado antes de confirmarlo, contra el costo promedio del día
y antes de los gastos que se le imputen a la entrega.

## Estructura

```
app/
  login/              clave de admin y entrada por código
  acceso/[token]/     deja la cookie y manda al panel
  (admin)/            cáscara común: exige clave y dibuja el conmutador de área
    deposito/         stock, productos y movimientos
    comercial/        dashboard, clientes, pedidos, precios, compras,
                      proveedores, caja, gastos, reportes
  panel/              stock, pedidos, entregas y ventas del comercio
lib/
  db/                 esquema, conexión y seed
  datos/              consultas y reglas de negocio
components/           UI compartida
```

Las mutaciones son Server Actions, una tanda por área (`deposito/actions.ts`,
`comercial/actions.ts`, `panel/actions.ts`); las páginas son Server Components que leen la
base directo. Entregar un pedido toca las dos áreas, así que esas acciones revalidan ambas.

## Escalar más adelante

El acceso pasa por Drizzle sobre libSQL, que es SQLite: el mismo código corre contra un
archivo local en desarrollo y contra Turso en producción, sin tocar el esquema ni las
consultas. Mudarse a Postgres sería cambiar el dialecto en `lib/db/schema.ts` y el driver
en `lib/db/index.ts`; `lib/datos/` queda igual.

Antes de publicarla afuera, poné un `APP_SECRET` propio y una `ADMIN_PASSWORD` que no sea
la de fábrica.
