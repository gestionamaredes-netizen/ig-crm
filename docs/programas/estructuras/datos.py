# -*- coding: utf-8 -*-
"""Datos de la hoja de estructura de trabajo de cada programa.

Una hoja por programa, A4, fondo blanco, letra mediana. Es el papel que va
impreso en la carpeta y el PDF que va al Drive, en `1 - Formato`.

Todo el contenido vive aca. Para cambiar una escaleta o un horario se edita
este archivo y se vuelve a correr ./build-estructuras.sh
"""

NEXO_AZUL   = "#1454B4"   # 7.1:1 sobre blanco
NEXO_ROJO   = "#C2292E"   # rojo de marca oscurecido para texto
TINTA       = "#14181F"
TINTA_MEDIA = "#4A5260"
LINEA       = "#D8DDE5"

CARPETAS = [
    ("1 · Formato", "La biblia del programa y esta hoja. Lo que define qué es."),
    ("2 · Guiones", "Guion técnico y guion literario de cada emisión, con la fecha adelante."),
    ("3 · Para técnica", "Lo que técnica recibe antes de encender el piso."),
    ("4 · Gráficas", "Logo, placas, zócalos, arte de redes."),
    ("5 · Invitados", "Fichas, contactos y autorizaciones."),
    ("6 · Emisiones", "Una subcarpeta por programa emitido: máster y clips."),
    ("7 · Redes", "Calendario de publicación y copys."),
    ("8 · Administración", "Sponsors, presupuestos, contratos."),
]

