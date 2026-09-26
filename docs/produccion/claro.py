# -*- coding: utf-8 -*-
"""Los documentos de fondo blanco: la propuesta de producción y el instructivo.

Usa las mismas piezas de maqueta que los oscuros (presupuesto.hacer), pero
con estilos-claro.css y sin los resplandores, que en blanco no van.

    python3 claro.py contenido_propuesta
"""

import importlib, re, sys

import presupuesto as P
import servicios as S

esc = P.esc


def envolver(paginas, titulo):
    css = open("estilos-claro.css").read().replace("/*FONTS*/", P.fonts_css())
    return ("<!DOCTYPE html>\n<html lang='es'><head><meta charset='utf-8'>"
            "<title>%s</title><style>%s</style></head><body>\n%s</body></html>"
            % (esc(titulo), css, "".join(paginas)))


def piezas(C, total):
    """Las mismas piezas, con el resplandor anulado: en blanco no va."""
    pags, bar, foot, _glow, page, cab = P.hacer(C, total)
    return pags, bar, foot, (lambda *a, **k: ""), page, cab


def filas(items, compacta=True):
    cls = "flist compacta" if compacta else "flist"
    cuerpo = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                     % (esc(t), esc(d)) for t, d in items)
    return '<div class="%s">%s</div>' % (cls, cuerpo)


def portada(page, bar, foot, C, pie, interno):
    """Tapa blanca: logo grande arriba, título abajo. Sin foto."""
    P.LOGO = P.b64(P.ASSETS + "/nexo-studios-logo.png", "image/png")
    D = C.PORTADA
    extra = ""
    if interno:
        extra += ('    <div class="aviso" style="margin-bottom:26px">%s</div>\n'
                  % esc(D["aviso"]))
    bloques = ""
    if interno:
        para = "".join('<div class="cbox" style="margin-top:18px;padding-top:18px">'
                       '<div class="cn" style="font-size:36px">%s</div>'
                       '<div class="cr">%s</div></div>' % (esc(n), esc(r))
                       for n, r in D["para"])
        bloques = ('    <div class="lab" style="margin-top:44px">%s</div>%s\n'
                   '    <div class="kicker">%s</div>\n' % (esc(D["para_t"]), para, esc(D["firma"])))
    else:
        bloques = '    <div class="kicker">%s</div>\n' % esc(D["kicker"])

    page('  <div class="body-pad" style="padding-top:70px">'
         '<img src="%s" style="width:430px;display:block"></div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n%s'
         '    <div class="eyebrow">%s</div>\n'
         '    <h1 class="cover-h" style="font-size:104px; margin-top:22px">%s</h1>\n'
         '    <p class="parr" style="margin-top:30px">%s</p>\n%s  </div>\n'
         '  <div class="spacer"></div>\n'
         % (P.LOGO, extra, esc(D["eyebrow"]), esc(D["titulo"]).replace("\n", "<br>"),
            esc(D["bajada"]), bloques)
         + foot(pie, "Nexo Studios"))


def cierre(page, cab, foot, n, D, pie):
    fi = "".join('<div class="cbox" style="margin-top:24px">'
                 '<div class="cn">%s</div><div class="cr">%s</div></div>'
                 % (esc(a), esc(b)) for a, b in D["firmas"])
    cuerpo = '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n' \
             % esc(D.get("bajada") or D.get("cierre"))
    if D.get("destacado"):
        cuerpo += ('  <div class="body-pad" style="padding-top:34px">'
                   '<div class="destacado">%s</div></div>\n' % esc(D["destacado"]))
    page(cab(n, D["eyebrow"], D["titulo"]) + cuerpo
         + '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:34px">%s'
           '<div class="ce" style="margin-top:30px">%s</div></div>\n'
         % (fi, esc(D["estudio"]))
         + foot(D["pie"], "Nexo Studios"))


