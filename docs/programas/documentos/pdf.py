# -*- coding: utf-8 -*-
"""Convierte cada documento del Drive en un PDF A4 listo para imprimir.

Toma el texto de `fuente/`, lo interpreta (titulos, campos para completar,
casilleros, vinetas, escaletas) y arma un PDF con el logo de Nexo y el del
programa. El documento de Drive sigue siendo el editable; esto es el impreso
que va al lado.

Dos pasadas de Chromium por documento. La primera mide cuanto ocupa cada
bloque; la segunda imprime con las paginas ya repartidas y numeradas. Sin
medir no hay forma de saber donde cortar, y `overflow:hidden` recorta en
silencio.

    python3 pdf.py            todos
    python3 pdf.py tercer     solo los que coincidan
"""
import base64
import html as _html
import json
import os
import re
import subprocess
import sys

import mapa

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTE = os.path.join(AQUI, "fuente")
SALIDA = os.path.join(AQUI, "pdf")
MARCA = os.path.join(AQUI, "marca")
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
TMP = os.environ.get("TMPDIR", "/tmp")

ANCHO, ALTO = 794, 1123
MARGEN = 54
CAJA = ANCHO - MARGEN * 2          # 686 px utiles de ancho
CORNISA = 58                       # alto fijo del encabezado de la pagina 2 y +
ARRIBA = 46                        # padding superior de la pagina
AIRE = 22                          # respiro entre el encabezado y el texto
PIE_ABAJO = 30                     # a que altura del borde se apoya el pie
GUARDA = 8                         # colchon: mas vale una linea de menos

MINIMO_PT = 12.0                   # piso absoluto: cornisa y pie
MINIMO_CUERPO_PT = 13.0            # piso del texto que se lee seguido

TEMPORADA = "Primera temporada 2026"


# --------------------------------------------------------------------------
# lectura del texto
# --------------------------------------------------------------------------

def limpiar(c):
    """Deshace el escapado y el doble salto que mete el conector."""
    c = re.sub(r"\\([^0-9A-Za-zÀ-ÿ\s])", r"\1", c)
    c = c.replace("\u00f0", "")                      # emoji que llego roto
    return re.sub(r"[ \t]+\n", "\n", c)


ESCALETA = re.compile(r"^\d{1,2}:\d{2}\s*[·•]")
REGLA = re.compile(r"^[\s]*[─━—_=-]{8,}[\s]*$")
GUIONES = re.compile(r"^-{8,}\s*")
CAJITA = re.compile(r"^\[\s*[xX]?\s*\]\s*(.*)$")
ROTULO = re.compile(r"^([A-ZÁÉÍÓÚÑÜ][^:]{1,38}):\s*$")
PUNTOS = re.compile(r"\.{4,}")
SOLO_PUNTOS = re.compile(r"^[.\s]*\.{6,}[.\s]*$")
KV = re.compile(r"^([A-ZÁÉÍÓÚÑÜ0-9][^:]{0,40}):\s(.+)$")
VINETA = re.compile(r"^\s*[-•*]\s+(.*)$")
NUMERADA = re.compile(r"^\s*(\d{1,2})[.)]\s+(.*)$")


def es_mayus(l):
    """Casi todo en mayuscula alcanza.

    Pedir que sea todo deja afuera titulos como "MIERCOLES · 20:00 a 22:00 —
    EL DIA DEL SHOW", donde la unica minuscula es la "a" de la hora.
    """
    letras = [c for c in l if c.isalpha()]
    if len(letras) < 3:
        return False
    altas = sum(1 for c in letras if c.isupper())
    return altas / float(len(letras)) >= 0.85


