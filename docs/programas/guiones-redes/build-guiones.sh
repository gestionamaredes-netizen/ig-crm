#!/bin/bash
# Genera los cuadernillos de guiones (1080x1920, vertical).
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
for mod in contenido_espana contenido_siempre contenido_octubre contenido_martu; do
  python3 guiones.py "$mod"
  slug=$(python3 -c "import $mod as c; print(c.SLUG)")
  arch=$(python3 -c "import $mod as c; print(c.ARCHIVO)")
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$arch" --virtual-time-budget=12000 ".$slug.inlined.html" 2>/dev/null
  echo "OK -> $arch"
done
