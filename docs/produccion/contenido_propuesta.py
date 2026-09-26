# -*- coding: utf-8 -*-
"""Propuesta de producción general a producción ejecutiva.

Cómo se organiza producción para sostener la grilla de servicios, qué deja
cada hora y qué hace falta para que funcione. Fondo blanco, uso interno.
"""

SLUG = "propuesta"
ARCHIVO = "Nexo-propuesta-de-produccion-general.pdf"
FUENTE = "servicios"
INTERNO = True
TEMA = "claro"

TITULO_DOC = "Propuesta de producción general · Nexo Studios"

PORTADA = {
    "eyebrow": "Producción general",
    "titulo": "Cómo sostenemos\nla grilla.",
    "bajada": "Qué se está vendiendo, qué deja cada hora y qué necesita producción "
              "para que el estudio pueda cumplir lo que promete la lista de precios.",
    "aviso": "Uso interno · producción ejecutiva",
    "para_t": "Para",
    "para": [("Lorena Rizzo", "Producción Ejecutiva")],
    "firma": "Fabricio Ortega, Producción General, con Martina Nagel en asistencia",
}

# ---------------------------------------------------------------- el encargo
ENCARGO = {
    "eyebrow": "De qué se trata",
    "titulo": "La lista ya\nestá afuera.",
    "parrafos": [
        "La grilla de servicios se publicó con precios cerrados: streaming, podcast y "
        "producción como extra, con paquetes por volumen y descuento por contrato. "
        "Un cliente que la lee espera que el estudio pueda cumplirla.",
        "Esta propuesta es la otra mitad: cómo se organiza producción general para que "
        "cada hora vendida salga bien, qué deja realmente cada servicio y qué hace falta "
        "decidir antes de que el volumen crezca.",
    ],
    "destacado": "El precio ya está prometido. Lo que sigue es poder sostenerlo.",
    "pie": "El encargo",
}

# ---------------------------------------------------------------- qué deja
RENDIMIENTO = {
    "eyebrow": "Lo que deja",
    "titulo": "Cuánto rinde\ncada hora.",
    "intro": "Precio menos costo de operación, servicio por servicio. Es lo que queda "
             "antes de la estructura fija.",
    "nota": "No están descontados el alquiler, la amortización del equipamiento, la "
            "energía ni los sueldos que no se facturan por hora. El margen real sobre la "
            "estructura completa es menor, y ese número todavía no lo tenemos.",
    "pie": "Lo que deja",
}

# ---------------------------------------------------------------- la jornada
JORNADA = {
    "eyebrow": "Cómo se ejecuta",
    "titulo": "Quién hace qué\nel día que\nse graba.",
    "intro": "Una jornada vendida no es abrir el estudio. Son cuatro tareas que tienen "
             "que estar repartidas antes de que llegue el cliente.",
    "roles": [
        ("Operador técnico", "Néstor Mago",
         "Cámaras, audio y switching. Es el que sostiene el piso y el único sin reemplazo."),
        ("Asistente de operación", "Asistencia técnica",
         "Segundo par de manos en cámaras y cableado, y control del material antes de "
         "que alguien se vaya."),
        ("Producción general", "Fabri Ortega",
         "Sólo en las horas contratadas con producción. Rutina, tiempos al aire y "
         "decisiones en vivo."),
        ("Asistencia de producción", "Martu Nagel",
         "Piso, invitados, cronograma y el pase a postproducción."),
    ],
    "nota": "En las horas sin producción contratada, las dos últimas filas no están. El "
            "cliente dirige y nosotros hacemos que funcione, pero nadie del lado nuestro "
            "decide contenido.",
    "pie": "La jornada",
}

# ---------------------------------------------------------------- lo que pedimos
PEDIMOS = {
    "eyebrow": "Lo que hace falta",
    "titulo": "Cuatro cosas\npara poder\ncumplir.",
    "items": [
        ("Formar al asistente como segundo operador",
         "Hoy si Néstor no está, no hay jornada. Es el riesgo más barato de cubrir y el "
         "más caro de no cubrir: una fecha caída con seña tomada."),
        ("Una agenda única del estudio",
         "Con paquetes mensuales y contratos de dos y tres meses, las horas se reservan "
         "con anticipación. Hoy no hay un solo lugar donde se vea qué está tomado."),
        ("Un piso mínimo de preproducción",
         "La preproducción se cotiza por proyecto, pero hay un mínimo que se hace siempre "
         "aunque no se cobre. Conviene saber cuál es y decidir si entra en el precio."),
        ("Una fecha de revisión de tarifas",
         "Los precios son de lanzamiento por tres meses. Hace falta una fecha para "
         "revisarlos, no una conversación cuando ya duela."),
    ],
    "pie": "Lo que pedimos",
}

# ---------------------------------------------------------------- riesgos
RIESGOS = {
    "eyebrow": "Para mirar de cerca",
    "titulo": "Tres cosas\nde la grilla.",
    "items": [
        ("A 16 horas, el asistente se vende por debajo de su costo",
         "Se cobra 10.000 por hora y cuesta 15.000. Cada hora de ese paquete con dotación "
         "completa deja 5.000 menos que con un solo operador. A 20 horas al mes son "
         "100.000 de diferencia."),
        ("Hay dos precios que no existen",
         "Hora suelta y 24 horas con un solo operador no están en la lista. Si un cliente "
         "los pide, hoy hay que inventarlos en el momento."),
        ("El descuento por meses no tiene base definida",
         "No está dicho si el 10% y el 15% se aplican sobre el precio de lista o sobre el "
         "de paquete, que ya viene bonificado. Son números distintos y el cliente va a "
         "preguntar."),
    ],
    "pie": "Riesgos",
}

# ---------------------------------------------------------------- cierre
CIERRE = {
    "eyebrow": "Lo que sigue",
    "titulo": "Qué necesitamos\nde ustedes.",
    "bajada": "Producción general puede sostener la grilla como está. Lo que no puede "
              "hacer sola es cerrar los números que quedaron abiertos.",
    "destacado": "Con estas respuestas cotizamos sin consultar. Sin ellas, cada caso "
                 "fuera de la lista vuelve a pasar por producción ejecutiva.",
    "firmas": [
        ("Fabricio Ortega", "Producción General · Nexo Studios"),
        ("Martina Nagel", "Producción General · asistencia"),
    ],
    "estudio": "Nexo Studios · Hipólito Yrigoyen 4716, Villa Lynch · San Martín",
    "pie": "Lo que sigue",
}