def analizar(texto):
    """Texto plano -> lista de bloques con tipo.

    Las lineas vienen cortadas a mano a unos 78 caracteres. Hay que volver a
    unirlas o el PDF queda con el borde derecho dentado y renglones sueltos.
    Una linea continua a la anterior si empieza en minuscula, si la anterior
    llego casi hasta el margen y si la anterior no cerro con punto. Las tres
    condiciones juntas: con menos se pegan cosas que son listas.

    Una casilla tambien puede venir cortada, y entonces la que sigue es parte
    de la casilla y no un parrafo aparte. Ahi si hace falta pedir la
    minuscula: abajo de una casilla lo que suele venir es la explicacion, y
    esa empieza con mayuscula. Tampoco se une si la casilla lleva campos para
    completar, porque el texto ya esta repartido en celdas y pegarle una
    linea al final lo desarma.
    """
    lineas = [l.rstrip() for l in texto.split("\n")]
    prosa = [len(l) for l in lineas
             if l.strip() and not PUNTOS.search(l) and "□" not in l
             and not REGLA.match(l)]
    ancho = max(prosa) if prosa else 78
    corte = ancho - 26

    bloques = []
    for cruda in lineas:
        l = cruda.strip()
        if not l:
            continue

        # continuacion de la linea anterior
        if bloques:
            ant = bloques[-1]
            previa = ant.get("crudo", "")
            estructural = (es_mayus(l) or VINETA.match(l) or NUMERADA.match(l)
                           or KV.match(l) or PUNTOS.search(l) or "□" in l
                           or ESCALETA.match(l) or REGLA.match(l))
            sigue_casilla = (ant["tipo"] == "casilla" and "partes" not in ant
                             and l[:1].islower())
            # Los dos puntos cierran un rotulo ("Archivo:") o presentan un
            # ejemplo en su propio renglon ("sin acentos:" y abajo
            # "placa-bloque-nostalgia.psd"), pero tambien abren una frase que
            # sigue en el renglon de abajo. La frase que sigue es prosa: va en
            # minuscula y tiene mas de una palabra. El ejemplo es un nombre
            # de archivo, una sola palabra.
            sigue_frase = (ant["tipo"] in ("p", "vineta", "num")
                           and l[:1].islower() and " " in l)
            cierra = previa[-1:] in (".", "!", "?", "…") or (
                previa[-1:] == ":" and not sigue_frase)
            if ((ant["tipo"] in ("p", "kv", "vineta", "num") or sigue_casilla)
                    and not estructural
                    and len(previa) >= corte
                    and not cierra):
                # renglon cortado a mano: la anterior llego al margen y no
                # cerro. Pedir ademas que empiece en minuscula dejaba sueltas
                # las que siguen con un nombre propio o una sigla.
                ant["texto"] = ant["texto"] + " " + l
                ant["crudo"] = cruda
                continue

        # una linea que son solo puntos es el renglon para completar de la
        # etiqueta que quedo arriba: van juntos o el PDF muestra una raya suelta
        if SOLO_PUNTOS.match(l):
            if bloques and bloques[-1]["tipo"] in ("p", "kv"):
                ant = bloques.pop()
                etiqueta = (ant["clave"] + ": " + ant["texto"]
                            if ant["tipo"] == "kv" else ant["texto"])
                bloques.append({"tipo": "campos", "crudo": cruda,
                                "partes": [(etiqueta, len(l.replace(" ", "")))]})
            else:
                bloques.append({"tipo": "campos", "crudo": cruda,
                                "partes": [("", len(l.replace(" ", "")))]})
            continue

        # una raya de guiones pegada adelante de la linea: en el documento
        # separaba la cabecera de una tabla, aca sobra
        if GUIONES.match(l) and not REGLA.match(l):
            l = GUIONES.sub("", l).strip()
            if not l:
                continue

        # casillero viejo, escrito a mano con corchetes
        m = CAJITA.match(l)
        if m:
            resto = m.group(1).strip()
            b = {"tipo": "casilla", "texto": resto, "crudo": cruda}
            if PUNTOS.search(resto):
                b["partes"] = partir_campos(resto)
            bloques.append(b)
            continue

        # "PROGRAMA:" solo, en mayuscula: no es un titulo de seccion, es un
        # campo esperando que alguien lo complete
        if es_mayus(l) and ROTULO.match(l):
            bloques.append({"tipo": "campos", "crudo": cruda,
                            "partes": [(ROTULO.match(l).group(1) + ":", 24)]})
            continue

        if REGLA.match(l):
            bloques.append({"tipo": "regla", "crudo": cruda})
        elif ESCALETA.match(l):
            bloques.append({"tipo": "escaleta", "texto": l, "crudo": cruda})
        elif l.startswith("□"):
            resto = l.lstrip("□ ").strip()
            b = {"tipo": "casilla", "texto": resto, "crudo": cruda}
            if PUNTOS.search(resto):
                b["partes"] = partir_campos(resto)
            bloques.append(b)
        elif PUNTOS.search(l):
            bloques.append({"tipo": "campos", "partes": partir_campos(l),
                            "crudo": cruda})
        elif "□" in l:
            bloques.append({"tipo": "opciones", "texto": l, "crudo": cruda})
        elif es_mayus(l) and len(l) < 92:
            nivel = "h3" if (len(l) > 34 and re.search(r"[·—]", l)) else "h2"
            bloques.append({"tipo": nivel, "texto": l, "crudo": cruda})
        elif VINETA.match(l):
            bloques.append({"tipo": "vineta", "texto": VINETA.match(l).group(1),
                            "crudo": cruda})
        elif NUMERADA.match(l):
            m = NUMERADA.match(l)
            bloques.append({"tipo": "num", "numero": m.group(1),
                            "texto": m.group(2), "crudo": cruda})
        elif KV.match(l):
            m = KV.match(l)
            bloques.append({"tipo": "kv", "clave": m.group(1),
                            "texto": m.group(2), "crudo": cruda})
        else:
            bloques.append({"tipo": "p", "texto": l, "crudo": cruda})

    return partir_largos(limpiar_reglas(bloques))


