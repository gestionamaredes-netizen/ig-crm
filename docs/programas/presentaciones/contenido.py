# -*- coding: utf-8 -*-
"""Contenido de la presentacion de propuesta de cada programa.

No duplica datos. Toma lo que ya existe:

- De `carpeta-programacion/contenido.py`, la propuesta comercial de los tres
  programas que ya estaban escritos ahi: sinopsis, target, pilares,
  distribucion, tono, monetizacion, paleta y categorias.
- De `estructuras/datos.py`, el horario y la escaleta, que son la fuente de
  verdad de la grilla y cambian mas seguido.

Tercer Tiempo y El Motivo no estaban en la carpeta de programacion, asi que
se escriben aca con la misma forma.
"""
import importlib.util
import os

_AQUI = os.path.dirname(os.path.abspath(__file__))
_PROGRAMAS = os.path.dirname(_AQUI)


def _cargar(nombre, carpeta, archivo):
    """Carga un modulo por ruta, con un nombre propio.

    Hace falta porque este archivo tambien se llama `contenido.py`: un
    `import contenido` a secas se importaria a si mismo.
    """
    ruta = os.path.join(_PROGRAMAS, carpeta, archivo)
    spec = importlib.util.spec_from_file_location(nombre, ruta)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


_carpeta = _cargar("_nexo_carpeta", "carpeta-programacion", "contenido.py")
D = _cargar("_nexo_datos", "estructuras", "datos.py")

STAFF = _carpeta.STAFF
ESTUDIO = _carpeta.ESTUDIO

