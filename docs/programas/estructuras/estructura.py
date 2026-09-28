# -*- coding: utf-8 -*-
"""Arma la hoja de estructura de trabajo de cada programa.

A4 exacta (794x1123 px con @page del mismo tamano = 210x297 mm), fondo
blanco, sin imagenes ni fuentes embebidas para que el PDF pese poco y entre
por el conector del Drive.

Nada de `filter:` en el CSS: obliga a Chromium a rasterizar toda la pagina
al imprimir y el archivo se va a varios MB.
"""
import os
import re
import sys

import datos as D

ANCHO, ALTO = 794, 1123
MINIMO_PT = 13.0          # nada por debajo de esto en el papel
# La pagina mide 794 px y se imprime a 210 mm, o sea 96 dpi exactos: un px
# CSS es 0.75 pt en el papel. Para 13 pt hacen falta 17.34 px, asi que nada
# baja de 18.
BASE_PX = 19              # cuerpo de texto
CHICO_PX = 18             # el cuerpo mas chico que se usa


def esc(t):
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def filas(items, clases=("k", "v")):
    return "".join('<tr><td class="%s">%s</td><td class="%s">%s</td></tr>'
                   % (clases[0], esc(a), clases[1], esc(b)) for a, b in items)


def escaleta_html(titulo, arranque, bloques):
    reloj = " · arranca %s" % arranque if arranque != "—" else ""
    out = ['<p class="sub">%s%s</p>' % (esc(titulo), reloj), '<table class="esc">']
    t = None
    if arranque != "—":
        h, m = (int(x) for x in arranque.split(":"))
        t = h * 60 + m
    total = 0
    for n, tit, dur, desc in bloques:
        mins = int(dur.rstrip("'")) if dur.rstrip("'").isdigit() else 0
        total += mins
        hora = "%02d:%02d" % ((t // 60) % 24, t % 60) if t is not None else "—"
        if t is not None:
            t += mins
        corte = tit.lower().startswith("tanda")
        out.append('<tr class="%s"><td class="hr">%s</td><td class="n">%s</td>'
                   '<td class="bl"><b>%s</b>%s</td>'
                   '<td class="du">%s</td></tr>'
                   % ("corte" if corte else "", hora, esc(n), esc(tit),
                      "<span>%s</span>" % esc(desc) if desc else "", esc(dur)))
    out.append('<tr class="tot"><td></td><td></td><td>Total</td>'
               '<td class="du">%d\'</td></tr>' % total)
    out.append("</table>")
    return "".join(out)


def hoja(p, cuerpo, primera=False):
    """Envuelve el cuerpo de una pagina con su cabecera, su spacer y su pie.

    Un solo `.spacer` por pagina, justo antes del pie: es lo que mantiene el
    pie pegado abajo sin depender de que el contenido llene la hoja.
    """
    return """
<div class="page" style="--acento:%(acento)s">
  <div class="stack">
    <header>
      <div class="marca"><b>NEXO</b> STUDIOS</div>
      <div class="donde">%(carpeta)s</div>
    </header>
%(cuerpo)s
    <div class="spacer"></div>
    <footer>Hoja de estructura de trabajo · Producción General · Nexo Studios</footer>
  </div>
</div>
""" % dict(acento=p["acento"], carpeta=esc(p["carpeta"]) + " · 1 · Formato", cuerpo=cuerpo)


def paginas(p):
    """Devuelve el HTML de todas las paginas del programa.

    Se reparte por bloques enteros: la escaleta nunca se parte al medio, asi
    que los programas con dos dias sacan una hoja mas en vez de apretarse.
    """
    salida = []

    salida.append(hoja(p, """
    <h1>%s</h1>
    <p class="bajada">%s</p>
    <p class="lede">%s</p>

    <h2>La ficha</h2>
    <table class="kv">%s</table>
""" % (esc(p["nombre"]), esc(p["bajada"]), esc(p["que_es"]), filas(p["ficha"]))))

    ultima = len(p["escaletas"]) - 1
    for i, (titulo, arranque, bloques) in enumerate(p["escaletas"]):
        cuerpo = '\n    <h2 class="primero">La escaleta</h2>\n    '
        cuerpo += escaleta_html(titulo, arranque, bloques)
        if i == ultima:
            cuerpo += '\n    <p class="nota">%s</p>' % esc(p["nota"])
        salida.append(hoja(p, cuerpo))

    semana = "".join('<tr><td class="k">%s</td><td class="v">%s</td><td class="du">%s</td></tr>'
                     % (esc(d), esc(q), esc(h)) for d, q, h in p["semana"])
    falta = "".join("<li>%s</li>" % esc(x) for x in p["falta"])
    salida.append(hoja(p, """
    <h2 class="primero">La semana de producción</h2>
    <table class="kv sem">%s</table>

    <h2>Qué falta definir</h2>
    <ul class="falta">%s</ul>
""" % (semana, falta)))

    carpetas = "".join('<tr><td class="k">%s</td><td class="v">%s</td></tr>'
                       % (esc(a), esc(b)) for a, b in D.CARPETAS)
    salida.append(hoja(p, """
    <h2 class="primero">Qué va en cada carpeta del Drive</h2>
    <p class="lede chico">Las ocho carpetas son iguales en los cinco programas. El que busca un
    guion lo busca siempre en el mismo lugar.</p>
    <table class="kv">%s</table>
""" % carpetas))

    return "".join(salida)


CSS = """
*{margin:0;padding:0;box-sizing:border-box}
@page{size:%(A)spx %(B)spx;margin:0}
html,body{background:#fff}
body{font-family:"DejaVu Sans","Liberation Sans",Arial,sans-serif;color:%(tinta)s;
  -webkit-font-smoothing:antialiased}
.page{width:%(A)spx;height:%(B)spx;background:#fff;position:relative;overflow:hidden;
  page-break-after:always;break-after:page}
.page:last-child{page-break-after:auto;break-after:auto}
.stack{position:absolute;top:0;left:0;width:%(A)spx;height:%(B)spx;
  display:flex;flex-direction:column;padding:46px 52px 34px}
.spacer{flex:1 1 auto;min-height:12px}

header{display:flex;justify-content:space-between;align-items:baseline;
  border-bottom:2px solid var(--acento);padding-bottom:9px;margin-bottom:22px}
.marca{font-size:18px;letter-spacing:.18em;color:%(azul)s}
.marca b{font-weight:700}
.donde{font-size:18px;letter-spacing:.05em;color:%(media)s}

h1{font-size:40px;line-height:1.05;letter-spacing:-.01em;margin-bottom:5px}
.bajada{font-size:20px;color:var(--acento);font-weight:700;margin-bottom:13px}
.lede{font-size:%(base)spx;line-height:1.5;color:%(media)s;margin-bottom:6px}
.lede.chico{font-size:18px;margin-bottom:9px}

h2{font-size:18px;letter-spacing:.12em;text-transform:uppercase;color:var(--acento);
  margin:22px 0 9px;padding-top:11px;border-top:1px solid %(linea)s}
h2.primero{margin-top:0;padding-top:0;border-top:none}

table{width:100%%;border-collapse:collapse}
td{font-size:%(base)spx;line-height:1.42;padding:5px 0;vertical-align:top;
  border-bottom:1px solid %(linea)s}
tr:last-child td{border-bottom:none}
.kv .k{width:33%%;font-weight:700;padding-right:14px}
.kv .v{color:%(media)s}
.sem .k{width:20%%}
.sem .du{width:19%%;text-align:right;font-weight:700;color:var(--acento);font-size:18px;
  white-space:nowrap}

.sub{font-size:20px;font-weight:700;color:%(tinta)s;margin:11px 0 3px}
.esc .hr{width:15%%;font-weight:700;color:var(--acento);font-size:18px;white-space:nowrap}
.esc .n{width:7%%;color:%(media)s;font-size:18px}
.esc .bl b{display:block;font-size:%(base)spx}
.esc .bl span{display:block;font-size:18px;color:%(media)s;line-height:1.38}
.esc .du{width:11%%;text-align:right;color:%(media)s;font-size:18px;white-space:nowrap}

.esc tr.corte td{color:%(media)s}
.esc tr.corte .bl b{font-weight:400;font-style:italic}
.esc tr.tot td{border-top:2px solid var(--acento);border-bottom:none;font-weight:700;
  padding-top:7px}
.nota{margin-top:14px;font-size:18px;line-height:1.45;color:%(tinta)s;
  border-left:3px solid var(--acento);padding:3px 0 3px 12px}
.falta{list-style:none}
.falta li{font-size:%(base)spx;line-height:1.45;padding:5px 0 5px 20px;position:relative;
  border-bottom:1px solid %(linea)s;color:%(media)s}
.falta li:last-child{border-bottom:none}
.falta li::before{content:"";position:absolute;left:3px;top:11px;width:7px;height:7px;
  border-radius:50%%;background:var(--acento)}

footer{font-size:18px;color:%(media)s;letter-spacing:.04em;
  border-top:1px solid %(linea)s;padding-top:9px}
""" % dict(A=ANCHO, B=ALTO, tinta=D.TINTA, media=D.TINTA_MEDIA, linea=D.LINEA,
           azul=D.NEXO_AZUL, base=BASE_PX)


def construir(p):
    return ("<!doctype html><html lang=\"es\"><meta charset=\"utf-8\">"
            "<title>%s · estructura de trabajo</title><style>%s</style><body>%s</body></html>"
            % (esc(p["nombre"]), CSS, paginas(p)))


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(destino, exist_ok=True)
    # nada por debajo del minimo legible
    cuerpos = sorted({float(x) for x in re.findall(r"font-size:([0-9.]+)px", CSS)})
    chicas = [(px, round(px * 0.75, 1)) for px in cuerpos if px * 0.75 < MINIMO_PT]
    assert not chicas, ("estos cuerpos quedan por debajo de %.0f pt impresos (px, pt): %s"
                        % (MINIMO_PT, chicas))
    print("cuerpo mas chico: %.0f px = %.1f pt" % (cuerpos[0], cuerpos[0] * 0.75))
    assert "filter:" not in CSS, "filter: obliga a rasterizar la pagina entera"
    for p in D.PROGRAMAS:
        ruta = os.path.join(destino, ".%s.html" % p["slug"])
        with open(ruta, "w", encoding="utf-8") as f:
            f.write(construir(p))
        print("%-30s %d paginas" % (p["slug"], construir(p).count('class="page"')))
    print("%d hojas" % len(D.PROGRAMAS))


if __name__ == "__main__":
    main()
