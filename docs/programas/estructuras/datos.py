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
        "corto": "Tercer Tiempo",
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
                ("03", "La semana de cada uno", "20'", "Los seis cuentan la suya y sale el debate."),
                ("04", "Titulando", "13'", "Una foto viral sin contexto. La mesa y el chat le ponen título."),
                ("", "Tanda 3", "4'", ""),
                ("05", "Cierre · El brindis", "5'", "Igual que el miércoles."),
            ]),
        ],
        "nota": "Tres tandas de 4' por emisión: 12 minutos vendibles. En el guion técnico «tanda» "
                "es el corte comercial y nada más. Al bloque de los 90 se lo llama Nostalgia. "
                "Titulando entró sacándole 13' a «La semana de cada uno»: las tandas quedaron "
                "en la misma hora y el domingo pasó a tener cuatro casilleros de sponsor.",
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
        "corto": "El Motivo",
        "carpeta": "01 · El Motivo",
        "nombre": "El Motivo",
        "bajada": "Ideas que conectan",
        "acento": "#C06A12",
        "que_es": "Magazine urbano en streaming. Historias de gente que sostiene algo: de dónde "
                  "salió la idea, qué hubo que romper para sostenerla, y cómo se hace.",
        "ficha": [("Formato", "Streaming en vivo · magazine"),
                  ("Emisión", "Miércoles 18:00 a 20:00 (Argentina)"),
                  ("Duración", "2 h"),
                  ("En cámara", "Fabricio (San Martín) · Roko (Florencio Varela) · "
                                "Paula (Bogotá)"),
                  ("Sale por", "Somos Como Somos · canal de Ibiza")],
        "escaletas": [("Miércoles", "18:00", [
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
                   ("Martes", "Guion cerrado. Placas y material de calle a técnica.", "20:00"),
                   ("Miércoles", "15:00 llegada · 16:00 prueba · 17:30 en posición.", "Aire 18:00"),
                   ("Jueves", "Corte de clips. Mínimo seis verticales.", "18:00"),
                   ("Viernes", "Se graba El motivo de la calle.", "—"),
                   ("Sábado", "Edición del material de calle.", "20:00")],
        "falta": ["El cruce con Tercer Tiempo: los dos usan el piso a las 20:00.",
                  "Cerrar la grilla de invitados del mes.",
                  "Definir quién corta los clips cada miércoles.",
                  "Cómo entra Paula desde Bogotá: plataforma y prueba previa."],
    },
    {
        "slug": "sex-and-the-baires",
        "corto": "Sex and the Baires",
        "carpeta": "03 · Sex and the Baires",
        "nombre": "Sex and the Baires",
        "bajada": "Cinco mujeres, cero libreto, en vivo",
        "acento": "#C2145E",
        "que_es": "Una mesa de cinco mujeres de entre 33 y 52 que hablan en vivo de lo que "
                  "normalmente se habla en privado. Sin libreto y sin tema prohibido.",
        "ficha": [("Formato", "IRL · streaming en vivo"),
                  ("Emisión", "Domingos 20:00 a 21:00"),
                  ("Duración", "1 h exacta"),
                  ("En cámara", "5 conductoras + columnista"),
                  ("Regla", "Todo lo que toca salud pasa por la columnista")],
        "escaletas": [("Domingo", "20:00", [
            ("00", "Apertura", "4'", "Cold open. Las cinco y el titular de lo que viene."),
            ("01", "El tema", "18'", "Debate libre. Sin moderación rígida: se cruzan."),
            ("02", "Sin filtro", "14'", "Preguntas incómodas y lectura del chat en vivo."),
            ("03", "El diván", "14'", "Columna de la psicóloga: lectura profesional del tema."),
            ("04", "Los cinco puntos", "10'", "Una conclusión por conductora. Pensado para clipear."),
        ])],
        "nota": "El chat es parte del programa, no un adorno. La audiencia vuelve porque "
                "participa. El Diván y Los Cinco Puntos son las dos anclas que se clipean solas.",
        "semana": [("Miércoles", "Se cierra el tema del domingo y se avisa a la columnista.", "—"),
                   ("Viernes", "Guion cerrado. Placas a técnica.", "20:00"),
                   ("Domingo", "18:30 llegada · 19:00 prueba, cinco canales · 19:45 en posición.",
                    "Aire 20:00"),
                   ("Lunes", "Corte de clips. Cuatro a seis verticales.", "18:00")],
        "falta": ["Las cinco conductoras y la columnista.",
                  "Quién produce el programa dentro del equipo.",
                  "Confirmar si «César de Beach» es este mismo programa."],
    },
    {
        "slug": "pequenos-grandes-sabios",
        "corto": "Peq. Grandes Sabios",
        "carpeta": "04 · Pequeños Grandes Sabios",
        "nombre": "Pequeños Grandes Sabios",
        "bajada": "Preguntas pequeñas. Grandes conversaciones.",
        "acento": "#1454B4",
        "que_es": "Cinco chicos de 8 a 12 opinan sobre el mundo de los grandes y entrevistan a un "
                  "adulto. La gracia no es que digan cosas graciosas: es lo que preguntan.",
        "ficha": [("Formato", "Streaming IRL en vivo"),
                  ("Emisión", "Domingos 18:00 a 19:00"),
                  ("Duración", "1 h exacta"),
                  ("En cámara", "5 chicos + 1 adulto moderador"),
                  ("Antes de grabar", "Protocolo de menores firmado")],
        "escaletas": [("Domingo", "18:00", [
            ("01", "La pregunta del día", "8'", "Un tema del mundo adulto en lenguaje cotidiano."),
            ("02", "La mesa de los sabios", "18'", "Los cinco discuten. El adulto ordena, no corrige."),
            ("03", "El interrogatorio", "22'", "Entra el invitado grande y preguntan ellos."),
            ("04", "La moraleja al revés", "12'", "Conclusión de los chicos y cierre del moderador."),
        ])],
        "nota": "El protocolo de menores no es papeleo: es lo que hace vendible el programa. "
                "Autorización firmada por chico, un adulto responsable en piso, chat con delay y "
                "criterio de recorte que no exponga escuela, barrio ni rutina.",
        "semana": [("Miércoles", "Se cierra el tema y se confirma al invitado grande.", "—"),
                   ("Viernes", "Se chequea autorización y adulto responsable de cada chico.", "20:00"),
                   ("Domingo", "16:30 llegada de chicos y adultos · 17:00 prueba · 17:45 en "
                               "posición. Chat con delay desde el minuto cero.", "Aire 18:00"),
                   ("Lunes", "Corte de clips con criterio de protección de menores.", "18:00")],
        "falta": ["Los cinco chicos y el adulto moderador.",
                  "El protocolo de menores firmado, antes del primer programa.",
                  "Quién modera el chat en vivo."],
    },
    {
        "slug": "exitosa-yo",
        "corto": "Exitosa Yo",
        "carpeta": "05 · Exitosa Yo",
        "nombre": "Exitosa Yo",
        "bajada": "Cómo lo hicieron. Contado por ellas.",
        "acento": "#8A6A22",
        "que_es": "Entrevistas a mujeres emprendedoras y líderes. Cada episodio recorre la "
                  "historia entera y termina con consejos aplicables para la que está por arrancar.",
        "ficha": [("Formato", "Podcast de entrevistas"),
                  ("Emisión", "Miércoles 16:30 a 17:30"),
                  ("Duración", "1 h exacta"),
                  ("En cámara", "1 conductora + 1 invitada"),
                  ("Regla", "Cada historia deja un dato o una decisión replicable")],
        "escaletas": [("Miércoles", "16:30", [
            ("01", "El punto cero", "9'", "Quién es y qué había antes. De dónde salió la idea."),
            ("02", "La pared", "13'", "El obstáculo concreto: cuando casi no sigue."),
            ("03", "El método", "17'", "Decisiones, números, equipo y aprendizajes."),
            ("04", "La caja de herramientas", "13'", "Tres consejos para la que está por arrancar."),
            ("05", "Ping pong", "8'", "Cierre rápido y una recomendación para llevarse."),
        ])],
        "nota": "Abre el miércoles y es el único que no necesita salir en vivo: se puede grabar "
                "antes y emitir a las 16:30. Grabando de a dos episodios por jornada es el "
                "programa más barato de producir de la grilla.",
        "semana": [("Lunes", "Se confirma la invitada y se arma la investigación.", "21:00"),
                   ("Martes", "Grabación. Conviene doble: dos episodios, mismo armado.", "—"),
                   ("Miércoles", "Emisión 16:30. El piso queda libre a las 17:30 para El Motivo.",
                    "Aire 16:30"),
                   ("Jueves", "Edición, capítulos marcados y tres a cinco verticales.", "18:00")],
        "falta": ["Quién conduce.",
                  "Si sale en vivo o grabado. Si es grabado, la media hora entre las 17:30 y "
                  "las 18:00 queda libre para armar el piso de El Motivo.",
                  "Las primeras cinco invitadas."],
    },
]


