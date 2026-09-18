# -*- coding: utf-8 -*-
"""Arma el HTML de la Carpeta General de Proyecto (1920x1080, apaisado).

El contenido vive en contenido.py. Este archivo solo maqueta.
"""
import base64, re, sys
from contenido import STAFF, ESTUDIO, PROGRAMAS, PAQUETES, ASSETS

ASSETS_DIR = "assets"
TOTAL = 19

def b64(path, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(path, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS_DIR + "/fonts.css").read()
    for f in set(re.findall(r"url\((assets/fonts/[^)]+)\)", css)):
        css = css.replace(f, "data:font/woff2;base64,"
                          + base64.b64encode(open(f, "rb").read()).decode())
    return css

LOGO = None; RENDER = None; LOGOS = {}

def head(tag, n, accent=None):
    a = accent or "var(--blue2)"
    return f"""  <div class="topbar">
    <img class="nexo" src="{LOGO}">
    <div class="tb-right"><span class="tb-tag" style="color:{a}">{tag}</span>
      <span class="tb-num">{n} / {TOTAL}</span></div>
  </div>
  <div class="rule"></div>
"""

def foot(txt="Nexo Studios · Carpeta de programación"):
    return f'  <div class="spacer"></div>\n  <div class="footrule"></div>\n  <div class="foot"><span>{txt}</span><span class="r">Confidencial</span></div>\n'

def page(inner, cls="", bg=""):
    return f'<div class="page {cls}">{bg}<div class="pad">{inner}</div></div>\n'

def placa(p, alto, extra=""):
    """Placa de marca: el logo del programa sobre su propio fondo."""
    return (f'<div class="placa" style="height:{alto}px; background:{p["logo_bg"]}; {extra}">'
            f'<img src="{LOGOS[p["slug"]]}" alt="{p["nombre"]}"></div>')

def glow(a="rgba(27,111,232,.22)", b="rgba(222,28,43,.18)"):
    return (f'<div class="glow" style="background:'
            f'radial-gradient(56% 46% at 10% 6%, {a} 0%, rgba(5,7,11,0) 62%),'
            f'radial-gradient(58% 48% at 92% 94%, {b} 0%, rgba(5,7,11,0) 62%);"></div>')

def xmark(style, color="#FFFFFF", op=".05"):
    return (f'<svg class="xmark" style="{style}; opacity:{op}" viewBox="0 0 100 100">'
            f'<g stroke="{color}" stroke-width="9" stroke-linecap="square">'
            f'<line x1="14" y1="14" x2="86" y2="86"/><line x1="86" y1="14" x2="14" y2="86"/></g></svg>')

# ───────────────────────────────────────────────────────────── páginas fijas

def p_portada():
    chips = "".join(f'<div class="gchip" style="border-color:{p["accent"]}55">'
                    f'<span class="gn" style="color:{p["accent"]}">{p["n"]}</span>'
                    f'<span class="gt">{p["nombre"]}</span></div>' for p in PROGRAMAS)
    bg = (f'<div class="cover-img" style="background-image:url({RENDER})"></div>'
          f'<div class="cover-tint"></div>')
    inner = f"""  <div class="topbar"><img class="nexo" src="{LOGO}"></div>
  <div class="rule"></div>
  <div class="spacer"></div>
  <div class="eyebrow">Carpeta general de proyecto · Temporada 2026</div>
  <h1 class="h1">Tres programas.<br>Un solo estudio.<br><span class="b">Una grilla</span> <span class="r">lista</span> para salir.</h1>
  <p class="lead" style="margin-top:30px; max-width:980px">Dossier de presentación para marcas,
    patrocinadores e inversores. Producción, emisión y posproducción integradas en Nexo Studios.</p>
  <div class="spacer"></div>
  <div class="gchips">{chips}</div>
  <div class="footrule" style="margin-top:44px"></div>
  <div class="foot"><span>Nexo Studios</span><span class="r">Confidencial</span></div>
"""
    return page(inner, "cover", bg)

def p_estudio():
    cards = "".join(f'<div class="card"><div class="n">{k}</div><div class="t">{v}</div>'
                    f'<div class="s">{d}</div></div>' for k, v, d in ESTUDIO)
    inner = head("El estudio", "02") + f"""  <div style="height:44px"></div>
  <div class="cols c-6040">
    <div>
      <div class="eyebrow">01 · Nexo Studios</div>
      <h2 class="h2" style="margin-top:20px">Dónde se<br>produce todo.</h2>
      <p class="body" style="margin-top:24px">Nexo Studios es un estudio de producción integral
        para contenido en vivo y podcast. Set modular, sala de control propia y equipo técnico
        permanente: los tres programas de esta grilla se producen, se emiten y se posproducen
        en el mismo lugar y con el mismo estándar.</p>
      <p class="body" style="margin-top:16px">Para una marca eso significa una sola interlocución,
        una sola calidad de entrega y la capacidad de sostener tres señales sin alquilar nada
        por afuera.</p>
      <div class="shot" style="margin-top:28px"><img src="{RENDER}"></div>
    </div>
    <div>
      <div class="sec b">Capacidad técnica instalada</div>
      <div class="cards2" style="margin-top:20px">{cards}</div>
    </div>
  </div>
""" + foot()
    return page(inner, "", glow())

def p_grilla():
    cols = ""
    for p in PROGRAMAS:
        fr = "".join(f'<div class="frow"><span>{k}</span><b>{v}</b></div>' for k, v in p["ficha_rapida"])
        cols += f"""<div class="gcol" style="--a:{p['accent']}">
      <div class="gbar"></div>
      <div class="gnum">{p['n']}</div>
      {placa(p, 140, "margin-top:12px")}
      <div class="gtag">{p['tagline']}</div>
      <div class="gline">{p['unalinea']}</div>
      <div class="fgrid">{fr}</div>
    </div>"""
    inner = head("La grilla", "03") + f"""  <div style="height:40px"></div>
  <div class="eyebrow">02 · La grilla</div>
  <h2 class="h2" style="margin-top:20px">Tres audiencias que no se pisan.</h2>
  <p class="lead" style="margin-top:18px; max-width:1180px">Una mesa de mujeres adultas en vivo,
    un ciclo de entrevistas a emprendedoras y una mesa de chicos. Tres públicos distintos,
    tres momentos de consumo distintos, un mismo estándar de producción.</p>
  <div class="grilla" style="margin-top:40px">{cols}</div>
""" + foot()
    return page(inner, "", glow())

# ─────────────────────────────────────────────────────── páginas por programa

def p_divider(p, n):
    fr = "".join(f'<div class="dchip"><span>{k}</span><b>{v}</b></div>' for k, v in p["ficha_rapida"])
    bg = (glow(p.get("glow", p["accent"]) + "3A", "rgba(5,7,11,0)")
          + xmark("right:-160px; top:120px; width:760px; height:760px", p["accent"], ".10"))
    lock = f'<div class="dlock">{p["lockup"]}</div>' if p.get("lockup") else ""
    inner = head(p["nombre"], n, p["accent"]) + f"""  <div class="spacer"></div>
  <div class="cols c-5545" style="align-items:center">
    <div>
      <div class="dnum" style="color:{p['accent']}">{p['n']}</div>
      <div class="dname">{p['nombre']}</div>{lock}
      <div class="dtag" style="color:{p['accent2']}">{p['tagline']}</div>
      <p class="lead" style="margin-top:22px">{p['unalinea']}</p>
    </div>
    <div>{placa(p, 430)}</div>
  </div>
  <div class="spacer"></div>
  <div class="dchips">{fr}</div>
  <div class="footrule" style="margin-top:40px"></div>
  <div class="foot"><span>{p['nombre']}</span><span class="r">Confidencial</span></div>
"""
    return page(inner, "", bg)

def p_concepto(p, n):
    sin = "".join(f'<p class="body" style="margin-top:16px">{t}</p>' for t in p["sinopsis"])
    tgt = "".join(f'<div class="trow2"><div class="k">{k}</div><div class="v">{v}</div></div>'
                  for k, v in p["target"])
    pil = "".join(f'<div class="pil" style="--a:{p["accent"]}"><div class="pt">{t}</div>'
                  f'<div class="pd">{d}</div></div>' for t, d in p["pilares"])
    col_izq_extra = col_der_extra = ""
    if p.get("valores"):
        col_izq_extra = (f'<div class="valores"><span>Valores de marca</span>{p["valores"]}</div>')
    inner = head(p["nombre"], n, p["accent"]) + f"""  <div style="height:40px"></div>
  <div class="cols c-5545">
    <div>
      <div class="eyebrow" style="color:{p['accent']}">Concepto y sinopsis ejecutiva</div>
      <h2 class="h2" style="margin-top:18px">{p['tagline']}</h2>
      {sin}
      {col_izq_extra}
    </div>
    <div>
      <div class="sec" style="color:{p['accent']}">Target / audiencia objetiva</div>
      <div class="tbox" style="--a:{p['accent']}">{tgt}</div>
      {col_der_extra}
    </div>
  </div>
  <div class="spacer"></div>
  <div class="sec" style="color:{p['accent']}; margin-bottom:16px">Por qué funciona</div>
  <div class="pilares">{pil}</div>
""" + foot(p["nombre"])
    return page(inner, "", glow(p.get("glow", p["accent"]) + "2E"))

def p_escaleta(p, n):
    esc = "".join(f'<div class="erow"><div class="eb" style="--a:{p["accent"]}">{b}</div>'
                  f'<div class="et"><b>{t}</b><span>{d}</span></div>'
                  f'<div class="em">{m}</div></div>' for b, t, m, d in p["escaleta"])
    tono = "".join(f'<div class="trow2"><div class="k">{k}</div><div class="v">{v}</div></div>'
                   for k, v in p["tono"])
    dis = "".join(f'<div class="dcard" style="--a:{p["accent"]}"><div class="dk">{k}</div>'
                  f'<div class="dv">{v}</div></div>' for k, v in p["distribucion"])
    marca = ""
    if p.get("paleta"):
        sw = "".join(f'<div class="sw" title="{nom}"><i style="background:{hx}"></i>{hx}</div>'
                     for hx, nom in p["paleta"])
        marca = (f'<div class="sec" style="color:{p["accent"]}; margin-top:28px">Paleta de marca</div>'
                 f'<div class="pal">{sw}</div>')

    inner = head(p["nombre"], n, p["accent"]) + f"""  <div style="height:40px"></div>
  <div class="cols c-5545">
    <div>
      <div class="eyebrow" style="color:{p['accent']}">Estructura de secciones</div>
      <h2 class="h2" style="margin-top:18px">Escaleta tipo.</h2>
      <div class="esc" style="margin-top:26px">{esc}</div>
    </div>
    <div>
      <div class="sec" style="color:{p['accent']}">Propuesta visual, tono y estilo</div>
      <div class="tbox" style="--a:{p['accent']}">{tono}</div>
      {marca}
    </div>
  </div>
  <div class="spacer"></div>
  <div class="sec" style="color:{p['accent']}; margin-bottom:16px">Qué queda de cada emisión</div>
  <div class="distri">{dis}</div>
""" + foot(p["nombre"])
    return page(inner, "", glow(p.get("glow", p["accent"]) + "2E"))

def p_protocolo(p, n):
    items = "".join(f'<div class="prow"><span class="pdot" style="--a:{p["accent"]}"></span>'
                    f'<span>{t}</span></div>' for t in p["protocolo"])
    inner = head(p["nombre"], n, p["accent"]) + f"""  <div style="height:40px"></div>
  <div class="cols c-4555">
    <div>
      <div class="eyebrow" style="color:{p['accent']}">Protocolo de producción</div>
      <h2 class="h2" style="margin-top:18px">Protección de<br>menores.</h2>
      <p class="body" style="margin-top:22px">Trabajar con chicos en vivo exige un protocolo
        explícito, escrito y verificable. No es una cláusula de buena voluntad: es la condición
        que hace producible el formato y la que le permite a una marca de consumo familiar
        entrar sin exponerse.</p>
      <p class="body" style="margin-top:16px">Este protocolo se audita por emisión y forma parte
        del contrato con el anunciante.</p>
      <p class="body" style="margin-top:16px">Los mismos criterios rigen la distribución: ningún
        clip sale sin revisión de producción, y el recorte vertical se edita con las mismas
        restricciones que el vivo.</p>
      <div class="sello" style="--a:{p['accent']}">Brand safety verificable, no declarativo.</div>
    </div>
    <div>
      <div class="sec" style="color:{p['accent']}">Compromisos por emisión</div>
      <div class="pbox" style="margin-top:20px">{items}</div>
    </div>
  </div>
""" + foot(p["nombre"])
    return page(inner, "", glow(p.get("glow", p["accent"]) + "2E"))

def p_comercial(p, n):
    mon = "".join(f'<div class="mrow"><div class="mk" style="--a:{p["accent"]}">{k}</div>'
                  f'<div class="mv">{v}</div></div>' for k, v in p["monetizacion"])
    fic = "".join(f'<div class="frow2"><span>{k}</span><b>{v}</b></div>' for k, v in STAFF)
    fr = "".join(f'<div class="frow2"><span>{k}</span><b>{v}</b></div>'
                 for k, v in list(p["ficha_rapida"]) + list(p.get("ficha_extra", [])))
    inner = head(p["nombre"], n, p["accent"]) + f"""  <div style="height:40px"></div>
  <div class="cols c-6040">
    <div>
      <div class="eyebrow" style="color:{p['accent']}">Monetización y PNT</div>
      <h2 class="h2" style="margin-top:18px">Dónde entra la marca.</h2>
      <div class="mon" style="margin-top:24px">{mon}</div>
      <div class="catbox" style="--a:{p['accent']}">
        <div class="ck">Categorías naturales</div>
        <div class="cv">{p['categorias']}</div>
      </div>
    </div>
    <div>
      <div class="sec" style="color:{p['accent']}">Ficha técnica</div>
      <div class="fbox" style="margin-top:20px">{fr}<div class="fsep"></div>{fic}</div>
    </div>
  </div>
""" + foot(p["nombre"])
    return page(inner, "", glow(p.get("glow", p["accent"]) + "2E"))

# ───────────────────────────────────────────────────────────── cierre

def p_equipo(n):
    cards = "".join(f'<div class="scard"><div class="rolx">{k}</div><div class="nam">{v}</div></div>'
                    for k, v in STAFF)
    inner = head("Equipo", n) + f"""  <div style="height:44px"></div>
  <div class="eyebrow">Ficha técnica general</div>
  <h2 class="h2" style="margin-top:20px">El equipo detrás de las tres señales.</h2>
  <p class="lead" style="margin-top:18px; max-width:1140px">La misma estructura produce los tres
    programas. No hay equipos paralelos ni proveedores intermedios: una sola cadena de mando
    desde la producción ejecutiva hasta el switcher.</p>
  <div class="staff" style="margin-top:40px">{cards}</div>
  <div class="spacer"></div>
  <div class="sec b" style="margin-bottom:16px">Qué implica para una marca</div>
  <div class="pilares">
    <div class="pil" style="--a:var(--blue2)"><div class="pt">Un solo interlocutor</div>
      <div class="pd">La negociación, la producción y la entrega pasan por la misma mesa.</div></div>
    <div class="pil" style="--a:var(--blue2)"><div class="pt">Una sola cadena editorial</div>
      <div class="pd">Las tres señales responden al mismo criterio de aprobación de contenido.</div></div>
    <div class="pil" style="--a:var(--blue2)"><div class="pt">El mismo equipo técnico</div>
      <div class="pd">Sin proveedores intermedios: el estándar no cambia de un programa a otro.</div></div>
  </div>
""" + foot()
    return page(inner, "", glow())

def p_paquetes(n):
    paq = "".join(f'<div class="pqcard"><div class="pqn">{t}</div><div class="pqs">{s}</div>'
                  f'<div class="pqd">{d}</div></div>' for t, s, d in PAQUETES)
    ass = "".join(f'<div class="arow"><span class="adot"></span><span>{a}</span></div>' for a in ASSETS)
    inner = head("Comercial", n) + f"""  <div style="height:40px"></div>
  <div class="eyebrow">Oportunidades comerciales</div>
  <h2 class="h2" style="margin-top:18px">Cómo se suma una marca.</h2>
  <div class="cols c-6535" style="margin-top:32px">
    <div><div class="paqs">{paq}</div></div>
    <div>
      <div class="sec g">Assets incluidos en todos los paquetes</div>
      <div class="abox" style="margin-top:20px">{ass}</div>
      <div class="nota">Valores, disponibilidad y exclusividades por categoría se cotizan por
        programa y por temporada. Consultar a la Dirección de Marketing.</div>
    </div>
  </div>
""" + foot()
    return page(inner, "", glow())

def p_cierre(n):
    bg = (glow() + xmark("right:-190px; bottom:-150px; width:720px; height:720px", "#FFFFFF", ".06"))
    inner = head("Cierre", n) + f"""  <div class="spacer"></div>
  <h2 class="h2" style="font-size:76px">Tres audiencias distintas.<br>
    <span class="b">Un mismo estándar</span> de producción.</h2>
  <p class="lead" style="margin-top:28px; max-width:1060px">La grilla está diseñada para salir
    completa desde Nexo Studios, con el equipo ya conformado y el estudio ya montado.
    Lo que sigue es definir con qué programa entra cada marca.</p>
  <div class="spacer"></div>
  <div class="contacto">
    <div class="cbox"><div class="ck">Producción Ejecutiva</div><div class="cv">Lorena Rizzo</div></div>
    <div class="cbox"><div class="ck">Contacto comercial</div><div class="cv">Julián Barreiro · Dirección de Marketing</div></div>
    <div class="cbox"><div class="ck">Estudio</div><div class="cv">Nexo Studios</div></div>
  </div>
  <div class="footrule" style="margin-top:40px"></div>
  <div class="foot"><span>Nexo Studios · Carpeta de programación</span><span class="r">{n} / {TOTAL}</span></div>
"""
    return page(inner, "", bg)

# ───────────────────────────────────────────────────────────── ensamblado

def build():
    global LOGO, RENDER
    LOGO = b64(ASSETS_DIR + "/nexo-studios-logo.png", "image/png")
    RENDER = b64(ASSETS_DIR + "/estudio-nexo.jpg", "image/jpeg")
    for pr in PROGRAMAS:
        LOGOS[pr["slug"]] = b64(ASSETS_DIR + "/" + pr["logo"], "image/png")
    pages = [p_portada(), p_estudio(), p_grilla()]
    n = 4
    for p in PROGRAMAS:
        pages.append(p_divider(p, n));   n += 1
        pages.append(p_concepto(p, n));  n += 1
        pages.append(p_escaleta(p, n));  n += 1
        if p.get("protocolo"):
            pages.append(p_protocolo(p, n)); n += 1
        pages.append(p_comercial(p, n)); n += 1
    pages.append(p_equipo(n));    n += 1
    pages.append(p_paquetes(n));  n += 1
    pages.append(p_cierre(n))
    assert n == TOTAL, "TOTAL mal configurado: son %d paginas" % n
    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    html = ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            "<title>Nexo Studios — Carpeta de programación 2026</title>"
            f"<style>{css}</style></head><body>\n" + "".join(pages) + "</body></html>")
    open(".carpeta.inlined.html", "w").write(html)
    print("paginas:", len(pages))

if __name__ == "__main__":
    build()
