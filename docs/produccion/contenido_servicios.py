# -*- coding: utf-8 -*-
"""Grilla de servicios para mandarle a un cliente.

Sale de Nexo, así que no lleva costos operativos ni ganancias: sólo precios.
Los números salen de servicios.py.
"""

SLUG = "servicios"
ARCHIVO = "Nexo-servicios.pdf"
ACENTO = "#C7A45E"
FUENTE = "servicios"
INTERNO = False

TITULO_DOC = "Servicios · Nexo Studios"

PORTADA = {
    "eyebrow": "Nexo Studios · San Martín",
    "titulo": "Qué bueno\nque quieras\ngrabar acá.",
    "bajada": "Adentro está todo: qué incluye cada hora de estudio, cuánto sale cada "
              "servicio y hasta cuándo rigen estos precios.",
    "aviso": "Precio de lanzamiento · los primeros tres meses",
    "kicker": "Hipólito Yrigoyen 4716 · Villa Lynch · Buenos Aires",
}

# ---------------------------------------------------------------- beneficios
BENEFICIOS = {
    "eyebrow": "Qué incluye",
    "titulo": "Lo que viene\ncon la hora,\nsiempre.",
    "intro": "No importa cuál de los dos servicios contrates ni cuántas horas: esto entra "
             "en el precio y no se cobra aparte.",
    "items": [
        ("El piso armado y andando",
         "Llegás y está todo listo. No se te va la primera hora cableando ni probando."),
        ("Cinco cámaras, no una",
         "Tres PTZ ópticas y dos Insta360 Link 2C Pro, cortadas en vivo. Es la diferencia "
         "entre un programa y un video filmado."),
        ("Un micrófono por persona",
         "Seis Shure MV7+ dinámicos. El audio es lo primero que delata a un contenido "
         "hecho en casa, y lo último que la gente perdona."),
        ("Audio multipista",
         "Cada voz queda en su propio canal, así en la edición se arregla una sin "
         "romper las otras."),
        ("Operador siempre incluido",
         "Nunca se alquila la sala vacía. En vivo siempre se cae algo, y tiene que haber "
         "alguien que lo resuelva antes de que se note."),
        ("El piso se reconfigura",
         "Nada está clavado: escritorio, sillones, alfombra y luces se mueven según lo "
         "que vengas a grabar."),
    ],
    "nota": "Los precios de las páginas que siguen son de lanzamiento y rigen los primeros "
            "tres meses. Si contratás dentro de ese plazo, el precio que firmás es el que "
            "te queda por todo el contrato.",
    "pie": "Qué incluye",
}

# ---------------------------------------------------------------- qué hay
SERVICIOS = {
    "eyebrow": "Qué se alquila",
    "titulo": "Dos servicios\ny un extra.",
    "intro": "Las dos tarifas incluyen el estudio completo, el equipamiento de piso y los "
             "operadores trabajando. Nunca se alquila la sala vacía.",
    "items": [
        ("Streaming", "Programa en vivo",
         "El piso armado para salir al aire: hasta seis personas al escritorio, cinco "
         "cámaras cortadas en vivo y emisión a la plataforma que uses."),
        ("Podcast", "Conversación grabada",
         "Los sillones contra la cortina, seis micrófonos y audio multipista: cada voz "
         "queda en su propio canal para que la edición sea limpia."),
        ("Producción", "Extra optativo",
         "Dos productores en el piso: arman la rutina, manejan los tiempos al aire y "
         "controlan que el material salga completo. Se suma a cualquiera de los dos."),
    ],
    "nota": "Jornada mínima de dos horas. La preproducción se arma según cada proyecto y "
            "la edición se cotiza por pieza: las dos se cierran antes de arrancar.",
    "pie": "Los servicios",
}

# ---------------------------------------------------------------- la hoja
RESUMEN = {
    "eyebrow": "Todo junto",
    "titulo": "La hoja de\nprecios.",
    "intro": "Todos los valores en una página, con el precio de lanzamiento aplicado. El detalle de cada servicio está en las "
             "páginas que siguen.",
    "streaming_t": "Streaming · programa en vivo",
    "podcast_t": "Podcast · con dos operadores",
    "produccion_t": "Producción",
    "produccion_d": "Dos productores en el piso. Se suma por hora a cualquiera de los dos.",
    "cabecera": "Lista de precios",
    "direccion": "Hipólito Yrigoyen 4716, Villa Lynch · San Martín, Buenos Aires",
    "descuento_t": "Por varios meses",
    "filas": [(None, "Hora suelta"), (8, "8 hs por mes"),
              (16, "16 hs por mes"), (24, "24 hs o más")],
    "sin_precio": "a consultar",
    "pie_nota": "Jornada mínima de dos horas. La preproducción se arma según cada proyecto "
                "y la edición se cotiza por pieza.",
    "pie": "La hoja de precios",
}

