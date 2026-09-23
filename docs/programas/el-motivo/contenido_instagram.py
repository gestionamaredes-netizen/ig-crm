# -*- coding: utf-8 -*-
"""Kit de Instagram de El Motivo.

Todo lo que hay que cargar para abrir la cuenta y las reglas para sostenerla:
usuario, bio, foto, destacadas, la grilla de lanzamiento y la semana tipo.
Para cambiar cualquier dato se edita este archivo.
"""

SLUG = "instagram"
ARCHIVO = "El-Motivo-instagram.pdf"
ACENTO = "#F8A858"

PROGRAMA = "El Motivo"
CLAIM = "Ideas que conectan"
CANAL = "Somos Como Somos"
DIA = "Martes · 18 a 20 h (Argentina)"
ESTUDIO = "Nexo Studios · San Martín, Buenos Aires"

# ---------------------------------------------------------------- portada
PORTADA = {
    "eyebrow": "Kit de cuenta",
    "titulo": "El Instagram\nde El Motivo.",
    "bajada": "Qué cargar el primer día y cómo se sostiene cada semana. "
              "Todo listo para copiar y pegar.",
    "pie": "Instagram",
}

# ---------------------------------------------------------------- posición
POSICION = {
    "eyebrow": "Antes de abrirla",
    "titulo": "Qué es esta\ncuenta.",
    "parrafos": [
        "La cuenta de El Motivo no es el detrás de escena de Nexo ni el perfil "
        "personal de los tres. Es el lugar donde vive el programa entre martes y martes.",
        "Todo lo que se publica tiene que poder contestar una sola pregunta: "
        "¿esto hace que alguien quiera contar su motivo, o que alguien quiera escuchar el de otro?",
    ],
    "silo": [
        ("Sí va", "La historia del invitado, los cortes del vivo, la calle, "
                  "la convocatoria y las herramientas del bloque de oficios."),
        ("No va", "Promoción de Nexo como productora, trabajos para clientes, "
                  "memes sueltos y contenido que no se apoye en una persona real."),
    ],
    "destacado": "Si no hay una persona y un motivo, no es un posteo de El Motivo.",
    "pie": "La cuenta",
}

# ---------------------------------------------------------------- usuario
USUARIO = {
    "eyebrow": "Paso 1",
    "titulo": "Usuario y\nnombre.",
    "intro": "Instagram no avisa si un usuario está libre hasta que lo tipeás. "
             "Van en orden de preferencia: se toma el primero que esté disponible.",
    "opciones": [
        ("elmotivo.tv", "Primera opción",
         "Corto, se dicta fácil por teléfono y el .tv dice que es un programa "
         "sin atarlo a un país. Sirve para los tres territorios."),
        ("elmotivoprograma", "Segunda opción",
         "Más largo pero inequívoco. Bueno si el equipo prefiere que no haya "
         "que explicar qué es el .tv."),
        ("somoselmotivo", "Tercera opción",
         "Suma la idea de comunidad y rima con el canal. Cede claridad "
         "a cambio de tono."),
    ],
    "nombre_lab": "Nombre visible (el que se busca)",
    "nombre": "El Motivo · Ideas que conectan",
    "nombre_nota": "Este campo es el que Instagram usa para el buscador. "
                   "Van las dos palabras por las que alguien nos buscaría: "
                   "el nombre del programa y el claim.",
    "categoria_lab": "Categoría del perfil",
    "categoria": "Programa de televisión",
    "pie": "Usuario",
}

# ---------------------------------------------------------------- bio
BIO = {
    "eyebrow": "Paso 2",
    "titulo": "La bio.",
    "intro": "Tres versiones listas, las tres dentro de los 150 caracteres que "
             "permite Instagram. Se copia una tal cual, con los saltos de línea.",
    "opciones": [
        ("Recomendada", [
            "Historias de gente que se animó.",
            "Martes 18 h en vivo · @somoscomosomos",
            "Contá tu motivo 👇",
        ]),
        ("Más directa", [
            "¿Cuál es tu motivo?",
            "Programa en vivo · Martes 18 h",
            "Se graba en Nexo Studios · San Martín",
        ]),
        ("Más de comunidad", [
            "Ideas que conectan.",
            "Buenos Aires · Bogotá · Ibiza",
            "Martes 18 h · Postulate acá 👇",
        ]),
    ],
    "links_lab": "Los enlaces del perfil",
    "links": [
        ("El canal en vivo", "El link a Somos Como Somos. Va primero: es donde se ve el programa."),
        ("Quiero contar mi motivo", "El formulario de postulación. Es el que más se va a tocar."),
        ("Nexo Studios", "Para el que llega buscando dónde se graba."),
    ],
    "links_nota": "Se cargan los tres con estos títulos, sin acortadores.",
    "pie": "La bio",
}

