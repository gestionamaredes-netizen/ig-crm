# Nexo Studios — Carpeta General de Proyecto

Dossier de presentación de la grilla 2026 para marcas, patrocinadores e inversores.

**Entregable:** `Nexo-Studios-carpeta-de-programacion.pdf` — 19 páginas, 1920×1080 px
(apaisado 16:9, el estándar para pitch en pantalla y proyección).

## Estructura

| Páginas | Contenido |
|---|---|
| 01–03 | Portada · El estudio y su capacidad técnica · La grilla de un vistazo |
| 04–07 | **Sex and the Baires** — apertura, concepto y target, escaleta y tono, monetización y ficha |
| 08–11 | **Exitosa Yo** — misma estructura |
| 12–16 | **Pequeños Grandes Sabios** — suma una página de protocolo de protección de menores |
| 17–19 | Equipo · Paquetes comerciales · Cierre y contacto |

Cada programa cubre los siete apartados pedidos: nombre y tagline, concepto y sinopsis
ejecutiva, target, escaleta tipo por bloque, propuesta visual y tono, monetización y PNT,
y ficha técnica completa.

## Decisiones que conviene revisar antes de presentar

- **Frecuencia y duración.** Semanal para los tres (quincenal opcional en Pequeños Grandes
  Sabios) y las duraciones por bloque son una propuesta de producción, no un dato dado.
- **Distribución por plataforma.** Las plataformas listadas en "Qué queda de cada emisión"
  son la propuesta de circulación; ajustar según los canales que ya tenga cada programa.
- **Sex and the Baires no tiene manual de marca.** Su paleta en el PDF es la que usa el
  logo (rosa, blanco, negro). Exitosa Yo y Pequeños Grandes Sabios sí lo tienen, y de ahí
  salen sus colores, tipografías, valores y bajadas.
- **Sin tarifas.** El dossier no lleva valores: la página comercial remite a cotización por
  programa y temporada.

## Regenerar el PDF

```bash
./build-carpeta.sh                  # usa el Chromium de /opt/pw-browsers
./build-carpeta.sh /ruta/a/chromium # o indicá otro binario
```

- `contenido.py` — **todo el texto del dossier**. Es el único archivo que hay que tocar
  para cambiar copy, taglines, bloques de escaleta, targets o categorías comerciales.
- `carpeta.py` — maquetación: arma el HTML página por página desde el contenido.
- `estilos.css` — sistema visual (tipografía, colores, componentes).

Cada programa entra con su marca real: el logo se muestra en una placa sobre su propio
fondo, y el color de acento de la sección sale del logo.

| Programa | Acento | Origen |
|---|---|---|
| Sex and the Baires | `#ED1877` | rosa muestreado del logo |
| Exitosa Yo | `#FF2D8B` | rosa declarado en su manual de marca |
| Pequeños Grandes Sabios | `#FFD21C` | amarillo declarado en su manual de marca |

Exitosa Yo lleva además su "azul estudio" `#0B2D6B` en el fondo de sus páginas, y
Pequeños Grandes Sabios su "Azul Nexo" `#071A3D` — así las dos marcas rosas no se
confunden al pasar las páginas. La paleta completa de cada programa se muestra en su
página de propuesta visual.

## Assets

- `assets/nexo-studios-logo.png` — logo en PNG transparente
- `assets/estudio-nexo.jpg` — render del set principal (copia de `docs/programas/marca/`)
- `assets/logo-sex-and-the-baires.png` · `logo-exitosa-yo.png` · `logo-pequenos-grandes-sabios.png`
  — logos de los programas, recortados y escalados desde los originales
- `assets/logo-pgs-avatar.png` — isotipo PGS para redes (referencia)
- `assets/marca-exitosa-yo-manual.png` · `marca-pequenos-grandes-sabios-manual.png`
  — manuales de marca de los programas (referencia, no van al PDF)
- `assets/fonts/` — Inter + Barlow Condensed (subset latino, SIL Open Font License)
