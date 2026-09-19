#!/bin/bash
# Genera el PDF de las 15 ideas de alquiler de estudio (1080x1920, vertical).
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
python3 ideas.py
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=Nexo-alquila-el-estudio-15-ideas.pdf \
  --virtual-time-budget=12000 .ideas.inlined.html 2>/dev/null
echo "OK -> Nexo-alquila-el-estudio-15-ideas.pdf"
