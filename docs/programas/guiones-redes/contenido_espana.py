# -*- coding: utf-8 -*-
"""15 guiones — Conexión con España: Nexo Studios (San Martín) × Somos Como Somos (Ibiza).

El programa que une los dos puntos es El Motivo, martes de 18 a 20 h hora de Argentina.
"""

SLUG = "conexion-espana"
ARCHIVO = "Nexo-conexion-con-Espana-15-guiones.pdf"
EYEBROW = "Guiones de redes · El puente"
TITULO = "Conexión\ncon España."
TITULO_CORTO = "Conexión con España"
BAJADA = ("15 videos de hasta 1 minuto sobre el puente entre Nexo Studios, en San Martín, "
          "y el canal Somos Como Somos, de Ibiza. El programa que los une es El Motivo.")
FIRMA = "El Motivo · Martes 18 a 20 h (ARG)"
ACENTOS = ["#C7A45E", "#FF3F4D", "#4DA3FF"]

METODO = [
    ("Los primeros 3 segundos son el video",
     "El gancho va antes que cualquier presentación. Si en el segundo 3 no pasó nada, no hay segundo 10."),
    ("Nombrá los dos lugares en la primera frase",
     "San Martín e Ibiza juntos en una misma oración es el gancho. La distancia es el contenido."),
    ("Mostrá el puente, no lo expliques",
     "Un mapa, dos relojes, dos pantallas. Lo que se puede ver no se cuenta."),
    ("Hablale a uno de los dos lados por vez",
     "Un video le habla al que está acá o al que está allá. El que le habla a los dos no le habla a nadie."),
    ("Cerrá con una frase, no con «escribinos»",
     "El cierre tiene que poder citarse. El link va en la bio, no en el guion."),
    ("Subtitulado siempre, en español neutro",
     "Se mira sin audio y se mira en tres países. Cuidá los modismos que no cruzan."),
]

