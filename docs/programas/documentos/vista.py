# -*- coding: utf-8 -*-
"""Saca una captura PNG de una pagina, para mirar el diseno sin imprimir.

    python3 vista.py <parte-del-archivo> [nro de pagina]
"""
import json
import os
import sys

import pdf


def main():
    filtro = sys.argv[1].lower()
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    tmp = "/tmp/nexo-pdf"
    os.makedirs(tmp, exist_ok=True)
    idx = json.load(open(os.path.join(pdf.FUENTE, "_indice.json"), encoding="utf-8"))
    reg = [r for r in idx if filtro in r["archivo"].lower()][0]

    doc, bloques = pdf.preparar(reg)
    paginas = pdf.paginar(doc, bloques, tmp)
    sola = pdf.html_final(doc, [paginas[n - 1]]) if n <= len(paginas) else None
    if sola is None:
        print("solo tiene %d paginas" % len(paginas))
        return
    ruta_html = os.path.join(tmp, "vista.html")
    open(ruta_html, "w", encoding="utf-8").write(sola)
    salida = os.path.join(tmp, "vista.png")
    pdf.chrome(["--screenshot=" + salida,
                "--window-size=%d,%d" % (pdf.ANCHO, pdf.ALTO + 40),
                "--virtual-time-budget=2500", "file://" + ruta_html])
    print("%s  pagina %d de %d -> %s" % (reg["titulo"], n, len(paginas), salida))


if __name__ == "__main__":
    main()