def limpiar_reglas(bloques):
    """Saca las rayas de guiones que enmarcaban las filas de escaleta.

    En el documento la raya era lo unico que separaba un bloque del otro.
    Aca la fila ya es una barra de color, asi que la raya al lado sobra.
    """
    salida = []
    for i, b in enumerate(bloques):
        if b["tipo"] == "regla":
            sig = bloques[i + 1]["tipo"] if i + 1 < len(bloques) else None
            ant = salida[-1]["tipo"] if salida else None
            if sig == "escaleta" or ant == "escaleta" or sig is None or ant is None:
                continue
        salida.append(b)
    return salida


def partir_campos(l):
    """'Archivo: ..... Cargado: ...' -> [('Archivo:', 5), ('Cargado:', 3)].

    El numero de puntos de cada hueco se conserva como proporcion, asi el
    campo impreso queda del mismo largo relativo que en el documento.
    """
    trozos = PUNTOS.split(l)
    huecos = PUNTOS.findall(l)
    partes = []
    for i, hueco in enumerate(huecos):
        partes.append((trozos[i].strip(), len(hueco)))
    cola = trozos[len(huecos)].strip()
    if cola:
        partes.append((cola, 0))
    return partes


def partir_largos(bloques):
    """Ningun parrafo puede ser mas alto que una pagina entera."""
    salida = []
    for b in bloques:
        t = b.get("texto", "")
        if b["tipo"] != "p" or len(t) <= 1100:
            salida.append(b)
            continue
        frases = re.split(r"(?<=[.!?])\s+", t)
        actual = ""
        for f in frases:
            if actual and len(actual) + len(f) > 900:
                salida.append({"tipo": "p", "texto": actual.strip(), "crudo": ""})
                actual = f
            else:
                actual = (actual + " " + f).strip()
        if actual:
            salida.append({"tipo": "p", "texto": actual, "crudo": ""})
    return salida


