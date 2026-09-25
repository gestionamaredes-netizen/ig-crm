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
    "titulo": "El costo de\nuna hora no\nse mueve.",
    "parrafos": [
        "El equipo técnico cobra distinto según el largo de la jornada: en jornadas de tres "
        "horas o más el operador baja su hora y el asistente la sube. Parece que complica el "
        "cálculo, pero hace lo contrario.",
        "Las dos combinaciones dan el mismo número. Una hora de equipo técnico cuesta lo "
        "mismo en una jornada de dos horas que en una de ocho, y el margen porcentual es "
        "idéntico en todas.",
    ],
    "consecuencia_t": "Qué habilita esto",
    "consecuencia": [
        ("Se cotiza de memoria", "Cualquiera del equipo puede decir un precio sin abrir una "
                                 "planilla y sin equivocarse."),
        ("No hay jornada mala", "Ninguna duración nos conviene menos que otra. Se puede "
                                "vender la que al cliente le sirva."),
        ("El riesgo es la ocupación", "Si el margen no depende del largo, lo único que mueve "
                                      "la aguja es cuántas horas se venden por mes."),
    ],
    "pie": "El titular",
}

# ---------------------------------------------------------------- costo
COSTO = {
    "eyebrow": "La estructura",
    "titulo": "Cómo se\ncompone\nel costo.",
    "intro": "Lo que cobra cada uno por hora, y lo que suma. La última columna es la que "
             "importa: es plana.",
    "nota": "El reparto interno sí cambia: en jornadas largas el asistente pasa a llevarse "
            "el 43% del costo técnico contra el 29% de las jornadas cortas. Para Nexo da "
            "igual, pero conviene que sea una decisión y no un arrastre.",
    "pie": "La estructura",
}

# ---------------------------------------------------------------- margen
MARGEN = {
    "eyebrow": "El margen",
    "titulo": "Lo que queda\npor jornada.",
    "intro": "Facturación menos costo técnico, jornada por jornada, en los dos niveles.",
    "nota": "El margen de la hora completa todavía no es real: no está descontado lo que "
            "cuesta el equipo de producción. Es la primera decisión que pedimos.",
    "pie": "El margen",
}

# ---------------------------------------------------------------- el delta
DELTA = {
    "eyebrow": "La hora completa",
    "titulo": "El salto de\nlos treinta\nmil.",
    "parrafos": [
        "La diferencia entre la hora técnica y la completa es lo que factura el equipo de "
        "producción por estar en el piso. El estudio y la técnica cuestan exactamente lo "
        "mismo en los dos casos.",
        "Mientras no sepamos cuánto cuesta esa hora de producción hacia adentro, el margen "
        "de la hora completa es un número que no podemos defender en una reunión.",
    ],
    "escenarios_t": "Qué pasa según cuánto cueste esa hora",
    "escenarios": [
        (0, "Si la absorbe el equipo fijo"),
        (10000, "Si se paga como asistencia"),
        (20000, "Si se paga como productor"),
        (30000, "Si se paga completa"),
    ],
    "pie": "La hora completa",
}

# ---------------------------------------------------------------- ocupación
OCUPACION = {
    "eyebrow": "El volumen",
    "titulo": "Cuántas horas\nhacen falta.",
    "intro": "Como el margen por hora es fijo, la facturación mensual es una multiplicación. "
             "Estos son los escenarios de ocupación, a hora técnica.",
    "niveles": [
        (20, "Una jornada semanal", "Un programa por semana y poco más."),
        (40, "Dos jornadas semanales", "La grilla actual sosteniéndose."),
        (60, "Tres jornadas semanales", "Con alquiler a terceros entre programa y programa."),
        (100, "Estudio ocupado", "Casi todos los días con algo adentro."),
    ],
    "nota": "No son proyecciones de venta: es la aritmética de la tarifa. Sirven para saber "
            "qué nivel de ocupación hace falta para cubrir la estructura fija, que es el "
            "número que todavía no tenemos.",
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
        ("El margen alto esconde la estructura fija",
         "Setenta por ciento sobre el costo técnico parece cómodo, pero el costo técnico no "
         "es el único costo: alquiler, amortización del equipamiento, energía y los sueldos "
         "que no se facturan por hora no están en ningún lado de este cálculo."),
    ],
    "pie": "Riesgos",
}

# ---------------------------------------------------------------- decisiones
DECISIONES = {
    "eyebrow": "Lo que necesitamos",
    "titulo": "Cuatro\ndecisiones.",
    "intro": "Ninguna de las cuatro la puede tomar producción. Con estas cuatro respuestas, "
             "la carpeta de presupuesto queda cerrada y se puede mandar a clientes.",
    "items": [
        ("¿Las tarifas son con IVA incluido o más IVA?",
         "Cambia el número final en un 21% y es lo primero que va a preguntar cualquier "
         "cliente que factura."),
        ("¿Cuánto cuesta hacia adentro la hora de equipo de producción?",
         "Sin esto no sabemos qué deja realmente la hora completa, que es la que más "
         "queremos vender."),
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
    "bajada": "La carpeta de presupuesto ya está armada y funciona. Le faltan estas cuatro "
              "respuestas para poder salir de Nexo sin aclaraciones a mano.",
    "destacado": "Con las cuatro respuestas, cotizamos sin consultar. Sin ellas, cada "
                 "presupuesto vuelve a pasar por ustedes.",
    "firmas": [
        ("Fabricio Benjamín Ortega", "Producción General · Nexo Studios"),
        ("Martina Nagel", "Asistente de Producción General · Nexo Studios"),
    ],
    "pie": "Cierre",
}
