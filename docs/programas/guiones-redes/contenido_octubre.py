# -*- coding: utf-8 -*-
"""10 guiones — para el canal Somos Como Somos (Ibiza).

Anuncio: desde octubre, los martes vuelve el bloque desde Buenos Aires.
Los protagonistas en España son Cristian, Diego, Mike y Juan.
"""

SLUG = "octubre-espana"
ARCHIVO = "SomosComoSomos-volvemos-a-Buenos-Aires-10-guiones.pdf"
EYEBROW = "Somos Como Somos · Ibiza"
TITULO = "Los martes\nvolvemos a\nBuenos Aires."
TITULO_CORTO = "Volvemos a Buenos Aires"
BAJADA = ("10 guiones de hasta 1 minuto para anunciar desde el canal que, a partir de "
          "octubre, los martes vuelve el bloque en directo desde Buenos Aires.")
FIRMA = "Desde octubre · Martes"
ACENTOS = ["#C7A45E", "#FF3F4D", "#4DA3FF"]

# Se renderiza como pagina propia: es lo que el equipo de España tiene que
# entender antes de grabar nada.
CONEXION = [
    ("Qué vuelve", "El bloque de los martes con producción desde Buenos Aires. El programa "
                   "es El Motivo, y ya lleva tres temporadas al aire en el canal."),
    ("Desde cuándo", "Desde octubre. El primer martes del mes es el 6."),
    ("Quién está del otro lado", "Nexo Studios, en San Martín, provincia de Buenos Aires. "
                                 "Producción y conducción argentinas, con co-conducción "
                                 "conectada desde Bogotá."),
    ("A qué hora se ve en España", "18 h de Argentina. Hasta el 24 de octubre eso son las "
                                   "23 h en España; desde el 25, cuando cambia la hora acá, "
                                   "pasan a ser las 22 h."),
    ("Qué se ve", "Entrevistas a gente que se animó a perseguir lo que la mueve: "
                  "emprendedores, artistas y profesionales. Historias, no titulares."),
    ("Qué pedimos al público de acá", "Que mande invitados y que pregunte en el chat. "
                                      "El puente funciona en los dos sentidos o no funciona."),
]

METODO = [
    ("Los primeros 3 segundos son el video",
     "El gancho va antes que cualquier presentación. Si en el segundo 3 no pasó nada, no hay segundo 10."),
    ("Decí «vuelve», no «empieza»",
     "No es un estreno: es un regreso. La palabra vuelve carga con las temporadas anteriores."),
    ("Nombrá el día y el mes en el primer tercio",
     "Martes y octubre tienen que estar dichos antes del segundo 20. Es un anuncio, no un teaser."),
    ("Hablá con tu propio trato",
     "Si sos de allá, vosotros. Si sos de acá, ustedes. Lo que no funciona es mezclarlos "
     "en el mismo video."),
    ("Cerrá con una frase, no con «dale like»",
     "El cierre tiene que poder citarse. La llamada a la acción va en el copy del posteo."),
    ("Subtitulado siempre",
     "Se mira sin audio y se mira en tres países. Cuidá los modismos que no cruzan."),
]