# --------------------------------------------------------------------------
# html
# --------------------------------------------------------------------------

def esc(t):
    return _html.escape(t, quote=False)


def partir_titulo(titulo, programa):
    """"Tercer Tiempo · biblia de formato" -> ("Tercer Tiempo", "Biblia de formato").

    El nombre del programa ya esta en el logo y en el volante; repetirlo
    dentro del titulo grande solo lo hace mas largo y lo parte en dos lineas.
    """
    for sep in (" · ", " — ", " - ", ": "):
        if titulo.startswith(programa + sep):
            resto = titulo[len(programa) + len(sep):].strip()
            if resto:
                return programa, resto[0].upper() + resto[1:]
    return programa, titulo


_CACHE = {}


def logo(nombre):
    if nombre in _CACHE:
        return _CACHE[nombre]
    ruta = os.path.join(MARCA, nombre)
    if not os.path.exists(ruta):
        _CACHE[nombre] = ""
    else:
        datos = base64.b64encode(open(ruta, "rb").read()).decode("ascii")
        _CACHE[nombre] = "data:image/jpeg;base64," + datos
    return _CACHE[nombre]


def marcar_opciones(t):
    return esc(t).replace("□", '<span class="cuadro"></span>')


def celdas(partes, clase="et"):
    """Un renglon de campos para completar.

    Cuando el renglon tiene un solo hueco, se estira hasta el margen. Cuando
    tiene varios (una fecha, tres nombres) se quedan del ancho que tenian en
    el documento: si no, un ....../....../...... termina con los dos barras
    separadas por media pagina.
    """
    huecos = sum(1 for _, p in partes if p)
    out = []
    for etiqueta, puntos in partes:
        if etiqueta:
            out.append('<span class="%s">%s</span>' % (clase, esc(etiqueta)))
        if puntos:
            estilo = ("flex:%d" % puntos if huecos == 1
                      else "flex:0 0 %dpx" % (puntos * 9))
            out.append('<span class="ln" style="%s"></span>' % estilo)
    return "".join(out)


def pintar(b):
    t = b["tipo"]
    if t == "h2":
        return '<h2>%s</h2>' % esc(b["texto"])
    if t == "h3":
        return '<h3>%s</h3>' % esc(b["texto"])
    if t == "escaleta":
        return '<div class="escaleta">%s</div>' % esc(b["texto"])
    if t == "regla":
        return '<div class="regla"></div>'
    if t == "casilla":
        if "partes" in b:
            return ('<div class="casilla campos"><span class="cuadro"></span>%s</div>'
                    % celdas(b["partes"], "etf"))
        return ('<div class="casilla"><span class="cuadro"></span>'
                '<span>%s</span></div>' % esc(b["texto"]))
    if t == "opciones":
        return '<p class="opciones">%s</p>' % marcar_opciones(b["texto"])
    if t == "campos":
        return '<div class="campos">%s</div>' % celdas(b["partes"])
    if t == "vineta":
        return '<div class="vineta"><span class="pu"></span><span>%s</span></div>' % esc(b["texto"])
    if t == "num":
        return ('<div class="num"><span class="nu">%s</span><span>%s</span></div>'
                % (esc(b["numero"]), esc(b["texto"])))
    if t == "kv":
        return ('<p class="kv"><b>%s:</b> %s</p>'
                % (esc(b["clave"]), esc(b["texto"])))
    return '<p>%s</p>' % esc(b["texto"])


