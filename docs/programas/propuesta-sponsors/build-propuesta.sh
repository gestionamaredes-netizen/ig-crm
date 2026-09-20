#!/bin/bash
# Genera la propuesta comercial de sponsoreo (1080x1920, vertical).
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
python3 propuesta.py
arch=$(python3 -c "import contenido as c; print(c.ARCHIVO)")
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$arch" --virtual-time-budget=14000 ".propuesta.inlined.html" 2>/dev/null
echo "OK -> $arch"
