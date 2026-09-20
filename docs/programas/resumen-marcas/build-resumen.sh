#!/bin/bash
# Genera el resumen comercial para marcas (1080x1920, vertical).
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
python3 resumen.py
arch=$(python3 -c "import contenido as c; print(c.ARCHIVO)")
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$arch" --virtual-time-budget=12000 ".resumen.inlined.html" 2>/dev/null
echo "OK -> $arch"
