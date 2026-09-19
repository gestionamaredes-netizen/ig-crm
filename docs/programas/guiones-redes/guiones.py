# -*- coding: utf-8 -*-
"""Maqueta compartida de los cuadernillos de guiones (1080x1920, vertical).

Uso: python3 guiones.py contenido_espana   ·   python3 guiones.py contenido_siempre
El contenido de cada cuadernillo vive en su propio modulo contenido_*.py
"""
import base64, importlib, re, sys

ASSETS = "../carpeta-programacion/assets"
LOGO = None

def comillas(t):
    """Evita el doble « cuando el gancho ya cita algo."""
    return t if t.lstrip().startswith("\u00ab") else "\u00ab%s\u00bb" % t

def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    for f in set(re.findall(r"url\(assets/fonts/([^)]+)\)", css)):
        css = css.replace("assets/fonts/" + f, "data:font/woff2;base64,"
                          + base64.b64encode(open(ASSETS + "/fonts/" + f, "rb").read()).decode())
    return css

def render(C):
    conexion_datos = getattr(C, "CONEXION", None)
    total = 2 + len(C.IDEAS) + (1 if conexion_datos else 0)

    def bar(n, extra=""):
        return (f'<div class="bar"><img src="{LOGO}">'
                f'<span class="pg">{extra}{n:02d} / {total}</span></div>')

    def foot(t, r=C.FIRMA):
        return ('  <div class="body-pad" style="padding-bottom:40px">\n'
                '    <div class="footrule"></div>\n'
                f'    <div class="foot"><span>{t}</span><span class="r">{r}</span></div>\n  </div>\n')

    def page(inner, bg=""):
        return f'<div class="page">{bg}<div class="stack">{inner}</div></div>\n'

    def glow(a, b="rgba(4,6,10,0)"):
        return (f'<div class="glow" style="background:'
                f'radial-gradient(80% 30% at 12% 5%, {a} 0%, rgba(4,6,10,0) 62%),'
                f'radial-gradient(74% 28% at 90% 95%, {b} 0%, rgba(4,6,10,0) 62%);"></div>')

    h1 = C.TITULO.replace("\n", "<br>")
    portada = f"""  <div class="body-pad" style="padding-top:44px">{bar(1)}</div>
  <div class="spacer"></div>
  <div class="body-pad">
    <div class="eyebrow">{C.EYEBROW}</div>
    <h1 class="cover-h" style="font-size:104px; margin-top:20px">{h1}</h1>
    <p class="parr" style="margin-top:22px">{C.BAJADA}</p>
  </div>
  <div class="spacer"></div>
""" + foot(C.TITULO_CORTO)

    filas = "".join(
        f'<div class="mrow"><div class="mn">{i+1:02d}</div><div>'
        f'<div class="mt">{t}</div><div class="md">{d}</div></div></div>'
        for i, (t, d) in enumerate(C.METODO))
    n_met = 2 + (1 if conexion_datos else 0)
    metodo = f"""  <div class="body-pad" style="padding-top:44px">{bar(n_met)}</div>
  <div class="body-pad" style="padding-top:34px">
    <div class="eyebrow">Antes de grabar</div>
    <h2 class="h2" style="margin-top:18px">Seis reglas que<br>valen para los {len(C.IDEAS)}.</h2>
  </div>
  <div class="spacer"></div>
  <div class="body-pad"><div class="mlist">{filas}</div></div>
  <div class="spacer"></div>
""" + foot("El método")

    pages = [page(portada, glow("rgba(27,111,232,.28)", "rgba(222,28,43,.22)"))]

    if conexion_datos:
        cfilas = "".join(
            f'<div class="mrow"><div class="mn">{i+1:02d}</div><div>'
            f'<div class="mt">{t}</div><div class="md">{d}</div></div></div>'
            for i, (t, d) in enumerate(conexion_datos))
        c_eye = getattr(C, "CONEXION_EYEBROW", "Para tenerlo claro")
        c_tit = getattr(C, "CONEXION_TITULO", "La conexión,<br>explicada.")
        conx = f"""  <div class="body-pad" style="padding-top:44px">{bar(2)}</div>
  <div class="body-pad" style="padding-top:34px">
    <div class="eyebrow">{c_eye}</div>
    <h2 class="h2" style="margin-top:18px">{c_tit}</h2>
  </div>
  <div class="spacer"></div>
  <div class="body-pad"><div class="mlist">{cfilas}</div></div>
  <div class="spacer"></div>
""" + foot(getattr(C, "CONEXION_PIE", "La conexión"))
        pages.append(page(conx, glow(C.ACENTOS[0] + "26", C.ACENTOS[-1] + "1C")))

    pages.append(page(metodo, glow("rgba(27,111,232,.22)", "rgba(222,28,43,.16)")))

    for k, idea in enumerate(C.IDEAS):
        n = k + 3 + (1 if conexion_datos else 0)
        a = C.ACENTOS[k % len(C.ACENTOS)]
        quien = ('<span class="iquien">%s</span>' % idea["quien"]) if idea.get("quien") else ""
        inner = f"""  <div class="body-pad" style="padding-top:44px">{bar(n, "GUION ")}</div>
  <div class="spacer"></div>
  <div class="body-pad idea" style="--a:{a}">
    <div class="ihead">
      <div class="inum">{idea['n']}</div>
      <div class="imeta">{quien}<span class="icat">{idea['cat']}</span>
        <span class="idur">{idea['dur']}</span></div>
    </div>
    <h2 class="ititulo">{idea['titulo']}</h2>

    <div class="glabel">Gancho · primeros 3 segundos</div>
    <div class="gbox">{comillas(idea["gancho"])}</div>

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
        pages.append(page(inner, glow(a + "22")))

    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    return ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            f"<title>{C.TITULO_CORTO} — Nexo Studios</title>"
            f"<style>{css}</style></head><body>\n" + "".join(pages) + "</body></html>")

def main():
    global LOGO
    mod = sys.argv[1] if len(sys.argv) > 1 else "contenido_espana"
    C = importlib.import_module(mod)
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    open(".%s.inlined.html" % C.SLUG, "w").write(render(C))
    n = 2 + len(C.IDEAS) + (1 if getattr(C, "CONEXION", None) else 0)
    print("%s · %d paginas" % (C.SLUG, n))

if __name__ == "__main__":
    main()
