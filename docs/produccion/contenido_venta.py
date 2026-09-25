# -*- coding: utf-8 -*-
"""El documento que se manda afuera.

Para el que está pensando en producir su contenido en Nexo. No repite la carpeta
interna: no lleva honorarios ni márgenes, solo las dos tarifas de estudio.

Regla de este archivo: no se afirma nada que no se pueda mostrar. Sin números de
audiencia, sin promesas de alcance, sin casos inventados.
"""

SLUG = "venta"
ARCHIVO = "Nexo-produci-en-nexo.pdf"
ACENTO = "#C7A45E"
INTERNO = False

TITULO_DOC = "Producí en Nexo Studios"
TEMPORADA = "Temporada 2026"

PORTADA = {
    "eyebrow": "Nexo Studios · San Martín",
    "titulo": "El martes a\nlas seis se\nprende todo.",
    "bajada": "Y el martes que viene también. Esto es lo que pasa adentro, cuánto sale "
              "y por qué te puede servir.",
    "kicker": "Hipólito Yrigoyen 4716 · Villa Lynch · Buenos Aires",
}

# ---------------------------------------------------------------- ya pasa
YAPASA = {
    "eyebrow": "Antes que nada",
    "titulo": "No te estamos\nvendiendo\nun proyecto.",
    "parrafos": [
        "Los martes a las seis de la tarde, en Villa Lynch, se prenden cinco cámaras y "
        "sale El Motivo en vivo. Dos horas. Con una co-conductora entrando desde Bogotá "
        "y el programa saliendo por un canal que se ve en España.",
        "Va a pasar el martes que viene. Y el otro. Lo decimos primero porque es lo único "
        "de este PDF que no se puede fingir: un estudio que funciona todas las semanas se "
        "nota, y uno que no, también.",
    ],
    "destacado": "La mayoría de los estudios te muestran fotos. Nosotros te mostramos un horario.",
    "pie": "Ya está pasando",
}

# ---------------------------------------------------------------- el problema
PROBLEMA = {
    "eyebrow": "Por qué nos llaman",
    "titulo": "Casi nadie\nllega al cuarto\nprograma.",
    "parrafos": [
        "Los proyectos de contenido no se mueren en la idea. Se mueren en el cuarto episodio.",
        "El primero sale con toda la energía del mundo. El segundo también. Para el tercero "
        "ya hay que resolver el audio de nuevo, conseguir dónde grabar de nuevo, y editar "
        "un domingo a la noche. El cuarto se posterga una semana. Después dos.",
        "No es falta de talento ni de ganas. Es que conducir y producir al mismo tiempo no "
        "se sostiene más de un mes. Alguien tiene que ocuparse de que el día funcione para "
        "que vos puedas ocuparte de lo que vas a decir.",
    ],
    "destacado": "Vos ponés el contenido. Todo lo demás es nuestro problema.",
    "pie": "El problema",
}

# ---------------------------------------------------------------- qué comprás
COMPRAS = {
    "eyebrow": "Las tarifas",
    "titulo": "Los precios,\nacá, sin\npedirlos.",
    "intro": "Publicamos las dos tarifas porque nos ahorra a los dos una reunión. Las dos "
             "incluyen el estudio completo, el equipamiento y el equipo técnico en el piso.",
    "tecnica_para": "Si ya sabés qué vas a grabar",
    "tecnica_d": "Llegás, está todo armado y andando. Operador y asistente en el piso. "
                 "Vos dirigís, nosotros hacemos que funcione.",
    "completa_para": "Si querés que te armemos el programa",
    "completa_d": "Lo anterior más dos personas de producción: una arma la rutina y maneja "
                  "los tiempos al aire, la otra sostiene el piso y controla que el material "
                  "salga completo.",
    "nota": "Las dos tarifas cubren el día de grabación. La preproducción —armar el "
            "formato, la rutina y los invitados— y la edición se cotizan aparte, y se "
            "cierran antes de arrancar. Jornada mínima de dos horas.",
    "pie": "Las tarifas",
}

