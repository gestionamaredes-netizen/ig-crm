# -*- coding: utf-8 -*-
"""20 guiones para grabar en dupla: Fabricio + Martu, Producción General.

Base: el alcance real de preproducción que la dupla trabaja en los programas
de Nexo Studios. Cada guion sale de una tarea concreta o de un límite del rol,
no de una descripción de puesto.
"""

SLUG = "produccion-martu"
ARCHIVO = "Nexo-produccion-general-20-guiones-con-Martu.pdf"
EYEBROW = "Producción General · Fabricio + Martu"
TITULO = "Todo lo que\npasa antes\nde la luz\nroja."
TITULO_CORTO = "Producción general"
BAJADA = ("20 guiones de hasta 1 minuto para grabar en dupla. El programa se ve dos "
          "horas; la semana que lo hace posible no se ve nunca. De eso hablan estos videos.")
FIRMA = "Fabricio + Martu · Nexo Studios"
ACENTOS = ["#4DA3FF", "#FF3F4D", "#C7A45E"]

CONEXION_EYEBROW = "Antes de grabar nada"
CONEXION_TITULO = "El alcance,<br>sin letra chica."
CONEXION_PIE = "El alcance"
CONEXION = [
    ("Se arma en equipo, siempre",
     "La preproducción se trabaja con todo el equipo del programa, en reuniones y charlas "
     "previas a cada emisión. Ahí todos aportan ideas, contenidos y lineamientos."),
    ("Qué hace producción con eso",
     "Lo organiza, lo estructura y lo lleva adelante. Producción no reemplaza la voz del "
     "programa: la ordena para que entre en el aire."),
    ("Los invitados son de todos",
     "La gestión de invitados y participaciones especiales no es exclusiva de producción. "
     "La búsqueda y el contacto se coordinan con el equipo entero."),
    ("Qué entra siempre",
     "Rutina, selección de contenidos, dinámicas de participación, identidad visual, piezas "
     "gráficas cuando hacen falta y la organización previa a cada emisión."),
    ("El presupuesto sigue al formato",
     "Lo pactado contempla el formato y el nivel de producción planteados al inicio. Si el "
     "programa suma complejidad o recursos técnicos, se revisa y se actualiza."),
    ("El horario también pesa",
     "El presupuesto puede variar según el horario de transmisión y lo que ese horario "
     "implique para la producción."),
]

METODO = [
    ("No expliques tu puesto: mostrá una decisión",
     "Nadie comparte un video que dice «soy productor». Comparten el que muestra por qué un "
     "bloque dura 33 minutos y no 40."),
    ("El gancho va antes que la presentación",
     "Los nombres al final o en el copy. Si en el segundo 3 no pasó nada, no hay segundo 10."),
    ("Si son dos, que se note que son dos",
     "Interrumpirse, no estar de acuerdo, terminar la frase del otro. Dos personas turnándose "
     "para leer no es una dupla."),
    ("Primero el problema, después cómo se resolvió",
     "El problema es lo que retiene. La solución es lo que te contrata."),
    ("Nombrá lo que el espectador no ve",
     "El valor de producción está justamente en lo invisible. Si no lo nombrás, no existe."),
    ("Cerrá con una frase que se pueda citar",
     "El cierre tiene que poder ir solo en un posteo. El «seguinos» va en el copy, no en boca."),
]

