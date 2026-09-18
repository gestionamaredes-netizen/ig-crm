#!/bin/bash
# Genera la carpeta de contenido (7 paginas, 1080x1920, vertical, para el celular).
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
python3 interna.py
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Nexo-Studios-carpeta-de-contenido.pdf \
  --virtual-time-budget=10000 .interna.inlined.html 2>/dev/null
echo "OK -> Nexo-Studios-carpeta-de-contenido.pdf"