def css(acento):
    return """
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#fff;color:#14181F;
  font-family:"Source Sans 3","Segoe UI",Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased}
.page{width:%(A)dpx;height:%(H)dpx;position:relative;overflow:hidden;
  background:#fff;page-break-after:always;padding:46px %(M)dpx 0}
.page:last-child{page-break-after:auto}

.banda{display:flex;align-items:flex-end;justify-content:space-between;
  gap:22px;padding-bottom:20px;border-bottom:3px solid %(AC)s}
.sello{background:#000;border-radius:9px;padding:13px 17px;display:block}
.sello img{display:block;height:34px;width:auto}
.sello.prog img{height:46px}
.dedonde{text-align:right;font-size:16px;line-height:1.45;color:#6B7280;
  letter-spacing:.01em}
.dedonde b{display:block;font-size:17px;color:%(AC)s;letter-spacing:.06em;
  text-transform:uppercase}

.titulo{padding:26px 0 0}
.titulo .ojo{font-size:18px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:%(AC)s;margin-bottom:9px}
.titulo h1{font-size:38px;line-height:1.14;letter-spacing:-.012em;font-weight:700}
.titulo .baja{margin-top:11px;font-size:18px;line-height:1.5;color:#4A5260}

.cornisa{display:flex;align-items:center;justify-content:space-between;
  gap:16px;padding-bottom:12px;border-bottom:2px solid %(AC)s;height:%(C)dpx}
.cornisa .izq{display:flex;align-items:center;gap:12px}
.cornisa .sello{padding:7px 10px;border-radius:6px}
.cornisa .sello img{height:20px}
.cornisa .doc{font-size:16px;color:#6B7280;text-align:right;line-height:1.35}
.cornisa .doc b{color:%(AC)s}

.cuerpo{padding-top:22px}
h2{font-size:23px;line-height:1.25;letter-spacing:.055em;font-weight:700;
  color:%(AC)s;margin:26px 0 12px;text-transform:uppercase}
.cuerpo > h2:first-child{margin-top:0}
h3{font-size:20px;line-height:1.3;letter-spacing:.03em;font-weight:700;
  color:#14181F;margin:22px 0 10px}
p{font-size:18px;line-height:1.56;margin:0 0 11px;color:#242A33}
.kv{margin:0 0 9px}
.kv b{font-weight:700;color:%(AC)s}
.vineta,.num{display:flex;gap:11px;margin:0 0 9px;font-size:18px;
  line-height:1.52;color:#242A33}
.vineta .pu{flex:none;width:7px;height:7px;border-radius:50%%;
  background:%(AC)s;margin-top:11px}
.num .nu{flex:none;min-width:26px;font-weight:700;color:%(AC)s}
.escaleta{background:%(AC)s;color:#fff;font-size:19px;font-weight:700;
  letter-spacing:.035em;padding:9px 15px;border-radius:5px;margin:20px 0 11px}
.regla{height:2px;background:#D8DDE5;margin:18px 0}
.casilla{display:flex;gap:11px;align-items:baseline;font-size:19px;
  font-weight:700;letter-spacing:.03em;margin:20px 0 9px;color:#14181F}
.casilla.campos{margin:20px 0 11px}
.casilla .etf{flex:none;white-space:nowrap;color:#14181F}
.opciones{font-size:18px;line-height:1.7;margin:0 0 10px}
.cuadro{display:inline-block;flex:none;width:15px;height:15px;
  border:2px solid %(AC)s;border-radius:3px;margin-right:5px;
  vertical-align:-1px}
.campos{display:flex;align-items:baseline;gap:9px;margin:0 0 13px;
  font-size:18px;line-height:1.5}
.campos .et{flex:none;color:#4A5260;font-weight:600;white-space:nowrap}
.campos .ln{border-bottom:1.5px dotted #97A0AE;height:1.1em}

.pie{position:absolute;left:%(M)dpx;right:%(M)dpx;bottom:30px;
  display:flex;justify-content:space-between;align-items:center;gap:14px;
  border-top:1px solid #D8DDE5;padding-top:9px;font-size:16px;color:#78818F}
.pie .ruta{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.pie .fol{flex:none;font-weight:700;color:%(AC)s}
""" % {"A": ANCHO, "H": ALTO, "M": MARGEN, "AC": acento, "C": CORNISA}


