# -*- coding: utf-8 -*-
"""Mide cada pagina de las hojas de estructura y avisa si algo se desborda.

Chromium recorta en silencio lo que no entra en `.page` (overflow:hidden),
asi que sin esta medicion un parrafo de mas desaparece del PDF sin error.
"""
import glob
import os
import re
import subprocess
import sys

CHROME = os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
SONDA = """
<script>
window.addEventListener('load', function(){ setTimeout(function(){
  var out = [];
  document.querySelectorAll('.page').forEach(function(pg, i){
    var st = pg.querySelector('.stack');
    var sobra = st.scrollHeight - pg.clientHeight;
    var pie = pg.querySelector('footer').getBoundingClientRect();
    var caja = pg.getBoundingClientRect();
    out.push((i+1) + ':' + sobra + ':' + Math.round(caja.bottom - pie.bottom));
  });
  document.documentElement.setAttribute('data-m', out.join(' '));
}, 700); });
</script>
"""


def medir(ruta):
    html = open(ruta, encoding="utf-8").read().replace("</body>", SONDA + "</body>")
    tmp = ruta + ".sonda.html"
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(html)
    dom = subprocess.run([CHROME, "--headless", "--no-sandbox", "--disable-gpu",
                          "--virtual-time-budget=6000", "--dump-dom",
                          "file://" + os.path.abspath(tmp)],
                         capture_output=True, text=True).stdout
    os.remove(tmp)
    m = re.search(r'data-m="([^"]*)"', dom)
    if not m:
        return None
    return [tuple(int(x) for x in par.split(":")) for par in m.group(1).split()]


def main():
    malas = 0
    for ruta in sorted(glob.glob(".*.html")):
        if ruta.endswith(".sonda.html"):
            continue
        filas = medir(ruta)
        if filas is None:
            print("%-34s NO MIDIO" % ruta)
            malas += 1
            continue
        partes = []
        for n, sobra, pie in filas:
            estado = "OK" if sobra <= 0 else "SE PASA %dpx" % sobra
            if sobra > 0:
                malas += 1
            partes.append("p%d %s (pie a %dpx del borde)" % (n, estado, pie))
        print("%-34s %s" % (ruta, " · ".join(partes)))
    if malas:
        print("\n%d pagina(s) con problema" % malas)
        return 1
    print("\ntodas las paginas entran")
    return 0


if __name__ == "__main__":
    sys.exit(main())
