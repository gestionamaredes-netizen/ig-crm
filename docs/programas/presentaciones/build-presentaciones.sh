#!/bin/bash
# Genera la presentacion de propuesta de cada programa (A4, fondo blanco).
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
python3 presentacion.py
CHROME="$CHROME" python3 verificar.py
for f in .*.html; do
  [ -e "$f" ] || continue
  slug="${f#.}"; slug="${slug%.html}"
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="Nexo-$slug-propuesta.pdf" --virtual-time-budget=8000 "$f" 2>/dev/null
done
python3 - <<'PY'
import glob, re
for f in sorted(glob.glob("Nexo-*-propuesta.pdf")):
    d = open(f, "rb").read()
    print("  %-44s %2d pag · %5.0f KB" % (f, len(re.findall(rb"/Type\s*/Page[^s]", d)), len(d)/1024))
PY
echo "OK"
