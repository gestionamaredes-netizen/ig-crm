#!/bin/bash
# Genera la Carpeta General de Proyecto de Nexo Studios (19 paginas, 1920x1080).
# El contenido se edita en contenido.py; la maqueta en carpeta.py y estilos.css.
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
python3 carpeta.py
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Nexo-Studios-carpeta-de-programacion.pdf \
  --virtual-time-budget=10000 .carpeta.inlined.html 2>/dev/null
echo "OK -> Nexo-Studios-carpeta-de-programacion.pdf"
