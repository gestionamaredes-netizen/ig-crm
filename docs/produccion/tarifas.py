# -*- coding: utf-8 -*-
"""Las tarifas de producción de Nexo Studios, en un solo lugar.

Los tres PDF de la carpeta leen de acá. Si un número cambia, se cambia una vez
y los tres documentos quedan alineados. Todo en pesos argentinos.
"""

MONEDA = "pesos argentinos"

# A partir de cuántas horas una jornada deja de ser corta.
UMBRAL = 3

# Lo que cobra el equipo técnico, por hora, según el largo de la jornada.
OPERADOR = {"corta": 25000, "larga": 20000}
ASISTENTE = {"corta": 10000, "larga": 15000}

# Lo que se factura por hora de estudio.
TECNICA = 120000   # operador + asistente
COMPLETA = 150000  # operador + asistente + equipo de producción

JORNADAS = (2, 3, 4, 6, 8)

NOMBRES = {
    "operador": "Néstor Mago",
    "asistente": "Asistente técnico",
}


# ---------------------------------------------------------------- cálculos
def tramo(horas):
    """'corta' hasta el umbral, 'larga' de ahí en adelante."""
    return "corta" if horas < UMBRAL else "larga"


def hora_operador(horas):
    return OPERADOR[tramo(horas)]


def hora_asistente(horas):
    return ASISTENTE[tramo(horas)]


def costo_tecnico_hora(horas):
    """Lo que cuesta una hora de equipo técnico en una jornada de ese largo."""
    return hora_operador(horas) + hora_asistente(horas)


def costo_tecnico(horas):
    return costo_tecnico_hora(horas) * horas


def factura(horas, nivel):
    return (TECNICA if nivel == "tecnica" else COMPLETA) * horas


def margen(horas, nivel):
    return factura(horas, nivel) - costo_tecnico(horas)


def margen_pct(horas, nivel):
    return 100.0 * margen(horas, nivel) / factura(horas, nivel)


# Lo que aporta de más la hora completa sobre la técnica: es lo que factura
# el equipo de producción. Su costo interno todavía no está definido.
DELTA_PRODUCCION = COMPLETA - TECNICA


# ---------------------------------------------------------------- formato
def pesos(n, signo=True):
    """1250000 -> '$ 1.250.000'. Separador de miles a la argentina."""
    t = "{:,}".format(int(n)).replace(",", ".")
    return ("$ " + t) if signo else t


def hs(n):
    return "%d hs" % n


# ---------------------------------------------------------------- chequeos
#
# El costo técnico por hora da lo mismo en los dos tramos: 25+10 y 20+15 son 35.
# No es casualidad y es la propiedad más útil de toda la estructura, así que se
# verifica acá: si alguien toca un número y la rompe, los PDF no se generan.
#
COSTO_HORA_CONSTANTE = costo_tecnico_hora(2)

assert costo_tecnico_hora(2) == costo_tecnico_hora(8) == COSTO_HORA_CONSTANTE, \
    "el costo técnico por hora dejó de ser constante entre jornadas cortas y largas"
assert COSTO_HORA_CONSTANTE < TECNICA < COMPLETA, "las tarifas de estudio quedaron por debajo del costo"

# El margen porcentual también es plano en todas las jornadas, por lo anterior.
for _h in JORNADAS:
    assert abs(margen_pct(_h, "tecnica") - margen_pct(2, "tecnica")) < 0.01
    assert abs(margen_pct(_h, "completa") - margen_pct(2, "completa")) < 0.01

MARGEN_TECNICA = margen_pct(2, "tecnica")
MARGEN_COMPLETA = margen_pct(2, "completa")