# Los dos que faltaban, con la misma forma que los de la carpeta.
PROPIOS = [
    {
        "slug": "tercer-tiempo",
        "nombre": "Tercer Tiempo",
        "tagline": "Amistad · Pasión · Música",
        "unalinea": "El pospartido del picado del miércoles. Seis amigos con la birra en la "
                    "mesa y la charla que sale sola cuando ya no importa el resultado.",
        "sinopsis": [
            "Tercer Tiempo es una mesa de seis amigos que se juntan después de jugar. No hay "
            "periodistas, no hay análisis y no se baja línea: se habla de lo que hablarías vos "
            "con tus amigos un miércoles a la noche. El día que la mesa suene informada y "
            "equilibrada, dejó de ser un tercer tiempo.",
            "Sale dos veces por semana y cada día tiene su ánimo. El miércoles es el día del "
            "show, con un número en vivo arriba del live set, banda, solista o stand-up, y un "
            "artista invitado que se sienta en la mesa como uno más. El domingo es de "
            "sobremesa: el resumen de la fecha, una vuelta a los 90 y a los 2000, y la semana "
            "de cada uno de los seis.",
        ],
        "target": [
            ("Núcleo", "Varones de 25 a 45 años"),
            ("Extendido", "20 a 55 años"),
            ("Perfil", "Urbano y suburbano, AMBA. NSE C2 – C3 – D1"),
            ("Intereses", "Fútbol amateur y de liga local, música en vivo, humor, cultura "
                          "pop de los 90 y los 2000"),
            ("Comportamiento", "Consume en vivo y por clip. Alta pertenencia de club: comparte "
                               "lo que lo nombra a él o a los suyos"),
            ("Secundaria", "Mujeres de 25 a 45 que llegan por el bloque de nostalgia y por el "
                           "número en vivo"),
        ],
        "pilares": [
            ("Al que mira le falta una silla",
             "No es un panel: es una junta. Si el que mira siente que está viendo un programa, "
             "algo se hizo de más."),
            ("Dos días, dos ánimos, un solo formato",
             "La mesa y el esqueleto son los mismos. Cambia a qué viene la gente: el miércoles "
             "al show, el domingo a la sobremesa."),
            ("Comunidad club por club",
             "Cada semana el equipo graba el tercer tiempo de un torneo de la zona. Cada club "
             "que sale mueve el material entre los suyos."),
        ],
        "distribucion": [
            ("Vivo", "Streaming en vivo desde Nexo Studios, los dos días"),
            ("VOD", "Emisión completa en el canal del programa"),
            ("Clips", "Mínimo seis verticales por emisión, doce por semana"),
            ("Territorio", "Los clubes de fútbol amateur de la zona, con nota propia semanal"),
        ],
        "tono": [
            ("Set", "Tres sectores en el mismo piso: conducción, entrevistas y live set. "
                    "Verde sobre negro, resuelto con luz y placas."),
            ("Cámara", "Tres: una general de mesa y dos móviles sobre los sectores."),
            ("Gráfica", "Verde Tercer Tiempo sobre negro pleno, sin excepción."),
            ("Tono", "Se opina fuerte, se carga al de al lado y se dice «no sé» cuando no se "
                     "sabe. Cero solemnidad."),
            ("Regla editorial", "Nadie explica. El día que alguien dé cátedra, se rompió."),
        ],
        "monetizacion": [
            ("Presenting de bloque", "«El desafío, presentado por…». Placa y mención al entrar "
                                     "y al salir. Tres por programa."),
            ("PNT", "La mesa usa el producto y habla de él, 60 a 90 segundos. Máximo dos por "
                    "programa."),
            ("Spot en tanda", "Tres cortes por emisión: 12 minutos vendibles."),
            ("Sponsor de columna", "El nombre pegado a una columna toda la temporada."),
            ("Sponsor principal", "Nombre en cabecera, en cada apertura y cada cierre de los "
                                  "dos días."),
            ("Contenido de torneo", "Marca presente en la serie grabada en los clubes de la "
                                    "zona."),
        ],
        "paleta": [("#5DC825", "Verde Tercer Tiempo"), ("#E9E9E9", "Blanco pincelada"),
                   ("#000000", "Negro base")],
        "categorias": "Bebida · Gastronomía y casas de comida · Snacks y golosinas · "
                      "Deportivo y proveedores de clubes · Servicios locales · "
                      "Telcos · Juegos",
        "equipo": [("6 en la mesa", "Elenco a definir"),
                   ("Conducción", "a definir"),
                   ("Columnas", "La fecha · El vivo · Los clubes · El desafío · Nostalgia")],
    },
    {
        "slug": "el-motivo",
        "nombre": "El Motivo",
        "tagline": "Ideas que conectan",
        "unalinea": "Historias de gente que sostiene algo: de dónde salió la idea, qué hubo "
                    "que romper para sostenerla, y cómo se hace.",
        "sinopsis": [
            "El Motivo es un magazine urbano en streaming que cuenta historias de gente que "
            "está sosteniendo un proyecto. La entrevista no busca el currículum: busca el "
            "proceso, y sobre todo el momento en que el invitado casi larga, que es la parte "
            "que nadie cuenta y la que más se comparte.",
            "Lo que lo separa de una entrevista más es La caja de herramientas: veinte minutos "
            "en los que el invitado enseña algo concreto que el que mira se pueda llevar "
            "puesto. Y el cierre, que es siempre la misma pregunta a todos, y es la firma del "
            "formato.",
        ],
        "target": [
            ("Núcleo", "25 a 40 años, con un proyecto propio o a punto de arrancarlo"),
            ("Extendido", "20 a 50 años"),
            ("Perfil", "Urbano y suburbano. AMBA, con entrada a Colombia y España"),
            ("Intereses", "Oficios, emprendimiento chico, cultura del trabajo, historias de "
                          "gente común"),
            ("Comportamiento", "Guarda y reenvía lo que le sirve. El clip de la caja de "
                               "herramientas es el que más se guarda"),
            ("Secundaria", "El que todavía no arrancó nada y mira para animarse"),
        ],
        "pilares": [
            ("El proceso, no el currículum",
             "La historia se cuenta desde el día aburrido, no desde el momento épico. Todos "
             "cuentan cómo empezaron; casi nadie cuenta cuándo casi larga."),
            ("Algo concreto para llevarse",
             "La caja de herramientas obliga a que cada emisión deje una habilidad, una "
             "herramienta o un método. Sin eso, el bloque no está listo."),
            ("Tres ciudades en el mismo programa",
             "Se graba en San Martín, Roko entra desde Florencio Varela y Paula desde Bogotá, "
             "y sale por un canal de Ibiza."),
        ],
        "distribucion": [
            ("Vivo", "Streaming en vivo por Somos Como Somos, canal de Ibiza"),
            ("VOD", "Emisión completa en el canal del programa"),
            ("Clips", "Mínimo seis verticales por emisión"),
            ("Calle", "Material propio grabado en vía pública todas las semanas"),
        ],
        "tono": [
            ("Set", "Mesa de conducción en Nexo Studios, con el enlace a Bogotá en pantalla."),
            ("Cámara", "Plano de mesa y cerrados sobre el invitado. La caja de herramientas "
                       "pide cenital."),
            ("Gráfica", "Naranja sobre negro. Placas de paso a paso para el bloque que enseña."),
            ("Tono", "Nadie da cátedra. El programa no explica cómo emprender: pregunta cómo "
                     "lo hizo el otro."),
            ("Regla editorial", "Si no hay nada concreto para llevarse, el bloque se rearma."),
        ],
        "monetizacion": [
            ("Presenting del ciclo", "«El Motivo, presentado por…» en apertura, cierre y todas "
                                     "las piezas. Uno solo."),
            ("Presenting de bloque", "El nombre pegado a un bloque fijo toda la temporada. El "
                                     "más vendible es La caja de herramientas."),
            ("PNT", "La conducción usa el producto y habla de él. Máximo dos por programa."),
            ("Sponsor de la calle", "Marca presente en el material grabado en vía pública."),
            ("Branded content", "Cápsulas producidas en el mismo estudio."),
        ],
        "paleta": [("#F8A858", "Naranja El Motivo"), ("#000000", "Negro base")],
        "categorias": "Educación y oficios · Herramientas e insumos · Bancos y fintech · "
                      "Conectividad · Gastronomía local · Retail",
        "equipo": [("Conducción", "Fabricio Benjamín Ortega · San Martín"),
                   ("Co-conducción", "Rodrigo García Roko · Florencio Varela"),
                   ("Co-conducción", "Paula · Bogotá, por enlace")],
    },
]

