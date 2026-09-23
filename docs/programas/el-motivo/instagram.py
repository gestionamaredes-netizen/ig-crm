# -*- coding: utf-8 -*-
"""Arma el kit de Instagram de El Motivo.

Usa las mismas piezas que la carpeta (motivo.py): misma tipografía, mismo
acento, mismos pies de página. Se corre con:  python3 instagram.py
"""

import motivo
from motivo import ASSETS, b64, esc, envolver, hacer

TOTAL = 13


def kit(C):
    pags, bar, foot, glow, page, cab = hacer(C, TOTAL)
    A = C.ACENTO
    G = A + "26"
    pie = C.PROGRAMA

    # 01 portada
    P = C.PORTADA
    page('  <div class="body-pad" style="padding-top:44px">%s</div>\n'
         '  <div class="spacer"></div>\n'
         '  <div class="body-pad">\n'
         '    <div class="eyebrow">El Motivo · %s</div>\n'
         '    <h1 class="cover-h" style="font-size:104px; margin-top:22px">%s</h1>\n'
         '    <div class="claim" style="margin-top:22px">%s</div>\n'
         '    <p class="parr" style="margin-top:26px">%s</p>\n'
         '    <div class="kicker">%s</div>\n  </div>\n'
         '  <div class="spacer"></div>\n'
         % (bar(1), esc(P["eyebrow"]), esc(P["titulo"]).replace("\n", "<br>"),
            esc(C.CLAIM), esc(P["bajada"]), esc(C.DIA + " · " + C.CANAL))
         + foot("Instagram", pie), glow(A + "30", "rgba(222,28,43,.16)"), cls=" negro")

    # 02 qué es esta cuenta
    Q = C.POSICION
    parr = "".join('<p class="parr" style="margin-top:24px">%s</p>' % esc(p) for p in Q["parrafos"])
    silo = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                   % (esc(t), esc(d)) for t, d in Q["silo"])
    page(cab(2, Q["eyebrow"], Q["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="flist">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:36px"><div class="destacado">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (parr, silo, esc(Q["destacado"]))
         + foot(Q["pie"], pie), glow(G))

    # 03 usuario y nombre
    U = C.USUARIO
    op = "".join('<div class="usrow"><div class="uh">@%s</div><div class="ul">%s</div>'
                 '<div class="ud">%s</div></div>' % (esc(u), esc(l), esc(d))
                 for u, l, d in U["opciones"])
    page(cab(3, U["eyebrow"], U["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:24px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="usr">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:34px"><div class="flist">'
           '<div class="frow"><div class="lab">%s</div>'
           '<div class="ft" style="font-size:42px;margin-top:10px">%s</div>'
           '<div class="fd">%s</div></div>'
           '<div class="frow"><div class="lab">%s</div>'
           '<div class="ft" style="font-size:42px;margin-top:10px">%s</div></div>'
           '</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(U["intro"]), op, esc(U["nombre_lab"]), esc(U["nombre"]),
              esc(U["nombre_nota"]), esc(U["categoria_lab"]), esc(U["categoria"]))
         + foot(U["pie"], pie), glow(G))

    # 04 la bio
    B = C.BIO
    cards = ""
    for nombre, lineas in B["opciones"]:
        texto = "\n".join(lineas)
        cards += ('<div class="biocard"><div class="biolab"><span class="n">%s</span>'
                  '<span class="c">%d / 150</span></div><div class="biotxt">%s</div></div>'
                  % (esc(nombre), len(texto), "<br>".join(esc(l) for l in lineas)))
    links = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                    % (esc(t), esc(d)) for t, d in B["links"])
    page(cab(4, B["eyebrow"], B["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="bio">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="lab">%s</div>'
           '<div class="flist" style="margin-top:6px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(B["intro"]), cards, esc(B["links_lab"]), links, esc(B["links_nota"]))
         + foot(B["pie"], pie), glow(G))

    # 05 la foto de perfil, mostrada en los tres tamaños reales
    F = C.FOTO
    perfil = b64("instagram/perfil.png", "image/png")
    caps = "".join('<div><img class="fotoimg" src="%s" style="width:%dpx;height:%dpx">'
                   '<div class="fotocap">%s<br>%s</div></div>'
                   % (perfil, px, px, esc(t), esc(d))
                   for px, (t, d) in zip((300, 176, 112), F["tamanos"]))
    parr = "".join('<p class="parr" style="margin-top:24px">%s</p>' % esc(p) for p in F["parrafos"])
    page(cab(5, F["eyebrow"], F["titulo"])
         + '  <div class="body-pad">%s</div>\n'
           '  <div class="body-pad" style="padding-top:44px"><div class="fotobox">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:40px"><div class="lab">Archivo</div>'
           '<div class="ft" style="font-size:34px;margin-top:10px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:30px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (parr, caps, esc(F["archivo"]), esc(F["nota"]))
         + foot(F["pie"], pie), glow(G))

    # 06 destacadas
    D = C.DESTACADAS
    filas = "".join('<div class="dstrow"><div class="dstc">%s</div><div>'
                    '<div class="dstt">%s</div><div class="dstd">%s</div></div></div>'
                    % (esc(t).replace(" ", "<br>", 1) if len(t) > 8 else esc(t), esc(t), esc(d))
                    for t, d in D["items"])
    page(cab(6, D["eyebrow"], D["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="dst">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(D["intro"]), filas, esc(D["nota"]))
         + foot(D["pie"], pie), glow(G))

    # 07 los cinco formatos
    FO = C.FORMATOS
    fl = "".join('<div class="eqr"><div class="eqn">%s</div><div class="eqrol">%s</div>'
                 '<div class="eqd">%s</div></div>' % (esc(t), esc(c), esc(d))
                 for t, c, d in FO["items"])
    page(cab(7, FO["eyebrow"], FO["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:22px"><div class="eq">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(FO["intro"]), fl)
         + foot(FO["pie"], pie), glow(G))

    # 08 la semana tipo
    S = C.SEMANA
    dias = "".join('<div class="blor"><div><div class="bh">%s</div></div><div>'
                   '<div class="bt">%s</div><div class="bd">%s</div></div></div>'
                   % (esc(d), esc(t), esc(x)) for d, t, x in S["dias"])
    page(cab(8, S["eyebrow"], S["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:24px"><div class="blo">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(S["intro"]), dias, esc(S["nota"]))
         + foot(S["pie"], pie), glow(G))

    # 09-10 los nueve del lanzamiento, cortados en dos páginas
    GR = C.GRILLA
    def posts(sub):
        return "".join('<div class="drow"><div class="dn">%s</div><div>'
                       '<div class="dg">%s<span class="tipo">%s</span></div>'
                       '<div class="dd">%s</div></div></div>'
                       % (esc(n), esc(t), esc(k), esc(d)) for n, t, k, d in sub)
    page(cab(9, GR["eyebrow"], GR["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="dlist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (esc(GR["intro"]), posts(GR["posts"][:5]))
         + foot(GR["pie"], pie), glow(G))
    page(cab(10, GR["eyebrow"], "Los primeros\nnueve posteos.", "cont. · ")
         + '  <div class="body-pad" style="padding-top:26px"><div class="dlist">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:30px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % (posts(GR["posts"][5:]), esc(GR["nota"]))
         + foot(GR["pie"], pie), glow(G))

    # 11 cómo se publica
    R = C.REGLAS
    fl = "".join('<div class="drow"><div class="dn">%02d</div><div>'
                 '<div class="dg">%s</div><div class="dd">%s</div></div></div>'
                 % (i + 1, esc(t), esc(d)) for i, (t, d) in enumerate(R["items"]))
    page(cab(11, R["eyebrow"], R["titulo"])
         + '  <div class="body-pad" style="padding-top:26px"><div class="dlist">%s</div></div>\n'
           '  <div class="spacer"></div>\n' % fl
         + foot(R["pie"], pie), glow(G))

    # 12 etiquetas y colaboraciones
    E = C.ETIQUETAS
    col = "".join('<div class="frow"><div class="ft">%s</div><div class="fd">%s</div></div>'
                  % (esc(t), esc(d)) for t, d in E["colab"])
    ha = "".join('<div class="frow"><div class="ft" style="font-size:31px">%s</div>'
                 '<div class="fd">%s</div></div>' % (esc(t), esc(d)) for t, d in E["hash"])
    page(cab(12, E["eyebrow"], E["titulo"])
         + '  <div class="body-pad"><p class="parr" style="margin-top:22px">%s</p></div>\n'
           '  <div class="body-pad" style="padding-top:28px"><div class="lab">%s</div>'
           '<div class="flist" style="margin-top:6px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:30px"><div class="lab">%s</div>'
           '<div class="flist" style="margin-top:6px">%s</div></div>\n'
           '  <div class="body-pad" style="padding-top:26px"><div class="nota">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           % (esc(E["intro"]), esc(E["colab_lab"]), col, esc(E["hash_lab"]), ha, esc(E["nota"]))
         + foot(E["pie"], pie), glow(G))

    # 13 quién hace qué
    QU = C.QUIEN
    fl = "".join('<div class="eqr"><div class="eqn">%s</div><div class="eqrol">%s</div>'
                 '<div class="eqd">%s</div></div>' % (esc(t), esc(r), esc(d))
                 for t, r, d in QU["items"])
    page(cab(13, QU["eyebrow"], QU["titulo"])
         + '  <div class="body-pad" style="padding-top:24px"><div class="eq">%s</div></div>\n'
           '  <div class="spacer"></div>\n'
           '  <div class="body-pad" style="padding-bottom:30px">'
           '<div class="destacado">%s</div></div>\n' % (fl, esc(QU["cierre"]))
         + foot(QU["pie"], pie), glow(G))

    return pags


def main():
    import contenido_instagram as C
    motivo.LOGO = b64(ASSETS + "/nexo-studios-logo.png", "image/png")
    pags = kit(C)
    assert len(pags) == TOTAL, (len(pags), TOTAL)
    open(".%s.inlined.html" % C.SLUG, "w").write(
        envolver(pags, "Instagram · El Motivo", C.ACENTO))
    print("%s · %d paginas" % (C.SLUG, len(pags)))


if __name__ == "__main__":
    main()
