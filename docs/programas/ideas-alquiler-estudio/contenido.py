# -*- coding: utf-8 -*-
"""15 ideas de contenido — Nexo Studios como espacio de alquiler.

Podcast · streaming en vivo · live set. Repartidas entre el equipo.
Videos de hasta 1 minuto, con gancho de retención.
Para editar se toca este archivo y se corre ./build-ideas.sh
"""

TITULO = "Alquilá el estudio"
BAJADA = ("15 videos de hasta 1 minuto para mostrar Nexo Studios como espacio de alquiler: "
          "podcast, streaming en vivo y live set.")
FIRMA = "Nexo Studios · San Martín, Buenos Aires"

# El color le sirve a cada uno para encontrar sus tres pantallas de un vistazo.
EQUIPO = [
    ("fabricio", "Fabricio", "Producción General", "#4DA3FF",
     "Cómo se produce acá adentro: la jornada, qué traer y cuánto rinde el tiempo de piso."),
    ("nico", "Nico", "Dirección General", "#FF3F4D",
     "Por qué el estudio está armado así. El criterio detrás del piso, no la lista de equipos."),
    ("fede", "Fede", "Dirección General", "#C7A45E",
     "La mirada visual: luz, planos y por qué un mismo contenido se ve caro o barato."),
    ("juli", "Juli", "Dirección de Marketing", "#50D000",
     "Qué pasa después de grabar: distribución, clips y cuánto contenido sale de una sesión."),
    ("guido", "Guido", "Rol a confirmar", "#2FC4E8",
     "La experiencia del que llega por primera vez, y el live set como formato."),
]

METODO = [
    ("Los primeros 3 segundos son el video",
     "El gancho va antes que cualquier presentación. Si en el segundo 3 no pasó nada, no hay segundo 10."),
    ("Grabá adentro del estudio, siempre",
     "El producto es el espacio. Cada video se graba en el piso que estamos vendiendo, no en una oficina."),
    ("Mostrá el espacio resolviendo algo",
     "Un tour no vende. Vende ver el problema que el espacio te saca de encima."),
    ("Uno habla, el estudio demuestra",
     "Si lo que decís se puede ver, no lo expliques. Corté al plano y seguí hablando arriba."),
    ("Cerrá con una frase, no con «escribinos»",
     "El cierre tiene que poder citarse. El link va en la bio, no en el guion."),
    ("Subtitulado siempre",
     "Se mira sin audio. Un video sin subtítulos es un video a medias."),
]

