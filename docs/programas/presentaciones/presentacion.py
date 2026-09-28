# -*- coding: utf-8 -*-
"""Arma la presentacion de propuesta de cada programa.

A4, fondo blanco, para mandar por mail o imprimir. Reusa el CSS y el tamano de
pagina de las hojas de estructura, mas unas reglas propias para la portada y
para los bloques de propuesta.

Las dos reglas del CSS siguen valiendo: nada de `filter:`, que obliga a
Chromium a rasterizar la pagina entera al imprimir, y un solo `.spacer` por
pagina, justo antes del pie.
"""
import importlib.util
import os
import re
import sys

import contenido as C

_AQUI = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "_nexo_estructura", os.path.join(os.path.dirname(_AQUI), "estructuras", "estructura.py"))
E = importlib.util.module_from_spec(_spec)
sys.path.insert(0, os.path.join(os.path.dirname(_AQUI), "estructuras"))
_spec.loader.exec_module(E)

D = C.D
esc = E.esc
MINIMO_PT = E.MINIMO_PT


def kv(items, clase="kv"):
    return ('<table class="%s">%s</table>'
            % (clase, "".join('<tr><td class="k">%s</td><td class="v">%s</td></tr>'
                              % (esc(a), esc(b)) for a, b in items)))


def bloques(items):
    return "".join('<div class="bq"><b>%s</b><span>%s</span></div>' % (esc(t), esc(d))
                   for t, d in items)


