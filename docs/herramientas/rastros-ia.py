# -*- coding: utf-8 -*-
"""Relevamiento de rastros de escritura automática en los documentos de Nexo.

Busca los tics que delatan un texto generado: incisos entre guiones largos,
conectores de andamiaje, muletillas de consultora, verbos que no dicen nada y
frases todas del mismo largo.

No corrige: marca. La decisión de qué se reescribe es de quien escribe.

    python3 rastros-ia.py                 # todo docs/
    python3 rastros-ia.py ../produccion   # una carpeta
    python3 rastros-ia.py --detalle       # con la frase de cada hallazgo
"""

import ast, os, re, sys
from collections import Counter, defaultdict

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

# Cada regla: (clave, peso, explicación, regex). El peso es cuánto delata.
REGLAS = [
    ("guion-aside", 3, "inciso entre guiones largos",
     r"—[^—]{3,90}—"),
    ("no-solo-sino", 3, "«no solo… sino también»",
     r"\bno s[oó]lo\b[^.]{0,80}\bsino\b"),
    ("apertura-epica", 3, "apertura de manual («en un mundo donde…»)",
     r"\b(en un mundo|en la era d|hoy en d[ií]a|en el mundo actual|a lo largo de la historia)\b"),
    ("andamiaje", 2, "conector de andamiaje («cabe destacar», «en definitiva»)",
     r"\b(es importante (destacar|mencionar|se[nñ]alar|tener en cuenta)|cabe (destacar|mencionar|se[nñ]alar)"
     r"|en definitiva|en resumen|en conclusi[oó]n|asimismo|por otro lado,|adem[aá]s,|por lo tanto,"
     r"|en primer lugar|en [uú]ltima instancia)\b"),
    ("consultora", 3, "muletilla de consultora",
     r"\b(propuesta de valor|soluciones integrales|experiencia [uú]nica|sinergia|valor agregado"
     r"|llevar(lo|la)? al siguiente nivel|un antes y un despu[eé]s|potenciar|optimizar|maximizar"
     r"|empoderar|holístic|disruptiv|innovador|de vanguardia|state of the art)"),
    ("relleno", 2, "adjetivo de folleto («factor clave», «es fundamental»)",
     r"\b((factor|elemento|aspecto|pilar|punto) (clave|fundamental|esencial)"
     r"|(es|resulta|son) (fundamental|esencial|crucial|vital)(es)?"
     r"|juega un papel|invaluable|inigualable|incre[ií]ble|extraordinari)"),
    ("verbo-hueco", 2, "verbo que no compromete («busca», «permite»)",
     r"\b(busca (ser|posicionar|brindar|ofrecer)|permite (que|mejorar|optimizar)"
     r"|est[aá] dise[nñ]ad[oa] para|tiene como objetivo|se caracteriza por)\b"),
    ("desde-hasta", 2, "«desde X hasta Y» como falso inventario",
     r"\bdesde\b[^.]{3,60}\bhasta\b"),
    ("tanto-como", 1, "«tanto X como Y»",
     r"\btanto\b[^.]{3,60}\bcomo\b"),
    ("intensificador", 1, "intensificador vacío («cada vez más», «100%»)",
     r"\b(cada vez m[aá]s|100\s*%|24/7|totalmente|completamente|absolutamente)\b"),
]

MIN_FRASES_BLOQUE = 4

# Arrancar frases con estas es castellano normal, no un tic: no se cuentan.
ARRANQUES_NORMALES = {
    "el", "la", "los", "las", "un", "una", "unos", "unas", "si", "no", "se", "lo", "es",
    "son", "y", "o", "pero", "que", "qué", "cuando", "como", "para", "por", "en", "a",
    "de", "con", "su", "sus", "tu", "tus", "este", "esta", "esto", "eso", "ese", "hay",
    "va", "ya", "acá", "todo", "toda", "cada", "más", "sin", "al", "del", "te", "le",
}

# Proporción de frases que tienen que empezar igual para que sea un tic y no azar.
PROPORCION_ARRANQUE = 0.12


