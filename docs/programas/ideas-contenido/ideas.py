# -*- coding: utf-8 -*-
"""Arma el PDF de las 15 ideas de contenido (1080x1920, una idea por pantalla)."""
import base64, re
from contenido import AUTOR, ROL, TITULO, BAJADA, METODO, IDEAS

ASSETS = "../carpeta-programacion/assets"
TOTAL = 2 + len(IDEAS)
LOGO = None
# los acentos rotan para dar ritmo al pasar las pantallas
ACENTOS = ["#4DA3FF", "#FF3F4D", "#C7A45E"]

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

def foot(t):
    return ('  <div class="body-pad" style="padding-bottom:40px">\n    <div class="footrule"></div>\n'
            f'    <div class="foot"><span>{t}</span><span class="r">{AUTOR}</span></div>\n  </div>\n')

def page(inner, bg=""):
    return f'<div class="page">{bg}<div class="stack">{inner}</div></div>\n'

def glow(a, b="rgba(4,6,10,0)"):
    return (f'<div class="glow" style="background:'
            f'radial-gradient(80% 30% at 12% 5%, {a} 0%, rgba(4,6,10,0) 62%),'
            f'radial-gradient(74% 28% at 90% 95%, {b} 0%, rgba(4,6,10,0) 62%);"></div>')

def p_portada():
    inner = f"""  <div class="body-pad" style="padding-top:44px">{bar(1)}</div>
  <div class="spacer"></div>
  <div class="body-pad">
    <div class="eyebrow">Guion de redes</div>
    <h1 class="cover-h" style="font-size:108px; margin-top:22px">15 ideas<br>de contenido.</h1>
    <p class="parr" style="margin-top:22px">{BAJADA}</p>
    <div class="autor">
      <div class="an">{AUTOR}</div>
      <div class="ar">{ROL}</div>
    </div>
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

def p_idea(idea, n):
    a = ACENTOS[(n - 3) % len(ACENTOS)]
    inner = f"""  <div class="body-pad" style="padding-top:44px">{bar(n, "IDEA ")}</div>
  <div class="spacer"></div>
  <div class="body-pad idea" style="--a:{a}">
    <div class="ihead">
      <div class="inum">{idea['n']}</div>
      <div class="imeta"><span class="icat">{idea['cat']}</span>
        <span class="idur">{idea['dur']}</span></div>
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
  <div class="body-pad"><div class="vende" style="--a:{a}">Vende: <b>{idea['vende']}</b></div></div>
""" + foot(idea['titulo'])
    return page(inner, glow(a + "22"))

def build():
    global LOGO
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    pages = [p_portada(), p_metodo()]
    n = 3
    for idea in IDEAS:
        pages.append(p_idea(idea, n)); n += 1
    assert n - 1 == TOTAL, "son %d paginas" % (n - 1)
    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    html = ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            f"<title>{TITULO} — {AUTOR}</title>"
            f"<style>{css}</style></head><body>\n" + "".join(pages) + "</body></html>")
    open(".ideas.inlined.html", "w").write(html)
    print("paginas:", len(pages))

if __name__ == "__main__":
    build()
