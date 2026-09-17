#!/bin/bash
# Genera el PDF de la propuesta NEXO STUDIOS x LQLVE (3 pags, 1080x1920).
# Requiere Chromium. Uso: ./build.sh [ruta-al-chromium]
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"

python3 - <<'EOF'
import base64, re
html = open('deck.html').read()
def b64(p): return 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

fonts = open('assets/fonts.css').read()
for f in set(re.findall(r'url\((assets/fonts/[^)]+)\)', fonts)):
    fonts = fonts.replace(f, 'data:font/woff2;base64,' + base64.b64encode(open(f, 'rb').read()).decode())

html = html.replace('/*FONTS*/', fonts)
html = html.replace('src="NEXO"',  'src="%s"' % b64('assets/nexo-studios-logo.png'))
html = html.replace('src="LQLVE"', 'src="%s"' % b64('assets/lqlve-logo.png'))
html = html.replace('src="RENDER"', 'src="data:image/jpeg;base64,%s"'
                    % base64.b64encode(open('assets/nexo-studio-render.jpg','rb').read()).decode())
open('.deck.inlined.html', 'w').write(html)
EOF

"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
  --print-to-pdf=NEXO_STUDIOS_x_LQLVE_Temporada2.pdf \
  --virtual-time-budget=8000 .deck.inlined.html 2>/dev/null
rm -f .deck.inlined.html
echo "OK -> NEXO_STUDIOS_x_LQLVE_Temporada2.pdf"
