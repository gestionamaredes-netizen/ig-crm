# SEO Local — Diseño

**Fecha:** 2026-07-19
**Estado:** aprobado, listo para plan de implementación
**Dueño:** Fabricio (Iniciativa Global)

## Propósito

Herramienta interna de Iniciativa Global para **detectar, diagnosticar y captar** comercios locales
como clientes de un servicio de posicionamiento SEO local.

No es un producto para el cliente final. Es un arma de venta: barre una zona geográfica, encuentra
los negocios peor posicionados en Google, genera un diagnóstico concreto de cada uno y lo convierte
en un informe presentable que se usa para cerrar la venta.

**Objetivo inmediato:** salir a ofrecer el servicio en la semana del 2026-07-20, empezando por el
tramo de calle Gorriti en Francisco Álvarez (partido de Moreno).

## Alcance

### Dentro de alcance (Fase 1)

- Barrido de una zona geográfica configurable, vía Google Places API
- Auditoría automática de la ficha de Google de un negocio
- Comparación contra competidores del mismo rubro en la misma zona
- Puntaje de visibilidad local (0–100) con hallazgos accionables
- Informe imprimible a PDF con marca Iniciativa Global
- Conversión de negocio auditado a lead del embudo de IG CRM

### Fuera de alcance (fases posteriores)

- Panel de acceso para el cliente final (Fase 2)
- Link público compartible del informe (Fase 3 — es la misma página con permiso de lectura)
- Grilla geográfica de posicionamiento (geo-grid) — requiere proveedor de terceros
- Gestión y respuesta de reseñas
- Citations / directorios
- Facturación y cobro

### Decisiones tomadas y descartadas

| Decisión | Elegido | Descartado | Razón |
|---|---|---|---|
| Producto | Herramienta interna | SaaS para el cliente | Es lo único entregable en una semana; el panel del cliente es Fase 2 |
| Fuente de datos | Google Places API + carga manual | Scraping de Google Maps | El scraping se rompe sin aviso; inaceptable durante una reunión de venta |
| Fuente de datos | Google Places API | DataForSEO / SerpApi | Se agrega después detrás de la misma interfaz, si hace falta geo-grid |
| Entregable | PDF → pantalla → link público | Las tres a la vez | El PDF se genera desde HTML, así que la pantalla sale casi gratis |
| Ubicación | Módulo dentro de IG CRM | App separada / script | Reusa auth, DB y branding; conecta con el embudo existente |

## Arquitectura

Módulo nuevo dentro de la app existente (`IG OS/web`), al lado de los workspaces de las 4 empresas.
Reusa el login por magic link, la base Supabase con RLS, y el sistema de diseño oscuro ya construido.

Cinco piezas, cada una con una responsabilidad y testeable de forma aislada:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Proveedor de   │────▶│  Barrido de zona │────▶│  negocios (DB)  │
│  datos          │     └──────────────────┘     └────────┬────────┘
│  (interfaz)     │                                       │
│                 │────▶┌──────────────────┐◀─────────────┘
└─────────────────┘     │  Motor de        │
        ▲               │  auditoría       │────▶┌─────────────────┐
        │               │  (puro)          │     │ auditorias (DB) │
   ┌────┴────┐          └──────────────────┘     └────────┬────────┘
   │ Google  │                                            │
   │ Places  │                                   ┌────────▼────────┐
   └─────────┘                                   │    Informe      │
   ┌─────────┐                                   │  (HTML → PDF)   │
   │ Manual  │                                   └─────────────────┘
   └─────────┘                                   ┌─────────────────┐
                                                 │ Puente a leads  │
                                                 │  (CRM existente)│
                                                 └─────────────────┘
