# -*- coding: utf-8 -*-
"""Carpeta de contenido de Nexo Studios — 1080x1920, pensada para el celular.

Cada programa abre con su key art a sangre y sigue con la ficha, la estructura
en formato lista de episodios y por donde sale. El contenido vive en contenido.py.
"""
import base64, re
from contenido import (STAFF, ESTUDIO, SECTORES, PROYECTOS, NOTA_GRILLA,
                       TEMPORADA, BAJADA_NEXO, PAISES)

ASSETS = "../carpeta-programacion/assets"
TOTAL = 7
LOGO = None
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
    alto = alto or (538 if p.get("nota") else 800)
    # se reserva la franja inferior para el titulo: el art nunca se pisa con el texto
    art_alto = art_alto or (alto - 278)
    return f"""  <div class="hero" style="--a:{p['accent']}; height:{alto}px; background:{p['logo_bg']}">
    <div class="hero-bg" style="background-image:url({BLUR[p['slug']]})"></div>
    <div class="hero-tint"></div>
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

def p_portada():
    dest, resto = PROYECTOS[0], PROYECTOS[1:]
    def tile(p, cls):
        return f"""<div class="tile {cls}" style="--a:{p['accent']}; background:{p['logo_bg']}">
        <div class="tbar"></div>
        <div class="tbg" style="background-image:url({BLUR[p['slug']]})"></div>
        <div class="tart"><img src="{ART[p['slug']]}"></div>
        <div class="tscrim"></div>
        <div class="ttxt"><div class="tnm">{p['nombre']}</div>
          <div class="tdia">{p['dia']}</div></div>
      </div>"""
    grid = "".join(tile(p, "sm") for p in resto)
    inner = f"""  <div class="body-pad" style="padding-top:40px">
    <div class="bar" style="position:static; padding:0">
      <img src="{LOGO}" style="height:70px"><span class="pg">01 / {TOTAL}</span></div>
    <div style="height:26px"></div>
    <div class="eyebrow">{TEMPORADA}</div>
    <h1 class="cover-h" style="font-size:76px; margin-top:14px">Programación<br>2026.</h1>
    <p class="parr" style="margin-top:14px">{BAJADA_NEXO}<br>Cinco programas producidos y
      emitidos desde Nexo Studios. {PAISES}.</p>
  </div>
  <div class="spacer"></div>
  <div class="body-pad">
    {tile(dest, "big")}
    <div class="grid2" style="margin-top:16px">{grid}</div>
  </div>
  <div class="spacer"></div>
  <div class="body-pad"><div class="aviso">{NOTA_GRILLA}</div></div>
""" + foot("Carpeta de contenido")
    return page(inner, glow("rgba(27,111,232,.26)", "rgba(222,28,43,.20)"))

def p_proyecto(p, n):
    f = dict(p["ficha"])
    chips = (f'<div class="chip"><b>{f["Duración"]}</b></div>'
             f'<div class="chip"><b>{f["Frecuencia"]}</b></div>'
             f'<div class="chip acc"><b>{p["dia"]}</b></div>')
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
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    for p in PROYECTOS:
        ART[p["slug"]] = b64("%s/art-%s.jpg" % (ASSETS, p["slug"]), "image/jpeg")
        BLUR[p["slug"]] = b64("%s/blur-%s.jpg" % (ASSETS, p["slug"]), "image/jpeg")
    pages = [p_portada()]
    n = 2
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
