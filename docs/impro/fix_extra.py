# -*- coding: utf-8 -*-
# 1) foto del fundador sin esquinas redondeadas  2) regenerar post 4-fundador
# 3) historias faltantes de @2115films: PROYECTOS y DETRAS
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

DASH = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
IMGS = DASH + "imgs/"
MARCA = "/home/user/ig-crm/docs/impro/marca/"
POSTS2115 = DASH + "posts2115/"
HIST = DASH + "historias/"

FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def f(p, s): return ImageFont.truetype(p, s)

# ---------- 1) limpiar foto: recortar el borde negro redondeado ----------
def clean_founder():
    im = Image.open(MARCA + "founder-benjamin.jpg").convert("RGB")
    w, h = im.size  # 466x654
    # detectar cuanto entra el negro en la esquina superior-izq
    px = im.load()
    def is_black(p): return p[0] < 12 and p[1] < 12 and p[2] < 12
    inset = 0
    for k in range(0, 60):
        if not is_black(px[k, k]): break
        inset = k
    inset += 6  # margen de seguridad
    box = (inset, inset, w - inset, h - inset)
    cl = im.crop(box)
    cl.save(MARCA + "founder-benjamin-clean.jpg", "JPEG", quality=94)
    cl.save(IMGS + "founder-benjamin-clean.jpg", "JPEG", quality=94)
    print("clean founder:", cl.size, "inset", inset)
    return cl.size

# ---------- 2) regenerar post 4-fundador con la foto limpia ----------
W, H = 1080, 1350
NBG=(10,10,12); NINK=(245,245,247); NBODY=(176,178,184); RED=(229,36,31)

def track(d, xy, text, font, fill, ls=0, anchor="la"):
    x, y = xy
    if ls == 0:
        d.text((x, y), text, font=font, fill=fill, anchor=anchor); return
    total = sum(d.textlength(c, font=font)+ls for c in text)-ls
    if anchor.startswith("m"): x -= total/2
    elif anchor.startswith("r"): x -= total
    for c in text:
        d.text((x, y), c, font=font, fill=fill, anchor="l"+anchor[1])
        x += d.textlength(c, font=font)+ls

def post4_fundador():
    im = Image.new("RGB", (W, H), NBG)
    ph = Image.open(IMGS+"founder-benjamin-clean.jpg").convert("RGB")
    s = W / ph.width
    ph = ph.resize((W, int(ph.height*s)), Image.LANCZOS)
    ph = ph.crop((0, 0, W, min(760, ph.height)))
    im.paste(ph, (0, 0))
    ph_h = ph.height
    # gradiente hacia negro en la parte baja de la foto
    gh = 380
    mask = Image.new("L", (W, ph_h), 0); mm = mask.load()
    start = ph_h - gh
    for yy in range(ph_h):
        a = 0 if yy < start else int(((yy-start)/gh)*255)
        for xx in range(W): mm[xx, yy] = a
    im.paste(Image.new("RGB", (W, ph_h), NBG), (0, 0), mask)
    d = ImageDraw.Draw(im)
    track(d,(90, ph_h-120),"F U N D A D O R   ·   P R O D U C T O R", f(FB,26), RED, 3)
    d.text((90, ph_h-58), "Benjamín Ortega", font=f(FB,76), fill=NINK)
    y = ph_h + 60
    for ln in ["Productor y creador de contenido audiovisual.",
               "Formándose en la Tecnicatura en Artes",
               "Audiovisuales (UNLaM) y la Licenciatura en",
               "Creación de Contenido Audiovisual (UMET)."]:
        d.text((90, y), ln, font=f(FR,34), fill=NBODY); y += 52
    d.text((90, y+34), "Nacido en Isidro Casanova.", font=f(FR,34), fill=NBODY)
    d.text((90, y+86), "Radicado en Buenos Aires.", font=f(FR,34), fill=NBODY)
    track(d,(90, H-120),"@ F A B B E N O K", f(FB,32), NINK, 3)
    im.save(POSTS2115+"4-fundador.jpg", "JPEG", quality=92)
    print("post4 regen OK, foto alto", ph_h)

# ---------- 3) historias faltantes @2115films ----------
SW, SH = 1080, 1920
M = 96
NCARD=(23,23,27)
CHAPA = Image.open(IMGS+"logo-2115-new.png").convert("RGBA")
def scaled(img, w): return img.resize((w, int(img.height*w/img.width)), Image.LANCZOS)
def rule(d, x, y, w, c, h=8): d.rectangle([x, y, x+w, y+h], fill=c)

def st_track(d, xy, text, font, fill, ls=0, anchor="la"):
    track(d, xy, text, font, fill, ls, anchor)

def hist_proyectos():
    im = Image.new("RGB", (SW, SH), NBG); d = ImageDraw.Draw(im)
    rule(d, M, 300, 120, RED, 8)
    st_track(d,(M,352),"N U E S T R O S   P R O Y E C T O S", f(FB,32), RED, 3)
    # card IMPRO (activo)
    y = 560
    d.rounded_rectangle([M, y, SW-M, y+300], 22, fill=NCARD)
    rule(d, M, y, 8, RED, 300)
    d.text((M+56, y+52), "IMPRO", font=f(FB,96), fill=NINK)
    d.text((M+56, y+178), "Serie que se filma en bares reales.", font=f(FR,36), fill=NBODY)
    st_track(d,(M+56, y+232),"E N   R O D A J E   ·   @ E S . I M P R O", f(FB,30), RED, 2)
    # card proximo (en desarrollo)
    y2 = y + 360
    d.rounded_rectangle([M, y2, SW-M, y2+300], 22, outline=(46,46,52), width=3)
    d.text((M+56, y2+52), "PRÓXIMO", font=f(FB,72), fill=(90,90,98))
    d.text((M+56, y2+168), "Nuevas historias en camino.", font=f(FR,36), fill=(120,120,128))
    st_track(d,(M+56, y2+230),"E N   D E S A R R O L L O", f(FB,30), (110,110,118), 2)
    st_track(d,(SW//2, SH-170),"2 1 : 1 5   F I L M S", f(FB,28), (110,110,118), 5, "ma")
    im.save(HIST+"tf-4-proyectos.jpg", "JPEG", quality=91)
    print("hist proyectos OK")

def hist_detras():
    im = Image.new("RGB", (SW, SH), NBG); d = ImageDraw.Draw(im)
    rule(d, M, 300, 120, RED, 8)
    st_track(d,(M,352),"D E T R Á S   D E   E S C E N A", f(FB,32), RED, 3)
    y = 600
    for ln in ["Cómo se construye", "una serie desde cero."]:
        d.text((M, y), ln, font=f(FB,70), fill=NINK); y += 90
    d.text((M, y+50), "El casting, los guiones disparadores,", font=f(FR,42), fill=NBODY)
    d.text((M, y+108), "la búsqueda del bar, el día del piloto.", font=f(FR,42), fill=NBODY)
    d.text((M, y+166), "Semana a semana, sin cortes.", font=f(FR,42), fill=NBODY)
    box_y = SH - 460
    d.rounded_rectangle([M, box_y, SW-M, box_y+130], 18, fill=NCARD)
    rule(d, M, box_y, 8, RED, 130)
    d.text((M+48, box_y+34), "El diario del proceso, acá", font=f(FR,34), fill=NBODY)
    st_track(d,(M+48, box_y+80),"@ F A B B E N O K", f(FB,38), NINK, 3)
    im.save(HIST+"tf-5-detras.jpg", "JPEG", quality=91)
    print("hist detras OK")

clean_founder()
post4_fundador()
hist_proyectos()
hist_detras()
print("DONE")
