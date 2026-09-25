# -*- coding: utf-8 -*-
"""Carpeta de presupuesto de producción de Nexo Studios.

El documento maestro: con esto se arma cualquier cotización. Los números salen
de tarifas.py. Circulación interna: tiene los honorarios del equipo técnico.
"""

SLUG = "carpeta"
ARCHIVO = "Nexo-carpeta-de-presupuesto-de-produccion.pdf"
ACENTO = "#C7A45E"
INTERNO = True

TITULO_DOC = "Presupuesto de producción · Nexo Studios"
TEMPORADA = "Temporada 2026"

PORTADA = {
    "eyebrow": "Carpeta de presupuesto",
    "titulo": "Cómo se\ncotiza una\nproducción.",
    "bajada": "El criterio, las tarifas y el desglose de roles. Con esto se arma cualquier "
              "presupuesto sin tener que consultar hacia arriba.",
    "aviso": "Circulación interna · contiene honorarios",
    "firma": [("Fabricio Benjamín Ortega", "Producción General"),
              ("Martina Nagel", "Producción General · asistencia")],
}

# ---------------------------------------------------------------- criterio
CRITERIO = {
    "eyebrow": "El criterio",
    "titulo": "Se cobra la\nhora, no la\nlista de cosas.",
    "parrafos": [
        "Nexo no arma presupuestos con una línea para la cámara, otra para el micrófono y "
        "otra para el operador. Cotiza horas de estudio, con la producción técnica adentro. "
        "El cliente sabe lo que va a pagar antes de entrar y nosotros sabemos lo que nos queda.",
        "Eso deja dos decisiones sobre la mesa y nada más: cuántas horas, y con o sin equipo "
        "de producción. Todo el resto del presupuesto se deriva de ahí.",
    ],
    "destacado": "Dos preguntas al cliente: cuántas horas y si viene con equipo de producción.",
    "pie": "El criterio",
}

# ---------------------------------------------------------------- las dos horas
HORAS = {
    "eyebrow": "Las dos horas",
    "titulo": "Técnica o\ncompleta.",
    "intro": "Las dos incluyen el estudio, los tres sectores y el equipamiento de piso. "
             "Lo que cambia es quién está del otro lado de la cámara.",
    "tecnica_t": "Hora técnica",
    "tecnica_d": "Estudio, equipamiento y el equipo técnico en el piso: operador y asistente. "
                 "El contenido lo trae el cliente y lo dirige el cliente.",
    "tecnica_para": "Para el que ya sabe qué va a grabar",
    "completa_t": "Hora completa",
    "completa_d": "Todo lo anterior más el equipo de producción general de Nexo: producción y asistente de producción en el piso, de principio a fin de la jornada.",
    "completa_para": "Para el que necesita que le armen el programa",
    "nota": "El salto entre una y otra es exactamente lo que cobra el equipo de producción "
            "general por esa hora. No es un recargo por el estudio: el estudio y la técnica "
            "cuestan lo mismo en los dos casos.",
    "pie": "Las dos horas",
}

# ---------------------------------------------------------------- los dos de producción
PRODUCCION = {
    "eyebrow": "La hora completa",
    "titulo": "Los dos que\nse suman.",
    "intro": "Lo que se suma por la hora completa va entero al equipo de producción "
             "general: dos personas con trabajos distintos, en el piso.",
    "roles": [
        ("Producción general", "Piensa el programa",
         [("Sigue la rutina", "Que cada bloque pase cuando tiene que pasar. Armarla es preproducción y va aparte."),
          ("Maneja los tiempos al aire", "Cuánto dura cada cosa y qué se corta si se estira."),
          ("Coordina los invitados", "Confirmación y briefing el día de la grabación."),
          ("Decide en el momento", "Si algo no funciona en vivo, cambia el plan sin frenar.")]),
        ("Asistente de producción", "Sostiene el día",
         [("Releva y confirma", "Datos, horarios y proveedores. Que nadie llegue sin saber a qué viene."),
          ("Maneja el piso", "Entradas, salidas y señas de tiempo a los que están al aire."),
          ("Controla el material", "Antes de que alguien se vaya: copia hecha y verificada."),
          ("Deja el pase armado", "Qué falta y qué piezas salen. Post arranca sin preguntar.")]),
    ],
    "aviso": "Precio promocional · sólo jornada de piso",
    "nota": "Precio promocional, y cubre únicamente las horas de piso: la preproducción "
            "se cotiza por proyecto y aparte.",
    "pie": "La hora completa",
}

