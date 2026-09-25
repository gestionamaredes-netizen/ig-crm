# -*- coding: utf-8 -*-
"""Propuesta comercial de sponsoreo — Nexo Studios, lanzamiento 2026.

Vertical, para leer desde el celular. Para cambiar cualquier dato se edita
este archivo y se corre ./build-propuesta.sh

  >>> Nexo NO produce contenido aparte para la marca: el sponsor aparece
  >>> DENTRO de los programas de la grilla. La unica excepcion es la marca
  >>> que quiera armar su propio streaming, podcast o live set, que es otro
  >>> servicio y se cotiza aparte (ver PROPIO).

  >>> LO UNICO QUE HAY QUE COMPLETAR ANTES DE MANDARLA SON LOS MONTOS.
  >>> Estan todos juntos, abajo, en INVERSION. Mientras digan "A convenir"
  >>> la propuesta se lee bien igual, pero no cierra una venta sola.
"""

ARCHIVO = "Nexo-Studios-propuesta-de-sponsoreo-2026.pdf"
TEMPORADA = "Temporada lanzamiento 2026"
PAISES = "Argentina · Colombia · España"

# ---------------------------------------------------------------- portada
PORTADA_EYEBROW = "Propuesta comercial · Sponsoreo"
PORTADA_TITULO = "Sé parte del\nlanzamiento."
PORTADA_BAJADA = ("Nexo Studios abre su centro integral de contenido audiovisual con una "
                  "grilla de cinco programas propios. Esta es la invitación a entrar "
                  "ahora, cuando todavía se elige lugar.")

# ---------------------------------------------------------------- el pitch
INVITACION = {
    "eyebrow": "Por qué ahora",
    "titulo": "Entrar en el\nlanzamiento no\nes lo mismo\nque entrar después.",
    "parrafos": [
        "Una grilla que arranca tiene algo que una grilla consolidada ya no puede ofrecer: "
        "lugar. Naming disponible, secciones sin dueño, formatos que todavía se pueden "
        "diseñar alrededor de una marca en vez de acomodarla al final.",
        "El que entra en el lanzamiento no compra un espacio publicitario. Queda asociado "
        "al origen del proyecto, con precio de lanzamiento y prioridad de renovación cuando "
        "la grilla crezca.",
        "Y hay algo que solo pasa una vez: la marca que acompaña desde el primer día no "
        "aparece como anunciante, aparece como parte de la historia del canal. Eso no se "
        "compra después a ningún precio.",
    ],
    "destacado": "Después del lanzamiento se vende lo que queda. Ahora se elige.",
}

# ---------------------------------------------------------------- ecosistema
QUE_ES = {
    "eyebrow": "Qué es Nexo Studios",
    "titulo": "No es un estudio\nque se alquila.",
    "intro": "Es un centro integral de contenido: el lugar donde un formato se piensa, "
             "se produce, se emite y se distribuye sin salir de la misma casa.",
    "filas": [
        ("Producción propia", "Cinco programas de la casa, con producción general, dirección "
                              "y equipo técnico estables. No es contenido tercerizado."),
        ("Estudio de broadcast", "Tres sectores en un mismo piso —conducción, entrevistas y "
                                 "live set— con cinco cámaras y audio multipista."),
        ("Distribución integrada", "Cada emisión sale en vivo, queda en VOD, se corta en "
                                   "verticales y se publica en audio. Una grabación, cuatro salidas."),
        ("Alcance multipaís", "Producción en Argentina, co-conducción desde Colombia y un "
                              "bloque semanal en un canal de España."),
        ("Marketing propio", "Dirección de marketing en el equipo: la marca del sponsor se "
                             "trabaja, no se apoya sobre el programa y listo."),
    ],
}

# ---------------------------------------------------------------- el mercado
MERCADO = {
    "eyebrow": "El mercado",
    "titulo": "El streaming\nya dejó de\nser una\npromesa.",
    "intro": "En los últimos años el streaming argentino se convirtió en un medio con grilla "
             "fija, anunciantes y audiencias propias. La discusión ya no es si la gente mira.",
    "filas": [
        ("El consumo se corrió", "La audiencia dejó de elegir un canal y pasó a elegir un "
                                 "programa. Ya no se compite por un horario: se compite por "
                                 "atención, contra todo lo demás que hay en el teléfono."),
        ("Una emisión, tres vidas", "El mismo contenido se consume en vivo, en diferido y en "
                                    "recortes. Cada una de esas vidas tiene su propia audiencia "
                                    "y las tres llevan la misma marca."),
        ("La inversión siguió a la gente", "Las marcas que antes compraban tanda hoy compran "
                                           "integración: mención del conductor, producto en "
                                           "mesa, contenido hecho con el programa."),
        ("Se fragmentó", "No hay un público de streaming. Hay muchos públicos chicos, muy "
                         "distintos entre sí, y cada uno mira una cosa muy específica."),
    ],
}

