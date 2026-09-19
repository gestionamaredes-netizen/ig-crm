# -*- coding: utf-8 -*-
"""PDF de las 15 ideas de alquiler de estudio (1080x1920, una idea por pantalla)."""
import base64, re
from contenido import TITULO, BAJADA, FIRMA, EQUIPO, METODO, IDEAS

ASSETS = "../carpeta-programacion/assets"
TOTAL = 3 + len(IDEAS)
LOGO = None
PERSONA = {k: (nom, rol, col, ang) for k, nom, rol, col, ang in EQUIPO}

def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    for f in set(re.findall(r"url\(assets/fonts/([^)]+)\)", css)):
        css = css.replace("assets/fonts/" + f, "data:font/woff2;base64,"
                          + base64.b64encode(open(ASSETS + "/fonts/" + f, "rb").read()).decode())
    return css

def bar(n, extra=""):
    return (f'<div class="bar"><img src="{LOGO}">'
            f'<span class="pg">{extra}{n:02d} / {TOTAL}</span></div>')

def foot(t, r=FIRMA):
    return ('  <div class="body-pad" style="padding-bottom:40px">\n    <div class="footrule"></div>\n'
            f'    <div class="foot"><span>{t}</span><span class="r">{r}</span></div>\n  </div>\n')

def page(inner, bg=""):
    return f'<div class="page">{bg}<div class="stack">{inner}</div></div>\n'

def glow(a, b="rgba(4,6,10,0)"):
    return (f'<div class="glow" style="background:'
            f'radial-gradient(80% 30% at 12% 5%, {a} 0%, rgba(4,6,10,0) 62%),'
            f'radial-gradient(74% 28% at 90% 95%, {b} 0%, rgba(4,6,10,0) 62%);"></div>')

def p_portada():
    chips = "".join(f'<div class="pchip" style="--a:{c}">{n}</div>' for _, n, _, c, _ in EQUIPO)
    inner = f"""  <div class="body-pad" style="padding-top:44px">{bar(1)}</div>
  <div class="spacer"></div>
  <div class="body-pad">
    <div class="eyebrow">Plan de contenido · El espacio</div>
    <h1 class="cover-h" style="font-size:104px; margin-top:20px">Alquilá<br>el estudio.</h1>
    <p class="parr" style="margin-top:22px">{BAJADA}</p>
    <div class="pchips">{chips}</div>
  </div>
  <div class="spacer"></div>
""" + foot(TITULO)
    return page(inner, glow("rgba(27,111,232,.28)", "rgba(222,28,43,.22)"))

def p_metodo():
    filas = "".join(
        f'<div class="mrow"><div class="mn">{i+1:02d}</div><div>'
        f'<div class="mt">{t}</div><div class="md">{d}</div></div></div>'
        for i, (t, d) in enumerate(METODO))
    inner = f"""  <div class="body-pad" style="padding-top:44px">{bar(2)}</div>
  <div class="body-pad" style="padding-top:34px">
    <div class="eyebrow">Antes de grabar</div>
    <h2 class="h2" style="margin-top:18px">Seis reglas que<br>valen para las 15.</h2>
  </div>
  <div class="spacer"></div>
  <div class="body-pad"><div class="mlist">{filas}</div></div>
  <div class="spacer"></div>
""" + foot("El método")
    return page(inner, glow("rgba(27,111,232,.22)", "rgba(222,28,43,.16)"))

def p_reparto():
    filas = ""
    for k, nom, rol, col, ang in EQUIPO:
        nums = " · ".join(i["n"] for i in IDEAS if i["quien"] == k)
        filas += f"""<div class="qrow" style="--a:{col}">
      <div class="qbar"></div>
      <div class="qtop"><span class="qn">{nom}</span><span class="qi">{nums}</span></div>
      <div class="qr">{rol}</div>
      <div class="qa">{ang}</div>
    </div>"""
    inner = f"""  <div class="body-pad" style="padding-top:44px">{bar(3)}</div>
  <div class="body-pad" style="padding-top:34px">
    <div class="eyebrow">Quién graba qué</div>
    <h2 class="h2" style="margin-top:18px">Tres videos<br>cada uno.</h2>
    <p class="parr" style="margin-top:18px">Cada uno habla desde su rol, no del estudio en
      general. El color sirve para encontrar las propias de un vistazo.</p>
  </div>
  <div class="spacer"></div>
  <div class="body-pad"><div class="qlist">{filas}</div></div>
  <div class="spacer"></div>
""" + foot("El reparto")
    return page(inner, glow("rgba(27,111,232,.22)", "rgba(222,28,43,.16)"))

def p_idea(idea, n):
    nom, rol, a, _ang = PERSONA[idea["quien"]]
    inner = f"""  <div class="body-pad" style="padding-top:44px">{bar(n, "IDEA ")}</div>
  <div class="spacer"></div>
  <div class="body-pad idea" style="--a:{a}">
    <div class="ihead">
      <div class="inum">{idea['n']}</div>
      <div class="imeta"><span class="icat">{nom}</span>
        <span class="idur">{idea['uso']} · {idea['dur']}</span></div>
    </div>
    <h2 class="ititulo">{idea['titulo']}</h2>

    <div class="glabel">Gancho · primeros 3 segundos</div>
    <div class="gbox">«{idea['gancho']}»</div>

    <div class="lab" style="margin-top:34px"><span>Desarrollo</span></div>
    <p class="parr" style="margin-top:12px">{idea['desarrollo']}</p>

    <div class="lab" style="margin-top:30px"><span>Qué se ve en cámara</span></div>
    <p class="parr recurso" style="margin-top:12px">{idea['recurso']}</p>

    <div class="lab" style="margin-top:30px"><span>Cierre</span></div>
    <p class="cierre">{idea['cierre']}</p>
  </div>
  <div class="spacer"></div>
  <div class="body-pad"><div class="vende" style="--a:{a}">Lo graba <b>{nom}</b> ·
    vende <b>{idea['vende']}</b></div></div>
""" + foot(idea['titulo'], nom)
    return page(inner, glow(a + "22"))

def build():
    global LOGO
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    pages = [p_portada(), p_metodo(), p_reparto()]
    n = 4
    for idea in IDEAS:
        pages.append(p_idea(idea, n)); n += 1
    assert n - 1 == TOTAL, "son %d paginas" % (n - 1)
    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    html = ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            f"<title>{TITULO} — Nexo Studios</title>"
            f"<style>{css}</style></head><body>\n" + "".join(pages) + "</body></html>")
    open(".ideas.inlined.html", "w").write(html)
    print("paginas:", len(pages))

if __name__ == "__main__":
    build()
