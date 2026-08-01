# -*- coding: utf-8 -*-
# Destacadas @ama.blur — identidad azul eléctrico sobre negro
from PIL import Image, ImageDraw, ImageFont
import os, math
IMGS="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/imgs/"
OUT="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/destacadas_blur/"
os.makedirs(OUT, exist_ok=True)
S=1080; CX=CY=S//2
BG=(8,9,13); AC=(58,186,246); INK=(238,242,248)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def f(s): return ImageFont.truetype(FB,s)

def ring(d,r,col,w): d.ellipse([CX-r,CY-r,CX+r,CY+r],outline=col,width=w)

def label(d,text,y=812):
    # tamaño adaptativo para que entre siempre
    sz=44; ls=8
    while sz>24:
        fnt=f(sz)
        w=sum(d.textlength(c,font=fnt)+ls for c in text)-ls
        if w<=S-150: break
        sz-=2
    fnt=f(sz)
    w=sum(d.textlength(c,font=fnt)+ls for c in text)-ls
    x=CX-w/2
    for c in text:
        d.text((x,y),c,font=fnt,fill=INK,anchor="lm"); x+=d.textlength(c,font=fnt)+ls

def base():
    im=Image.new("RGB",(S,S),BG); d=ImageDraw.Draw(im)
    ring(d,500,tuple(min(c+14,255) for c in BG),2)
    ring(d,470,(16,28,40),6)
    return im,d

def ic_mic(d):  # MUSICA
    d.rounded_rectangle([CX-52,CY-160,CX+52,CY+20],52,outline=AC,width=15)
    for gy in [-120,-80,-40]:
        d.line([CX-52,CY+gy,CX+52,CY+gy],fill=AC,width=6)
    d.arc([CX-110,CY-90,CX+110,CY+130],20,160,fill=AC,width=15)
    d.line([CX,CY+110,CX,CY+165],fill=AC,width=15)
    d.line([CX-56,CY+165,CX+56,CY+165],fill=AC,width=15)

def ic_star(d):  # EVENTOS (spark)
    for ang,ln in [(90,170),(210,170),(330,170)]:
        pass
    # cuatro puntas
    pts=[(0,-175),(38,-38),(175,0),(38,38),(0,175),(-38,38),(-175,0),(-38,-38)]
    poly=[(CX+px,CY+py) for px,py in pts]
    d.polygon(poly,outline=AC,width=14)

def ic_globe(d):  # SOMOS COMO SOMOS (colaboracion internacional)
    r=155
    ring(d,r,AC,14)
    d.ellipse([CX-70,CY-r,CX+70,CY+r],outline=AC,width=11)
    d.line([CX-r,CY,CX+r,CY],fill=AC,width=11)
    d.arc([CX-r,CY-70,CX+r,CY+70],0,360,fill=AC,width=9)

def ic_brush(d):  # ARTE
    d.line([CX+70,CY-160,CX-40,CY+40],fill=AC,width=16)
    d.polygon([(CX-40,CY+20),(CX-95,CY+70),(CX-30,CY+110),(CX+5,CY+55)],outline=AC,width=13)
    d.line([CX-95,CY+70,CX-140,CY+150],fill=AC,width=12)

def ic_chat(d):  # CONTACTO
    d.rounded_rectangle([CX-155,CY-110,CX+155,CY+70],28,outline=AC,width=15)
    d.polygon([(CX-70,CY+70),(CX-70,CY+140),(CX-4,CY+70)],fill=AC)
    for rx in [CX-70,CX,CX+70]:
        d.ellipse([rx-12,CY-32,rx+12,CY-8],fill=AC)

SETS=[
 ("1-musica","MÚSICA", ic_mic),
 ("2-eventos","EVENTOS", ic_star),
 ("3-scs","SOMOS COMO SOMOS", ic_globe),
 ("4-arte","ARTE", ic_brush),
 ("5-contacto","CONTACTO", ic_chat),
]
for fn,lbl,drawer in SETS:
    im,d=base()
    drawer(d)
    label(d,lbl)
    im.save(OUT+f"blur-{fn}.jpg","JPEG",quality=92)
    print("·",lbl)
print("OK",len(os.listdir(OUT)))