# ---------------------------------------------------------------- el piso
PISO = {
    "eyebrow": "El piso",
    "titulo": "Lo que hay\nadentro.",
    "intro": "No te vamos a hacer leer la lista completa de equipamiento. Estas son las "
             "cuatro cosas que cambian cómo queda tu programa.",
    "items": [
        ("Cinco cámaras, no una", "Tres PTZ ópticas y dos Insta360 Link 2C Pro. Cinco puntos "
                                  "de vista cambiados en vivo. Es la diferencia entre un "
                                  "programa y un videito."),
        ("Seis micrófonos Shure MV7+", "Uno por persona, dinámicos y cardioides. El audio es "
                                       "lo primero que delata a un contenido hecho en casa, "
                                       "y lo último que la gente perdona."),
        ("Audio multipista", "Rodecaster Pro II y mesa de 24 canales. Cada voz queda en su "
                             "propio canal, así en la edición se arregla una sin romper las otras."),
        ("Switching en vivo", "Stream Deck XL de 32 teclas. El programa sale cortado, con "
                              "placas y separadores. No hay una edición de tres días esperándote."),
    ],
    "sectores_t": "Y tres sectores distintos en la misma sala",
    "sectores": [
        ("Conducción", "Escritorio de listones, hasta seis personas al aire."),
        ("Entrevistas", "Dos sillones y una mesa baja contra la cortina."),
        ("Live set", "La alfombra contra los paneles, para música en vivo."),
    ],
    "nota": "Eso significa que un mismo programa puede cambiar de clima tres veces sin "
            "mover una cámara de lugar.",
    "pie": "El piso",
}

# ---------------------------------------------------------------- néstor
NESTOR = {
    "eyebrow": "El que sostiene el piso",
    "titulo": "Hay un tipo\nal que le dicen\nel Mago.",
    "parrafos": [
        "Se llama Néstor. Opera cámaras, audio y switching al mismo tiempo, en vivo, "
        "todas las semanas.",
        "Lo importante no es la lista de lo que sabe hacer. Es que en vivo siempre se cae "
        "algo —un micrófono, una cámara, la conexión de quien entra desde afuera— y Néstor "
        "lo resuelve antes de que vos te des cuenta de que pasó.",
        "Por eso nunca alquilamos el estudio pelado. No es una política comercial: es que "
        "sin alguien así en la consola, la mitad de las cosas que te prometimos en la "
        "página anterior no ocurren.",
    ],
    "destacado": "Nadie se acuerda del operador cuando todo sale bien. De eso se trata.",
    "pie": "El equipo técnico",
}

# ---------------------------------------------------------------- creativa
CREATIVA = {
    "eyebrow": "Si te falta el formato",
    "titulo": "¿Y si todavía\nno sabés qué\nprograma es?",
    "intro": "Pasa seguido: alguien tiene mucho para decir y ninguna idea de cómo se "
             "convierte eso en un programa. Esa parte también la hacemos.",
    "items": [
        ("Le ponemos forma", "Cuánto dura, cómo abre, qué pasa en cada bloque y cómo "
                             "cierra. Sale de sentarnos juntos, no de un formulario."),
        ("Le ponemos cara", "Nombre, placas, zócalos, separadores. Lo diseña la misma "
                            "gente que después lo va a operar en vivo, así que no hay "
                            "nada lindo que después no se pueda hacer."),
        ("Le ponemos calendario", "Qué se publica entre programa y programa. Sin eso, el "
                                  "contenido se muere en el medio y hay que resucitarlo "
                                  "cada semana."),
        ("Nos quedamos las primeras", "Producción se sienta en las primeras emisiones "
                                      "hasta que el formato camina solo. Después nos corremos."),
    ],
    "nota": "Se cotiza por proyecto y se cierra antes de arrancar. No se factura por hora "
            "ni aparece como sorpresa al final.",
    "pie": "Producción creativa",
}

