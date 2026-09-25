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
ARCHIVO_INTERNO = "Nexo-resumen-interno-A4.pdf"

# Nada impreso puede quedar por debajo de esto. La hoja se lee de parado y a
# un metro, así que la letra chica no sirve.
MINIMO_PT = 13.0


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
.hdir{ font-family:'Barlow Condensed',sans-serif; font-size:25px; font-weight:600;
  letter-spacing:.08em; text-transform:uppercase; color:var(--a); margin-top:10px;
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


def tabla_interna():
    """Las mismas filas que ve el cliente, más lo que deja cada una."""
    esc = P.esc
    R = C.INTERNO_HOJA

    cuerpo = ""
    for (hs, op), precio in sorted(S.STREAMING.items(),
                                   key=lambda kv: (kv[0][0] or 0, kv[0][1])):
        etiqueta = "Hora suelta" if hs is None else "%d hs por mes" % hs
        cuerpo += ('<tr><td class="k">%s</td><td>%s</td><td>%s</td><td class="a">%s</td></tr>'
                   % (esc(etiqueta), esc(S.DOTACION[op]), S.pesos(precio),
                      S.pesos(S.gana_streaming(hs, op))))
    t_stream = ('<table class="mini">'
                '<col style="width:248px"><col style="width:300px">'
                '<col style="width:204px"><col style="width:204px">'
                '<tr><th>Paquete</th><th>Dotación</th><th>Precio</th>'
                '<th class="a">Deja</th></tr>%s</table>' % cuerpo)

    cuerpo = ""
    for hs in (None, 8, 16, 24):
        etiqueta = "Hora suelta" if hs is None else "%d hs por mes" % hs
        cuerpo += ('<tr><td class="k">%s</td><td>%s</td><td class="a">%s</td></tr>'
                   % (esc(etiqueta), S.pesos(S.PODCAST[hs]), S.pesos(S.gana_podcast(hs))))
    t_pod = ('<table class="mini"><tr><th>Paquete</th><th>Precio</th>'
             '<th class="a">Deja</th></tr>%s</table>' % cuerpo)

    costos = " · ".join("%s: %s" % (S.DOTACION[k].lower(), S.pesos(v))
                        for k, v in sorted(S.COSTO_OPERACION.items()))
    avisos = "".join('<div class="av">%s</div>' % esc(a) for a in R["avisos"])

    return ('    <div class="blo-t">%s</div>\n'
            '    <div style="margin-top:8px">%s</div>\n'
            '    <div class="blo-t" style="margin-top:24px">%s</div>\n'
            '    <div style="margin-top:8px">%s</div>\n'
            '    <div class="linea" style="margin-top:24px">'
            '<div class="blo-t">%s</div><div class="lv" style="font-size:30px">%s '
            '<span style="color:#97A1B0;font-size:24px">deja %s</span></div></div>\n'
            '    <div style="border-top:1px solid rgba(255,255,255,.08);'
            'margin-top:18px;padding-top:14px">'
            '<div class="blo-t">%s</div>'
            '<div class="lv" style="font-size:28px;margin-top:6px">%s</div></div>\n'
            '    <div class="blo-t" style="margin-top:24px">%s</div>%s\n'
            % (esc(R["streaming_t"]), t_stream, esc(R["podcast_t"]), t_pod,
               esc(R["produccion_t"]), S.pesos(S.PRODUCCION), S.pesos(S.gana_produccion()),
               esc(R["costos_t"]), esc(costos), esc(R["avisos_t"]), avisos))


def construir_interno():
    P.LOGO = P.b64(P.ASSETS + "/nexo-studios-logo.png", "image/png")
    R = C.INTERNO_HOJA
    esc = P.esc

    css = """
@page { size: %dpx %dpx; margin: 0; }
.hoja{ position:relative; width:%dpx; height:%dpx; overflow:hidden; background:var(--ink); }
.zoom{ position:absolute; top:0; left:0; width:1080px; height:%dpx; zoom:%.6f;
  display:flex; flex-direction:column; padding:40px 62px 38px; }
.hcab{ display:flex; align-items:center; justify-content:space-between; gap:24px; }
.hcab img{ height:54px; }
.hcab .ht{ font-family:'Barlow Condensed',sans-serif; font-size:26px; font-weight:700;
  letter-spacing:.16em; text-transform:uppercase; color:var(--red); text-align:right;
  white-space:nowrap; border:1px solid rgba(222,28,43,.45); border-radius:999px;
  padding:8px 20px 6px; }
.hh{ font-family:'Sora',sans-serif; font-size:62px; font-weight:800; letter-spacing:-.04em;
  line-height:.98; margin-top:18px; }
.mini td, .mini th{ padding:7px 8px; }
.av{ font-size:25px; line-height:1.36; color:#97A1B0; margin-top:8px; padding-left:22px;
  position:relative; }
.av::before{ content:'·'; position:absolute; left:6px; color:var(--a); font-weight:700; }
.hpie{ border-top:1px solid rgba(255,255,255,.12); padding-top:16px;
  font-size:24px; line-height:1.4; color:var(--mut); }
.hdir{ font-family:'Barlow Condensed',sans-serif; font-size:24px; font-weight:600;
  letter-spacing:.10em; text-transform:uppercase; color:var(--a); margin-top:8px;
  white-space:nowrap; }
""" % (ANCHO, ALTO, ANCHO, ALTO, int(ALTO / ZOOM), ZOOM)

    cuerpo = (
        '<div class="hoja">%s<div class="zoom">\n'
        '  <div class="hcab"><img src="%s"><div class="ht">%s</div></div>\n'
        '  <h1 class="hh">%s</h1>\n'
        '  <div style="margin-top:20px">\n%s  </div>\n'
        '  <div class="spacer" style="flex:1 1 auto; min-height:0"></div>\n'
        '  <div class="hpie">%s</div>\n'
        '  <div class="hdir">%s</div>\n'
        '</div></div>\n'
        % (P.glow_suelto("rgba(222,28,43,.16)"), P.LOGO, esc(R["cabecera"]),
           esc(R["titulo"]).replace("\n", "<br>"), tabla_interna(),
           esc(R["pie_nota"]), esc(R["direccion"])))

    html = P.envolver([cuerpo], "Resumen interno · Nexo Studios", C.ACENTO)
    html = html.replace("</style>", css + "</style>")
    assert "%%" not in html.split("</style>")[-1], "quedó un %% doble en el resumen"
    open(".hoja-interna.inlined.html", "w").write(html)
    print("resumen interno · A4 (%d × %d px)" % (ANCHO, ALTO))
