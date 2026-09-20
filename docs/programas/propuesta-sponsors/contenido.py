# -*- coding: utf-8 -*-
"""Propuesta comercial de sponsoreo — Nexo Studios, lanzamiento 2026.

Vertical, para leer desde el celular. Para cambiar cualquier dato se edita
este archivo y se corre ./build-propuesta.sh

  >>> LO UNICO QUE HAY QUE COMPLETAR ANTES DE MANDARLA SON LOS MONTOS.
  >>> Estan todos juntos, abajo, en INVERSION. Mientras digan "A convenir"
  >>> la propuesta se lee bien igual, pero no cierra una venta sola.
"""

ARCHIVO = "Nexo-Studios-propuesta-de-sponsoreo-2026.pdf"
TEMPORADA = "Temporada lanzamiento 2026"
PAISES = "Argentina · Colombia · España"

# ---------------------------------------------------------------- portada
PORTADA_EYEBROW = "Propuesta comercial · Sponsoreo"
PORTADA_TITULO = "Sé parte del\nlanzamiento."
PORTADA_BAJADA = ("Nexo Studios abre su centro integral de contenido audiovisual con una "
                  "grilla de cinco programas propios. Esta es la invitación a entrar "
                  "ahora, cuando todavía se elige lugar.")

# ---------------------------------------------------------------- el pitch
INVITACION = {
    "eyebrow": "Por qué ahora",
    "titulo": "Entrar en el\nlanzamiento no\nes lo mismo\nque entrar después.",
    "parrafos": [
        "Una grilla que arranca tiene algo que una grilla consolidada ya no puede ofrecer: "
        "lugar. Naming disponible, secciones sin dueño, formatos que todavía se pueden "
        "diseñar alrededor de una marca en vez de acomodarla al final.",
        "El que entra en el lanzamiento no compra un espacio publicitario. Queda asociado "
        "al origen del proyecto, con precio de lanzamiento y prioridad de renovación cuando "
        "la grilla crezca.",
    ],
    "destacado": "Después del lanzamiento se vende lo que queda. Ahora se elige.",
}

# ---------------------------------------------------------------- ecosistema
QUE_ES = {
    "eyebrow": "Qué es Nexo Studios",
    "titulo": "No es un estudio\nque se alquila.",
    "intro": "Es un centro integral de contenido: el lugar donde un formato se piensa, "
             "se produce, se emite y se distribuye sin salir de la misma casa.",
    "filas": [
        ("Producción propia", "Cinco programas de la casa, con producción general, dirección "
                              "y equipo técnico estables. No es contenido tercerizado."),
        ("Estudio de broadcast", "Tres sectores en un mismo piso —conducción, entrevistas y "
                                 "live set— con cinco cámaras y audio multipista."),
        ("Distribución integrada", "Cada emisión sale en vivo, queda en VOD, se corta en "
                                   "verticales y se publica en audio. Una grabación, cuatro salidas."),
        ("Alcance multipaís", "Producción en Argentina, co-conducción desde Colombia y un "
                              "bloque semanal en un canal de España."),
        ("Marketing propio", "Dirección de marketing en el equipo: la marca del sponsor se "
                             "trabaja, no se apoya sobre el programa y listo."),
    ],
}

# ---------------------------------------------------------------- cadena de valor
CADENA = {
    "eyebrow": "Cómo rinde",
    "titulo": "Una grabación,\ncuatro salidas.",
    "intro": "La marca no aparece una vez. Aparece en cada punto de la cadena, con el mismo "
             "material y sin producción adicional.",
    "pasos": [
        ("01", "El vivo", "La emisión con chat abierto. Es donde la PNT se hace en vivo y la "
                          "audiencia responde en el momento."),
        ("02", "El VOD", "El episodio completo queda publicado. Sigue sumando reproducciones "
                         "semanas después del aire."),
        ("03", "Los clips", "Cuatro a seis verticales por emisión. Es la pieza que más circula "
                            "y la que lleva la marca a gente que no vio el programa."),
        ("04", "El podcast", "La versión en audio, para el que escucha manejando o entrenando. "
                             "La mención del talento viaja intacta."),
    ],
}

