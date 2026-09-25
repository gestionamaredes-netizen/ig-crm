# -*- coding: utf-8 -*-
"""Lectura ejecutiva del presupuesto de producción.

Para dirección general (Fede Aguirre, Nico Lahargou) y producción ejecutiva
(Lorena Rizzo). No repite la carpeta: se queda en la plata y en las decisiones
que hay que tomar. Los números salen de tarifas.py.
"""

SLUG = "direccion"
ARCHIVO = "Nexo-presupuesto-lectura-ejecutiva.pdf"
ACENTO = "#4DA3FF"
INTERNO = True

TITULO_DOC = "Lectura ejecutiva · Presupuesto de producción"
TEMPORADA = "Temporada 2026"

PORTADA = {
    "eyebrow": "Lectura ejecutiva",
    "titulo": "Qué deja\ncada hora\nde estudio.",
    "bajada": "La estructura de tarifas, el margen que produce y las cuatro decisiones que "
              "necesitamos que tomen ustedes.",
    "aviso": "Circulación interna · dirección ejecutiva",
    "destinatarios": [
        ("Federico Aguirre", "Dirección General"),
        ("Nicolás Lahargou", "Dirección General"),
        ("Lorena Rizzo", "Producción Ejecutiva"),
    ],
    "firma": "Preparado por Fabricio Ortega, Producción General, con Martina Nagel en asistencia",
}

# ---------------------------------------------------------------- el titular
TITULAR = {
    "eyebrow": "En un renglón",
    "titulo": "Los dos planes\ndejan lo\nmismo.",
    "parrafos": [
        "La hora técnica factura 120.000 y paga 35.000 al equipo técnico. Deja 85.000.",
        "La hora completa factura 50.000 más, pero esos 50.000 se pagan enteros al equipo "
        "de producción general. Deja los mismos 85.000.",
        "Nexo factura más, paga más y le queda igual. Puede ser lo que quieren, pero "
        "conviene decidirlo y no descubrirlo en el balance. Esos 50.000, además, son un "
        "precio promocional y cubren sólo la jornada de piso.",
    ],
    "consecuencia_t": "Qué se sigue de esto",
    "consecuencia": [
        ("Vender la completa no mejora el resultado", "Mejora el del equipo de producción. "
                                                      "Para Nexo, la hora rinde lo mismo."),
        ("El porcentaje sí baja", "De 70,8% a 50,0%, aunque los pesos sean los mismos."),
        ("Lo único que mueve la aguja es la ocupación", "Si cada hora deja lo mismo, el "
                                                        "mes es cuántas horas se vendieron."),
    ],
    "pie": "El titular",
}

# ---------------------------------------------------------------- costo
COSTO = {
    "eyebrow": "La estructura",
    "titulo": "Cómo se\ncompone\nel costo.",
    "intro": "El equipo técnico cobra distinto según la jornada, pero las dos combinaciones "
             "dan el mismo número. La capa de producción se suma sólo en la hora completa.",
    "capas_t": "Las dos capas",
    "capas": [
        ("Equipo técnico", "Operador y asistente. Va siempre, en los dos planes. "
                           "Cuesta lo mismo en una jornada de dos horas que en una de ocho."),
        ("Producción general", "Producción y asistente de producción. Va sólo en la hora "
                               "completa, y se factura al mismo número que se paga."),
    ],
    "nota": "El reparto interno del equipo técnico sí cambia con la jornada: en jornadas "
            "largas el asistente pasa a llevarse el 43% del costo técnico contra el 29% de "
            "las cortas. Para Nexo da igual, pero conviene que sea una decisión.",
    "pie": "La estructura",
}

# ---------------------------------------------------------------- margen
MARGEN = {
    "eyebrow": "El margen",
    "titulo": "Lo que queda\npor jornada.",
    "intro": "Facturación menos costo, jornada por jornada, en los dos planes. "
             "Las dos columnas de margen dan exactamente lo mismo.",
    "nota": "Es el margen de la jornada de piso y sólo descuenta honorarios por hora. No "
            "están el alquiler, la amortización, la energía, los sueldos que no se facturan "
            "por hora ni las horas de preproducción, que hoy no se facturan.",
    "pie": "El margen",
}

# ---------------------------------------------------------------- el delta
DELTA = {
    "eyebrow": "La decisión de precio",
    "titulo": "¿Ciento setenta\nes el número?",
    "parrafos": [
        "Hoy la hora completa está puesta en costo más cero, y como precio promocional: se "
        "cobra exactamente lo que se paga por la capa de producción. Si la intención es que "
        "también deje algo, el precio tiene que estar por encima de 170.000.",
        "Esta tabla es para decidirlo con el número a la vista, no para proponer un aumento.",
    ],
    "escenarios_t": "Qué deja la hora completa según dónde se la ponga",
    "escenarios": [170000, 180000, 190000, 200000],
    "nota_t": "Para igualar el porcentaje de la hora técnica",
    "nota": "Habría que cobrarla cerca de %s la hora, que es otra conversación. La pregunta "
            "realista no es igualar el porcentaje: es si la hora completa tiene que dejar "
            "algo más que cero o si alcanza con que le dé trabajo al equipo.",
    "pie": "La decisión de precio",
}

