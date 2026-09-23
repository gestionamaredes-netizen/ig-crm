# -*- coding: utf-8 -*-
"""Maqueta de El Motivo. 1080x1920 vertical.

Dos documentos distintos con la misma hoja de estilos:
  carpeta      -> la carpeta de contenido del programa
  <persona>    -> los cuadernillos de disparadores (y el de calle)

Se elige con el módulo que se pasa como argumento.
"""
import base64, importlib, os, re, sys

ASSETS = "../carpeta-programacion/assets"
LOGO = None

def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    return re.sub(r"url\(([^)]+\.woff2)\)",
                  lambda m: "url(%s)" % b64(os.path.join(ASSETS, "fonts",
                                                         os.path.basename(m.group(1))), "font/woff2"),
                  css)

def esc(t):
    return (str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

def envolver(paginas, titulo, acento):
    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    css += "\n:root{ --a:%s; }\n" % acento
    return ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            "<title>%s</title><style>%s</style></head><body>\n%s</body></html>"
            % (esc(titulo), css, "".join(paginas)))

# ---------------------------------------------------------------- piezas
def hacer(C, total):
    pags = []

    def bar(n, extra=""):
        return ('<div class="bar"><img src="%s"><span class="pg">%s%02d / %d</span></div>'
                % (LOGO, extra, n, total))

    def foot(t, r):
        return ('  <div class="body-pad" style="padding-bottom:40px">\n'
                '    <div class="footrule"></div>\n'
                '    <div class="foot"><span>%s</span><span class="r">%s</span></div>\n  </div>\n'
                % (esc(t), esc(r)))

    def glow(a, b="rgba(4,6,10,0)"):
        return ('<div class="glow" style="background:'
                'radial-gradient(80%% 30%% at 12%% 5%%, %s 0%%, rgba(4,6,10,0) 62%%),'
                'radial-gradient(74%% 28%% at 90%% 95%%, %s 0%%, rgba(4,6,10,0) 62%%);"></div>'
                % (a, b))

    def page(inner, bg="", cls=""):
        pags.append('<div class="page%s">%s<div class="stack">%s</div></div>\n' % (cls, bg, inner))

    def cab(n, eyebrow, titulo, extra=""):
        return ('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
                '  <div class="body-pad" style="padding-top:34px">\n'
                '    <div class="eyebrow">%s</div>\n'
                '    <h2 class="h2" style="margin-top:18px">%s</h2>\n  </div>\n'
                % (bar(n, extra), esc(eyebrow), esc(titulo).replace("\n", "<br>")))

    return pags, bar, foot, glow, page, cab