# ---------------------------------------------------------------- jornadas
JORNADAS = {
    "eyebrow": "La tabla",
    "titulo": "Jornadas\ntipo.",
    "intro": "Lo que sale cada jornada, ya calculado. La jornada mínima es de dos horas.",
    "nota": "No hay descuento por volumen dentro de una misma jornada: la hora vale lo mismo "
            "la primera que la sexta. Los acuerdos por temporada se negocian aparte y los "
            "firma producción ejecutiva.",
    "pie": "Jornadas tipo",
}

# ---------------------------------------------------------------- técnica
TECNICA = {
    "eyebrow": "Equipo técnico",
    "titulo": "Lo que cobra\nel piso.",
    "intro": "El operador técnico y su asistente cobran por hora, y la hora cambia según el "
             "largo de la jornada. En jornadas de tres horas o más el operador baja su hora "
             "y el asistente la sube.",
    "hallazgo_t": "El costo por hora es el mismo siempre",
    "hallazgo_d": "Los dos tramos dan idéntico: veinticinco más diez es lo mismo que veinte "
                  "más quince. Una hora de equipo técnico cuesta lo mismo en una jornada de "
                  "dos horas que en una de ocho. Por eso el margen no se mueve con el largo "
                  "de la jornada y se puede cotizar de memoria.",
    "pie": "Equipo técnico",
}

# ---------------------------------------------------------------- las tres etapas
ETAPAS_QUE_ES = {
    "eyebrow": "Antes del desglose",
    "titulo": "Tres etapas,\nuna sola\nen la tarifa.",
    "intro": "Una producción tiene tres etapas y se cobran de maneras distintas. "
             "Confundirlas es la causa número uno de un presupuesto que después no cierra.",
    "items": [
        ("Preproducción", "Antes del día de grabación", "Se arma por proyecto",
         "Definir el formato, escribir la rutina, conseguir y confirmar invitados, armar el "
         "plan de rodaje y resolver arte y gráfica. No tiene tarifa por hora ni la va a "
         "tener: cada proyecto necesita una preproducción distinta y se cotiza sobre eso."),
        ("Producción", "El día de grabación", "Es lo que se cobra por hora",
         "El equipo en el piso ejecutando lo que ya se decidió: técnica, tiempos, invitados "
         "y control del material. Es lo único que cubren las tarifas por hora, las dos."),
        ("Postproducción", "Después de grabar", "Se cotiza por pieza",
         "Edición, cortes verticales, placas, audio y entrega. Depende de cuántas piezas "
         "salgan de la jornada, no de cuánto duró la jornada."),
    ],
    "destacado": "La hora de estudio compra el día de grabación. Nada más y nada menos.",
    "pie": "Las tres etapas",
}

