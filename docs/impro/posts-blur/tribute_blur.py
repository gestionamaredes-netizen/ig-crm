# -*- coding: utf-8 -*-
# Post de origen / homenaje para @ama.blur — sobrio
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
OUT=DASH+"posts_blur/"
W,H=1080,1350; M=100
BG=(8,9,13); INK=(240,244,250); BODY=(180,190,206); DIM=(120,128,146); CYAN=(58,186,246)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FI="/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf"
def f(p,s): return ImageFont.truetype(p,s)
LOGO=Image.open(DASH+"imgs/blur-logo.png").convert("RGBA")
def scaled(im,w): return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)

def track(d,xy,t,fn,fl,ls,anchor="la"):
    x,y=xy;
    for c in t:
        d.text((x,y),c,font=fn,fill=fl,anchor="l"+anchor[1]); x+=d.textlength(c,font=fn)+ls

im=Image.new("RGB",(W,H),BG)
# glow suave arriba
g=Image.new("RGB",(W,H),BG); gd=ImageDraw.Draw(g)
gd.ellipse([W//2-380,180,W//2+380,900],fill=(14,34,60)); g=g.filter(ImageFilter.GaussianBlur(200))
im=Image.blend(im,g,0.75)
d=ImageDraw.Draw(im)

track(d,(M,170),"P O R   Q U É   B L U R",f(FB,30),CYAN,6)

# la frase (entre comillas), grande
d.text((M,300),"«No te",font=f(FB,104),fill=INK)
d.text((M,416),"desenfoques.»",font=f(FB,104),fill=INK)

# contexto
y=610
for ln in ["Fue una de las últimas cosas","que me dijo Tomi."]:
    d.text((M,y),ln,font=f(FR,42),fill=BODY); y+=58

y=800
d.text((M,y),"Blur ",font=f(FB,44),fill=INK)
wln=d.textlength("Blur ",font=f(FB,44))
d.text((M+wln,y),"— desenfoque —",font=f(FB,44),fill=CYAN)
d.text((M,y+62),"lleva su nombre para no olvidarlo.",font=f(FB,44),fill=INK)

# dedicatoria abajo
d.rectangle([M,H-260,M+8,H-150],fill=CYAN)
track(d,(M+34,H-258),"E N   M E M O R I A   D E",f(FB,26),DIM,4)
d.text((M+34,H-214),"Tomás Galeano · Tomi G",font=f(FB,44),fill=INK)
d.text((M+34,H-156),"20 de abril de 2022",font=f(FR,32),fill=DIM)

lg=scaled(LOGO,180); im.paste(lg,(W-lg.width-M,H-lg.height-150),lg)

im.convert("RGB").save(OUT+"5-origen.jpg","JPEG",quality=93)
print("OK 5-origen.jpg")