OPORTUNIDAD = {
    "eyebrow": "Dónde está la oportunidad",
    "titulo": "Los canales\ngrandes ya\nestán llenos.",
    "filas": [
        ("Inventario agotado", "Los canales consolidados tienen el naming vendido y las "
                               "secciones con dueño. Lo que queda son menciones sueltas, "
                               "al precio de una marca grande."),
        ("Audiencia amplia, no propia", "Volumen alto, pero general. Para una marca mediana "
                                        "es pagar por miles de personas a las que no les habla."),
        ("Saturación", "Cuando hay diez marcas en una emisión, ninguna se recuerda. La "
                       "presencia se diluye en el ruido."),
        ("El movimiento es hacia abajo", "El mercado se está corriendo a audiencias más "
                                         "chicas, más definidas y más comprometidas. Ahí la "
                                         "mención todavía vale."),
    ],
    "destacado": "No hace falta la audiencia más grande. Hace falta la audiencia correcta.",
}

# ---------------------------------------------------------------- nicho dorado
NICHO = {
    "eyebrow": "El concepto",
    "titulo": "Qué es un\nnicho dorado.",
    "intro": "Una audiencia chica puede valer más que una grande. Pasa cuando cumple cuatro "
             "condiciones al mismo tiempo. Si falta una, es solo una audiencia chica.",
    "condiciones": [
        ("01", "Definible", "Se describe en una frase concreta. No «mujeres de 25 a 45», sino "
                            "«mujeres de 35 a 50 que hablan en vivo de lo que normalmente se "
                            "habla en privado»."),
        ("02", "Comprometida", "Vuelve todas las semanas, participa en el chat y se reconoce "
                               "como parte de algo. No pasa de largo: se queda."),
        ("03", "Desatendida", "No tiene diez programas compitiendo por ella. El que llega "
                              "primero se queda con el lugar."),
        ("04", "Comprable", "Existe un rubro con presupuesto que necesita exactamente a esa "
                            "gente. Sin esto, las otras tres no sirven para vender."),
    ],
}

NICHO_CREACION = {
    "eyebrow": "Cómo se construye",
    "titulo": "Un nicho\ndorado no se\nbusca: se\nfabrica.",
    "intro": "No esperamos a encontrar una audiencia desatendida. La construimos, y es "
             "exactamente lo que hace la grilla de Nexo Studios.",
    "pasos": [
        ("01", "Se elige una conversación que no está en pantalla", "Temas que la gente ya "
               "habla en privado y no ve en ningún lado con formato propio."),
        ("02", "Se le da un formato estable", "Mismo día, misma estructura, mismas caras. La "
               "audiencia no vuelve por el tema: vuelve por la cita."),
        ("03", "Se sostiene hasta que se reconozcan", "Un nicho existe cuando la gente que lo "
               "mira se identifica con él y lo defiende. Eso lleva temporadas, no semanas."),
        ("04", "Recién ahí se vende", "Con la audiencia formada, una mención vale más que un "
               "aviso: viene de alguien en quien esa gente confía."),
    ],
    "destacado": "Entrar en el lanzamiento es entrar antes de que el nicho tenga precio.",
}