# ---------------------------------------------------------------- roles
ETAPAS = [
    ("01", "Preproducción", "Antes de que se encienda una luz",
     "Es la etapa que decide si el día de grabación va a rendir. Cuando se saltea, se paga "
     "en horas de estudio quemadas.",
     [("Dirección general", "Fede Aguirre · Nico Lahargou",
       "Definen cómo se ve y cómo suena. Aprueban la puesta antes de que se arme."),
      ("Producción ejecutiva", "Lorena Rizzo",
       "Aprueba el presupuesto y responde por el proyecto ante el cliente. Cobra un porcentaje de lo facturado, no una hora."),
      ("Producción general", "Fabri Ortega",
       "Arma el proyecto: cronograma, equipo, proveedores y plan de rodaje."),
      ("Producción general · asistencia", "Martu Nagel",
       "Releva datos, cierra proveedores y sostiene el cronograma día a día."),
      ("Desarrollo de contenido", "Producción general",
       "Formato, rutina y guion. Qué pasa en cada bloque y en qué orden."),
      ("Coordinación de invitados", "Producción general",
       "Búsqueda, contacto, confirmación y briefing previo."),
      ("Dirección de arte", "Dirección general",
       "Puesta del sector, gráfica en pantalla y qué se ve detrás de la cabeza."),
      ("Cierre de presupuesto", "Producción ejecutiva",
       "Proveedores, adicionales y la firma que habilita el rodaje.")]),

    ("02", "Producción", "El día de grabación",
     "Acá se ejecuta lo que se decidió antes. El objetivo del día no es grabar: es salir con "
     "el material completo y revisado.",
     [("Producción técnica", "Néstor Mago",
       "Cámaras, audio, switching y la emisión sin caídas. Es el que sostiene el piso."),
      ("Asistencia técnica", "Asistente de piso",
       "Segundo operador: cableado, encuadres, monitoreo y respaldo del registro."),
      ("Piso y coordinación", "Producción general",
       "Maneja los tiempos del programa, los invitados y el cumplimiento de la rutina."),
      ("Registro para redes", "Producción general",
       "Captura pensada para los cortes verticales, no para el archivo."),
      ("Control de material", "Asistencia técnica",
       "Antes de que alguien se vaya: se revisa audio, se copia y se verifica la copia.")]),

    ("03", "Postproducción", "Lo que convierte el material en producto",
     "Se cotiza aparte de la hora de estudio, porque depende de cuántas piezas salgan de cada "
     "jornada y no de cuánto duró.",
     [("Edición del programa", "Post",
       "Armado del episodio completo, con cabezales y placas."),
      ("Cortes verticales", "Post",
       "Los recortes para redes. Se definen en preproducción, no al final."),
      ("Placas y motion", "Dirección general",
       "Zócalos, separadores y la gráfica que sostiene la identidad del programa."),
      ("Audio", "Post",
       "Nivelación, limpieza y mezcla. Es lo que más se nota cuando falta."),
      ("Entrega y subida", "Producción general",
       "Exportación por plataforma, carga, títulos y miniaturas.")]),
]
ETAPAS_EYEBROW = "El desglose"

# ---------------------------------------------------------------- creativa
CREATIVA = {
    "eyebrow": "La capa que se suma",
    "titulo": "Producción\ncreativa.",
    "intro": "Es opcional y se integra a cualquiera de las dos horas. Sirve para el que "
             "tiene el presupuesto y las ganas, pero no tiene el formato.",
    "items": [
        ("Concepto y formato", "Qué programa es, cuánto dura, cómo abre y cómo cierra. "
                               "Sale de una reunión de trabajo, no de un brief por mail."),
        ("Identidad visual", "Nombre, logo, placas y cómo se ve en pantalla. Lo hace la "
                             "misma gente que después lo opera en vivo."),
        ("Guion y rutina", "La estructura de cada emisión, bloque por bloque, con los "
                           "tiempos asignados."),
        ("Plan de redes", "Qué se publica entre programa y programa, y quién lo publica. "
                          "Sin esto el contenido se muere entre emisión y emisión."),
        ("Acompañamiento", "Producción general sentada en las primeras emisiones hasta "
                           "que el formato camina solo."),
    ],
    "nota": "Se cotiza por proyecto, no por hora. El precio depende de cuánto hay que "
            "inventar desde cero y se cierra antes de arrancar.",
    "pie": "Producción creativa",
}

