# Cronograma de posteos — Redes Iniciativa Global

Calendario editorial diario por cuenta. Las piezas ya están producidas en cada repo
(`sistema-contenido/piezas/imagenes/`). Programar con **Meta Business Suite** (Planner) o
un scheduler. Horarios pensados para audiencia AR.

## Horarios base (hora Argentina)

| Franja | Hora | Uso |
|---|---|---|
| Mañana | 09:00 | Gestiones "Dólar hoy" (arranque financiero del día) |
| Mediodía | 13:00 | Feed / carruseles (pico de scroll en el almuerzo) |
| Prime | 20:30 | Reels (mayor alcance de la noche) |
| Historias | 10:00 y 19:00 | 1-3 por día, refuerzan alcance del resto |

## Ritmo semanal por cuenta

**MA Premoldeados** (@ma.premoldeados) — reels al frente (alcance frío):
| Día | 13:00 | 20:30 | Historias |
|---|---|---|---|
| Lun | — | Reel | ✔ |
| Mar | Feed | — | ✔ |
| Mié | — | Reel | ✔ |
| Jue | Feed | — | ✔ |
| Vie | — | Reel | ✔ |
| Sáb | Feed | — | ✔ |
| Dom | — | Reel | ✔ |

**Deco Baires Pisos** (@decobaires.pisos) — visual, antes/después:
| Día | 13:00 | 20:30 | Historias |
|---|---|---|---|
| Lun | Feed | — | ✔ |
| Mar | — | Reel | — |
| Mié | Feed | — | ✔ |
| Jue | — | Reel | — |
| Vie | Feed | — | ✔ |
| Sáb | — | Reel | — |
| Dom | descanso | descanso | ✔ |

**Gestiones MA** (@gestiones.ma) — financiero, recurrencia diaria de cotización:
| Día | 09:00 | 13:00 | Historias |
|---|---|---|---|
| Lun–Vie | Cotización "Dólar hoy" | Placa servicio (L/Mi/V) | ✔ cotización |
| Sáb | Placa servicio | — | ✔ |
| Dom | descanso | descanso | — |

---

## Semana 1 (arrancá el lunes) — asignación concreta de archivos

> Archivos en `<cuenta>/sistema-contenido/piezas/imagenes/`. Caption/guion: para MA los
> reels están en `semana-01-reels.md`; para el resto, usar el copy que trae cada pieza.

| Día | MA Premoldeados | Deco Baires | Gestiones MA |
|---|---|---|---|
| **Lun** | 20:30 `reel-01` (timelapse) | 13:00 `feed-01-C1` | 09:00 `cotizacion-dolar` · 13:00 `placa-01` |
| **Mar** | 13:00 `feed-01-C1` | 20:30 `reel-01` | 09:00 `cotizacion-dolar` |
| **Mié** | 20:30 `reel-02` (ladrillo vs) | 13:00 `feed-02-C2` | 09:00 `cotizacion-dolar` · 13:00 `placa-02` (divisas) |
| **Jue** | 13:00 `feed-02-C2` | 20:30 `reel-02` | 09:00 `cotizacion-dolar` |
| **Vie** | 20:30 `reel-03` (símil madera) | 13:00 `feed-03-C1` | 09:00 `cotizacion-dolar` · 13:00 `placa-04` (financiera) |
| **Sáb** | 13:00 `feed-03-C1` | 20:30 `reel-03` | 13:00 `placa-03` (comercio int.) |
| **Dom** | 20:30 `reel-07` (antes/después) | — | — |
| Historias | `historia-01..04` rotando | — | repost `cotizacion-dolar` |

## Semana 2

| Día | MA Premoldeados | Deco Baires | Gestiones MA |
|---|---|---|---|
| **Lun** | 20:30 `reel-04` (seguridad) | 13:00 `feed-04-C2` | 09:00 `cotizacion-dolar` · 13:00 `placa-05` (oro) |
| **Mar** | 13:00 `feed-04-C2` | 20:30 `reel-04` | 09:00 `cotizacion-dolar` |
| **Mié** | 20:30 `reel-05` (plazos) | 13:00 `feed-05-C1` | 09:00 `cotizacion-dolar` · 13:00 `placa-06` (gestoría) |
| **Jue** | 13:00 `feed-05-C1` | 20:30 `reel-05` | 09:00 `cotizacion-dolar` |
| **Vie** | 20:30 `reel-06` (cerco mal hecho) | 13:00 `feed-06-C2` | 09:00 `cotizacion-dolar` · 13:00 `placa-07` (cripto) |
| **Sáb** | 13:00 `feed-06-C2` | 20:30 `reel-06` | 13:00 `placa-01` |
| **Dom** | 20:30 `reel-08` (6 diseños) | — | — |

**Semanas 3+:** seguir rotando el resto de piezas (`feed-07..16`, `reel-09/10`) y generar
nuevas tandas editando el `SPEC` de cada generador. La cotización de Gestiones se regenera
a diario con los valores del día (editar `COTIZACION` en su `generar.py`).

## Cómo programar en Meta Business Suite (vía rápida)

1. Convertí cada Instagram a **cuenta Profesional** y vinculala a una **Página de Facebook**.
2. Entrá a **business.facebook.com** → **Planificador (Planner)**.
3. **Crear publicación** → elegí la cuenta → subí el PNG de la pieza → pegá el caption →
   fijá fecha y hora según este cronograma → **Programar**.
4. Para historias: mismo flujo, pestaña Historia (o subirlas manualmente desde el cel).
5. Repetí por cuenta. Business Suite maneja las 5 cuentas desde un solo lugar, gratis.
