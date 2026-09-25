# -*- coding: utf-8 -*-
"""Arma los PDF de la carpeta de presupuesto de Nexo Studios.

  python3 presupuesto.py contenido_carpeta

Una maqueta por documento, elegida por el SLUG del módulo de contenido.
Todos los números salen de tarifas.py.
"""

import base64, importlib, os, re, sys
import servicios as S
import tarifas as T

ASSETS = "../programas/carpeta-programacion/assets"
LOGO = None


def b64(p, mime):
    return "data:%s;base64,%s" % (mime, base64.b64encode(open(p, "rb").read()).decode())


def fonts_css():
    css = open(ASSETS + "/fonts.css").read()
    return re.sub(r"url\(([^)]+\.woff2)\)",
                  lambda m: "url(%s)" % b64(os.path.join(ASSETS, "fonts",
                                                         os.path.basename(m.group(1))), "font/woff2"),
                  css)


NUMEROS = ("cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete",
           "ocho", "nueve", "diez")


def contar(C):
    """Reemplaza {n} y {N} por la cantidad real de decisiones, escrita en letras.

    Se escribía a mano en cinco lugares y ya quedó desfasada una vez: la portada
    decía cuatro cuando la lista tenía seis.
    """
    n = len(C.DECISIONES["items"])
    assert n < len(NUMEROS), "hay más decisiones que palabras en NUMEROS"
    palabra = NUMEROS[n]

    def poner(t):
        return t.replace("{n}", palabra).replace("{N}", palabra.capitalize())

    for bloque in (C.PORTADA, C.DECISIONES, C.CIERRE):
        for k, v in bloque.items():
            if isinstance(v, str):
                bloque[k] = poner(v)


def esc(t):
    return str(t).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


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


def filas(items, tf="ft", td="fd"):
    return "".join('<div class="frow"><div class="%s">%s</div><div class="%s">%s</div></div>'
                   % (tf, esc(t), td, esc(d)) for t, d in items)


def caja(label, valor, unidad, desc):
    return ('<div class="inv"><div class="il">%s</div><div class="iv">%s</div>'
            '<div class="iu">%s</div><div class="id">%s</div></div>'
            % (esc(label), esc(valor), esc(unidad), esc(desc)))


def glow_suelto(a, b="rgba(4,6,10,0)"):
    return ('<div class="glow" style="background:'
            'radial-gradient(80%% 30%% at 12%% 5%%, %s 0%%, rgba(4,6,10,0) 62%%),'
            'radial-gradient(74%% 28%% at 90%% 95%%, %s 0%%, rgba(4,6,10,0) 62%%);"></div>'
            % (a, b))


def hoja_precios(C):
    """El cuerpo de la hoja de precios, sin la página que lo envuelve.

    Lo usan la página 2 del PDF de servicios y la hoja suelta en A4, así que
    los dos muestran exactamente los mismos números.
    """
    R = C.RESUMEN

    cuerpo = ""
    for hs, etiqueta in R["filas"]:
        def celda(op):
            p = S.STREAMING.get((hs, op))
            return (S.pesos(p) if p
                    else '<span style="color:#65707F">%s</span>' % esc(R["sin_precio"]))
        cuerpo += ('<tr><td class="k">%s</td><td>%s</td><td class="a">%s</td></tr>'
                   % (esc(etiqueta), celda(1), celda(2)))
    t_stream = ('<table class="mini"><tr><th>Por hora</th><th>%s</th>'
                '<th class="a">%s</th></tr>%s</table>'
               % (esc(S.DOTACION[1]), esc(S.DOTACION[2]), cuerpo))

    cuerpo = "".join('<tr><td class="k">%s</td><td class="a">%s</td></tr>'
                     % (esc(etiqueta), S.pesos(S.PODCAST[hs])) for hs, etiqueta in R["filas"])
    t_pod = ('<table class="mini"><tr><th>Por hora</th>'
             '<th class="a">Precio</th></tr>%s</table>' % cuerpo)

    desc = " · ".join("%d meses: %.0f%% menos" % (m, d * 100)
                      for m, d in sorted(S.DESCUENTOS.items()))

    return ('    <div class="blo-t">%s</div>\n'
            '    <div style="margin-top:10px">%s</div>\n'
            '    <div class="blo-t" style="margin-top:30px">%s</div>\n'
            '    <div style="margin-top:10px">%s</div>\n'
            '    <div class="linea" style="margin-top:32px">'
            '<div><div class="blo-t">%s</div><div class="ld" style="margin-top:6px">%s</div></div>'
            '<div class="lv">%s</div></div>\n'
            '    <div class="linea" style="margin-top:22px">'
            '<div class="blo-t" style="white-space:nowrap">%s</div>'
            '<div class="lv" style="font-size:29px">%s</div></div>\n'
            % (esc(R["streaming_t"]), t_stream, esc(R["podcast_t"]), t_pod,
               esc(R["produccion_t"]), esc(R["produccion_d"]), S.pesos(S.PRODUCCION),
               esc(R["descuento_t"]), esc(desc)))



