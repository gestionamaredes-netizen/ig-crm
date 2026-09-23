# -*- coding: utf-8 -*-
"""El motivo sale a la calle — formatos de entrevista callejera.

Una cámara, una pregunta y gente que va al trabajo. Alimenta las redes y el
bloque de las 19:05 del programa.
"""

SLUG = "calle"
ARCHIVO = "El-Motivo-el-motivo-en-la-calle.pdf"
QUIEN = "El motivo en la calle"
ROL = "Formato de calle · banco de preguntas"
ACENTO = "#F8A858"
BAJADA = ("Cuatro formatos, el banco de preguntas de cada uno y las reglas para que la "
          "salida rinda. Es el material que más circula y el más barato de producir.")

# se imprime como pagina propia, antes de los disparadores
REGLAS = [
    ("Pedí permiso antes de grabar, siempre",
     "«¿Te puedo hacer una pregunta para un programa? Te estoy grabando.» Si dice que "
     "no, se agradece y se sigue. Una persona molesta arruina la cuadra entera y, si "
     "después no quiere aparecer, el material no se puede usar."),
    ("Una sola pregunta, y después callate",
     "El error de todos: explicar demasiado. Preguntá y bancate el silencio. Los tres "
     "segundos incómodos son donde aparece la respuesta buena."),
    ("No busques la respuesta que querés",
     "Si vas a buscar una frase que ya tenés en la cabeza, se nota y no sirve. La gente "
     "dice cosas mejores que las que uno imaginó."),
    ("Grabá vertical y con micrófono",
     "El teléfono alcanza para la imagen; el audio de la calle, no. Un micrófono de "
     "solapa o de mano cambia todo, y es lo único que hay que comprar."),
    ("Anotá dónde y cuándo",
     "La esquina y la hora. Para el bloque del programa hace falta poder decir «esto "
     "fue un martes a las siete de la tarde en la estación»."),
    ("Si alguien se abre de verdad, dejá de grabar y escuchá",
     "A veces la persona cuenta algo serio. Ahí el material deja de importar. "
     "Preguntale si quiere que se use, y si duda, no se usa."),
]

GRUPOS = [
    ("¿Cuánto vale tu tiempo?", "La pregunta madre del programa. Arranca por un número "
                                "y termina en una conversación sobre la vida. Sirve para "
                                "cualquier persona y en cualquier lugar.", [
        ("¿Cuánto vale una hora de tu tiempo?",
         "La apertura. Casi todos contestan con plata: dejalos, es el punto de partida."),
        ("¿Y cuánto te pagan por hora?",
         "La segunda pregunta. La diferencia entre las dos respuestas es el video."),
        ("¿Cuántas horas de tu semana son realmente tuyas?",
         "Obliga a contar. La cara mientras calcula vale más que la respuesta."),
        ("Si te sobraran dos horas por día, ¿qué harías?",
         "Casi nadie contesta descansar. Ahí aparece el motivo escondido."),
        ("¿Qué estás dejando para más adelante?",
         "La pregunta que más silencios genera. Es la mejor."),
        ("¿Cuánto hace que decís «cuando tenga tiempo»?",
         "Directa. Funciona mejor con gente de más de treinta."),
        ("¿Preferís más plata o más tiempo? ¿Por qué?",
         "Binaria, rápida de editar y muy compartida."),
    ]),
    ("¿Cuál es tu sueño?", "El formato que popularizó Simon Squibb: se pregunta, se "
                           "escucha de verdad y, cuando se puede, se ayuda. La clave no "
                           "es la pregunta: es lo que hacés después de la respuesta.", [
        ("¿Cuál es tu sueño?",
         "Tal cual. No la adornes. Si la persona duda, esperá."),
        ("¿Y qué te falta para empezarlo?",
         "La segunda pregunta, que es la que convierte el video en algo útil."),
        ("¿Se lo contaste a alguien alguna vez?",
         "Mucha gente dice que no. Ese es el momento del video."),
        ("Si mañana no te pagaran por lo que hacés, ¿lo seguirías haciendo?",
         "Separa el trabajo del motivo en una sola pregunta."),
        ("¿Qué querías ser cuando eras chico?",
         "Entrada fácil, sin defensas. Después preguntá qué pasó con eso."),
        ("¿Hay algo que sepas hacer y que nadie sabe que sabés?",
         "Saca oficios y talentos escondidos. Sirve para la caja de herramientas."),
        ("¿Qué necesitarías para arrancar? Decime algo concreto.",
         "Acá el programa puede ayudar de verdad: un contacto, una mención, una silla."),
    ]),
    ("El oficio de al lado", "Se le pregunta a alguien qué hace y cómo lo aprendió. Es "
                             "el que menos circula y el que más material deja para el "
                             "bloque de herramientas.", [
        ("¿A qué te dedicás? ¿Y cómo aprendiste?",
         "Las dos juntas. La segunda es la que importa."),
        ("¿Cuánto tardaste en ser bueno en lo tuyo?",
         "Los números reales rompen la fantasía de la noche a la mañana."),
        ("¿Quién te enseñó?",
         "Casi siempre hay una persona con nombre. Esa es la historia."),
        ("Si tuviera que aprender lo tuyo, ¿por dónde empiezo?",
         "La respuesta es contenido puro para la caja de herramientas."),
        ("¿Qué es lo que la gente cree de tu trabajo y no es cierto?",
         "El mito de cada oficio. Muy compartible dentro del rubro."),
        ("¿Se lo recomendarías a alguien?",
         "La respuesta honesta, buena o mala, siempre sorprende."),
    ]),
    ("La pregunta incómoda", "Una sola, directa, sobre plata, miedo o arrepentimiento. "
                             "Son las que más circulan y las que más cuidado necesitan: "
                             "si la persona se pone mal, se corta y se borra.", [
        ("¿De qué te arrepentís?",
         "La más dura. Usala con gente que ya entró en confianza, no de entrada."),
        ("¿Cuánto ganás? No hace falta que me digas el número exacto.",
         "El permiso al final es lo que la hace posible."),
        ("¿Tenés miedo de algo que no le contás a nadie?",
         "Sólo si la charla ya viene bien. Si no, no."),
        ("¿Estás haciendo lo que querías hacer?",
         "Simple y devastadora. La mejor de las cuatro."),
        ("¿Qué le dirías al vos de hace diez años?",
         "Suaviza el arrepentimiento y saca lo mismo."),
        ("¿Sos feliz con lo que hacés todos los días?",
         "Cerrá con esta. Sirve de cierre del video y del bloque."),
    ]),
]

# donde salir a grabar, con la razon de cada lugar
LUGARES = [
    ("Estación de tren de San Martín", "Hora pico, gente yendo o volviendo del trabajo. "
                                       "Es donde mejor funciona la pregunta del tiempo."),
    ("El corredor de Lacroze, Villa Ballester", "Comercios y gastronomía. Bueno para el "
                                                "oficio de al lado."),
    ("Ferias y polos gastronómicos", "Puestos chicos, dueños trabajando: todos tienen "
                                     "una historia de arranque y están de buen humor."),
    ("La salida de una facultad o un terciario", "Gente joven, sin filtro, que contesta "
                                                 "lo del sueño sin vergüenza."),
    ("Una plaza un domingo a la tarde", "Tiempo de sobra y nadie apurado. Es donde "
                                        "salen las respuestas largas."),
    ("Florencio Varela y Bogotá", "El mismo formato grabado por Roko y por Paula. "
                                  "La misma pregunta en tres lugares es un video solo."),
]
