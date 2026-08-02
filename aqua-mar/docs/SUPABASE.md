# Conectar Supabase al panel de Aqua Mar

Con Supabase conectado, el panel deja de ser una vidriera vacía y pasa a
ser el CRM real del equipo: los pedidos, clientes y consultas mayoristas
que se cargan quedan guardados en una base compartida, y cada persona
entra con su propia cuenta (email y contraseña).

Todo el código ya está preparado. Lo único que falta son dos valores de
conexión que salen de crear el proyecto en Supabase. El plan gratuito
alcanza de sobra para arrancar.

## Paso 1 — Crear el proyecto

1. Entrá a [supabase.com](https://supabase.com) y creá una cuenta
   (puede ser con el Gmail de Aqua Mar).
2. **New project** → elegí un nombre (por ejemplo `aqua-mar`), una
   contraseña de base de datos (guardala, aunque casi nunca se usa) y la
   región **South America (São Paulo)**, que es la más cercana.
3. Esperá un par de minutos a que el proyecto termine de crearse.

## Paso 2 — Crear las tablas

1. En el menú lateral del proyecto: **SQL Editor**.
2. Abrí el archivo [`supabase/schema.sql`](../supabase/schema.sql) de este
   repo, copiá TODO el contenido y pegalo en el editor.
3. **Run**. Listo: quedan creadas las tablas `clientes`, `pedidos` y
   `consultas_mayoristas`, con la seguridad ya configurada (solo el
   equipo logueado puede leer y escribir; se puede correr de nuevo sin
   riesgo si hiciera falta).

## Paso 3 — Apagar el registro público

Para que nadie pueda crearse una cuenta por su lado:

1. **Authentication → Sign In / Providers → Email**.
2. Desactivá **Allow new users to sign up**. Las cuentas del equipo las
   creás vos a mano (paso 4).

## Paso 4 — Crear las cuentas del equipo

1. **Authentication → Users → Add user → Create new user**.
2. Cargá el email y una contraseña para cada persona del equipo.
   Marcá **Auto confirm user** para que la cuenta quede activa al toque.
3. Para dar de baja a alguien: mismo lugar, borrar el usuario. Deja de
   poder entrar al panel al instante.

## Paso 5 — Copiar los dos valores de conexión

1. **Settings → API** (o "Project Settings → Data API" según la versión).
2. Copiá:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **anon public** key (un texto largo que arranca con `eyJ…`)

La anon key es pública por diseño: sola no deja ver ni tocar nada,
porque las tablas exigen usuario logueado. La que NUNCA se comparte ni
se pone en el sitio es la **service_role** key.

## Paso 6 — Conectar el sitio

Dos caminos según cómo estés deployando:

**A. Deploy manual (ZIP arrastrado a Netlify) — el caso actual:**
los valores tienen que estar en el código al momento de compilar.
Pegalos en `src/config/supabase.ts` (campos `url` y `anonKey`) o en un
`.env.local`, compilá con `npm run build` y subí el nuevo `out/`/ZIP.
Si el ZIP te lo genera Claude: pasale los dos valores y te devuelve el
ZIP ya conectado.

**B. Deploy conectado a GitHub (recomendado a futuro):** cargá
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en
Netlify → Site configuration → Environment variables y redeployá.

## Qué cambia en el panel una vez conectado

- La pantalla de entrada pide **email y contraseña** (la cuenta creada en
  el paso 4) en lugar de la contraseña compartida.
- Aparecen los botones **Nuevo cliente**, **Nuevo pedido** y **Nueva
  consulta** en sus secciones, y el estado de cada pedido/consulta se
  cambia desde un selector.
- Todo lo cargado queda en la base compartida: cualquier persona del
  equipo, desde cualquier dispositivo, ve lo mismo.
- El "Modo demo" desaparece (ya no hace falta) y el dashboard calcula los
  KPIs con los datos reales cargados. Lo que no sale de la base (visitas,
  conversión, WhatsApps) sigue en "—" hasta conectar la analítica.
- Arriba a la derecha hay un botón para **cerrar sesión**.

## Editar o borrar registros

Por ahora el panel permite dar de alta y cambiar estados. Para corregir
un dato puntual o borrar un registro: Supabase → **Table Editor** →
elegir la tabla → editar la fila. La próxima iteración del CRM puede
sumar edición y baja desde el propio panel si hace falta.

## Si algo falla

- **"Email o contraseña incorrectos"**: revisá que el usuario exista en
  Authentication → Users y esté confirmado (Auto confirm al crearlo).
- **El panel entra pero no guarda / no muestra nada**: casi seguro no se
  corrió `schema.sql` completo (paso 2). Volvé a correrlo entero.
- **Aviso "No pudimos conectar con la base"**: revisá que la Project URL
  y la anon key estén bien pegadas y que el proyecto de Supabase no esté
  pausado (el plan gratuito pausa proyectos tras una semana sin uso;
  se reactiva con un clic en el dashboard de Supabase).
