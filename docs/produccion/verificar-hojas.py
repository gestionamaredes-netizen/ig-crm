# -*- coding: utf-8 -*-
"""Comprueba que las hojas de A4 entren en la página y que no haya letra chica.

Se imprimen y se leen de parado, así que nada puede bajar del mínimo. Mide el
tamaño real, ya con el achicado aplicado, y lo pasa a puntos de imprenta.

    python3 verificar-hojas.py [ruta/a/chromium]
"""

import json, os, re, subprocess, sys, tempfile

import hoja

CHROME = (sys.argv[1] if len(sys.argv) > 1
          else os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"))

SONDA = """<script>window.addEventListener('load',function(){
  var z = document.querySelector('.zoom');
  var zz = parseFloat(getComputedStyle(z).zoom) || 1;
  var min = 999, quien = '', textos = 0;
  document.querySelectorAll('.zoom *').forEach(function(n){
    var t = (n.childNodes.length && n.childNodes[0].nodeType === 3)
            ? n.childNodes[0].nodeValue.trim() : '';
    if (!t) return;
    textos++;
    var pt = parseFloat(getComputedStyle(n).fontSize) * zz * 0.75;
    if (pt < min) { min = pt; quien = (n.className || n.tagName) + ' :: ' + t.slice(0, 26); }
  });
  var ultimo = z.lastElementChild.getBoundingClientRect().bottom;
  var hoja = document.querySelector('.hoja').getBoundingClientRect().bottom;
  document.title = 'JSON' + JSON.stringify({
    sobra: Math.round(z.scrollHeight - z.clientHeight),
    fuera: Math.round(ultimo - hoja),
    minPt: Math.round(min * 10) / 10, quien: quien, textos: textos});
});</script></body>"""


def medir(archivo_html):
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(open(archivo_html, encoding="utf-8").read().replace("</body>", SONDA))
        tmp = f.name
    try:
        salida = subprocess.run(
            [CHROME, "--headless", "--no-sandbox", "--disable-gpu",
             "--virtual-time-budget=12000", "--dump-dom", tmp],
            capture_output=True, text=True, timeout=90).stdout
    finally:
        os.unlink(tmp)
    m = re.search(r"JSON(\{.*?\})", salida)
    assert m, "la sonda no devolvió medidas para %s" % archivo_html
    return json.loads(m.group(1))


def main():
    hoja.construir()
    hoja.construir_interno()

    fallas = []
    for nombre, arch in (("hoja de precios", ".hoja.inlined.html"),
                         ("resumen interno", ".hoja-interna.inlined.html")):
        d = medir(arch)
        estado = []
        if d["sobra"] > 0:
            estado.append("se desborda %d px" % d["sobra"])
        if d["fuera"] > 2:
            estado.append("el pie cae %d px fuera de la hoja" % d["fuera"])
        if d["minPt"] < hoja.MINIMO_PT:
            estado.append("letra de %.1f pt en %s" % (d["minPt"], d["quien"]))
        print("%-18s %3d textos · mínimo %.1f pt · %s"
              % (nombre, d["textos"], d["minPt"], ", ".join(estado) or "OK"))
        fallas += estado

    if fallas:
        sys.exit("\nlas hojas no pasan: " + " | ".join(fallas))
    print("\nlas dos entran en A4 y nada baja de %.1f pt" % hoja.MINIMO_PT)


if __name__ == "__main__":
    main()
