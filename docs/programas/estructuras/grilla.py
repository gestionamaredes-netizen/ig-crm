# -*- coding: utf-8 -*-
"""Arma la hoja de estructura de programacion.

Usa el mismo CSS y el mismo tamano de pagina que las hojas de estructura, mas
unas reglas propias para la barra de horas y para marcar los cruces.

Los cruces no se escriben a mano: los calcula datos.transiciones() comparando
el hueco entre dos programas contra lo que tarda en armarse el piso del que
viene. Si manana cambia un horario, la hoja se vuelve a generar y el aviso
aparece o desaparece solo.
"""
import os
import sys

import datos as D
import estructura as E

# La barra de horas arranca a las 16:00 y termina a las 00:00.
DESDE, HASTA = 16 * 60, 24 * 60


def pos(m):
    return 100.0 * (m - DESDE) / (HASTA - DESDE)


def barra(dia):
    piezas = []
    for nombre, slug, ini, fin in D.GRILLA[dia]:
        a, b = D.minutos(ini), D.minutos(fin)
        prog = next(p for p in D.PROGRAMAS if p["slug"] == slug)
        piezas.append(
            '<i style="left:%.3f%%;width:%.3f%%;background:%s" title="%s · %s a %s"></i>'
            % (pos(a), pos(b) - pos(a), prog["acento"], E.esc(nombre),
               E.esc(ini), E.esc(fin.replace("24:00", "00:00"))))
    marcas = "".join('<b style="left:%.3f%%">%02d:00</b>' % (pos(h * 60), h)
                     for h in range(16, 25) if h % 2 == 0)
    return ('<div class="franja">%s</div><div class="horas">%s</div>'
            % ("".join(piezas), marcas))


def tabla_dia(dia):
    filas = []
    for nombre, slug, ini, fin in D.GRILLA[dia]:
        dur = D.minutos(fin) - D.minutos(ini)
        prog = next(p for p in D.PROGRAMAS if p["slug"] == slug)
        filas.append('<tr><td class="pt"><s style="background:%s"></s></td>'
                     '<td class="hr">%s a %s</td><td class="bl"><b>%s</b>'
                     '<span>%s</span></td><td class="du">%d\'</td></tr>'
                     % (prog["acento"], E.esc(ini), E.esc(fin.replace("24:00", "00:00")),
                        E.esc(nombre), E.esc(prog["bajada"]), dur))
    return '<table class="esc">%s</table>' % "".join(filas)


def tabla_programas():
    filas = []
    for p in D.PROGRAMAS:
        ficha = dict(p["ficha"])
        cuando = ficha.get("Emisión") or ficha.get("Grabación", "—")
        elenco = ficha.get("En cámara", "—")
        filas.append('<tr><td class="pt"><s style="background:%s"></s></td>'
                     '<td class="bl"><b>%s</b><span>%s</span></td>'
                     '<td class="v">%s<br><i>%s</i></td></tr>'
                     % (p["acento"], E.esc(p["nombre"]), E.esc(p["bajada"]),
                        E.esc(cuando), E.esc(elenco)))
    return '<table class="kv">%s</table>' % "".join(filas)


