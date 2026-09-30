# -*- coding: utf-8 -*-
"""Genera la web interna: una pagina por programa y una de direccion.

    python3 sitio.py        escribe salida/*.html

Son seis paginas y no una sola con roles porque una pagina web no puede
esconder lo que lleva adentro: si los numeros del estudio viajaran en la
pagina de los integrantes, cualquiera con el link los encuentra mirando el
codigo, aunque la interfaz no se los muestre. Asi, el link es el acceso. Los
numeros de direccion solo existen en la pagina de direccion.

Cada pagina se publica como un Artifact aparte. Las ideas que deja la gente
viven en la base de cada pagina, asi que las de Tercer Tiempo estan en la
pagina de Tercer Tiempo: las bases no se cruzan entre artifacts.
"""
import html as _html
import os
import re

import datos_web as W

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "salida")


def esc(t):
    return _html.escape(str(t), quote=False)


def atr(t):
    return _html.escape(str(t), quote=True)


# ---------------------------------------------------------------- el diseño

# Rundown: barra del programa pegada arriba, todo lo demas en filas con la
# hora a la izquierda, como una escaleta de piso. Oscuro de base, que es como
# se ve el estudio; el acento es el color del logo de cada programa.
TOKENS = """:root{
  --fondo:#0B0C0E; --panel:#14161A; --panel-alto:#1B1E24; --linea:#2A2F38;
  --tinta:#F2F4F7; --media:#A2ABBA; --baja:#8E97A6;
  --acento:%(oscuro_no)s; --sobre-acento:#08090B;
  --ok:#5DC825; --alerta:#FF8A5B; --mal:#E8353A;
  color-scheme:dark;
}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){
  --fondo:#FBFAF8; --panel:#FFFFFF; --panel-alto:#F3F2EF; --linea:#E0DED8;
  --tinta:#14181F; --media:#5C6472; --baja:#6E7480;
  --acento:%(claro)s; --sobre-acento:#FFFFFF;
  --ok:#2F6E0F; --alerta:#A85A0C; --mal:#C2145E;
  color-scheme:light;
}}
:root[data-theme="light"]{
  --fondo:#FBFAF8; --panel:#FFFFFF; --panel-alto:#F3F2EF; --linea:#E0DED8;
  --tinta:#14181F; --media:#5C6472; --baja:#6E7480;
  --acento:%(claro)s; --sobre-acento:#FFFFFF;
  --ok:#2F6E0F; --alerta:#A85A0C; --mal:#C2145E;
  color-scheme:light;
}
"""

FUENTES = ('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
           'family=Archivo:wght@500;600;700&family=Source+Sans+3:ital,wght@'
           '0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">')

