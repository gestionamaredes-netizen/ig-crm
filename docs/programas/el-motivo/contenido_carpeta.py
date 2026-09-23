# -*- coding: utf-8 -*-
"""Carpeta de contenido de El Motivo — temporada 2026.

Qué es el programa, quiénes lo hacen, cómo están armadas las dos horas y qué
se produce alrededor. Para cambiar cualquier dato se edita este archivo.
"""

SLUG = "carpeta"
ARCHIVO = "El-Motivo-carpeta-de-contenido.pdf"
ACENTO = "#F8A858"

PROGRAMA = "El Motivo"
CLAIM = "Ideas que conectan"
CANAL = "Somos Como Somos"
DIA = "Martes · 18 a 20 h (Argentina)"
ESTUDIO = "Nexo Studios · San Martín, Buenos Aires"

CIUDADES = [
    ("San Martín", "Buenos Aires · Argentina", "El piso. Acá se graba."),
    ("Bogotá", "Colombia", "Paula, en vivo, todas las semanas."),
    ("Ibiza", "España", "El canal que lo emite."),
]

EQUIPO = [
    ("Fabricio Benjamín Ortega", "Conducción",
     "Productor audiovisual. Conduce el programa y lo produce: define la rutina, "
     "elige los invitados con el equipo y arma cada emisión."),
    ("Rodrigo García Roko", "Co-conducción · desde el piso",
     "Acompaña la conducción en el estudio. Es la voz de al lado del invitado: "
     "la repregunta, el chiste que afloja y la duda que el que mira también tiene."),
    ("Paula González", "Co-conducción · desde Bogotá",
     "Entra en vivo desde Colombia todas las semanas. Aporta la mirada de "
     "afuera y abre el programa a lo que pasa en el resto de la región."),
]

# ---------------------------------------------------------------- qué es
QUE_ES = {
    "eyebrow": "Qué es",
    "titulo": "Historias de\ngente que se\nanimó.",
    "parrafos": [
        "El Motivo es un magazine en vivo sobre personas que persiguieron algo que "
        "las mueve y lo convirtieron en un proyecto, un oficio o una forma de vivir.",
        "No es un programa de éxitos. Es un programa de procesos: qué había antes de "
        "la idea, qué pasó el día que casi la abandonan, quién les dio una mano y qué "
        "están haciendo esta semana para sostenerla.",
    ],
    "destacado": "Todos tienen un motivo. Pocos lo cuentan en voz alta.",
}

# ---------------------------------------------------------------- estructura
ESTRUCTURA = {
    "eyebrow": "Las dos horas",
    "titulo": "Cómo está\narmada cada\nemisión.",
    "bloques": [
        ("18:00", "Apertura", "10 min",
         "Los tres al aire. Qué se viene, quién es el invitado y la pregunta que "
         "va a atravesar el programa."),
        ("18:10", "El motivo", "35 min",
         "La historia del invitado, contada como proceso y no como currículum. "
         "De dónde salió la idea y qué hubo que romper para sostenerla."),
        ("18:45", "La caja de herramientas", "20 min",
         "El bloque más concreto: cómo se hace lo que hace. Una habilidad, una "
         "herramienta o un método que el que mira se pueda llevar puesto."),
        ("19:05", "El motivo de la calle", "15 min",
         "El material grabado en la calle durante la semana, visto y comentado "
         "en vivo por los tres."),
        ("19:20", "Bogotá", "20 min",
         "El bloque de Paula. Un invitado o un tema desde Colombia, y qué se ve "
         "distinto a mil kilómetros de acá."),
        ("19:40", "El chat pregunta", "15 min",
         "La audiencia entra. Las preguntas se leen al aire y las contesta el "
         "invitado, no la conducción."),
        ("19:55", "El cierre", "5 min",
         "Siempre la misma pregunta al invitado, y la misma al que está mirando: "
         "¿cuál es tu motivo?"),
    ],
}