# ---------------------------------------------------------------- las audiencias
AUDIENCIAS = {
    "eyebrow": "Las cinco audiencias",
    "titulo": "Cinco nichos,\nno cinco\nprogramas.",
    "intro": "Cada programa de la grilla fue diseñado alrededor de una audiencia que se puede "
             "describir en una frase, y de los rubros que la necesitan.",
    "items": [
        ("Sex and the Baires", "#F00030",
         "Mujeres de 33 a 52 que hablan sin filtro de maternidad, parejas, sexo y menopausia.",
         "Salud femenina · cuidado personal · bienestar · indumentaria · farmacia · bebidas"),
        ("Exitosa Yo", "#D0A860",
         "Mujeres que emprenden o dirigen, y buscan herramientas concretas, no motivación.",
         "Fintech · bancos · educación · software de gestión · coworking · seguros"),
        ("Tercer Tiempo", "#50D000",
         "La sobremesa entre amigos llevada al aire: seis en la mesa, dos veces por semana.",
         "Bebidas · gastronomía · deportivas · automotriz · tecnología · telefonía"),
        ("El Motivo", "#F8A858",
         "Gente que armó algo desde cero, con público repartido entre Argentina, Colombia y España.",
         "Viajes · remesas y fintech · telecom · educación · marcas regionales"),
        ("Pequeños Grandes Sabios", "#FFD21C",
         "Chicos al aire con un adulto moderando: consumo familiar y compartido.",
         "Alimentos · útiles y librería · tecnología educativa · retail familiar · RSE"),
    ],
}

# ---------------------------------------------------------------- proyeccion
#
#   >>> SON PROYECCIONES DE LANZAMIENTO, NO DATOS HISTORICOS.
#   >>> Se reemplazan por numeros reales despues de la primera emision.
#
PROYECCION = {
    "eyebrow": "Qué esperar",
    "titulo": "Los números\nque manejamos.",
    "intro": "Proyección para un programa semanal en su temporada de lanzamiento. No son datos "
             "históricos: son el escenario con el que trabajamos y que se reemplaza por "
             "medición real desde la primera emisión.",
    "cols": ["Conservador", "Base"],
    "filas": [
        ("Vivo simultáneo", "40 – 80", "80 – 150"),
        ("VOD a 30 días", "400 – 800", "800 – 1.500"),
        ("Clips por emisión", "4 piezas", "6 piezas"),
        ("Alcance de clips", "3.000 – 7.000", "7.000 – 15.000"),
        ("Alcance mensual", "15.000 – 30.000", "30.000 – 60.000"),
    ],
    "notas": [
        ("El vivo es el más chico y el más valioso", "Es donde la PNT se hace en persona y la "
         "audiencia responde. El número es bajo por definición: nadie está disponible a una "
         "hora fija. Los que están, están de verdad."),
        ("El clip es el que mueve el alcance", "Ahí el número se despega de la audiencia del "
         "programa y llega a gente que nunca lo vio. Es la pieza que más circula y la que "
         "más barato sale producir, porque ya está grabada."),
        ("Se mide y se reporta", "Todos los niveles incluyen reporte mensual con emisiones, "
         "piezas publicadas y alcance real. Si el número no da, se dice."),
    ],
    "aviso": "Proyección de lanzamiento. Se actualiza con datos reales desde la primera emisión.",
}

# ---------------------------------------------------------------- cadena de valor
CADENA = {
    "eyebrow": "Cómo rinde",
    "titulo": "Una grabación,\ncuatro salidas.",
    "intro": "La marca no aparece una vez. Aparece en cada punto de la cadena, con el mismo "
             "material y sin producción adicional.",
    "pasos": [
        ("01", "El vivo", "La emisión con chat abierto. Es donde la PNT se hace en vivo y la "
                          "audiencia responde en el momento."),
        ("02", "El VOD", "El episodio completo queda publicado. Sigue sumando reproducciones "
                         "semanas después del aire."),
        ("03", "Los clips", "Cuatro a seis verticales por emisión. Es la pieza que más circula "
                            "y la que lleva la marca a gente que no vio el programa."),
        ("04", "El podcast", "La versión en audio, para el que escucha manejando o entrenando. "
                             "La mención del talento viaja intacta."),
    ],
}

# ---------------------------------------------------------------- inventario
INVENTARIO = {
    "eyebrow": "Qué se compra",
    "titulo": "Esto no es\nun banner.",
    "intro": "El inventario de un programa en vivo es más grande de lo que parece. Estas "
             "son las piezas que se venden, solas o combinadas.",
    "items": [
        ("Naming del ciclo", "«Programa presentado por…» en apertura, cierre y placas."),
        ("Naming de bloque", "Propiedad de un momento fijo de la emisión. La entrada de "
                             "mejor recordación por repetición."),
        ("PNT integrada", "Producto en mesa y mención del conductor dentro de la "
                          "conversación, no cortándola."),
        ("Prueba en vivo", "El producto se abre, se usa y se comenta al aire. Es el momento "
                           "que más se recorta después."),
        ("Beneficios a la audiencia", "Códigos, canjes y sorteos anunciados en vivo."),
        ("Presencia en los clips", "Cada emisión deja de cuatro a seis verticales, y la "
                                   "marca viaja en ellos."),
        ("Activaciones y eventos", "Emisiones especiales desde locación o evento de marca."),
    ],
}

