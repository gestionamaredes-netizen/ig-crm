# -*- coding: utf-8 -*-
# Foto de Tomi con recuadro branded + logo Blur (post carrusel)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
OUT=DASH+"posts_blur/"
W,H=1080,1350
BG=(8,9,13); CYAN=(58,186,246); DIM=(150,158,178); INK=(238,242,248)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def f(p,s): return ImageFont.truetype(p,s)
LOGO=Image.open(DASH+"imgs/blur-logo.png").convert("RGBA")
def scaled(im,w): return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)

im=Image.new("RGB",(W,H),BG)
# glow sutil
g=Image.new("RGB",(W,H),BG); gd=ImageDraw.Draw(g)
gd.ellipse([W//2-420,-160,W//2+420,520],fill=(14,34,60)); g=g.filter(ImageFilter.GaussianBlur(200))
im=Image.blend(im,g,0.7)
d=ImageDraw.Draw(im)

# recuadro (marco) para la foto
mx,my,mw,mh = 72,96,W-144,1000
# foto cover dentro del marco
ph=Image.open(DASH+"blurmedia/tomi-src.jpg").convert("RGB")
s=max(mw/ph.width, mh/ph.height)
ph=ph.resize((int(ph.width*s),int(ph.height*s)),Image.LANCZOS)
cx=(ph.width-mw)//2; cy=int((ph.height-mh)*0.22)
ph=ph.crop((cx,cy,cx+mw,cy+mh))
# mascara redondeada
rad=20
mask=Image.new("L",(mw,mh),0); md=ImageDraw.Draw(mask)
md.rounded_rectangle([0,0,mw,mh],rad,fill=255)
im.paste(ph,(mx,my),mask)
d=ImageDraw.Draw(im)
# borde branded (doble: cyan fino + halo)
d.rounded_rectangle([mx-2,my-2,mx+mw+2,my+mh+2],rad+2,outline=CYAN,width=3)
d.rounded_rectangle([mx-9,my-9,mx+mw+9,my+mh+9],rad+8,outline=(26,54,82),width=2)
# esquinas tipo mira
cl=34
for (ax,ay,dx,dy) in [(mx,my,1,1),(mx+mw,my,-1,1),(mx,my+mh,1,-1),(mx+mw,my+mh,-1,-1)]:
    d.line([ax,ay,ax+dx*cl,ay],fill=CYAN,width=4)
    d.line([ax,ay,ax,ay+dy*cl],fill=CYAN,width=4)

# logo blur + dedicatoria abajo
lg=scaled(LOGO,190); im.paste(lg,((W-lg.width)//2,1132),lg)
def ctrack(y,t,fn,fl,ls):
    tot=sum(d.textlength(c,font=fn)+ls for c in t)-ls; x=W/2-tot/2
    for c in t:
        d.text((x,y),c,font=fn,fill=fl,anchor="lm"); x+=d.textlength(c,font=fn)+ls
ctrack(1290,"E N   M E M O R I A   D E   T O M Á S   G A L E A N O   ·   T O M I   G",f(FB,20),DIM,2)

im.save(OUT+"6-tomi-foto.jpg","JPEG",quality=93)
print("OK 6-tomi-foto branded")
