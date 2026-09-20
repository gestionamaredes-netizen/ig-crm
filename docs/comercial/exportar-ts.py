#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Vuelca prospectos.py a prospectos/lib/datos.ts."""
import json, os, re, subprocess, sys, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import prospectos as D

def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")

for p in D.P:
    p["id"] = slug(p["nombre"])

ids = [p["id"] for p in D.P]
assert len(ids) == len(set(ids)), "hay ids repetidos"

def ts(nombre, valor):
    return "export const %s = %s as const;\n\n" % (
        nombre, json.dumps(valor, ensure_ascii=False, indent=2))

out = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "plantilla-datos.ts")).read()
out += "export const ESTUDIO = %s;\n\n" % json.dumps(D.ESTUDIO, ensure_ascii=False, indent=2)
out += "export const PROSPECTOS: Prospecto[] = %s;\n\n" % json.dumps(D.P, ensure_ascii=False, indent=2)
out += ts("ESTADOS", [{"k": k, "n": n, "c": c} for k, n, c in D.ESTADOS])
out += ts("PERSONAS", D.PERSONAS)
out += ts("EQUIPO", D.EQUIPO)
out += ts("CANTERA", [{"q": q, "e": e, "n": n} for q, e, n in D.CANTERA])
out += ts("CAZADEROS", [{"t": t, "d": d, "c": c} for t, d, c in D.CAZADEROS])

destino = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "..", "..", "prospectos", "lib", "datos.ts")
open(destino, "w").write(out)
print("datos.ts ·", len(D.P), "prospectos")
