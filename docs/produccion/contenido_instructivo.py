# -*- coding: utf-8 -*-
"""Instructivo para el que quiere armar un streaming o un podcast con Nexo.

No es un folleto de precios: es cómo se hace, paso por paso. Fondo blanco,
sale de Nexo, sin costos ni ganancias adentro.
"""

SLUG = "instructivo"
ARCHIVO = "Nexo-como-armar-tu-programa.pdf"
FUENTE = "servicios"
INTERNO = False
TEMA = "claro"

TITULO_DOC = "Cómo armar tu programa · Nexo Studios"

PORTADA = {
    "eyebrow": "Nexo Studios · San Martín",
    "titulo": "Querés armar\nun programa.",
    "bajada": "Streaming o podcast, con nosotros. Acá está cómo se hace: la primera "
              "charla, lo que hay que preparar, el día de grabación y lo que viene después.",
    "kicker": "Hipólito Yrigoyen 4716 · Villa Lynch · Buenos Aires",
}

# ---------------------------------------------------------------- elegir
ELEGIR = {
    "eyebrow": "Paso 1",
    "titulo": "Streaming\no podcast.",
    "intro": "Es la primera decisión y cambia todo lo que viene después. No se trata de "
             "cuál es mejor, sino de qué querés que pase.",
    "items": [
        ("Streaming", "Si querés que pase algo ahora",
         "Sale en vivo. Hay chat, hay gente mirando mientras ocurre y lo que se dice no "
         "se puede volver a grabar. Sirve cuando el programa vive de la reacción: mesas "
         "de debate, paneles, entrevistas con público.",
         "Hasta seis al aire · cinco cámaras cortadas en vivo"),
        ("Podcast", "Si querés que quede algo",
         "Se graba y se edita. La charla se estira sin apuro y lo que no funcionó se "
         "saca. Sirve cuando el programa vive del contenido: entrevistas largas, "
         "testimoniales, conversaciones de dos.",
         "Dos o tres personas · audio multipista para editar limpio"),
    ],
    "nota": "Si no sabés cuál te sirve, contanos qué querés que pase cuando alguien lo "
            "vea. Con eso solemos darnos cuenta los dos.",
    "pie": "Elegir el formato",
}

# ---------------------------------------------------------------- quién pone qué
PONE = {
    "eyebrow": "Paso 2",
    "titulo": "Qué traés vos\ny qué ponemos\nnosotros.",
    "intro": "La confusión más común es pensar que hay que traer equipo. No hace falta "
             "traer nada técnico.",
    "traes_t": "Lo que traés vos",
    "traes": [
        ("De qué se trata", "El tema, el tono y por qué alguien lo miraría."),
        ("Quiénes hablan", "Vos, tus invitados, y quién conduce si no sos vos."),
        ("Cuánto querés que dure", "Un número aunque sea aproximado. De ahí salen las horas."),
        ("Dónde lo vas a publicar", "Tu canal, tus redes, la plataforma que uses."),
    ],
    "ponemos_t": "Lo que ponemos nosotros",
    "ponemos": [
        ("El estudio y el piso armado", "Tres sectores, luces y puesta. Llegás y está andando."),
        ("Las cámaras y el audio", "Cinco cámaras y un micrófono por persona, en multipista."),
        ("El equipo técnico", "Operador y asistente de operación, incluidos en el precio."),
        ("La emisión", "Si es en vivo, sale a la plataforma que uses."),
    ],
    "pie": "Quién pone qué",
}

# ---------------------------------------------------------------- antes
ANTES = {
    "eyebrow": "Paso 3",
    "titulo": "Lo que pasa\nantes de\ngrabar.",
    "intro": "Es la parte que más se saltea y la que más caro sale saltear. Un día de "
             "estudio sin preparar se va en decidir cosas que se decidían por teléfono.",
    "items": [
        ("Se define el formato", "Cuánto dura, cómo abre, qué pasa en cada bloque y cómo "
                                 "cierra. Si ya lo tenés, lo revisamos. Si no, lo armamos."),
        ("Se escribe la rutina", "El orden real del programa, con los tiempos asignados. "
                                 "Es lo que después se sigue en el piso."),
        ("Se confirman los invitados", "Contacto, horario y un briefing previo para que "
                                       "nadie llegue sin saber a qué viene."),
        ("Se arma el plan del día", "A qué hora llega cada uno, qué se graba primero y "
                                    "qué se hace si algo se atrasa."),
    ],
    "nota": "Esto es preproducción y se arma según cada proyecto, porque ninguno necesita "
            "lo mismo. Se cotiza aparte y se cierra antes de tomar la fecha.",
    "pie": "Antes de grabar",
}

