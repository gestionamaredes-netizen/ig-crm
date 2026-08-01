# -*- coding: utf-8 -*-
# Destacadas @fabbenok — hub personal. Fondo negro, acento azul fabbenok.
# Marcas con su logo real; utilitarias con icono azul.
from PIL import Image, ImageDraw, ImageFont
import os
IMGS="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/imgs/"
OUT="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/destacadas_fb/"
os.makedirs(OUT, exist_ok=True)
S=1080; CX=CY=S//2
BG=(8,9,11); AC=(79,184,240); INK=(238,240,244)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
def f(s): return ImageFont.truetype(FB,s)

IMPRO=Image.open(IMGS+"logo-impro-blanco.png").convert("RGBA")
CHAPA=Image.open(IMGS+"logo-2115-new.png").convert("RGBA")
BLUR=Image.open(IMGS+"blur-logo.png").convert("RGBA")

def scaled(img,w): return img.resize((w,int(img.height*w/img.width)),Image.LANCZOS)
def ring(d,r,col,w): d.ellipse([CX-r,CY-r,CX+r,CY+r],outline=col,width=w)

def label(d,text,y=812):
    fnt=f(44); ls=8
    w=sum(d.textlength(c,font=fnt)+ls for c in text)-ls
    x=CX-w/2
    for c in text:
        d.text((x,y),c,font=fnt,fill=INK,anchor="lm"); x+=d.textlength(c,font=fnt)+ls

def base():
    im=Image.new("RGB",(S,S),BG); d=ImageDraw.Draw(im)
    ring(d,500,tuple(min(c+14,255) for c in BG),2)
    ring(d,470,(20,26,34),6)
    return im,d

def place_logo(im,logo,maxw,cyoff=-40,maxh=300):
    lg=scaled(logo,maxw)
    if lg.height>maxh: lg=scaled(logo,int(maxw*maxh/lg.height))
    im.paste(lg,((S-lg.width)//2, CY+cyoff-lg.height//2), lg)

def ic_proceso(d):  # clapper / proceso creativo
    d.rounded_rectangle([CX-150,CY-30,CX+150,CY+150],14,outline=AC,width=15)
    d.polygon([(CX-158,CY-70),(CX+150,CY-104),(CX+160,CY-58),(CX-148,CY-24)],outline=AC,width=13)
    for dx in [-104,-34,36,106]:
        d.line([CX+dx-4,CY-92,CX+dx-20,CY-40],fill=AC,width=9)
    d.polygon([(CX-40,CY+20),(CX-40,CY+120),(CX+52,CY+70)],fill=AC)

def ic_contacto(d):  # chat
    d.rounded_rectangle([CX-155,CY-110,CX+155,CY+70],28,outline=AC,width=15)
    d.polygon([(CX-70,CY+70),(CX-70,CY+140),(CX-4,CY+70)],fill=AC)
    for rx in [CX-70,CX,CX+70]:
        d.ellipse([rx-12,CY-32,rx+12,CY-8],fill=AC)

SETS=[
 ("1-impro","IMPRO", ("logo",IMPRO,560,-20,300)),
 ("2-2115","21:15 FILMS", ("logo",CHAPA,360,-30,340)),
 ("3-blur","BLUR", ("logo",BLUR,540,-20,280)),
 ("4-proceso","PROCESO", ("icon",ic_proceso)),
 ("5-contacto","CONTACTO", ("icon",ic_contacto)),
]
for fn,lbl,spec in SETS:
    im,d=base()
    if spec[0]=="logo":
        _,logo,mw,off,mh=spec
        place_logo(im,logo,mw,off,mh)
    else:
        spec[1](d)
    label(d,lbl)
    im.save(OUT+f"fb-{fn}.jpg","JPEG",quality=92)
    print("·",lbl)
print("OK",len(os.listdir(OUT)))
