# -*- coding: utf-8 -*-
"""El modelo comercial de la temporada: el kit de marca y lo que hay que cubrir.

Dos numeros, y de ellos sale todo lo demas:

- Un **kit de marca** se vende a 150.000 por mes, de base. Es el producto de
  entrada: la marca del auspiciante en las piezas del programa durante un mes.
- Cada integrante del programa tiene que cubrir 150.000 por mes de costo
  operativo.

Los dos numeros son iguales a proposito, y ahi esta todo el modelo: **un kit
de marca por integrante cubre la parte de ese integrante.** El objetivo de
venta de cada programa es, entonces, tantos kits como gente tenga en camara.

Si manana el kit sube o el costo baja, se cambia aca y se propaga a las cinco
presentaciones. Las aserciones del final verifican que la cuenta siga cerrando.
"""

KIT_BASE = 150_000          # por mes, por auspiciante
COSTO_POR_INTEGRANTE = 150_000   # por mes, lo que cubre cada uno

# Cuanta gente hay en camara en cada programa. Es lo que define cuantos kits
# hacen falta y cuanto cuesta sostenerlo por mes.
INTEGRANTES = {
    "tercer-tiempo": 6,
    "el-motivo": 3,
    "sex-and-the-baires": 6,          # cinco conductoras y la columnista
    "pequenos-grandes-sabios": 1,     # el adulto moderador; ver la nota de abajo
    "exitosa-yo": 1,
}

# Pequenos Grandes Sabios no entra en el modelo como los otros. Los cinco
# chicos no son socios que cubren un costo: son menores con autorizacion de
# sus familias. El unico integrante que cuenta a efectos del modelo es el
# adulto moderador, y el resto del costo del programa se cubre con el naming
# del ciclo y las acciones educativas, que es donde ese formato tiene el
# ticket mas alto.
SIN_MODELO_POR_INTEGRANTE = {"pequenos-grandes-sabios"}

QUE_INCLUYE_EL_KIT = [
    ("Logo en apertura y cierre", "En la placa de entrada y en la de créditos, "
                                  "todas las emisiones del mes."),
    ("Mención al aire", "Una por emisión, hecha por la conducción, no leída "
                        "de una placa."),
    ("Producto en cámara", "El producto sobre la mesa o en el set, a la vista, "
                           "durante todo el programa."),
    ("Presencia en las piezas del mes", "El logo en los clips y las placas que "
                                        "salen de ese programa."),
    ("Un posteo propio", "Una pieza al mes hecha para la marca, con el equipo "
                         "del programa."),
]

ESCALONES = [
    ("Kit de marca", 1, "El producto de entrada. Lo que cubre la parte de un "
                        "integrante."),
    ("Kit doble", 2, "Dos bloques o dos días. Se cotiza sobre dos kits."),
    ("Naming de bloque", 2, "El nombre del auspiciante pegado a un bloque fijo "
                            "toda la temporada."),
    ("Naming del ciclo", 4, "El nombre del programa lleva la marca. Uno solo "
                            "por programa."),
]


def por_mes(slug):
    """Lo que hay que cubrir por mes y cuantos kits hacen falta."""
    n = INTEGRANTES[slug]
    costo = n * COSTO_POR_INTEGRANTE
    kits = -(-costo // KIT_BASE)      # redondeo para arriba
    return {"integrantes": n, "costo": costo, "kits": kits,
            "ingreso": kits * KIT_BASE}


def precio(escalon):
    """Lo que sale cada escalón, en pesos por mes."""
    for nombre, mult, _ in ESCALONES:
        if nombre == escalon:
            return mult * KIT_BASE
    raise KeyError(escalon)


def plata(n):
    """150000 -> '150.000'."""
    return "{:,}".format(int(n)).replace(",", ".")


# --- lo que tiene que seguir siendo cierto -------------------------------

# El modelo entero se apoya en que un kit cubre exactamente un integrante.
assert KIT_BASE == COSTO_POR_INTEGRANTE, (
    "si el kit y el costo por integrante dejan de ser iguales, la frase «un "
    "kit por integrante» deja de ser cierta y hay que reescribir las "
    "presentaciones")

# Y en que, por lo tanto, hacen falta tantos kits como gente en cámara.
for _slug in INTEGRANTES:
    _m = por_mes(_slug)
    assert _m["kits"] == _m["integrantes"], (
        "%s: %d integrantes pero %d kits" % (_slug, _m["integrantes"], _m["kits"]))
    assert _m["ingreso"] >= _m["costo"], (
        "%s: %d kits no llegan a cubrir %d" % (_slug, _m["kits"], _m["costo"]))

assert set(SIN_MODELO_POR_INTEGRANTE) <= set(INTEGRANTES)


def total_grilla():
    """Lo que hay que cubrir por mes entre todos los programas.

    Pequenos Grandes Sabios se cuenta aparte: no se financia por integrante
    sino con el naming del ciclo, asi que su costo no entra en esta suma y
    su naming tampoco entra como kit.
    """
    por_integrante = {s: por_mes(s) for s in INTEGRANTES
                      if s not in SIN_MODELO_POR_INTEGRANTE}
    costo = sum(m["costo"] for m in por_integrante.values())
    kits = sum(m["kits"] for m in por_integrante.values())
    naming = precio("Naming del ciclo")
    return {"programas": len(por_integrante), "costo": costo, "kits": kits,
            "naming_pgs": naming, "total": costo + naming}


_t = total_grilla()
assert _t["kits"] == sum(INTEGRANTES[s] for s in INTEGRANTES
                         if s not in SIN_MODELO_POR_INTEGRANTE)
assert _t["costo"] == _t["kits"] * KIT_BASE
