# -*- coding: utf-8 -*-
"""Propuesta interna de programacion — Nexo Studios · Temporada lanzamiento 2026.

Documento interno: solo informacion de como va a ser cada proyecto.
Sin cotizacion, sin argumento de venta y sin paquetes comerciales.
Para cambiar cualquier dato se edita este archivo y se corre ./build-interna.sh
"""

TEMPORADA = "Temporada lanzamiento 2026"
BAJADA_NEXO = "Historias reales. Formatos que conectan."
PAISES = "Argentina · Colombia · España"

STAFF = [
    ("Producción Ejecutiva", "Lorena Rizzo"),
    ("Producción General", "Fabricio Ortega · Martina Nagel"),
    ("Dirección General", "Fede Aguirre · Nico Lahargou"),
    ("Dirección de Marketing", "Julián Barreiro"),
    ("Producción Técnica", "Néstor Mago"),
]

ESTUDIO = [
    ("Cámaras", "5 en piso: 3 PTZ ópticas + 2 Insta360 Link 2C Pro"),
    ("Micrófonos", "6 Shure MV7+ dinámicos cardioide, XLR + USB-C"),
    ("Consola", "Rodecaster Pro II — audio multipista por canal"),
    ("Mesa de sonido", "Behringer X2442USB — 24 canales"),
    ("Switching", "Elgato Stream Deck XL — 32 teclas LCD"),
    ("Monitoreo", "In-ear SE215, talkback y Smart TV 50″ 4K"),
]

SECTORES = [
    ("1 · Conducción", "Escritorio de listones, hasta seis al aire"),
    ("2 · Entrevistas", "Dos sillones y mesa baja contra la cortina"),
    ("3 · Live set", "La alfombra contra los paneles, para música"),
]