IDEAS = [
    {"n": "01", "quien": "Los dos", "cat": "La semana", "vende": "Preproducción", "dur": "45 s",
     "titulo": "El programa dura dos horas",
     "gancho": "El programa dura dos horas. Nosotros empezamos el lunes.",
     "desarrollo": "Contamos qué pasa los días que nadie ve: la reunión con el equipo, el "
                   "armado de la rutina, la búsqueda de material, las piezas gráficas. "
                   "Cuando se enciende la luz roja, el 90% del trabajo ya pasó.",
     "recurso": "Placa con los días de la semana y qué se hace en cada uno. Cerrar con el "
                "cartel de EN VIVO encendiéndose.",
     "cierre": "Lo que se ve son dos horas. Lo que lo sostiene son cinco días."},

    {"n": "02", "quien": "Martu", "cat": "La rutina", "vende": "La rutina", "dur": "40 s",
     "titulo": "Esto es el programa antes del programa",
     "gancho": "Este papel es el programa entero, escrito, antes de que exista.",
     "desarrollo": "La rutina define secciones, tiempos y orden. No es un resumen de lo que "
                   "va a pasar: es la decisión de lo que va a pasar. Sin eso, un vivo se "
                   "convierte en una charla larga que no termina de arrancar nunca.",
     "recurso": "La rutina impresa en mano, marcada a mano. Plano cerrado a los tiempos "
                "anotados al costado.",
     "cierre": "Un programa no se improvisa. Se ordena."},

    {"n": "03", "quien": "Fabri", "cat": "Tiempos", "vende": "La rutina", "dur": "40 s",
     "titulo": "Por qué un bloque dura lo que dura",
     "gancho": "¿Por qué este bloque dura 33 minutos y no 40? No es un número al azar.",
     "desarrollo": "Un bloque largo pierde al que llegó tarde y no deja lugar para respirar. "
                   "Los cortes no son una interrupción: son lo que hace que el que entra en "
                   "el minuto 50 entienda dónde está parado.",
     "recurso": "Línea de tiempo del programa en pantalla, marcando dónde cae cada corte.",
     "cierre": "El tiempo no sobra ni falta. Se decide."},

    {"n": "04", "quien": "A dos voces", "cat": "Estructura", "vende": "La rutina", "dur": "45 s",
     "titulo": "El mismo material, otro orden, otro programa",
     "gancho": "Con el mismo material podés hacer dos programas distintos. Solo cambiando el orden.",
     "desarrollo": "Si lo más fuerte va al principio, el resto baja. Si va al final, la gente "
                   "no llega. La discusión de producción no es qué contenido entra: es en qué "
                   "momento entra cada uno.",
     "recurso": "Dos escaletas al lado con los mismos bloques en distinto orden, y nosotros "
                "discutiendo cuál sirve.",
     "cierre": "No decidimos qué se cuenta. Decidimos cuándo."},

    {"n": "05", "quien": "Martu", "cat": "Contenidos", "vende": "Contenidos", "dur": "40 s",
     "titulo": "Lo que no entró al programa",
     "gancho": "Por cada cosa que ves en el programa, hay cinco que descartamos.",
     "desarrollo": "Buscar contenido es fácil; elegirlo es el trabajo. Lo que se descarta no "
                   "es malo: es lo que no encaja con la temática, con el tono o con el minuto "
                   "en el que iba a ir. Un programa también se define por lo que deja afuera.",
     "recurso": "Carpeta con material marcado: unos pocos tildados, la mayoría tachados.",
     "cierre": "Producir es elegir. Lo demás es juntar."},

    {"n": "06", "quien": "Los dos", "cat": "Interacción", "vende": "Dinámicas", "dur": "45 s",
     "titulo": "Que el público participe no pasa solo",
     "gancho": "«Dejanos tu comentario» no es una dinámica de participación.",
     "desarrollo": "Para que la gente hable hay que darle un lugar y un momento: una consigna "
                   "concreta, una sección que la espere, un conductor que sepa cuándo leerla. "
                   "Eso se diseña en preproducción, no se pide en el aire.",
     "recurso": "Chat en vivo moviéndose y, al lado, la sección de la rutina donde estaba "
                "previsto que entrara.",
     "cierre": "La participación no se pide. Se prepara."},

    {"n": "07", "quien": "Los dos", "cat": "El equipo", "vende": "El método", "dur": "50 s",
     "titulo": "La reunión previa",
     "gancho": "Antes de cada emisión nos sentamos todos. Y ahí no manda producción.",
     "desarrollo": "En la reunión el equipo entero aporta ideas, propuestas y contenidos. "
                   "La orientación del programa se construye en conjunto: la idea puede venir "
                   "de cualquiera. Lo que cambia después es quién la convierte en escaleta.",
     "recurso": "La mesa de reunión con todo el equipo, y corte a la rutina ya armada con esas "
                "ideas adentro.",
     "cierre": "Todos aportan. Alguien tiene que ordenarlo."},

    {"n": "08", "quien": "Fabri", "cat": "El rol", "vende": "El rol", "dur": "40 s",
     "titulo": "El productor no tiene las ideas",
     "gancho": "Te voy a decir algo que suena mal para mi propio puesto: las ideas no son mías.",
     "desarrollo": "Las ideas son del equipo, y así tiene que ser: el programa es de ellos. "
                   "Lo que hace producción es estructurarlas, ponerles tiempo, orden y forma "
                   "hasta que se puedan poner al aire. Eso es todo. Y es bastante.",
     "recurso": "Empezar con un pizarrón lleno de ideas sueltas y terminar con la escaleta "
                "ordenada.",
     "cierre": "No pongo las ideas. Pongo el orden."},

    {"n": "09", "quien": "Martu", "cat": "Identidad", "vende": "Identidad", "dur": "45 s",
     "titulo": "Por qué el programa se ve siempre igual",
     "gancho": "Si tu programa se ve distinto cada semana, nadie lo va a reconocer scrolleando.",
     "desarrollo": "La identidad no es un logo: es una tipografía, una paleta y una forma de "
                   "mostrar las cosas que se repiten en cada emisión y en cada recorte. Se "
                   "define una vez, antes de arrancar, y después se respeta.",
     "recurso": "Varios recortes del programa en una grilla: se ve que son de la misma familia "
                "sin necesidad de leer el nombre.",
     "cierre": "Que se te reconozca sin leer el nombre. Eso es identidad."},

    {"n": "10", "quien": "Los dos", "cat": "Gráfica", "vende": "Identidad", "dur": "40 s",
     "titulo": "El zócalo que nadie nota",
     "gancho": "Nadie te va a felicitar por un zócalo. Pero si falta, se nota en un segundo.",
     "desarrollo": "Zócalos, títulos y overlays hacen un trabajo silencioso: dicen quién habla, "
                   "de qué se está hablando y dónde seguir el programa, sin que el conductor "
                   "tenga que frenar a explicarlo. Se preparan antes, no se improvisan al aire.",
     "recurso": "El mismo plano dos veces: sin gráfica y con gráfica. La diferencia se explica "
                "sola.",
     "cierre": "Buen diseño en vivo es el que no te hace pensar en el diseño."},

    {"n": "11", "quien": "Fabri", "cat": "El día", "vende": "Preproducción", "dur": "45 s",
     "titulo": "Lo que ya está listo cuando llegan",
     "gancho": "Cuando el equipo llega al estudio, ya está todo resuelto. Esa es la idea.",
     "desarrollo": "Rutina impresa, contenidos cargados, gráficas exportadas, orden de "
                   "participaciones definido. El conductor tiene que poder llegar y pensar "
                   "solo en conducir. Si tiene que resolver producción, algo falló antes.",
     "recurso": "Recorrido por el estudio ya preparado, vacío, minutos antes de que llegue "
                "la gente.",
     "cierre": "Si el día del vivo estamos corriendo, la semana salió mal."},

    {"n": "12", "quien": "Los dos", "cat": "Invitados", "vende": "El alcance", "dur": "45 s",
     "titulo": "Los invitados no son solo de producción",
     "gancho": "Nos preguntan seguido quién consigue a los invitados. La respuesta es: todos.",
     "desarrollo": "La búsqueda y el contacto se coordinan con el equipo entero, porque los "
                   "contactos están repartidos y porque el que propone a alguien sabe por qué "
                   "lo quiere en el programa. Producción organiza la participación, no la "
                   "monopoliza.",
     "recurso": "Los dos hablando a cámara, alternando frases rápido. Sin gráfica, que pese "
                "lo que se dice.",
     "cierre": "Conseguir invitados es del equipo. Ordenarlos, nuestro."},

    {"n": "13", "quien": "A dos voces", "cat": "Imprevistos", "vende": "Preproducción", "dur": "50 s",
     "titulo": "Se cae un invitado a dos horas del aire",
     "gancho": "Se te cae el invitado principal dos horas antes del vivo. ¿Qué hacés?",
     "desarrollo": "No se improvisa: se va al material de reserva que ya estaba seleccionado "
                   "y se recalculan los tiempos de los bloques que quedan. Por eso la rutina "
                   "tiene más contenido del que entra. El plan B no se arma ese día, se arma "
                   "el lunes.",
     "recurso": "Un reloj en cuenta atrás y la escaleta siendo rehecha a mano, en vivo, sobre "
                "el papel.",
     "cierre": "No es reaccionar rápido. Es haberlo previsto lento."},

    {"n": "14", "quien": "Martu", "cat": "El aire", "vende": "Preproducción", "dur": "40 s",
     "titulo": "Qué mira producción durante el vivo",
     "gancho": "Mientras vos mirás al conductor, yo estoy mirando otras cuatro cosas.",
     "desarrollo": "El reloj contra la rutina, el chat para ver qué está enganchando, lo que "
                   "viene en el bloque siguiente y si hay que estirar o acortar. El programa "
                   "se sigue produciendo mientras sale al aire.",
     "recurso": "Plano desde atrás del control: pantallas, reloj y rutina marcada, con el "
                "estudio al fondo.",
     "cierre": "El vivo no es el final de la producción. Es la parte más rápida."},

    {"n": "15", "quien": "Fabri", "cat": "Presupuesto", "vende": "El alcance", "dur": "45 s",
     "titulo": "El presupuesto está atado al formato",
     "gancho": "Un presupuesto de producción no es un número suelto: es un número atado a un formato.",
     "desarrollo": "Lo que se pacta contempla el nivel de producción planteado al arrancar. "
                   "Si el programa después suma secciones, invitados en simultáneo o recursos "
                   "técnicos nuevos, no es que se encarece porque sí: es otro programa, y se "
                   "revisa.",
     "recurso": "Dos escaletas al lado, una simple y una cargada, con el peso de cada una a la "
                "vista.",
     "cierre": "Decime el formato y te digo el presupuesto. Al revés no funciona."},

    {"n": "16", "quien": "Los dos", "cat": "Presupuesto", "vende": "El alcance", "dur": "40 s",
     "titulo": "El horario también cuenta",
     "gancho": "El mismo programa, a las 11 de la mañana o a las 11 de la noche, no cuesta lo mismo.",
     "desarrollo": "El horario define qué invitados están disponibles, cuánta gente hay "
                   "mirando en vivo y qué necesita la producción para sostenerlo. No es un "
                   "detalle de agenda: cambia el trabajo real detrás de la emisión.",
     "recurso": "Un reloj pasando de la mañana a la noche y el estudio cambiando de luz.",
     "cierre": "No producimos un programa. Producimos un programa a una hora."},

    {"n": "17", "quien": "Martu", "cat": "Formato", "vende": "El formato", "dur": "45 s",
     "titulo": "La temporada 2 no es la 1 otra vez",
     "gancho": "El error más común: repetir la temporada que funcionó, igual.",
     "desarrollo": "Un formato que no se mueve se apaga solo. Cada temporada revisamos qué "
                   "sección quedó vieja, qué bloque se estiraba y qué empezó a funcionar sin "
                   "que lo planeáramos. Acompañar el formato es parte del trabajo, no un extra.",
     "recurso": "La escaleta de la temporada anterior con tachones y agregados encima.",
     "cierre": "Lo que funcionó el año pasado ya es del año pasado."},

    {"n": "18", "quien": "A dos voces", "cat": "Aprendizaje", "vende": "El método", "dur": "50 s",
     "titulo": "El error que nos cambió la forma de trabajar",
     "gancho": "Una vez armamos un programa perfecto en papel. Al aire no funcionó.",
     "desarrollo": "Estaba todo cronometrado al segundo y no quedaba aire para que pasara "
                   "nada. Los mejores momentos de un vivo son los que no estaban escritos. "
                   "Desde ahí dejamos huecos a propósito en la rutina. La estructura es para "
                   "sostener, no para apretar.",
     "recurso": "Los dos contando la anécdota sin gráfica, cortando entre uno y otro.",
     "cierre": "La rutina tiene que dejar lugar para lo que no está en la rutina."},

    {"n": "19", "quien": "Los dos", "cat": "La dupla", "vende": "La dupla", "dur": "45 s",
     "titulo": "Cómo nos dividimos",
     "gancho": "Somos dos en producción general. Y no hacemos lo mismo dos veces.",
     "desarrollo": "Explicamos cómo se reparte la semana entre los dos y por qué tener dos "
                   "cabezas no es duplicar el trabajo: es que nada quede sin mirar. Cuando "
                   "uno está adentro del armado, el otro mira el programa de afuera.",
     "recurso": "Pantalla partida entre los dos, cada uno en lo suyo, y un corte a los dos "
                "juntos sobre la misma rutina.",
     "cierre": "De a dos no se trabaja el doble. Se pasa la mitad de las cosas por alto."},

    {"n": "20", "quien": "Los dos", "cat": "Convocatoria", "vende": "El rol", "dur": "40 s",
     "titulo": "Si tenés el programa en la cabeza",
     "gancho": "Si tenés el programa en la cabeza y no sabés por dónde se empieza: por acá.",
     "desarrollo": "Cerramos la serie diciendo qué hacemos concretamente: armamos la rutina, "
                   "elegimos los contenidos, definimos la identidad y dejamos cada emisión "
                   "lista para salir. La idea la ponés vos. El orden lo ponemos nosotros.",
     "recurso": "Los dos en el estudio, plano abierto. Cierre con el logo y nada más.",
     "cierre": "Vos traé el programa. Nosotros lo ponemos al aire."},
]