# ---------------------------------------------------------------- la grilla
GRILLA = {
    "eyebrow": "La temporada",
    "titulo": "Cinco programas\ny una cosa\nen común.",
    "intro": "La grilla 2026 de Nexo. Ninguno está pensado para gustarle a todo el mundo: "
             "cada uno se armó alrededor de una audiencia que se puede describir en una frase.",
    "items": [
        ("El Motivo", "Martes 18 a 20 h, en vivo",
         "Gente que armó algo desde cero. Con co-conducción desde Bogotá y emisión a España."),
        ("Tercer Tiempo", "Dos veces por semana",
         "La sobremesa entre amigos llevada al aire: seis en la mesa."),
        ("Sex and the Baires", "Temporada 2026",
         "Mujeres de 33 a 52 hablando sin filtro de maternidad, parejas y menopausia."),
        ("Exitosa Yo", "Temporada 2026",
         "Mujeres que emprenden o dirigen y buscan herramientas, no frases motivacionales."),
        ("Pequeños Grandes Sabios", "Temporada 2026",
         "Chicos al aire con un adulto moderando. Consumo familiar y compartido."),
    ],
    "nota": "Los mencionamos por una sola razón: si estás pensando tu propio programa, "
            "acá hay cinco formatos distintos funcionando en la misma sala y vas a poder "
            "ver cómo se resolvió cada uno.",
    "pie": "La temporada 2026",
}

# ---------------------------------------------------------------- lo que no
NOHACEMOS = {
    "eyebrow": "Para ser claros",
    "titulo": "Tres cosas que\nacá no vas\na conseguir.",
    "items": [
        ("El estudio vacío",
         "Siempre va con operador. Si lo que buscás es una sala a la que entrar con tu "
         "propio equipo técnico, no somos nosotros, y te lo decimos ahora y no después "
         "de que viniste hasta Villa Lynch."),
        ("Que te prometamos números",
         "Nadie puede garantizarte reproducciones. El que te los promete, te los está "
         "inventando. Lo que sí podemos garantizarte es que el material va a estar bien "
         "hecho y que va a salir todas las semanas."),
        ("Grabar sin haber hablado antes",
         "La preproducción no es un extra que se puede saltear. Cuando se saltea, se paga "
         "igual: en horas de estudio quemadas decidiendo cosas que se decidían por teléfono."),
    ],
    "pie": "Para ser claros",
}

# ---------------------------------------------------------------- cómo empieza
PASOS = {
    "eyebrow": "Cómo empieza",
    "titulo": "Una charla\ny una fecha.",
    "pasos": [
        ("01", "Nos contás qué tenés", "Media hora. No hace falta que vengas con nada "
                                       "resuelto; si vinieras con todo resuelto no nos "
                                       "necesitarías."),
        ("02", "Te decimos qué necesitás", "Cuántas horas, con o sin equipo de producción, "
                                           "y si te conviene que le demos forma al formato "
                                           "o si ya está."),
        ("03", "Presupuesto cerrado", "Con el número final. No hay variables que aparezcan "
                                      "después de grabar."),
        ("04", "Fecha y seña", "La fecha queda tomada con el 50%. El saldo, contra entrega."),
        ("05", "Grabás", "Llegás y está todo andando."),
    ],
    "nota": "Si querés, la primera charla la hacemos en el estudio. Se entiende mucho más "
            "rápido parado adentro que leyendo un PDF.",
    "pie": "Cómo empieza",
}

# ---------------------------------------------------------------- contacto
CONTACTO = {
    "eyebrow": "Hablemos",
    "titulo": "Vení a\nver el piso.",
    "bajada": "Escribinos y coordinamos. Si podés un martes, mejor: vas a ver el estudio "
              "con un programa saliendo en vivo, que es la única manera honesta de mostrarlo.",
    "firmas": [
        ("Fabricio Benjamín Ortega", "Producción General"),
        ("Martina Nagel", "Producción General · asistencia"),
    ],
    "estudio": "Nexo Studios · Hipólito Yrigoyen 4716, Villa Lynch · San Martín, Buenos Aires",
    "pie": "Hablemos",
}