# ---------------------------------------------------------------- documento 1
def carpeta(C):
    total = 15
    n = 2          # la portada no lleva número pero cuenta en el total
    pags, bar, foot, glow, page, cab = hacer(C, total)
    A = C.ACENTO
    G = A + "22"
    pie = "Nexo Studios"

    def sig():
        nonlocal n
        n += 1
        return n - 1

    # 01 portada
    logo = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    P = C.PORTADA
    firmas = "".join('<div class="cbox" style="margin-top:22px;padding-top:22px">'
                     '<div class="cn" style="font-size:36px">%s</div>'
                     '<div class="cr" style="font-size:26px">%s</div></div>' % (esc(n), esc(r))
                     for n, r in P["firma"])
    page('  <div class="body-pad" style="padding-top:64px">'
         '<img class="cover-logo" src="%s" style="width:420px"></div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="aviso">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:108px; margin-top:30px">%s</h1>\n'
         '    <p class="parr" style="margin-top:30px">%s</p>\n'
         '    <div class="kicker">%s</div>\n%s  </div>\n'
         '  <div class="spacer"></div>\n'
         % (logo, esc(P["aviso"]), esc(P["titulo"]).replace("\n", "<br>"),
            esc(P["bajada"]), esc(C.TEMPORADA), firmas)
         + foot("Presupuesto de producción", pie), glow(A + "2E", "rgba(27,111,232,.16)"))

    # 02 el criterio
    CR = C.CRITERIO
    parr = "".join('<p class="parr" style="margin-top:26px">%s</p>' % esc(p) for p in CR["parrafos"])
    page(cab(sig(), CR["eyebrow"], CR["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:44px"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (parr, esc(CR["destacado"]))
         + foot(CR["pie"], pie), glow(G))

    # 03 las dos horas de estudio
    H = C.HORAS
    page(cab(sig(), H["eyebrow"], H["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:34px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:20px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:30px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(H["intro"]),
              caja(H["tecnica_para"], T.pesos(T.TECNICA), "por hora de estudio", H["tecnica_d"]),
              caja(H["completa_para"], T.pesos(T.COMPLETA), "por hora de estudio", H["completa_d"]),
              esc(H["nota"]))
         + foot(H["pie"], pie), glow(G))

    # la hora completa: quienes son los dos que se suman
    PR = C.PRODUCCION
    pr = ""
    for nombre, sub, tareas in PR["roles"]:
        filas_t = "".join('<div class="protr"><div class="prott">%s</div>'
                          '<div class="protd">%s</div></div>' % (esc(t), esc(d))
                          for t, d in tareas)
        pr += ('<div class="procard"><div class="pron">%s</div>'
               '<div class="prosub">%s</div>%s</div>' % (esc(nombre), esc(sub), filas_t))
    page(cab(sig(), PR["eyebrow"], PR["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p>'
           '<div class="lab" style="margin-top:22px">Lo que se suma por hora</div>'
           '<div class="iv" style="font-size:50px;margin-top:4px">%s</div>'
           '<div class="aviso" style="margin-top:14px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="pro">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(PR["intro"]), T.pesos(T.PRODUCCION), esc(PR["aviso"]), pr, esc(PR["nota"]))
         + foot(PR["pie"], pie), glow(G))

    # tabla de jornadas
    J = C.JORNADAS
    cuerpo = "".join(
        '<tr><td class="k">%s</td><td>%s</td><td class="a">%s</td></tr>'
        % (T.hs(h), T.pesos(T.factura(h, "tecnica")), T.pesos(T.factura(h, "completa")))
        for h in T.JORNADAS)
    tabla = ('<table class="tab"><tr><th>Jornada</th><th>Hora técnica</th>'
             '<th class="a">Hora completa</th></tr>%s</table>' % cuerpo)
    page(cab(sig(), J["eyebrow"], J["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:34px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(J["intro"]), tabla, esc(J["nota"]))
         + foot(J["pie"], pie), glow(G))

    # 05 lo que cobra el equipo tecnico
    TE = C.TECNICA
    cuerpo = "".join(
        '<tr><td class="k">%s</td><td>%s</td><td>%s</td><td class="a">%s</td></tr>'
        % (T.hs(h), T.pesos(T.hora_operador(h)), T.pesos(T.hora_asistente(h)),
           T.pesos(T.costo_tecnico_hora(h)))
        for h in T.JORNADAS)
    tabla = ('<table class="tab"><tr><th>Jornada</th><th>Operador</th><th>Asistente</th>'
             '<th class="a">Por hora</th></tr>%s</table>' % cuerpo)
    page(cab(sig(), TE["eyebrow"], TE["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:30px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="destacado">%s</div>'
           '<p class="parr" style="font-size:31px;margin-top:22px">%s</p></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(TE["intro"]), tabla, esc(TE["hallazgo_t"]), esc(TE["hallazgo_d"]))
         + foot(TE["pie"], pie), glow(G))

    # las tres etapas: qué es cada una y cuál entra en la tarifa
    EQ = C.ETAPAS_QUE_ES
    el = "".join('<div class="eta3r"><div class="eta3h"><div class="eta3n">%s</div>'
                 '<div class="eta3c">%s</div></div><div class="eta3w">%s</div>'
                 '<div class="eta3d">%s</div></div>'
                 % (esc(t), esc(c_), esc(w), esc(d)) for t, w, c_, d in EQ["items"])
    page(cab(sig(), EQ["eyebrow"], EQ["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:18px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:20px"><div class="eta3">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(EQ["intro"]), el, esc(EQ["destacado"]))
         + foot(EQ["pie"], pie), glow(G))

    # el detalle de roles de cada etapa
    for num, nombre, sub, bajada, roles in C.ETAPAS:
        rl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                     '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                     % (esc(t), esc(d), esc(q)) for t, q, d in roles)
        page(cab(sig(), "%s · %s" % (C.ETAPAS_EYEBROW, num), nombre + ".")
             + '  <div class="body-pad"><div class="lab" style="margin-top:6px">%s</div>'
               '<p class="parr" style="font-size:33px;margin-top:18px">%s</p></div>\n'
               '  <div class="body-pad" style="padding-top:26px"><div class="rol">%s</div></div>\n'
               '  <div class="spacer"></div>\n' % (esc(sub), esc(bajada), rl)
             + foot(nombre, pie), glow(G))

    # 09 produccion creativa
    CV = C.CREATIVA
    page(cab(sig(), CV["eyebrow"], CV["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="flist">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(CV["intro"]), filas(CV["items"]), esc(CV["nota"]))
         + foot(CV["pie"], pie), glow(G))

    # 10 como se arma
    AR = C.ARMADO
    assert [k for k, _, _ in AR["pasos"]] == ["%02d" % (i + 1) for i in range(len(AR["pasos"]))], \
        "los pasos de ARMADO quedaron mal numerados"
    pl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(k)) for k, t, d in AR["pasos"])
    page(cab(sig(), AR["eyebrow"], AR["titulo"])
         + '  <div class="body-pad" style="padding-top:30px"><div class="rol">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % pl
         + foot(AR["pie"], pie), glow(G))

    # 11 lo que no entra
    FU = C.FUERA
    page(cab(sig(), FU["eyebrow"], FU["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:20px"><div class="flist compacta">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(FU["intro"]), filas(FU["items"]))
         + foot(FU["pie"], pie), glow(G))

    # 12 condiciones
    CO = C.CONDICIONES
    pend = "".join('<div class="pendr"><div class="pendc"></div>'
                   '<div class="rold" style="font-size:27px;margin-top:0">%s</div></div>'
                   % esc(p) for p in CO["pendientes"])
    page(cab(sig(), CO["eyebrow"], CO["titulo"])
         + '  <div class="body-pad" style="padding-top:16px"><div class="flist compacta">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:18px"><div class="lab">%s</div>'
           '<div class="pend" style="margin-top:4px">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (filas(CO["items"]), esc(CO["pendientes_t"]), pend)
         + foot(CO["pie"], pie), glow(G))

    # 13 quien firma
    CN = C.CONTACTO
    fi = "".join('<div class="cbox" style="margin-top:26px">'
                 '<div class="cn">%s</div><div class="cr">%s</div></div>' % (esc(n_), esc(r))
                 for n_, r in CN["firmas"])
    page(cab(sig(), CN["eyebrow"], CN["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:34px">%s'
           '<div class="ce" style="margin-top:34px">%s</div></div>\n'
           % (esc(CN["bajada"]), fi, esc(CN["estudio"]))
         + foot(CN["pie"], pie), glow(A + "2A", "rgba(27,111,232,.14)"))

    return pags


# ---------------------------------------------------------------- documento 2
def direccion(C):
    contar(C)
    total = 10
    pags, bar, foot, glow, page, cab = hacer(C, total)
    A = C.ACENTO
    G = A + "22"
    pie = "Nexo Studios"

    # 01 portada
    logo = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    P = C.PORTADA
    dest = "".join('<div class="cbox" style="margin-top:20px;padding-top:20px">'
                   '<div class="cn" style="font-size:34px">%s</div>'
                   '<div class="cr" style="font-size:25px">%s</div></div>' % (esc(n), esc(r))
                   for n, r in P["destinatarios"])
    page('  <div class="body-pad" style="padding-top:64px">'
         '<img class="cover-logo" src="%s" style="width:420px"></div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="aviso">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:104px; margin-top:30px">%s</h1>\n'
         '    <p class="parr" style="margin-top:28px">%s</p>\n'
         '    <div class="lab" style="margin-top:40px">Para</div>%s\n'
         '    <div class="kicker">%s</div>\n  </div>\n'
         '  <div class="spacer"></div>\n'
         % (logo, esc(P["aviso"]), esc(P["titulo"]).replace("\n", "<br>"),
            esc(P["bajada"]), dest, esc(P["firma"]))
         + foot("Lectura ejecutiva", pie), glow(A + "2A", "rgba(222,28,43,.14)"))

    # 02 el titular
    TI = C.TITULAR
    parr = "".join('<p class="parr" style="margin-top:20px">%s</p>' % esc(p)
                   for p in TI["parrafos"])
    page(cab(2, TI["eyebrow"], TI["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:30px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="lab">%s</div>'
           '<div class="flist compacta" style="margin-top:6px">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (parr,
              caja("Margen por hora", T.pesos(T.MARGEN_HORA), "en los dos planes",
                   "El mismo número, se venda el plan que se venda."),
              esc(TI["consecuencia_t"]), filas(TI["consecuencia"]))
         + foot(TI["pie"], pie), glow(G))

    # 03 la estructura de costo
    CO = C.COSTO
    cuerpo = "".join(
        '<tr><td class="k">%s</td><td>%s</td><td>%s</td><td class="a">%s</td></tr>'
        % (T.hs(h), T.pesos(T.hora_operador(h)), T.pesos(T.hora_asistente(h)),
           T.pesos(T.costo_tecnico_hora(h))) for h in T.JORNADAS)
    tabla = ('<table class="tab"><tr><th>Jornada</th><th>Operador</th><th>Asistente</th>'
             '<th class="a">Costo / hora</th></tr>%s</table>' % cuerpo)
    page(cab(3, CO["eyebrow"], CO["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:28px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="lab">%s</div>'
           '<div class="flist compacta" style="margin-top:6px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(CO["intro"]), tabla, esc(CO["capas_t"]), filas(CO["capas"]), esc(CO["nota"]))
         + foot(CO["pie"], pie), glow(G))

    # 04 el margen por jornada
    MA = C.MARGEN
    cuerpo = "".join(
        '<tr><td class="k">%s</td><td>%s</td><td>%s</td><td class="a">%s</td></tr>'
        % (T.hs(h), T.pesos(T.factura(h, "tecnica")), T.pesos(T.costo(h, "tecnica")),
           T.pesos(T.margen(h, "tecnica"))) for h in T.JORNADAS)
    t1 = ('<table class="tab"><tr><th>Hora técnica</th><th>Factura</th><th>Costo</th>'
          '<th class="a">Margen</th></tr>%s</table>' % cuerpo)
    cuerpo = "".join(
        '<tr><td class="k">%s</td><td>%s</td><td>%s</td><td class="a">%s</td></tr>'
        % (T.hs(h), T.pesos(T.factura(h, "completa")), T.pesos(T.costo(h, "completa")),
           T.pesos(T.margen(h, "completa"))) for h in T.JORNADAS)
    t2 = ('<table class="tab"><tr><th>Hora completa</th><th>Factura</th><th>Costo</th>'
          '<th class="a">Margen</th></tr>%s</table>' % cuerpo)
    page(cab(4, MA["eyebrow"], MA["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:30px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(MA["intro"]), t1, t2, esc(MA["nota"]))
         + foot(MA["pie"], pie), glow(G))

    # 05 la decision de precio de la hora completa
    DE = C.DELTA
    parr = "".join('<p class="parr" style="margin-top:22px">%s</p>' % esc(p)
                   for p in DE["parrafos"])
    costo_comp = T.COSTO_HORA_CONSTANTE + T.PRODUCCION
    cuerpo = ""
    for precio in DE["escenarios"]:
        m = precio - costo_comp
        hoy = ' <span class="tipo">hoy</span>' if precio == T.COMPLETA else ""
        cuerpo += ('<tr><td class="k">%s%s</td><td>%s</td><td class="a">%s</td>'
                   '<td class="a">%.1f%%</td></tr>'
                   % (T.pesos(precio), hoy, T.pesos(costo_comp), T.pesos(m), 100.0 * m / precio))
    tabla = ('<table class="tab"><tr><th>Se cobra</th><th>Cuesta</th>'
             '<th class="a">Deja</th><th class="a">%%</th></tr>%s</table>' % cuerpo)
    # cuanto habria que cobrarla para igualar el porcentaje de la hora tecnica
    pct = T.MARGEN_PCT_TECNICA / 100.0
    iguala = int(round(costo_comp / (1 - pct) / 100) * 100)
    page(cab(5, DE["eyebrow"], DE["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="lab">%s</div>'
           '<div style="margin-top:12px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">'
           '<b>%s:</b> %s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (parr, esc(DE["escenarios_t"]), tabla, esc(DE["nota_t"]),
              esc(DE["nota"] % T.pesos(iguala)))
         + foot(DE["pie"], pie), glow(G))

    # 06 el porcentaje de produccion ejecutiva
    EJ = C.EJECUTIVA
    parr = "".join('<p class="parr" style="margin-top:22px">%s</p>' % esc(p)
                   for p in EJ["parrafos"])
    cuerpo = ""
    for pct in T.EJECUTIVA_ESCENARIOS:
        t_ = T.margen_hora_tras_ejecutiva("tecnica", pct)
        c_ = T.margen_hora_tras_ejecutiva("completa", pct)
        cuerpo += ('<tr><td class="k">%.0f%%</td><td>%s</td><td>%s</td>'
                   '<td class="a">%s</td></tr>'
                   % (pct * 100, T.pesos(t_), T.pesos(c_), T.pesos(T.brecha_por_ejecutiva(pct))))
    tabla = ('<table class="tab"><tr><th>Ejecutiva</th><th>Hora técnica</th>'
             '<th>Hora completa</th><th class="a">Brecha</th></tr>%s</table>' % cuerpo)
    page(cab(6, EJ["eyebrow"], EJ["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="lab">%s</div>'
           '<div style="margin-top:12px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">'
           '<b>%s:</b> %s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (parr, esc(EJ["tabla_t"]), tabla, esc(EJ["cierre_t"]), esc(EJ["cierre"]))
         + foot(EJ["pie"], pie), glow(G))

    # 07 ocupacion
    OC = C.OCUPACION
    cuerpo = "".join(
        '<tr><td class="k">%d hs</td><td>%s</td><td>%s</td><td class="a">%s</td></tr>'
        % (h, esc(t), T.pesos(T.TECNICA * h), T.pesos((T.TECNICA - T.COSTO_HORA_CONSTANTE) * h))
        for h, t, _ in OC["niveles"])
    tabla = ('<table class="tab"><tr><th>Al mes</th><th>Equivale a</th><th>Factura</th>'
             '<th class="a">Margen</th></tr>%s</table>' % cuerpo)
    det = filas([(t, d) for _, t, d in OC["niveles"]])
    page(cab(7, OC["eyebrow"], OC["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="flist compacta">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:20px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(OC["intro"]), tabla, det, esc(OC["nota"]))
         + foot(OC["pie"], pie), glow(G))

    # 07 riesgos
    RI = C.RIESGOS
    rl = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                 % (esc(t), esc(d)) for t, d in RI["items"])
    page(cab(8, RI["eyebrow"], RI["titulo"])
         + '  <div class="body-pad" style="padding-top:26px"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % rl
         + foot(RI["pie"], pie), glow(G, "rgba(222,28,43,.16)"))

    # 08 decisiones
    DC = C.DECISIONES
    dl = "".join('<div class="pendr"><div class="pendc"></div><div>'
                 '<div class="roln" style="font-size:34px">%s</div>'
                 '<div class="rold" style="font-size:28px">%s</div></div></div>'
                 % (esc(t), esc(d)) for t, d in DC["items"])
    page(cab(9, DC["eyebrow"], DC["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="pend">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(DC["intro"]), dl)
         + foot(DC["pie"], pie), glow(G))

    # 09 cierre
    CI = C.CIERRE
    fi = "".join('<div class="cbox" style="margin-top:24px">'
                 '<div class="cn" style="font-size:38px">%s</div>'
                 '<div class="cr">%s</div></div>' % (esc(n), esc(r)) for n, r in CI["firmas"])
    page(cab(10, CI["eyebrow"], CI["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:36px"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:34px">%s</div>\n'
           % (esc(CI["bajada"]), esc(CI["destacado"]), fi)
         + foot(CI["pie"], pie), glow(A + "2A", "rgba(27,111,232,.14)"))

    return pags


# ---------------------------------------------------------------- documento 3
def venta(C):
    total = 11
    pags, bar, foot, glow, page, cab = hacer(C, total)
    A = C.ACENTO
    G = A + "22"
    pie = "Nexo Studios"

    # 01 portada, sobre la foto del estudio
    logo = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    foto = b64(ASSETS + "/estudio-nexo.jpg", "image/jpeg")
    P = C.PORTADA
    fondo = ('<img src="%s" style="position:absolute;inset:0;width:1080px;height:1920px;'
             'object-fit:cover">'
             '<div class="glow" style="background:linear-gradient(180deg,'
             'rgba(4,6,10,.72) 0%%, rgba(4,6,10,.40) 34%%, rgba(4,6,10,.93) 74%%,'
             'rgba(4,6,10,.99) 100%%)"></div>' % foto)
    page('  <div class="body-pad" style="padding-top:64px">'
         '<img class="cover-logo" src="%s" style="width:420px"></div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:112px; margin-top:26px">%s</h1>\n'
         '    <p class="parr" style="margin-top:30px; color:#CBD4DF">%s</p>\n'
         '    <div class="kicker">%s</div>\n  </div>\n'
         '  <div class="spacer" style="flex:0 0 120px"></div>\n'
         % (logo, esc(P["eyebrow"]), esc(P["titulo"]).replace("\n", "<br>"),
            esc(P["bajada"]), esc(P["kicker"]))
         + foot("Producí en Nexo", pie), fondo, cls=" negro")

    # 02-03 dos paginas de texto con remate
    n = 2
    for B in (C.YAPASA, C.PROBLEMA):
        parr = "".join('<p class="parr" style="margin-top:26px">%s</p>' % esc(p)
                       for p in B["parrafos"])
        page(cab(n, B["eyebrow"], B["titulo"])
             + '  <div class="body-pad">%s</div>\n'
               '  <div class="body-pad" style="padding-top:42px"><div class="destacado">%s</div></div>\n'
               '  <div class="spacer"></div>\n' % (parr, esc(B["destacado"]))
             + foot(B["pie"], pie), glow(G))
        n += 1

    # 04 las tarifas
    CM = C.COMPRAS
    page(cab(4, CM["eyebrow"], CM["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:32px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:20px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(CM["intro"]),
              caja(CM["tecnica_para"], T.pesos(T.TECNICA), "por hora", CM["tecnica_d"]),
              caja(CM["completa_para"], T.pesos(T.COMPLETA), "por hora", CM["completa_d"]),
              esc(CM["nota"]))
         + foot(CM["pie"], pie), glow(G))

    # 05 el piso
    PI = C.PISO
    sec = filas(PI["sectores"])
    page(cab(5, PI["eyebrow"], PI["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="flist compacta">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="lab">%s</div>'
           '<div class="flist compacta" style="margin-top:8px">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(PI["intro"]), filas(PI["items"]), esc(PI["sectores_t"]), sec)
         + foot(PI["pie"], pie), glow(G))

    # 06 nestor
    NE = C.NESTOR
    parr = "".join('<p class="parr" style="margin-top:26px">%s</p>' % esc(p)
                   for p in NE["parrafos"])
    page(cab(6, NE["eyebrow"], NE["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:42px"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (parr, esc(NE["destacado"]))
         + foot(NE["pie"], pie), glow(G))

    # 07 produccion creativa
    CV = C.CREATIVA
    page(cab(7, CV["eyebrow"], CV["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="flist">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(CV["intro"]), filas(CV["items"]), esc(CV["nota"]))
         + foot(CV["pie"], pie), glow(G))

    # 08 la grilla
    GR = C.GRILLA
    gl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(c)) for t, c, d in GR["items"])
    page(cab(8, GR["eyebrow"], GR["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="rol">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(GR["intro"]), gl, esc(GR["nota"]))
         + foot(GR["pie"], pie), glow(G))

    # 09 lo que no hacemos
    NH = C.NOHACEMOS
    page(cab(9, NH["eyebrow"], NH["titulo"])
         + '  <div class="body-pad" style="padding-top:26px"><div class="flist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % filas(NH["items"])
         + foot(NH["pie"], pie), glow(G))

    # 10 como empieza
    PS = C.PASOS
    pl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(k)) for k, t, d in PS["pasos"])
    page(cab(10, PS["eyebrow"], PS["titulo"])
         + '  <div class="body-pad" style="padding-top:28px"><div class="rol">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (pl, esc(PS["nota"]))
         + foot(PS["pie"], pie), glow(G))

    # 11 contacto
    CN = C.CONTACTO
    fi = "".join('<div class="cbox" style="margin-top:26px">'
                 '<div class="cn">%s</div><div class="cr">%s</div></div>' % (esc(n_), esc(r))
                 for n_, r in CN["firmas"])
    page(cab(11, CN["eyebrow"], CN["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:34px">%s'
           '<div class="ce" style="margin-top:34px">%s</div></div>\n'
           % (esc(CN["bajada"]), fi, esc(CN["estudio"]))
         + foot(CN["pie"], pie), glow(A + "2E", "rgba(27,111,232,.14)"))

    return pags


# ---------------------------------------------------------------- documento 4
def alquiler(C):
    total = 4
    pags, bar, foot, glow, page, cab = hacer(C, total)
    A = C.ACENTO
    G = A + "22"
    pie = "Nexo Studios"

    # 01 portada sobre la foto del piso
    logo = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    foto = b64(ASSETS + "/estudio-nexo.jpg", "image/jpeg")
    P = C.PORTADA
    fondo = ('<img src="%s" style="position:absolute;inset:0;width:1080px;height:1920px;'
             'object-fit:cover">'
             '<div class="glow" style="background:linear-gradient(180deg,'
             'rgba(4,6,10,.72) 0%%, rgba(4,6,10,.38) 32%%, rgba(4,6,10,.93) 72%%,'
             'rgba(4,6,10,.99) 100%%)"></div>' % foto)
    page('  <div class="body-pad" style="padding-top:64px">'
         '<img class="cover-logo" src="%s" style="width:420px"></div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:112px; margin-top:26px">%s</h1>\n'
         '    <p class="parr" style="margin-top:30px; color:#CBD4DF">%s</p>\n'
         '    <div class="kicker">%s</div>\n  </div>\n'
         '  <div class="spacer" style="flex:0 0 120px"></div>\n'
         % (logo, esc(P["eyebrow"]), esc(P["titulo"]).replace("\n", "<br>"),
            esc(P["bajada"]), esc(P["kicker"]))
         + foot("Alquilá el estudio", pie), fondo, cls=" negro")

    # 02 los tres armados
    AR = C.ARMADOS
    al = "".join('<div class="armr"><div class="armt"><div class="armn">%s</div>'
                 '<div class="armq">%s</div></div><div class="armd">%s</div>'
                 '<div class="armp">%s</div></div>'
                 % (esc(t), esc(q), esc(d), esc(p)) for t, q, d, p in AR["items"])
    page(cab(2, AR["eyebrow"], AR["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="arm">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(AR["intro"]), al, esc(AR["nota"]))
         + foot(AR["pie"], pie), glow(G))

    # 03 tarifas y que incluye
    IN = C.INCLUYE
    page(cab(3, IN["eyebrow"], IN["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="dosinv">%s%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="lab">%s</div>'
           '<div class="flist compacta" style="margin-top:6px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(IN["intro"]),
              caja(IN["tecnica_para"], T.pesos(T.TECNICA), "por hora", IN["tecnica_d"]),
              caja(IN["completa_para"], T.pesos(T.COMPLETA), "por hora", IN["completa_d"]),
              esc(IN["equipo_t"]), filas(IN["equipo"]), esc(IN["nota"]))
         + foot(IN["pie"], pie), glow(G))

    # 04 como se reserva
    RE = C.RESERVA
    pl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(k)) for k, t, d in RE["pasos"])
    fi = "".join('<div class="cbox" style="margin-top:14px;padding-top:14px">'
                 '<div class="cn" style="font-size:33px">%s</div>'
                 '<div class="cr" style="font-size:25px">%s</div></div>' % (esc(n), esc(r))
                 for n, r in RE["firmas"])
    page(cab(4, RE["eyebrow"], RE["titulo"])
         + '  <div class="body-pad" style="padding-top:24px"><div class="rol">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="lab">%s</div>'
           '<div class="flist compacta" style="margin-top:6px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:20px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:28px">%s'
           '<div class="ce" style="margin-top:20px;font-size:25px">%s</div></div>\n'
           % (pl, esc(RE["aclaraciones_t"]), filas(RE["aclaraciones"]), esc(RE["cierre"]),
              fi, esc(RE["estudio"]))
         + foot(RE["pie"], pie), glow(A + "2A", "rgba(27,111,232,.14)"))

    return pags


# ---------------------------------------------------------------- documento 5
def servicios(C):
    total = 9
    pags, bar, foot, glow, page, cab = hacer(C, total)
    A = C.ACENTO
    G = A + "22"
    pie = "Nexo Studios"

    # 01 portada sobre la foto del piso
    logo = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    foto = b64(ASSETS + "/estudio-nexo.jpg", "image/jpeg")
    P = C.PORTADA
    fondo = ('<img src="%s" style="position:absolute;inset:0;width:1080px;height:1920px;'
             'object-fit:cover">'
             '<div class="glow" style="background:linear-gradient(180deg,'
             'rgba(4,6,10,.72) 0%%, rgba(4,6,10,.38) 32%%, rgba(4,6,10,.93) 72%%,'
             'rgba(4,6,10,.99) 100%%)"></div>' % foto)
    page('  <div class="body-pad" style="padding-top:64px">'
         '<img class="cover-logo" src="%s" style="width:420px"></div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:112px; margin-top:26px">%s</h1>\n'
         '    <p class="parr" style="margin-top:28px; color:#CBD4DF">%s</p>\n'
         '    <div class="aviso" style="margin-top:26px; color:var(--a);'
         'border-color:rgba(199,164,94,.45)">%s</div>\n'
         '    <div class="kicker" style="margin-top:22px">%s</div>\n  </div>\n'
         '  <div class="spacer" style="flex:0 0 110px"></div>\n'
         % (logo, esc(P["eyebrow"]), esc(P["titulo"]).replace("\n", "<br>"),
            esc(P["bajada"]), esc(P["aviso"]), esc(P["kicker"]))
         + foot("Servicios", pie), fondo, cls=" negro")

    # 02 qué incluye la hora, siempre
    BE = C.BENEFICIOS
    bl = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                 % (esc(t), esc(d)) for t, d in BE["items"])
    page(cab(2, BE["eyebrow"], BE["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:32px;margin-top:18px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:18px"><div class="flist compacta">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:20px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(BE["intro"]), bl, esc(BE["nota"]))
         + foot(BE["pie"], pie), glow(G))

    # 03 la hoja de precios, todo junto
    R = C.RESUMEN
    page(cab(3, R["eyebrow"], R["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:31px;margin-top:18px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px">\n%s  </div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(R["intro"]), hoja_precios(C), esc(R["pie_nota"]))
         + foot(R["pie"], pie), glow(G))

    # 03 los dos servicios y el extra
    SV = C.SERVICIOS
    sl = "".join('<div class="armr"><div class="armt"><div class="armn">%s</div>'
                 '<div class="armq">%s</div></div><div class="armd">%s</div></div>'
                 % (esc(t), esc(q), esc(d)) for t, q, d in SV["items"])
    page(cab(4, SV["eyebrow"], SV["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="arm">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(SV["intro"]), sl, esc(SV["nota"]))
         + foot(SV["pie"], pie), glow(G))

    # 03 streaming
    ST = C.STREAMING
    cuerpo = ""
    for hs, etiqueta in ST["filas"]:
        def celda(op):
            p = S.STREAMING.get((hs, op))
            return S.pesos(p) if p else '<span style="color:#65707F">%s</span>' % esc(ST["sin_precio"])
        cuerpo += ('<tr><td class="k">%s</td><td>%s</td><td class="a">%s</td></tr>'
                   % (esc(etiqueta), celda(1), celda(2)))
    tabla = ('<table class="tab"><tr><th>Por hora</th><th>%s</th>'
             '<th class="a">%s</th></tr>%s</table>'
             % (esc(S.DOTACION[1]), esc(S.DOTACION[2]), cuerpo))
    page(cab(5, ST["eyebrow"], ST["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:28px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:30px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(ST["intro"]), tabla, esc(ST["nota"]))
         + foot(ST["pie"], pie), glow(G))

    # 04 podcast
    PO = C.PODCAST
    cuerpo = "".join('<tr><td class="k">%s</td><td class="a">%s</td></tr>'
                     % (esc(etiqueta), S.pesos(S.PODCAST[hs])) for hs, etiqueta in PO["filas"])
    tabla = ('<table class="tab"><tr><th>Por hora</th>'
             '<th class="a">Precio</th></tr>%s</table>' % cuerpo)
    page(cab(6, PO["eyebrow"], PO["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:28px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:30px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(PO["intro"]), tabla, esc(PO["nota"]))
         + foot(PO["pie"], pie), glow(G))

    # 05 produccion
    PR = C.PRODUCCION
    rl = "".join('<div class="procard"><div class="pron">%s</div>'
                 '<div class="prosub">%s</div>'
                 '<div class="protd" style="font-size:28px;margin-top:12px">%s</div></div>'
                 % (esc(t), esc(s), esc(d)) for t, s, d in PR["roles"])
    page(cab(7, PR["eyebrow"], PR["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p>'
           '<div class="lab" style="margin-top:24px">Se suma por hora</div>'
           '<div class="iv" style="font-size:60px;margin-top:4px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="pro">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(PR["intro"]), S.pesos(S.PRODUCCION), rl, esc(PR["nota"]))
         + foot(PR["pie"], pie), glow(G))

    # 06 descuentos
    DE = C.DESCUENTOS
    cuerpo = "".join('<tr><td class="k">%d meses seguidos</td><td class="a">%.0f%% menos</td></tr>'
                     % (m, d * 100) for m, d in sorted(S.DESCUENTOS.items()))
    tabla = ('<table class="tab"><tr><th>Contrato</th>'
             '<th class="a">Descuento</th></tr>%s</table>' % cuerpo)
    page(cab(8, DE["eyebrow"], DE["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:30px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="nota">'
           '<b>%s:</b> %s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(DE["intro"]), tabla, esc(DE["nota_t"]), esc(DE["nota"]))
         + foot(DE["pie"], pie), glow(G))

    # 07 como se reserva
    CN = C.CONTACTO
    pl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(k)) for k, t, d in CN["pasos"])
    fi = "".join('<div class="cbox" style="margin-top:16px;padding-top:16px">'
                 '<div class="cn" style="font-size:33px">%s</div>'
                 '<div class="cr" style="font-size:25px">%s</div></div>' % (esc(n_), esc(r))
                 for n_, r in CN["firmas"])
    page(cab(9, CN["eyebrow"], CN["titulo"])
         + '  <div class="body-pad" style="padding-top:26px"><div class="rol">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:30px">%s'
           '<div class="ce" style="margin-top:22px;font-size:25px">%s</div></div>\n'
           % (pl, esc(CN["cierre"]), fi, esc(CN["estudio"]))
         + foot(CN["pie"], pie), glow(A + "2A", "rgba(27,111,232,.14)"))

    return pags


MAQUETAS = {"carpeta": carpeta, "direccion": direccion, "venta": venta,
            "alquiler": alquiler, "servicios": servicios}


def main():
    global LOGO
    mod = sys.argv[1] if len(sys.argv) > 1 else "contenido_carpeta"
    C = importlib.import_module(mod)
    LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    pags = MAQUETAS[C.SLUG](C)
    ultimo = re.findall(r"(\d+) / (\d+)<", "".join(pags))
    if ultimo:
        assert int(ultimo[-1][0]) == int(ultimo[-1][1]) == len(pags), \
            "el total declarado (%s) no coincide con las paginas generadas (%d)" \
            % (ultimo[-1][1], len(pags))
    html = envolver(pags, C.TITULO_DOC, C.ACENTO)
    if not C.INTERNO:
        # los honorarios del equipo tecnico no salen de Nexo: se verifica antes de escribir
        # los internos son los de LA grilla que usa este documento: los 50.000 son
        # honorario en tarifas.py y precio de lista en servicios.py
        if getattr(C, "FUENTE", "tarifas") == "servicios":
            internos = set(list(S.COSTO_OPERACION.values()) + [S.PRODUCCION_COSTO])
        else:
            internos = set(list(T.OPERADOR.values()) + list(T.ASISTENTE.values())
                           + [T.PRODUCCION])
        for valor in internos:
            assert S.pesos(valor) not in html, \
                "%s es un costo interno y aparece en un documento externo" % S.pesos(valor)
    # un %% de más en un literal sale impreso como "10%%": ya pasó dos veces
    assert "%%" not in re.sub(r"<style>.*?</style>", "", html, flags=re.S), \
        "quedó un %% doble en el texto: revisá el escape en la maqueta"
    open(".%s.inlined.html" % C.SLUG, "w").write(html)
    print("%s · %d paginas" % (C.SLUG, len(pags)))


if __name__ == "__main__":
    main()