# ---------------------------------------------------------------- cómo se arma
ARMADO = {
    "eyebrow": "Paso a paso",
    "titulo": "Cómo se arma\nun presupuesto.",
    "pasos": [
        ("01", "Cuántas horas", "Con el cliente, sobre la rutina real. Siempre se suma una "
                                "hora de armado que nadie recuerda al principio."),
        ("02", "Técnica o completa", "Si el cliente no tiene quien le arme el programa, es "
                                     "completa. No se discute por precio: se discute por lo "
                                     "que pasa si no está."),
        ("03", "Preproducción", "Si el proyecto la necesita o el cliente la pide. Se arma "
                                "según cada proyecto: no hay tarifa por hora, se cotiza "
                                "sobre lo que haya que preparar."),
        ("04", "Producción creativa", "Se ofrece si el formato no existe todavía. Se cotiza "
                                      "por proyecto, aparte."),
        ("05", "Postproducción", "Cuántas piezas salen de la jornada. Se define acá, no "
                                 "después de grabar."),
        ("06", "Adicionales", "Lo que se sale de la grilla de la página siguiente."),
        ("07", "Firma", "Producción ejecutiva aprueba y recién ahí se manda."),
    ],
    "pie": "Cómo se arma",
}

# ---------------------------------------------------------------- no incluido
FUERA = {
    "eyebrow": "Adicionales",
    "titulo": "Lo que no\nentra en\nla hora.",
    "intro": "Nada de esto está incluido en las tarifas de estudio. Si el proyecto lo "
             "necesita, se cotiza y se suma como línea aparte.",
    "items": [
        ("Preproducción", "Formato, rutina, invitados y plan de rodaje. No está en la hora de piso: se arma y se cotiza según cada proyecto."),
        ("Postproducción", "Edición, cortes, placas y audio. Depende de las piezas, no de las horas."),
        ("Producción creativa", "Formato, identidad y plan de redes. Por proyecto."),
        ("Rodaje fuera del estudio", "Exteriores, traslados y equipo portátil."),
        ("Talento", "Conducción, panel, músicos o invitados con caché."),
        ("Escenografía especial", "Cualquier cosa que haya que construir o alquilar."),
        ("Horas fuera de agenda", "Nocturnas, feriados y fines de semana."),
        ("Streaming a plataformas del cliente", "Si hay que emitir a cuentas que no son nuestras."),
    ],
    "pie": "Adicionales",
}

# ---------------------------------------------------------------- condiciones
CONDICIONES = {
    "eyebrow": "Condiciones",
    "titulo": "Letra chica,\nen grande.",
    "items": [
        ("Jornada mínima", "Dos horas. Por debajo de eso no se cotiza."),
        ("Validez", "Quince días corridos desde la fecha del presupuesto."),
        ("Seña", "50% para reservar la fecha. La fecha no queda tomada hasta que entra."),
        ("Saldo", "Contra entrega del material."),
        ("Cancelación", "Con menos de 48 horas de aviso, la seña no se devuelve: la fecha "
                        "ya no se puede vender."),
        ("Demoras del cliente", "La hora empieza a la hora agendada, no cuando llega el último."),
    ],
    "pendientes_t": "Cuatro cosas que hay que definir antes de mandar esto a un cliente",
    "pendientes": [
        "Si las tarifas son con IVA incluido o más IVA. Cambia el número final en un 21%.",
        "Cómo se reparten los 50.000 entre producción general y asistente de producción.",
        "Qué porcentaje de lo facturado se lleva producción ejecutiva.",
        "Hasta cuándo rige el precio promocional de los 50.000.",
    ],
    "pie": "Condiciones",
}

# ---------------------------------------------------------------- contacto
CONTACTO = {
    "eyebrow": "Quién hace qué",
    "titulo": "Quién lo arma\ny quién\nlo firma.",
    "bajada": "El presupuesto lo arma producción general con esta carpeta. La firma es "
              "de producción ejecutiva: ningún número sale de Nexo sin esa aprobación.",
    "firmas": [
        ("Fabricio Benjamín Ortega", "Producción General · arma el presupuesto"),
        ("Martina Nagel", "Producción General · releva y cierra proveedores"),
        ("Lorena Rizzo", "Producción Ejecutiva · aprueba y firma"),
    ],
    "estudio": "Nexo Studios · Hipólito Yrigoyen 4716, Villa Lynch · San Martín, Buenos Aires",
    "pie": "Quién firma",
}
