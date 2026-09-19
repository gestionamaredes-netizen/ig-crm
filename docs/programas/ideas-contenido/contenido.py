# -*- coding: utf-8 -*-
"""15 ideas de contenido — Fabricio Benjamín Ortega · Nexo Studios.

Videos de hasta 1 minuto para redes, con gancho de retención.
Para editar cualquier idea se toca este archivo y se corre ./build-ideas.sh
"""

AUTOR = "Fabricio Benjamín Ortega"
ROL = "Productor audiovisual · Consultor en marketing digital"
TITULO = "15 ideas de contenido"
BAJADA = "Videos de hasta 1 minuto para redes, con gancho de retención."

METODO = [
    ("Los primeros 3 segundos son el video",
     "El gancho va antes que cualquier presentación. Si en el segundo 3 no pasó nada, no hay segundo 10."),
    ("Nunca arranques con «hola, soy Fabricio»",
     "Presentarte es lo que hacés cuando ya se quedaron. Si va primero, es una puerta cerrada."),
    ("Un video, una idea",
     "Si tenés dos cosas para decir, son dos videos. El que mete dos pierde las dos."),
    ("Mostrá, no expliques",
     "El estudio es el recurso. Cada idea de esta lista tiene un plano concreto para grabar."),
    ("Cerrá con una frase, no con «seguime»",
     "El cierre tiene que poder citarse. Si se puede repetir, se comparte."),
    ("Subtitulado siempre",
     "Se mira sin audio. Un video sin subtítulos es un video a medias."),
]