```

### 1. Proveedor de datos

Única pieza que habla con el mundo exterior. Interfaz:

```ts
interface ProveedorSeoLocal {
  buscarEnZona(punto: Coordenada, radioMetros: number, rubro?: string): Promise<NegocioResumen[]>
  obtenerFicha(idExterno: string): Promise<NegocioFicha>
  buscarPorTexto(consulta: string, sesgo: Coordenada): Promise<NegocioResumen[]>
}
```

Implementaciones en Fase 1:

- **`ProveedorGooglePlaces`** — Places API (New). Endpoints `places:searchNearby`,
  `places:searchText`, y `GET /v1/places/{id}`. Los nombres exactos de campos y endpoints se
  verifican contra la documentación vigente al implementar, no de memoria.
- **`ProveedorManual`** — lee de la tabla `negocios` sin llamar a Google. Respaldo para operar
  sin API key y para tests.

Ningún otro módulo importa el SDK de Google ni conoce el formato de respuesta de Places. Cambiar a
DataForSEO es escribir una tercera implementación de esta interfaz.

**Credenciales:** `GOOGLE_PLACES_API_KEY` en `web/.env.local` (no versionado). Solo se lee desde
código de servidor; nunca se expone al navegador.

### 2. Barrido de zona

Recorre los puntos configurados de una zona, junta los resultados, deduplica por identificador de
Google y persiste en `negocios`. Registra la cantidad de consultas gastadas.

**Zona inicial — Gorriti, Francisco Álvarez.** Tramo entre Almafuerte y el Acceso Oeste.
Extremos provistos por el usuario:

- Punto A (Gorriti y Almafuerte): `-34.60208108, -58.86292683`
- Punto B (Gorriti cerca del Acceso Oeste): `-34.60989714, -58.86890736`

Largo del tramo ≈ **1.030 m**. Un solo círculo requeriría 515 m de radio y cubriría ~5 veces el área
de interés, arrastrando negocios de calles paralelas. Se usan **3 puntos de barrido de 350 m**:

| # | Latitud | Longitud |
|---|---|---|
| 1 | `-34.603384` | `-58.863924` |
| 2 | `-34.605989` | `-58.865917` |
| 3 | `-34.608594` | `-58.867911` |

Las zonas son datos, no código: se pueden cargar otras calles o barrios desde la interfaz.

### 3. Motor de auditoría

Función pura: entra la ficha de un negocio más las fichas de sus competidores del mismo rubro en la
zona, sale una lista de hallazgos con gravedad y un puntaje.

Sin I/O, sin base de datos, sin red. Es la pieza que más va a evolucionar, por eso queda aislada y
cubierta por tests con fichas de ejemplo.

```ts
function auditar(negocio: NegocioFicha, competidores: NegocioFicha[], manual: RevisionManual): Auditoria
```

### 4. Informe

Página HTML con marca Iniciativa Global (fondo `#0B0B0D`, cards `#17181C`, gradiente de marca),
con hoja de estilos de impresión. El PDF se genera imprimiendo esa página. La misma ruta sirve
como pantalla de presentación en vivo (Fase 2) y como link público (Fase 3).

### 5. Puente a leads

Convierte un negocio auditado en lead del embudo existente de IG CRM, arrastrando nombre, teléfono,
rubro, puntaje y un enlace a la auditoría.

## Reglas de auditoría

Puntaje de visibilidad local de 0 a 100, en tres bloques.

### Bloque 1 — La ficha (40 puntos)

Todo se obtiene de Places y se corrige en una tarde de trabajo.

| Hallazgo | Puntos | Condición de falla |
|---|---|---|
| Sin teléfono | 8 | campo de teléfono vacío |
| Sin sitio web | 8 | campo de web vacío |
| Horarios incompletos | 8 | menos de 7 días cargados |
| Sin categoría principal | 6 | tipo primario ausente |
| Pocas fotos | 6 | menos de 5 fotos |
| Marcado como cerrado | 4 | estado operativo distinto de "abierto" |

### Bloque 2 — La reputación (30 puntos)

| Hallazgo | Puntos | Condición de falla |
|---|---|---|
| Puntaje bajo | 12 | promedio menor a 4.0 |
| Pocas reseñas | 12 | menos de 10 reseñas |
| Reseñas viejas | 6 | la más reciente tiene más de 6 meses |

### Bloque 3 — La competencia (30 puntos)

Comparación contra negocios del mismo rubro dentro de la zona.

| Hallazgo | Puntos | Condición de falla |
|---|---|---|
| Puesto por reseñas | 12 | está en el tercio inferior de su rubro |
| Puesto por puntaje | 8 | está en el tercio inferior de su rubro |
| Posición en búsqueda | 10 | no aparece en los primeros 5 resultados de "rubro + Francisco Álvarez" |

### Revisión manual

Places **no** informa si la ficha está reclamada por el dueño ni si el dueño responde las reseñas.
Ambas cosas se verifican a ojo en la ficha en 10 segundos. Son dos casillas en la interfaz:

- Ficha reclamada por el dueño — penalización de 10 puntos si no
- El dueño responde las reseñas — penalización de 5 puntos si no

Estas penalizaciones se restan del total de los tres bloques, con **piso en 0**: el puntaje final
nunca es negativo.

Mientras no se marquen, quedan como **no evaluadas**, no se aplica penalización, y el informe
declara que faltan verificar. No se asume ni se inventa el valor.

### Salida

El puntaje es secundario. Lo que se presenta al prospecto es la conclusión accionable:

