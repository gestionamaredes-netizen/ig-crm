# Aqua Mar

Gestión mayorista de Powerfull 3 en 1: inventario, clientes, pedidos, gastos y rentabilidad,
más un panel propio para cada comercio.

## Levantarla

No hace falta crear cuentas ni configurar nada: la base es un archivo SQLite local.

```bash
cd aquamar
npm install
npm run db:seed   # categorías de gasto + un producto y un comercio de ejemplo
npm run dev       # http://localhost:3000
```

La clave del panel de administración es `aquamar`. Para cambiarla, copiá `.env.example`
a `.env.local` y editá `ADMIN_PASSWORD`.

El seed imprime los links de acceso del comercio de ejemplo. Los links reales se generan
solos al crear cada cliente y se copian desde su ficha.

Otros comandos: `npm test` (lógica de negocio), `npm run build`, `npm start`.

## Cómo entra cada uno

| Quién | Cómo entra | Qué ve |
| --- | --- | --- |
| Administración | clave en `/login` | todo |
| Comercio | link `/acceso/<token>` | solo lo suyo |
| Representante | otro link `/acceso/<token>` del mismo comercio | lo mismo que el comercio |

Cada acceso es una fila aparte: se revoca el del representante sin tocar el del dueño, y
"Generar link nuevo" invalida el anterior al instante. La cookie dura 30 días.

## Modelo de datos

`lib/db/schema.ts` (Drizzle) y su espejo en SQL, `lib/db/bootstrap.ts`, que corre en cada
arranque para que no haya paso de migración manual.

- **productos** — nombre, presentación, stock, costo y precio de venta (editables por producto).
- **clientes** — comercio, persona que compra, teléfono, dirección, email, redes (opcional), notas.
- **accesos** — un link por persona que entra al panel de ese comercio (dueño y representantes).
- **pedidos** / **pedido_items** — cabecera con fecha y estado, y renglones con cantidad.
- **categorias_gasto** — las agrega el administrador desde el panel; no hay lista fija en código.
- **gastos** — fecha, monto, categoría y, opcionalmente, el pedido al que se imputan.
- **ventas_cliente** — lo que cada comercio declara haber vendido.

Dos decisiones que sostienen los números:

1. **Los importes se guardan en centavos** (enteros). Los float arrastran errores de redondeo
   al sumar cientos de renglones.
2. **El precio y el costo se congelan en el renglón del pedido.** Si mañana cambia la lista,
   el margen histórico sigue dando lo mismo.

El stock del comercio no se guarda: se calcula como *entregado − vendido*, así no puede
desincronizarse de las entregas. El stock del mayorista se descuenta cuando el pedido pasa a
**entregado**, y se reintegra si vuelve atrás.

## Reportes

Sobre los pedidos entregados en el período:

```
margen bruto     = ventas − costo de mercadería
resultado neto   = margen bruto − gastos del período (operativos + logísticos)
margen del pedido = venta − costo − gastos imputados a ese pedido
```

Los gastos con pedido asignado se descuentan del margen de ese pedido; el resto pesa sobre el
resultado general. También hay corte por producto, por comercio y por categoría de gasto.

## Estructura

```
app/
  login/            clave de admin y entrada por código
  acceso/[token]/   deja la cookie y manda al panel
  admin/            inventario, clientes, pedidos, gastos, reportes
  panel/            stock, pedidos, entregas y ventas del comercio
lib/
  db/               esquema, conexión y seed
  datos/            consultas y reglas de negocio
components/         UI compartida
```

Las mutaciones son Server Actions (`app/admin/actions.ts`, `app/panel/actions.ts`); las páginas
son Server Components que leen la base directo.

## Escalar más adelante

El esquema es SQL estándar y el acceso pasa por Drizzle. Mudarse a Postgres o Supabase es
cambiar el dialecto en `lib/db/schema.ts` y el driver en `lib/db/index.ts`; las consultas de
`lib/datos/` quedan igual. Antes de publicarla afuera, poné un `APP_SECRET` propio y una
`ADMIN_PASSWORD` que no sea la de fábrica.
