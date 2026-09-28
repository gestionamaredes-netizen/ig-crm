# -*- coding: utf-8 -*-
"""Una hoja con los roles de Nexo y el circuito por el que pasa cada proyecto.

Para que cualquiera del equipo entienda quién hace qué sin preguntar. Entra
en un A4, fondo blanco, uso interno.
"""

SLUG = "roles"
ARCHIVO = "Nexo-roles-y-circuito-A4.pdf"
INTERNO = True

CABECERA = "Roles y circuito de trabajo"
TITULO = "Quién hace qué."
BAJADA = ("Todo proyecto que entra a Nexo (un podcast, un live set o un programa de "
          "streaming) recorre el mismo camino. Estas son las tres estaciones y quién "
          "responde en cada una.")

# ---------------------------------------------------------------- el circuito
CIRCUITO = [
    ("01", "Dirección general", "Fede Aguirre · Nico Lahargou",
     "Reciben el proyecto. Se juntan con el cliente y escuchan qué quiere hacer. "
     "Si producción general puede estar en esa reunión, mejor; si no, dirección le "
     "traslada todo lo hablado."),
    ("02", "Producción general", "Fabricio Ortega · Martina Nagel",
     "Arman el esquema de trabajo: la preproducción y cómo se ejecuta la producción "
     "en piso. De acá sale todo lo que recibe técnica."),
    ("03", "Operación técnica", "Néstor Mago · asistencia de operación",
     "Ejecuta el piso. Recibe el esquema y el material, y se ocupa de cámaras, audio, "
     "switching y la emisión."),
]

# ---------------------------------------------------------------- transversal
TRANSVERSAL = {
    "rol": "Producción ejecutiva",
    "quien": "Lorena Rizzo",
    "que": "Lo financiero y lo administrativo de todos los proyectos: aprueba el "
           "presupuesto, factura y responde por el proyecto ante el cliente.",
    "nota": "Producción ejecutiva viene de otro rubro, así que producción general "
            "acompaña las decisiones que necesitan criterio audiovisual y asume parte "
            "de estas tareas cuando hace falta.",
}

# ---------------------------------------------------------------- el pase
PASE = {
    "titulo": "Lo que técnica tiene que recibir",
    "bajada": "Un drive armado por producción general, con todo adentro antes del día "
              "de grabación. Sin esto, el piso arranca a ciegas.",
    "items": ["El opening", "La canción de apertura", "El guión técnico",
              "Los integrantes", "Visuales y diseño del proyecto"],
}

PIE = "Si algo no está en esta hoja, lo define producción general antes de pasarlo a técnica."
DIRECCION = "Nexo Studios · Hipólito Yrigoyen 4716, Villa Lynch · San Martín"