def escaleta(titulo, arranque, filas):
    out = ['<p class="sub">%s</p>' % esc(titulo), '<table class="esc">']
    t = None
    if arranque != "—":
        h, m = (int(x) for x in arranque.split(":"))
        t = h * 60 + m
    total = 0
    for n, tit, dur, desc in filas:
        mins = int(dur.rstrip("'")) if dur.rstrip("'").isdigit() else 0
        total += mins
        hora = "%02d:%02d" % ((t // 60) % 24, t % 60) if t is not None else "—"
        if t is not None:
            t += mins
        corte = tit.lower().startswith("tanda")
        out.append('<tr class="%s"><td class="hr">%s</td>'
                   '<td class="bl"><b>%s</b>%s</td><td class="du">%s</td></tr>'
                   % ("corte" if corte else "", hora, esc(tit),
                      "<span>%s</span>" % esc(desc) if desc else "", esc(dur)))
    out.append('<tr class="tot"><td></td><td>Total al aire</td>'
               '<td class="du">%d\'</td></tr></table>' % total)
    return "".join(out)


def hoja(p, cuerpo, portada=False):
    pie = ("Nexo Studios · Producción General" if portada
           else "%s · propuesta · Nexo Studios" % esc(p["nombre"]))
    cab = "" if portada else """
    <header>
      <div class="marca"><b>NEXO</b> STUDIOS</div>
      <div class="donde">%s</div>
    </header>""" % esc(p["nombre"])
    return """
<div class="page%s" style="--acento:%s">
  <div class="stack">%s
%s
    <div class="spacer"></div>
    <footer>%s</footer>
  </div>
</div>
""" % (" portada" if portada else "", p["acento"], cab, cuerpo, pie)


def paginas(p):
    out = []
    cuando = dict(p["ficha"]).get("Emisión") or dict(p["ficha"]).get("Grabación", "")

    # 01 · portada
    out.append(hoja(p, """
    <div class="banda"></div>
    <div class="tapa">
      <div class="marca grande"><b>NEXO</b> STUDIOS</div>
      <h1 class="tit">%s</h1>
      <p class="bajada grande">%s</p>
      <p class="lede grande">%s</p>
      <div class="cuando"><b>%s</b></div>
    </div>
""" % (esc(p["nombre"]), esc(p["tagline"]), esc(p["unalinea"]), esc(cuando)), portada=True))

    # 02 · que es
    sin = "".join('<p class="lede">%s</p>' % esc(s) for s in p["sinopsis"])
    out.append(hoja(p, """
    <h2 class="primero">Qué es</h2>
    %s
    <h2>La ficha</h2>
    %s
""" % (sin, kv(p["ficha"]))))

    # 03 · a quien le habla
    out.append(hoja(p, """
    <h2 class="primero">A quién le habla</h2>
    %s
    <h2>Por qué funciona</h2>
    %s
""" % (kv(p["target"]), bloques(p["pilares"]))))

    # 04 · la escaleta, una hoja por dia
    ultima = len(p["escaletas"]) - 1
    for i, (titulo, arranque, filas) in enumerate(p["escaletas"]):
        cuerpo = '<h2 class="primero">La escaleta</h2>' + escaleta(titulo, arranque, filas)
        if i == ultima:
            cuerpo += '<p class="nota">%s</p>' % esc(p["nota"])
        out.append(hoja(p, cuerpo))

    # 05 · la puesta y el equipo
    equipo = ("<h2>En cámara</h2>" + kv(p["equipo"])) if p["equipo"] else ""
    out.append(hoja(p, """
    <h2 class="primero">La puesta</h2>
    %s
    %s
""" % (kv(p["tono"]), equipo)))

    # 06 · distribucion y la semana
    out.append(hoja(p, """
    <h2 class="primero">Dónde se ve</h2>
    %s
    <h2>La semana de producción</h2>
    <table class="kv sem">%s</table>
""" % (kv(p["distribucion"]),
       "".join('<tr><td class="k">%s</td><td class="v">%s</td><td class="du">%s</td></tr>'
               % (esc(a), esc(b), esc(c)) for a, b, c in p["semana"]))))

    # 07 · que se puede vender
    out.append(hoja(p, """
    <h2 class="primero">Qué se puede vender</h2>
    %s
    <h2>Rubros que encajan</h2>
    <p class="lede">%s</p>
""" % (bloques(p["monetizacion"]), esc(p["categorias"]))))

    # 08 · la marca y que falta
    pal = "".join('<div class="col"><s style="background:%s"></s><b>%s</b>'
                  '<span>%s</span></div>' % (c, esc(c), esc(n)) for c, n in p["paleta"])
    falta = "".join("<li>%s</li>" % esc(x) for x in p["falta"])
    out.append(hoja(p, """
    <h2 class="primero">La marca</h2>
    <div class="paleta">%s</div>
    <p class="lede chico">Los valores se muestrearon del archivo original del logo, píxel por
    píxel. Cualquier corrección se hace volviendo a muestrear, no copiando de acá.</p>

    <h2>Qué falta definir</h2>
    <ul class="falta">%s</ul>

    <h2>Cómo seguimos</h2>
    <p class="lede">Se elige el espacio y el día, se define el formato y se arma una prueba
    antes de cerrar temporada. El programa se produce en el estudio propio de Nexo Studios,
    en San Martín, con operador y asistente de operación incluidos en la hora.</p>
""" % (pal, falta)))

    return "".join(out)


CSS_EXTRA = """
.page.portada .stack{padding:0}
.banda{height:184px;background:var(--acento)}
.tapa{flex:1 1 auto;padding:52px}
.marca.grande{font-size:20px;letter-spacing:.2em;margin-bottom:46px}
h1.tit{font-size:62px;line-height:1.02;letter-spacing:-.015em;margin-bottom:12px}
.bajada.grande{font-size:24px;margin-bottom:22px}
.lede.grande{font-size:21px;line-height:1.48;max-width:560px}
.cuando{margin-top:34px;display:inline-block;border:2px solid var(--acento);
  border-radius:7px;padding:11px 19px}
.cuando b{font-size:20px;color:var(--acento)}
.page.portada footer{padding:0 52px 34px;border-top:none}

.bq{padding:11px 0 11px 15px;border-left:3px solid var(--acento);margin-bottom:13px}
.bq b{display:block;font-size:19px;margin-bottom:3px}
.bq span{display:block;font-size:18px;line-height:1.45;color:%(media)s}

.paleta{display:flex;gap:15px;margin:6px 0 13px}
.col{flex:1 1 0;min-width:0}
.col s{display:block;height:46px;border-radius:5px;margin-bottom:7px;
  border:1px solid %(linea)s}
.col b{display:block;font-size:18px}
.col span{display:block;font-size:18px;color:%(media)s}

.esc tr.corte td{color:%(media)s}
.esc tr.corte .bl b{font-weight:400;font-style:italic}
.esc tr.tot td{border-top:2px solid var(--acento);border-bottom:none;font-weight:700;
  padding-top:7px}
.esc .hr{width:15%%}
.esc .du{width:11%%}
.sem .du{width:19%%;text-align:right;font-weight:700;color:var(--acento);font-size:18px;
  white-space:nowrap}
""" % dict(media=D.TINTA_MEDIA, linea=D.LINEA)


def construir(p):
    return ('<!doctype html><html lang="es"><meta charset="utf-8">'
            '<title>%s · propuesta</title><style>%s%s</style><body>%s</body></html>'
            % (esc(p["nombre"]), E.CSS, CSS_EXTRA, paginas(p)))


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else "."
    junto = E.CSS + CSS_EXTRA
    cuerpos = sorted({float(x) for x in re.findall(r"font-size:([0-9.]+)px", junto)})
    chicas = [(px, round(px * 0.75, 1)) for px in cuerpos if px * 0.75 < MINIMO_PT]
    assert not chicas, ("estos cuerpos quedan por debajo de %.0f pt impresos: %s"
                        % (MINIMO_PT, chicas))
    assert "filter:" not in junto, "filter: obliga a rasterizar la pagina entera"
    print("cuerpo mas chico: %.0f px = %.1f pt" % (cuerpos[0], cuerpos[0] * 0.75))
    for p in C.programas():
        html = construir(p)
        with open(os.path.join(destino, ".%s.html" % p["slug"]), "w", encoding="utf-8") as f:
            f.write(html)
        print("%-28s %d paginas" % (p["slug"], html.count('class="page')))


if __name__ == "__main__":
    main()
