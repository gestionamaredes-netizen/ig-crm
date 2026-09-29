# -*- coding: utf-8 -*-
"""Baja a disco el contenido de los documentos del Drive.

El conector devuelve el texto completo de cada documento en el campo
`contentSnippet` cuando se pide `snippetVerbosity: MAX_ALLOWED`. Las
respuestas grandes las guarda el harness en su carpeta de resultados, asi
que este script las lee de ahi y las reparte en archivos sueltos.

Por que existe: hasta ahora los documentos del Drive vivian solo en el
Drive. El repositorio no tenia el texto, asi que no se podia regenerar nada
ni revisarlo en frio. A partir de aca el texto vive en
`documentos/fuente/` y el PDF se genera desde ahi.

    python3 extraer.py
"""
import glob
import json
import os
import re
import unicodedata

AQUI = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(AQUI, "fuente")
RESULTADOS = ("/root/.claude/projects/-home-user-ig-crm/"
              "a9a390c6-cf87-50a7-809b-4923f40ff471/tool-results")


def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()


def limpiar(c):
    """Deshace lo que el conector le hace al texto al devolverlo.

    Escapa los caracteres que en markdown significan algo (`-`, `#`, los
    corchetes, el punto de una lista numerada) y duplica los saltos de
    linea. Las dos cosas hay que revertirlas o el PDF sale con barras
    invertidas por todos lados y con el doble de espacio entre lineas.
    """
    c = re.sub(r"\\([-#\[\]().])", r"\1", c)
    return re.sub(r"\n\n", "\n", c)


def main():
    vistos = {}
    for f in sorted(glob.glob(os.path.join(RESULTADOS, "mcp-Google_Drive-search_files-*.txt"))):
        try:
            d = json.load(open(f, encoding="utf-8"))
        except (ValueError, OSError):
            continue
        for x in d.get("files", []):
            if x.get("mimeType") == "application/vnd.google-apps.document":
                vistos[x["id"]] = x

    os.makedirs(DEST, exist_ok=True)
    indice, sin = [], []
    for x in vistos.values():
        c = x.get("contentSnippet") or ""
        if not c:
            sin.append(x["title"])
            continue
        nombre = slug(x["title"]) + ".txt"
        with open(os.path.join(DEST, nombre), "w", encoding="utf-8") as f:
            f.write(limpiar(c))
        indice.append({"archivo": nombre, "titulo": x["title"],
                       "id": x["id"], "parentId": x["parentId"]})

    indice.sort(key=lambda r: r["archivo"])
    with open(os.path.join(DEST, "_indice.json"), "w", encoding="utf-8") as f:
        json.dump(indice, f, ensure_ascii=False, indent=1)

    print("documentos encontrados: %d" % len(vistos))
    print("guardados: %d" % len(indice))
    if sin:
        print("sin contenido: %s" % ", ".join(sin))


if __name__ == "__main__":
    main()