IDEAS = [
    {"n": "01", "quien": "Los cuatro", "cat": "El anuncio", "vende": "El bloque", "dur": "30 s",
     "titulo": "Desde octubre, los martes",
     "gancho": "Desde octubre, los martes volvemos a Buenos Aires.",
     "desarrollo": "Es el anuncio, sin vueltas. Vuelve el bloque en directo desde Argentina, "
                   "todos los martes. Cada uno dice una parte de la frase y la última la "
                   "dicen los cuatro juntos.",
     "recurso": "Los cuatro en cámara, plano fijo, cortando entre ellos. Sin música hasta la "
                "última frase.",
     "cierre": "Martes. Octubre. Buenos Aires."},

    {"n": "02", "quien": "Cristian", "cat": "El regreso", "vende": "El bloque", "dur": "40 s",
     "titulo": "«Volvemos» quiere decir algo",
     "gancho": "Decimos volvemos, no empezamos. Y no es lo mismo.",
     "desarrollo": "El programa ya estuvo al aire tres temporadas. No es un estreno a ver qué "
                   "pasa: es un formato que ya funcionó, con gente que ya lo siguió y que "
                   "preguntó cuándo volvía. Octubre es la respuesta.",
     "recurso": "Capturas de episodios anteriores o de comentarios preguntando por la vuelta, "
                "pasando rápido.",
     "cierre": "No estrenamos nada. Retomamos algo."},

    {"n": "03", "quien": "Diego", "cat": "El bloque", "vende": "El bloque", "dur": "45 s",
     "titulo": "Qué es Martes de Buenos Aires",
     "gancho": "En la grilla de este canal hay un bloque que se llama Martes de Buenos Aires.",
     "desarrollo": "Es la franja donde entra lo que se produce del otro lado del Atlántico, "
                   "en un estudio de San Martín. No es contenido reciclado ni doblado: se "
                   "graba allá, en directo, y entra acá el mismo día.",
     "recurso": "La grilla del canal con el bloque marcado, y corte a imágenes del estudio "
                "argentino.",
     "cierre": "No es contenido importado. Es un bloque propio que se hace allá."},

    {"n": "04", "quien": "Mike", "cat": "Horario", "vende": "El bloque", "dur": "40 s",
     "titulo": "A qué hora lo ves desde España",
     "gancho": "Cuando en Buenos Aires son las seis de la tarde, acá ya es de noche.",
     "desarrollo": "El programa sale a las 18 h de Argentina. Hasta el 24 de octubre eso son "
                   "las 23 h en España. Desde el 25, cuando cambiamos la hora, pasan a ser "
                   "las 22 h. Misma cita, una hora antes.",
     "recurso": "Dos relojes juntos, y el de España moviéndose una hora hacia atrás cuando "
                "menciono el cambio.",
     "cierre": "Martes de noche. Aquí de noche, allá con luz."},

    {"n": "05", "quien": "Juan", "cat": "Editorial", "vende": "El programa", "dur": "45 s",
     "titulo": "¿Por qué Buenos Aires?",
     "gancho": "¿Y por qué Buenos Aires, habiendo tantas ciudades?",
     "desarrollo": "Porque es una ciudad donde todo el mundo está montando algo. Gente que se "
                   "fue, que volvió, que se quedó y construyó ahí contra viento y marea. "
                   "Historias de arranque, que es exactamente lo que este canal cuenta.",
     "recurso": "Planos de la ciudad y corte a caras de invitados hablando. Que se vea gente, "
                "no postales.",
     "cierre": "No buscamos una ciudad bonita. Buscamos una ciudad que arranca."},

    {"n": "06", "quien": "Los cuatro", "cat": "El estudio", "vende": "El bloque", "dur": "50 s",
     "titulo": "El estudio del otro lado",
     "gancho": "Este es el estudio desde donde nos van a hablar cada martes.",
     "desarrollo": "Nexo Studios, en San Martín. Tres sectores en un mismo piso: mesa de "
                   "conducción, zona de entrevistas y un live set para música en directo. "
                   "No es una webcam en una habitación: es un estudio de verdad.",
     "recurso": "Material del estudio argentino comentado por ellos en off, con sus caras "
                "en un recuadro reaccionando.",
     "cierre": "Del otro lado hay un estudio, no un ordenador."},

    {"n": "07", "quien": "Cruzado", "cat": "El puente", "vende": "El bloque", "dur": "40 s",
     "titulo": "El saludo de los dos lados",
     "gancho": "Ellos están en Ibiza. Nosotros, en San Martín. Esto es un martes cualquiera.",
     "desarrollo": "Una videollamada en directo entre los cuatro de acá y el equipo de allá, "
                   "grabada tal cual sale: el delay, la risa cruzada, el «se te cortó». "
                   "Ese es el formato y no hay que disimularlo.",
     "recurso": "Pantalla partida real, sin retocar. Si se traba un segundo, se deja: es la "
                "prueba de que es en directo.",
     "cierre": "Diez mil kilómetros y una sola conversación."},

    {"n": "08", "quien": "Diego", "cat": "Invitados", "vende": "El programa", "dur": "45 s",
     "titulo": "A quién van a entrevistar allá",
     "gancho": "Te voy a decir a quién no vas a ver en este programa.",
     "desarrollo": "No vas a ver famosos promocionando algo. Vas a ver a gente que montó una "
                   "marca desde cero, que dejó un trabajo seguro, que volvió a empezar a los "
                   "cuarenta. Gente que probablemente no conozcas y que te va a sonar.",
     "recurso": "Empezar con una silla vacía y un foco, y después caras reales de invitados "
                "pasando rápido.",
     "cierre": "Nombres que no conocés, historias que sí."},

    {"n": "09", "quien": "Mike y Juan", "cat": "Convocatoria", "vende": "Invitados", "dur": "45 s",
     "titulo": "Si estás en España, también hay sitio",
     "gancho": "Esto no va en un solo sentido. Si estás acá, también hay sitio.",
     "desarrollo": "Buscamos gente de España con una historia de arranque para contar: "
                   "emprendedores, artistas, profesionales. Se entra en directo por "
                   "videollamada, con la misma calidad que los que están en el estudio.",
     "recurso": "Los dos hablando a cámara y, al lado, la pantalla del estudio argentino "
                "esperando con una silla libre.",
     "cierre": "El puente cruza en los dos sentidos o no es un puente."},

    {"n": "10", "quien": "Los cuatro", "cat": "Cuenta atrás", "vende": "El bloque", "dur": "30 s",
     "titulo": "El primer martes",
     "gancho": "El primer martes de octubre encendemos esto otra vez.",
     "desarrollo": "Corto y con fecha. Se repite el día, la hora de España y que es en "
                   "directo. Es el video que se sube más cerca del estreno y el que se puede "
                   "volver a subir el mismo martes por la mañana.",
     "recurso": "Cuenta atrás en pantalla y el cartel de EN DIRECTO encendiéndose al final.",
     "cierre": "Martes. En directo. Nos vemos del otro lado."},
]