# La grilla de la semana. Cada fila: (programa, slug, desde, hasta).
# Las horas se escriben en minutos desde la medianoche del dia de emision, asi
# que un programa que cruza las 00:00 termina en 1440.
GRILLA = {
    "Miércoles": [
        ("Exitosa Yo", "exitosa-yo", "16:30", "17:30"),
        ("El Motivo", "el-motivo", "18:00", "20:00"),
        ("Tercer Tiempo", "tercer-tiempo", "20:00", "22:00"),
    ],
    "Domingo": [
        ("Pequeños Grandes Sabios", "pequenos-grandes-sabios", "18:00", "19:00"),
        ("Sex and the Baires", "sex-and-the-baires", "20:00", "21:00"),
        ("Tercer Tiempo", "tercer-tiempo", "22:00", "24:00"),
    ],
}

# Cuanto tarda en quedar listo el piso para cada programa, una vez que el
# anterior salio del aire. Sale de lo que pide cada formato: desarmar, rearmar
# y probar sonido. Son estimaciones de produccion: el numero que vale es el
# que diga tecnica. No aplica a las transiciones de PASE_DIRECTO.
ARMADO = {
    "exitosa-yo": 30,               # dos butacas, dos canales
    "el-motivo": 45,                # tres canales mas el enlace con Bogota
    "tercer-tiempo": 60,            # seis sillas, seis microfonos, tres sectores
    "sex-and-the-baires": 45,       # cinco canales, living
    "pequenos-grandes-sabios": 60,  # cinco chicos, sus adultos y el chequeo de autorizaciones
}