# ---------------------------------------------------------------- ocupación
OCUPACION = {
    "eyebrow": "El volumen",
    "titulo": "Cuántas horas\nhacen falta.",
    "intro": "Como cada hora deja lo mismo en los dos planes, el resultado del mes es una "
             "multiplicación. Estos son los escenarios de ocupación.",
    "niveles": [
        (20, "Una jornada semanal", "Un programa por semana y poco más."),
        (40, "Dos jornadas semanales", "La grilla actual sosteniéndose."),
        (60, "Tres jornadas semanales", "Con alquiler a terceros entre programa y programa."),
        (100, "Estudio ocupado", "Casi todos los días con algo adentro."),
    ],
    "nota": "No son proyecciones de venta: es la aritmética de la tarifa. La facturación "
            "cambia según el plan; el margen, no. Sirven para saber qué ocupación cubre la "
            "estructura fija, que es el número que todavía no tenemos.",
    "pie": "El volumen",
}

# ---------------------------------------------------------------- riesgos
RIESGOS = {
    "eyebrow": "Para mirar de cerca",
    "titulo": "Tres cosas\nque pueden\nromperse.",
    "items": [
        ("Todo el piso depende de una persona",
         "Néstor opera, y si Néstor no está no hay jornada. El asistente cobra más en "
         "jornadas largas, lo cual está bien, pero todavía no es un reemplazo. Formarlo "
         "como segundo operador es lo más barato que podemos hacer contra este riesgo."),
        ("El costo técnico está fijado en pesos",
         "Las tarifas de hora de estudio y los honorarios están nominados en pesos y no "
         "tienen mecanismo de actualización. Hace falta una fecha de revisión, no una "
         "conversación cuando ya duele."),
        ("El margen que mostramos esconde la estructura fija",
         "Ochenta y cinco mil por hora parece cómodo, pero sólo tiene descontados los "
         "honorarios: alquiler, amortización del equipamiento, energía y los sueldos que no "
         "se facturan por hora no están en ningún lado de este cálculo."),
    ],
    "pie": "Riesgos",
}

# ---------------------------------------------------------------- decisiones
DECISIONES = {
    "eyebrow": "Lo que necesitamos",
    "titulo": "Seis\ndecisiones.",
    "intro": "Ninguna la puede tomar producción. Con estas seis respuestas, "
             "la carpeta de presupuesto queda cerrada y se puede mandar a clientes.",
    "items": [
        ("¿Las tarifas son con IVA incluido o más IVA?",
         "Cambia el número final en un 21% y es lo primero que va a preguntar cualquier "
         "cliente que factura."),
        ("¿La hora completa tiene que dejar algo para Nexo?",
         "Hoy está a costo más cero. Si la respuesta es sí, el precio se mueve; si es no, "
         "queda como está y lo sabemos."),
        ("¿Cómo se reparten los 50.000 entre producción y asistente?",
         "El total está definido, el reparto no. Falta para poder liquidar."),
        ("¿Cuánto vale la preproducción y hasta cuándo rige el promocional?",
         "Hoy la preproducción se hace y no se factura, y el promocional no tiene fecha "
         "de fin. Las dos cosas cuestan plata mientras sigan abiertas."),
        ("¿Los honorarios de producción ejecutiva salen de la hora o se facturan aparte?",
         "Hoy no están en ninguna de las dos tarifas."),
        ("¿Cada cuánto se revisan las tarifas?",
         "Proponemos una fecha fija por trimestre, y que la revisión sea automática y no "
         "una negociación cada vez."),
    ],
    "pie": "Decisiones",
}

# ---------------------------------------------------------------- cierre
CIERRE = {
    "eyebrow": "Cierre",
    "titulo": "Lo que sigue.",
    "bajada": "La carpeta de presupuesto ya está armada y funciona. Le faltan estas seis "
              "respuestas para poder salir de Nexo sin aclaraciones a mano.",
    "destacado": "Con las seis respuestas, cotizamos sin consultar. Sin ellas, cada "
                 "presupuesto vuelve a pasar por ustedes.",
    "firmas": [
        ("Fabricio Benjamín Ortega", "Producción General · Nexo Studios"),
        ("Martina Nagel", "Producción General · asistencia · Nexo Studios"),
    ],
    "pie": "Cierre",
}
