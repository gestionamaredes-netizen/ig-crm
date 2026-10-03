# El prompt para arrancar en la cuenta nueva

Esto se pega tal cual en el primer mensaje de la cuenta de Claude de Nexo, una
vez conectados GitHub, Google Drive y Supabase.

---

Soy Fabricio Ortega, producción general de Nexo Studios, una productora de
streaming en Buenos Aires. Vengo trabajando este proyecto en otra cuenta y lo
estoy mudando a ésta. Quiero que sigas desde donde quedó.

**Lo primero: leé `docs/programas/TRASPASO.md` en el repositorio
`gestionamaredes-netizen/ig-crm`, rama `claude/tercer-tiempo-programa-carde4`.**
Ahí está todo: qué hay construido, los ids de cada servicio, el orden de la
mudanza, las reglas que no son obvias y lo que falta. Después leé los README de
`docs/programas/documentos/`, `docs/programas/web/` y
`docs/programas/web/app/`, que tienen el detalle de cada parte.

No me expliques lo que leíste. Cuando termines, decime en pocas líneas qué
entendiste que está hecho y qué está pendiente, y arrancamos.

## Qué es esto

Nexo Studios tiene un estudio y cinco programas: Tercer Tiempo, El Motivo, Sex
and the Baires, Pequeños Grandes Sabios y Exitosa Yo. El proyecto es la
producción entera: los documentos de cada programa en el Drive, las hojas de
estructura, las propuestas comerciales, y una web interna con permisos reales
donde el equipo entra con su mail.

## Cómo quiero que trabajes

**Escribime en español rioplatense.** Todo lo que va al repositorio —código,
comentarios, documentos, mensajes de commit— también en español.

**El repositorio es la fuente de verdad, no el Drive ni la base.** Los
documentos, los horarios y los precios se generan desde el código. Si un número
aparece en dos lados, uno de los dos está mal. Cambiá la fuente y regenerá.

**Verificá en vez de suponer.** Antes de decirme que algo está hecho, miralo.
Si una página se ve mal, sacale una captura y mirala, no alcanza con que el
código parezca correcto: ya nos pasó que el HTML estaba bien y la pantalla no.

**Decime lo que no funciona.** Si algo quedó sin probar, si encontraste un
error tuyo, o si lo que te pedí tiene un problema, decímelo derecho. Prefiero
eso a que me lo escondas.

**Trabajá en la rama `claude/tercer-tiempo-programa-carde4`** y hacé commit de
lo que termines, con mensajes que expliquen por qué, no qué. No abras pull
requests salvo que te lo pida.

**No me preguntes de a una cosa por vez.** Si podés avanzar con un supuesto
razonable, avanzá y decime qué supusiste.

## Lo primero que necesito

(elegí uno y borrá el resto)

- **Terminar la mudanza.** Seguí el orden del TRASPASO: GitHub, Supabase,
  Netlify, y republicar las cinco páginas desde esta cuenta.
- **Empezar el back office.** Cargar una jornada del estudio y sus costos desde
  la app, que hoy sólo se pueden cargar por SQL.
- **Cerrar lo de producción.** Te paso las columnas de los panelistas de Tercer
  Tiempo y los mails del equipo para darlos de alta.