def banda(doc):
    prog = ('<span class="sello prog"><img src="%s" alt="%s"></span>'
            % (doc["logo_prog"], esc(doc["programa"]))) if doc["logo_prog"] else ""
    return """<div class="banda">
  <span class="sello"><img src="%s" alt="Nexo Studios"></span>
  %s
</div>
<div class="titulo"><div class="ojo">%s</div><h1>%s</h1>
<div class="baja">%s</div></div>""" % (
        doc["logo_nexo"], prog, esc(doc["ojo"]), esc(doc["h1"]),
        esc(doc["baja"]))


def cornisa(doc):
    return """<div class="cornisa">
  <span class="izq"><span class="sello"><img src="%s" alt="Nexo Studios"></span></span>
  <span class="doc"><b>%s</b> · %s</span>
</div>""" % (doc["logo_nexo"], esc(doc["programa"]), esc(doc["titulo"]))


def pie(doc, n, total):
    return ('<div class="pie"><span class="ruta">%s</span>'
            '<span class="fol">%d / %d</span></div>'
            % (esc(doc["ruta"] or "Programación 1er Temporada"), n, total))


def html_medir(doc, trozos):
    """Pagina de medicion: los bloques, y tambien los encabezados y el pie.

    El alto de la portada depende del largo del titulo, asi que darlo por
    fijo hace que la primera pagina se pase. Se mide, no se supone.
    """
    marcados = "".join('<div class="b" data-i="%d">%s</div>' % (i, t)
                       for i, t in enumerate(trozos))
    return """<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>medir</title><style>%s
.medidor{width:%dpx;position:relative}.b{display:block}
.medidor .pie{position:static;left:auto;right:auto;bottom:auto}</style></head>
<body>
<div class="medidor" id="portada">%s</div>
<div class="medidor" id="cornisa">%s</div>
<div class="medidor" id="pie">%s</div>
<div class="medidor cuerpo">%s</div>
<script>
window.addEventListener('load', function(){
  var r = [];
  document.querySelectorAll('.b').forEach(function(b){
    var c = b.firstElementChild, m = 0;
    if (c) { var s = getComputedStyle(c);
      m = parseFloat(s.marginTop) + parseFloat(s.marginBottom); }
    r.push(Math.ceil(b.getBoundingClientRect().height + m));
  });
  var alto = function(id){
    return Math.ceil(document.getElementById(id).getBoundingClientRect().height);
  };
  document.body.setAttribute('data-alt', JSON.stringify(r));
  document.body.setAttribute('data-cabezas', JSON.stringify(
    [alto('portada'), alto('cornisa'), alto('pie')]));
});
</script></body></html>""" % (css(doc["acento"]), CAJA, banda(doc), cornisa(doc),
                              pie(doc, 1, 1), marcados)


def html_final(doc, paginas):
    total = len(paginas)
    out = []
    for n, trozos in enumerate(paginas, 1):
        cabeza = banda(doc) if n == 1 else cornisa(doc)
        out.append('<div class="page">%s<div class="cuerpo">%s</div>%s</div>'
                   % (cabeza, "".join(trozos), pie(doc, n, total)))
    return """<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>%s</title><style>@page{size:%dpx %dpx;margin:0}%s</style></head>
<body>%s</body></html>""" % (esc(doc["titulo"]), ANCHO, ALTO,
                             css(doc["acento"]), "".join(out))


# --------------------------------------------------------------------------
# chromium
# --------------------------------------------------------------------------

def chrome(args, captura=False):
    cmd = [CHROME, "--headless", "--no-sandbox", "--disable-gpu",
           "--hide-scrollbars", "--force-device-scale-factor=1"] + args
    r = subprocess.run(cmd, capture_output=True, timeout=180)
    return r.stdout.decode("utf-8", "replace") if captura else None


