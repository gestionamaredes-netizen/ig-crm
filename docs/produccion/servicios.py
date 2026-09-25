# -*- coding: utf-8 -*-
"""Grilla de servicios de Nexo Studios: streaming, podcast y producción.

Precios de lanzamiento, vigentes los primeros tres meses. Todo en pesos
argentinos y por hora de estudio.

Los costos operativos y las ganancias viven acá para poder verificarlos, pero
NO salen en el documento que va al cliente: la maqueta lo comprueba antes de
escribir el HTML.
"""

MONEDA = "pesos argentinos"
VIGENCIA = "Precios de lanzamiento, por los primeros tres meses"

# ---------------------------------------------------------------- operación
COSTO_OPERACION = {1: 25000, 2: 40000}   # por hora, según cuántos operadores

# ---------------------------------------------------------------- streaming
# (horas al mes, operadores) -> precio por hora
STREAMING = {
    (None, 2): 150000,   # suelta, sin paquete
    (8, 2): 140000,
    (8, 1): 120000,
    (16, 2): 120000,
    (16, 1): 110000,
    (24, 2): 100000,
}

# ---------------------------------------------------------------- podcast
# el podcast va siempre con dos operadores
PODCAST = {
    None: 120000,
    8: 110000,
    16: 100000,
    24: 90000,
}
PODCAST_OPERADORES = 2

# ---------------------------------------------------------------- producción
PRODUCCION = 50000          # por hora, incluye dos productores
PRODUCCION_COSTO = 40000
PRODUCCION_PRODUCTORES = 2

# ---------------------------------------------------------------- descuentos
DESCUENTOS = {2: 0.10, 3: 0.15}   # meses contratados -> descuento

# Sobre qué se aplica el descuento todavía no está definido: si sobre el precio
# de lista o sobre el de paquete, que ya viene bonificado por volumen.
DESCUENTO_BASE = None


# ---------------------------------------------------------------- cálculos
def gana_streaming(horas, operadores):
    return STREAMING[(horas, operadores)] - COSTO_OPERACION[operadores]


def gana_podcast(horas):
    return PODCAST[horas] - COSTO_OPERACION[PODCAST_OPERADORES]


def gana_produccion():
    return PRODUCCION - PRODUCCION_COSTO


def con_descuento(precio, meses):
    return precio * (1 - DESCUENTOS.get(meses, 0))


def pesos(n, signo=True):
    t = "{:,}".format(int(round(n))).replace(",", ".")
    return ("$ " + t) if signo else t


# ---------------------------------------------------------------- chequeos
#
# 1. Cada ganancia que se anunció tiene que salir de precio menos costo.
#
_ANUNCIADAS = {
    ("streaming", None, 2): 110000,
    ("streaming", 8, 2): 100000,
    ("streaming", 8, 1): 95000,
    ("streaming", 16, 2): 80000,
    ("streaming", 16, 1): 85000,
    ("streaming", 24, 2): 60000,
    ("podcast", None, 2): 80000,
}
for _k, _v in _ANUNCIADAS.items():
    _tipo, _hs, _op = _k
    _real = gana_streaming(_hs, _op) if _tipo == "streaming" else gana_podcast(_hs)
    assert _real == _v, "%s %s: se anunció %s y la cuenta da %s" % (_k, _hs, pesos(_v), pesos(_real))

assert gana_produccion() == 10000, "producción dejó de dejar 10.000"

#
# 2. Ningún precio puede quedar por debajo de su costo, ni siquiera con el
#    descuento más grande aplicado sobre el paquete más barato.
#
_PEOR = max(DESCUENTOS.values())
for (_hs, _op), _p in STREAMING.items():
    assert con_descuento(_p, 3) > COSTO_OPERACION[_op], \
        "streaming %s hs con %d op queda por debajo del costo con %.0f%% off" % (_hs, _op, _PEOR * 100)
for _hs, _p in PODCAST.items():
    assert con_descuento(_p, 3) > COSTO_OPERACION[PODCAST_OPERADORES], \
        "podcast %s hs queda por debajo del costo con el descuento máximo" % _hs

#
# 3. El segundo operador cuesta lo mismo en todos los paquetes. Lo que cambia
#    es cuánto se cobra por él, y en un paquete se cobra menos de lo que cuesta.
#    No es un error de cálculo: es una decisión de precio que conviene ver.
#
SEGUNDO_OPERADOR_COSTO = COSTO_OPERACION[2] - COSTO_OPERACION[1]
SEGUNDO_OPERADOR_COBRO = {
    hs: STREAMING[(hs, 2)] - STREAMING[(hs, 1)]
    for hs in (8, 16)
}
PAQUETES_CON_SEGUNDO_OPERADOR_A_PERDIDA = [
    hs for hs, cobro in SEGUNDO_OPERADOR_COBRO.items() if cobro < SEGUNDO_OPERADOR_COSTO
]