# ---------------------------------------------------------------- foto
FOTO = {
    "eyebrow": "Paso 3",
    "titulo": "La foto de\nperfil.",
    "parrafos": [
        "El archivo está en la carpeta del kit: es el logo recortado para que "
        "las dos palabras entren enteras dentro del círculo.",
        "Se probaron tres encuadres. El que incluye el claim se vuelve ilegible "
        "en el tamaño chico, así que el claim queda para la bio y la foto se "
        "queda sólo con el logo.",
    ],
    "archivo": "instagram/perfil.png · 1080 × 1080",
    "tamanos": [
        ("150 px", "Cabecera del perfil"),
        ("56 px", "Cada posteo en el feed"),
        ("32 px", "Comentarios y mensajes"),
    ],
    "nota": "Regla para cuando haya que rehacerla: si no se lee a 56 píxeles, no sirve. "
            "Ese es el tamaño con el que la gente nos va a ver casi siempre.",
    "pie": "La foto",
}

# ---------------------------------------------------------------- destacadas
DESTACADAS = {
    "eyebrow": "Paso 4",
    "titulo": "Las destacadas.",
    "intro": "Ocho, en este orden. Las portadas están hechas en la carpeta del kit "
             "(instagram/destacadas). Se crean el primer día aunque estén vacías: "
             "una cuenta con destacadas parece un programa, una sin ellas parece un borrador.",
    "items": [
        ("EMPEZÁ ACÁ", "Qué es el programa, quiénes lo hacen y a qué hora sale. "
                       "Es la que mira el que nos encontró recién."),
        ("SUMATE", "Cómo postularse. La convocatoria, el formulario y qué pasa "
                   "después de que alguien escribe."),
        ("EL VIVO", "Los mejores momentos de cada martes, guardados por emisión."),
        ("LA CALLE", "Las preguntas en la vía pública. El archivo del formato."),
        ("PAULA", "Las entradas desde Bogotá y lo que Paula publica de su lado."),
        ("ROKO", "Lo de Roko: el piso, Florencio Varela y sus convocatorias."),
        ("FABRI", "La conducción y la cocina del programa."),
        ("EL ESTUDIO", "Nexo Studios: dónde se graba y cómo es por dentro."),
    ],
    "nota": "Las tres de los conductores se llenan solas: cada uno sube sus stories "
            "y el que administra la cuenta las guarda en su destacada.",
    "pie": "Destacadas",
}

# ---------------------------------------------------------------- formatos
FORMATOS = {
    "eyebrow": "El motor",
    "titulo": "Cinco formatos\nque se repiten.",
    "intro": "La cuenta no se sostiene con ideas nuevas todas las semanas. "
             "Se sostiene con cinco formatos fijos que ya tienen material escrito.",
    "items": [
        ("El corte", "Reel · miércoles",
         "El mejor minuto de la emisión del martes. Sale al día siguiente, "
         "con el momento más fuerte en los primeros tres segundos."),
        ("¿Cuánto vale tu tiempo?", "Reel · viernes",
         "La pregunta en la calle. Sale del documento de dinámicas: hay 26 preguntas "
         "escritas y cuatro formatos distintos."),
        ("La silla vacía", "Reel · lunes",
         "La convocatoria. Uno de los tres a cámara, menos de un minuto, "
         "pidiendo que alguien venga a contar lo suyo. Hay 90 disparadores escritos."),
        ("El motivo de la semana", "Carrusel · jueves",
         "La historia del invitado en placas: de dónde salió la idea, "
         "el día que casi la abandona y qué está haciendo ahora."),
        ("El martes", "Stories · martes",
         "El día del vivo. Cuenta regresiva a la mañana, el estudio antes de "
         "arrancar, el link fijado durante las dos horas."),
    ],
    "pie": "Formatos",
}

# ---------------------------------------------------------------- semana
SEMANA = {
    "eyebrow": "La rutina",
    "titulo": "La semana\ntipo.",
    "intro": "Todo gira alrededor del martes. Tres posteos en el feed por semana "
             "y stories los días de movimiento. Menos que esto, la cuenta se apaga; "
             "más que esto, no se sostiene.",
    "dias": [
        ("Lun", "La silla vacía", "Reel de convocatoria + anuncio de quién viene el martes."),
        ("Mar", "El vivo", "Stories todo el día. 18 h: link al canal fijado arriba."),
        ("Mié", "El corte", "Reel con el mejor minuto de anoche."),
        ("Jue", "El motivo de la semana", "Carrusel con la historia del invitado."),
        ("Vie", "La calle", "Reel del formato en vía pública."),
        ("Sáb", "—", "Nada en el feed. Se responden mensajes y comentarios."),
        ("Dom", "La pregunta", "Una caja de preguntas en stories. Sirve para el lunes."),
    ],
    "nota": "El domingo a la noche quedan cargados los tres posteos de la semana. "
            "Si el martes hay que decidir qué subir, ya se perdió.",
    "pie": "La semana",
}

