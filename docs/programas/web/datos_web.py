# -*- coding: utf-8 -*-
"""De donde sale cada cosa que muestra la web interna.

No se escribe aca nada que ya exista en otro lado. La grilla, las escaletas,
la semana de produccion y lo que falta de cada programa salen de
`estructuras/datos.py`; el modelo comercial de `presentaciones/comercial.py`;
los 56 documentos de `documentos/_indice.json` cruzado con `documentos/mapa.py`.

Lo unico propio de este modulo son tres cosas: las tarifas del estudio, que
hasta ahora vivian solo dentro del texto de la grilla de servicios; el acento
de cada programa sobre negro, porque `datos.py` guarda el oscurecido para
fondo blanco y la web es oscura; y qué tres documentos abren cada pagina.

Si manana cambia un horario, un precio o un documento, cambia en su fuente y
la web se regenera. Eso es todo el punto de tenerlo asi.
"""
import importlib.util
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
PROGRAMAS_DIR = os.path.dirname(AQUI)


def _cargar(nombre, *partes):
    """Importa un modulo hermano por ruta, sin tocar sys.path."""
    ruta = os.path.join(PROGRAMAS_DIR, *partes)
    spec = importlib.util.spec_from_file_location(nombre, ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


D = _cargar("_nexo_datos", "estructuras", "datos.py")
K = _cargar("_nexo_comercial", "presentaciones", "comercial.py")
M = _cargar("_nexo_mapa", "documentos", "mapa.py")

FUENTE = os.path.join(PROGRAMAS_DIR, "documentos", "fuente")
CRUDO = ("https://raw.githubusercontent.com/gestionamaredes-netizen/ig-crm/"
         "claude/tercer-tiempo-programa-carde4/docs/programas/documentos/marca/")
DOC = "https://docs.google.com/document/d/%s/edit"
CARPETA = "https://drive.google.com/drive/folders/%s"

TEMPORADA = "Primera temporada 2026"

# Los colores de Nexo, muestreados del logo. El oro es el de "STUDIOS".
NEXO_AZUL = "#5495E8"
NEXO_ROJO = "#E8353A"
NEXO_ORO = "#98836A"

# El acento de cada programa tal como fue muestreado del logo, pensado sobre
# negro. `datos.py` guarda la version oscurecida, que es la que contrasta
# sobre blanco; la web usa una en cada tema.
SOBRE_NEGRO = {
    "tercer-tiempo": "#5DC825",
    "el-motivo": "#F8A858",
    "sex-and-the-baires": "#F5459A",   # el #ED1877 del logo no contrasta sobre negro
    "pequenos-grandes-sabios": "#FFD21C",
    "exitosa-yo": "#D0A860",
}

# Las tres cosas que un integrante viene a buscar, y en que carpeta estan. Se
# identifican por carpeta y no por titulo, porque el titulo cambia de programa
# en programa: "ficha de invitado" contra "ficha de invitada".
ENTRADAS = [
    ("Cómo es el programa", "1 · Formato",
     "El formato completo: de qué se trata, quién hace qué, y la escaleta "
     "minuto a minuto."),
    ("Qué sale en redes", "7 · Redes",
     "Qué bloque rinde en clip, cuántos por semana y cuándo se publican."),
    ("Salir a conseguir pauta", "8 · Administración",
     "Qué se puede vender, a qué rubros conviene ir y cuánto sale cada cosa."),
]

# Para que sirve cada una de las ocho carpetas.
CARPETAS = {
    "1 · Formato": "La biblia del programa y la hoja de estructura.",
    "2 · Guiones": "El guion técnico modelo, con la escaleta y los horarios "
                   "reales. Se duplica por emisión.",
    "3 · Para técnica": "Lo que técnica recibe antes de encender el piso.",
    "4 · Gráficas": "Los colores del logo, las reglas de uso y la lista de "
                    "piezas que hay que tener hechas.",
    "5 · Invitados": "La ficha para completar, una por invitado.",
    "6 · Emisiones": "Cómo se nombra y qué va adentro de cada emisión.",
    "7 · Redes": "Qué se publica, de dónde sale y con qué frecuencia.",
    "8 · Administración": "Qué se puede vender, a qué rubros y cuánto cuesta "
                          "producirlo.",
}

# Las tarifas del estudio, por hora, con el equipo tecnico en el piso. Salen
# de la grilla de servicios y precios: son de lanzamiento, por los primeros
# tres meses. La sala vacia no se alquila nunca.
TARIFAS = [
    ("Streaming", "Hora suelta", 150_000),
    ("Streaming", "8 h por mes", 140_000),
    ("Streaming", "16 h por mes", 120_000),
    ("Streaming", "24 h por mes", 100_000),
    ("Podcast", "Hora suelta", 120_000),
    ("Podcast", "8 h por mes", 110_000),
    ("Podcast", "16 h por mes", 100_000),
    ("Podcast", "24 h por mes", 90_000),
    ("Producción", "Por hora, optativo", 50_000),
]

JORNADA_MINIMA = 2                 # horas: por debajo no se toma una fecha
DESCUENTOS = [(2, 10), (3, 15)]    # meses seguidos, % de descuento

PROG = {p["slug"]: p for p in D.PROGRAMAS}
ORDEN = [p["slug"] for p in D.PROGRAMAS]


def plata(n):
    """150000 -> '$ 150.000'. Sin decimales, que no hacen falta."""
    return "$ " + "{:,}".format(int(n)).replace(",", ".")


def horas(minutos):
    """135 -> '2 h 15'. Para las horas de piso."""
    return "%d h %02d" % (minutos // 60, minutos % 60)


def documentos():
    """slug -> {carpeta: [(titulo, id)]}, del indice real del Drive."""
    ix = json.load(open(os.path.join(FUENTE, "_indice.json"), encoding="utf-8"))
    out = {}
    for reg in ix:
        slug, sub = M.CARPETAS[reg["parentId"]]
        out.setdefault(slug, {}).setdefault(sub, []).append(
            (reg["titulo"], reg["id"]))
    for carpetas in out.values():
        for docs in carpetas.values():
            docs.sort()
    return out


def id_de_carpeta(slug, sub):
    """El id de una carpeta del Drive, para linkear la carpeta y no un archivo."""
    for cid, (s, u) in M.CARPETAS.items():
        if s == slug and u == sub:
            return cid
    return None


def franjas(slug):
    """[(dia, desde, hasta)] al aire, en el orden de la grilla."""
    return [(dia, ini, fin) for dia, filas in D.GRILLA.items()
            for nombre, s, ini, fin in filas if s == slug]


def numero(slug):
    """Lo que hay que cubrir por mes, cuantos kits y si va por fuera del modelo."""
    d = dict(K.por_mes(slug))
    d["aparte"] = slug in K.SIN_MODELO_POR_INTEGRANTE
    d["kit"] = K.KIT_BASE
    d["escalones"] = [(nombre, mult * K.KIT_BASE, que)
                      for nombre, mult, que in K.ESCALONES]
    return d


def objetivo():
    """El objetivo de auspicios de toda la grilla, por mes."""
    con = [s for s in K.INTEGRANTES if s not in K.SIN_MODELO_POR_INTEGRANTE]
    kits = sum(K.por_mes(s)["kits"] for s in con)
    naming = K.precio("Naming del ciclo")   # por acá va Pequeños Grandes Sabios
    return {"kits": kits, "por_kits": kits * K.KIT_BASE, "naming": naming,
            "total": kits * K.KIT_BASE + naming}


def piso_por_dia():
    """[(dia, minutos de aire, minutos de armado)]. El armado no es aire."""
    return [(dia,
             sum(D.minutos(fin) - D.minutos(ini) for _, _, ini, fin in filas),
             D.armado_del_dia(dia))
            for dia, filas in D.GRILLA.items()]


def cambios_de_piso():
    """[(dia, sale, entra, hueco, necesita, cierra, es pase directo)]."""
    return [(dia,) + t for dia in D.GRILLA for t in D.transiciones(dia)]


if __name__ == "__main__":
    docs = documentos()
    assert sum(len(v) for c in docs.values() for v in c.values()) == 56
    for slug in ORDEN:
        assert slug in SOBRE_NEGRO and franjas(slug) and PROG[slug]["escaletas"]
        for _, sub, _ in ENTRADAS:
            assert docs[slug].get(sub), (slug, sub)
            assert id_de_carpeta(slug, sub), (slug, sub)
    o = objetivo()
    print("56 documentos · %d programas" % len(ORDEN))
    print("objetivo por mes: %d kits + naming = %s" % (o["kits"], plata(o["total"])))
    for dia, aire, armado in piso_por_dia():
        print("  %-10s %s de aire · %s de armado y prueba"
              % (dia, horas(aire), horas(armado)))
    for dia, sale, entra, hueco, nec, ok, directo in cambios_de_piso():
        print("  %-10s %-24s -> %-16s %s"
              % (dia, sale, entra,
                 "pase directo" if directo else
                 ("alcanza" if ok else "faltan %d min" % (nec - hueco))))
