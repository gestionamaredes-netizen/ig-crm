# -*- coding: utf-8 -*-
"""Cuatro hojas para el que quiere alquilar el estudio y armar algo propio.

Es el documento más corto de la carpeta y el que más se va a mandar. Sin
honorarios: sale de Nexo. Las tarifas salen de tarifas.py.
"""

SLUG = "alquiler"
ARCHIVO = "Nexo-alquilar-el-estudio.pdf"
ACENTO = "#C7A45E"
INTERNO = False

TITULO_DOC = "Alquilá el estudio · Nexo Studios"
TEMPORADA = "Temporada 2026"

PORTADA = {
    "eyebrow": "Nexo Studios · San Martín",
    "titulo": "Traé la idea.\nEl piso ya\nestá armado.",
    "bajada": "Tres formatos listos para grabar, con operador incluido. "
              "En cuatro hojas está todo: qué se puede hacer, cuánto sale y cómo se reserva.",
    "kicker": "Hipólito Yrigoyen 4716 · Villa Lynch · Buenos Aires",
}

# ---------------------------------------------------------------- los tres armados
ARMADOS = {
    "eyebrow": "Los tres armados",
    "titulo": "Qué podés\nhacer acá.",
    "intro": "Tres sectores distintos en la misma sala, cada uno con su puesta, su luz y su "
             "sonido. Se cambia de uno a otro sin mover cámaras de lugar.",
    "items": [
        ("Escritorio general", "Streaming hasta 6 personas",
         "El escritorio de listones, la puesta de programa. Seis al aire con micrófono "
         "propio y cinco cámaras cortando en vivo. Es el armado para una mesa de debate, "
         "un panel o un programa semanal con invitados.",
         "Mesa de debate · panel · programa en vivo"),
        ("Mano a mano", "Podcast de dos",
         "Los dos sillones y la mesa baja contra la cortina. Clima de conversación, no de "
         "estudio: la charla se estira y no se nota. El audio sale en multipista, así que "
         "cada voz queda en su canal.",
         "Podcast · entrevista larga · testimonial"),
        ("Live set", "Banda en vivo",
         "La alfombra contra los paneles, con iluminación propia y sonido pensado para "
         "música. La mesa de 24 canales toma la banda entera y queda grabada instrumento "
         "por instrumento.",
         "Banda · sesión acústica · videoclip en vivo"),
    ],
    "nota": "Si tu idea no entra exacta en ninguno de los tres, se arma a medida. "
            "Contanos qué tenés en la cabeza antes de descartarlo.",
    "pie": "Los tres armados",
}

# ---------------------------------------------------------------- qué incluye
INCLUYE = {
    "eyebrow": "Las tarifas",
    "titulo": "Qué incluye\ny cuánto sale.",
    "intro": "Las dos tarifas incluyen el estudio, el equipamiento completo y el equipo "
             "técnico en el piso. Nunca alquilamos la sala vacía.",
    "tecnica_para": "Si ya sabés qué vas a grabar",
    "tecnica_d": "Operador y asistente en el piso. Llegás y está todo andando: "
                 "vos dirigís, nosotros hacemos que salga.",
    "completa_para": "Si querés que te armemos el programa",
    "completa_d": "Lo anterior más dos de producción: uno sigue la rutina y maneja los "
                  "tiempos, el otro sostiene el piso y controla el material.",
    "equipo_t": "Siempre incluido, en cualquiera de los tres armados",
    "equipo": [
        ("Cinco cámaras", "Tres PTZ ópticas y dos Insta360 Link 2C Pro, cortadas en vivo."),
        ("Seis micrófonos", "Shure MV7+ dinámicos, uno por persona."),
        ("Audio multipista", "Rodecaster Pro II y mesa de 24 canales. Cada voz en su canal."),
        ("Operador técnico", "Alguien en la consola de principio a fin. No es opcional."),
    ],
    "nota": "Las dos tarifas cubren el día de grabación. Preproducción y edición se "
            "cotizan aparte y se cierran antes. Jornada mínima de dos horas.",
    "pie": "Las tarifas",
}

# ---------------------------------------------------------------- reservar
RESERVA = {
    "eyebrow": "Cómo se reserva",
    "titulo": "Tres pasos\ny una fecha.",
    "pasos": [
        ("01", "Contanos qué querés grabar", "Con cuántos son y qué formato, ya te decimos "
                                             "qué armado te sirve."),
        ("02", "Te pasamos el número cerrado", "Cerrado de verdad: sin variables que "
                                               "aparezcan después."),
        ("03", "Seña y queda tomada", "El 50% reserva la fecha. El saldo, contra entrega "
                                      "del material."),
    ],
    "aclaraciones_t": "Para que no haya sorpresas",
    "aclaraciones": [
        ("La hora arranca a horario", "No cuando llega el último. Citá a tu gente antes."),
        ("Cancelación", "Con menos de 48 horas de aviso la seña no se devuelve: la fecha "
                        "ya no se puede vender."),
        ("Preproducción y edición, aparte", "La hora es el día de grabación. Armar el "
                                           "formato antes y editar después se cotizan "
                                           "por separado."),
    ],
    "cierre": "Si podés, vení a ver el piso antes: se entiende más rápido parado adentro "
              "que leyendo un PDF.",
    "firmas": [
        ("Fabricio Ortega", "Producción General"),
        ("Martina Nagel", "Producción General · asistencia"),
    ],
    "estudio": "Nexo Studios · Hipólito Yrigoyen 4716, Villa Lynch · San Martín, Buenos Aires",
    "pie": "Cómo se reserva",
}
