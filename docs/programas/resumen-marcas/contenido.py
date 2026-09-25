# -*- coding: utf-8 -*-
"""Resumen comercial para marcas y comercios — Nexo Studios 2026.

Version corta de la propuesta de sponsoreo, apuntada a pymes y comercios que
ya hacen contenido en redes: gastronomia, bebidas, food trucks, servicios.
No les hablamos de naming ni de exclusividad de rubro: eso es para una marca
grande. Aca el argumento es aparecer en un programa que ya se mira.

  >>> Nexo NO produce contenido aparte para la marca. El sponsor aparece
  >>> dentro de los programas de la grilla. La unica excepcion es la marca
  >>> que quiera su propio streaming, podcast o live set: eso es otro
  >>> servicio y se cotiza aparte.

Para cambiar cualquier dato se edita este archivo y se corre ./build-resumen.sh
"""

ARCHIVO = "Nexo-Studios-resumen-para-marcas.pdf"
TEMPORADA = "Temporada lanzamiento 2026"

PORTADA = {
    "eyebrow": "Para marcas que ya hacen contenido",
    "titulo": "Tu marca en\nun programa\nque ya se mira.",
    "bajada": "Nexo Studios abre su grilla de cinco programas a comercios y marcas que "
              "quieren llegar a gente nueva, con la producción ya hecha y una audiencia "
              "que vuelve todas las semanas.",
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
        ("Le hablás siempre a los mismos", "Posteás y te ven tus seguidores, que ya te "
                                           "conocen y ya te compran. Gente nueva, poca."),
        ("Tu producto es mejor que tu video", "Lo que hacés está bueno de verdad. Grabado "
                                              "con el celular no se nota, y el que mira no "
                                              "puede saberlo."),
        ("Pagaste publicidad y no pasó nada", "Un anuncio interrumpe. Que alguien en quien "
                                              "confían te nombre al aire es otra cosa."),
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
    "cierre": "Tu nicho ya está mirando alguno de nuestros cinco programas. La pregunta "
              "es cuál.",
}

# ---------------------------------------------------------------- que hacemos
SERVICIOS = {
    "eyebrow": "Cómo funciona",
    "titulo": "Tu marca dentro\ndel programa.",
    "intro": "No producimos contenido aparte para tu marca: te subimos a un programa que ya "
             "está al aire y tiene público propio. Así aparecés:",
    "items": [
        ("01", "Te nombra el conductor", "#4DA3FF",
         "No es un aviso que se saltea. Es alguien en quien esa audiencia ya confía "
         "diciendo tu nombre."),
        ("02", "Tu producto en la mesa", "#FF3F4D",
         "En cámara toda la emisión, y se prueba en vivo. Es lo que después más se recorta."),
        ("03", "En las placas y en el cierre", "#50D000",
         "Tu marca entra en la identidad del programa, emisión tras emisión."),
        ("04", "En los clips de la emisión", "#C7A45E",
         "Cada programa deja cuatro a seis verticales, y tu marca viaja en ellos."),
    ],
    "pago": "Se paga en pesos o por canje: ponés producto o servicio y recibís presencia. "
            "Para un comercio, el canje suele ser lo más rápido de arrancar.",
    "excepcion_titulo": "¿Y si querés lo tuyo propio?",
    "excepcion": "Si en vez de aparecer en un programa querés tener el tuyo, se puede. Es "
                 "otro servicio y se cotiza aparte, con el mismo estudio y el mismo equipo.",
    "excepcion_formatos": ["Streaming propio", "Podcast propio", "Live set"],
}

# ---------------------------------------------------------------- cierre
PASOS = {
    "eyebrow": "Cómo empezamos",
    "titulo": "Tres pasos\ny estás al aire.",
    "items": [
        ("01", "Un café y media hora", "Nos contás qué vendés y a quién. De ahí sale el "
                                       "programa."),
        ("02", "Te armamos la propuesta", "Qué programa, de qué forma aparecés y por cuánto "
                                          "tiempo. Con el número cerrado."),
        ("03", "Salís al aire", "Entrás en la emisión y también en los clips de esa semana."),
    ],
}

EQUIPO_TITULO = "El equipo"
EQUIPO_BAJADA = ("Un equipo fijo que produce cinco programas propios todas las semanas, en "
                 "el mismo estudio donde vas a grabar.")
EQUIPO = [
    ("Lorena Rizzo", "Producción Ejecutiva"),
    ("Fabricio Ortega", "Producción General"),
    ("Martina Nagel", "Producción General · asistencia"),
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