CSS = """
*{box-sizing:border-box}
body{background:var(--fondo);color:var(--tinta);
  font:400 16px/1.55 "Source Sans 3",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased}
.hoja{max-width:940px;margin:0 auto;padding:0 16px 72px}
h1,h2,h3,.et{font-family:Archivo,system-ui,sans-serif;text-wrap:balance}
h1{font-size:clamp(28px,6vw,44px);line-height:1.04;font-weight:700;
  letter-spacing:-.02em;margin:0}
h2{font-size:clamp(19px,3.4vw,23px);line-height:1.2;font-weight:600;
  letter-spacing:-.01em;margin:0}
h3{font-size:17px;line-height:1.25;font-weight:600;margin:0}
p{margin:0}
a{color:inherit}
.mono{font-family:"IBM Plex Mono",ui-monospace,monospace;
  font-variant-numeric:tabular-nums}
.et{font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  color:var(--baja)}
.media{color:var(--media)}
.chico{font-size:14.5px}

/* barra de arriba */
header.barra{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;
  background:color-mix(in srgb,var(--fondo) 88%,transparent);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--linea)}
.barra .dentro{max-width:940px;margin:0 auto;padding:10px 16px;
  display:flex;align-items:center;gap:12px;min-height:56px}
.barra .chip{display:flex;align-items:center;gap:9px;background:#000;
  border-radius:7px;padding:5px 9px;flex:0 0 auto}
.barra img{height:22px;width:auto;display:block}
.barra .sep{width:1px;height:22px;background:var(--linea);flex:0 0 auto}
.barra .quien{font-family:Archivo,sans-serif;font-weight:600;font-size:15px;
  letter-spacing:-.01em;min-width:0;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}
.barra .quien i{font-style:normal;color:var(--acento)}
.barra nav{margin-left:auto;display:flex;gap:4px;flex:0 0 auto}
.barra nav a{font-size:13px;padding:6px 9px;border-radius:7px;
  text-decoration:none;color:var(--media)}
.barra nav a:hover{background:var(--panel-alto);color:var(--tinta)}
@media (max-width:620px){
  header.barra{position:static}
  .barra .dentro{flex-wrap:wrap;gap:10px;padding:9px 16px;min-height:0}
  .barra nav{margin-left:0;width:100%;overflow-x:auto;gap:6px;
    scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .barra nav::-webkit-scrollbar{display:none}
  .barra nav a{white-space:nowrap;background:var(--panel);
    border:1px solid var(--linea);padding:7px 11px;font-size:13.5px}
  .barra .quien{flex:1}
}

/* portada */
.tapa{padding:34px 0 26px;border-bottom:1px solid var(--linea)}
.tapa .bajada{font-size:17px;color:var(--acento);font-weight:600;
  margin-top:10px;font-family:Archivo,sans-serif;letter-spacing:.01em}
.tapa .que{margin-top:14px;max-width:62ch;color:var(--media);font-size:17px}
.franjas{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.franja{display:flex;align-items:baseline;gap:8px;padding:8px 12px;
  border:1px solid var(--linea);border-radius:9px;background:var(--panel)}
.franja b{font-family:Archivo,sans-serif;font-size:13px;font-weight:600}
.franja span{font-size:14px}

section{padding-top:34px}
.titulo{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;
  padding-bottom:14px}
.titulo p{color:var(--media);font-size:14.5px;max-width:58ch}

/* tres accesos de arriba */
.accesos{display:grid;gap:12px;grid-template-columns:repeat(3,1fr)}
@media (max-width:760px){.accesos{grid-template-columns:1fr}}
.acceso{display:flex;flex-direction:column;gap:8px;padding:16px;
  border:1px solid var(--linea);border-radius:12px;background:var(--panel);
  text-decoration:none;min-width:0}
.acceso:hover{border-color:var(--acento);background:var(--panel-alto)}
.acceso .n{font-family:"IBM Plex Mono",monospace;font-size:12px;
  color:var(--acento);font-weight:500}
.acceso h3{margin:0}
.acceso p{font-size:14px;color:var(--media)}
.acceso .abrir{margin-top:auto;font-size:13px;color:var(--acento);
  font-weight:600}

/* filas: carpetas, documentos, cualquier lista */
.filas{border:1px solid var(--linea);border-radius:12px;overflow:hidden;
  background:var(--panel)}
.fila{display:flex;gap:14px;padding:13px 16px;border-top:1px solid var(--linea);
  align-items:baseline}
.fila:first-child{border-top:none}
.fila .izq{flex:0 0 96px;min-width:0}
.fila .der{flex:1;min-width:0}
.fila .der p{font-size:14px;color:var(--media)}
@media (max-width:620px){
  .fila{flex-direction:column;gap:5px}
  .fila .izq{flex:none}
}
.grupo{border:1px solid var(--linea);border-radius:12px;background:var(--panel);
  margin-bottom:10px;overflow:hidden}
.grupo>.cab{padding:13px 16px;background:var(--panel-alto);
  border-bottom:1px solid var(--linea)}
.grupo>.cab h3{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.grupo>.cab h3 span{font-family:"IBM Plex Mono",monospace;font-size:12px;
  color:var(--acento);font-weight:500}
.grupo>.cab p{font-size:13.5px;color:var(--media);margin-top:4px}
.doc{display:flex;align-items:baseline;gap:11px;padding:12px 16px;
  border-top:1px solid var(--linea);text-decoration:none;min-width:0}
.doc:first-of-type{border-top:none}
.doc:hover{background:var(--panel-alto)}
.doc .marca{flex:0 0 auto;width:7px;height:7px;border-radius:2px;
  background:var(--acento);position:relative;top:-1px}
.doc .t{flex:1;min-width:0;font-size:15px;line-height:1.35}
.doc .flecha{flex:0 0 auto;color:var(--baja);font-size:15px}
.doc:hover .flecha{color:var(--acento)}
.vercarpeta{display:block;padding:10px 16px;border-top:1px solid var(--linea);
  font-size:13px;color:var(--media);text-decoration:none}
.vercarpeta:hover{color:var(--acento)}

/* escaleta */
.envuelve{overflow-x:auto;border:1px solid var(--linea);border-radius:12px;
  background:var(--panel)}
table{border-collapse:collapse;width:100%;min-width:480px}
caption{text-align:left;padding:13px 16px;background:var(--panel-alto);
  border-bottom:1px solid var(--linea);font-family:Archivo,sans-serif;
  font-weight:600;font-size:15px}
caption i{font-style:normal;color:var(--media);font-weight:500}
th{text-align:left;font-family:Archivo,sans-serif;font-size:11px;
  font-weight:600;letter-spacing:.12em;text-transform:uppercase;
  color:var(--baja);padding:9px 16px;border-bottom:1px solid var(--linea)}
td{padding:10px 16px;border-bottom:1px solid var(--linea);font-size:14.5px;
  vertical-align:baseline}
tr:last-child td{border-bottom:none}
td.hora,td.dur{font-family:"IBM Plex Mono",monospace;white-space:nowrap;
  font-variant-numeric:tabular-nums}
td.dur{color:var(--media)}
td.que{color:var(--media)}
td.desc{color:var(--media)}
td.bloque .chica{display:none}
@media (max-width:620px){
  table{min-width:0}
  th.desc,td.desc,th.dur,td.dur{display:none}
  td.bloque .chica{display:block;font-size:13.5px;color:var(--media);
    margin-top:3px;white-space:normal}
  td.bloque .dur-chica{font-family:"IBM Plex Mono",monospace;
    color:var(--baja);margin-left:7px}
}
tr.tanda td{color:var(--baja);background:color-mix(in srgb,var(--panel-alto) 60%,transparent)}
tr.tanda td.bloque{font-style:italic}
td.bloque b{font-family:Archivo,sans-serif;font-weight:600;font-size:15px}
td.bloque .n{font-family:"IBM Plex Mono",monospace;font-size:12px;
  color:var(--acento);margin-right:7px}
td.num{font-family:"IBM Plex Mono",monospace;text-align:right;
  font-variant-numeric:tabular-nums;white-space:nowrap}
tr.total td{font-weight:600;background:var(--panel-alto)}
@media (max-width:620px){
  table.datos,table.datos tbody,table.datos tr,table.datos td{display:block;
    width:auto}
  table.datos{min-width:0}
  table.datos thead{display:none}
  table.datos tr{padding:12px 16px;border-bottom:1px solid var(--linea)}
  table.datos tr:last-child{border-bottom:none}
  table.datos td{display:flex;gap:10px;align-items:baseline;padding:2px 0;
    border:none;text-align:left}
  table.datos td:empty{display:none}
  table.datos td::before{content:attr(data-et);flex:0 0 88px;
    font-family:Archivo,sans-serif;font-size:11px;font-weight:600;
    letter-spacing:.12em;text-transform:uppercase;color:var(--baja)}
  table.datos td.num{justify-content:flex-start}
}

/* numeros grandes */
.tarjetas{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(168px,1fr))}
.tarjeta{padding:15px 16px;border:1px solid var(--linea);border-radius:12px;
  background:var(--panel)}
.tarjeta .et{margin-bottom:7px}
.tarjeta .dato{font-family:Archivo,sans-serif;font-weight:700;
  font-size:clamp(24px,4.6vw,31px);line-height:1;letter-spacing:-.02em;
  font-variant-numeric:tabular-nums}
.tarjeta .pie{font-size:13px;color:var(--media);margin-top:7px}
.tarjeta.pinta .dato{color:var(--acento)}

/* aviso */
.aviso{display:flex;gap:12px;padding:15px 16px;border-radius:12px;
  background:var(--panel);border:1px solid var(--linea);
  border-left:3px solid var(--alerta)}
.aviso.bien{border-left-color:var(--ok)}
.aviso .cuerpo{min-width:0}
.aviso h3{margin-bottom:5px}
.aviso p{font-size:14.5px;color:var(--media)}

/* formulario de ideas y de carga */
form{display:grid;gap:11px;padding:16px;border:1px solid var(--linea);
  border-radius:12px;background:var(--panel)}
.campos{display:grid;gap:11px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))}
label{display:grid;gap:5px;min-width:0}
label>span{font-family:Archivo,sans-serif;font-size:11px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;color:var(--baja)}
input,select,textarea{font:inherit;font-size:15px;color:var(--tinta);
  background:var(--panel-alto);border:1px solid var(--linea);border-radius:9px;
  padding:9px 11px;width:100%;min-width:0}
textarea{min-height:88px;resize:vertical;line-height:1.5}
input:focus-visible,select:focus-visible,textarea:focus-visible,
button:focus-visible,a:focus-visible{outline:2px solid var(--acento);
  outline-offset:2px}
button{font-family:Archivo,sans-serif;font-size:14.5px;font-weight:600;
  color:var(--sobre-acento);background:var(--acento);border:none;
  border-radius:9px;padding:10px 17px;cursor:pointer;justify-self:start}
button:hover{filter:brightness(1.08)}
button.suave{background:transparent;color:var(--media);
  border:1px solid var(--linea)}
button.suave:hover{color:var(--tinta);border-color:var(--acento);filter:none}
button[disabled]{opacity:.5;cursor:default;filter:none}
.dicho{font-size:14px;color:var(--media);min-height:1.3em}

/* lista de ideas */
.ideas{display:grid;gap:10px}
.idea{padding:14px 16px;border:1px solid var(--linea);border-radius:12px;
  background:var(--panel)}
.idea .arriba{display:flex;gap:9px;align-items:baseline;flex-wrap:wrap;
  margin-bottom:6px}
.idea .quien{font-family:Archivo,sans-serif;font-weight:600;font-size:14px}
.idea .cuando,.idea .donde{font-size:12.5px;color:var(--baja);
  font-family:"IBM Plex Mono",monospace}
.idea .donde{color:var(--acento)}
.idea .texto{white-space:pre-wrap;font-size:15px}
.vacio{padding:22px 16px;border:1px dashed var(--linea);border-radius:12px;
  text-align:center;color:var(--media);font-size:14.5px}

footer{margin-top:44px;padding-top:20px;border-top:1px solid var(--linea);
  display:flex;gap:14px;flex-wrap:wrap;align-items:baseline;
  font-size:13px;color:var(--baja)}
footer .oro{color:__ORO__;font-weight:600;font-family:Archivo,sans-serif}
@media (prefers-reduced-motion:reduce){*{transition:none!important;
  animation:none!important}}
"""


