# -*- coding: utf-8 -*-
"""La hoja de precios suelta, en A4, para imprimir y plastificar.

Usa exactamente el mismo cuerpo que la página 2 de Nexo-servicios.pdf, así que
los precios no pueden quedar desfasados entre las dos.

    python3 hoja.py
"""

import presupuesto as P
import servicios as S
import contenido_servicios as C

# A4 a 96 dpi. El contenido está diseñado sobre 1080 px de ancho, así que se
# encoge con zoom en vez de rehacer toda la escala tipográfica.
ANCHO, ALTO = 794, 1123
ZOOM = ANCHO / 1080.0

ARCHIVO = "Nexo-hoja-de-precios-A4.pdf"


def construir():
    P.LOGO = P.b64(P.ASSETS + "/nexo-studios-logo.png", "image/png")
    logo = P.LOGO
    R = C.RESUMEN
    esc = P.esc

    css = """
@page { size: %dpx %dpx; margin: 0; }
.hoja{ position:relative; width:%dpx; height:%dpx; overflow:hidden; background:var(--ink); }
.zoom{ position:absolute; top:0; left:0; width:1080px; height:%dpx; zoom:%.6f;
  display:flex; flex-direction:column; padding:54px 62px 46px; }
.hcab{ display:flex; align-items:center; justify-content:space-between; gap:24px; }
.hcab img{ height:64px; }
.hcab .ht{ font-family:'Barlow Condensed',sans-serif; font-size:26px; font-weight:700;
  letter-spacing:.18em; text-transform:uppercase; color:var(--a); text-align:right;
  white-space:nowrap; }
.hh{ font-family:'Sora',sans-serif; font-size:82px; font-weight:800; letter-spacing:-.04em;
  line-height:.98; margin-top:30px; }
.hpie{ border-top:1px solid rgba(255,255,255,.12); padding-top:18px;
  font-size:24px; line-height:1.42; color:var(--mut); }
.hdir{ font-family:'Barlow Condensed',sans-serif; font-size:23px; font-weight:600;
  letter-spacing:.10em; text-transform:uppercase; color:var(--a); margin-top:10px;
  white-space:nowrap; }
""" % (ANCHO, ALTO, ANCHO, ALTO, int(ALTO / ZOOM), ZOOM)

    cuerpo = (
        '<div class="hoja">%s<div class="zoom">\n'
        '  <div class="hcab"><img src="%s"><div class="ht">%s</div></div>\n'
        '  <h1 class="hh">%s</h1>\n'
        '  <div style="margin-top:34px">\n%s  </div>\n'
        '  <div class="spacer" style="flex:1 1 auto; min-height:0"></div>\n'
        '  <div class="hpie"><b style="color:#E4D6B4">%s</b><br>%s</div>\n'
        '  <div class="hdir">%s</div>\n'
        '</div></div>\n'
        % (P.glow_suelto(C.ACENTO + "26"), logo, esc(R["cabecera"]),
           esc(R["titulo"]).replace("\n", "<br>"), P.hoja_precios(C),
           esc(S.VIGENCIA), esc(R["pie_nota"]), esc(R["direccion"])))

    html = P.envolver([cuerpo], "Hoja de precios · Nexo Studios", C.ACENTO)
    html = html.replace("</style>", css + "</style>")

    internos = set(list(S.COSTO_OPERACION.values()) + [S.PRODUCCION_COSTO])
    for valor in internos:
        assert S.pesos(valor) not in html, \
            "%s es un costo interno y aparece en la hoja de precios" % S.pesos(valor)
    assert "%%" not in html.split("</style>")[-1], "quedó un %% doble en la hoja"

    open(".hoja.inlined.html", "w").write(html)
    print("hoja de precios · A4 (%d × %d px)" % (ANCHO, ALTO))


if __name__ == "__main__":
    construir()