# El slug del programa de chicos difiere entre las dos fuentes.
_ALIAS = {"proyecto-ninos": "pequenos-grandes-sabios"}


def _normalizar(p):
    p = dict(p)
    p["slug"] = _ALIAS.get(p["slug"], p["slug"])
    return p


def programas():
    """Devuelve los cinco programas en el orden de la grilla, ya fusionados.

    El horario y la escaleta salen siempre de `estructuras/datos.py`, que es
    lo que se actualiza cuando cambia la grilla. Lo comercial sale de donde
    ya estaba escrito.
    """
    por_slug = {}
    for p in _carpeta.PROGRAMAS:
        por_slug[_normalizar(p)["slug"]] = _normalizar(p)
    for p in PROPIOS:
        por_slug[p["slug"]] = dict(p)

    out = []
    for base in D.PROGRAMAS:
        p = por_slug.get(base["slug"])
        if p is None:
            raise KeyError("falta la propuesta de %s" % base["slug"])
        p["acento"] = base["acento"]
        p["carpeta"] = base["carpeta"]
        p["ficha"] = base["ficha"]
        p["escaletas"] = base["escaletas"]
        p["semana"] = base["semana"]
        p["falta"] = base["falta"]
        p["nota"] = base["nota"]
        p.setdefault("equipo", [])
        out.append(p)
    return out
