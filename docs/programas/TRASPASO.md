# Traspaso a la cuenta de Nexo Studios

Este documento existe para que el proyecto no dependa de una conversación.
Acá está todo lo que hay que reconectar, en qué orden, y con qué ids. Si lo
seguís de arriba abajo, quien lo tome puede seguir trabajando sin haber estado
en ninguna charla anterior.

**Última actualización:** 3 de octubre de 2026.

## La idea en una línea

Casi nada de este proyecto vive en la cuenta de Claude. Vive en GitHub, en
Supabase y en el Drive. Claude es la herramienta, no el depósito. Eso es
deliberado: por eso este traspaso es corto.

## Las cuatro cuentas

| | Dónde | Quién es dueño hoy | Qué hay que hacer |
|---|---|---|---|
| **Repositorio** | `github.com/gestionamaredes-netizen/ig-crm` | cuenta personal | Transferir a una cuenta u organización de Nexo |
| **Base de datos** | Supabase, proyecto `nexo-produccion` | organización `Impro-Bares`, plan gratis | Transferir el proyecto o crear uno nuevo y correr las migraciones |
| **Documentos** | Google Drive | `nexostudios.adm@gmail.com` | **Nada. Ya es de Nexo.** |
| **El sitio** | Netlify | la cuenta con que se reclamó | Crear el sitio en una cuenta de Nexo y volver a subir |

Si Nexo va a depender de esto, las cuatro tienen que ser de Nexo y no de
ninguna persona en particular. Una cuenta personal se va el día que esa
persona se va.

## Qué hay construido

**Los documentos de producción.** 61 documentos de Google en el Drive, en ocho
carpetas por programa, más 72 PDF que viven en el repositorio. El texto de los
61 está en `documentos/fuente/` y el PDF se genera desde ahí: el Drive no es la
fuente de verdad, el repositorio sí.

**Cinco páginas publicadas**, una por programa, más una de dirección. Se
generan con un comando desde las mismas fuentes. Hoy son artifacts de Claude y
están atadas a la cuenta vieja; se republican desde la nueva en un minuto.

**La app con permisos de verdad.** Una web donde entrás con tu mail y el
servidor decide qué te manda. La base tiene once tablas, dieciocho políticas y
ocho migraciones, todas en el repositorio y replantables en orden.

## Los ids que hacen falta

```
Repositorio      github.com/gestionamaredes-netizen/ig-crm
Rama de trabajo  claude/tercer-tiempo-programa-carde4

Supabase
  proyecto       nexo-produccion
  id             yjcuatjsbyaluirdshnb
  región         sa-east-1 (São Paulo)
  organización   Impro-Bares (xhkfdguievnovgnmohje) · plan gratis
  URL            https://yjcuatjsbyaluirdshnb.supabase.co
  clave pública  sb_publishable_gNvAjq7uIwDPjfKAJuS9qQ_TApoZnlu

Drive
  dueño          nexostudios.adm@gmail.com
  carpeta raíz   1oC11X8QOZag7WNrIsiSPSgFS7MhjyfeW
```

La clave pública es pública a propósito: identifica al proyecto, no a la
persona, y sola no abre nada porque el rol anónimo no tiene ninguna política a
favor. Está verificado tabla por tabla.

### Las cinco páginas publicadas

| | |
|---|---|
| Dirección | https://claude.ai/artifact/6r1PxGD8CAjXEmEr2vG3yd |
| Tercer Tiempo | https://claude.ai/artifact/1QfaF7bWZVKK11VBnpwgCA |
| El Motivo | https://claude.ai/artifact/DRnePdonV9PcBcyyBbqhen |
| Sex and the Baires | https://claude.ai/artifact/KNTCCrUN2pBJVL1SMhhhsz |
| Pequeños Grandes Sabios | https://claude.ai/artifact/GfUv32bX4cesEUqfPe5ELV |
| Exitosa Yo | https://claude.ai/artifact/PZ1QhuALo9EP2NLdo5skLL |

Estos links mueren con la cuenta vieja. No es grave: se regeneran y se vuelven
a publicar.

## El orden de la mudanza

**1. GitHub primero.** Es el que arrastra todo lo demás, porque es la fuente de
verdad. Se transfiere desde la configuración del repositorio, o se importa
desde `github.com/new/import`, y no se pierde ni el historial ni los commits.

Después hay que actualizar la URL cruda de `CRUDO`, en `documentos/drive.py` y
en `web/datos_web.py`, que apunta a
`raw.githubusercontent.com/gestionamaredes-netizen/...`.

**Eso no afecta a los 61 documentos que ya están en el Drive.** El Drive se
queda con las imágenes cuando importa el HTML: lo que se sube pesa 5 KB y el
documento que queda pesa 92 KB, con los dos logos adentro. Así que el
repositorio puede cambiar de nombre, de dueño o pasar a privado sin que se
rompa ninguno de los 61.

Lo que sí deja de funcionar es **generar documentos nuevos**: al crear uno, el
Drive sale a buscar el logo a esa dirección, y si el repositorio es privado o
la dirección cambió, el documento nuevo nace sin logo. Por eso hay que
actualizar `CRUDO` antes de volver a generar, no antes de mudarse.