def medir(doc, trozos, tmp):
    ruta = os.path.join(tmp, "medir.html")
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(html_medir(doc, trozos))
    dom = chrome(["--dump-dom", "--virtual-time-budget=2500",
                  "file://" + ruta], captura=True)
    m = re.search(r'data-alt="(\[[^"]*\])"', dom)
    if not m:
        raise RuntimeError("no se pudo medir %s" % doc["archivo"])
    alturas = json.loads(_html.unescape(m.group(1)))
    if len(alturas) != len(trozos):
        raise RuntimeError("medi %d bloques de %d en %s"
                           % (len(alturas), len(trozos), doc["archivo"]))
    c = re.search(r'data-cabezas="(\[[^"]*\])"', dom)
    if not c:
        raise RuntimeError("no se pudo medir el encabezado de %s" % doc["archivo"])
    portada, cornisa_alto, pie_alto = json.loads(_html.unescape(c.group(1)))
    fondo = ALTO - PIE_ABAJO - pie_alto - GUARDA
    caja1 = fondo - (ARRIBA + portada + AIRE)
    cajan = fondo - (ARRIBA + cornisa_alto + AIRE)
    return alturas, caja1, cajan


def repartir(bloques, trozos, alturas, caja1, cajan):
    """Reparte los bloques en paginas sin que ninguno se corte.

    Un titulo nunca queda solo al final de una pagina: si cae ultimo, se
    manda entero a la siguiente junto con lo que encabeza.
    """
    paginas, actual, alto = [], [], 0
    caja = caja1
    for i, (t, h) in enumerate(zip(trozos, alturas)):
        titulo = bloques[i]["tipo"] in ("h2", "h3", "escaleta", "casilla")
        if actual and alto + h > caja:
            paginas.append(actual)
            actual, alto, caja = [], 0, cajan
        elif (actual and titulo and alto + h + 90 > caja):
            paginas.append(actual)
            actual, alto, caja = [], 0, cajan
        actual.append(t)
        alto += h
    if actual:
        paginas.append(actual)
    return paginas


def verificar(pdf_html, tmp):
    """Comprueba en el navegador que ninguna pagina se pase de alto."""
    ruta = os.path.join(tmp, "ver.html")
    sonda = pdf_html.replace("</body>", """<script>
window.addEventListener('load', function(){
  var peor = 0, detalle = [];
  document.querySelectorAll('.page').forEach(function(p, i){
    var c = p.querySelector('.cuerpo'), f = p.querySelector('.pie');
    var fin = c.getBoundingClientRect().bottom;
    var tope = f.getBoundingClientRect().top;
    var d = Math.ceil(fin - tope);
    if (d > 0) detalle.push((i + 1) + ':' + d + ':' + (c.lastElementChild ?
      c.lastElementChild.className || c.lastElementChild.tagName : '?'));
    peor = Math.max(peor, d);
  });
  document.body.setAttribute('data-m', String(peor));
  document.body.setAttribute('data-d', detalle.join(' '));
});
</script></body>""")
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(sonda)
    dom = chrome(["--dump-dom", "--virtual-time-budget=2500",
                  "file://" + ruta], captura=True)
    m = re.search(r'data-m="(-?\d+)"', dom)
    d = re.search(r'data-d="([^"]*)"', dom)
    if d and d.group(1):
        print("      paginas que se pasan (pag:px:ultimo) -> %s" % d.group(1))
    return int(m.group(1)) if m else None


# --------------------------------------------------------------------------

