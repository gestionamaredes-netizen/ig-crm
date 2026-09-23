#!/bin/bash
# Genera la carpeta de El Motivo y los cuadernillos de disparadores.
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
for mod in contenido_carpeta contenido_fabricio contenido_rocco contenido_paula contenido_calle; do
  python3 motivo.py "$mod"
  slug=$(python3 -c "import $mod as c; print(c.SLUG)")
  arch=$(python3 -c "import $mod as c; print(c.ARCHIVO)")
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$arch" --virtual-time-budget=14000 ".$slug.inlined.html" 2>/dev/null
  echo "OK -> $arch"
done