# ---------------------------------------------------------------- los tres niveles
#
#   >>> ACA VAN LOS MONTOS. Mientras diga "A convenir", sale asi impreso.
#
NIVELES = [
    {
        "slug": "main",
        "tag": "Nivel 01",
        "nombre": "Main Sponsor",
        "claim": "La marca del lanzamiento.",
        "accent": "#4DA3FF",
        "bajada": "Exclusividad de rubro en toda la grilla. Es la marca que queda asociada "
                  "al proyecto, no a un programa.",
        "incluye": [
            "Naming en la grilla completa: los cinco programas",
            "Exclusividad de rubro durante toda la temporada",
            "PNT integrada en cada emisión de cada programa",
            "Presencia en la identidad visual: placas, apertura y cierre",
            "Prueba del producto al aire en las emisiones de la grilla",
            "Presencia en los clips verticales de toda la grilla",
            "Una activación especial por temporada, a definir en conjunto",
            "Prioridad de renovación antes de que la grilla salga a la venta",
        ],
        "cierre": "Un solo interlocutor, una sola negociación, toda la grilla.",
        "destinatario": "Para la marca que quiere ser el nombre del proyecto y no una mención más.",
    },
    {
        "slug": "support",
        "tag": "Nivel 02",
        "nombre": "Support",
        "claim": "Un programa, tuyo.",
        "accent": "#FF3F4D",
        "bajada": "Presencia sostenida en el programa de la grilla que mejor le hable a la "
                  "marca, sin pagar por los otros cuatro.",
        "incluye": [
            "Naming de bloque en el programa elegido",
            "PNT integrada en cada emisión de ese programa",
            "Presencia en placas y en el cierre del programa",
            "Presencia en los clips verticales de ese programa",
            "Prueba del producto al aire en las emisiones de ese programa",
            "Beneficios y códigos para la audiencia, anunciados en vivo",
            "Reporte mensual de emisiones, piezas y alcance",
            "Participación en las emisiones especiales de ese programa",
            "Prioridad para ampliar a un segundo programa durante la temporada",
        ],
        "cierre": "La inversión acotada a una audiencia concreta.",
        "destinatario": "Para la marca con un público claro que prefiere profundidad antes que alcance.",
    },
    {
        "slug": "partner",
        "tag": "Nivel 03",
        "nombre": "Partner Creativo",
        "claim": "Se paga con lo que hacés.",
        "accent": "#C7A45E",
        "bajada": "Acuerdo por intercambio: producto, servicio o capacidad a cambio de "
                  "presencia. Sin salida de caja para ninguno de los dos.",
        "incluye": [
            "Product placement natural en set, según el rubro",
            "Mención como partner en apertura y cierre",
            "Presencia en la placa de partners de la grilla",
            "Co-creación de al menos una acción por temporada",
            "Prueba del producto al aire cuando la acción lo permita",
            "Primera opción de pasar a Support en la temporada siguiente",
            "El recorte de su aparición, entregado para los canales de la marca",
            "Presencia en la comunicación de lanzamiento de la grilla",
        ],
        "cierre": "El acuerdo más rápido de cerrar y el que mejor funciona para probar.",
        "destinatario": "Para gastronomía, indumentaria, bebidas, tecnología, servicios creativos "
                        "y todo lo que se ve bien en cámara.",
    },
]

# >>>>>>>>>>>>>>>>>>>>>>>>  COMPLETAR ANTES DE MANDAR  <<<<<<<<<<<<<<<<<<<<<<<<
#
# Poner el monto y el periodo de cada nivel. Ejemplos de formato:
#     "main":    ("$ 1.200.000", "por mes · mínimo 3 meses")
#     "support": ("$ 450.000",   "por mes · mínimo 3 meses")
#     "partner": ("Por canje",   "valorizado según la acción")
#
INVERSION = {
    "main":    ("A convenir", "según duración de la temporada"),
    "support": ("A convenir", "según programa y duración"),
    "partner": ("Por canje",  "valorizado según la acción"),
}

