# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
import os, math
OUT = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/destacadas/"
os.makedirs(OUT, exist_ok=True)
S = 1080
CX = CY = S//2
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def f(sz): return ImageFont.truetype(FB, sz)

def base(bg):
    im = Image.new("RGB", (S, S), bg)
    return im, ImageDraw.Draw(im)

def label(d, text, col, y=712):
    fnt = f(46)
    # tracking
    ls = 8
    w = sum(d.textlength(c, font=fnt)+ls for c in text) - ls
    x = CX - w/2
    for c in text:
        d.text((x, y), c, font=fnt, fill=col, anchor="lm")
        x += d.textlength(c, font=fnt) + ls

def ring(d, cx, cy, r, col, w):
    d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=col, width=w)

# ---- iconos (stroke ~16) ----
def ic_play(d, col):           # QUE ES / watch
    ring(d, CX, 448, 150, col, 16)
    t = [(CX-46,448-70),(CX-46,448+70),(CX+72,448)]
    d.polygon(t, fill=col)
def ic_cards(d, col):          # COMO JUGAR (menu-guion)
    d.rounded_rectangle([CX-150,320,CX+110,560], 22, outline=col, width=16)
    d.rounded_rectangle([CX-110,360,CX+150,600], 22, fill=None, outline=col, width=16)
    for i,yy in enumerate([420,470,520]):
        d.line([CX-80,yy,CX+90,yy], fill=col, width=12)
def ic_chips(d, col):          # GENEROS
    for i,yy in enumerate([348,448,548]):
        wq = 210 - i*10
        d.rounded_rectangle([CX-wq/2, yy-34, CX+wq/2, yy+34], 34, outline=col, width=15)
def ic_glass(d, col):          # BARES
    d.line([CX-120,330,CX,470], fill=col, width=16)
    d.line([CX+120,330,CX,470], fill=col, width=16)
    d.line([CX-120,330,CX+120,330], fill=col, width=16)
    d.line([CX,470,CX,588], fill=col, width=16)
    d.line([CX-70,590,CX+70,590], fill=col, width=16)
    d.ellipse([CX-16,352,CX+16,384], fill=col)  # aceituna
def ic_person(d, col):         # CASTING
    ring(d, CX, 396, 74, col, 16)
    d.arc([CX-140,470,CX+140,760], 200, 340, fill=col, width=16)
def ic_cal(d, col):            # RESERVAS
    d.rounded_rectangle([CX-150,340,CX+150,580], 20, outline=col, width=16)
    d.line([CX-150,410,CX+150,410], fill=col, width=14)
    d.line([CX-95,320,CX-95,368], fill=col, width=14)
    d.line([CX+95,320,CX+95,368], fill=col, width=14)
    for ry in [460,520]:
        for rx in [CX-90,CX-20,CX+50]:
            d.ellipse([rx-9,ry-9,rx+9,ry+9], fill=col)
def ic_clap(d, col):           # PRODUCTORA
    d.rounded_rectangle([CX-160,400,CX+160,580], 14, outline=col, width=16)
    d.line([CX-160,400,CX+160,340], fill=col, width=0)
    # barra superior con diagonales
    d.polygon([(CX-165,352),(CX+155,318),(CX+165,362),(CX-155,396)], outline=col, width=14)
    for dx in [-110,-40,40,110]:
        d.line([CX+dx-6,330,CX+dx-24,384], fill=col, width=10)
def ic_grid(d, col):           # PROYECTOS
    g=64
    for gx in [CX-95,CX+31]:
        for gy in [352,478]:
            d.rounded_rectangle([gx,gy,gx+g,gy+g], 12, outline=col, width=15)
def ic_impro(d, col):          # IMPRO (O con punto)
    ring(d, CX, 448, 150, col, 18)
    d.ellipse([CX-22,426,CX+22,470], fill=col)
def ic_cam(d, col):            # DETRAS
    d.rounded_rectangle([CX-150,360,CX+70,560], 16, outline=col, width=16)
    d.polygon([(CX+70,420),(CX+160,380),(CX+160,540),(CX+70,500)], outline=col, width=16)
    ring(d, CX-40, 460, 44, col, 14)
def ic_chat(d, col):           # CONTACTO
    d.rounded_rectangle([CX-150,340,CX+150,530], 26, outline=col, width=16)
    d.polygon([(CX-70,530),(CX-70,600),(CX-6,530)], fill=col)
    for rx in [CX-70,CX,CX+70]:
        d.ellipse([rx-11,431,rx+11,453], fill=col)

SETS = {
 "esimpro": {"bg": (10,13,28), "accent": (43,228,176), "items": [
    ("que-es","QUÉ ES", ic_play), ("como-jugar","CÓMO JUGAR", ic_cards),
    ("generos","GÉNEROS", ic_chips), ("bares","BARES", ic_glass),
    ("casting","CASTING", ic_person), ("reservas","RESERVAS", ic_cal)]},
 "2115": {"bg": (10,10,12), "accent": (229,36,31), "items": [
    ("productora","PRODUCTORA", ic_clap), ("proyectos","PROYECTOS", ic_grid),
    ("impro","IMPRO", ic_impro), ("detras","DETRÁS", ic_cam),
    ("contacto","CONTACTO", ic_chat)]},
}

for acc, cfg in SETS.items():
    for i,(fn,txt,drawer) in enumerate(cfg["items"], 1):
        im, d = base(cfg["bg"])
        # circulo guia sutil
        ring(d, CX, CY, 500, tuple(min(c+16,255) for c in cfg["bg"]), 2)
        drawer(d, cfg["accent"])
        label(d, txt, (240,240,240))
        im.save(OUT+f"{acc}-{i}-{fn}.jpg", "JPEG", quality=92)
        print("·", acc, txt)
print("OK", len(os.listdir(OUT)))
