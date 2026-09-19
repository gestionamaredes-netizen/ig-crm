# -*- coding: utf-8 -*-
"""15 guiones — para el que siempre quiso y nunca arrancó.

Podcast, streaming en vivo y live set (con o sin banda) en Nexo Studios.
El eje es sacar la objeción, no listar el equipamiento.
"""

SLUG = "siempre-quisiste"
ARCHIVO = "Nexo-siempre-quisiste-15-guiones.pdf"
EYEBROW = "Guiones de redes · Primera vez"
TITULO = "Siempre\nquisiste."
TITULO_CORTO = "Siempre quisiste"
BAJADA = ("15 videos de hasta 1 minuto para el que hace años dice que va a hacer un podcast, "
          "un streaming o grabar un tema en vivo. Y todavía no arrancó.")
FIRMA = "Nexo Studios · San Martín, Buenos Aires"
ACENTOS = ["#4DA3FF", "#FF3F4D", "#50D000"]

METODO = [
    ("Los primeros 3 segundos son el video",
     "El gancho va antes que cualquier presentación. Si en el segundo 3 no pasó nada, no hay segundo 10."),
    ("Hablale a la excusa, no al servicio",
     "El que mira ya sabe que existen los estudios. Lo que lo frena es una excusa concreta: atacá esa."),
    ("Usá «vos», no «ustedes»",
     "Cada video le habla a una sola persona que está postergando algo hace años. Nunca a un público."),
    ("Nada de «es fácil»",
     "Si decís que es fácil, el que no arrancó se siente peor. Decí que es más corto de lo que cree."),
    ("Cerrá con una frase, no con «escribinos»",
     "El cierre tiene que poder citarse. El link va en la bio, no en el guion."),
    ("Subtitulado siempre",
     "Se mira sin audio. Un video sin subtítulos es un video a medias."),
]

