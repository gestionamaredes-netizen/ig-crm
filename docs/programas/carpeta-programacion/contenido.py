# -*- coding: utf-8 -*-
"""Contenido de la Carpeta General de Proyecto — Nexo Studios.

Todo el texto del dossier vive acá. Para cambiar una bajada, un bloque de
escaleta o una categoria comercial, se edita en este archivo y se vuelve a
correr ./build-carpeta.sh — no hace falta tocar el HTML.
"""

STAFF = [
    ("Producción Ejecutiva", "Lorena Rizzo"),
    ("Producción General", "Fabricio Ortega · Martina Nagel"),
    ("Dirección General", "Fede Aguirre · Nico Lahargou"),
    ("Dirección de Marketing", "Julián Barreiro"),
    ("Producción Técnica", "Néstor Mago"),
    ("Estudio", "Nexo Studios"),
]

ESTUDIO = [
    ("Cámaras", "5 en piso", "3 PTZ ópticas con movimiento programado + 2 Insta360 Link 2C Pro"),
    ("Micrófonos", "6 Shure MV7+", "Dinámicos cardioide, XLR + USB-C, DSP integrado, cuerpo metálico broadcast"),
    ("Consola", "Rodecaster Pro II", "Audio multipista: cada voz se edita después por separado"),
    ("Mesa de sonido", "Behringer X2442USB", "24 canales para mesas largas, invitados extra, música y refuerzo de sala"),
    ("Switching", "Elgato Stream Deck XL", "32 teclas LCD: cámaras, placas y cortinas a un toque, en vivo"),
    ("Monitoreo", "In-ear + Smart TV 50″", "Retorno individual Shure SE215, talkback control-set y previo 4K en piso"),
]

