# -*- coding: utf-8 -*-
"""Arma el ZIP con el arbol igual al del Drive y lo verifica carpeta por carpeta.

Cada carpeta del ZIP se arrastra tal cual a la carpeta del mismo nombre en el
Drive. Los binarios no se pueden subir por el conector: un JPG de 19.246 bytes
llego del otro lado con 11.894. Por eso se entrega asi.

    python3 paquete.py
"""
import os
import shutil
import zipfile

import mapa

AQUI = os.path.dirname(os.path.abspath(__file__))
PDF = os.path.join(AQUI, "pdf")
PROGRAMAS = os.path.dirname(AQUI)
ZIP = os.path.join(AQUI, "Nexo-Studios-PDF-para-el-drive.zip")

# lo que ya estaba hecho y tambien va en el Drive, dentro de 1 · Formato
EXTRA = [
    ("presentaciones/Nexo-%s-propuesta.pdf", "%s propuesta comercial.pdf"),
    ("estructuras/Nexo-%s-estructura.pdf", "%s estructura del programa.pdf"),
]
CON_PROGRAMA = ["el-motivo", "tercer-tiempo", "sex-and-the-baires",
                "pequenos-grandes-sabios", "exitosa-yo"]


def sumar_extras():
    """Deja la propuesta y la estructura de cada programa en 1 · Formato."""
    puestos = []
    for slug in CON_PROGRAMA:
        nombre, carpeta, _ = mapa.PROGRAMAS[slug]
        destino = os.path.join(PDF, carpeta, "1 · Formato")
        os.makedirs(destino, exist_ok=True)
        for origen_f, nombre_f in EXTRA:
            origen = os.path.join(PROGRAMAS, origen_f % slug)
            if not os.path.exists(origen):
                continue
            final = os.path.join(destino, nombre_f % nombre)
            shutil.copy2(origen, final)
            puestos.append(final)

    # la grilla completa va en la carpeta de plantillas y marca
    grilla = os.path.join(PROGRAMAS, "estructuras",
                          "Nexo-estructura-de-programacion.pdf")
    if os.path.exists(grilla):
        destino = os.path.join(PDF, mapa.PROGRAMAS["plantillas"][1], "1 · Formato")
        os.makedirs(destino, exist_ok=True)
        final = os.path.join(destino, "Grilla completa de programación.pdf")
        shutil.copy2(grilla, final)
        puestos.append(final)
    return puestos


def main():
    extras = sumar_extras()
    print("sumados desde lo ya hecho: %d" % len(extras))

    filas, total = [], 0
    for base, _, archivos in os.walk(PDF):
        pdfs = sorted(a for a in archivos if a.endswith(".pdf"))
        if not pdfs:
            continue
        rel = os.path.relpath(base, PDF)
        peso = sum(os.path.getsize(os.path.join(base, a)) for a in pdfs)
        filas.append((rel if rel != "." else "(raíz)", pdfs, peso))
        total += peso
    filas.sort()

    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for base, _, archivos in os.walk(PDF):
            for a in sorted(archivos):
                if a.endswith(".pdf"):
                    ruta = os.path.join(base, a)
                    z.write(ruta, os.path.relpath(ruta, PDF))

    print("\nCARPETA POR CARPETA\n")
    cuenta = 0
    for rel, pdfs, peso in filas:
        print("%-42s %2d PDF  %6.1f KB" % (rel, len(pdfs), peso / 1024.0))
        for a in pdfs:
            print("      · %s" % a)
        cuenta += len(pdfs)
    print("\n%d carpetas · %d PDF · %.1f MB" % (len(filas), cuenta, total / 1048576.0))
    print("ZIP: %s (%.1f MB)" % (ZIP, os.path.getsize(ZIP) / 1048576.0))

    vacias = [c for p in mapa.PROGRAMAS.values() if p[1]
              for c in [os.path.join(PDF, p[1])] if not os.path.isdir(c)]
    if vacias:
        print("SIN NADA: %s" % ", ".join(vacias))


if __name__ == "__main__":
    main()