> Estás 6º de 9 en tu rubro. Con 14 reseñas más pasás al 3er puesto.
> Te falta cargar el sitio web y 4 fotos.

Cada hallazgo se traduce a una acción concreta con su impacto estimado en el puesto.

## Modelo de datos

Tres tablas nuevas en la Supabase existente, con RLS activo siguiendo el patrón ya establecido en
el proyecto.

**`zonas`** — nombre, puntos de barrido (lista de coordenadas), radio en metros, filtro de rubro
opcional, fecha del último barrido.

**`negocios`** — identificador externo de Google (único), nombre, rubro, dirección, coordenadas,
teléfono, sitio web, horarios, puntaje, cantidad de reseñas, fecha de la reseña más reciente,
cantidad de fotos, estado operativo, zona a la que pertenece, fecha de última consulta, y las dos
marcas de revisión manual.

**`auditorias`** — negocio, fecha, puntaje total, puntaje por bloque, hallazgos (JSON), posición
en el ranking del rubro, y cantidad de competidores comparados.

Guardar cada auditoría con su fecha habilita el **antes y después**: a los tres meses se le muestra
al cliente su puntaje de cuando llegó contra el actual. Es la herramienta de renovación del servicio.

## Flujo de trabajo

1. SEO Local → **Zonas** → seleccionar "Gorriti, Francisco Álvarez"
2. **Barrer zona** — consulta Google y persiste los negocios encontrados
3. Tabla de resultados ordenada por **puntaje de visibilidad, de peor a mejor** — los de arriba son
   los mejores prospectos
4. Seleccionar un negocio → **Auditar** — trae la ficha completa y la compara contra su rubro
5. Marcar las dos casillas de revisión manual
6. **Generar informe** → página con marca IG → imprimir a PDF → enviar por WhatsApp
7. Si el prospecto responde → **Pasar a lead** → entra al embudo del CRM

## Manejo de errores

| Situación | Comportamiento |
|---|---|
| Google no responde o se agotó la cuota | Muestra los datos persistidos de la última consulta, con aviso visible "datos del [fecha]". Nunca pantalla en blanco. |
| Negocio sin ficha de Google | No es error: se marca como "sin presencia" y encabeza la lista de prospectos. |
| API key ausente o inválida | Aviso claro al entrar al módulo, con instrucción de qué configurar. El módulo sigue navegable con datos guardados. |
| Campo faltante en una ficha | Ese hallazgo queda **no evaluado** y el informe lo declara. No se asume el peor ni el mejor caso. |
| Zona sin resultados | Mensaje explícito distinguiendo "no hay negocios" de "falló la consulta". |

## Costos

Un barrido completo del tramo de Gorriti son 3 consultas de búsqueda, más una consulta de detalle
por cada negocio auditado. Google ofrece crédito mensual gratuito que cubre varios cientos de
auditorías por mes.

La herramienta lleva un contador de consultas por zona y por mes, visible en la interfaz, para que
el consumo no sea una sorpresa. Los montos exactos por consulta se verifican contra la tabla de
precios vigente de Google al implementar.

## Estrategia de pruebas

**Motor de auditoría** — tests unitarios con fichas de ejemplo. Cada regla se verifica en aislamiento:
una ficha sin web ni horarios debe producir exactamente esos dos hallazgos y el puntaje esperado.
No requiere red ni consume cuota, así que puede quedar completo antes de que exista la API key.

**Cálculo geográfico** — tests sobre la generación de puntos de barrido: verificar que 3 puntos de
350 m cubren el tramo de 1.030 m sin huecos.

**Proveedor de datos** — tests contra respuestas de Places guardadas como archivos de ejemplo, para
verificar el mapeo de campos sin llamar a la API real.

**Flujo completo** — verificación manual contra un negocio real del tramo de Gorriti, una vez
disponible la API key.

## Requisitos previos

1. Cuenta de Google Cloud con facturación activa — **ya disponible**
2. Habilitar **Places API (New)** en el proyecto de Google Cloud
3. Crear API key restringida a esa API
4. Guardar la key en `IG OS/web/.env.local` como `GOOGLE_PLACES_API_KEY` — la carga el usuario
   directamente en el archivo; no se comparte por chat

## Roadmap

- **Fase 1 (esta semana)** — este documento: barrido, auditoría, informe PDF, puente a leads
- **Fase 2** — pantalla de presentación en vivo y panel de acceso para el cliente
- **Fase 3** — link público compartible con seguimiento de apertura
- **Fase 4** — geo-grid vía proveedor de terceros, seguimiento histórico de posiciones