# Transiciones que el equipo resolvio como pase directo. El piso es el mismo
# y queda aparejado en tres sectores de forma permanente, asi que el que sale
# se levanta y el que entra se sienta: no hay armado en el medio. Lo que si
# hay que sostener son tres cosas. Los seis microfonos quedan nivelados de
# antes y se chequean por linea desde el control, con las llaves abajo,
# mientras el programa anterior esta al aire. La luz entra como preset. Y el
# numero en vivo del miercoles no tiene cuando probar despues de las 18:00,
# porque es la misma sala: prueba antes o no prueba.
PASE_DIRECTO = {("El Motivo", "Tercer Tiempo")}


def minutos(hhmm):
    h, m = (int(x) for x in hhmm.split(":"))
    return h * 60 + m


def transiciones(dia):
    """Devuelve el hueco entre cada programa y el siguiente, y si alcanza.

    El hueco se mide de punta a punta: desde que uno sale del aire hasta que
    el otro entra. Contra eso se compara lo que tarda en armarse el piso del
    que viene. En un pase directo no se arma nada, asi que no necesita nada:
    el ultimo campo de cada fila dice si esa transicion es de las asi.
    """
    filas = GRILLA[dia]
    out = []
    for (n1, _, _, fin), (n2, s2, ini, _) in zip(filas, filas[1:]):
        hueco = minutos(ini) - minutos(fin)
        directo = (n1, n2) in PASE_DIRECTO
        necesita = 0 if directo else ARMADO[s2]
        out.append((n1, n2, hueco, necesita, hueco >= necesita, directo))
    return out


# Quien hace que. Sale de la hoja de roles que ya esta en el drive.
CIRCUITO = [
    ("Dirección General", "Fede Aguirre y Nico Lahargou. Reciben el proyecto y deciden si "
                          "entra a la grilla."),
    ("Producción General", "Fabricio Ortega, con Martina Nagel de asistente. Arma el esquema "
                           "de preproducción y de producción en piso, y se lo pasa a técnica."),
    ("Producción Ejecutiva", "Lorena Rizzo. La parte financiera y administrativa."),
    ("Operación Técnica", "Néstor Mago y su asistente. Switcher, audio, placas y máster."),
]

PASOS = [
    ("Llega el proyecto", "Dirección general se junta con el cliente y define si entra."),
    ("Se arma el esquema", "Producción general escribe qué hace falta antes del piso y qué "
                           "pasa durante el programa."),
    ("Se carga la carpeta de técnica", "Opening, canción de apertura, guion técnico, "
                                       "integrantes, visuales y diseño. Todo en 3 · Para "
                                       "técnica."),
    ("Se prueba el piso", "Sonido canal por canal y cámaras en posición, antes de la hora."),
    ("Sale al aire", "Técnica opera. Producción sigue la rutina y los tiempos."),
    ("Se archiva y se corta", "El máster a 6 · Emisiones esa misma noche. Los clips al día "
                              "siguiente."),
]