PROYECTOS = [
    {
        "n": "01",
        "slug": "sex-and-the-baires",
        "nombre": "Sex and the Baires",
        "bajada": "Sin filtros. Relaciones, experiencias, vida real.",
        "accent": "#F00030",
        "logo": "logo-sex-and-the-baires.jpg", "logo_bg": "#000000",
        "dia": "A definir",
        "concepto": "Mesa de cinco mujeres de 33 a 52 años que hablan en vivo de lo que "
                    "normalmente se habla en privado: maternidad, menopausia, parejas, sexo y "
                    "actualidad. Sin libreto y sin tema prohibido.",
        "ficha": [("Formato", "Streaming en vivo"),
                  ("Duración", "80–90 min"),
                  ("Frecuencia", "Semanal"),
                  ("En cámara", "5 conductoras + columnista psicóloga")],
        "estructura": [("00", "Apertura", "0 – 05'"),
                       ("01", "El tema", "05 – 30'"),
                       ("02", "Sin filtro", "30 – 50'"),
                       ("03", "El diván", "50 – 70'"),
                       ("04", "Los cinco puntos", "70 – 85'")],
        "salida": "Vivo con chat abierto · VOD completo · 4 a 6 clips verticales por emisión · "
                  "versión podcast en audio",
    },
    {
        "n": "02",
        "slug": "exitosa-yo",
        "nombre": "Exitosa Yo",
        "lockup": "EY Podcast",
        "bajada": "Mujeres reales. Conversaciones que inspiran.",
        "accent": "#D0A860",
        "logo": "logo-exitosa-yo.png", "logo_bg": "#000000",
        "dia": "A definir",
        "concepto": "Entrevistas a mujeres emprendedoras y líderes de distintos rubros. "
                    "Historia de vida completa, el obstáculo concreto, cómo se resolvió y "
                    "consejos aplicables para la que está por arrancar.",
        "ficha": [("Formato", "Podcast de entrevistas"),
                  ("Duración", "40–55 min"),
                  ("Frecuencia", "Semanal"),
                  ("En cámara", "1 conductora + 1 invitada")],
        "estructura": [("01", "El punto cero", "0 – 08'"),
                       ("02", "La pared", "08 – 20'"),
                       ("03", "El método", "20 – 35'"),
                       ("04", "La caja de herramientas", "35 – 47'"),
                       ("05", "Ping pong", "47 – 55'")],
        "salida": "Spotify, Apple Podcasts y YouTube Music · episodio completo en YouTube · "
                  "3 a 5 clips verticales por episodio",
    },
    {
        "n": "03",
        "slug": "tercer-tiempo",
        "nombre": "Tercer Tiempo",
        "lockup": "Amistad · Pasión · Música",
        "bajada": "Más que fútbol. Historias que suman.",
        "accent": "#50D000",
        "logo": "logo-tercer-tiempo.png", "logo_bg": "#0A0908",
        "dia": "Miércoles y domingos · 20 a 22 h",
        "concepto": "El pospartido del picado. Seis amigos con la birra en la mesa y la charla "
                    "que sale sola cuando ya no importa el resultado. El miércoles corta la "
                    "semana; el domingo la cierra.",
        "ficha": [("Formato", "Streaming en vivo · mesa de seis"),
                  ("Duración", "2 h exactas"),
                  ("Frecuencia", "Miércoles y domingos"),
                  ("En cámara", "6 en la mesa · elenco a definir")],
        "estructura": [("00", "Apertura", "4'"),
                       ("01", "El corte / La fecha", "33'"),
                       ("02", "El invitado / Los terceros tiempos", "33'"),
                       ("03", "El vivo / Lo que viene", "33'"),
                       ("04", "Cierre · El brindis", "5'")],
        "salida": "Streaming en vivo desde Nexo Studios. Tres tandas por emisión: "
                  "12 minutos vendibles. Plataforma a definir.",
        "nota": ("Estado del proyecto",
                 "Formato definido y biblia escrita. El miércoles recorre los tres sectores del "
                 "estudio y el domingo se queda en la mesa. Faltan los nombres del elenco y el "
                 "primer sponsor."),
    },
    {
        "n": "04",
        "slug": "el-motivo",
        "nombre": "El Motivo",
        "lockup": "Un ciclo de Somos Como Somos",
        "bajada": "Ideas que conectan.",
        "accent": "#F8A858",
        "logo": "logo-el-motivo.png", "logo_bg": "#091A2E",
        "dia": "Martes · 18 a 20 h",
        "concepto": "Magazine urbano en streaming. Entrevistas a personas que se animaron a "
                    "perseguir lo que las mueve: emprendedores, artistas, profesionales. "
                    "Decisiones reales, no motivación de frase.",
        "ficha": [("Formato", "Magazine urbano en streaming"),
                  ("Duración", "2 h"),
                  ("Frecuencia", "Semanal"),
                  ("En cámara", "Fabricio Ortega · Roko (BA) · Paula González (Bogotá)")],
        "estructura": [("01", "La semana urbana", "Panorama"),
                       ("02", "El motivo", "Entrevista central"),
                       ("03", "Antes del sí", "El momento bisagra"),
                       ("04", "Caja de herramientas", "Recursos aplicables"),
                       ("05", "La Mesa", "Cierre con la comunidad")],
        "salida": "Canal de YouTube Somos Como Somos (Ibiza, España), en el bloque Martes de "
                  "Buenos Aires. Martes de 18 a 20 h, hora de Argentina.",
        "nota": ("Estado del proyecto",
                 "Ya lleva tres temporadas al aire. El canal tiene +4.200 suscriptores, +526K "
                 "reproducciones y 8 programas al aire en Ibiza. Roko y Paula están propuestos "
                 "para la co-conducción: falta su confirmación."),
    },
    {
        "n": "05",
        "slug": "pequenos-grandes-sabios",
        "nombre": "Pequeños Grandes Sabios",
        "lockup": "Streaming Kids · @pequenosgrandessabios",
        "bajada": "Curiosidad hoy. Un mundo mejor mañana.",
        "accent": "#FFD21C",
        "logo": "logo-pequenos-grandes-sabios.jpg", "logo_bg": "#000C20",
        "dia": "A definir",
        "concepto": "Cinco chicos de 8 a 12 años entrevistan adultos, comparten sus historias "
                    "y opinan del mundo grande. Un adulto modera y cierra. "
                    "«Preguntas pequeñas. Grandes conversaciones.»",
        "ficha": [("Formato", "Streaming IRL en vivo"),
                  ("Duración", "45–60 min"),
                  ("Frecuencia", "Semanal o quincenal"),
                  ("En cámara", "Sofía · Valentina · Emma · Tomás · Lucas + adulto moderador")],
        "estructura": [("01", "La pregunta del día", "0 – 08'"),
                       ("02", "La mesa de los sabios", "08 – 25'"),
                       ("03", "El interrogatorio", "25 – 45'"),
                       ("04", "La moraleja al revés", "45 – 55'")],
        "salida": "Vivo en YouTube con chat moderado y delay · VOD completo · "
                  "clips verticales recortados con criterio de protección de menores",
        "nota": ("Protocolo de menores",
                 "Autorización firmada por emisión · un adulto responsable por cada chico en el "
                 "estudio · chat con delay y moderación activa · sin apellidos, escuela ni barrio "
                 "al aire · curaduría de temas previa a cada emisión."),
    },
]

NOTA_GRILLA = ("Tercer Tiempo y El Motivo ya tienen día y franja. Los otros tres figuran como "
               "a definir hasta que se cierre la grilla semanal.")