def horas_de_piso():
    """Suma el aire de cada dia y le agrega el armado de cada programa.

    El armado no es hora de aire pero si de piso, con operador y asistente,
    asi que es lo que hay que presupuestar.
    """
    filas = []
    for dia in D.GRILLA:
        aire = sum(D.minutos(f) - D.minutos(i) for _, _, i, f in D.GRILLA[dia])
        armado = sum(D.ARMADO[s] for _, s, _, _ in D.GRILLA[dia])
        filas.append((dia, aire, armado))
    out = "".join('<tr><td class="k">%s</td><td class="v">%d h %02d de aire · '
                  '%d h %02d de armado y prueba</td><td class="du">%d h %02d</td></tr>'
                  % (E.esc(d), a // 60, a % 60, m // 60, m % 60,
                     (a + m) // 60, (a + m) % 60)
                  for d, a, m in filas)
    tot_a = sum(a for _, a, _ in filas)
    tot_m = sum(m for _, _, m in filas)
    out += ('<tr class="tot"><td></td><td>Por semana</td><td class="du">%d h %02d</td></tr>'
            % ((tot_a + tot_m) // 60, (tot_a + tot_m) % 60))
    return '<table class="kv sem">%s</table>' % out


def cambios(dia):
    out = []
    for n1, n2, hueco, nec, ok in D.transiciones(dia):
        clase = "" if ok else " class=\"mal\""
        estado = ("Alcanza" if ok else "Faltan %d min" % (nec - hueco))
        out.append('<tr%s><td class="k">%s → %s</td><td class="v">%d min de hueco · '
                   'el piso de %s se arma en %d</td><td class="du">%s</td></tr>'
                   % (clase, E.esc(n1), E.esc(n2), hueco, E.esc(n2), nec, E.esc(estado)))
    return '<table class="kv sem">%s</table>' % "".join(out)


CSS_EXTRA = """
.franja{position:relative;height:30px;margin:9px 0 3px;background:#EEF1F5;
  border-radius:5px;overflow:hidden}
.franja i{position:absolute;top:0;height:30px;font-style:normal}
td.pt{width:22px;padding-right:0}
td.pt s{display:block;width:13px;height:13px;border-radius:3px;margin-top:7px}
.esc .hr{width:23%%}
.horas{position:relative;height:26px}
.horas b{position:absolute;font-weight:400;font-size:18px;color:%(media)s}
.horas b:last-child{transform:translateX(-100%%)}
tr.mal .k,tr.mal .du{color:%(rojo)s}
tr.mal .du{font-weight:700}
.pasos{margin-top:4px}
.paso{display:flex;gap:14px;padding:9px 0;border-bottom:1px solid %(linea)s}
.paso:last-child{border-bottom:none}
.paso .p{font-size:18px;font-weight:700;color:%(azul)s;min-width:30px}
.paso b{display:block;font-size:18px}
.paso span{display:block;font-size:18px;line-height:1.42;color:%(media)s}
.kv .bl b{display:block;font-size:19px}
.kv .bl span{display:block;font-size:18px;color:%(media)s}
.kv .v i{font-style:normal;color:%(media)s}
.aviso{margin-top:16px;font-size:18px;line-height:1.45;color:%(tinta)s;
  border-left:3px solid %(rojo)s;padding:4px 0 4px 13px}
""" % dict(media=D.TINTA_MEDIA, rojo=D.NEXO_ROJO, tinta=D.TINTA,
       linea=D.LINEA, azul=D.NEXO_AZUL)


def paginas():
    hoja = lambda cuerpo: """
<div class="page" style="--acento:%s">
  <div class="stack">
    <header>
      <div class="marca"><b>NEXO</b> STUDIOS</div>
      <div class="donde">99 · Estudio</div>
    </header>
%s
    <div class="spacer"></div>
    <footer>Estructura de programación · Producción General · Nexo Studios</footer>
  </div>
</div>
""" % (D.NEXO_AZUL, cuerpo)

    rotas = [(d, t) for d in D.GRILLA for t in D.transiciones(d) if not t[4]]
    aviso = ""
    if rotas:
        lineas = "".join(
            "<br>%s sale del aire y %s entra %s." %
            (E.esc(t[0]), E.esc(t[1]),
             "en el mismo minuto" if t[2] == 0 else "%d minutos después" % t[2])
            for _, t in rotas)
        cabeza = ("Hay una transición que no cierra" if len(rotas) == 1
                  else "Hay %d transiciones que no cierran" % len(rotas))
        aviso = ('<p class="aviso"><b>%s.</b>%s'
                 '<br><br>El piso es uno solo: mientras uno está al aire, el otro no se '
                 'puede armar. Esto no se resuelve apurando a nadie.</p>' % (cabeza, lineas))

    p1 = hoja("""
    <h1>La semana</h1>
    <p class="bajada">Dos días de piso · cinco programas</p>
    <p class="lede">Los cinco programas salen en dos días. El miércoles abre Exitosa Yo y
    cierra Tercer Tiempo; el domingo abre Pequeños Grandes Sabios y cierra Tercer Tiempo.
    Tercer Tiempo es el único que va los dos días.</p>

    <h2>Miércoles</h2>
    %s
    %s
    <h2>Domingo</h2>
    %s
    %s
""" % (tabla_dia("Miércoles"), barra("Miércoles"),
       tabla_dia("Domingo"), barra("Domingo")))

    p2 = hoja("""
    <h2 class="primero">Los cambios de piso</h2>
    <p class="lede chico">El hueco se mide de punta a punta: desde que uno sale del aire
    hasta que el otro entra. Contra eso se compara lo que tarda en armarse y probarse el
    piso del que viene.</p>

    <p class="sub">Miércoles</p>
    %s
    <p class="sub">Domingo</p>
    %s
    %s
""" % (cambios("Miércoles"), cambios("Domingo"), aviso))

    p3 = hoja("""
    <h2 class="primero">Los cinco programas</h2>
    %s
    <h2>Horas de piso</h2>
    <p class="lede chico">El armado y la prueba de sonido no son horas de aire, pero sí de
    piso, con operador y asistente de operación. Es lo que hay que presupuestar además de
    la emisión.</p>
    %s
""" % (tabla_programas(), horas_de_piso()))

    p4 = hoja("""
    <h2 class="primero">Quién hace qué</h2>
    %s
    <h2>El circuito de un programa</h2>
    %s
""" % ('<table class="kv">%s</table>' % E.filas(D.CIRCUITO), "".join(
        '<div class="paso"><span class="p">%02d</span><div><b>%s</b>'
        '<span>%s</span></div></div>' % (i + 1, E.esc(t), E.esc(d))
        for i, (t, d) in enumerate(D.PASOS))))

    return p1 + p2 + p3 + p4


def construir():
    return ('<!doctype html><html lang="es"><meta charset="utf-8">'
            '<title>Nexo Studios · estructura de programación</title>'
            '<style>%s%s</style><body>%s</body></html>'
            % (E.CSS, CSS_EXTRA, paginas()))


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else "."
    with open(os.path.join(destino, ".grilla.html"), "w", encoding="utf-8") as f:
        f.write(construir())
    for dia in D.GRILLA:
        for n1, n2, hueco, nec, ok in D.transiciones(dia):
            if not ok:
                print("  AVISO %s: %s -> %s, hueco %d min, arma en %d"
                      % (dia, n1, n2, hueco, nec))
    print("grilla lista")


if __name__ == "__main__":
    main()