def cabeza(titulo, slug=None):
    """El <title>, las fuentes y el CSS con el acento del programa."""
    if slug:
        claro, oscuro = W.PROG[slug]["acento"], W.SOBRE_NEGRO[slug]
    else:
        claro, oscuro = "#1D4FA8", W.NEXO_AZUL
    tk = TOKENS % {"claro": claro, "oscuro_no": oscuro}
    return ("<title>%s</title>\n%s\n<style>\n%s%s</style>\n"
            % (esc(titulo), FUENTES, tk, CSS.replace("__ORO__", W.NEXO_ORO)))


def barra(quien, acento_en, secciones):
    # Rutas relativas a proposito: el artifact solo sirve lo que se publica
    # al lado de la pagina. Un <img> a otro dominio queda bloqueado y sin aviso.
    logos = '<img src="marca/nexo.jpg" alt="Nexo Studios">'
    if acento_en:
        logos += '<img src="marca/%s-logo.jpg" alt="">' % acento_en
    logos = '<div class="chip">%s</div>' % logos
    nav = "".join('<a href="#%s">%s</a>' % (i, esc(t)) for i, t in secciones)
    return ('<header class="barra"><div class="dentro">%s<div class="sep"></div>'
            '<div class="quien">%s</div><nav>%s</nav></div></header>\n'
            % (logos, quien, nav))