NOTA_INVERSION = ("Todos los niveles se cotizan por temporada. El lanzamiento tiene precio de "
                  "lanzamiento: se sostiene para el que renueva.")

# ---------------------------------------------------------------- la excepcion
PROPIO = {
    "eyebrow": "Fuera de los tres niveles",
    "titulo": "¿Y si querés\ntu propio\nprograma?",
    "intro": "Los tres niveles ponen a la marca dentro de programas que ya existen. Hay un "
             "camino distinto para la marca que quiere tener el suyo.",
    "formatos": [
        ("Streaming propio", "#4DA3FF", "Un programa en vivo con la marca como dueña del "
                                        "formato, dentro de la grilla o por su propio canal."),
        ("Podcast propio", "#FF3F4D", "Ciclo de entrevistas o de contenido de marca, en video "
                                      "y en audio, con temporada cerrada."),
        ("Live set", "#50D000", "Música en vivo en el sector de live set, con la marca como "
                                "productora del ciclo."),
    ],
    "nota": "Es otro servicio y se cotiza aparte: no entra en Main, Support ni Partner. Se "
            "produce en el mismo estudio, con el mismo equipo y la misma calidad.",
}

# ---------------------------------------------------------------- comparativa
COMPARATIVA = {
    "eyebrow": "De un vistazo",
    "titulo": "Los tres,\nlado a lado.",
    "cols": ["Main", "Support", "Partner"],
    "filas": [
        ("Programas", "Los 5", "1 a elección", "Según acción"),
        ("Exclusividad de rubro", "Sí", "En su programa", "No"),
        ("Naming", "De ciclo", "De bloque", "Mención"),
        ("PNT en vivo", "Todas", "Las de su programa", "Placement"),
        ("Prueba en vivo", "En los 5", "En su programa", "Según acción"),
        ("Clips verticales", "Toda la grilla", "Su programa", "Según acción"),
        ("Activación especial", "1 por temporada", "A cotizar", "1 co-creada"),
        ("Reporte mensual", "Sí", "Sí", "Sí"),
    ],
}

# ---------------------------------------------------------------- respaldo
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
    ("3 · Live set", "La alfombra contra los paneles, para música en vivo"),
]

STAFF = [
    ("Producción Ejecutiva", "Lorena Rizzo",
     "Decide qué se produce y responde por el proyecto ante la marca."),
    ("Producción General", "Fabricio Ortega · Martina Nagel (asistente)",
     "Arman cada emisión: rutina, contenidos y dónde entra el sponsor en el aire."),
    ("Dirección General", "Fede Aguirre · Nico Lahargou",
     "Definen cómo se ve y cómo suena cada programa, en vivo y en los recortes."),
    ("Dirección de Marketing", "Julián Barreiro",
     "Trabaja la distribución y el seguimiento de las acciones de marca."),
    ("Producción Técnica", "Néstor Mago",
     "Sostiene el piso: cámaras, audio, switching y la emisión sin caídas."),
]

# ---------------------------------------------------------------- cierre
PASOS = {
    "eyebrow": "Cómo seguimos",
    "titulo": "Cuatro pasos\ny estás al aire.",
    "pasos": [
        ("01", "Una charla de 30 minutos", "Nos contás qué necesita la marca este año. No "
                                           "hace falta que vengas con el brief cerrado."),
        ("02", "Propuesta a medida", "Te mandamos el nivel y el programa que mejor encajan, "
                                     "con la inversión y el detalle de piezas."),
        ("03", "Diseño de la activación", "Definimos juntos cómo entra la marca en el aire. "
                                          "Acá trabaja producción, no un vendedor."),
        ("04", "Al aire", "Arrancás con la temporada y recibís el reporte mensual de lo que "
                          "salió y cómo rindió."),
    ],
    "destacado": "Entre la primera charla y la primera emisión con tu marca pasan semanas, "
                 "no meses.",
}

CONTACTO = {
    "eyebrow": "Hablemos",
    "titulo": "El lugar se\nelige una\nsola vez.",
    "bajada": "Escribinos y coordinamos la charla. Si querés, la hacemos en el estudio y "
              "te mostramos dónde iría tu marca.",
    "firma_nombre": "Fabricio Benjamín Ortega",
    "firma_rol": "Producción General · Nexo Studios",
    "firma_extra": "San Martín, Provincia de Buenos Aires",
}