# ---------------------------------------------------------------- inventario
INVENTARIO = {
    "eyebrow": "Qué se compra",
    "titulo": "Esto no es\nun banner.",
    "intro": "El inventario de un programa en vivo es más grande de lo que parece. Estas son "
             "las piezas reales que se pueden vender, solas o combinadas.",
    "items": [
        ("Naming del ciclo", "«Programa presentado por…» en apertura, cierre, placas y todas "
                             "las piezas derivadas."),
        ("Naming de bloque", "Propiedad de un momento fijo y recurrente de la emisión. La "
                             "entrada de mejor recordación por repetición."),
        ("PNT integrada", "Producto en mesa, prueba en vivo y mención del conductor dentro de "
                          "la conversación, no cortándola."),
        ("Branded content", "Cápsulas producidas en el mismo estudio, con el talento del "
                            "programa y la identidad de la marca."),
        ("Beneficios a la audiencia", "Códigos, canjes y sorteos anunciados en vivo, con "
                                      "seguimiento desde el chat."),
        ("Activaciones y eventos", "Emisiones especiales desde locación, evento de marca o "
                                   "grabación abierta con público."),
    ],
}

# ---------------------------------------------------------------- los tres niveles
#
#   >>> ACA VAN LOS MONTOS. Mientras diga "A convenir", sale asi impreso.
#
NIVELES = [
    {
        "slug": "main",
        "tag": "Nivel 01",
        "nombre": "Main Sponsor",
        "claim": "La marca del lanzamiento.",
        "accent": "#4DA3FF",
        "bajada": "Exclusividad de rubro en toda la grilla. Es la marca que queda asociada "
                  "al proyecto, no a un programa.",
        "incluye": [
            "Naming en la grilla completa: los cinco programas",
            "Exclusividad de rubro durante toda la temporada",
            "PNT integrada en cada emisión de cada programa",
            "Presencia en la identidad visual: placas, apertura y cierre",
            "Branded content: 2 cápsulas mensuales producidas en el estudio",
            "Presencia en los clips verticales de toda la grilla",
            "Una activación especial por temporada, a definir en conjunto",
            "Prioridad de renovación antes de que la grilla salga a la venta",
        ],
        "cierre": "Un solo interlocutor, una sola negociación, toda la grilla.",
        "destinatario": "Para la marca que quiere ser el nombre del proyecto y no una mención más.",
    },
    {
        "slug": "support",
        "tag": "Nivel 02",
        "nombre": "Support",
        "claim": "Un programa, tuyo.",
        "accent": "#FF3F4D",
        "bajada": "Presencia sostenida en el programa de la grilla que mejor le hable a la "
                  "marca, sin pagar por los otros cuatro.",
        "incluye": [
            "Naming de bloque en el programa elegido",
            "PNT integrada en cada emisión de ese programa",
            "Presencia en placas y en el cierre del programa",
            "Presencia en los clips verticales de ese programa",
            "1 cápsula de branded content por mes",
            "Beneficios y códigos para la audiencia, anunciados en vivo",
            "Reporte mensual de emisiones, piezas y alcance",
        ],
        "cierre": "La inversión acotada a una audiencia concreta.",
        "destinatario": "Para la marca con un público claro que prefiere profundidad antes que alcance.",
    },
    {
        "slug": "partner",
        "tag": "Nivel 03",
        "nombre": "Partner Creativo",
        "claim": "Se paga con lo que hacés.",
        "accent": "#C7A45E",
        "bajada": "Acuerdo por intercambio: producto, servicio o capacidad a cambio de "
                  "presencia. Sin salida de caja para ninguno de los dos.",
        "incluye": [
            "Product placement natural en set, según el rubro",
            "Mención como partner en apertura y cierre",
            "Presencia en la placa de partners de la grilla",
            "Co-creación de al menos una acción por temporada",
            "Uso del estudio para contenido propio de la marca, a convenir",
            "Primera opción de pasar a Support en la temporada siguiente",
        ],
        "cierre": "El acuerdo más rápido de cerrar y el que mejor funciona para probar.",
        "destinatario": "Para gastronomía, indumentaria, bebidas, tecnología, servicios creativos "
                        "y todo lo que se ve bien en cámara.",
    },
]

