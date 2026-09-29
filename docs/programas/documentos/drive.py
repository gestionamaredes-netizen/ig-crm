# -*- coding: utf-8 -*-
"""Arma el HTML que el Drive convierte en documento de Google, ya maquetado.

El Drive convierte HTML a documento nativo y se trae las imagenes externas:
un documento de prueba con el logo peso 41.626 bytes contra 1.476 del mismo
sin logo. Asi que el documento que queda en la carpeta tiene titulos, tablas,
color y los dos logos, y desde el celular se imprime a PDF sin bajar nada.

Los logos salen del repositorio, que es publico, servidos por raw.githubusercontent.

    python3 drive.py          arma html/ para los 56
"""
import html as _html
import json
import os

import mapa
import pdf

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "html")
CRUDO = ("https://raw.githubusercontent.com/gestionamaredes-netizen/ig-crm/"
         "claude/tercer-tiempo-programa-carde4/docs/programas/documentos/marca/")


def esc(t):
    return _html.escape(t, quote=False)


def raya(n):
    """El renglon para completar, del largo que tenia en el documento."""
    return "_" * max(8, min(n * 2, 60))


def cabecera(doc):
    logos = ['<img src="%snexo.jpg" width="190">' % CRUDO]
    if doc["slug_logo"]:
        logos.append('<img src="%s%s-logo.jpg" width="120">'
                     % (CRUDO, doc["slug_logo"]))
    return (
        '<p>%s</p>'
        '<p style="color:%s;font-size:10pt;letter-spacing:2px"><b>%s</b></p>'
        '<h1 style="color:#14181F">%s</h1>'
        '<p style="color:#6B7280;font-size:11pt">%s</p><hr>'
        % ("&nbsp;&nbsp;".join(logos), doc["acento"],
           esc(doc["ojo"].upper()), esc(doc["h1"]), esc(doc["baja"])))


def pintar(b, acento):
    t = b["tipo"]
    if t == "h2":
        return '<h2 style="color:%s">%s</h2>' % (acento, esc(b["texto"]))
    if t == "h3":
        return '<h3 style="color:#14181F">%s</h3>' % esc(b["texto"])
    if t == "escaleta":
        return ('<table border="0" cellpadding="6" width="100%%"><tr>'
                '<td bgcolor="%s"><b><font color="#FFFFFF">%s</font></b>'
                '</td></tr></table>' % (acento, esc(b["texto"])))
    if t == "regla":
        return "<hr>"
    if t == "casilla":
        cuerpo = (campos(b["partes"]) if "partes" in b
                  else "<b>%s</b>" % esc(b["texto"]))
        return "<p>&#9744;&nbsp; %s</p>" % cuerpo
    if t == "opciones":
        return "<p>%s</p>" % esc(b["texto"]).replace("□", "&#9744;")
    if t == "campos":
        return "<p>%s</p>" % campos(b["partes"])
    if t == "vineta":
        return "<ul><li>%s</li></ul>" % esc(b["texto"])
    if t == "num":
        return ('<p><b><font color="%s">%s.</font></b> %s</p>'
                % (acento, esc(b["numero"]), esc(b["texto"])))
    if t == "kv":
        return ('<p><b><font color="%s">%s:</font></b> %s</p>'
                % (acento, esc(b["clave"]), esc(b["texto"])))
    return "<p>%s</p>" % esc(b["texto"])


def campos(partes):
    out = []
    for etiqueta, puntos in partes:
        if etiqueta:
            out.append("<b>%s</b>" % esc(etiqueta))
        if puntos:
            out.append(raya(puntos))
    return " ".join(out)


def juntar(bloques):
    """Las viñetas seguidas van en una sola lista."""
    out, lista = [], []
    for b in bloques:
        if b["tipo"] == "vineta":
            lista.append("<li>%s</li>" % esc(b["texto"]))
            continue
        if lista:
            out.append("<ul>%s</ul>" % "".join(lista))
            lista = []
        out.append(b)
    if lista:
        out.append("<ul>%s</ul>" % "".join(lista))
    return out


def armar(reg):
    doc, bloques = pdf.preparar(reg)
    slug = mapa.CARPETAS[reg["parentId"]][0]
    doc["slug_logo"] = slug if os.path.exists(
        os.path.join(pdf.MARCA, "%s-logo.jpg" % slug)) else ""
    cuerpo = []
    for b in juntar(bloques):
        cuerpo.append(b if isinstance(b, str) else pintar(b, doc["acento"]))
    pie = ('<hr><p style="color:#9AA2AE;font-size:9pt">Nexo Studios · %s · '
           '%s</p>' % (esc(pdf.TEMPORADA), esc(doc["ruta"] or "Programación")))
    return doc, cabecera(doc) + "".join(cuerpo) + pie


def main():
    os.makedirs(SALIDA, exist_ok=True)
    indice = json.load(open(os.path.join(pdf.FUENTE, "_indice.json"),
                            encoding="utf-8"))
    total = 0
    for reg in indice:
        doc, cuerpo = armar(reg)
        nombre = os.path.splitext(reg["archivo"])[0] + ".html"
        with open(os.path.join(SALIDA, nombre), "w", encoding="utf-8") as f:
            f.write(cuerpo)
        total += len(cuerpo)
    print("%d documentos · %.0f KB de HTML" % (len(indice), total / 1024.0))
    grandes = sorted(((os.path.getsize(os.path.join(SALIDA, a)), a)
                      for a in os.listdir(SALIDA)), reverse=True)[:5]
    for n, a in grandes:
        print("  %6.1f KB  %s" % (n / 1024.0, a))


if __name__ == "__main__":
    main()