PROGRAMAS = [
    {
        "n": "01",
        "slug": "sex-and-the-baires",
        "nombre": "Sex and the Baires",
        "tagline": "Cinco mujeres, cero libreto, en vivo.",
        "unalinea": "La conversación que ya está pasando en cada grupo de WhatsApp, "
                    "ahora con cámara, chat abierto y una psicóloga en la mesa.",
        "accent": "#ED1877", "accent2": "#FF7FB4",
        "logo": "logo-sex-and-the-baires.png", "logo_bg": "#000000",
        "ficha_rapida": [("Formato", "IRL · streaming en vivo"),
                         ("Duración", "80–90 min"),
                         ("Frecuencia", "Semanal"),
                         ("Elenco", "5 conductoras + columnista")],
        "sinopsis": [
            "Sex and the Baires es una mesa de cinco mujeres de entre 33 y 52 años que se sientan "
            "a hablar en vivo de lo que normalmente se habla en privado: maternidad, menopausia, "
            "parejas, sexo, plata, cuerpo y la actualidad que les toca. No hay libreto ni tema "
            "prohibido. Hay cinco miradas que no coinciden —distintas edades, distintas historias, "
            "distintos lugares desde donde mirar— y una conversación que avanza sola.",
            "El formato IRL sostiene todo en vivo: el chat entra al programa, las conductoras "
            "responden en tiempo real y cada emisión cierra con dos anclas fijas —la columna de "
            "una psicóloga profesional y el resumen de los puntos clave— que le dan a la audiencia "
            "algo concreto para llevarse. El vivo genera comunidad; los bloques fijos generan "
            "el recorte que después circula.",
        ],
        "target": [
            ("Núcleo", "Mujeres de 35 a 49 años"),
            ("Extendido", "30 a 55 años"),
            ("Perfil", "Urbano AMBA y grandes centros. NSE C1 – C2 – C3 alto"),
            ("Intereses", "Salud y bienestar femenino, maternidad y crianza, sexualidad, "
                          "vínculos, cultura pop, actualidad"),
            ("Comportamiento", "Consumo de podcast y vivo, alta participación en chat y comentarios, "
                               "decisoras de compra del hogar"),
            ("Secundaria", "Varones de 35 a 50 que llegan por el clip corto y se quedan por el debate"),
        ],
        "pilares": [
            ("Conversación, no panel",
             "Nadie modera desde arriba: las cinco discuten entre ellas. El formato no se agota "
             "porque el tema nunca termina de cerrarse."),
            ("El vivo construye comunidad",
             "El chat es parte del programa. La audiencia vuelve porque participa, no porque mira."),
            ("Dos anclas clipeables",
             "El Diván y Los Cinco Puntos generan, todas las semanas, piezas que circulan solas."),
        ],
        "distribucion": [
            ("Vivo", "YouTube y Twitch, con chat abierto durante toda la emisión"),
            ("VOD", "Episodio completo en el canal del programa"),
            ("Clips", "4 a 6 verticales por emisión para Reels, TikTok y Shorts"),
            ("Audio", "Versión podcast en plataformas de audio"),
        ],
        "escaleta": [
            ("00", "Apertura", "0 – 05'", "Cold open. Presentación de las cinco y titular de lo que viene."),
            ("01", "El tema", "05 – 30'", "Debate libre sobre el tema de la semana. Sin moderación rígida: se cruzan."),
            ("02", "Sin filtro", "30 – 50'", "Ronda de preguntas incómodas y lectura del chat en vivo."),
            ("03", "El diván", "50 – 70'", "Columna de la psicóloga: lectura profesional del tema del día."),
            ("04", "Los cinco puntos", "70 – 85'", "Una conclusión por conductora. Pieza pensada para clipear."),
        ],
        "tono": [
            ("Set", "Living cálido dentro del estudio. Paleta vino y rosa profundo sobre la base del set."),
            ("Cámara", "PTZ para reacciones y planos cerrados. El formato vive de las caras, no de los planos generales."),
            ("Gráfica", "Tipografía editorial, placas de tema y reloj de bloque. Sobria, para que el contenido sea el escándalo."),
            ("Tono", "Coloquial, con humor y sin eufemismos. Cero solemnidad, cero tono de campaña."),
            ("Regla editorial", "Todo lo que toca salud pasa por la columnista. Opinión sí, consejo médico no."),
        ],
        "monetizacion": [
            ("Naming del ciclo", "«Sex and the Baires presentado por…» en placa, apertura, cierre y todas las piezas."),
            ("Naming de bloque", "«El Diván by…» o «Los Cinco Puntos by…». Propiedad de un momento fijo de la emisión."),
            ("PNT integrada", "Producto en mesa, prueba en vivo y mención del talento dentro de la conversación."),
            ("Branded content", "Cápsulas verticales con las conductoras, producidas en el mismo estudio."),
            ("Beneficios a la audiencia", "Códigos y canjes anunciados en vivo para la comunidad del chat."),
            ("Activaciones", "Emisiones especiales desde locación o evento de marca."),
        ],
        "categorias": "Salud femenina y OTC · Cuidado personal y cosmética · Indumentaria · "
                      "Bebidas · Wellness y fitness · Fintech y seguros · Retail",
    },
    {
        "n": "02",
        "slug": "exitosa-yo",
        "nombre": "Exitosa Yo",
        "lockup": "EY Podcast · by Nexo Studios",
        "tagline": "Cómo lo hicieron. Contado por ellas.",
        "unalinea": "Historias reales de mujeres que inspiran. Emprendedoras que comparten su "
                    "camino, para que vos también te animes a dar el paso.",
        "accent": "#FF2D8B", "accent2": "#FF9AC8", "glow": "#0B2D6B",
        "logo": "logo-exitosa-yo.png", "logo_bg": "#000000",
        "ficha_rapida": [("Formato", "Podcast de entrevistas"),
                         ("Duración", "40–55 min"),
                         ("Frecuencia", "Semanal"),
                         ("Elenco", "1 conductora + 1 invitada")],
        "sinopsis": [
            "Exitosa Yo es un ciclo de entrevistas a mujeres emprendedoras y líderes de distintos "
            "rubros: fundadoras, gerentas, oficios, industrias donde son minoría. Cada episodio "
            "recorre la historia de vida completa —de dónde salió la idea, qué había antes, qué se "
            "dejó en el camino— y se detiene donde los medios suelen pasar rápido: el obstáculo "
            "concreto y cómo se resolvió.",
            "La diferencia del formato está en el cierre: cada entrevista termina con consejos "
            "accionables para mujeres que están por emprender. No es un ciclo de autoayuda ni de "
            "vidrieras de éxito; es material de trabajo, con números, decisiones y errores dichos "
            "en voz alta. Esa utilidad concreta es lo que lo vuelve un ciclo guardable y "
            "recomendable, no solo mirable.",
        ],
        "target": [
            ("Núcleo", "Mujeres de 28 a 45 años"),
            ("Extendido", "25 a 55 años"),
            ("Perfil", "Profesionales, emprendedoras, cuentapropistas y mujeres en transición laboral. NSE C1 – C2"),
            ("Intereses", "Negocios y gestión, desarrollo profesional, finanzas personales, "
                          "liderazgo, formación, equilibrio vida-trabajo"),
            ("Comportamiento", "Consumo en diferido y en auto o transporte. Alta tasa de guardado "
                               "y de recomendación boca a boca"),
            ("Secundaria", "Varones de 30 a 50 del ecosistema emprendedor y tomadores de decisión"),
        ],
        "pilares": [
            ("Utilidad antes que vidriera",
             "Cada episodio deja algo aplicable. Eso convierte oyentes en una comunidad que "
             "guarda, comparte y recomienda."),
            ("Una vertical por temporada",
             "Hay una emprendedora en cada rubro: el ciclo escala por temporadas temáticas sin "
             "tocar el formato."),
            ("Atención sostenida",
             "El podcast se escucha completo y en diferido. Menos alcance bruto, más profundidad "
             "de contacto por oyente."),
        ],
        "distribucion": [
            ("Audio", "Spotify, Apple Podcasts y YouTube Music"),
            ("Video", "Episodio completo en YouTube"),
            ("Clips", "3 a 5 verticales por episodio"),
            ("Texto", "Citas y resumen editorial para LinkedIn e Instagram"),
        ],
        "escaleta": [
            ("01", "El punto cero", "0 – 08'", "Quién es y qué había antes. De dónde salió la idea."),
            ("02", "La pared", "08 – 20'", "El obstáculo concreto: el momento en que casi no sigue."),
            ("03", "El método", "20 – 35'", "Cómo se construyó. Decisiones, números, equipo y aprendizajes."),
            ("04", "La caja de herramientas", "35 – 47'", "Tres consejos accionables para la que está por arrancar."),
            ("05", "Ping pong", "47 – 55'", "Cierre rápido y una recomendación para llevarse."),
        ],
        "tono": [
            ("Set", "Sobrio y premium. Dos butacas, luz direccional y fondo profundo: la escena es la invitada."),
            ("Cámara", "Plano de entrevista clásico con dos cerrados y un general. Edición limpia, sin efectismo."),
            ("Gráfica", "Línea editorial de negocios: placas de datos, citas destacadas y capítulos marcados."),
            ("Tono", "Entrevista periodística cálida. Pregunta incómoda cuando hace falta, siempre con respeto."),
            ("Regla editorial", "Nada sale sin lo concreto: cada historia deja al menos un dato o una decisión replicable."),
        ],
        "monetizacion": [
            ("Naming del ciclo", "Presencia principal en apertura, cierre, placas y toda la distribución del episodio."),
            ("Bloque patrocinado", "«La caja de herramientas by…»: el momento más útil del programa, con marca."),
            ("Ciclos temáticos", "Temporadas por vertical —gastronomía, tecnología, oficios, retail— vendidas por rubro."),
            ("Series de marca", "Episodios producidos con la marca, con sus propias referentes como invitadas."),
            ("Spots pre y mid roll", "Lectura del talento, integrada al ritmo de la entrevista."),
            ("Extensión a evento", "Grabación abierta con público y mesa de networking para la comunidad de la marca."),
        ],
        "categorias": "Bancos y fintech · Seguros · Edtech y universidades · Software de gestión · "
                      "E-commerce y logística · Telcos · Programas públicos de emprendedurismo",
    },
    {
        "n": "03",
        "slug": "proyecto-ninos",
        "nombre": "Pequeños Grandes Sabios",
        "tagline": "El mundo de los grandes, revisado por los chicos.",
        "unalinea": "Cinco chicos de 8 a 12 debaten en vivo sobre el mundo adulto, y una vez por "
                    "programa le hacen la entrevista a un grande.",
        "accent": "#FECC01", "accent2": "#FFE47A", "glow": "#0A2A5E",
        "logo": "logo-pequenos-grandes-sabios.png", "logo_bg": "#061630",
        "ficha_rapida": [("Formato", "IRL · streaming en vivo"),
                         ("Duración", "45–60 min"),
                         ("Frecuencia", "Semanal o quincenal"),
                         ("Elenco", "5 chicos + 1 adulto moderador")],
        "sinopsis": [
            "Cinco chicos —tres nenas y dos nenes de entre 8 y 12 años— se sientan con un adulto "
            "que modera y opinan sobre el mundo que les armamos: el trabajo, la plata, las "
            "pantallas, las reglas de casa, la escuela, las noticias que escuchan de costado. "
            "La gracia no es que digan cosas graciosas: es que hacen las preguntas que un adulto "
            "ya no se anima a hacer.",
            "Cada emisión tiene un invitado grande que se sienta a que lo entrevisten ellos, y "
            "cierra con una reflexión del moderador que ordena lo hablado sin bajar línea. El "
            "formato se produce bajo un protocolo de protección de menores explícito, que además "
            "funciona como garantía de brand safety para el anunciante.",
        ],
        "target": [
            ("Núcleo", "Familias: madres y padres de 30 a 45 con hijos de 6 a 13"),
            ("Co-viewing", "Chicos de 8 a 12, siempre en consumo acompañado"),
            ("Perfil", "Urbano y suburbano, NSE C1 – C2 – C3. Alta presencia en YouTube y TV conectada"),
            ("Intereses", "Crianza, educación, entretenimiento familiar, cultura pop infantil, tecnología en casa"),
            ("Comportamiento", "Consumo compartido en pantalla grande. El clip corto circula por "
                               "grupos de padres y de escuela"),
            ("Terciaria", "Docentes, abuelos y equipos de contenido educativo"),
        ],
        "pilares": [
            ("Lo impredecible es el formato",
             "No hay guion posible: el valor está en lo que dicen cuando nadie los corrige."),
            ("Co-viewing real",
             "Se mira en familia y en pantalla grande. La marca llega al chico y al adulto en el "
             "mismo momento."),
            ("Brand safety auditable",
             "El protocolo de menores es contractual y verificable, no una declaración de buenas "
             "intenciones."),
        ],
        "distribucion": [
            ("Vivo", "YouTube con chat moderado y delay de seguridad"),
            ("VOD", "Episodio completo en el canal del programa"),
            ("Clips", "4 a 6 verticales, recortados con criterio de protección de menores"),
            ("Extensión", "Material para uso escolar, ferias y acciones educativas"),
        ],
        "escaleta": [
            ("01", "La pregunta del día", "0 – 08'", "Se abre un tema del mundo adulto en lenguaje cotidiano."),
            ("02", "La mesa de los sabios", "08 – 25'", "Los cinco discuten. El adulto ordena, no corrige ni guiona."),
            ("03", "El interrogatorio", "25 – 45'", "Entra el invitado grande y las preguntas las hacen ellos."),
            ("04", "La moraleja al revés", "45 – 55'", "Conclusión de los chicos y reflexión final del moderador."),
        ],
        "tono": [
            ("Set", "Los módulos de color del estudio a pleno. Luminoso y vivo, sin caer en lo infantiloide."),
            ("Cámara", "Planos cortos y cruzados para las reacciones. Ritmo ágil, cortes cortos."),
            ("Gráfica", "Motion graphics, placas animadas y subtítulos. Pensada para que el clip funcione sin audio."),
            ("Tono", "Humor genuino y espontáneo. Cero adultización del chico, cero chiste escrito por un grande."),
            ("Regla editorial", "Agenda estrictamente cotidiana. Ningún tema sensible de adultos entra a la mesa."),
        ],
        "protocolo": [
            "Autorización firmada de madres, padres o tutores para cada emisión.",
            "Un adulto responsable por cada chico presente en el estudio durante toda la jornada.",
            "Jornadas acotadas y con pausas pautadas, en cumplimiento de la normativa vigente "
            "de trabajo infantil artístico.",
            "Chat con delay y moderación activa. Ningún mensaje llega al aire sin revisión previa.",
            "Sin datos personales al aire: no se mencionan apellidos, escuela, barrio ni redes.",
            "Curaduría de temas previa a cada emisión, con acompañamiento profesional del formato.",
            "Entorno verificable para el anunciante: brand safety auditable, no declarativo.",
        ],
        "monetizacion": [
            ("Naming del ciclo", "Marca principal en un entorno de consumo familiar y compartido."),
            ("Sección patrocinada", "«El interrogatorio by…»: el bloque de mayor circulación en clip."),
            ("Product placement", "Presencia natural en set: merienda, útiles, indumentaria, tecnología."),
            ("Contenido educativo", "Cápsulas de marca con eje pedagógico —educación financiera, "
                                    "reciclado, uso responsable de pantallas."),
            ("Activaciones escolares", "Extensión del formato a escuelas y ferias, con cobertura propia."),
            ("RSE y fundaciones", "Programas especiales para marcas con agenda de infancia y educación."),
        ],
        "categorias": "Alimentos y bebidas familiares · Útiles y editoriales · Retail e indumentaria infantil · "
                      "Telcos y tecnología del hogar · Bancos (educación financiera) · Entretenimiento · ONG y RSE",
    },
]

PAQUETES = [
    ("Grilla completa", "Presencia en los tres programas",
     "Naming o PNT en las tres señales, con una sola negociación y un solo interlocutor. "
     "La cobertura más amplia: mujeres adultas, mujeres emprendedoras y familias."),
    ("Vertical femenina", "Sex and the Baires + Exitosa Yo",
     "Alcanza a la misma mujer en dos momentos distintos: la conversación íntima del vivo y "
     "la escucha útil del podcast. Ideal para categorías de salud, cuidado personal y finanzas."),
    ("Paquete familia", "Pequeños Grandes Sabios + acciones",
     "Entorno de co-viewing con protocolo de protección de menores auditable. Para marcas de "
     "consumo familiar que necesitan brand safety demostrable."),
    ("Sponsor de bloque", "Un bloque fijo, un programa",
     "Propiedad de un momento recurrente de la emisión. La entrada de menor inversión y la de "
     "mejor recordación por repetición."),
]

ASSETS = [
    "Emisión en vivo con placas y menciones",
    "VOD completo en el canal del programa",
    "Clips verticales para IG, TikTok y Shorts",
    "Menciones y lecturas del talento",
    "Piezas gráficas y motion de campaña",
    "Activaciones y emisiones especiales",
]