# ---------------------------------------------------------------- el día
DIA = {
    "eyebrow": "Paso 4",
    "titulo": "El día\nde grabación.",
    "intro": "Así es una jornada de cuatro horas. Con más o menos horas cambia el medio, "
             "no las puntas.",
    "bloques": [
        ("Antes", "Nosotros", "El piso queda armado y probado antes de que llegues. "
                              "Esa hora no te la cobramos."),
        ("Primera media hora", "Los dos", "Llegada, micrófonos, prueba de sonido y una "
                                          "vuelta a la rutina del día."),
        ("El cuerpo", "Vos al aire", "Se graba o se emite. Si es en vivo, el operador "
                                     "corta cámaras y maneja el audio mientras ocurre."),
        ("Última media hora", "Nosotros", "Se revisa el material, se hace la copia y se "
                                          "verifica la copia. Nadie se va antes de eso."),
    ],
    "nota": "La hora arranca a la hora agendada, no cuando llega el último. Conviene "
            "citar a tu gente media hora antes.",
    "pie": "El día",
}

# ---------------------------------------------------------------- después
DESPUES = {
    "eyebrow": "Paso 5",
    "titulo": "Lo que pasa\ndespués.",
    "items": [
        ("Te llevás el material", "Crudo, revisado y copiado. Es tuyo desde ese día."),
        ("La edición, si la querés", "Se cotiza por pieza: no es lo mismo un episodio "
                                     "entero que tres cortes verticales. Se define antes "
                                     "de grabar, no después."),
        ("La publicación es tuya", "Sale en tu canal, con tu nombre. Nexo no se queda con "
                                   "derechos sobre lo que grabás acá."),
        ("Si el programa sigue", "Se pasa a un paquete mensual y la hora baja. Cuantas "
                                 "más horas contratás, menos vale cada una."),
    ],
    "pie": "Después",
}

# ---------------------------------------------------------------- errores
ERRORES = {
    "eyebrow": "De la experiencia",
    "titulo": "Cuatro cosas\nque vemos\nseguido.",
    "intro": "No son reglas, son cosas que pasan y se pueden evitar sabiéndolas antes.",
    "items": [
        ("Contratar menos horas de las que hace falta",
         "Casi nadie calcula la media hora de armado ni la de cierre. Si tu programa dura "
         "dos horas al aire, la jornada son tres."),
        ("Llegar sin saber el orden",
         "Decidir en el piso qué va primero se come la mitad del día y se nota en el "
         "material."),
        ("Dejar la edición para después",
         "Si no se define qué piezas salen antes de grabar, se graba pensando en una cosa "
         "y después hace falta otra."),
        ("Grabar un episodio y esperar",
         "Los programas se mueren en el cuarto episodio, no en el primero. Conviene "
         "grabar de a varios y publicar con calendario."),
    ],
    "pie": "Lo que vemos",
}

# ---------------------------------------------------------------- empezar
EMPEZAR = {
    "eyebrow": "Cómo se empieza",
    "titulo": "Una charla\ny una fecha.",
    "pasos": [
        ("01", "Nos contás qué tenés", "Media hora. No hace falta que vengas con nada "
                                       "resuelto; si vinieras con todo resuelto no nos "
                                       "necesitarías."),
        ("02", "Te decimos qué necesitás", "Qué formato te sirve, cuántas horas y si "
                                           "conviene sumar producción o preproducción."),
        ("03", "Presupuesto cerrado", "Con el número final. Sin variables que aparezcan "
                                      "después de grabar."),
        ("04", "Seña y fecha", "El 50% toma la fecha. El saldo, contra entrega del material."),
    ],
    "cierre": "Si podés, vení a ver el piso antes: se entiende más rápido parado adentro "
              "que leyendo un PDF.",
    "firmas": [
        ("Fabricio Ortega", "Producción General"),
        ("Martina Nagel", "Producción General · asistencia"),
    ],
    "estudio": "Nexo Studios · Hipólito Yrigoyen 4716, Villa Lynch · San Martín",
    "pie": "Empezar",
}
