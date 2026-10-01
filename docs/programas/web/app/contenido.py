# -*- coding: utf-8 -*-
"""Arma el contenido de cada programa para que viva en la base, no en el HTML.

Mientras las paginas fueron artifacts privados, el contenido podia viajar
adentro del archivo. En un dominio publico no: una pagina web no puede
esconder lo que lleva adentro, asi que la escaleta y los precios los leeria
cualquiera que abra la URL, entre o no entre.

Entonces el HTML que se publica queda vacio de contenido y el contenido sale
de `programa_contenido`, que tiene las mismas politicas que todo lo demas.

    python3 contenido.py          escribe sitio/datos.sql y sitio/estilo.css
"""
import importlib.util
import io
import json
import os
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.dirname(AQUI)
SITIO = os.path.join(AQUI, "sitio")

_spec = importlib.util.spec_from_file_location(
    "_nexo_datos_web", os.path.join(WEB, "datos_web.py"))
W = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(W)

# sitio.py importa datos_web por nombre, asi que su carpeta tiene que estar
# en el camino de busqueda antes de cargarlo.
if WEB not in sys.path:
    sys.path.insert(0, WEB)

_spec2 = importlib.util.spec_from_file_location(
    "_nexo_sitio", os.path.join(WEB, "sitio.py"))
S = importlib.util.module_from_spec(_spec2)
_spec2.loader.exec_module(S)


def bloques(desde, filas):
    """Cada bloque con su minuto de arranque y de fin, como los quiere el reloj."""
    reloj = W.D.minutos(desde)
    out = []
    for n, nombre, dur, que in filas:
        d = S._dur(dur)
        out.append({"n": n, "nombre": nombre, "dur": dur, "que": que,
                    "i": reloj, "f": reloj + d})
        reloj += d
    return out, reloj


def carpetas_de(slug, docs):
    """Las ocho carpetas con lo que hay adentro y el link a la carpeta misma."""
    out = []
    for sub, para in W.CARPETAS.items():
        archivos = docs.get(sub, [])
        if not archivos:
            continue
        out.append({"nombre": sub, "para": para,
                    "carpeta_id": W.id_de_carpeta(slug, sub),
                    "docs": [{"titulo": t, "id": i} for t, i in archivos]})
    return out


def entradas_de(docs):
    """Los tres accesos de arriba: el primer documento de cada carpeta clave."""
    out = []
    for rotulo, sub, para, prefiere in W.ENTRADAS:
        titulo, did = W.entrada(docs, sub, prefiere)
        out.append({"rotulo": rotulo, "carpeta": sub, "para": para,
                    "titulo": titulo, "id": did})
    return out


def pauta_de(slug):
    n = W.numero(slug)
    return {"integrantes": n["integrantes"], "kits": n["kits"],
            "ingreso": n["ingreso"], "costo": n["costo"],
            "aparte": n["aparte"], "kit_base": n["kit"],
            "escalones": [[nombre, precio, que]
                          for nombre, precio, que in n["escalones"]]}


def contenido(slug, docs):
    p = W.PROG[slug]
    escaletas = []
    for titulo, desde, filas in p["escaletas"]:
        bs, fin = bloques(desde, filas)
        escaletas.append({
            "titulo": titulo,
            "dia": S.DIAS[titulo.split("·")[0].strip()],
            "desde": desde,
            "i": W.D.minutos(desde),
            "f": fin,
            "bloques": bs,
        })
    return {
        "slug": slug, "nombre": p["nombre"], "corto": p["corto"],
        "bajada": p["bajada"], "que_es": p["que_es"],
        "acento": p["acento"], "acento_negro": W.SOBRE_NEGRO[slug],
        "temporada": W.TEMPORADA,
        "ficha": [[k, v] for k, v in p["ficha"]],
        "franjas": [[d, a, b] for d, a, b in W.franjas(slug)],
        "escaletas": escaletas,
        "nota": p.get("nota", ""),
        "semana": [[d, q, h] for d, q, h in p["semana"]],
        "falta": list(p.get("falta", [])),
        "entradas": entradas_de(docs[slug]),
        "carpetas": carpetas_de(slug, docs[slug]),
        "pauta": pauta_de(slug),
    }


def estudio():
    """Lo de la casa: tarifas, descuentos y el objetivo de toda la grilla."""
    return {
        "tarifas": [[s, p, m] for s, p, m in W.TARIFAS],
        "jornada_minima": W.JORNADA_MINIMA,
        "descuentos": [[m, d] for m, d in W.DESCUENTOS],
        "objetivo": W.objetivo(),
        "piso": [[d, aire, armado] for d, aire, armado in W.piso_por_dia()],
        "cambios": [[d, sale, entra, hueco, nec, ok, directo]
                    for d, sale, entra, hueco, nec, ok, directo
                    in W.cambios_de_piso()],
    }


def comilla(s):
    """Un literal de Postgres, con las comillas simples duplicadas."""
    return "'" + s.replace("'", "''") + "'"


def main():
    os.makedirs(SITIO, exist_ok=True)
    docs = W.documentos()

    sql = ["-- Generado por app/contenido.py desde estructuras/datos.py.",
           "-- No se edita a mano: se regenera.", ""]
    for slug in W.ORDEN:
        c = contenido(slug, docs)
        sql.append(
            "insert into programa_contenido (programa_id, datos)\n"
            "select id, %s::jsonb from programas where slug = %s\n"
            "on conflict (programa_id) do update\n"
            "  set datos = excluded.datos, actualizado = now();"
            % (comilla(json.dumps(c, ensure_ascii=False)), comilla(slug)))
        sql.append("")
    sql.append(
        "insert into estudio (id, datos) values (1, %s::jsonb)\n"
        "on conflict (id) do update\n"
        "  set datos = excluded.datos, actualizado = now();"
        % comilla(json.dumps(estudio(), ensure_ascii=False)))

    ruta = os.path.join(SITIO, "datos.sql")
    io.open(ruta, "w", encoding="utf-8").write("\n".join(sql) + "\n")

    # Y los mismos datos en JSON, para la prueba sin red: el navegador de
    # este contenedor no llega a Supabase, asi que el dibujo se prueba con un
    # cliente falso que devuelve exactamente esto.
    io.open(os.path.join(SITIO, "prueba-datos.js"), "w", encoding="utf-8").write(
        "// Generado por app/contenido.py. No se edita a mano.\nexport default "
        + json.dumps({"programas": [contenido(s, docs) for s in W.ORDEN],
                      "estudio": estudio()}, ensure_ascii=False) + ";\n")

    # El estilo sale del mismo lugar que el de las paginas publicadas, para
    # que no haya dos diseños que se van separando con el tiempo.
    css = os.path.join(SITIO, "estilo.css")
    io.open(css, "w", encoding="utf-8").write(S.TOKENS + S.CSS)

    print("%d programas · %s" % (len(W.ORDEN), ruta))
    print("estilo: %s (%d KB)" % (css, os.path.getsize(css) // 1024))
    for slug in W.ORDEN:
        c = contenido(slug, docs)
        print("  %-24s %2d carpetas · %d escaletas · %2d documentos"
              % (slug, len(c["carpetas"]), len(c["escaletas"]),
                 sum(len(x["docs"]) for x in c["carpetas"])))


if __name__ == "__main__":
    main()
