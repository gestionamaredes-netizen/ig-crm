# -*- coding: utf-8 -*-
"""Arma el HTML de la propuesta interna (1080x1920, vertical, para leer en el celular)."""
import base64, re
from contenido import STAFF, ESTUDIO, PROYECTOS, RESUMEN_NOTA

ASSETS = "../carpeta-programacion/assets"
TOTAL = 7
LOGO = None
LOGOS = {}

def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    for f in set(re.findall(r"url\(assets/fonts/([^)]+)\)", css)):
        css = css.replace("assets/fonts/" + f, "data:font/woff2;base64,"
                          + base64.b64encode(open(ASSETS + "/fonts/" + f, "rb").read()).decode())
    return css

def head(tag, n, a="var(--blue2)"):
    return (f'  <div class="topbar"><img class="nexo" src="{LOGO}">'
            f'<div class="tb"><span style="color:{a}">{tag}</span>'
            f'<span class="num">{n} / {TOTAL}</span></div></div>\n  <div class="rule"></div>\n')

def foot(t="Propuesta interna"):
    return ('  <div class="spacer"></div>\n  <div class="footrule"></div>\n'
            f'  <div class="foot"><span>{t}</span><span class="r">Nexo Studios</span></div>\n')

def page(inner, bg=""):
    return f'<div class="page">{bg}<div class="pad">{inner}</div></div>\n'

def glow(a, b="rgba(5,7,11,0)"):
    return (f'<div class="glow" style="background:'
            f'radial-gradient(78% 36% at 12% 6%, {a} 0%, rgba(5,7,11,0) 62%),'
            f'radial-gradient(74% 34% at 90% 94%, {b} 0%, rgba(5,7,11,0) 62%);"></div>')

def placa(p, alto):
    return (f'<div class="placa" style="height:{alto}px; background:{p["logo_bg"]}">'
            f'<img src="{LOGOS[p["slug"]]}" alt="{p["nombre"]}"></div>')

# ───────────────────────────────────────── páginas

def p_portada():
    filas = "".join(
        f'<div class="prow" style="--a:{p["accent"]}"><span class="pn">{p["n"]}</span>'
        f'{placa(p, 84)}<span class="pnm">{p["nombre"]}</span></div>' for p in PROYECTOS)
    inner = f"""  <div class="topbar"><img class="nexo" src="{LOGO}"></div>
  <div class="rule"></div>
  <div class="spacer"></div>
  <div class="eyebrow">Documento interno</div>
  <h1 class="h1">Propuesta de<br>programación.</h1>
  <p class="lead" style="margin-top:30px">Cuatro proyectos que se producen y se emiten
    desde Nexo Studios. Qué es cada uno, cómo está armado y por dónde sale.</p>
  <div class="spacer"></div>
  <div class="plist">{filas}</div>
  <div class="footrule" style="margin-top:44px"></div>
  <div class="foot"><span>Propuesta interna</span><span class="r">01 / {TOTAL}</span></div>
"""
    return page(inner, glow("rgba(27,111,232,.28)", "rgba(222,28,43,.22)"))

def p_proyecto(p, n):
    fic = "".join(f'<div class="frow"><span>{k}</span><b>{v}</b></div>' for k, v in p["ficha"])
    est = "".join(f'<div class="erow"><div class="eb" style="--a:{p["accent"]}">{b}</div>'
                  f'<div class="et">{t}</div><div class="em">{m}</div></div>'
                  for b, t, m in p["estructura"])
    lock = f'<div class="lock">{p["lockup"]}</div>' if p.get("lockup") else ""
    nota = ""
    if p.get("nota"):
        k, v = p["nota"]
        nota = (f'<div class="nota" style="--a:{p["accent"]}"><div class="nk">{k}</div>'
                f'<div class="nv">{v}</div></div>')
    inner = head(p["nombre"], n, p["accent"]) + f"""  <div style="height:34px"></div>
  {placa(p, 150)}
  {lock}
  <p class="concepto">{p['concepto']}</p>
  <div class="sec" style="color:{p['accent']}">Ficha</div>
  <div class="fbox">{fic}</div>
  <div class="sec" style="color:{p['accent']}; margin-top:34px">Estructura</div>
  <div class="ebox">{est}</div>
  <div class="sec" style="color:{p['accent']}; margin-top:34px">Por dónde sale</div>
  <p class="salida">{p['salida']}</p>
  {nota}
""" + foot(p["nombre"])
    return page(inner, glow(p["accent"] + "26"))

def p_estudio(n):
    eq = "".join(f'<div class="frow"><span>{k}</span><b>{v}</b></div>' for k, v in ESTUDIO)
    st = "".join(f'<div class="frow"><span>{k}</span><b>{v}</b></div>' for k, v in STAFF)
    inner = head("Estudio y equipo", n) + f"""  <div style="height:34px"></div>
  <h2 class="h2">Dónde y con<br>quiénes.</h2>
  <p class="concepto">Los cuatro programas se producen, se emiten y se posproducen en
    Nexo Studios, San Martín, con la misma estructura y el mismo equipamiento.</p>
  <div class="spacer"></div>
  <div class="sec b">Equipamiento del estudio</div>
  <div class="fbox">{eq}</div>
  <div class="sec b" style="margin-top:34px">Equipo</div>
  <div class="fbox">{st}</div>
""" + foot("Estudio y equipo")
    return page(inner, glow("rgba(27,111,232,.24)", "rgba(222,28,43,.18)"))

def p_resumen(n):
    filas = ""
    for p in PROYECTOS:
        f = dict(p["ficha"])
        dia = "Martes 21 – 23 h" if p["slug"] == "el-motivo" else "A definir"
        filas += f"""<div class="rcard" style="--a:{p['accent']}">
      <div class="rbar"></div>
      <div class="rnm">{p['nombre']}</div>
      <div class="rgrid">
        <div><span>Formato</span><b>{f['Formato']}</b></div>
        <div><span>Duración</span><b>{f['Duración']}</b></div>
        <div><span>Frecuencia</span><b>{f['Frecuencia']}</b></div>
        <div><span>Día y franja</span><b>{dia}</b></div>
      </div>
    </div>"""
    inner = head("Resumen", n) + f"""  <div style="height:34px"></div>
  <h2 class="h2">La grilla<br>de un vistazo.</h2>
  <div class="spacer"></div>
  <div class="rlist">{filas}</div>
  <div class="aviso">{RESUMEN_NOTA}</div>
""" + foot("Resumen de la grilla")
    return page(inner, glow("rgba(27,111,232,.24)", "rgba(222,28,43,.18)"))

def build():
    global LOGO
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    for p in PROYECTOS:
        LOGOS[p["slug"]] = b64(ASSETS + "/" + p["logo"], "image/png")
    pages = [p_portada()]
    n = 2
    for p in PROYECTOS:
        pages.append(p_proyecto(p, n)); n += 1
    pages.append(p_estudio(n)); n += 1
    pages.append(p_resumen(n))
    assert n == TOTAL, "son %d paginas" % n
    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    html = ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            "<title>Nexo Studios — Propuesta interna de programación</title>"
            f"<style>{css}</style></head><body>\n" + "".join(pages) + "</body></html>")
    open(".interna.inlined.html", "w").write(html)
    print("paginas:", len(pages))

if __name__ == "__main__":
    build()