# ---------------------------------------------------------------- herramientas
HERRAMIENTAS = {
    "eyebrow": "Qué se lleva el que mira",
    "titulo": "Cada programa\ndeja algo\nen la mano.",
    "intro": "«La caja de herramientas» es el bloque que separa a El Motivo de una "
             "entrevista. No alcanza con que la historia inspire: el que mira tiene "
             "que poder hacer algo el miércoles a la mañana.",
    "ejes": [
        ("El primer paso", "Qué hizo el invitado la primera semana, cuando no tenía "
                           "nada. No la versión épica: la versión aburrida y real."),
        ("La herramienta concreta", "El programa, la máquina, el cuaderno o el método "
                                    "que usa todos los días. Se muestra en cámara."),
        ("Cómo se aprende el oficio", "Dónde se estudia, quién enseña, cuánto cuesta y "
                                      "cuánto tarda. Con nombres, no con generalidades."),
        ("El error que costó caro", "Lo que haría distinto. Es lo que más se recorta "
                                    "y lo que más agradece el que está empezando."),
        ("Cómo se sostiene", "De qué vive hoy. Sin esto, la historia es un cuento; "
                             "con esto, es un camino que alguien puede copiar."),
        ("A quién llamar", "Con qué otra persona hay que hablar para seguir. El "
                           "programa deja un contacto, no sólo una sensación."),
    ],
}

# ---------------------------------------------------------------- calle
CALLE = {
    "eyebrow": "El material de la semana",
    "titulo": "El motivo\nsale a la\ncalle.",
    "intro": "Entre programa y programa se sale a grabar. Una cámara, una pregunta y "
             "gente que va al trabajo, espera el colectivo o vuelve a su casa. Es el "
             "material que alimenta las redes y el bloque de las 19:05.",
    "formatos": [
        ("¿Cuánto vale tu tiempo?", "La pregunta madre. Arranca por un número y "
                                    "termina en una conversación sobre la vida."),
        ("¿Cuál es tu sueño?", "El formato que popularizó Simon Squibb: se pregunta, "
                               "se escucha de verdad y, cuando se puede, se ayuda."),
        ("El oficio de al lado", "Se le pregunta a alguien qué hace y cómo lo aprendió. "
                                 "Sale material para la caja de herramientas."),
        ("La pregunta incómoda", "Una sola, directa, sobre plata, miedo o arrepentimiento. "
                                 "Es la que más circula."),
    ],
}

# ---------------------------------------------------------------- convocatoria
CONVOCATORIA = {
    "eyebrow": "A quién buscamos",
    "titulo": "Si tenés un\nmotivo, vení\na contarlo.",
    "intro": "El programa se alimenta de gente que está haciendo algo. No hace falta "
             "que haya terminado ni que le vaya bien todavía.",
    "perfiles": [
        ("El que arrancó algo", "Un proyecto, una marca, un taller, un oficio. "
                                "Aunque esté en el primer mes."),
        ("El que vive de lo que ama", "Y puede contar cómo llegó, con números y con "
                                      "los años que le llevó."),
        ("El que todavía no llegó", "Trabaja de otra cosa y sostiene su motivo a la "
                                    "noche. Esa historia le habla a más gente que la otra."),
        ("El que enseña", "Tiene un oficio y sabe transmitirlo. Es el invitado ideal "
                          "para la caja de herramientas."),
        ("El que volvió a empezar", "Cerró algo, perdió algo, arrancó de nuevo. "
                                    "Es la historia que nadie quiere contar y todos necesitan oír."),
    ],
    "cierre": "No buscamos gente que la tenga clara. Buscamos gente que esté en el medio.",
}

QUE_PEDIMOS = {
    "eyebrow": "Qué necesitamos del invitado",
    "titulo": "Lo que hay\nque traer.",
    "items": [
        ("Una hora y media", "El programa dura dos, pero el invitado entra a las 18:10 "
                             "y se va después del chat. Conviene llegar 20 minutos antes."),
        ("Algo para mostrar", "El producto, la herramienta, una foto del primer día. "
                              "Lo que se ve se recuerda; lo que sólo se cuenta, no."),
        ("Una historia con fecha", "Cuándo empezó, cuándo casi larga, cuándo cambió. "
                                   "Las fechas ordenan el relato y hacen que se entienda."),
        ("Permiso para preguntar", "Si hay un tema que no querés tocar, se avisa antes "
                                   "y no se toca. Lo demás se pregunta."),
        ("Ganas de volver", "Los invitados que funcionan vuelven. El programa se "
                            "construye con gente, no con episodios sueltos."),
    ],
}

# la hora en España cambia a fin de octubre: el canal está allá
NOTA_HORARIO = ("El programa sale 18 h de Argentina. En España eso son las 23 h hasta el "
                "24 de octubre y las 22 h desde el 25, cuando allá cambia la hora.")
