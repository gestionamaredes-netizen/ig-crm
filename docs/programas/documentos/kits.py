# -*- coding: utf-8 -*-
"""El kit de marca de cada programa, escrito desde el modelo y no a mano.

Los cinco programas ya tenian su documento comercial en 8 · Administracion,
pero ese documento es interno: a que rubros ir, como se prospecta, cuanto
cuesta producirlo. Lo que faltaba es la otra mitad, la que se le muestra a la
marca: que recibe, cuanto sale y donde entra en este programa.

Todos los numeros salen de `presentaciones/comercial.py` y de
`estructuras/datos.py`. Ninguno se escribe aca. Si manana el kit sube, estos
cinco documentos cambian solos al regenerarlos.

    python3 kits.py          escribe los cinco fuente/<slug>-kit-de-marca.txt
"""
import importlib.util
import io
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
PROGRAMAS_DIR = os.path.dirname(AQUI)
FUENTE = os.path.join(AQUI, "fuente")


def _cargar(nombre, *partes):
    ruta = os.path.join(PROGRAMAS_DIR, *partes)
    spec = importlib.util.spec_from_file_location(nombre, ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


D = _cargar("_kits_datos", "estructuras", "datos.py")
K = _cargar("_kits_comercial", "presentaciones", "comercial.py")

# Una linea por programa con lo que ese formato no vende. No es invencion:
# es lo que ya dice el documento comercial de cada uno, puesto donde la marca
# lo va a leer antes de preguntar.
LA_REGLA = {
    "tercer-tiempo":
        "La mesa carga al de al lado y opina fuerte. Una marca que necesite "
        "que nadie se ría de nada no va a estar cómoda acá, y conviene "
        "saberlo antes y no después de la primera emisión.",
    "el-motivo":
        "El invitado no se vende. La historia que se cuenta no se elige por "
        "quién auspicia, y una marca no compra que hablemos bien de ella: "
        "compra estar donde se cuenta algo que vale.",
    "sex-and-the-baires":
        "Todo lo que toca salud pasa por la columnista. Ningún auspiciante de "
        "rubro salud, estética o bienestar entra con promesa de resultado: "
        "entra como marca, y lo que se afirma al aire lo dice la profesional.",
    "pequenos-grandes-sabios":
        "Acá hay menores en cámara. No se vende nada que les pida opinar "
        "sobre el producto, ni que los muestre usándolo. La marca acompaña el "
        "programa; los chicos no son vendedores.",
    "exitosa-yo":
        "Lo que se vende no es alcance. Es una hora de atención de alguien que "
        "está por tomar una decisión parecida a la que cuenta la invitada. "
        "Una marca que compre por número de vistas va a leer mal el producto.",
}

MES = 4            # emisiones por semana × 4: el mes comercial de la temporada


def plata(n):
    return "$ " + "{:,}".format(int(n)).replace(",", ".")


def minutos(t):
    """«33'» -> 33."""
    m = re.match(r"^\s*(\d+)", t)
    return int(m.group(1)) if m else 0


def ajustar(texto, ancho=96):
    """Corta a lo ancho del resto de los documentos, sin partir palabras."""
    salida = []
    for parrafo in texto.split("\n"):
        if len(parrafo) <= ancho:
            salida.append(parrafo)
            continue
        linea = ""
        for palabra in parrafo.split(" "):
            if linea and len(linea) + 1 + len(palabra) > ancho:
                salida.append(linea)
                linea = palabra
            else:
                linea = (linea + " " + palabra) if linea else palabra
        if linea:
            salida.append(linea)
    return "\n".join(salida)


def emisiones(slug):
    """Cuántas veces por semana sale, y cuántas en un mes."""
    semanales = len(D.PROGRAMAS_POR_SLUG[slug]["escaletas"]) if False else \
        len([1 for dia, filas in D.GRILLA.items()
             for n, s, i, f in filas if s == slug])
    return semanales, semanales * MES


def tandas(p):
    """Las tandas de la primera escaleta: cuántas y cuántos minutos suman."""
    filas = p["escaletas"][0][2]
    ts = [d for n, nombre, d, q in filas if nombre.lower().startswith("tanda")]
    return len(ts), sum(minutos(t) for t in ts)


def bloques_con_nombre(p):
    """Los bloques que se pueden namear: los que tienen número y nombre."""
    vistos, out = set(), []
    for _, _, filas in p["escaletas"]:
        for n, nombre, _, que in filas:
            if n and nombre not in vistos and not nombre.lower().startswith("tanda"):
                vistos.add(nombre)
                out.append((nombre, que))
    return out


def documento(slug):
    p = D.PROG[slug] if hasattr(D, "PROG") else \
        [x for x in D.PROGRAMAS if x["slug"] == slug][0]
    numero = K.por_mes(slug)
    semanales, al_mes = emisiones(slug)
    por_emision = K.KIT_BASE / al_mes if al_mes else K.KIT_BASE
    n_tandas, min_tanda = tandas(p)

    L = []
    a = L.append

    a("%s — KIT DE MARCA" % p["nombre"].upper())
    a("Productora: Nexo Studios")
    a("Emisión: " + " · ".join(
        "%s de %s a %s" % (dia.lower(), i, f)
        for dia, filas in D.GRILLA.items()
        for n, s, i, f in filas if s == slug))
    a("Qué es esto: lo que recibe una marca que entra a este programa. Lo "
      "interno —a qué rubros ir, cómo se prospecta y cuánto cuesta producirlo— "
      "está en el documento de sponsors, en esta misma carpeta.")

    a("QUÉ ES UN KIT")
    a("El producto de entrada: %s por mes. La marca del auspiciante en las "
      "piezas del programa durante un mes, con todo lo que está acá abajo."
      % plata(K.KIT_BASE))
    a("Este programa sale %d %s por semana, así que un kit son %d emisiones al "
      "mes: %s la emisión. Ese número es el que sirve cuando alguien dice que "
      "%s le parece mucho."
      % (semanales, "vez" if semanales == 1 else "veces", al_mes,
         plata(round(por_emision)), plata(K.KIT_BASE)))

    a("QUÉ INCLUYE")
    for titulo, que in K.QUE_INCLUYE_EL_KIT:
        a("%s: %s" % (titulo, que))

    a("CUÁNTO SALE")
    for nombre, mult, que in K.ESCALONES:
        a("%s: %s por mes. %s" % (nombre, plata(mult * K.KIT_BASE), que))
    a("El naming del ciclo es uno solo por programa y se cierra por temporada, "
      "no por mes.")

    a("DÓNDE ENTRA LA MARCA EN ESTE PROGRAMA")
    if n_tandas:
        a("%d tandas de %d minutos por emisión: %d minutos vendibles por "
          "programa, %d por mes. En el guion técnico «tanda» es el corte "
          "comercial y nada más."
          % (n_tandas, min_tanda // n_tandas, min_tanda, min_tanda * al_mes))
    else:
        a("Este programa no corta a tanda. La marca entra en los bloques, en "
          "la apertura y en el cierre, que es lo que lo hace más caro de "
          "saturar y más limpio de mirar.")
    a("Los bloques que se pueden namear, con el nombre del auspiciante pegado "
      "al bloque toda la temporada:")
    for nombre, que in bloques_con_nombre(p):
        a("- %s. %s" % (nombre, que))

    a("QUÉ RECIBE LA MARCA EN UN MES")
    a("- %d menciones al aire, una por emisión, hechas por la conducción." % al_mes)
    a("- El logo en %d aperturas y %d cierres." % (al_mes, al_mes))
    a("- El producto en cámara en las %d emisiones." % al_mes)
    a("- El logo en los clips y las placas del mes.")
    a("- Un posteo propio, hecho con el equipo del programa.")

    a("LO QUE NO SE VENDE")
    a(LA_REGLA[slug])

    a("EL NÚMERO DE ESTE PROGRAMA")
    if numero.get("aparte") or slug in K.SIN_MODELO_POR_INTEGRANTE:
        a("Este programa no entra en la cuenta por integrante como los otros. "
          "El kit de marca igual se vende a %s, pero lo que sostiene el "
          "formato es el naming del ciclo y las acciones, que es donde tiene "
          "el ticket más alto." % plata(K.KIT_BASE))
    else:
        uno = numero["kits"] == 1
        a("Hay %d en cámara, así que %s %d %s para cubrir el programa: %s por "
          "mes. Un kit por integrante cubre la parte de ese integrante, y ése "
          "es todo el modelo."
          % (numero["integrantes"],
             "hace falta" if uno else "hacen falta",
             numero["kits"], "kit" if uno else "kits",
             plata(numero["ingreso"])))

    a("QUÉ FALTA")
    for f in p.get("falta", []):
        a("- %s" % f)

    return ajustar("\n".join(L)) + "\n"


def main():
    for slug in [x["slug"] for x in D.PROGRAMAS]:
        ruta = os.path.join(FUENTE, "%s-kit-de-marca.txt" % slug)
        texto = documento(slug)
        io.open(ruta, "w", encoding="utf-8").write(texto)
        print("  %-26s %4d líneas · %5d bytes"
              % (os.path.basename(ruta), texto.count("\n"), len(texto)))


if __name__ == "__main__":
    main()