IDEAS = [
    {
        "n": "01", "cat": "Audio", "vende": "Producción de audio", "dur": "45 s",
        "titulo": "El podcast que no se puede editar",
        "gancho": "Grabaste dos horas y no tenés un solo clip. Ya sé por qué.",
        "desarrollo": "Grabaste todo en una sola pista. Cuando uno tose, tosen los cinco. "
                      "Cuando uno pisa al otro, no hay forma de separarlos. La consola graba "
                      "un canal por voz: cada persona se edita por separado, sin tocar al resto.",
        "recurso": "Plano de la Rodecaster con los seis canales, y una línea de tiempo con "
                   "una sola pista al lado de otra con seis.",
        "cierre": "Multipista no es un lujo. Es poder editar.",
    },
    {
        "n": "02", "cat": "Técnica", "vende": "Dirección técnica", "dur": "30 s",
        "titulo": "La cámara que se mueve sola",
        "gancho": "No hay nadie detrás de esta cámara.",
        "desarrollo": "Es una PTZ óptica con movimientos programados. Se dispara desde una "
                      "tecla. Tres planos distintos, ninguna persona caminando por el piso, "
                      "ningún invitado mirando a un camarógrafo que se le cruza.",
        "recurso": "La PTZ girando sola, cortado con el dedo apretando la tecla del "
                   "Stream Deck. El movimiento tiene que verse completo.",
        "cierre": "Tu programa no necesita más gente. Necesita mejores botones.",
    },
    {
        "n": "03", "cat": "Estudio", "vende": "Alquiler de estudio", "dur": "50 s",
        "titulo": "Un estudio, tres programas",
        "gancho": "Mismo estudio. Tres programas que no se parecen en nada.",
        "desarrollo": "El escritorio de listones para una mesa de seis. Los sillones contra "
                      "la cortina para una entrevista de dos. La alfombra contra los paneles "
                      "para una banda en vivo. Cada sector con su micrófono, su sonido y su luz.",
        "recurso": "Plano secuencia caminando de un sector al otro, sin corte. El recorrido "
                   "es el argumento.",
        "cierre": "No alquilás un lugar. Alquilás tres.",
    },
    {
        "n": "04", "cat": "Vivo", "vende": "Producción en vivo", "dur": "35 s",
        "titulo": "La voz que el público no escucha",
        "gancho": "El conductor está escuchando a alguien que vos no.",
        "desarrollo": "Se llama talkback. Desde el control le hablo al oído sin entrar a la "
                      "grabación: cortá acá, estirá dos minutos, viene tanda, repreguntá eso. "
                      "El programa se corrige mientras pasa.",
        "recurso": "Pantalla partida: yo hablando al micrófono de control y el conductor "
                   "cambiando de tema en el mismo segundo.",
        "cierre": "Un vivo sin talkback es un vivo sin timón.",
    },
    {
        "n": "05", "cat": "Estrategia", "vende": "Consultoría", "dur": "55 s",
        "titulo": "Tu podcast no falla por el contenido",
        "gancho": "Tu podcast no falla por el contenido. Falla antes de que abras la boca.",
        "desarrollo": "Tres razones, siempre las mismas. No tiene una estructura que se repita, "
                      "así que nadie sabe a qué volver. No tiene un bloque pensado para recortar. "
                      "Y arranca presentándose en vez de arrancar con lo mejor que tiene.",
        "recurso": "Tres placas rápidas, una por razón, con corte seco. Nada de música épica.",
        "cierre": "Arreglá la estructura y el contenido mejora solo.",
    },
    {
        "n": "06", "cat": "Formato", "vende": "Desarrollo de formato", "dur": "45 s",
        "titulo": "Un programa antes de existir",
        "gancho": "Esto es un programa que todavía no salió al aire.",
        "desarrollo": "Bloques con minutaje exacto, columnas con dueño, qué pasa en cada sector "
                      "del piso, cuántos minutos son vendibles en tanda. Cuando llega el día de "
                      "grabar no se improvisa nada: ya está escrito.",
        "recurso": "La biblia de formato en pantalla o impresa, pasando páginas. Que se vea "
                   "la grilla de horarios.",
        "cierre": "Primero se escribe. Después se enciende la luz.",
    },
    {
        "n": "07", "cat": "Comercial", "vende": "Monetización y PNT", "dur": "50 s",
        "titulo": "No vendas el programa",
        "gancho": "Dejá de ofrecerle el programa entero a la marca.",
        "desarrollo": "Vendé un bloque con nombre propio. Se repite todas las semanas, la marca "
                      "es dueña de un momento fijo y la recordación la genera la repetición, no "
                      "el tamaño. Además entra plata de varias marcas a la vez, no de una sola.",
        "recurso": "Placa de bloque patrocinado apareciendo en pantalla, como sale al aire.",
        "cierre": "Un bloque se vende diez veces. Un programa, una.",
    },
    {
        "n": "08", "cat": "Producción", "vende": "Kids y brand safety", "dur": "55 s",
        "titulo": "Si vas a poner chicos al aire",
        "gancho": "Si vas a poner chicos al aire, esto no se negocia.",
        "desarrollo": "Autorización firmada por emisión. Un adulto responsable por cada chico "
                      "en el estudio. Chat con delay y moderación activa. Sin apellidos, sin "
                      "escuela, sin barrio al aire. Curaduría de temas antes de cada programa.",
        "recurso": "Checklist apareciendo ítem por ítem sobre el set de chicos vacío.",
        "cierre": "El protocolo no frena la producción. Es lo que la hace vendible.",
    },
    {
        "n": "09", "cat": "Posproducción", "vende": "Clips y distribución", "dur": "50 s",
        "titulo": "De 40 minutos salen seis videos",
        "gancho": "De esta charla de 40 minutos salen seis videos. Te muestro dónde están.",
        "desarrollo": "El momento en que alguien se ríe de verdad. El dato duro. La pregunta "
                      "incómoda. La contradicción que nadie marcó. El consejo concreto. Y el "
                      "cierre. Esos seis ya estaban en la grabación: solo hay que ir a buscarlos.",
        "recurso": "Línea de tiempo con seis marcadores cayendo uno por uno mientras los nombro.",
        "cierre": "El programa es la materia prima. Los clips son el producto.",
    },
    {
        "n": "10", "cat": "Técnica", "vende": "Técnica y alquiler", "dur": "40 s",
        "titulo": "El micrófono que te arruina el audio",
        "gancho": "Este micrófono es el problema de tu podcast.",
        "desarrollo": "El condensador levanta toda la sala: el ventilador, el vecino, el eco "
                      "contra la pared. En una mesa de cinco personas es un desastre. El "
                      "dinámico cardioide levanta la boca y rechaza el resto.",
        "recurso": "A/B de audio real: la misma frase grabada con los dos, sin retocar nada. "
                   "El audio hace el trabajo.",
        "cierre": "No es el micrófono más caro. Es el que corresponde.",
    },
    {
        "n": "11", "cat": "Estudio", "vende": "Alquiler por hora", "dur": "45 s",
        "titulo": "Sumá lo que ves atrás mío",
        "gancho": "Sumá todo lo que ves acá atrás. Ahora dividilo por las horas que lo vas a usar.",
        "desarrollo": "Seis micrófonos, cinco cámaras, consola, mesa de sonido, switcher, "
                      "retorno y monitoreo. Comprarlo es una inversión que se deprecia y que "
                      "vas a usar cuatro horas por mes. Alquilarlo es un costo por emisión.",
        "recurso": "Paneo lento por todo el equipamiento, con el nombre de cada cosa "
                   "apareciendo como rótulo.",
        "cierre": "No necesitás el estudio. Necesitás las horas.",
    },
    {
        "n": "12", "cat": "Estrategia", "vende": "Consultoría de formato", "dur": "40 s",
        "titulo": "Si arrancás con «bienvenidos», perdiste",
        "gancho": "Si tu programa arranca con «hola, bienvenidos», ya perdiste la mitad.",
        "desarrollo": "El primer minuto es el titular, no el saludo. Arrancá con lo más fuerte "
                      "que va a pasar en todo el programa, aunque pase en el minuto treinta. "
                      "La presentación va después, cuando ya se quedaron.",
        "recurso": "Las dos aperturas del mismo programa, una al lado de la otra. Que se note "
                   "cuál aburre.",
        "cierre": "La bienvenida es para el que ya se quedó.",
    },
    {
        "n": "13", "cat": "Nexo", "vende": "Nexo como productora", "dur": "50 s",
        "titulo": "Cinco programas, un solo piso",
        "gancho": "Estos cinco programas se graban en el mismo lugar.",
        "desarrollo": "Una mesa de mujeres hablando sin filtro. Un podcast de entrevistas a "
                      "emprendedoras. Seis amigos después del picado. Un magazine urbano que "
                      "sale en tres países. Y una mesa de chicos de ocho a doce años.",
        "recurso": "Los cinco logos en corte rápido, y cerrar con el plano general del estudio "
                   "vacío. El contraste es el remate.",
        "cierre": "El estudio no define el programa. Lo habilita.",
    },
    {
        "n": "14", "cat": "Producción", "vende": "Producción integral", "dur": "45 s",
        "titulo": "Por qué tu invitado no vuelve",
        "gancho": "Hay una razón por la que tus invitados no repiten.",
        "desarrollo": "Llegó y estaba todo a medio armar. Esperó cuarenta minutos. Le acercaron "
                      "un micrófono encima de la cara. Nadie le dijo cuánto iba a durar. Un "
                      "invitado bien producido te trae al siguiente sin que se lo pidas.",
        "recurso": "El set ya montado antes de que llegue nadie: agua servida, prueba de "
                   "sonido hecha, luces puestas. Silencio y orden.",
        "cierre": "El invitado es tu mejor canal de captación.",
    },
    {
        "n": "15", "cat": "Vivo", "vende": "Producción multi-locación", "dur": "50 s",
        "titulo": "Tres países, un mismo vivo",
        "gancho": "Ella está en Bogotá. Yo en San Martín. Y esto sale en España.",
        "desarrollo": "Co-conducción remota en vivo, con retorno, talkback y video sincronizado. "
                      "El invitado que se sienta acá no nota la distancia, y el que mira "
                      "tampoco. La producción es la que resuelve que se sienta una sola mesa.",
        "recurso": "Pantalla partida en tres con las tres ciudades, y el plano del control "
                   "manejando las tres señales.",
        "cierre": "La distancia es un problema técnico. Y ya está resuelto.",
    },
]