def prosa(ruta):
    """Devuelve (linea, texto) de cada literal de texto del módulo."""
    try:
        arbol = ast.parse(open(ruta, encoding="utf-8").read())
    except SyntaxError:
        return []
    # los docstrings no salen impresos: no cuentan como prosa del documento
    docs = set()
    for nodo in ast.walk(arbol):
        if isinstance(nodo, (ast.Module, ast.ClassDef, ast.FunctionDef)):
            cuerpo = getattr(nodo, "body", None)
            if cuerpo and isinstance(cuerpo[0], ast.Expr) \
                    and isinstance(cuerpo[0].value, ast.Constant) \
                    and isinstance(cuerpo[0].value.value, str):
                docs.add(id(cuerpo[0].value))
    salida = []
    for nodo in ast.walk(arbol):
        if id(nodo) in docs:
            continue
        if isinstance(nodo, ast.Constant) and isinstance(nodo.value, str):
            t = nodo.value.strip()
            # se ignoran claves cortas, slugs y rutas
            if len(t) > 24 and " " in t and not t.startswith(("#", "http")):
                salida.append((nodo.lineno, t))
    return salida


def frases(t):
    return [f.strip() for f in re.split(r"(?<=[.!?])\s+", t) if len(f.strip()) > 12]


def analizar(ruta):
    hallazgos = []
    textos = prosa(ruta)
    for linea, t in textos:
        bajo = t.lower()
        for clave, peso, expl, rx in REGLAS:
            for m in re.finditer(rx, bajo):
                ini = max(0, m.start() - 28)
                hallazgos.append((clave, peso, expl, linea,
                                  ("…" if ini else "") + t[ini:m.end() + 28].replace("\n", " ")))

    # ritmo: muchas frases seguidas del mismo largo suenan a máquina
    todas = [f for _, t in textos for f in frases(t)]
    if len(todas) >= MIN_FRASES_BLOQUE:
        largos = [len(f.split()) for f in todas]
        media = sum(largos) / len(largos)
        desvio = (sum((x - media) ** 2 for x in largos) / len(largos)) ** 0.5
        if media and desvio / media < 0.34:
            hallazgos.append(("ritmo-plano", 2,
                              "frases casi todas del mismo largo (%.0f±%.0f palabras)" % (media, desvio),
                              0, "%d frases analizadas" % len(todas)))

    # arranques repetidos
    arranques = Counter(f.split()[0].lower().strip("«¿¡\"") for f in todas if f.split())
    for palabra, n in arranques.items():
        if (len(todas) > 12 and palabra not in ARRANQUES_NORMALES
                and n >= 4 and n / len(todas) >= PROPORCION_ARRANQUE):
            hallazgos.append(("arranque-repetido", 1,
                              "%d de %d frases empiezan con «%s»" % (n, len(todas), palabra),
                              0, palabra))
    return hallazgos, len(todas)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    detalle = "--detalle" in sys.argv
    base = os.path.normpath(os.path.join(os.getcwd(), args[0])) if args else RAIZ

    archivos = []
    for carpeta, _, nombres in os.walk(base):
        if "__pycache__" in carpeta:
            continue
        for n in sorted(nombres):
            if n.startswith("contenido") and n.endswith(".py"):
                archivos.append(os.path.join(carpeta, n))

    total = Counter()
    puntaje_total = 0
    frases_total = 0
    print("%-46s %6s %7s %8s  %s" % ("archivo", "frases", "puntaje", "c/100fr", "tics"))
    print("-" * 104)
    for ruta in sorted(archivos):
        hallazgos, n_frases = analizar(ruta)
        if not hallazgos and not n_frases:
            continue
        por_clave = Counter(h[0] for h in hallazgos)
        puntaje = sum(h[1] for h in hallazgos)
        puntaje_total += puntaje
        frases_total += n_frases
        total.update(por_clave)
        rel = os.path.relpath(ruta, RAIZ)
        resumen = " ".join("%s×%d" % (k, v) for k, v in por_clave.most_common())
        dens = 100.0 * puntaje / n_frases if n_frases else 0
        print("%-46s %6d %7d %8.1f  %s"
              % (rel[:46], n_frases, puntaje, dens, resumen or "limpio"))
        if detalle:
            for clave, _, expl, linea, frag in sorted(hallazgos, key=lambda h: -h[1]):
                print("      L%-5s %-20s %s" % (linea or "-", clave, frag[:88]))

    print("-" * 104)
    print("puntaje total: %d en %d frases  ->  %.1f cada 100 frases"
          % (puntaje_total, frases_total, 100.0 * puntaje_total / frases_total if frases_total else 0))
    print("referencia: un texto escrito a propósito con todos los tics da ~560 cada 100 frases.")
    for k, v in total.most_common():
        expl = next((r[2] for r in REGLAS if r[0] == k), k)
        print("  %-20s %3d   %s" % (k, v, expl))


if __name__ == "__main__":
    main()