IDEAS = [
    # ─────────── FABRICIO · producción
    {
        "n": "01", "quien": "fabricio", "uso": "Podcast", "vende": "Alquiler por hora", "dur": "50 s",
        "titulo": "Llegás al estudio. ¿Y ahora qué?",
        "gancho": "Reservaste dos horas de estudio. Te cuento qué pasa en cada una.",
        "desarrollo": "Llegás y está todo montado: luces puestas, micrófonos probados, cámaras "
                      "en posición. Quince minutos de prueba de sonido, una hora y media de "
                      "grabación real y quince de cierre. No perdés una hora armando nada.",
        "recurso": "Timelapse de la jornada con el reloj sobreimpreso. Que se vea que el set "
                   "ya estaba listo antes de que llegue nadie.",
        "cierre": "No alquilás una sala. Alquilás una jornada resuelta.",
    },
    {
        "n": "02", "quien": "fabricio", "uso": "Podcast", "vende": "Alquiler por hora", "dur": "40 s",
        "titulo": "Vení con el tema, no con el equipo",
        "gancho": "No traigas nada. En serio: nada.",
        "desarrollo": "Micrófonos, cámaras, luces, consola y monitoreo ya están. Lo único que "
                      "traés es el tema, el invitado y las ganas. Si traés un pendrive, mejor: "
                      "te vas con el material el mismo día.",
        "recurso": "Alguien entrando al estudio con las manos vacías, sentándose y arrancando. "
                   "Sin cortes, para que se note lo rápido que es.",
        "cierre": "Lo único que no ponemos nosotros es lo que tenés para decir.",
    },
    {
        "n": "03", "quien": "fabricio", "uso": "Podcast", "vende": "Producción integral", "dur": "45 s",
        "titulo": "Dos horas alcanzan para más de lo que pensás",
        "gancho": "En dos horas de piso sale bastante más que un episodio.",
        "desarrollo": "Sale el programa completo, los cortes de cada bloque, las presentaciones "
                      "para redes y el material de detrás de escena. La diferencia no es el "
                      "tiempo: es llegar con un plan de qué grabar en cada momento.",
        "recurso": "Una grabación y, al lado, todas las piezas que salieron de ella "
                   "desplegándose en pantalla.",
        "cierre": "El tiempo de piso rinde lo que rinde el plan que traés.",
    },

    # ─────────── NICO · criterio del espacio
    {
        "n": "04", "quien": "nico", "uso": "Estudio", "vende": "Alquiler de estudio", "dur": "50 s",
        "titulo": "Este piso está dividido en tres por una razón",
        "gancho": "Este estudio tiene tres sectores. No es decoración.",
        "desarrollo": "El escritorio para una mesa larga, los sillones para una entrevista de "
                      "dos, la alfombra para una banda en vivo. Cada sector con su sonido y su "
                      "luz. Cambiás de registro caminando tres metros, sin mover un mueble.",
        "recurso": "Plano secuencia caminando de un sector al otro, sin corte. El recorrido "
                   "es todo el argumento.",
        "cierre": "Un espacio que sirve para una sola cosa te limita el formato.",
    },
    {
        "n": "05", "quien": "nico", "uso": "Estudio", "vende": "Alquiler de estudio", "dur": "45 s",
        "titulo": "Un estudio no es una sala con luces",
        "gancho": "Cualquier sala con luces parece un estudio. Hasta que empezás a grabar.",
        "desarrollo": "Lo que define un estudio es lo que no se ve: el tratamiento acústico, el "
                      "aire que no zumba, la pared que no rebota, el silencio de fondo. Eso es "
                      "lo que no podés arreglar después en edición.",
        "recurso": "Un A/B de audio real: la misma frase grabada en una sala común y en el piso. "
                   "Sin retocar nada. El audio hace el trabajo.",
        "cierre": "Lo que se ve lo arreglás. Lo que se escucha, no.",
    },
    {
        "n": "06", "quien": "nico", "uso": "Streaming", "vende": "Alquiler de estudio", "dur": "40 s",
        "titulo": "Por qué el fondo es neutro",
        "gancho": "Te vas a preguntar por qué este fondo no tiene la marca de nadie.",
        "desarrollo": "Porque mañana lo usa otro programa. Un fondo neutro se tiñe con luz de "
                      "color en dos minutos y queda del color de tu marca. Si lo pintamos de un "
                      "solo color, sirve para un solo cliente.",
        "recurso": "El mismo fondo cambiando de color tres o cuatro veces, con corte seco entre "
                   "cada uno.",
        "cierre": "El estudio no tiene identidad propia. La toma prestada de la tuya.",
    },

    # ─────────── FEDE · mirada visual
    {
        "n": "07", "quien": "fede", "uso": "Podcast", "vende": "Alquiler de estudio", "dur": "45 s",
        "titulo": "Tu podcast se ve barato por una sola razón",
        "gancho": "Tu podcast no se ve barato por la cámara. Se ve barato por la luz.",
        "desarrollo": "Un celular con buena luz se ve mejor que una cámara cara con el "
                      "plafón del techo prendido. La luz define si hay profundidad o si estás "
                      "aplastado contra la pared. El equipo viene después.",
        "recurso": "La misma persona en el mismo lugar: primero con luz de techo, después con "
                   "la luz del piso armada. Sin cambiar de cámara.",
        "cierre": "No es el equipo. Es dónde está puesta la luz.",
    },
    {
        "n": "08", "quien": "fede", "uso": "Streaming", "vende": "Dirección técnica", "dur": "40 s",
        "titulo": "Tres cámaras cambian cómo te escuchan",
        "gancho": "Un plano fijo de cuarenta minutos cansa aunque lo que digas sea buenísimo.",
        "desarrollo": "Con tres cámaras el corte acompaña la conversación: el general cuando se "
                      "cruzan, el cerrado cuando alguien dice algo fuerte, el de reacción cuando "
                      "el otro escucha. No es estética: es que el que mira no se vaya.",
        "recurso": "El mismo fragmento montado dos veces: plano fijo y multicámara. Poner el "
                   "fijo primero y que se haga largo a propósito.",
        "cierre": "El corte no adorna la charla. La sostiene.",
    },
    {
        "n": "09", "quien": "fede", "uso": "Live set", "vende": "Live set", "dur": "45 s",
        "titulo": "El plano que hace que parezca televisión",
        "gancho": "Hay un solo plano que separa un video casero de uno que parece televisión.",
        "desarrollo": "El general abierto, con profundidad, donde se ve el espacio entero y la "
                      "gente adentro. Es el plano que nadie puede hacer en su casa, porque "
                      "necesita metros y luz de fondo. Todo lo demás se puede improvisar.",
        "recurso": "Abrir con un cerrado cualquiera y cortar de golpe al general del piso "
                   "completo. El golpe visual es el contenido.",
        "cierre": "Lo que no podés simular es el espacio.",
    },

    # ─────────── JULI · lo que pasa después
    {
        "n": "10", "quien": "juli", "uso": "Podcast", "vende": "Distribución", "dur": "45 s",
        "titulo": "Grabaste. ¿Y ahora quién lo ve?",
        "gancho": "Grabar es la parte fácil. El problema empieza cuando apagás las luces.",
        "desarrollo": "Un episodio que solo sale entero en un canal muere en una semana. El "
                      "mismo episodio cortado en verticales, en audio y en citas para texto "
                      "aparece en cuatro lugares distintos durante un mes.",
        "recurso": "Un episodio en el centro y las piezas saliendo hacia afuera, cada una con "
                   "el logo de su plataforma.",
        "cierre": "No necesitás grabar más. Necesitás repartir mejor.",
    },
    {
        "n": "11", "quien": "juli", "uso": "Podcast", "vende": "Distribución", "dur": "50 s",
        "titulo": "Una sesión, seis semanas de contenido",
        "gancho": "De una tarde de grabación salen seis semanas de posteos.",
        "desarrollo": "Cuatro clips verticales, el episodio completo, la versión en audio, dos "
                      "citas para gráfica y el detrás de escena. Si cae uno por día hábil, una "
                      "sola sesión te cubre el calendario más de un mes.",
        "recurso": "Un calendario llenándose casilla por casilla, con el material de una sola "
                   "grabación.",
        "cierre": "El problema no es no tener tiempo. Es grabar sin plan de corte.",
    },
    {
        "n": "12", "quien": "juli", "uso": "Streaming", "vende": "Distribución", "dur": "40 s",
        "titulo": "El clip vertical no es un recorte",
        "gancho": "Cortar un pedazo del medio no es hacer un clip.",
        "desarrollo": "Un clip necesita arrancar en el momento más fuerte, no donde empezó la "
                      "frase. Por eso el corte se piensa mientras se graba: alguien anota el "
                      "minuto cuando pasa algo, y después no hay que ver dos horas de material.",
        "recurso": "Pantalla partida: el corte mal hecho que arranca a media frase y el corte "
                   "bien hecho que arranca en la frase fuerte.",
        "cierre": "Los buenos clips se marcan grabando, no editando.",
    },

    # ─────────── GUIDO · experiencia y live set
    {
        "n": "13", "quien": "guido", "uso": "Live set", "vende": "Live set", "dur": "50 s",
        "titulo": "Acá también toca una banda",
        "gancho": "Esto no es solo para hablar. Acá se toca en vivo.",
        "desarrollo": "El sector del live set tiene su propio sonido, su iluminación y lugar "
                      "para banda completa. Sirve para una sesión acústica, para un tema en "
                      "vivo dentro de un programa o para grabar un video musical en una tarde.",
        "recurso": "Arrancar con el silencio del piso vacío y cortar al primer acorde con el "
                   "set encendido.",
        "cierre": "Si suena en vivo, se graba en vivo.",
    },
    {
        "n": "14", "quien": "guido", "uso": "Estudio", "vende": "Alquiler de estudio", "dur": "45 s",
        "titulo": "Tu primera vez en un estudio",
        "gancho": "Nunca grabaste en un estudio y te da un poco de vergüenza. Es normal.",
        "desarrollo": "Nadie te va a apurar. Te sentás, probamos sonido, hacés dos minutos de "
                      "prueba que no se usan y recién ahí arrancamos. La mayoría se olvida de "
                      "las cámaras a los diez minutos.",
        "recurso": "Alguien nervioso al principio y la misma persona, relajada, veinte minutos "
                   "después. El corte entre los dos momentos es todo.",
        "cierre": "La primera vez es rara para todos. Y dura diez minutos.",
    },
    {
        "n": "15", "quien": "guido", "uso": "Estudio", "vende": "Sesiones sueltas", "dur": "40 s",
        "titulo": "No hace falta que tengas un programa",
        "gancho": "No necesitás tener un podcast para venir a grabar acá.",
        "desarrollo": "Vienen marcas a grabar contenido de un día, gente que necesita videos "
                      "para su web, profesionales armando su material de redes y músicos "
                      "haciendo una sesión. No hay que sostener un ciclo para usar el piso.",
        "recurso": "Cortes rápidos de usos distintos del mismo espacio, uno por segundo.",
        "cierre": "El estudio se alquila por horas, no por temporada.",
    },
]
