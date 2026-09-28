# -*- coding: utf-8 -*-
"""La hoja de roles y circuito, en A4 y fondo blanco.

Tres estaciones en cadena, producción ejecutiva cruzando las tres, y lo que
técnica tiene que recibir antes de grabar. Todo en una página.

    python3 roles.py
"""

import re

import presupuesto as P
import contenido_roles as C

ANCHO, ALTO = 794, 1123          # A4 a 96 dpi
ZOOM = ANCHO / 1080.0
MINIMO_PT = 13.0

ARCHIVO = C.ARCHIVO

esc = P.esc


def construir():
    P.LOGO = P.b64(P.ASSETS + "/nexo-studios-logo.png", "image/png")

    css = """
@page { size: %dpx %dpx; margin: 0; }
.hoja{ position:relative; width:%dpx; height:%dpx; overflow:hidden; background:#FFFFFF; }
.zoom{ position:absolute; top:0; left:0; width:1080px; height:%dpx; zoom:%.6f;
  display:flex; flex-direction:column; padding:44px 58px 38px; }
.hcab{ display:flex; align-items:center; justify-content:space-between; gap:24px; }
.hcab img{ height:54px; }
.hcab .ht{ font-family:'Barlow Condensed',sans-serif; font-size:26px; font-weight:700;
  letter-spacing:.16em; text-transform:uppercase; color:#1454B4; text-align:right;
  white-space:nowrap; }
.hh{ font-family:'Sora',sans-serif; font-size:64px; font-weight:800; letter-spacing:-.04em;
  line-height:1; margin-top:18px; color:#12161C; }
.baj{ font-size:27px; line-height:1.44; color:#3D4653; margin-top:14px; }

/* --- las tres estaciones, en cadena --- */
.cad{ display:flex; align-items:stretch; gap:0; margin-top:26px; }
.est{ flex:1 1 0; min-width:0; border:1px solid #D6DBE1; border-radius:16px;
  padding:18px 20px 20px; background:#FBFCFD; }
.flecha{ flex:0 0 34px; display:flex; align-items:center; justify-content:center;
  font-family:'Barlow Condensed',sans-serif; font-size:34px; font-weight:700;
  color:#B9C0C9; }
.estn{ font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:700;
  letter-spacing:.18em; color:#1454B4; }
.estr{ font-family:'Sora',sans-serif; font-size:30px; font-weight:800; letter-spacing:-.026em;
  line-height:1.12; margin-top:6px; color:#12161C; }
.estq{ font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:600;
  letter-spacing:.09em; text-transform:uppercase; color:#66707E; margin-top:8px;
  line-height:1.3; }
.estd{ font-size:24px; line-height:1.4; color:#3D4653; margin-top:11px; }

/* --- la banda que cruza las tres --- */
.banda{ border:1px solid #C9D6EC; border-radius:16px; background:#F3F7FD;
  padding:18px 24px; margin-top:14px; }
.bandat{ display:flex; align-items:baseline; gap:16px; flex-wrap:wrap; }
.bandar{ font-family:'Sora',sans-serif; font-size:30px; font-weight:800;
  letter-spacing:-.026em; color:#12161C; }
.bandaq{ font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:600;
  letter-spacing:.09em; text-transform:uppercase; color:#1454B4; }
.bandad{ font-size:24px; line-height:1.42; color:#3D4653; margin-top:9px; }
.bandan{ font-size:24px; line-height:1.4; color:#66707E; margin-top:10px;
  border-top:1px solid #D7E2F2; padding-top:10px; }

/* --- el pase a técnica --- */
.pase{ border:1px solid #D8C89B; border-radius:16px; background:#FBF7EC;
  padding:18px 24px; margin-top:14px; }
.paset{ font-family:'Sora',sans-serif; font-size:30px; font-weight:800;
  letter-spacing:-.026em; color:#12161C; }
.paseb{ font-size:24px; line-height:1.4; color:#3D4653; margin-top:8px; }
.chips{ display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
.chip{ font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:700;
  letter-spacing:.08em; text-transform:uppercase; color:#6B5416;
  border:1px solid #C9B478; background:#FFFFFF; border-radius:999px;
  padding:7px 17px 5px; white-space:nowrap; }

.hpie{ border-top:1px solid #D6DBE1; padding-top:14px; font-size:24px; line-height:1.4;
  color:#3D4653; }
.hdir{ font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:600;
  letter-spacing:.08em; text-transform:uppercase; color:#1454B4; margin-top:8px;
  white-space:nowrap; }
""" % (ANCHO, ALTO, ANCHO, ALTO, int(ALTO / ZOOM), ZOOM)

    cadena = ""
    for i, (num, rol, quien, que) in enumerate(C.CIRCUITO):
        if i:
            cadena += '<div class="flecha">&rsaquo;</div>'
        cadena += ('<div class="est"><div class="estn">%s</div>'
                   '<div class="estr">%s</div><div class="estq">%s</div>'
                   '<div class="estd">%s</div></div>'
                   % (esc(num), esc(rol), esc(quien), esc(que)))

    T = C.TRANSVERSAL
    banda = ('<div class="banda"><div class="bandat">'
             '<div class="bandar">%s</div><div class="bandaq">%s</div></div>'
             '<div class="bandad">%s</div><div class="bandan">%s</div></div>'
             % (esc(T["rol"]), esc(T["quien"]), esc(T["que"]), esc(T["nota"])))

    PA = C.PASE
    chips = "".join('<div class="chip">%s</div>' % esc(x) for x in PA["items"])
    pase = ('<div class="pase"><div class="paset">%s</div>'
            '<div class="paseb">%s</div><div class="chips">%s</div></div>'
            % (esc(PA["titulo"]), esc(PA["bajada"]), chips))

    cuerpo = ('<div class="hoja"><div class="zoom">\n'
              '  <div class="hcab"><img src="%s"><div class="ht">%s</div></div>\n'
              '  <h1 class="hh">%s</h1>\n'
              '  <div class="baj">%s</div>\n'
              '  <div class="cad">%s</div>\n%s\n%s\n'
              '  <div class="spacer" style="flex:1 1 auto; min-height:0"></div>\n'
              '  <div class="hpie">%s</div>\n'
              '  <div class="hdir">%s</div>\n'
              '</div></div>\n'
              % (P.LOGO, esc(C.CABECERA), esc(C.TITULO), esc(C.BAJADA),
                 cadena, banda, pase, esc(C.PIE), esc(C.DIRECCION)))

    html = P.envolver([cuerpo], "Roles y circuito · Nexo Studios", "#1454B4")
    html = html.replace("</style>", css + "</style>")
    assert "%%" not in re.sub(r"<style>.*?</style>", "", html, flags=re.S), \
        "quedó un %% doble en la hoja de roles"
    open(".roles.inlined.html", "w").write(html)
    print("roles y circuito · A4 (%d × %d px)" % (ANCHO, ALTO))


if __name__ == "__main__":
    construir()
