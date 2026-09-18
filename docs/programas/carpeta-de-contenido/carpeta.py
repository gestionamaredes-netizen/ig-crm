# -*- coding: utf-8 -*-
"""Carpeta de contenido de Nexo Studios — 1080x1920, pensada para el celular.

Cada programa abre con su key art a sangre y sigue con la ficha, la estructura
en formato lista de episodios y por donde sale. El contenido vive en contenido.py.
"""
import base64, re
from contenido import (STAFF, ESTUDIO, SECTORES, PROYECTOS, NOTA_GRILLA,
                       TEMPORADA, BAJADA_NEXO, PAISES)

ASSETS = "../carpeta-programacion/assets"
TOTAL = 8
LOGO = None
POSTER = None
NEXO = None
ART = {}
BLUR = {}

def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    for f in set(re.findall(r"url\(assets/fonts/([^)]+)\)", css)):
        css = css.replace("assets/fonts/" + f, "data:font/woff2;base64,"
                          + base64.b64encode(open(ASSETS + "/fonts/" + f, "rb").read()).decode())
    return css

def bar(n):
    return (f'<div class="bar"><img src="{LOGO}">'
            f'<span class="pg">{n:02d} / {TOTAL}</span></div>')

def foot(txt):
    return ('  <div class="body-pad" style="padding-bottom:40px">\n'
            '    <div class="footrule"></div>\n'
            f'    <div class="foot"><span>{txt}</span><span class="r">Nexo Studios · 2026</span></div>\n'
            '  </div>\n')

def page(inner, bg=""):
    return f'<div class="page">{bg}<div class="stack">{inner}</div></div>\n'

def glow(a, b="rgba(4,6,10,0)"):
    return (f'<div class="glow" style="background:'
            f'radial-gradient(80% 32% at 14% 4%, {a} 0%, rgba(4,6,10,0) 60%),'
            f'radial-gradient(76% 30% at 88% 96%, {b} 0%, rgba(4,6,10,0) 60%);"></div>')

def hero(p, n, alto=None, art_alto=None):
    alto = alto or (645 if p.get("nota") else 825)
    # se reserva la franja inferior para el titulo: el art nunca se pisa con el texto
    art_alto = art_alto or (alto - 278)
    return f"""  <div class="hero" style="--a:{p['accent']}; height:{alto}px">
    <div class="hero-halo"></div>
    <div class="hero-art" style="height:{art_alto}px"><img src="{ART[p['slug']]}"></div>
    <div class="hero-scrim"></div>
    {bar(n)}
    <div class="hero-txt">
      <div class="kicker">{p['n']} · {p['ficha'][0][1]}</div>
      <div class="htitle">{p['bajada']}</div>
      <div class="hsub">{p['nombre']}{' · ' + p['lockup'] if p.get('lockup') else ''}</div>
    </div>
  </div>
"""

# ───────────────────────────────────────────── páginas

def p_titulo():
    inner = f"""  <div class="spacer"></div>
  <div class="body-pad tcard">
    <img class="tlogo" src="{NEXO}">
    <div class="trule"></div>
    <div class="tkicker">Biblioteca de contenido</div>
    <h1 class="tbig">Lanzamiento<br>Temporada 2026.</h1>
    <p class="tsub">{BAJADA_NEXO}<br>Cinco programas producidos y emitidos desde Nexo Studios.</p>
    <div class="tpaises">{PAISES}</div>
  </div>
  <div class="spacer"></div>
""" + foot("Biblioteca de contenido")
    fondo = ('<div class="glow" style="background:#000"></div>'
             '<div class="glow" style="background:'
             'radial-gradient(52% 22% at 8% 7%, rgba(27,111,232,.34) 0%, rgba(0,0,0,0) 68%),'
             'radial-gradient(52% 22% at 92% 93%, rgba(222,28,43,.28) 0%, rgba(0,0,0,0) 68%);">'
             '</div>')
    return page(inner, fondo)

def p_portada():
    filas = "".join(
        f'<div class="sr" style="--a:{p["accent"]}"><i></i>'
        f'<span class="sn">{p["nombre"]}</span>'
        f'<span class="sd">{p["dia"]}</span></div>' for p in PROYECTOS)
    inner = f"""  <div class="poster"><img src="{POSTER}"><div class="poster-fade"></div></div>
  <div class="spacer"></div>
  <div class="body-pad">
    <div class="lab"><span>Grilla semanal</span><em>{NOTA_GRILLA}</em></div>
    <div class="sched">{filas}</div>
  </div>
  <div class="spacer"></div>
""" + foot("La grilla")
    return page(inner)