# >>>>>>>>>>>>>>>>>>>>>>>>  COMPLETAR ANTES DE MANDAR  <<<<<<<<<<<<<<<<<<<<<<<<
#
# Poner el monto y el periodo de cada nivel. Ejemplos de formato:
#     "main":    ("$ 1.200.000", "por mes · mínimo 3 meses")
#     "support": ("$ 450.000",   "por mes · mínimo 3 meses")
#     "partner": ("Por canje",   "valorizado según la acción")
#
INVERSION = {
    "main":    ("A convenir", "según duración de la temporada"),
    "support": ("A convenir", "según programa y duración"),
    "partner": ("Por canje",  "valorizado según la acción"),
}

NOTA_INVERSION = ("Todos los niveles se cotizan por temporada. El lanzamiento tiene precio de "
                  "lanzamiento: se sostiene para el que renueva.")

# ---------------------------------------------------------------- comparativa
COMPARATIVA = {
    "eyebrow": "De un vistazo",
    "titulo": "Los tres,\nlado a lado.",
    "cols": ["Main", "Support", "Partner"],
    "filas": [
        ("Programas", "Los 5", "1 a elección", "Según acción"),
        ("Exclusividad de rubro", "Sí", "En su programa", "No"),
        ("Naming", "De ciclo", "De bloque", "Mención"),
        ("PNT en vivo", "Todas", "Las de su programa", "Placement"),
        ("Branded content", "2 por mes", "1 por mes", "Co-creado"),
        ("Clips verticales", "Toda la grilla", "Su programa", "Según acción"),
        ("Activación especial", "1 por temporada", "A cotizar", "1 co-creada"),
        ("Reporte mensual", "Sí", "Sí", "Sí"),
    ],
}

# ---------------------------------------------------------------- respaldo
ESTUDIO = [
    ("Cámaras", "5 en piso: 3 PTZ ópticas + 2 Insta360 Link 2C Pro"),
    ("Micrófonos", "6 Shure MV7+ dinámicos cardioide, XLR + USB-C"),
    ("Consola", "Rodecaster Pro II — audio multipista por canal"),
    ("Mesa de sonido", "Behringer X2442USB — 24 canales"),
    ("Switching", "Elgato Stream Deck XL — 32 teclas LCD"),
    ("Monitoreo", "In-ear SE215, talkback y Smart TV 50″ 4K"),
]

SECTORES = [
    ("1 · Conducción", "Escritorio de listones, hasta seis al aire"),
    ("2 · Entrevistas", "Dos sillones y mesa baja contra la cortina"),
    ("3 · Live set", "La alfombra contra los paneles, para música en vivo"),
]

STAFF = [
    ("Producción Ejecutiva", "Lorena Rizzo"),
    ("Producción General", "Fabricio Ortega · Martina Nagel"),
    ("Dirección General", "Fede Aguirre · Nico Lahargou"),
    ("Dirección de Marketing", "Julián Barreiro"),
    ("Producción Técnica", "Néstor Mago"),
]

# ---------------------------------------------------------------- cierre
PASOS = {
    "eyebrow": "Cómo seguimos",
    "titulo": "Cuatro pasos\ny estás al aire.",
    "pasos": [
        ("01", "Una charla de 30 minutos", "Nos contás qué necesita la marca este año. No "
                                           "hace falta que vengas con el brief cerrado."),
        ("02", "Propuesta a medida", "Te mandamos el nivel y el programa que mejor encajan, "
                                     "con la inversión y el detalle de piezas."),
        ("03", "Diseño de la activación", "Definimos juntos cómo entra la marca en el aire. "
                                          "Acá trabaja producción, no un vendedor."),
        ("04", "Al aire", "Arrancás con la temporada y recibís el reporte mensual de lo que "
                          "salió y cómo rindió."),
    ],
}

CONTACTO = {
    "eyebrow": "Hablemos",
    "titulo": "El lugar se\nelige una\nsola vez.",
    "bajada": "Escribinos y coordinamos la charla. Si querés, la hacemos en el estudio y "
              "te mostramos dónde iría tu marca.",
    "firma_nombre": "Fabricio Benjamín Ortega",
    "firma_rol": "Producción General · Nexo Studios",
    "firma_extra": "San Martín, Provincia de Buenos Aires",
}