# ---------------------------------------------------------------- grilla
GRILLA = {
    "eyebrow": "Paso 5",
    "titulo": "Los primeros\nnueve posteos.",
    "intro": "Antes de invitar a nadie, la cuenta tiene que tener nueve casilleros llenos. "
             "Una cuenta vacía no convence a un invitado ni a un sponsor. Van en este orden, "
             "de arriba a la izquierda hacia abajo.",
    "posts": [
        ("1", "El anuncio", "Reel",
         "Los tres a cámara, uno por ciudad, diciendo la misma frase: «Todos tienen un motivo»."),
        ("2", "Qué es El Motivo", "Carrusel",
         "Seis placas: qué es, cuándo sale, dónde se ve, quiénes lo hacen."),
        ("3", "La primera de la calle", "Reel",
         "«¿Cuánto vale tu tiempo?» grabado antes del estreno. Es la carta de presentación."),
        ("4", "Fabri", "Reel",
         "Quién conduce y por qué armó este programa. Menos de un minuto."),
        ("5", "La silla vacía", "Reel",
         "La convocatoria fuerte. El posteo que va a llevar tráfico al formulario."),
        ("6", "Roko", "Reel",
         "Presentación desde Florencio Varela. Su disparador de convocatoria."),
        ("7", "El estudio", "Carrusel",
         "Nexo Studios por dentro. Da entidad: no somos tres con un celular."),
        ("8", "Paula", "Reel",
         "Presentación desde Bogotá. Deja claro que el programa cruza países."),
        ("9", "La cuenta regresiva", "Reel",
         "Falta una semana. Con fecha, hora y canal en pantalla."),
    ],
    "nota": "Los nueve se graban antes de abrir la cuenta y se suben en tres días, "
            "tres por día. Que la cuenta nazca llena.",
    "pie": "Lanzamiento",
}

# ---------------------------------------------------------------- reglas
REGLAS = {
    "eyebrow": "Para los tres",
    "titulo": "Cómo se\npublica.",
    "items": [
        ("El gancho va en los primeros tres segundos",
         "Nada de «hola, cómo están». Se arranca por la frase más fuerte. "
         "Los 90 disparadores ya están escritos así."),
        ("Subtítulos siempre",
         "La mayoría mira sin sonido. Un reel sin subtítulos es medio reel."),
        ("Paula habla como habla Paula",
         "Ella publica en tuteo colombiano. Fabri y Roko, en voseo. "
         "No se corrige a nadie: que cada uno suene de donde es."),
        ("Una sola cosa por posteo",
         "Un posteo no anuncia el invitado, invita a postularse y avisa el horario. "
         "Hace una de las tres."),
        ("Lo del programa va en la cuenta del programa",
         "Los tres pueden repostear en sus perfiles, pero el original vive acá. "
         "Si se publica primero en el perfil personal, el programa pierde el alcance."),
        ("Se responde todo durante la primera semana",
         "Cada comentario y cada mensaje. Es lo que hace que el algoritmo "
         "entienda que hay alguien del otro lado."),
    ],
    "pie": "Reglas",
}

# ---------------------------------------------------------------- etiquetas
ETIQUETAS = {
    "eyebrow": "Alcance",
    "titulo": "Etiquetas y\ncolaboraciones.",
    "intro": "Las etiquetas suman poco solas. Lo que mueve la aguja es publicar en "
             "colaboración: el posteo aparece en las dos cuentas a la vez y le llega "
             "a los seguidores de las dos.",
    "colab_lab": "Publicar siempre en colaboración con",
    "colab": [
        ("El invitado de la semana", "En el carrusel del jueves y en el corte del miércoles. "
                                     "Es el intercambio más valioso que tenemos para ofrecer."),
        ("Los tres conductores", "Cada reel de convocatoria, en colaboración con "
                                 "el que aparece a cámara."),
        ("El canal", "La pieza del martes, en colaboración con Somos Como Somos."),
    ],
    "hash_lab": "Las etiquetas",
    "hash": [
        ("Fijas", "#ElMotivo · #IdeasQueConectan · #NexoStudios"),
        ("Según el día", "#SanMartin · #Bogota · #FlorencioVarela · #VillaLynch"),
        ("Según el tema", "El oficio o el rubro del invitado. Si viene un panadero, "
                          "va #panaderia, no #emprendedores."),
    ],
    "nota": "Entre cinco y ocho etiquetas por posteo, en el primer comentario o al final "
            "del texto. Treinta etiquetas genéricas no hacen nada.",
    "pie": "Alcance",
}

# ---------------------------------------------------------------- quién
QUIEN = {
    "eyebrow": "Para arrancar",
    "titulo": "Quién hace\nqué.",
    "items": [
        ("Abrir la cuenta y cargar el perfil", "Producción",
         "Usuario, nombre, bio, foto, categoría, enlaces y las ocho destacadas vacías. "
         "Una sola sesión, media hora."),
        ("Grabar los nueve del lanzamiento", "Los tres",
         "Fabri y Roko en el estudio. Paula manda los suyos desde Bogotá. "
         "Todo antes de que la cuenta sea pública."),
        ("Cargar y programar", "Producción",
         "Los nueve en tres días. Después, los tres de cada semana quedan "
         "cargados el domingo."),
        ("Responder", "Producción",
         "Mensajes y comentarios, todos los días de la primera semana. "
         "Las postulaciones que llegan por mensaje se pasan al formulario."),
    ],
    "cierre": "La cuenta se abre cuando los nueve posteos están grabados. No antes.",
    "pie": "Puesta en marcha",
}