# ---------------------------------------------------------------- streaming
STREAMING = {
    "eyebrow": "Streaming",
    "titulo": "Programa\nen vivo.",
    "intro": "El precio baja según cuántas horas contrates por mes. Podés elegir uno o dos "
             "operadores en el piso.",
    "op1": "1 operador",
    "op2": "2 operadores",
    "filas": [
        (None, "Hora suelta"),
        (8, "8 hs por mes"),
        (16, "16 hs por mes"),
        (24, "24 hs o más"),
    ],
    "sin_precio": "a consultar",
    "nota": "Con dos operadores hay alguien dedicado a cámaras y alguien dedicado a audio "
            "y switching. En programas con invitados que entran desde afuera, se nota.",
    "pie": "Streaming",
}

# ---------------------------------------------------------------- podcast
PODCAST = {
    "eyebrow": "Podcast",
    "titulo": "Conversación\ngrabada.",
    "intro": "Siempre con dos operadores en el piso. El precio baja igual que en streaming, "
             "según las horas que contrates por mes.",
    "filas": [
        (None, "Hora suelta"),
        (8, "8 hs por mes"),
        (16, "16 hs por mes"),
        (24, "24 hs o más"),
    ],
    "nota": "El audio sale en multipista, con cada voz en su canal. Es lo que permite "
            "arreglar una sin romper las otras cuando se edita.",
    "pie": "Podcast",
}

# ---------------------------------------------------------------- producción
PRODUCCION = {
    "eyebrow": "Extra optativo",
    "titulo": "Si querés que\nte armemos\nel programa.",
    "intro": "Se suma por hora a cualquiera de los dos servicios. Son dos personas en el "
             "piso, con trabajos distintos.",
    "roles": [
        ("Producción", "Piensa el programa",
         "Arma la rutina, maneja los tiempos al aire, coordina los invitados y decide en "
         "el momento si algo hay que cambiar."),
        ("Asistencia de producción", "Sostiene el día",
         "Maneja el piso, releva y confirma, y controla que el material quede completo y "
         "revisado antes de que alguien se vaya."),
    ],
    "nota": "Armar el formato y la rutina antes del día de grabación es preproducción, y "
            "se cotiza según cada proyecto. Esto es el equipo en el piso, el día que se graba.",
    "pie": "Producción",
}

# ---------------------------------------------------------------- descuentos
DESCUENTOS = {
    "eyebrow": "Contratos por mes",
    "titulo": "Cuanto más\ntiempo, menos\npor hora.",
    "intro": "Además del precio por volumen de horas, hay descuento por contratar varios "
             "meses seguidos.",
    "nota_t": "Estos precios son de lanzamiento",
    "nota": "Rigen los primeros tres meses. Si contratás dentro de ese plazo, el precio "
            "que firmás es el que te queda por todo el contrato.",
    "pie": "Descuentos",
}

# ---------------------------------------------------------------- cierre
CONTACTO = {
    "eyebrow": "Cómo se reserva",
    "titulo": "Tres pasos\ny una fecha.",
    "pasos": [
        ("01", "Contanos qué querés grabar", "Con saber cuántos van a estar y qué tipo de "
                                             "programa es, ya te decimos qué te sirve."),
        ("02", "Te pasamos el número cerrado", "Con las horas y el servicio definidos. "
                                               "Sin variables que aparezcan después."),
        ("03", "Seña y queda tomada", "El 50% reserva la fecha. El saldo, contra entrega "
                                      "del material."),
    ],
    "cierre": "Si podés, vení a ver el piso antes: se entiende más rápido parado adentro "
              "que leyendo un PDF.",
    "firmas": [
        ("Fabricio Ortega", "Producción General"),
        ("Martina Nagel", "Producción General · asistencia"),
    ],
    "estudio": "Nexo Studios · Hipólito Yrigoyen 4716, Villa Lynch · San Martín, Buenos Aires",
    "pie": "Hablemos",
}
