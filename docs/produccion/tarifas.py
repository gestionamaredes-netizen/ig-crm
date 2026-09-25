# -*- coding: utf-8 -*-
"""Las tarifas de producción de Nexo Studios, en un solo lugar.

Los cuatro PDF de la carpeta leen de acá. Si un número cambia, se cambia una vez
y los cuatro quedan alineados. Todo en pesos argentinos.
"""

MONEDA = "pesos argentinos"

# A partir de cuántas horas una jornada deja de ser corta.
UMBRAL = 3

# Lo que cobra el equipo técnico, por hora, según el largo de la jornada.
OPERADOR = {"corta": 25000, "larga": 20000}
ASISTENTE = {"corta": 10000, "larga": 15000}

# Lo que cobra el equipo de producción general por hora de piso. Se reparte
# entre producción general y asistente de producción; el reparto todavía no
# está definido (ver REPARTO_PRODUCCION).
PRODUCCION = 50000
REPARTO_PRODUCCION = None  # a definir por producción ejecutiva

# Lo que se factura por hora de estudio.
TECNICA = 120000   # operador + asistente técnico
COMPLETA = 170000  # lo anterior + producción general y asistente de producción

JORNADAS = (2, 3, 4, 6, 8)
NIVELES = ("tecnica", "completa")


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


def costo_hora(horas, nivel):
    """Costo total de una hora: técnica siempre, producción sólo en la completa."""
    return costo_tecnico_hora(horas) + (PRODUCCION if nivel == "completa" else 0)


def costo(horas, nivel):
    return costo_hora(horas, nivel) * horas


def factura(horas, nivel):
    return (TECNICA if nivel == "tecnica" else COMPLETA) * horas


def margen(horas, nivel):
    return factura(horas, nivel) - costo(horas, nivel)


def margen_hora(horas, nivel):
    return margen(horas, nivel) // horas


def margen_pct(horas, nivel):
    return 100.0 * margen(horas, nivel) / factura(horas, nivel)


# Lo que aporta de más la hora completa sobre la técnica.
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
# 1. El costo técnico por hora da lo mismo en los dos tramos: 25+10 y 20+15 son
#    35. No es casualidad y permite cotizar de memoria.
#
COSTO_HORA_CONSTANTE = costo_tecnico_hora(2)
assert costo_tecnico_hora(2) == costo_tecnico_hora(8) == COSTO_HORA_CONSTANTE, \
    "el costo técnico por hora dejó de ser constante entre jornadas cortas y largas"

#
# 2. Lo que se le suma al cliente por la hora completa es exactamente lo que
#    cobra el equipo de producción. Si un día dejan de coincidir, es una
#    decisión de precio y tiene que ser explícita.
#
assert DELTA_PRODUCCION == PRODUCCION, \
    "el salto de la hora completa (%s) ya no coincide con lo que cobra producción (%s)" \
    % (pesos(DELTA_PRODUCCION), pesos(PRODUCCION))

#
# 3. Consecuencia de lo anterior: como producción se factura y se paga al mismo
#    número, el margen POR HORA es idéntico en los dos planes. La hora completa
#    factura más, pero no deja más. El porcentaje sí baja.
#
MARGEN_HORA = margen_hora(2, "tecnica")
for _h in JORNADAS:
    for _n in NIVELES:
        assert margen_hora(_h, _n) == MARGEN_HORA, \
            "el margen por hora dejó de ser parejo en %s / %s" % (_h, _n)

assert COSTO_HORA_CONSTANTE < TECNICA < COMPLETA, "las tarifas quedaron por debajo del costo"

MARGEN_PCT_TECNICA = margen_pct(2, "tecnica")
MARGEN_PCT_COMPLETA = margen_pct(2, "completa")
