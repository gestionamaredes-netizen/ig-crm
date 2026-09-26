#!/bin/bash
# Genera los tres PDF de la carpeta de presupuesto de producción.
set -e
cd "$(dirname "$0")"
CHROME="${1:-${CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}}"
for mod in contenido_carpeta contenido_direccion contenido_venta contenido_alquiler contenido_servicios; do
  python3 presupuesto.py "$mod"
  slug=$(python3 -c "import $mod as c; print(c.SLUG)")
  arch=$(python3 -c "import $mod as c; print(c.ARCHIVO)")
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$arch" --virtual-time-budget=16000 ".$slug.inlined.html" 2>/dev/null
  echo "OK -> $arch"
done

# los documentos de fondo blanco
for mod in contenido_propuesta contenido_instructivo; do
  python3 claro.py "$mod"
  slug=$(python3 -c "import $mod as c; print(c.SLUG)")
  arch=$(python3 -c "import $mod as c; print(c.ARCHIVO)")
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$arch" --virtual-time-budget=16000 ".$slug.inlined.html" 2>/dev/null
  echo "OK -> $arch"
done

# las dos hojas de A4, para imprimir. verificar-hojas.py las arma y comprueba
# que entren en la página y que no haya letra por debajo del mínimo.
python3 verificar-hojas.py "$CHROME"
for par in "hoja:ARCHIVO" "hoja-interna:ARCHIVO_INTERNO"; do
  slug=${par%%:*}; var=${par##*:}
  arch=$(python3 -c "import hoja; print(hoja.$var)")
  "$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$arch" --virtual-time-budget=14000 ".$slug.inlined.html" 2>/dev/null
  echo "OK -> $arch"
done