def preparar(reg):
    """Del registro del indice al documento listo para maquetar."""
    slug, programa, sub, acento, ruta = mapa.ubicar(reg["parentId"])
    texto = limpiar(open(os.path.join(FUENTE, reg["archivo"]), encoding="utf-8").read())
    bloques = analizar(texto)

    # la primera linea del texto repite el titulo del documento
    titulo = reg["titulo"]
    if bloques and (bloques[0].get("texto", "").upper() == titulo.upper()
                    or bloques[0]["tipo"] in ("h2", "h3")):
        bloques.pop(0)

    ojo, h1 = partir_titulo(titulo, programa)
    doc = {"archivo": reg["archivo"], "titulo": titulo, "programa": programa,
           "acento": acento, "ruta": ruta, "ojo": ojo, "h1": h1,
           "baja": " · ".join(x for x in
                              (TEMPORADA, "Carpeta " + sub if sub else "") if x),
           "logo_nexo": logo("nexo.jpg"),
           "logo_prog": logo("%s-logo.jpg" % slug)}
    return doc, bloques


def paginar(doc, bloques, tmp):
    """Mide y reparte. Devuelve las paginas ya armadas."""
    trozos = [pintar(b) for b in bloques]
    alturas, caja1, cajan = medir(doc, trozos, tmp)
    return repartir(bloques, trozos, alturas, caja1, cajan)


def armar(reg, tmp):
    doc, bloques = preparar(reg)
    paginas = paginar(doc, bloques, tmp)
    final = html_final(doc, paginas)

    sobra = verificar(final, tmp)
    destino = os.path.join(SALIDA, doc["ruta"])
    os.makedirs(destino, exist_ok=True)
    nombre = os.path.splitext(reg["archivo"])[0] + ".pdf"
    salida = os.path.join(destino, nombre)
    fuente_html = os.path.join(tmp, "final.html")
    with open(fuente_html, "w", encoding="utf-8") as f:
        f.write(final)
    chrome(["--no-pdf-header-footer", "--print-to-pdf=" + salida,
            "--virtual-time-budget=3000", "file://" + fuente_html])
    return {"pdf": salida, "paginas": len(paginas), "sobra": sobra,
            "bytes": os.path.getsize(salida) if os.path.exists(salida) else 0,
            "ruta": doc["ruta"], "titulo": doc["titulo"]}


def main():
    filtro = sys.argv[1].lower() if len(sys.argv) > 1 else ""
    indice = json.load(open(os.path.join(FUENTE, "_indice.json"), encoding="utf-8"))
    regs = [r for r in indice if filtro in r["archivo"].lower()]
    tmp = os.path.join(TMP, "nexo-pdf")
    os.makedirs(tmp, exist_ok=True)
    os.makedirs(SALIDA, exist_ok=True)

    malos, total = [], 0
    for r in regs:
        res = armar(r, tmp)
        total += res["bytes"]
        aviso = ""
        if res["sobra"] is None:
            aviso = "  ← NO SE PUDO VERIFICAR"
            malos.append(res)
        elif res["sobra"] > 0:
            aviso = "  ← SE PASA %d px" % res["sobra"]
            malos.append(res)
        print("%-58s %2d pag %6.1f KB%s"
              % (res["titulo"][:58], res["paginas"], res["bytes"] / 1024.0, aviso))

    print("\n%d PDF · %.1f MB" % (len(regs), total / 1048576.0))
    if malos:
        print("REVISAR: %s" % ", ".join(m["titulo"] for m in malos))
        sys.exit(1)
    print("todas las paginas entran sin recortar")


# el piso de legibilidad, comprobado sobre el CSS de verdad y no de memoria
_C = css("#000000")
_cuerpos = sorted({float(x) for x in re.findall(r"font-size:([0-9.]+)px", _C)})
_chicos = [(px, round(px * 0.75, 2)) for px in _cuerpos if px * 0.75 < MINIMO_PT]
assert not _chicos, ("estos cuerpos bajan de %.0f pt impresos (px, pt): %s"
                     % (MINIMO_PT, _chicos))
assert "filter:" not in _C, "filter: obliga a rasterizar la pagina entera"
assert re.search(r"^p\{font-size:18px", _C, re.M), (
    "el cuerpo del texto corrido tiene que quedar en 18px = 13.5 pt impresos")

if __name__ == "__main__":
    main()
