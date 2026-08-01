# -*- coding: utf-8 -*-
# Kit de lanzamiento @2115films — productora de cine corto (rojo/negro noir)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

IMGS = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/imgs/"
OUT  = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/posts2115/"
os.makedirs(OUT, exist_ok=True)

W, H = 1080, 1350
BG   = (10, 10, 12)
INK  = (245, 245, 247)
BODY = (176, 178, 184)
DIM  = (108, 110, 118)
RED  = (229, 36, 31)
CARD = (23, 23, 27)

FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
def f(path, s): return ImageFont.truetype(path, s)

CHAPA = Image.open(IMGS + "logo-2115-new.png").convert("RGBA")
M = 90

def scaled(img, w):
    return img.resize((w, int(img.height * w / img.width)), Image.LANCZOS)

def cover(photo, darken=0.55, blur=0):
    im = Image.open(IMGS + photo).convert("RGB")
    s = max(W / im.width, H / im.height)
    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
    x = (im.width - W) // 2; y = (im.height - H) // 2
    im = im.crop((x, y, x + W, y + H))
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    ov = Image.new("RGB", (W, H), BG)
    return Image.blend(im, ov, darken)

def grad_bottom(base, frm=0.05, to=0.97, start=0.34):
    g = base.convert("RGB"); md = Image.new("L", (W, H), 0).load()
    mask = Image.new("L", (W, H), 0); md = mask.load()
    top = int(H * start); ov = Image.new("RGB", (W, H), BG)
    for yy in range(H):
        if yy < top: a = int(frm*255)
        else:
            t = (yy-top)/(H-top); a = int((frm+(to-frm)*t)*255)
        for xx in range(0, W, 4): md[xx, yy] = a
    for yy in range(H):
        for xx in range(1, W):
            if xx % 4: md[xx, yy] = md[(xx//4)*4, yy]
    g.paste(ov, (0, 0), mask); return g

def track(draw, xy, text, font, fill, ls=0, anchor="la"):
    x, y = xy
    if ls == 0:
        draw.text((x, y), text, font=font, fill=fill, anchor=anchor)
        return draw.textlength(text, font=font)
    total = sum(draw.textlength(c, font=font)+ls for c in text) - ls
    if anchor.startswith("m"): x -= total/2
    elif anchor.startswith("r"): x -= total
    for c in text:
        draw.text((x, y), c, font=font, fill=fill, anchor="l"+anchor[1])
        x += draw.textlength(c, font=font) + ls
    return total

def rule(draw, x, y, w, color, h=8):
    draw.rectangle([x, y, x+w, y+h], fill=color)

def save(img, name):
    img.convert("RGB").save(OUT+name, "JPEG", quality=92); print("·", name)

# ============ 1 · PRESENTACIÓN / MANIFIESTO ============
def p1():
    im = cover("crop-botellas.jpg", 0.72, blur=3)
    im = grad_bottom(im, 0.2, 0.98, 0.0)
    d = ImageDraw.Draw(im)
    ch = scaled(CHAPA, 560); im.paste(ch, ((W-ch.width)//2, 300), ch)
    d.text((W//2, 760), "Cine en formato corto.", font=f(FB, 56), fill=INK, anchor="ma")
    track(d, (W//2, 838), "C U A N D O   C A E   L A   N O C H E", f(FR, 32), RED, 4, "ma")
    d.text((W//2, H-230), "Una productora nacida en Zona Oeste.", font=f(FR, 34), fill=BODY, anchor="ma")
    d.text((W//2, H-178), "Historias que aparecen a las 21:15.", font=f(FR, 34), fill=BODY, anchor="ma")
    save(im, "1-presentacion.jpg")

# ============ 2 · QUÉ HACEMOS ============
def p2():
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    rule(d, M, 150, 130, RED, 8)
    track(d, (M, 200), "Q U É   H A C E M O S", f(FB, 30), RED, 6)
    y = 360
    for word, col in [("PENSAMOS,", INK), ("RODAMOS Y", INK), ("ESTRENAMOS", RED), ("CINE CORTO.", INK)]:
        d.text((M, y), word, font=f(FB, 92), fill=col); y += 116
    d.text((M, y+40), "Ficción, series en vivo y contenido", font=f(FR, 34), fill=BODY)
    d.text((M, y+92), "de marca con lenguaje de cine.", font=f(FR, 34), fill=BODY)
    # tres chips de servicio
    yy = H - 250
    for lbl in ["FICCIÓN", "SERIES EN VIVO", "MARCA"]:
        w = d.textlength(lbl, font=f(FB, 34)) + 72
        d.rounded_rectangle([M, yy, M+w, yy+68], 34, outline=RED, width=3)
        d.text((M+36, yy+34), lbl, font=f(FB, 34), fill=INK, anchor="lm")
        yy += 84
    save(im, "2-que-hacemos.jpg")

# ============ 3 · PRIMER PROYECTO: IMPRO ============
def p3():
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    track(d, (M, 200), "N U E S T R O   P R I M E R   P R O Y E C T O", f(FB, 28), DIM, 3)
    d.text((M, 300), "IMPRO", font=f(FB, 220), fill=RED)
    rule(d, M, 560, W-2*M, (32,32,38), 4)
    y = 640
    for ln, col in [("La serie que se filma", INK), ("en bares reales.", INK)]:
        d.text((M, y), ln, font=f(FB, 60), fill=col); y += 76
    d.text((M, y+40), "Un bar. Dos personas. Un minuto.", font=f(FR, 36), fill=BODY)
    d.text((M, y+94), "Una escena de cine, improvisada.", font=f(FR, 36), fill=BODY)
    d.text((M, y+180), "Un capítulo nuevo cada día, 21:15.", font=f(FB, 38), fill=INK)
    box_y = H - 200
    d.rounded_rectangle([M, box_y, W-M, box_y+108], 16, fill=CARD)
    rule(d, M, box_y, 8, RED, 108)
    d.text((M+44, box_y+28), "Seguí la serie", font=f(FR, 32), fill=BODY)
    track(d, (M+44, box_y+64), "@ E S . I M P R O", f(FB, 34), INK, 3)
    save(im, "3-impro.jpg")

# ============ 4 · EL FUNDADOR ============
def p4():
    im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
    # foto recortada arriba
    ph = Image.open(IMGS+"founder-benjamin.jpg").convert("RGB")
    s = W / ph.width; ph = ph.resize((W, int(ph.height*s)), Image.LANCZOS)
    ph = ph.crop((0, 0, W, 720))
    im.paste(ph, (0, 0))
    # gradiente hacia negro
    mask = Image.new("L", (W, 720), 0); mm = mask.load()
    for yy in range(720):
        a = 0 if yy < 380 else int(((yy-380)/340)*255)
        for xx in range(W): mm[xx, yy] = a
    im.paste(Image.new("RGB", (W, 720), BG), (0, 0), mask)
    d = ImageDraw.Draw(im)
    track(d, (M, 600), "F U N D A D O R   ·   P R O D U C T O R", f(FB, 26), RED, 3)
    d.text((M, 660), "Benjamín Ortega", font=f(FB, 76), fill=INK)
    y = 790
    for ln in ["Productor y creador de contenido audiovisual.",
               "Formándose en la Tecnicatura en Artes",
               "Audiovisuales (UNLaM) y la Licenciatura en",
               "Creación de Contenido Audiovisual (UMET)."]:
        d.text((M, y), ln, font=f(FR, 34), fill=BODY); y += 52
    d.text((M, y+40), "Nacido en Isidro Casanova.", font=f(FR, 34), fill=BODY)
    d.text((M, y+92), "Radicado en Buenos Aires.", font=f(FR, 34), fill=BODY)
    track(d, (M, H-140), "@ F A B B E N O K", f(FB, 32), INK, 3)
    save(im, "4-fundador.jpg")

# ============ 5 · SEGUINOS / PRÓXIMAMENTE ============
def p5():
    im = cover("crop-barra.jpg", 0.74, blur=2)
    im = grad_bottom(im, 0.25, 0.98, 0.0)
    d = ImageDraw.Draw(im)
    rule(d, 0, 0, W, RED, 10)
    track(d, (M, 130), "P R Ó X I M A M E N T E", f(FB, 30), RED, 6)
    y = 720
    for ln in ["Estamos filmando", "algo nuevo."]:
        d.text((M, y), ln, font=f(FB, 92), fill=INK); y += 114
    d.text((M, y+40), "Cada semana mostramos cómo se", font=f(FR, 36), fill=BODY)
    d.text((M, y+94), "construye una serie desde cero.", font=f(FR, 36), fill=BODY)
    ch = scaled(CHAPA, 200); im.paste(ch, (M, H-ch.height-150), ch)
    track(d, (M, H-110), "S E G U I N O S   ·   @ 2 1 1 5 F I L M S", f(FR, 26), BODY, 3)
    save(im, "5-seguinos.jpg")

for fn in [p1, p2, p3, p4, p5]:
    fn()
print("\nOK", len(os.listdir(OUT)), "posts en", OUT)