# ---------------------------------------------------------------- carpeta
def carpeta(C):
    total = 11
    pags, bar, foot, glow, page, cab = hacer(C, total)
    A = C.ACENTO
    G = A + "26"
    pie = C.PROGRAMA

    # 01 portada: el arte vertical, a sangre
    art = b64(ASSETS + "/el-motivo-final.png", "image/png")
    page('  <img class="cover-art" src="%s" style="height:1920px;object-fit:cover">\n' % art,
         cls=" negro")

    # 02 qué es
    Q = C.QUE_ES
    parr = "".join('<p class="parr" style="margin-top:24px">%s</p>' % esc(p) for p in Q["parrafos"])
    page(cab(2, Q["eyebrow"], Q["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:36px"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (parr, esc(Q["destacado"]))
         + foot("Qué es", pie), glow(G))

    # 03 las tres ciudades
    ciu = "".join('<div><div class="cn">%s</div><div class="cp">%s</div>'
                  '<div class="cd">%s</div></div>' % (esc(n), esc(p), esc(d))
                  for n, p, d in C.CIUDADES)
    page(cab(3, "Dónde pasa", "Tres ciudades,\nun programa.")
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">'
           'El Motivo se graba en Buenos Aires, se co-conduce desde Colombia y sale al '
           'aire por un canal de España. No es una colaboración puntual: es así todas '
           'las semanas.</p></div>\n'
           '  <div class="body-pad" style="padding-top:40px"><div class="ciu">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:40px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (ciu, esc(C.NOTA_HORARIO))
         + foot("Las tres ciudades", pie), glow(G, "rgba(27,111,232,.18)"))

    # 04 el equipo
    eq = "".join('<div class="eqr"><div class="eqn">%s</div><div class="eqrol">%s</div>'
                 '<div class="eqd">%s</div></div>' % (esc(n), esc(r), esc(d))
                 for n, r, d in C.EQUIPO)
    page(cab(4, "Quiénes lo hacen", "Los tres\nal aire.")
         + '  <div class="body-pad" style="padding-top:26px"><div class="eq">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % eq
         + foot("El equipo", pie), glow(G))

    # 05 ficha
    filas = [("Canal", C.CANAL), ("Día y hora", C.DIA), ("Estudio", C.ESTUDIO),
             ("Duración", "2 horas, en vivo"), ("Formato", "Magazine de entrevistas"),
             ("Claim", C.CLAIM)]
    fl = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                 % (esc(k), esc(v)) for k, v in filas)
    page(cab(5, "La ficha", "Dónde y\ncuándo.")
         + '  <div class="body-pad" style="padding-top:30px"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % fl
         + foot("La ficha", pie), glow(G))

    # 06 estructura
    E = C.ESTRUCTURA
    bl = "".join('<div class="blor"><div><div class="bh">%s</div><div class="bdur">%s</div></div>'
                 '<div><div class="bt">%s</div><div class="bd">%s</div></div></div>'
                 % (esc(h), esc(d), esc(t), esc(x)) for h, t, d, x in E["bloques"])
    page(cab(6, E["eyebrow"], E["titulo"])
         + '  <div class="body-pad" style="padding-top:26px"><div class="blo">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % bl
         + foot("La emisión", pie), glow(G))

    # 07 herramientas
    H = C.HERRAMIENTAS
    ej = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                 % (esc(t), esc(d)) for t, d in H["ejes"])
    page(cab(7, H["eyebrow"], H["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(H["intro"]), ej)
         + foot("La caja de herramientas", pie), glow(G))

    # 08 calle
    K = C.CALLE
    fo = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                 % (esc(t), esc(d)) for t, d in K["formatos"])
    page(cab(8, K["eyebrow"], K["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:30px"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(K["intro"]), fo)
         + foot("El motivo en la calle", pie), glow(G))

    # 09 convocatoria
    V = C.CONVOCATORIA
    pe = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                 % (esc(t), esc(d)) for t, d in V["perfiles"])
    page(cab(9, V["eyebrow"], V["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="flist">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:30px">'
           '<div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(V["intro"]), pe, esc(V["cierre"]))
         + foot("A quién buscamos", pie), glow(G))

    # 10 qué pedimos
    P = C.QUE_PEDIMOS
    it = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                 % (esc(t), esc(d)) for t, d in P["items"])
    page(cab(10, P["eyebrow"], P["titulo"])
         + '  <div class="body-pad" style="padding-top:28px"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % it
         + foot("El invitado", pie), glow(G))

    # 11 cierre
    page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">El cierre de todos los programas</div>\n'
         '    <h2 class="h2" style="font-size:96px; margin-top:24px">¿Cuál es<br>tu motivo?</h2>\n'
         '    <p class="parr" style="margin-top:28px">Es la última pregunta que recibe cada '
         'invitado y la única que se repite en las dos horas. Si el que está mirando se la '
         'hace a sí mismo, el programa cumplió.</p>\n'
         '    <div class="claim">%s</div>\n'
         '    <div class="kicker">%s<br>%s</div>\n  </div>\n'
         '  <div class="spacer"></div>\n' % (bar(11), esc(C.CLAIM), esc(C.CANAL), esc(C.DIA))
         + foot("El Motivo", C.CLAIM), glow(A + "30", "rgba(222,28,43,.18)"), cls=" negro")

    return pags

# ---------------------------------------------------------------- disparadores
def disparadores(C):
    reglas = getattr(C, "REGLAS", None)
    lugares = getattr(C, "LUGARES", None)
    # una pagina por grupo, mas portada, mas las opcionales
    total = 1 + len(C.GRUPOS) + (1 if reglas else 0) + (1 if lugares else 0)
    pags, bar, foot, glow, page, cab = hacer(C, total)
    A = C.ACENTO
    G = A + "26"
    n = 1

    # portada
    page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">El Motivo · %s</div>\n'
         '    <h1 class="cover-h" style="font-size:104px; margin-top:22px">%s</h1>\n'
         '    <div class="claim" style="margin-top:22px">%s</div>\n'
         '    <p class="parr" style="margin-top:26px">%s</p>\n  </div>\n'
         '  <div class="spacer"></div>\n'
         % (bar(1), esc(C.ROL), esc(C.QUIEN).replace(" ", "<br>", 1),
            esc("Ideas que conectan"), esc(C.BAJADA))
         + foot(C.QUIEN, "El Motivo"), glow(A + "30", "rgba(222,28,43,.16)"), cls=" negro")
    n += 1

    if reglas:
        fl = "".join('<div class="drow"><div class="dn">%02d</div><div>'
                     '<div class="dg">%s</div><div class="dd">%s</div></div></div>'
                     % (i + 1, esc(t), esc(d)) for i, (t, d) in enumerate(reglas))
        page(cab(n, "Antes de salir", "Seis reglas\npara la calle.")
             + '  <div class="body-pad" style="padding-top:26px"><div class="dlist">%s</div></div>\n'
               '  <div class="spacer"></div>\n' % fl
             + foot("Las reglas", C.QUIEN), glow(G))
        n += 1

    k = 0
    for titulo, desc, items in C.GRUPOS:
        fl = ""
        for g, d in items:
            k += 1
            fl += ('<div class="drow"><div class="dn">%02d</div><div>'
                   '<div class="dg">«%s»</div><div class="dd">%s</div></div></div>'
                   % (k, esc(g), esc(d)))
        page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
             '  <div class="body-pad" style="padding-top:32px">\n'
             '    <div class="dcab">%d disparadores</div>\n'
             '    <div class="gtit" style="margin-top:12px">%s</div>\n'
             '    <div class="gdes">%s</div>\n  </div>\n'
             '  <div class="body-pad" style="padding-top:28px"><div class="dlist">%s</div></div>\n'
             '  <div class="spacer"></div>\n'
             % (bar(n), len(items), esc(titulo), esc(desc), fl)
             + foot(titulo, C.QUIEN), glow(G))
        n += 1

    if lugares:
        lg = "".join('<div class="lugr"><span class="lpin"></span><div>'
                     '<div class="ft" style="font-size:33px">%s</div>'
                     '<div class="fd" style="font-size:27px">%s</div></div></div>'
                     % (esc(t), esc(d)) for t, d in lugares)
        page(cab(n, "Dónde grabar", "Seis lugares\nque funcionan.")
             + '  <div class="body-pad" style="padding-top:26px"><div class="lug">%s</div></div>\n'
               '  <div class="spacer"></div>\n' % lg
             + foot("Los lugares", C.QUIEN), glow(G))

    return pags

def main():
    global LOGO
    mod = sys.argv[1] if len(sys.argv) > 1 else "contenido_carpeta"
    C = importlib.import_module(mod)
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    pags = carpeta(C) if C.SLUG == "carpeta" else disparadores(C)
    titulo = "El Motivo" if C.SLUG == "carpeta" else "%s · El Motivo" % C.QUIEN
    open(".%s.inlined.html" % C.SLUG, "w").write(envolver(pags, titulo, C.ACENTO))
    print("%s · %d paginas" % (C.SLUG, len(pags)))

if __name__ == "__main__":
    main()
