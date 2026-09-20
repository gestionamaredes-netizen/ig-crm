# Tablero de prospectos — app propia

El mismo tablero que vivía como artifact de Claude, ahora como app en dominio
propio. Se mudó por una razón concreta: **dentro de claude.ai el ícono del
acceso directo lo pone la página de afuera**, así que el logo de Nexo nunca
llegaba al celular. Acá la página de afuera es nuestra.

De paso se ganó algo mejor: la firma de quién edita ya no depende del navegador.
Cada uno entra con su nombre y una clave, y el servidor firma la cookie — nadie
puede editar haciéndose pasar por otro.

## Puesta en marcha

Hay tres pasos que necesitan tus cuentas.

### 1. La base de datos (Turso)

Es la misma que ya usás en `aquamar/`. Con el CLI de Turso:

```bash
turso db create nexo-prospectos
turso db show nexo-prospectos --url      # -> TURSO_DATABASE_URL
turso db tokens create nexo-prospectos   # -> TURSO_AUTH_TOKEN
```

No hace falta correr ninguna migración: el esquema se crea solo la primera vez
que la app toca la base.

### 2. El sitio en Netlify

En Netlify, **Add new site → Import an existing project**, elegí este mismo
repositorio y configurá:

- **Base directory:** `prospectos`
- El resto lo lee de `prospectos/netlify.toml`

> Es un sitio **nuevo y separado** del de Aqua Mar. No toques el `netlify.toml`
> de la raíz: ese es el que deploya `aquamar/` y si lo cambiás se cae.

### 3. Las variables

En **Site configuration → Environment variables**:

| Variable | Qué va |
|---|---|
| `TURSO_DATABASE_URL` | La URL del paso 1 |
| `TURSO_AUTH_TOKEN` | El token del paso 1 |
| `EQUIPO_PASSWORD` | La clave que comparten Benja, Juli, Fede y Nico |
| `APP_SECRET` | Una cadena larga y al azar (firma la sesión) |

Sin `TURSO_DATABASE_URL` la app falla al primer pedido, a propósito: en Netlify
el disco se borra entre pedidos y el seguimiento se perdería en silencio.

## El ícono en el celular

Ya está todo puesto: `apple-touch-icon` de 180, íconos de 192 y 512, manifest y
`theme_color`. Cuando cada uno haga *Agregar a pantalla de inicio* va a quedar
**el logo de Nexo sobre el fondo oscuro**, con el nombre corto **Nexo**.

- Android / Chrome: menú ⋮ → *Agregar a pantalla principal*
- iPhone: tiene que ser **Safari** → compartir → *Añadir a pantalla de inicio*

Los íconos se generaron con el logo al 76% del cuadro, así que ninguna máscara
lo recorta, sea cuadrada, squircle o redonda.

## Quién entra

Benja, Juli, Fede y Nico. Todos con la misma clave; lo que los distingue es el
nombre que eligen al entrar, que queda firmado en cada cambio. Para sumar o
sacar gente se edita `PERSONAS` en `docs/comercial/prospectos.py` y se regenera.

## De dónde salen los datos

Los 58 negocios base viven en `docs/comercial/prospectos.py` y se vuelcan a
`lib/datos.ts` con:

```bash
python3 docs/comercial/exportar-ts.py
```

**`lib/datos.ts` no se edita a mano**: se pisa en cada exportación.

Los negocios que el equipo carga desde la app van a la tabla `agregados` de la
base, no al archivo — regenerar los datos base no los borra.

## Cómo está armado

| Archivo | Qué hace |
|---|---|
| `lib/db/index.ts` | Conexión a Turso (o a un archivo local en dev) y creación del esquema |
| `lib/auth.ts` | Clave del equipo y cookie firmada con HMAC |
| `lib/seguimiento.ts` | Lectura y escritura del seguimiento, historial y altas |
| `app/actions.ts` | Server actions, con validación contra listas cerradas |
| `components/Tablero.tsx` | Toda la interfaz |
| `app/globals.css` | El mismo sistema visual del tablero anterior |

Las tres tablas son `seguimiento`, `historial` y `agregados`.

## Trabajar en local

```bash
cd prospectos
cp .env.local.example .env.local   # poné una clave y un secreto cualesquiera
npm install
npm run dev
```

Sin `TURSO_DATABASE_URL` usa un SQLite en `./data/`, que alcanza para probar.

## Qué se probó antes de subir

- El build pasa con TypeScript en estricto.
- Sin sesión, la raíz redirige al login.
- Una cookie con el nombre cambiado y la firma vieja se rechaza: no se puede
  editar haciéndose pasar por otro.
- Guardar estado, responsable y notas escribe en la base, suma al historial y
  la página recuenta el embudo al recargar.