**2. Supabase, cuanto antes.** Es lo único que acumula datos que no están en el
repositorio. Hoy tiene los cinco programas, los seis de Tercer Tiempo, una
persona y el contenido de los programas: migrar es barato. Dentro de tres meses
con jornadas y facturas cargadas, no.

Dos caminos. Transferir el proyecto a una organización de Nexo conserva los
datos, la URL y la clave, y no hay que tocar nada más. Crear uno nuevo y correr
las ocho migraciones en orden deja la base limpia pero vacía, y obliga a
cambiar la URL y la clave en `web/app/sitio/app.js`.

**3. Netlify.** Crear el sitio en una cuenta de Nexo y subir el ZIP. Cambia la
dirección, así que hay que rehacer el paso de abajo.

**4. Supabase otra vez, con la dirección nueva.** En Authentication → URL
Configuration, poner la dirección del sitio como *Site URL* y como *Redirect
URL* con `/**` al final. **Sin esto el link del mail no vuelve a ningún lado**,
y parece que la web está rota cuando no lo está.

**5. La cuenta de Claude nueva.** Conectar GitHub, Google Drive y Supabase —son
tres autorizaciones— y republicar las páginas.

## Cómo se regenera cada cosa

```
documentos/kits.py        los cinco kit de marca, desde el modelo comercial
documentos/pdf.py         los 72 PDF, y verifica que ninguno se recorte
documentos/drive.py       el HTML que el Drive convierte en documento
documentos/paquete.py     el ZIP con el árbol igual al del Drive
estructuras/*.sh          las hojas de estructura y la grilla
presentaciones/*.sh       las cinco propuestas comerciales
web/sitio.py              las cinco páginas de programa
web/direccion.py          la página de dirección
web/app/contenido.py      lo que la app lee de la base, más su estilo
```

Cada carpeta tiene su README con el detalle.

## Las reglas que no son obvias

**Reemplazar un documento del Drive son tres pasos y ninguno es opcional:**
crear el nuevo, mandar el viejo a la papelera, y escribir el id nuevo en
`documentos/fuente/_indice.json`. El Drive no deja actualizar en el lugar por
este camino, así que el id cambia cada vez. Si no se actualiza el índice, el
próximo borrado falla con un "no tenés permiso" que miente —lo que pasa es que
el archivo ya no existe— y queda un duplicado en la carpeta.

**Lo que se genera no se edita a mano, y lo que se carga a mano no se genera.**
El contenido de producción —escaletas, documentos, grilla— sale del
repositorio. Los datos del negocio —jornadas, plata, gente, ideas, auspicios—
viven en la base y se editan en la app. Si alguien edita una escaleta desde la
web, el próximo regenerado se la pisa sin avisar.

**Un número escrito dos veces se contradice solo.** Los precios salen de
`presentaciones/comercial.py`, los horarios de `estructuras/datos.py`. Nada se
escribe dos veces.

**El Drive se queda con las imágenes al importar.** Un documento creado desde
HTML con un `<img>` externo no apunta a esa dirección para siempre: la
descarga y la mete adentro. Por eso los 61 sobreviven a cualquier cambio del
repositorio, y por eso un documento nuevo sí necesita que la dirección
funcione en el momento de crearlo.

**Los PDF no suben por el conector.** Un JPG de 19.246 bytes llegó del otro
lado con 11.894, cortado a la mitad y sin aviso. Por eso los PDF se entregan en
`Nexo-Studios-PDF-para-el-drive.zip` y se arrastran a mano.

## Lo que falta

**Del back office.** La base tiene las tablas del negocio —jornadas, facturas,
cobros, costos, auspicios— con sus permisos, y el tablero las lee. Lo que no
hay es un solo formulario para cargarlas: hoy todo entra por SQL. El orden
sugerido es cargar una jornada, después sus costos, después facturas y cobros,
después los auspicios como pipeline, y por último el alta de gente.

**De producción.**

- Qué columna se lleva cada uno de los cuatro panelistas de Tercer Tiempo.
- Los mails de los seis, que están cargados sin mail y por eso no pueden entrar.
- Si Fede Aguirre y Nicolás Lahargou tienen que ver los números del estudio:
  hoy están como integrantes.
- Si Exitosa Yo sale en vivo o grabado.
- Los elencos de Sex and the Baires y Pequeños Grandes Sabios.

**De infraestructura.**

- El Drive sigue compartido como "cualquiera con el link puede editar".
- Re-sembrar el contenido de la base se hace a mano. Corresponde una acción de
  GitHub que lo corra en cada push, con la clave de servicio como secreto.
- El mail de Supabase tiene un tope bajo por hora. Para dar de alta a todo el
  equipo hace falta un servicio de mail propio.
- El plan de Supabase es gratis y un proyecto free se pausa solo después de una
  semana sin uso.

## Lo que nunca se probó

La vuelta completa contra Supabase desde la app: el login por mail, la lectura
con sesión y el alta de ideas. El contenedor donde se construyó esto no tiene
salida a `supabase.co`, así que eso se prueba recién al publicar.

Los permisos sí están probados, pero contra la base directamente, con dos
cuentas de distinto rol.
