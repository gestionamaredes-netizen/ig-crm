# -*- coding: utf-8 -*-
"""Propuesta interna de programacion — Nexo Studios.

Documento interno: solo informacion de como va a ser cada proyecto.
Sin cotizacion, sin argumento de venta, sin paquetes comerciales.
Para cambiar cualquier dato se edita este archivo y se corre ./build-interna.sh
"""

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
    ("Monitoreo", "In-ear Shure SE215, talkback control-set, Smart TV 50″ 4K"),
]

PROYECTOS = [
    {
        "n": "01",
        "slug": "sex-and-the-baires",
        "nombre": "Sex and the Baires",
        "accent": "#ED1877",
        "logo": "logo-sex-and-the-baires.png", "logo_bg": "#000000",
        "concepto": "Mesa de cinco mujeres de 33 a 52 años que hablan en vivo de lo que "
                    "normalmente se habla en privado: maternidad, menopausia, parejas, sexo y "
                    "actualidad. Sin libreto y sin tema prohibido.",
        "ficha": [("Formato", "IRL · streaming en vivo"),
                  ("Duración", "80–90 min"),
                  ("Frecuencia", "Semanal"),
                  ("En cámara", "5 conductoras + columnista psicóloga")],
        "estructura": [("00", "Apertura", "0 – 05'"),
                       ("01", "El tema", "05 – 30'"),
                       ("02", "Sin filtro", "30 – 50'"),
                       ("03", "El diván", "50 – 70'"),
                       ("04", "Los cinco puntos", "70 – 85'")],
        "salida": "Vivo en YouTube y Twitch con chat abierto · VOD completo · "
                  "4 a 6 clips verticales por emisión · versión podcast en audio",
    },
    {
        "n": "02",
        "slug": "exitosa-yo",
        "nombre": "Exitosa Yo",
        "lockup": "EY Podcast",
        "accent": "#FF2D8B",
        "logo": "logo-exitosa-yo.png", "logo_bg": "#000000",
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
        "slug": "pequenos-grandes-sabios",
        "nombre": "Pequeños Grandes Sabios",
        "lockup": "Streaming IRL · @pequenosgrandessabios",
        "accent": "#FFD21C",
        "logo": "logo-pequenos-grandes-sabios.png", "logo_bg": "#071A3D",
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
    {
        "n": "04",
        "slug": "el-motivo",
        "nombre": "El Motivo",
        "lockup": "Un ciclo de Somos Como Somos",
        "accent": "#E32C0F",
        "logo": "logo-el-motivo.png", "logo_bg": "#000000",
        "concepto": "Magazine urbano en streaming. Entrevistas a personas que se animaron a "
                    "perseguir lo que las mueve: emprendedores, artistas, profesionales. "
                    "Decisiones reales, no motivación de frase.",
        "ficha": [("Formato", "Magazine urbano en streaming"),
                  ("Duración", "2 h · martes de 21 a 23 h"),
                  ("Frecuencia", "Semanal"),
                  ("En cámara", "Fabricio Ortega · Roko (BA) · Paula González (Bogotá)")],
        "estructura": [("01", "La semana urbana", "Panorama"),
                       ("02", "El motivo", "Entrevista central"),
                       ("03", "Antes del sí", "El momento bisagra"),
                       ("04", "Caja de herramientas", "Recursos aplicables"),
                       ("05", "La Mesa", "Cierre con la comunidad")],
        "salida": "Canal de YouTube Somos Como Somos (Ibiza, España), en el bloque Martes de "
                  "Buenos Aires, después de Ubuntu: Pymes en Foco.",
        "nota": ("Estado del proyecto",
                 "Ya lleva tres temporadas al aire. El canal tiene +4.200 suscriptores, +526K "
                 "reproducciones y 8 programas al aire en Ibiza. Roko y Paula están propuestos "
                 "para la co-conducción: falta su confirmación."),
    },
]

RESUMEN_NOTA = ("Los días y franjas de los tres primeros programas están a definir. "
                "El Motivo ya tiene su lugar fijo: martes de 21 a 23 h.")
