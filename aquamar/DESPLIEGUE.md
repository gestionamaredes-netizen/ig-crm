# Publicar Aqua Mar

Cómo poner el panel en internet. Son cuatro pasos y el orden importa: las
variables de entorno tienen que estar **antes** del primer despliegue.

> Ojo con el `DESPLIEGUE.md` de la raíz del repositorio: ese es de **El Titán**,
> el otro proyecto que vive acá. No sirve para esta app.

## Por qué hace falta una base alojada

La app guarda todo en SQLite. En desarrollo es un archivo en `data/`, y eso
alcanza. En Netlify no: el disco es efímero, cada pedido arranca con el disco
vacío, y un archivo ahí perdería los datos entre una pantalla y la siguiente.

Por eso, cuando detecta que corre en Netlify, Vercel o Lambda y no encuentra
`TURSO_DATABASE_URL`, la app **falla con un mensaje claro en vez de arrancar**.
Es a propósito: es preferible no abrir a abrir y perder lo cargado en silencio.

Turso es SQLite alojado y habla el mismo protocolo que ya usa la app, así que
no hay nada que reescribir: son dos variables de entorno.

## 1. La base, en Turso

En [turso.tech](https://turso.tech) crear una cuenta y una base. De ahí salen
dos datos:

- la URL, con forma `libsql://<nombre>-<usuario>.turso.io`
- un token de autenticación

Con la CLI son dos comandos:

```bash
turso db create aquamar
turso db show aquamar --url
turso db tokens create aquamar
```

No hay que crear ninguna tabla: la app arma el esquema sola en el primer
arranque y lo mantiene al día en cada despliegue.

## 2. El sitio, en Netlify

En [app.netlify.com/start](https://app.netlify.com/start), conectar GitHub y
elegir el repositorio `gestionamaredes-netizen/ig-crm`.

**No hay que tocar la pantalla de configuración del build.** El `netlify.toml`
de la raíz ya define que la base es `aquamar/`, el comando es `npm run build` y
el plugin es el de Next. Netlify lo lee solo.

Un detalle del repositorio: tiene dos proyectos y Netlify lee **un solo
`netlify.toml` por sitio**. El de la raíz es el de Aqua Mar; El Titán tiene el
suyo en `titan/netlify.toml`. Si algún día se publica también El Titán, va como
un sitio aparte apuntando a esa carpeta.

## 3. Las variables de entorno

En *Site configuration → Environment variables*, antes de desplegar:

| Variable | Qué va | De dónde sale |
|---|---|---|
| `TURSO_DATABASE_URL` | `libsql://…turso.io` | paso 1 |
| `TURSO_AUTH_TOKEN` | el token | paso 1 |
| `ADMIN_PASSWORD` | la clave para entrar al panel | la elegís vos |
| `APP_SECRET` | cadena larga y al azar, firma la sesión | generala, ver abajo |
| `DEPOSITO_PASSWORD` | *(opcional)* clave del usuario de depósito | la elegís vos |

`APP_SECRET` se genera así, y no se guarda en el repositorio:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Si `DEPOSITO_PASSWORD` queda sin definir, el usuario de depósito directamente no
existe. Es deliberado: mejor que la puerta no exista a que exista con una clave
de fábrica que nadie cambió.

## 4. La rama que se publica

Netlify despliega una rama de producción. Conviene que sea una rama estable, no
la rama de trabajo del día: lo que se mergee ahí sale al aire solo.

Se elige en *Site configuration → Build & deploy → Branch to deploy*.

## Cuando ya está arriba

1. Entrar a `/login` con `ADMIN_PASSWORD`.
2. Ir a **Comercial → Prospección** y tocar *Cargar las papeleras*: ahí entra el
   relevamiento de La Matanza.
3. En el mapa, *Ubicar direcciones* pasa los pines del centro del barrio a la
   puerta de cada comercio.

El mapa no necesita ninguna clave ni cuenta: los tiles de OpenStreetMap y el
geocodificador se piden desde el navegador de quien mira, no desde el servidor.

## Si el build falla

El punto más probable es el plugin `@netlify/plugin-nextjs` contra la versión de
Next que usa la app (16.2). La alternativa es Vercel, acá abajo.

## Plan B: Vercel

Es la casa de Next, así que no hay plugin que pueda quedar viejo. Mismo
repositorio y las mismas variables de la tabla de arriba, con dos cuidados:

**1. El Root Directory va en `aquamar`.** En la raíz del repositorio hay un
`vercel.json` que construye El Titán —y pide un secreto, `@elt_api_url`, que en
una cuenta nueva no existe—, así que un proyecto importado desde la raíz falla
antes de empezar. Con el Root Directory apuntado a `aquamar`, Vercel lee el
`vercel.json` de esta carpeta, que declara Next y nada más.

**2. El plan Hobby es para uso personal, no comercial**, según los términos de
Vercel. Este panel es la herramienta de trabajo de una distribuidora, así que
correspondería el plan Pro. El plan gratuito de Netlify no tiene esa
restricción: por eso Netlify va primero y esto es el plan B.