def p_proyecto(p, n):
    f = dict(p["ficha"])
    chips = f'<div class="chip"><b>{f["Duración"]}</b></div>'
    if f["Frecuencia"].lower() not in p["dia"].lower():
        chips += f'<div class="chip"><b>{f["Frecuencia"]}</b></div>'
    chips += f'<div class="chip acc"><b>{p["dia"]}</b></div>' 
    eps = "".join(f'<div class="ep"><div class="n">{b}</div><div class="t">{t}</div>'
                  f'<div class="m">{m}</div></div>' for b, t, m in p["estructura"])
    nota = ""
    if p.get("nota"):
        k, v = p["nota"]
        nota = (f'<div class="nota" style="margin-top:30px"><div class="nk">{k}</div>'
                f'<div class="nv">{v}</div></div>')
    inner = hero(p, n) + f"""  <div class="body-pad" style="padding-top:30px; --a:{p['accent']}">
    <div class="chips">{chips}</div>
    <p class="parr" style="margin-top:26px">{p['concepto']}</p>
    <div class="lab" style="margin-top:30px"><span>En cámara</span></div>
    <p class="parr" style="font-size:26px; color:#C6CFDA; margin-top:10px">{f['En cámara']}</p>
    <div class="lab" style="margin-top:34px"><span>Estructura</span><em>{len(p['estructura'])} bloques</em></div>
    <div class="eps">{eps}</div>
    <div class="lab" style="margin-top:34px"><span>Por dónde sale</span></div>
    <p class="parr" style="font-size:25px; margin-top:12px">{p['salida']}</p>
    {nota}
  </div>
  <div class="spacer"></div>
""" + foot(p["nombre"])
    return page(inner, glow(p["accent"] + "1F"))

def p_estudio(n):
    fila = lambda ks: "".join(f'<div class="frow"><span>{k}</span><b>{v}</b></div>' for k, v in ks)
    inner = f"""  <div class="body-pad" style="padding-top:44px">
    <div class="bar" style="position:static; padding:0">
      <img src="{LOGO}"><span class="pg">{n:02d} / {TOTAL}</span></div>
    <div style="height:46px"></div>
    <div class="eyebrow">El estudio</div>
    <h1 class="cover-h" style="font-size:76px; margin-top:22px">Dónde y con<br>quiénes.</h1>
    <p class="parr" style="margin-top:20px">Los cinco programas salen de Nexo Studios,
      San Martín, con el mismo equipamiento y el mismo equipo.</p>
  </div>
  <div class="spacer"></div>
  <div class="body-pad" style="--a:var(--blue2)">
    <div class="lab"><span>Los tres sectores del piso</span></div>
    <div class="fbox" style="margin-top:14px">{fila(SECTORES)}</div>
    <div class="lab" style="margin-top:28px"><span>Equipamiento</span></div>
    <div class="fbox" style="margin-top:14px">{fila(ESTUDIO)}</div>
    <div class="lab" style="margin-top:28px"><span>Equipo</span></div>
    <div class="fbox" style="margin-top:14px">{fila(STAFF)}</div>
  </div>
  <div class="spacer"></div>
""" + foot("Estudio y equipo")
    return page(inner, glow("rgba(27,111,232,.24)", "rgba(222,28,43,.18)"))

def build():
    global LOGO
    global POSTER, NEXO
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    POSTER = b64(ASSETS + "/grilla-2026.jpg", "image/jpeg")
    NEXO = b64(ASSETS + "/nexo-principal.jpg", "image/jpeg")
    for p in PROYECTOS:
        ART[p["slug"]] = b64("%s/art-%s.jpg" % (ASSETS, p["slug"]), "image/jpeg")
        BLUR[p["slug"]] = b64("%s/blur-%s.jpg" % (ASSETS, p["slug"]), "image/jpeg")
    pages = [p_titulo(), p_portada()]
    n = 3
    for p in PROYECTOS:
        pages.append(p_proyecto(p, n)); n += 1
    pages.append(p_estudio(n))
    assert n == TOTAL, "son %d paginas" % n
    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    html = ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            "<title>Nexo Studios — Carpeta de contenido 2026</title>"
            f"<style>{css}</style></head><body>\n" + "".join(pages) + "</body></html>")
    open(".carpeta.inlined.html", "w").write(html)
    print("paginas:", len(pages))

if __name__ == "__main__":
    build()