def pie(donde):
    return ('<footer><span class="oro">NEXO STUDIOS</span>'
            '<span>%s · %s</span>'
            '<span>Uso interno. Para imprimir un documento se abre en el Drive '
            'y se usa Compartir y exportar → Imprimir.</span></footer>\n'
            % (esc(W.TEMPORADA), esc(donde)))


# ------------------------------------------------------------- la escaleta

def _dur(t):
    """\"33'\" -> 33. Las duraciones vienen escritas con el apóstrofo."""
    m = re.search(r"\d+", t or "")
    return int(m.group()) if m else 0


def tabla_escaleta(titulo, desde, bloques):
    """La escaleta de un dia con el reloj corrido, como la lee el piso."""
    reloj = W.D.minutos(desde)
    filas, total = [], 0
    for n, bloque, dur, que in bloques:
        d = _dur(dur)
        hora = "%02d:%02d" % (reloj // 60 % 24, reloj % 60)
        tanda = not n
        filas.append(
            '<tr%s><td class="hora">%s</td><td class="bloque">%s<b>%s</b>'
            '<span class="chica">%s<span class="dur-chica">%s</span></span>'
            '</td><td class="dur">%s</td><td class="desc">%s</td></tr>'
            % (' class="tanda"' if tanda else "", hora,
               '' if tanda else '<span class="n">%s</span>' % esc(n),
               esc(bloque), esc(que), esc(dur), esc(dur), esc(que)))
        reloj += d
        total += d
    fin = ("24:00" if reloj % (24 * 60) == 0 and reloj > W.D.minutos(desde)
           else "%02d:%02d" % (reloj // 60 % 24, reloj % 60))
    filas.append('<tr class="total"><td class="hora">%s</td>'
                 '<td class="bloque"><b>Fin</b>'
                 '<span class="chica">Al aire, exacto.</span></td>'
                 '<td class="dur">%d\'</td>'
                 '<td class="desc">Al aire, exacto.</td></tr>' % (fin, total))
    return ('<div class="envuelve"><table><caption>%s <i>· %s a %s</i></caption>'
            '<thead><tr><th>Hora</th><th>Bloque</th><th class="dur">Dura</th>'
            '<th class="desc">Qué es</th></tr></thead><tbody>%s</tbody>'
            '</table></div>'
            % (esc(titulo), esc(desde), fin, "".join(filas)))


# ------------------------------------------------- la pagina de un programa

def pagina_programa(slug, docs):
    p = W.PROG[slug]
    dp = docs[slug]
    secciones = [("empezar", "Empezar"), ("semana", "La semana"),
                 ("material", "Material"), ("pauta", "Pauta"),
                 ("ideas", "Ideas")]
    o = []
    o.append(cabeza("%s · Producción" % p["nombre"], slug))
    o.append(barra('<i>%s</i>' % esc(p["corto"]), slug, secciones))
    o.append('<div class="hoja">')

    # portada
    franjas = "".join(
        '<div class="franja"><b>%s</b><span class="mono">%s a %s</span></div>'
        % (esc(d), esc(a), esc(b)) for d, a, b in W.franjas(slug))
    o.append('<div class="tapa"><p class="et">%s · producción interna</p>'
             '<h1>%s</h1><p class="bajada">%s</p><p class="que">%s</p>'
             '<div class="franjas">%s</div></div>'
             % (esc(W.TEMPORADA), esc(p["nombre"]), esc(p["bajada"]),
                esc(p["que_es"]), franjas))

    # los tres accesos
    o.append('<section id="empezar"><div class="titulo"><h2>Empezá por acá</h2>'
             '<p>Los tres documentos que contestan casi todo. Se abren en el '
             'Drive y desde el celular se imprimen igual.</p></div>'
             '<div class="accesos">')
    for i, (rotulo, carpeta, para) in enumerate(W.ENTRADAS, 1):
        titulo, did = dp[carpeta][0]
        o.append('<a class="acceso" href="%s" target="_blank" rel="noopener">'
                 '<span class="n">0%d</span><h3>%s</h3><p>%s</p>'
                 '<span class="abrir">%s →</span></a>'
                 % (atr(W.DOC % did), i, esc(rotulo), esc(para), esc(carpeta)))
    o.append('</div></section>')

    # la escaleta de cada dia
    o.append('<section id="semana"><div class="titulo"><h2>La escaleta</h2>'
             '<p>Los horarios son los reales de aire. Si un bloque se estira, '
             'se recorta del siguiente.</p></div>')
    for titulo, desde, bloques in p["escaletas"]:
        o.append(tabla_escaleta(titulo, desde, bloques))
    if p.get("nota"):
        o.append('<div class="aviso bien" style="margin-top:12px">'
                 '<div class="cuerpo"><h3>Lo que no hay que perder de vista</h3>'
                 '<p>%s</p></div></div>' % esc(p["nota"]))

    # la semana de produccion
    o.append('<div style="height:26px"></div><div class="titulo">'
             '<h2>La semana de producción</h2><p>Con la hora límite de cada '
             'cosa. Lo que no está a esa hora, no entra.</p></div>'
             '<div class="filas">')
    for dia, que, cuando in p["semana"]:
        o.append('<div class="fila"><div class="izq"><b class="et" '
                 'style="color:var(--acento)">%s</b></div><div class="der">'
                 '<p style="color:var(--tinta);font-size:15px">%s</p>'
                 '<p class="mono chico" style="margin-top:3px">%s</p>'
                 '</div></div>' % (esc(dia), esc(que), esc(cuando)))
    o.append('</div>')

    # todo el material
    o.append('</section><section id="material"><div class="titulo">'
             '<h2>Todo el material</h2><p>Las ocho carpetas del programa en el '
             'Drive, con lo que hay adentro de cada una.</p></div>')
    for carpeta in ["1 · Formato", "2 · Guiones", "3 · Para técnica",
                    "4 · Gráficas", "5 · Invitados", "6 · Emisiones",
                    "7 · Redes", "8 · Administración"]:
        lista = dp.get(carpeta, [])
        cid = W.id_de_carpeta(slug, carpeta)
        n, nombre = carpeta.split(" · ", 1)
        o.append('<div class="grupo"><div class="cab"><h3><span>%s</span>%s</h3>'
                 '<p>%s</p></div>' % (esc(n), esc(nombre),
                                      esc(W.CARPETAS[carpeta])))
        for titulo, did in lista:
            o.append('<a class="doc" href="%s" target="_blank" rel="noopener">'
                     '<span class="marca"></span><span class="t">%s</span>'
                     '<span class="flecha">→</span></a>'
                     % (atr(W.DOC % did), esc(titulo)))
        if cid:
            o.append('<a class="vercarpeta" href="%s" target="_blank" '
                     'rel="noopener">Abrir la carpeta en el Drive →</a>'
                     % atr(W.CARPETA % cid))
        o.append('</div>')

    # el numero del programa
    num = W.numero(slug)
    o.append('</section><section id="pauta"><div class="titulo">'
             '<h2>Si salís a conseguir pauta</h2><p>El modelo es simple: un kit '
             'de marca se vende a %s por mes, y eso es exactamente lo que cubre '
             'la parte de un integrante.</p></div><div class="tarjetas">'
             % W.plata(num["kit"]))
    tarjetas = [("En cámara", str(num["integrantes"]),
                 "integrantes que cubre el modelo", False),
                ("Kits que hacen falta", str(num["kits"]),
                 "uno por integrante", True),
                ("Lo que cubre por mes", W.plata(num["ingreso"]),
                 "con los kits vendidos", False)]
    for et, dato, p2, pinta in tarjetas:
        o.append('<div class="tarjeta%s"><p class="et">%s</p>'
                 '<p class="dato">%s</p><p class="pie">%s</p></div>'
                 % (" pinta" if pinta else "", esc(et), esc(dato), esc(p2)))
    o.append('</div>')
    if num["aparte"]:
        o.append('<div class="aviso" style="margin-top:12px"><div class="cuerpo">'
                 '<h3>Este programa no entra en la cuenta por integrante</h3>'
                 '<p>Los cinco chicos no son socios que cubren un costo: son '
                 'menores con autorización de sus familias, y no se les pide '
                 'que consigan un anunciante, ni a ellos ni a sus padres. El '
                 'único integrante que cuenta es el adulto moderador. El resto '
                 'se cubre con el naming del ciclo y las acciones educativas, '
                 'que es donde este formato tiene el ticket más alto de la '
                 'grilla.</p></div></div>')
    o.append('<div style="height:12px"></div><div class="filas">')
    for nombre, precio, que in num["escalones"]:
        o.append('<div class="fila"><div class="izq"><b class="mono" '
                 'style="color:var(--acento);font-size:14px">%s</b></div>'
                 '<div class="der"><h3>%s</h3><p>%s</p></div></div>'
                 % (esc(W.plata(precio)), esc(nombre), esc(que)))
    o.append('</div><p class="chico media" style="margin-top:10px">Qué incluye '
             'cada kit y a qué rubros conviene ir está en el documento de '
             '8 · Administración, acá arriba.</p>')

    # lo que falta
    if p.get("falta"):
        o.append('<div style="height:26px"></div><div class="titulo">'
                 '<h2>Lo que falta definir</h2><p>Si podés cerrar alguno de '
                 'estos, decilo abajo.</p></div><div class="filas">')
        for i, que in enumerate(p["falta"], 1):
            o.append('<div class="fila"><div class="izq"><b class="mono" '
                     'style="color:var(--acento)">%02d</b></div>'
                     '<div class="der"><p style="color:var(--tinta);'
                     'font-size:15px">%s</p></div></div>' % (i, esc(que)))
        o.append('</div>')

    # ideas
    bloques = sorted({b[1] for _, _, bl in p["escaletas"] for b in bl if b[0]})
    opciones = "".join('<option value="%s">%s</option>' % (atr(b), esc(b))
                       for b in bloques)
    o.append('</section>' + seccion_ideas(p["corto"], opciones))
    o.append('</div>')
    o.append(pie(p["carpeta"]))
    o.append(js_ideas(slug, p["corto"]))
    return "".join(o)


def seccion_ideas(programa, opciones):
    return """<section id="ideas"><div class="titulo"><h2>Dejar una idea</h2>
<p>Para un bloque, un invitado, un clip, lo que sea. Lo lee producción general
y queda escrito acá, no se pierde en un chat.</p></div>
<form id="f-idea" hidden>
  <div class="campos">
    <label><span>Para qué bloque</span><select id="i-bloque">
      <option value="">Todo el programa</option>%s</select></label>
    <label><span>Qué tipo de idea</span><select id="i-tipo">
      <option>Contenido de un bloque</option><option>Invitado o número</option>
      <option>Redes y clips</option><option>Un auspiciante posible</option>
      <option>Otra cosa</option></select></label>
  </div>
  <label><span>La idea</span><textarea id="i-texto" maxlength="1200"
    placeholder="Concreta es mejor que completa. Dos renglones alcanzan."
    required></textarea></label>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <button type="submit" id="i-enviar">Dejar la idea</button>
    <span class="dicho" id="i-dicho"></span>
  </div>
</form>
<div class="aviso" id="i-sin" hidden><div class="cuerpo">
  <h3>Para dejar una idea acá hace falta entrar con tu cuenta</h3>
  <p>Esta página guarda las ideas asociadas a quien las escribe, así que
  necesita que estés identificado. Si no podés, mandala por WhatsApp a
  producción general y la cargo yo.</p></div></div>
<div style="height:18px"></div>
<p class="et">Las ideas de %s</p>
<div style="height:10px"></div>
<div class="ideas" id="i-lista"><div class="vacio">Todavía no hay ninguna.
La primera que entre aparece acá sola, sin recargar nada.</div></div>
</section>
""" % (opciones, esc(programa))


def js_ideas(slug, programa):
    return """<script>
(function(){
  var lista=document.getElementById('i-lista'),
      form=document.getElementById('f-idea'),
      sin=document.getElementById('i-sin'),
      dicho=document.getElementById('i-dicho'),
      boton=document.getElementById('i-enviar'),
      PROGRAMA=%(prog)s, db=null, user=null, filas=[], nombres={};

  function fecha(iso){
    var d=new Date(iso); if(isNaN(d)) return '';
    return String(d.getDate()).padStart(2,'0')+'/'+
           String(d.getMonth()+1).padStart(2,'0')+' '+
           String(d.getHours()).padStart(2,'0')+':'+
           String(d.getMinutes()).padStart(2,'0');
  }
  function pintar(){
    if(!filas.length){
      lista.innerHTML='<div class="vacio">Todav\\u00eda no hay ninguna. '+
        'La primera que entre aparece ac\\u00e1 sola, sin recargar nada.</div>';
      return;
    }
    lista.textContent='';
    filas.forEach(function(f){
      var caja=document.createElement('div'); caja.className='idea';
      var arriba=document.createElement('div'); arriba.className='arriba';
      var quien=document.createElement('span'); quien.className='quien';
      quien.textContent=nombres[f.autor]||'Alguien del equipo';
      arriba.appendChild(quien);
      if(f.bloque){var d=document.createElement('span'); d.className='donde';
        d.textContent=f.bloque; arriba.appendChild(d);}
      if(f.tipo){var t=document.createElement('span'); t.className='cuando';
        t.textContent=f.tipo; arriba.appendChild(t);}
      if(f.creado){var c=document.createElement('span'); c.className='cuando';
        c.textContent=fecha(f.creado); arriba.appendChild(c);}
      var texto=document.createElement('p'); texto.className='texto';
      texto.textContent=f.texto||'';
      caja.appendChild(arriba); caja.appendChild(texto);
      lista.appendChild(caja);
    });
  }
  async function poner_nombres(){
    if(!user||!user.profiles) return;
    var ids=filas.map(function(f){return f.autor}).filter(Boolean);
    if(!ids.length) return;
    try{
      var ps=await user.profiles(Array.from(new Set(ids)));
      Object.keys(ps||{}).forEach(function(id){
        nombres[id]=(ps[id]&&ps[id].name)||'Alguien del equipo';
      });
      pintar();
    }catch(e){}
  }

  (async function(){
    db = await (window.claude&&window.claude.use ? window.claude.use('db') : null);
    user = await (window.claude&&window.claude.use ? window.claude.use('user') : null);
    if(!db){ sin.hidden=false; return; }
    form.hidden=false;
    try{
      db.collection('ideas').orderBy('creado','desc').limit(80)
        .onSnapshot(function(snap){
          filas=(snap.docs||[]).map(function(d){return d.data()});
          pintar(); poner_nombres();
        }, function(){ /* sin permiso de lectura: el formulario sigue */ });
    }catch(e){}
  })();

  form.addEventListener('submit', async function(ev){
    ev.preventDefault();
    var texto=document.getElementById('i-texto').value.trim();
    if(!texto){ dicho.textContent='Escribí la idea primero.'; return; }
    if(!db){ dicho.textContent='No se puede guardar desde esta vista.'; return; }
    boton.disabled=true; dicho.textContent='Guardando\\u2026';
    var yo=null; try{ yo = user ? await user.id() : null; }catch(e){}
    var id=(crypto.randomUUID?crypto.randomUUID():String(Date.now()));
    try{
      await db.collection('ideas').doc(id).set({
        texto:texto, autor:yo,
        bloque:document.getElementById('i-bloque').value||'',
        tipo:document.getElementById('i-tipo').value||'',
        programa:PROGRAMA, creado:new Date().toISOString()
      });
      document.getElementById('i-texto').value='';
      dicho.textContent='Queda anotada. Gracias.';
    }catch(e){
      dicho.textContent=(e&&e.code==='not_granted')
        ? 'Tu acceso a esta p\\u00e1gina es de lectura. Ped\\u00ed que te lo cambien a colaborador.'
        : 'No se pudo guardar. Prob\\u00e1 de nuevo en un rato.';
    }
    boton.disabled=false;
  });
})();
</script>
""" % {"prog": _js(programa)}


def _js(t):
    """Un string de Python a un literal de JavaScript, sin sorpresas."""
    return ('"' + str(t).replace("\\", "\\\\").replace('"', '\\"')
            .replace("<", "\\u003c").replace("\n", "\\n") + '"')


def main():
    os.makedirs(SALIDA, exist_ok=True)
    docs = W.documentos()
    escritos = []
    for slug in W.ORDEN:
        ruta = os.path.join(SALIDA, "%s.html" % slug)
        with open(ruta, "w", encoding="utf-8") as f:
            f.write(pagina_programa(slug, docs))
        escritos.append(ruta)
    for ruta in escritos:
        print("  %-34s %6.1f KB" % (os.path.basename(ruta),
                                    os.path.getsize(ruta) / 1024.0))
    print("%d páginas de programa en salida/" % len(escritos))


if __name__ == "__main__":
    main()