# ---------------------------------------------------------------- propuesta
def propuesta(C):
    total = 7
    pags, bar, foot, glow, page, cab = piezas(C, total)
    pie = "Nexo Studios"

    portada(page, bar, foot, C, "Propuesta", interno=True)

    E = C.ENCARGO
    parr = "".join('<p class="parr" style="margin-top:26px">%s</p>' % esc(p)
                   for p in E["parrafos"])
    page(cab(2, E["eyebrow"], E["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:40px"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (parr, esc(E["destacado"]))
         + foot(E["pie"], pie))

    # lo que deja cada servicio
    R = C.RENDIMIENTO
    cuerpo = ""
    for (hs, op), precio in sorted(S.STREAMING.items(), key=lambda kv: (kv[0][0] or 0, kv[0][1])):
        et = "Hora suelta" if hs is None else "%d hs/mes" % hs
        cuerpo += ('<tr><td class="k">%s</td><td>%s</td><td>%s</td><td class="a">%s</td></tr>'
                   % (esc(et), esc(S.DOTACION[op]), S.pesos(precio),
                      S.pesos(S.gana_streaming(hs, op))))
    t1 = ('<table class="tab"><col style="width:196px"><col style="width:344px">'
          '<col style="width:208px"><col style="width:208px">'
          '<tr><th>Streaming</th><th>Dotación</th><th>Precio</th>'
          '<th class="a">Deja</th></tr>%s</table>' % cuerpo)
    cuerpo = "".join('<tr><td class="k">%s</td><td>%s</td><td class="a">%s</td></tr>'
                     % (esc("Hora suelta" if hs is None else "%d hs/mes" % hs),
                        S.pesos(S.PODCAST[hs]), S.pesos(S.gana_podcast(hs)))
                     for hs in (None, 8, 16, 24))
    t2 = ('<table class="tab"><tr><th>Podcast</th><th>Precio</th>'
          '<th class="a">Deja</th></tr>%s</table>' % cuerpo)
    page(cab(3, R["eyebrow"], R["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:26px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(R["intro"]), t1, t2, esc(R["nota"]))
         + foot(R["pie"], pie))

    J = C.JORNADA
    rl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(q)) for t, q, d in J["roles"])
    page(cab(4, J["eyebrow"], J["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="rol">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(J["intro"]), rl, esc(J["nota"]))
         + foot(J["pie"], pie))

    PE = C.PEDIMOS
    page(cab(5, PE["eyebrow"], PE["titulo"])
         + '  <div class="body-pad" style="padding-top:26px">%s</div>\n'
           '  <div class="spacer"></div>\n' % filas(PE["items"], compacta=False)
         + foot(PE["pie"], pie))

    RI = C.RIESGOS
    page(cab(6, RI["eyebrow"], RI["titulo"])
         + '  <div class="body-pad" style="padding-top:26px">%s</div>\n'
           '  <div class="spacer"></div>\n' % filas(RI["items"], compacta=False)
         + foot(RI["pie"], pie))

    cierre(page, cab, foot, 7, C.CIERRE, pie)
    return pags


# ---------------------------------------------------------------- instructivo
def instructivo(C):
    total = 8
    pags, bar, foot, glow, page, cab = piezas(C, total)
    pie = "Nexo Studios"

    portada(page, bar, foot, C, "Cómo armar tu programa", interno=False)

    EL = C.ELEGIR
    el = "".join('<div class="armr"><div class="armt"><div class="armn">%s</div>'
                 '<div class="armq">%s</div></div><div class="armd">%s</div>'
                 '<div class="armp">%s</div></div>' % (esc(t), esc(q), esc(d), esc(p))
                 for t, q, d, p in EL["items"])
    page(cab(2, EL["eyebrow"], EL["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="arm">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(EL["intro"]), el, esc(EL["nota"]))
         + foot(EL["pie"], pie))

    PO = C.PONE
    page(cab(3, PO["eyebrow"], PO["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="lab">%s</div>%s</div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="lab">%s</div>%s</div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(PO["intro"]), esc(PO["traes_t"]), filas(PO["traes"]),
              esc(PO["ponemos_t"]), filas(PO["ponemos"]))
         + foot(PO["pie"], pie))

    AN = C.ANTES
    page(cab(4, AN["eyebrow"], AN["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px">%s</div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(AN["intro"]), filas(AN["items"]), esc(AN["nota"]))
         + foot(AN["pie"], pie))

    DI = C.DIA
    bl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(q)) for t, q, d in DI["bloques"])
    page(cab(5, DI["eyebrow"], DI["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="rol">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(DI["intro"]), bl, esc(DI["nota"]))
         + foot(DI["pie"], pie))

    DE = C.DESPUES
    page(cab(6, DE["eyebrow"], DE["titulo"])
         + '  <div class="body-pad" style="padding-top:26px">%s</div>\n'
           '  <div class="spacer"></div>\n' % filas(DE["items"], compacta=False)
         + foot(DE["pie"], pie))

    ER = C.ERRORES
    page(cab(7, ER["eyebrow"], ER["titulo"])
         + '  <div class="body-pad"><p class="parr" style="font-size:33px;margin-top:20px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px">%s</div>\n'
           '  <div class="spacer"></div>\n' % (esc(ER["intro"]), filas(ER["items"], compacta=False))
         + foot(ER["pie"], pie))

    EM = C.EMPEZAR
    pl = "".join('<div class="rolr"><div><div class="roln">%s</div>'
                 '<div class="rold">%s</div></div><div class="rolq">%s</div></div>'
                 % (esc(t), esc(d), esc(k)) for k, t, d in EM["pasos"])
    fi = "".join('<div class="cbox" style="margin-top:20px;padding-top:20px">'
                 '<div class="cn" style="font-size:34px">%s</div>'
                 '<div class="cr" style="font-size:26px">%s</div></div>'
                 % (esc(a), esc(b)) for a, b in EM["firmas"])
    page(cab(8, EM["eyebrow"], EM["titulo"])
         + '  <div class="body-pad" style="padding-top:24px"><div class="rol">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:30px">%s'
           '<div class="ce" style="margin-top:24px;font-size:26px">%s</div></div>\n'
           % (pl, esc(EM["cierre"]), fi, esc(EM["estudio"]))
         + foot(EM["pie"], pie))
    return pags


MAQUETAS = {"propuesta": propuesta, "instructivo": instructivo}


def main():
    mod = sys.argv[1] if len(sys.argv) > 1 else "contenido_propuesta"
    C = importlib.import_module(mod)
    P.LOGO = P.b64(P.ASSETS + "/nexo-studios-logo.png", "image/png")
    pags = MAQUETAS[C.SLUG](C)
    html = envolver(pags, C.TITULO_DOC)

    if not C.INTERNO:
        internos = set(list(S.COSTO_OPERACION.values()) + [S.PRODUCCION_COSTO])
        for valor in internos:
            assert S.pesos(valor) not in html, \
                "%s es un costo interno y aparece en un documento externo" % S.pesos(valor)
    hoja = open("estilos-claro.css").read()
    usadas = set()
    for grupo in re.findall(r'class="([^"]+)"', html):
        usadas.update(grupo.split())
    huerfanas = sorted(c for c in usadas if ("." + c) not in hoja)
    assert not huerfanas, ("estas clases no están en estilos-claro.css y salen al "
                           "tamaño por defecto del navegador: %s" % ", ".join(huerfanas))

    assert "%%" not in re.sub(r"<style>.*?</style>", "", html, flags=re.S), \
        "quedó un %% doble en el texto"

    open(".%s.inlined.html" % C.SLUG, "w").write(html)
    print("%s · %d paginas" % (C.SLUG, len(pags)))


if __name__ == "__main__":
    main()