IDEAS = [
    # ─────────── PODCAST
    {"n": "01", "cat": "Podcast", "vende": "Alquiler de estudio", "dur": "40 s",
     "titulo": "Hace tres años que decís que vas a hacer un podcast",
     "gancho": "Hace tres años que decís que vas a hacer un podcast.",
     "desarrollo": "No te falta tema ni te falta tiempo. Te falta una fecha. El día que reservás "
                   "dos horas de estudio, el podcast deja de ser una idea y pasa a ser algo que "
                   "tenés que preparar para el martes.",
     "recurso": "El estudio montado y vacío, con la silla esperando. Nada más. Que incomode.",
     "cierre": "Un proyecto sin fecha es una charla de after."},

    {"n": "02", "cat": "Podcast", "vende": "Alquiler de estudio", "dur": "45 s",
     "titulo": "No necesitás tener audiencia para empezar",
     "gancho": "«No tengo seguidores, para qué voy a grabar un podcast.»",
     "desarrollo": "Al revés. Nadie tiene audiencia antes de tener contenido. El podcast no se "
                   "hace porque ya te escuchan: te escuchan porque hace meses que lo venís "
                   "haciendo. El episodio uno lo escuchan tus amigos. El veinte, no.",
     "recurso": "Plano cerrado hablando a cámara, sin adornos. Este va de convicción, no de fierros.",
     "cierre": "La audiencia es la consecuencia, no el requisito."},

    {"n": "03", "cat": "Podcast", "vende": "Producción de formato", "dur": "45 s",
     "titulo": "No sabés de qué hablar. Ese no es el problema",
     "gancho": "«No sé de qué hablaría.» Ese no es el problema.",
     "desarrollo": "El problema es que estás buscando un tema para cien episodios en vez de uno "
                   "para el primero. Empezá por lo que ya explicás gratis diez veces por semana "
                   "en WhatsApp. Eso es tu podcast.",
     "recurso": "Un cuaderno donde se van anotando temas rápido, uno abajo del otro.",
     "cierre": "No busques un tema enorme. Buscá el que ya venís repitiendo."},

    {"n": "04", "cat": "Podcast", "vende": "Alquiler de estudio", "dur": "40 s",
     "titulo": "Tu primer episodio va a ser malo",
     "gancho": "Tu primer episodio va a ser malo. Te lo digo ahora así no te sorprende.",
     "desarrollo": "Vas a hablar rápido, te vas a ir por las ramas y no te va a gustar cómo "
                   "suena tu voz. El quinto ya no. El décimo se parece a lo que tenías en la "
                   "cabeza. Nadie empezó bien: empezaron y después mejoraron.",
     "recurso": "Comparar dos tomas de la misma persona con meses de diferencia, si hay material.",
     "cierre": "Nadie empezó bien. Empezaron."},

    {"n": "05", "cat": "Podcast", "vende": "Alquiler por hora", "dur": "40 s",
     "titulo": "No hace falta que sea todas las semanas",
     "gancho": "«No voy a poder sostenerlo todas las semanas.» No hace falta.",
     "desarrollo": "Un podcast quincenal sostenido gana contra uno semanal que se muere en el "
                   "mes dos. Podés grabar cuatro episodios en una jornada de estudio y tener "
                   "dos meses resueltos. La frecuencia se elige, no se sufre.",
     "recurso": "Un calendario mostrando cuatro grabaciones en un día y cómo se reparten en "
                "dos meses.",
     "cierre": "Mejor quincenal para siempre que semanal por seis semanas."},

    # ─────────── STREAMING
    {"n": "06", "cat": "Streaming", "vende": "Streaming en vivo", "dur": "45 s",
     "titulo": "Streaming no es hablarle a cero personas",
     "gancho": "«¿Y si hago un vivo y no me ve nadie?»",
     "desarrollo": "Te va a pasar. El primer vivo lo miran tres personas y dos son tu familia. "
                   "Pero el vivo no se hace solo para el que está: queda grabado, se corta en "
                   "clips y esos clips los ven los que no estaban. El vivo es la materia prima.",
     "recurso": "El contador de espectadores en 3, y al lado los clips de ese mismo vivo con "
                "números mucho más grandes.",
     "cierre": "El vivo se hace en vivo. Se ve después."},

    {"n": "07", "cat": "Streaming", "vende": "Streaming en vivo", "dur": "40 s",
     "titulo": "El vivo da miedo hasta el minuto diez",
     "gancho": "Los primeros diez minutos de un vivo son horribles. Después se te pasa.",
     "desarrollo": "Se te seca la boca, mirás el chat de reojo y te escuchás raro. En el minuto "
                   "diez te olvidás de la cámara y empezás a hablar de verdad. Por eso conviene "
                   "arrancar con algo que sepas de memoria.",
     "recurso": "Alguien tenso al principio del vivo y relajado veinte minutos después. El corte "
                "entre los dos momentos es el video.",
     "cierre": "El miedo al vivo tiene fecha de vencimiento: diez minutos."},

    {"n": "08", "cat": "Streaming", "vende": "Dirección técnica", "dur": "45 s",
     "titulo": "No necesitás un equipo de diez personas",
     "gancho": "Creés que para hacer un vivo necesitás un equipo de diez personas.",
     "desarrollo": "Necesitás uno que opere y vos hablando. Las cámaras se mueven solas, el "
                   "switcheo se hace desde una tecla y el audio ya está balanceado antes de que "
                   "arranques. La estructura pesada la pone el estudio, no vos.",
     "recurso": "Plano del control con una sola persona manejando todo, y el piso con el "
                "conductor solo.",
     "cierre": "Vos ponés el programa. La complejidad la ponemos nosotros."},

    {"n": "09", "cat": "Streaming", "vende": "Streaming en vivo", "dur": "40 s",
     "titulo": "Tu primer vivo no tiene que salir perfecto",
     "gancho": "Tu primer vivo no tiene que salir perfecto. Tiene que salir.",
     "desarrollo": "Se te va a caer algo, vas a decir «eh» cincuenta veces y se te va a trabar "
                   "una palabra. A nadie le importa. Lo que la gente no perdona no es el error: "
                   "es que después de anunciarlo tres veces, nunca salga.",
     "recurso": "Bloopers reales del piso, sin música graciosa. Que se vea que pasa siempre.",
     "cierre": "El error se olvida. La fecha que anunciaste y no cumpliste, no."},

    {"n": "10", "cat": "Streaming", "vende": "Streaming en vivo", "dur": "45 s",
     "titulo": "La gente no se queda por la calidad de imagen",
     "gancho": "Nadie se quedó nunca en un vivo por lo bien que se veía.",
     "desarrollo": "Se quedan porque estabas diciendo algo que les interesaba. La calidad no "
                   "trae gente: evita que la gente se vaya. Es el piso, no el techo. El techo "
                   "sigue siendo lo que tenés para decir.",
     "recurso": "Plano bien producido del piso mientras digo esto. La contradicción visual es "
                "el remate.",
     "cierre": "La producción no te consigue público. Te evita perderlo."},

    # ─────────── LIVE SET
    {"n": "11", "cat": "Live set", "vende": "Live set", "dur": "45 s",
     "titulo": "Tocás hace años y no tenés un video decente",
     "gancho": "Tocás hace años y todo lo que tenés es un video vertical grabado por un amigo.",
     "desarrollo": "Hay un sector del estudio armado para eso: sonido propio, luces propias y "
                   "lugar para banda completa. En una tarde salís con un tema grabado en video "
                   "y en audio, listo para subir.",
     "recurso": "Arrancar con un video de celular berreta y cortar al live set encendido con el "
                "primer acorde.",
     "cierre": "Tocás bien hace años. Se nota hace cero."},

    {"n": "12", "cat": "Live set", "vende": "Live set", "dur": "45 s",
     "titulo": "No necesitás banda para grabar en vivo",
     "gancho": "«No tengo banda.» Tampoco hace falta.",
     "desarrollo": "Una guitarra y una voz bien grabadas alcanzan. De hecho, una sesión acústica "
                   "solo funciona mejor que una banda mal registrada. El formato se adapta a lo "
                   "que sos, no al revés.",
     "recurso": "El live set con una sola silla y una guitarra en el medio del espacio grande. "
                "El contraste de escala es el mensaje.",
     "cierre": "Se graba lo que tenés, no lo que te falta."},

    {"n": "13", "cat": "Live set", "vende": "Live set", "dur": "40 s",
     "titulo": "Un tema bien grabado vale más que un disco mal grabado",
     "gancho": "Un solo tema bien grabado te sirve más que diez grabados a las apuradas.",
     "desarrollo": "Porque el que te descubre escucha uno. Si ese suena bien, busca el resto. "
                   "Si suena mal, no hay resto. Empezá por el tema del que estás más seguro y "
                   "grabalo como si fuera lo único que vas a mostrar.",
     "recurso": "Una sola pista reproduciéndose en un reproductor limpio. Sin listas, sin álbum.",
     "cierre": "Nadie te descubre con un disco. Te descubre con un tema."},

    {"n": "14", "cat": "Live set", "vende": "Live set", "dur": "45 s",
     "titulo": "El video en vivo es tu tarjeta de presentación",
     "gancho": "Cuando alguien te quiere contratar, ¿qué le mandás?",
     "desarrollo": "Un productor, un bar o alguien que arma un evento no te va a ir a ver a "
                   "ciegas. Te pide un video. Y ahí se define todo: si le mandás algo grabado "
                   "en vivo y bien registrado, ya entrás distinto a la conversación.",
     "recurso": "Un chat de WhatsApp donde alguien pide «mandame algo» y aparece el video del "
                "live set.",
     "cierre": "Tu mejor video es la primera impresión que no podés repetir."},

    {"n": "15", "cat": "Live set", "vende": "Live set", "dur": "35 s",
     "titulo": "Vení con la guitarra. El resto está",
     "gancho": "Traé la guitarra y nada más.",
     "desarrollo": "Micrófonos, sonido, luces, cámaras y alguien que sepa grabar música ya están "
                   "en el piso. Vos traés el instrumento y el tema ensayado. En una tarde te "
                   "vas con el material listo.",
     "recurso": "Alguien entrando con un estuche de guitarra al hombro y el live set esperando, "
                "encendido.",
     "cierre": "Lo único que no ponemos nosotros es lo que vas a tocar."},
]