IDEAS = [
    {"n": "01", "cat": "El puente", "vende": "El Motivo", "dur": "45 s",
     "titulo": "Se graba en San Martín, se ve en Ibiza",
     "gancho": "Esto se graba en San Martín y se mira a diez mil kilómetros.",
     "desarrollo": "El Motivo sale todos los martes por el canal de Somos Como Somos, que está "
                   "en Ibiza. Alguien se sienta acá a contar su historia y esa misma noche la "
                   "está escuchando gente en España que nunca pisó Buenos Aires.",
     "recurso": "El estudio en plano general y, encima, un mapa con la línea que une San Martín "
                "con Ibiza dibujándose.",
     "cierre": "Tu historia no se queda en tu barrio."},

    {"n": "02", "cat": "El canal", "vende": "El Motivo", "dur": "40 s",
     "titulo": "Hay un canal en Ibiza que ya tiene público",
     "gancho": "Hay un canal en Ibiza con ocho programas al aire. Uno es nuestro.",
     "desarrollo": "Somos Como Somos es un canal español con comunidad propia: más de 4.200 "
                   "suscriptores y más de 526 mil reproducciones acumuladas. El Motivo entra "
                   "ahí, no en un canal recién abierto.",
     "recurso": "La pantalla del canal con la grilla de programas, y el nuestro marcado.",
     "cierre": "No armamos una audiencia de cero. Nos sumamos a una que ya existe."},

    {"n": "03", "cat": "El puente", "vende": "El Motivo", "dur": "40 s",
     "titulo": "En España hay un bloque que se llama Martes de Buenos Aires",
     "gancho": "En la grilla de un canal español hay un bloque que se llama Martes de Buenos Aires.",
     "desarrollo": "Es la franja donde entra lo que se produce acá, de 18 a 20 hora de Argentina. "
                   "El nombre no es decorativo: Buenos Aires es el contenido del bloque, no el "
                   "telón de fondo.",
     "recurso": "La grilla del canal con el bloque resaltado, y corte al estudio en San Martín.",
     "cierre": "No es contenido argentino traducido. Es Buenos Aires al aire."},

    {"n": "04", "cat": "Producción", "vende": "Producción multi-locación", "dur": "50 s",
     "titulo": "Tres países, una sola mesa",
     "gancho": "Yo estoy en San Martín, mi co-conductora en Bogotá y el canal está en Ibiza.",
     "desarrollo": "Tres husos horarios y una sola conversación. Se cruza la agenda, se prueba "
                   "conexión una hora antes, los dos lados tienen retorno y talkback, y hay un "
                   "protocolo escrito para cuando se cae el internet de alguno.",
     "recurso": "Tres relojes con tres horarios distintos y el control manejando las señales.",
     "cierre": "La distancia no se improvisa. Se produce."},

    {"n": "05", "cat": "Para el invitado", "vende": "Invitados", "dur": "45 s",
     "titulo": "¿Para qué te sirve que te vean en España?",
     "gancho": "¿Para qué te sirve que tu historia se escuche en Ibiza?",
     "desarrollo": "Porque el que te ve del otro lado no te conoce de antes. No hay prejuicio de "
                   "barrio, de rubro ni de quién es tu primo. Tu historia se juzga sola. Y del "
                   "otro lado hay un mercado que habla tu idioma y no sabe que existís.",
     "recurso": "Plano cerrado hablando a cámara, y corte al mapa cuando digo «del otro lado».",
     "cierre": "Afuera nadie sabe de dónde venís. Solo escuchan lo que hiciste."},

    {"n": "06", "cat": "Para el invitado", "vende": "Invitados", "dur": "40 s",
     "titulo": "El pasaje más barato a Europa",
     "gancho": "Podés hablarle a España sin sacar un pasaje.",
     "desarrollo": "La entrevista se graba en el estudio de San Martín y sale por un canal "
                   "español. Sin viaje, sin visa, sin producir nada afuera. Te sentás dos horas "
                   "acá y quedás en la grilla de allá.",
     "recurso": "La silla vacía del invitado en el estudio, y corte a un plano de Ibiza.",
     "cierre": "El pasaje más barato a Europa es una silla en este estudio."},

    {"n": "07", "cat": "Editorial", "vende": "El Motivo", "dur": "45 s",
     "titulo": "Contar tu historia para alguien que no vive acá",
     "gancho": "Contá tu historia sabiendo que la escucha alguien que nunca pisó tu ciudad.",
     "desarrollo": "Te obliga a sacar el chiste interno, a explicar por qué eso importaba y a "
                   "no dar nada por sabido. El que produce pensando en afuera termina "
                   "produciendo mejor para los de adentro también.",
     "recurso": "Yo contando algo y frenando a mitad de frase para explicar una referencia. "
                "El corte en seco es el chiste.",
     "cierre": "Hablarle a otro país te ordena la historia."},

    {"n": "08", "cat": "Convocatoria", "vende": "Invitados", "dur": "45 s",
     "titulo": "Buscamos invitados de los dos lados",
     "gancho": "Si estás en España y tenés algo que contar, también hay una silla.",
     "desarrollo": "Emprendedores, artistas y profesionales de Argentina, Colombia y España. "
                   "Los de acá se sientan en el estudio. Los de allá entran en vivo por "
                   "videollamada, con la misma calidad de audio y video que los de piso.",
     "recurso": "La silla del estudio y, al lado, una pantalla con alguien conectado. Los dos "
                "en el mismo plano.",
     "cierre": "El programa no tiene frontera. Tiene horario."},

    {"n": "09", "cat": "Producción", "vende": "El Motivo", "dur": "40 s",
     "titulo": "La diferencia horaria juega a favor",
     "gancho": "Cuando acá son las seis de la tarde, en España son las once de la noche.",
     "desarrollo": "Y esa es justamente la hora en que la gente de allá está en casa con el "
                   "teléfono en la mano. El huso horario no es un obstáculo que hay que "
                   "aguantar: es una decisión de programación.",
     "recurso": "Dos relojes juntos marcando las dos horas, y corte a una casa de noche.",
     "cierre": "La grilla se piensa para el que mira, no para el que graba."},

    {"n": "10", "cat": "El programa", "vende": "El Motivo", "dur": "40 s",
     "titulo": "Tres temporadas al aire",
     "gancho": "El Motivo no es una idea que tenemos. Ya lleva tres temporadas al aire.",
     "desarrollo": "El formato está probado, la escaleta escrita y el equipo armado. El que se "
                   "sienta en esa silla no está participando de un experimento: entra a un "
                   "programa que ya funciona todas las semanas.",
     "recurso": "Pila de escaletas de temporadas anteriores, o la lista de episodios del canal "
                "bajando en pantalla.",
     "cierre": "No te invitamos a un piloto. Te invitamos a un programa."},

    {"n": "11", "cat": "Editorial", "vende": "El Motivo", "dur": "45 s",
     "titulo": "¿Qué tiene que ver San Martín con Ibiza?",
     "gancho": "¿Qué puede tener que ver San Martín con Ibiza?",
     "desarrollo": "Gente que se fue. Gente que se quiere ir. Gente que volvió. Y gente que se "
                   "quedó y construyó acá. De los dos lados del Atlántico la pregunta termina "
                   "siendo la misma: por qué hacés lo que hacés.",
     "recurso": "Fotos o planos de las dos ciudades alternando cada vez que nombro un tipo de "
                "persona.",
     "cierre": "El motivo es el mismo en los dos hemisferios."},

    {"n": "12", "cat": "Formato", "vende": "El Motivo", "dur": "50 s",
     "titulo": "La sección que funciona igual en los tres países",
     "gancho": "Hay una parte del programa que funciona igual en Argentina, Colombia y España.",
     "desarrollo": "Se llama Antes del sí: el momento exacto en que la persona decidió arrancar. "
                   "El miedo antes de la decisión no cambia de idioma ni de moneda. Por eso es "
                   "el bloque que más se recorta y más circula.",
     "recurso": "Placa de la sección entrando al aire, y tres o cuatro caras distintas "
                "respondiendo la misma pregunta.",
     "cierre": "Los números cambian de país. El miedo, no."},

    {"n": "13", "cat": "Producción", "vende": "Producción multi-locación", "dur": "45 s",
     "titulo": "Producir para dos audiencias sin partirse al medio",
     "gancho": "Un mismo programa para dos países no se hace diciendo todo dos veces.",
     "desarrollo": "Se hace eligiendo historias que se entiendan en los dos lados y sacando las "
                   "referencias que solo funcionan acá. No es neutralizar el acento: es elegir "
                   "mejor de qué hablamos.",
     "recurso": "Escaleta con dos columnas marcadas: lo que cruza y lo que no.",
     "cierre": "No se traduce el programa. Se elige el tema."},

    {"n": "14", "cat": "Para marcas", "vende": "Sponsors", "dur": "45 s",
     "titulo": "Una marca argentina que quiere sonar en España",
     "gancho": "Si tu marca quiere que la escuchen en España, hay una forma barata de probar.",
     "desarrollo": "Un bloque dentro de un programa que ya sale allá todas las semanas. No hay "
                   "que abrir mercado, ni contratar productora afuera, ni traducir nada. Entrás "
                   "en una grilla que ya tiene público.",
     "recurso": "Placa de bloque patrocinado saliendo al aire en el canal español.",
     "cierre": "Probar afuera no tiene por qué costar como mudarse afuera."},

    {"n": "15", "cat": "Convocatoria", "vende": "El Motivo", "dur": "40 s",
     "titulo": "Martes a las seis, de este lado del mapa",
     "gancho": "Todos los martes a las seis de la tarde, este estudio se conecta con España.",
     "desarrollo": "Dos horas en vivo, con invitado en piso y co-conducción a distancia. Si "
                   "tenés una historia que contar o una marca que quiere cruzar, ese es el "
                   "horario y este es el lugar.",
     "recurso": "Cuenta regresiva hasta las 18:00 y el piso encendiéndose. Cerrar con el cartel "
                "de ON AIR.",
     "cierre": "El puente se abre los martes a las seis."},
]
