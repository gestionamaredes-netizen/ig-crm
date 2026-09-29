# -*- coding: utf-8 -*-
"""Donde vive cada documento del Drive y de que programa es.

`CARPETAS` mapea el id de cada carpeta del Drive a la ruta legible y al
programa al que pertenece. De ahi sale el logo que lleva el PDF, el color del
encabezado y la carpeta donde se guarda el archivo generado.
"""

RAIZ = "1oC11X8QOZag7WNrIsiSPSgFS7MhjyfeW"

# slug del programa -> (nombre, carpeta del drive, color de acento)
PROGRAMAS = {
    "plantillas": ("Plantillas y marca", "00 · Plantillas y marca", "#4A5260"),
    "el-motivo": ("El Motivo", "01 · El Motivo", "#A85A0C"),
    "tercer-tiempo": ("Tercer Tiempo", "02 · Tercer Tiempo", "#2F6E0F"),
    "sex-and-the-baires": ("Sex and the Baires", "03 · Sex and the Baires", "#C2145E"),
    "pequenos-grandes-sabios": ("Pequeños Grandes Sabios",
                                "04 · Pequeños Grandes Sabios", "#1454B4"),
    "exitosa-yo": ("Exitosa Yo", "05 · Exitosa Yo", "#8A6A22"),
    "estudio": ("Nexo Studios", "99 · Estudio", "#1454B4"),
    "raiz": ("Nexo Studios", "", "#1454B4"),
}

_SUB = ["1 · Formato", "2 · Guiones", "3 · Para técnica", "4 · Gráficas",
        "5 · Invitados", "6 · Emisiones", "7 · Redes", "8 · Administración"]

# programa -> los ocho ids de sus subcarpetas, en el orden de _SUB
_IDS = {
    "plantillas": ["1NWwpT5V93mjuC8C1MKFylGijg7MuzBRf", "1P5HZTIVhEVb5ntWPj9fBiyEbPuLFQI9U",
                   "1s6CP9IxtgKRyx7sQrXPJHLNuxVCF1yjo", "1vZPx1sQEDK8qmekgQaqMxDYKqQm8YwzA",
                   "14f-9lccevYYsIB9x0Sz8PnwRLDt7Rfwg", "1l-g9YvpRYVqaUWtMPOjkpXWWruxt4aLs",
                   "1YVsB-VpQQuWrDz-tS1WoJMlte8v6FneT", "10qorSXZi43AMZGrE21PPAHue8KLtfVX2"],
    "el-motivo": ["1wxTN-20lZGWwwKn9iZzT-Mrr9lWWGwKG", "1MAbRPbxD8Cgx7mo5_zmlu9qDzC5aqYlQ",
                  "1e3Et7qSjI6fkRsor9s98jl3aMC1j_1r7", "16N4q5WtBBs6qhFi2R_tVVwzSf1dXSna0",
                  "1MY7TXnaH7I1sKdapQzq-MZLNrwaiB6C5", "1TwRY82e41WNPTn55Um2i8eCkztFN8l5U",
                  "17z_WObRTxh1sH-a7rVVDB8tBlvLamXO3", "1-DHhOXz4l5BVLZkEzTTaTdEZ7rdVC1_I"],
    "tercer-tiempo": ["1qtUHh9YYTULs7HAn0oDs2LKSYVsSyLgn", "15SMW2L9aueq6KOJBpkuUvMeFnc0oM1Lt",
                      "13HY2Top7SVi0nM-uoiR4YVqAlknWoOYw", "1wa2rIgV1TyQvdMv07e8ivUz0HLzzoVYp",
                      "1HvvnqOjS8ZZXGuyIsNm9kTiBzgp3cNVm", "1z13edc4AIgMmumU0EBsiSZc8pzzt14Tl",
                      "1bz9UgigWMfsxcfAUBbkBNyUhiFxEF21E", "1kpaiNFnJ6uu187uW3Dy0y1Qo6wzdZurE"],
    "sex-and-the-baires": ["1mXOyMrLhEAKE3Sb1SANF0IMlNTk0Fyv1",
                           "1W0aFbC-_ys5pM4XMNzPRM-NvLXzLM-96",
                           "1pzueK1QLLzMMQC_wCvL72AV1qiKP0982",
                           "14HSb1rAPj0nCqQAyTIzI_LdCPpmbrqQc",
                           "1e5bM6ZajXUBtfcCGl-QZA38ta_-zRspq",
                           "1LQVitH4T36Fsk-GJNoh8wA8TNti7bZif",
                           "1FCbo8IfNNy-HcmcstONrPs0G1At_dDTm",
                           "1BYhZRBfCPCGji2kAnxzZPE7dha7BhpMO"],
    "pequenos-grandes-sabios": ["1FN4vzrInQs1yZ5YlyTAG7QuySNlnoSqz",
                                "1DOcdv1-IsbcPalZztW2-uWRQtRCtC2tR",
                                "1K3sXfjfBvytuhU12T0vRNLEQc2TUCMZQ",
                                "1l9pbqFhQrI-dbETJDjVkul0xZ5VKefun",
                                "1gfO8Z416vzRIRYz09I66anNuxhJozh3m",
                                "1CXi_U3al3AZlGvNVjQ1Hzi8ARY7S3xRh",
                                "1RfUsq4oHWq4kSReikfCfZ53z5WBVaJHK",
                                "1c_wiIM8UMILzNURr1EBe8fOXgu6Fdetl"],
    "exitosa-yo": ["1EqOeydctSgpgoD_2dITdIp3ARjnEy4vG", "1XOdL8eYMfQGdLedVw076OPD3V-bvpp7B",
                   "1CLoxacsvSGDGTBLnVkshiI_pqwVPN5MY", "1apFA1rblo5GRUthmSX6jMscJU25qTL0l",
                   "1FTax3Mg73brxlfZ8AcQxbHawmmaHwsrp", "1qsjRaGxtPIC8t9kmddeQ0xJyya57XrRG",
                   "1Th24OdHy0Mn8IslOLiUTGfCvPyl9cUxa", "1F_ISicAgqIfdSvkacavy0dx3emeyH7dk"],
}

# id de carpeta -> (slug del programa, nombre de la subcarpeta)
CARPETAS = {"1tOf_pIpS4If5BZu6FJOdQrl44AR5aVoI": ("estudio", ""),
            RAIZ: ("raiz", "")}
for _slug, _ids in _IDS.items():
    for _sub, _id in zip(_SUB, _ids):
        CARPETAS[_id] = (_slug, _sub)


def ubicar(parent_id):
    """Devuelve (slug, nombre del programa, subcarpeta, acento, ruta)."""
    slug, sub = CARPETAS[parent_id]
    nombre, carpeta, acento = PROGRAMAS[slug]
    ruta = "/".join(x for x in (carpeta, sub) if x)
    return slug, nombre, sub, acento, ruta


assert len(set(CARPETAS)) == len(CARPETAS)
assert len(CARPETAS) == len(_IDS) * 8 + 2
