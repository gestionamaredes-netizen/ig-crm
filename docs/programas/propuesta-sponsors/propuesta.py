# -*- coding: utf-8 -*-
"""Maqueta de la propuesta de sponsoreo. 1080x1920, vertical.
El texto vive en contenido.py; aca solo se arma el HTML."""
import base64, os, re, sys
import contenido as C

ASSETS = "../carpeta-programacion/assets"
LOGO = None

def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())

def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    def rep(m):
        f = os.path.join(ASSETS, "fonts", os.path.basename(m.group(1)))
        return "url(%s)" % b64(f, "font/woff2")
    return re.sub(r"url\(([^)]+\.woff2)\)", rep, css)

def render():
    pages = []
    total = 16

    def bar(n):
        return ('<div class="bar"><img src="%s">'
                '<span class="pg">%02d / %d</span></div>' % (LOGO, n, total))

    def foot(t, r=C.TEMPORADA):
        return ('  <div class="body-pad" style="padding-bottom:40px">\n'
                '    <div class="footrule"></div>\n'
                '    <div class="foot"><span>%s</span><span class="r">%s</span></div>\n  </div>\n' % (t, r))

    def glow(a, b="rgba(4,6,10,0)"):
        return ('<div class="glow" style="background:'
                'radial-gradient(80%% 30%% at 12%% 5%%, %s 0%%, rgba(4,6,10,0) 62%%),'
                'radial-gradient(74%% 28%% at 90%% 95%%, %s 0%%, rgba(4,6,10,0) 62%%);"></div>' % (a, b))

    def page(inner, bg="", cls=""):
        pages.append('<div class="page%s">%s<div class="stack">%s</div></div>\n'
                     % (cls, bg, inner))

    def cab(n, eyebrow, titulo, pad=34):
        return ('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
                '  <div class="body-pad" style="padding-top:%dpx">\n'
                '    <div class="eyebrow">%s</div>\n'
                '    <h2 class="h2" style="margin-top:18px">%s</h2>\n  </div>\n'
                % (bar(n), pad, eyebrow, titulo.replace("\n", "<br>")))

    G_AZUL = "rgba(27,111,232,.26)"
    G_ROJO = "rgba(222,28,43,.20)"

    # 01 — portada
    logo_pr = b64(ASSETS + "/nexo-principal.jpg", "image/jpeg")
    page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <img class="cover-logo" src="%s">\n'
         '    <div class="eyebrow" style="margin-top:56px">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:112px; margin-top:22px">%s</h1>\n'
         '    <p class="parr" style="margin-top:24px">%s</p>\n'
         '    <div class="kicker">%s · %s</div>\n  </div>\n'
         '  <div class="spacer"></div>\n' % (
             bar(1), logo_pr, C.PORTADA_EYEBROW,
             C.PORTADA_TITULO.replace("\n", "<br>"), C.PORTADA_BAJADA,
             C.TEMPORADA, C.PAISES)
         + foot("Propuesta de sponsoreo"),
         glow("rgba(27,111,232,.30)", "rgba(222,28,43,.24)"), cls=" negro")

    # 02 — por que ahora
    I = C.INVITACION
    parr = "".join('<p class="parr" style="margin-top:24px">%s</p>' % p for p in I["parrafos"])
    page(cab(2, I["eyebrow"], I["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (parr, I["destacado"])
         + foot("Por qué ahora"), glow(G_AZUL, G_ROJO))

    # 03 — que es
    Q = C.QUE_ES
    filas = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                    % (t, d) for t, d in Q["filas"])
    page(cab(3, Q["eyebrow"], Q["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (Q["intro"], filas)
         + foot("El ecosistema"), glow(G_AZUL, "rgba(199,164,94,.16)"))

    # 04 — la grilla
    import importlib.util as _iu
    spec = _iu.spec_from_file_location("cont_lib", "../carpeta-de-contenido/contenido.py")
    lib = _iu.module_from_spec(spec); spec.loader.exec_module(lib)
    cards = ""
    for p in lib.PROYECTOS:
        f = dict(p["ficha"])
        # si el dia todavia no esta cerrado se muestra la frecuencia, que si lo
        # esta: en una propuesta comercial "a definir" se lee como inacabado
        cuando = p["dia"] if "definir" not in p["dia"].lower() else f["Frecuencia"]
        cards += ('<div class="pcard"><span class="pdot" style="background:%s"></span>'
                  '<div style="flex:1 1 auto; min-width:0"><div class="pnom">%s</div>'
                  '<div class="psub">%s</div></div>'
                  '<div class="pdia">%s</div></div>'
                  % (p["accent"], p["nombre"], f["Formato"], cuando))
    page(cab(4, "La grilla", "Cinco programas\npropios.")
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">'
           'Cinco formatos distintos, cinco audiencias distintas, una sola producción detrás. '
           'El sponsor elige dónde entra.</p></div>\n'
           '  <div class="body-pad" style="padding-top:52px"><div class="pgrid">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % cards
         + foot("La grilla 2026"), glow("rgba(80,208,0,.14)", G_AZUL))

    # 05 — cadena de valor
    D = C.CADENA
    ps = "".join('<div class="prow"><div class="pn">%s</div><div>'
                 '<div class="ft">%s</div><div class="fd">%s</div></div></div>'
                 % (n, t, d) for n, t, d in D["pasos"])
    page(cab(5, D["eyebrow"], D["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="plist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (D["intro"], ps)
         + foot("Cómo rinde"), glow(G_AZUL, G_ROJO))

    # 06 — inventario
    V = C.INVENTARIO
    items = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                    % (t, d) for t, d in V["items"])
    page(cab(6, V["eyebrow"], V["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (V["intro"], items)
         + foot("El inventario"), glow("rgba(199,164,94,.20)", G_ROJO))

    # 07 — separador de niveles
    page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">Tres formas de entrar</div>\n'
         '    <h2 class="h2" style="font-size:96px; margin-top:22px">Main.<br>Support.<br>Partner.</h2>\n'
         '    <p class="parr" style="margin-top:28px">No son tres precios del mismo producto: '
         'son tres maneras distintas de estar. Una para la marca que quiere el proyecto entero, '
         'una para la que quiere una audiencia concreta y una para la que prefiere poner lo que '
         'hace en vez de plata.</p>\n  </div>\n'
         '  <div class="spacer"></div>\n' % bar(7)
         + foot("Los tres niveles"), glow("rgba(27,111,232,.28)", "rgba(199,164,94,.22)"))

    # 08–10 — un nivel por pagina
    for k, N in enumerate(C.NIVELES):
        monto, periodo = C.INVERSION[N["slug"]]
        inc = "".join("<li>%s</li>" % x for x in N["incluye"])
        page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
             '  <div class="spacer"></div>\n'
             '  <div class="body-pad nivel" style="--a:%s">\n'
             '    <span class="ntag">%s</span>\n'
             '    <div class="nnom">%s</div>\n'
             '    <div class="nclaim">%s</div>\n'
             '    <p class="nbaj">%s</p>\n'
             '    <ul class="ninc">%s</ul>\n'
             '    <div class="ndest">%s</div>\n  </div>\n'
             '  <div class="spacer"></div>\n'
             '  <div class="body-pad nivel" style="--a:%s">\n'
             '    <div class="inv"><div><div class="il">Inversión</div></div>'
             '<div><div class="iv">%s</div><div class="ip">%s</div></div></div>\n  </div>\n'
             % (bar(8 + k), N["accent"], N["tag"], N["nombre"], N["claim"], N["bajada"],
                inc, N["destinatario"], N["accent"], monto, periodo)
             + foot(N["nombre"]), glow(N["accent"] + "26", N["accent"] + "14"))

    # 11 — comparativa
    T = C.COMPARATIVA
    th = "".join('<th class="c%d">%s</th>' % (i + 1, c) for i, c in enumerate(T["cols"]))
    tr = "".join('<tr><td class="k">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>' % f
                 for f in T["filas"])
    page(cab(11, T["eyebrow"], T["titulo"])
         + '  <div class="body-pad" style="padding-top:46px"><table class="tab">'
           '<colgroup><col class="kcol"><col><col><col></colgroup>'
           '<tr><th></th>%s</tr>%s</table></div>\n'
           '  <div class="body-pad" style="padding-top:30px">'
           '<p class="fd">%s</p></div>\n'
           '  <div class="spacer"></div>\n' % (th, tr, C.NOTA_INVERSION)
         + foot("Comparativa"), glow(G_AZUL, "rgba(199,164,94,.18)"))

    # 12 — el estudio
    foto = b64(ASSETS + "/estudio-nexo.jpg", "image/jpeg")
    esp = "".join('<div class="erow"><div class="ek">%s</div><div class="ev">%s</div></div>'
                  % (k, v) for k, v in C.ESTUDIO)
    page(cab(12, "El respaldo", "Donde se\ngraba todo.")
         + '  <div class="body-pad" style="padding-top:28px"><img class="foto" src="%s"></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="esp">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (foto, esp)
         + foot("El estudio"), glow(G_AZUL, G_ROJO))

    # 13 — los sectores
    sec = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                  % (t, d) for t, d in C.SECTORES)
    page(cab(13, "El piso", "Tres sectores,\nun mismo piso.")
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">'
           'Cada sector cambia el tono del contenido sin mover una cámara. La marca puede '
           'aparecer en los tres, y en cada uno significa otra cosa.</p></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % sec
         + foot("El piso"), glow("rgba(199,164,94,.18)", G_AZUL))

    # 14 — el equipo
    st = "".join('<div class="erow"><div class="ek">%s</div><div class="ev">%s</div></div>'
                 % (k, v) for k, v in C.STAFF)
    page(cab(14, "Quiénes lo hacen", "El equipo\nfijo.")
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">'
           'No se arma un equipo por proyecto. Estos son los que están en las cinco '
           'producciones, todas las semanas.</p></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="esp">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % st
         + foot("El equipo"), glow(G_ROJO, G_AZUL))

    # 15 — pasos
    P = C.PASOS
    ps = "".join('<div class="prow"><div class="pn">%s</div><div>'
                 '<div class="ft">%s</div><div class="fd">%s</div></div></div>'
                 % (n, t, d) for n, t, d in P["pasos"])
    page(cab(15, P["eyebrow"], P["titulo"])
         + '  <div class="spacer"></div>\n'
           '  <div class="body-pad"><div class="plist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % ps
         + foot("Próximos pasos"), glow(G_AZUL, G_ROJO))

    # 16 — contacto
    K = C.CONTACTO
    page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">%s</div>\n'
         '    <h2 class="h2" style="font-size:92px; margin-top:22px">%s</h2>\n'
         '    <p class="parr" style="margin-top:26px">%s</p>\n'
         '    <div class="cbox" style="margin-top:44px">'
         '<div class="cn">%s</div><div class="cr">%s</div><div class="ce">%s</div></div>\n'
         '  </div>\n'
         '  <div class="spacer"></div>\n' % (
             bar(16), K["eyebrow"], K["titulo"].replace("\n", "<br>"), K["bajada"],
             K["firma_nombre"], K["firma_rol"], K["firma_extra"])
         + foot("Nexo Studios"), glow("rgba(27,111,232,.30)", "rgba(222,28,43,.24)"))

    css = open("estilos.css").read().replace("/*FONTS*/", fonts_css())
    return ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            "<title>Propuesta de sponsoreo — Nexo Studios</title>"
            "<style>%s</style></head><body>\n%s</body></html>" % (css, "".join(pages)))

def main():
    global LOGO
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    open(".propuesta.inlined.html", "w").write(render())
    print("propuesta de sponsoreo · 16 paginas")

if __name__ == "__main__":
    main()