PROGRAMAS = [
    {
        "slug": "tercer-tiempo",
        "carpeta": "02 · Tercer Tiempo",
        "nombre": "Tercer Tiempo",
        "bajada": "Amistad · Pasión · Música",
        "acento": "#3F8F14",
        "que_es": "El pospartido del picado del miércoles. Seis amigos con la birra en la mesa y "
                  "la charla que sale sola cuando ya no importa el resultado.",
        "ficha": [("Formato", "Streaming en vivo · mesa de seis"),
                  ("Emisión", "Miércoles 20:00 a 22:00 · domingos 22:00 a 00:00"),
                  ("Duración", "2 h exactas los dos días"),
                  ("En cámara", "6 en la mesa · elenco a definir"),
                  ("Sectores", "Conducción · entrevistas · live set")],
        "escaletas": [
            ("Miércoles · el día del show", "20:00", [
                ("00", "Apertura", "4'", "Cabecera, los seis en cámara, el titular de la noche."),
                ("01", "El corte", "33'", "Lo que dejó la semana en espectáculo, música y humor."),
                ("", "Tanda 1", "4'", ""),
                ("02", "El invitado", "33'", "Artista de la música, el humor o la tele. Es uno más."),
                ("", "Tanda 2", "4'", ""),
                ("03", "El vivo", "33'", "Banda, solista o stand-up en el live set, y el desafío."),
                ("", "Tanda 3", "4'", ""),
                ("04", "Cierre · El brindis", "5'", "Lo mejor de la noche y qué viene la próxima."),
            ]),
            ("Domingo · el cierre de la semana", "22:00", [
                ("00", "Apertura", "4'", "Igual que el miércoles."),
                ("01", "La fecha", "33'", "Resumen de fútbol y la nota grabada en el club."),
                ("", "Tanda 1", "4'", ""),
                ("02", "Nostalgia", "33'", "Los 90 y los 2000. Un tema, un objeto, votación final."),
                ("", "Tanda 2", "4'", ""),
                ("03", "La semana de cada uno", "33'", "Los seis cuentan la suya y sale el debate."),
                ("", "Tanda 3", "4'", ""),
                ("04", "Cierre · El brindis", "5'", "Igual que el miércoles."),
            ]),
        ],
        "nota": "Tres tandas de 4' por emisión: 12 minutos vendibles. En el guion técnico «tanda» "
                "es el corte comercial y nada más. Al bloque de los 90 se lo llama Nostalgia.",
        "semana": [("Lunes", "Reunión de producción. Se cierra invitado, número en vivo y tema de nostalgia.", "21:00"),
                   ("Martes", "Guion técnico cerrado. Placas y separadores a técnica.", "20:00"),
                   ("Miércoles", "17:00 llegada · 18:00 prueba, seis canales · 19:30 en posición.", "Aire 20:00"),
                   ("Jueves", "Corte de clips del miércoles. Mínimo seis verticales.", "18:00"),
                   ("Viernes", "Se confirma el torneo y se avisa al club.", "22:00"),
                   ("Sábado", "Se graba el tercer tiempo del torneo. Edición esa noche.", "23:00"),
                   ("Domingo", "19:00 llegada · 20:00 prueba · 21:30 en posición.", "Aire 22:00"),
                   ("Lunes", "Corte de clips del domingo. El programa terminó a medianoche.", "18:00")],
        "falta": ["Los seis nombres y qué columna se lleva cada uno.",
                  "La cancha del tráiler y la fecha del picado.",
                  "El primer torneo: un club de la zona.",
                  "El primer sponsor de bloque. Rubro bebida, B1."],
    },
    {
        "slug": "el-motivo",
        "carpeta": "01 · El Motivo",
        "nombre": "El Motivo",
        "bajada": "Ideas que conectan",
        "acento": "#C06A12",
        "que_es": "Magazine urbano en streaming. Historias de gente que sostiene algo: de dónde "
                  "salió la idea, qué hubo que romper para sostenerla, y cómo se hace.",
        "ficha": [("Formato", "Streaming en vivo · magazine"),
                  ("Emisión", "Martes 18:00 a 20:00 (Argentina)"),
                  ("Duración", "2 h"),
                  ("En cámara", "Fabricio (San Martín) · Roko (Florencio Varela) · "
                                "Paula (Bogotá)"),
                  ("Sale por", "Somos Como Somos · canal de Ibiza")],
        "escaletas": [("Martes", "18:00", [
            ("00", "Apertura", "10'", "Los tres al aire. Quién es el invitado y la pregunta "
                                      "que atraviesa el programa."),
            ("01", "El motivo", "35'", "La historia del invitado como proceso, no como "
                                       "currículum."),
            ("02", "La caja de herramientas", "20'", "Cómo se hace lo que hace. Algo que el "
                                                     "que mira se pueda llevar puesto."),
            ("03", "El motivo de la calle", "15'", "El material grabado afuera durante la "
                                                   "semana, comentado en vivo."),
            ("04", "Bogotá", "20'", "El bloque de Paula. Qué se ve distinto a mil kilómetros."),
            ("05", "El chat pregunta", "15'", "Las preguntas las contesta el invitado, no la "
                                              "conducción."),
            ("06", "El cierre", "5'", "Siempre la misma pregunta: ¿cuál es tu motivo?"),
        ])],
        "nota": "La caja de herramientas es lo que separa a El Motivo de una entrevista más, y "
                "la última pregunta es la firma del formato: cierra todos los programas igual y "
                "es el recorte que más circula.",
        "semana": [("Lunes", "Reunión de producción. Se cierra invitado y tema.", "21:00"),
                   ("Martes", "15:00 llegada · 16:00 prueba · 17:30 en posición.", "Aire 18:00"),
                   ("Miércoles", "Corte de clips. Mínimo seis verticales.", "18:00"),
                   ("Jueves", "Se graba El motivo de la calle.", "—"),
                   ("Viernes", "Edición del material de calle y carga de placas.", "20:00")],
        "falta": ["Confirmar el horario de emisión, que está como estimado.",
                  "Cerrar la grilla de invitados del mes.",
                  "Definir quién corta los clips cada miércoles.",
                  "Cómo entra Paula desde Bogotá: plataforma y prueba previa."],
    },
    {
        "slug": "sex-and-the-baires",
        "carpeta": "03 · Sex and the Baires",
        "nombre": "Sex and the Baires",
        "bajada": "Cinco mujeres, cero libreto, en vivo",
        "acento": "#C2145E",
        "que_es": "Una mesa de cinco mujeres de entre 33 y 52 que hablan en vivo de lo que "
                  "normalmente se habla en privado. Sin libreto y sin tema prohibido.",
        "ficha": [("Formato", "IRL · streaming en vivo"),
                  ("Emisión", "Semanal · día y horario a definir"),
                  ("Duración", "80 a 90 min"),
                  ("En cámara", "5 conductoras + columnista"),
                  ("Regla", "Todo lo que toca salud pasa por la columnista")],
        "escaletas": [("Cada emisión", "—", [
            ("00", "Apertura", "5'", "Cold open. Las cinco y el titular de lo que viene."),
            ("01", "El tema", "25'", "Debate libre. Sin moderación rígida: se cruzan."),
            ("02", "Sin filtro", "20'", "Preguntas incómodas y lectura del chat en vivo."),
            ("03", "El diván", "20'", "Columna de la psicóloga: lectura profesional del tema."),
            ("04", "Los cinco puntos", "15'", "Una conclusión por conductora. Pensado para clipear."),
        ])],
        "nota": "El chat es parte del programa, no un adorno. La audiencia vuelve porque "
                "participa. El Diván y Los Cinco Puntos son las dos anclas que se clipean solas.",
        "semana": [("Reunión", "Se cierra el tema de la semana y se avisa a la columnista.", "—"),
                   ("Día de aire", "Llegada 2 h antes. Prueba de cinco micrófonos.", "—"),
                   ("Día siguiente", "Corte de clips. Cuatro a seis verticales.", "—")],
        "falta": ["Día y horario de emisión.",
                  "Las cinco conductoras y la columnista.",
                  "Quién produce el programa dentro del equipo.",
                  "Confirmar si «César de Beach» es este mismo programa."],
    },
    {
        "slug": "pequenos-grandes-sabios",
        "carpeta": "04 · Pequeños Grandes Sabios",
        "nombre": "Pequeños Grandes Sabios",
        "bajada": "Preguntas pequeñas. Grandes conversaciones.",
        "acento": "#1454B4",
        "que_es": "Cinco chicos de 8 a 12 opinan sobre el mundo de los grandes y entrevistan a un "
                  "adulto. La gracia no es que digan cosas graciosas: es lo que preguntan.",
        "ficha": [("Formato", "Streaming IRL en vivo"),
                  ("Emisión", "Semanal o quincenal · a definir"),
                  ("Duración", "45 a 60 min"),
                  ("En cámara", "5 chicos + 1 adulto moderador"),
                  ("Antes de grabar", "Protocolo de menores firmado")],
        "escaletas": [("Cada emisión", "—", [
            ("01", "La pregunta del día", "8'", "Un tema del mundo adulto en lenguaje cotidiano."),
            ("02", "La mesa de los sabios", "17'", "Los cinco discuten. El adulto ordena, no corrige."),
            ("03", "El interrogatorio", "20'", "Entra el invitado grande y preguntan ellos."),
            ("04", "La moraleja al revés", "10'", "Conclusión de los chicos y cierre del moderador."),
        ])],
        "nota": "El protocolo de menores no es papeleo: es lo que hace vendible el programa. "
                "Autorización firmada por chico, un adulto responsable en piso, chat con delay y "
                "criterio de recorte que no exponga escuela, barrio ni rutina.",
        "semana": [("Reunión", "Se cierra el tema y se confirma al invitado grande.", "—"),
                   ("Antes del aire", "Se chequea autorización y adulto responsable de cada chico.", "—"),
                   ("Día de aire", "Chat moderado con delay desde el minuto cero.", "—"),
                   ("Día siguiente", "Corte de clips con criterio de protección de menores.", "—")],
        "falta": ["Día y horario de emisión.",
                  "Los cinco chicos y el adulto moderador.",
                  "El protocolo de menores firmado, antes del primer programa.",
                  "Quién modera el chat en vivo."],
    },
    {
        "slug": "exitosa-yo",
        "carpeta": "05 · Exitosa Yo",
        "nombre": "Exitosa Yo",
        "bajada": "Cómo lo hicieron. Contado por ellas.",
        "acento": "#8A6A22",
        "que_es": "Entrevistas a mujeres emprendedoras y líderes. Cada episodio recorre la "
                  "historia entera y termina con consejos aplicables para la que está por arrancar.",
        "ficha": [("Formato", "Podcast de entrevistas"),
                  ("Grabación", "Semanal · día a definir"),
                  ("Duración", "40 a 55 min"),
                  ("En cámara", "1 conductora + 1 invitada"),
                  ("Regla", "Cada historia deja un dato o una decisión replicable")],
        "escaletas": [("Cada episodio", "—", [
            ("01", "El punto cero", "8'", "Quién es y qué había antes. De dónde salió la idea."),
            ("02", "La pared", "12'", "El obstáculo concreto: cuando casi no sigue."),
            ("03", "El método", "15'", "Decisiones, números, equipo y aprendizajes."),
            ("04", "La caja de herramientas", "12'", "Tres consejos para la que está por arrancar."),
            ("05", "Ping pong", "8'", "Cierre rápido y una recomendación para llevarse."),
        ])],
        "nota": "Al ser podcast no necesita vivo: se pueden grabar dos episodios por jornada y "
                "ahorrar horas de estudio. Es el programa más barato de producir de la grilla.",
        "semana": [("Antes", "Se confirma la invitada y se arma la investigación.", "—"),
                   ("Jornada", "Dos episodios seguidos. Mismo set, mismo armado.", "—"),
                   ("Después", "Edición, capítulos marcados y tres a cinco verticales.", "—")],
        "falta": ["Quién conduce.",
                  "Día de grabación.",
                  "Las primeras cinco invitadas."],
    },
]
