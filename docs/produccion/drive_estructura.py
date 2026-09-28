# -*- coding: utf-8 -*-
"""La estructura de carpetas del drive de producción de Nexo.

Acá vive el árbol. De acá salen dos cosas: las carpetas reales en Google
Drive (cuando el conector esté autorizado) y el árbol local de docs/produccion/drive/,
que sirve para revisarlo antes y para subirlo a mano si hiciera falta.

    python3 drive_estructura.py          # escribe el árbol local
    python3 drive_estructura.py --ver    # sólo lo muestra
"""

import os, sys

# Ya creado en Drive, dentro de "Programación 1er Temporada":
# https://drive.google.com/drive/folders/1oC11X8QOZag7WNrIsiSPSgFS7MhjyfeW
RAIZ = "Programación 1er Temporada"
DRIVE_ID = "1oC11X8QOZag7WNrIsiSPSgFS7MhjyfeW"

# Las ocho carpetas que tiene cada programa. Mismo orden y mismo nombre en
# todos, para que el que entra a una sepa dónde está parado en las otras.
CARPETAS = [
    ("1 · Formato",
     "La biblia del programa, la estructura de la emisión y la rutina tipo. "
     "Lo que no cambia de un programa a otro."),
    ("2 · Guiones",
     "Un documento por emisión, con el guión literario y el técnico. "
     "Se nombran con la fecha adelante: 2026-10-07 guión."),
    ("3 · Para técnica",
     "Lo que el piso tiene que tener antes del día de grabación: el opening, "
     "la canción de apertura, el guión técnico, los integrantes y los visuales. "
     "Si algo falta acá, el piso arranca a ciegas."),
    ("4 · Gráficas",
     "Logo, placas, zócalos, separadores, plantillas y miniaturas. "
     "Los archivos editables y los exportados."),
    ("5 · Invitados",
     "Contactos, confirmaciones y el briefing previo de cada uno. "
     "Una carpeta o un documento por invitado."),
    ("6 · Emisiones",
     "Una subcarpeta por fecha, con el material crudo y el editado de ese día."),
    ("7 · Redes",
     "Cortes verticales, placas para publicar y el calendario de publicación."),
    ("8 · Administración",
     "Presupuesto del programa, contratos, facturas y lo que haya que archivar."),
]

# Los cinco programas. El estado dice qué falta confirmar de cada uno.
PROGRAMAS = [
    ("01 · El Motivo", "Martes de 18 a 20 h (a confirmar)",
     "Sale por Somos Como Somos. Co-conducción desde Bogotá."),
    ("02 · Tercer Tiempo", "Miércoles 20:00-22:00 · domingos 22:00-00:00",
     "Dos emisiones por semana. Seis en la mesa."),
    ("03 · Sex and the Baires", "Sin fecha",
     "La idea está; faltan horario y elenco."),
    ("04 · Pequeños Grandes Sabios", "Sin fecha",
     "Programa de chicos, con un adulto moderando."),
    ("05 · Exitosa Yo", "Sin fecha",
     "Formato podcast."),
]

# Carpetas del primer nivel que no son un programa.
COMUNES = [
    ("00 · Plantillas y marca",
     "La estructura vacía para copiar cuando entra un programa nuevo, más el "
     "logo de Nexo, las tipografías y las plantillas de guión."),
    ("99 · Estudio",
     "Lo que es del estudio y no de un programa: la grilla de servicios, la "
     "hoja de precios, la hoja de roles y el instructivo para clientes."),
]


def arbol():
    """Devuelve [(ruta relativa, descripción)] de todo el árbol, en orden."""
    filas = [(RAIZ, "El drive de producción. Una carpeta por programa, todas con "
                    "la misma estructura adentro.")]
    for nombre, desc in COMUNES[:1]:
        filas.append((os.path.join(RAIZ, nombre), desc))
        for c, d in CARPETAS:
            filas.append((os.path.join(RAIZ, nombre, c), d))
    for nombre, cuando, nota in PROGRAMAS:
        filas.append((os.path.join(RAIZ, nombre), "%s · %s" % (cuando, nota)))
        for c, d in CARPETAS:
            filas.append((os.path.join(RAIZ, nombre, c), d))
    for nombre, desc in COMUNES[1:]:
        filas.append((os.path.join(RAIZ, nombre), desc))
    return filas


def escribir(base="drive"):
    filas = arbol()
    for ruta, desc in filas:
        destino = os.path.join(base, ruta)
        os.makedirs(destino, exist_ok=True)
        with open(os.path.join(destino, "LEEME.txt"), "w", encoding="utf-8") as f:
            f.write("%s\n%s\n\n%s\n" % (os.path.basename(ruta),
                                        "=" * len(os.path.basename(ruta)), desc))
    return filas


def main():
    filas = arbol() if "--ver" in sys.argv else escribir()
    for ruta, _ in filas:
        hondo = ruta.count(os.sep)
        print("%s%s" % ("    " * hondo, os.path.basename(ruta)))
    print("\n%d carpetas · %d programas · %d carpetas por programa"
          % (len(filas), len(PROGRAMAS), len(CARPETAS)))


if __name__ == "__main__":
    main()
