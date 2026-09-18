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
| 12–16 | **La Mesa Chica** — suma una página de protocolo de protección de menores |
| 17–19 | Equipo · Paquetes comerciales · Cierre y contacto |

Cada programa cubre los siete apartados pedidos: nombre y tagline, concepto y sinopsis
ejecutiva, target, escaleta tipo por bloque, propuesta visual y tono, monetización y PNT,
y ficha técnica completa.

## Decisiones que conviene revisar antes de presentar

- **Título del Programa 3.** "La Mesa Chica" es una propuesta, no un título cerrado. Las
  cuatro alternativas y el razonamiento de cada una están en `contenido.py`
  (`TITULOS_PROPUESTOS`). El PDF las muestra como "títulos en evaluación".
- **Frecuencia y duración.** Semanal para los tres (quincenal opcional en el Programa 3)
  y las duraciones por bloque son una propuesta de producción, no un dato dado.
- **Distribución por plataforma.** Las plataformas listadas en "Qué queda de cada emisión"
  son la propuesta de circulación; ajustar según los canales que ya tenga cada programa.
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

Cada programa tiene un color de acento propio para diferenciarlos dentro de la identidad
de Nexo: rosa (`#E8467F`), dorado (`#C7A45E`) y cyan (`#2FC4E8`) sobre la base azul/rojo.

## Assets

- `assets/nexo-studios-logo.png` — logo en PNG transparente
- `assets/estudio-nexo.jpg` — render del set principal (copia de `docs/programas/marca/`)
- `assets/fonts/` — Inter + Barlow Condensed (subset latino, SIL Open Font License)
