# -*- coding: utf-8 -*-
"""Resumen comercial para marcas y comercios — Nexo Studios 2026.

Version corta de la propuesta de sponsoreo, apuntada a pymes y comercios que
ya hacen contenido en redes: gastronomia, bebidas, food trucks, servicios.
No les hablamos de naming ni de exclusividad de rubro: eso es para una marca
grande. Aca el argumento es subir el nivel del contenido y armar el nicho.

Para cambiar cualquier dato se edita este archivo y se corre ./build-resumen.sh
"""

ARCHIVO = "Nexo-Studios-resumen-para-marcas.pdf"
TEMPORADA = "Temporada lanzamiento 2026"

PORTADA = {
    "eyebrow": "Para marcas que ya hacen contenido",
    "titulo": "Tu marca ya\nhace contenido.\nQue se note.",
    "bajada": "Nexo Studios abre su estudio y su grilla a comercios y marcas que quieren "
              "dejar de improvisar los videos y empezar a construir una audiencia propia.",
    "pie": "San Martín, Provincia de Buenos Aires",
}

# ---------------------------------------------------------------- a quien
RUBROS = [
    "Panaderías y pastelerías", "Heladerías", "Rotiserías y comidas",
    "Distribuidoras de bebidas", "Food trucks", "Bares y cafés",
    "Indumentaria", "Estética y bienestar", "Servicios y oficios",
]

RECONOCES = {
    "eyebrow": "A quién le hablamos",
    "titulo": "Si te reconocés\nen esto, seguí\nleyendo.",
    "intro": "Trabajamos con marcas de producto y de servicio que ya están haciendo el "
             "esfuerzo de estar en redes.",
    "items": [
        ("Subís y se pierde", "Grabás con el celular, subís, junta doscientas vistas y al "
                              "otro día no quedó nada."),
        ("Tu producto es mejor que tu video", "Lo que hacés está bueno de verdad. El video "
                                              "no lo muestra así, y el que mira no puede saberlo."),
        ("Cada semana arrancás de cero", "No hay un plan: hay ganas. Y las ganas se agotan "
                                         "antes que el algoritmo."),
        ("Le hablás a todos", "Y cuando le hablás a todos, no le hablás a nadie en particular. "
                              "Ahí es donde se pierde la plata."),
    ],
}

# ---------------------------------------------------------------- nicho
NICHO = {
    "eyebrow": "Lo importante",
    "titulo": "Tu nicho no es\n«todo el barrio».",
    "intro": "Un nicho dorado es un grupo chico, muy definido y fiel, con el que una marca "
             "rinde más que persiguiendo a todo el mundo. Cumple cuatro condiciones:",
    "condiciones": [
        ("Definible", "Lo describís en una frase concreta, no en una franja de edad."),
        ("Fiel", "Vuelve. No compra una vez: te elige."),
        ("Desatendido", "Nadie más le está hablando así en tu zona."),
        ("Comprable", "Tiene con qué y quiere lo que vendés."),
    ],
    "ejemplos_titulo": "Cómo se ve en tu rubro",
    "ejemplos": [
        ("Panadería", "#F0B000", "No «gente que compra pan». Las familias que arman la "
                                 "merienda del domingo y quieren llegar con algo distinto."),
        ("Heladería", "#4DA3FF", "No «los que comen helado». Los que salen a caminar después "
                                 "de cenar en verano y buscan una excusa para parar."),
        ("Rotisería", "#FF3F4D", "No «los que piden delivery». El que llega a las nueve de la "
                                 "noche sin ganas de cocinar y no quiere comer cualquier cosa."),
        ("Distribuidora", "#50D000", "No «los que toman». El que organiza la previa y compra "
                                     "para diez, y necesita que le llegue a tiempo."),
        ("Food truck", "#C7A45E", "No «los que pasan». Los que te siguen para saber dónde "
                                  "estás parado esta semana."),
    ],
    "cierre": "Cuando sabés a quién le hablás, el contenido se vuelve fácil. Antes de eso, "
              "todo es prueba y error.",
}

# ---------------------------------------------------------------- que hacemos
SERVICIOS = {
    "eyebrow": "Qué hacemos con vos",
    "titulo": "Tres formas\nde entrar.",
    "items": [
        ("01", "Contenido en el estudio", "#4DA3FF",
         "Venís un día, producimos con cámaras, luces y audio de verdad, y te vas con piezas "
         "para todo un mes. Guion, grabación y edición incluidos."),
        ("02", "Tu marca en los programas", "#FF3F4D",
         "Tu producto entra en las emisiones de la grilla: mención del conductor, producto en "
         "mesa, prueba en vivo. Te ve gente que no te conocía."),
        ("03", "Partner creativo", "#C7A45E",
         "Acuerdo por canje: ponés producto o servicio y recibís presencia y contenido. Sin "
         "salida de caja para ninguno de los dos. Es la forma más rápida de empezar."),
    ],
    "llevas_titulo": "Con qué te vas",
    "llevas": [
        "Piezas verticales listas para publicar",
        "Una versión larga para YouTube o para tu web",
        "Fotos del mismo día de grabación",
        "Una línea visual propia: que todo lo tuyo se reconozca",
        "Un plan de qué publicar y cuándo",
    ],
}

# ---------------------------------------------------------------- cierre
PASOS = {
    "eyebrow": "Cómo empezamos",
    "titulo": "Tres pasos\ny estás\ngrabando.",
    "items": [
        ("01", "Un café y media hora", "Nos contás qué vendés y a quién. De ahí sale el nicho."),
        ("02", "Te armamos la propuesta", "Qué grabamos, cuántas piezas y con qué formato. "
                                          "Con el número cerrado."),
        ("03", "Se graba", "Un día en el estudio y salís con material para semanas."),
    ],
}

EQUIPO_TITULO = "El equipo"
EQUIPO_BAJADA = ("Un equipo fijo que produce cinco programas propios todas las semanas, en "
                 "el mismo estudio donde vas a grabar.")
EQUIPO = [
    ("Lorena Rizzo", "Producción Ejecutiva"),
    ("Fabricio Ortega", "Producción General"),
    ("Martina Nagel", "Producción General"),
    ("Fede Aguirre", "Dirección General"),
    ("Nico Lahargou", "Dirección General"),
    ("Julián Barreiro", "Dirección de Marketing"),
]

CONTACTO = {
    "titulo": "Hablemos.",
    "bajada": "Escribinos y coordinamos. Si querés, la primera charla la hacemos en el "
              "estudio y te mostramos cómo quedaría lo tuyo.",
    "firma": "Nexo Studios · San Martín, Provincia de Buenos Aires",
}
