# -*- coding: utf-8 -*-
# Posts de feed @ama.blur — placas en branding Blur (azul/negro)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
OUT=DASH+"posts_blur/"; os.makedirs(OUT,exist_ok=True)
W,H=1080,1350; M=96
BG=(8,9,13); INK=(240,244,250); BODY=(178,188,204); DIM=(120,128,146)
CYAN=(58,186,246); BLUE=(32,96,230); CARD=(17,21,31)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def f(p,s): return ImageFont.truetype(p,s)
LOGO=Image.open(DASH+"imgs/blur-logo.png").convert("RGBA")
def scaled(im,w): return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)

def glow(im, cx, cy, r, col, strength=0.85):
    g=Image.new("RGB",(W,H),BG); gd=ImageDraw.Draw(g)
    gd.ellipse([cx-r,cy-r,cx+r,cy+r],fill=col); g=g.filter(ImageFilter.GaussianBlur(r*0.55))
    return Image.blend(im,g,strength)

def base(with_glow=False, gx=W//2, gy=430, gr=380, gc=(14,34,60)):
    im=Image.new("RGB",(W,H),BG)
    if with_glow: im=glow(im,gx,gy,gr,gc)
    return im, ImageDraw.Draw(im)

def track(d,xy,t,fn,fl,ls=0,anchor="la"):
    x,y=xy
    if ls==0: d.text((x,y),t,font=fn,fill=fl,anchor=anchor); return
    tot=sum(d.textlength(c,font=fn)+ls for c in t)-ls
    if anchor.startswith("m"): x-=tot/2
    for c in t:
        d.text((x,y),c,font=fn,fill=fl,anchor="l"+anchor[1]); x+=d.textlength(c,font=fn)+ls

def rule(d,x,y,w,c,h=8): d.rectangle([x,y,x+w,y+h],fill=c)
def logo(im,w=200,xy=None):
    lg=scaled(LOGO,w); x=(W-lg.width)//2 if xy is None else xy[0]; y=xy[1] if xy else 0
    im.paste(lg,(x,y),lg)
def pill(d,cx,y,t,fn,fg,bg,padx=46,ph=76):
    w=d.textlength(t,font=fn)+padx*2
    d.rounded_rectangle([cx-w/2,y,cx+w/2,y+ph],ph/2,fill=bg)
    d.text((cx,y+ph/2),t,font=fn,fill=fg,anchor="mm")
def save(im,n): im.convert("RGB").save(OUT+n,"JPEG",quality=92); print("·",n)

# 1 PRESENTACION (fijado)
def p1():
    im,d=base(with_glow=True, gy=470, gr=430, gc=(16,40,72))
    rule(d,0,0,W,CYAN,10)
    lg=scaled(LOGO,560); im.paste(lg,((W-lg.width)//2,300),lg); d=ImageDraw.Draw(im)
    track(d,(W//2,700),"A G E N C I A   C R E A T I V A",f(FB,32),CYAN,4,"ma")
    d.text((W//2,790),"Fabricamos",font=f(FB,96),fill=INK,anchor="ma")
    d.text((W//2,898),"ideas.",font=f(FB,96),fill=INK,anchor="ma")
    d.text((W//2,1080),"Música en vivo · Eventos · Experiencias",font=f(FR,36),fill=BODY,anchor="ma")
    d.text((W//2,1136),"Hacemos que las ideas viajen.",font=f(FR,36),fill=BODY,anchor="ma")
    track(d,(W//2,H-120),"@ A M A . B L U R",f(FB,32),INK,4,"ma")
    save(im,"1-presentacion.jpg")

# 2 QUE HACEMOS
def p2():
    im,d=base()
    rule(d,M,150,120,CYAN,10)
    track(d,(M,205),"Q U É   H A C E M O S",f(FB,32),CYAN,4)
    y=330
    for ln,col in [("Una idea,",INK),("ejecutada",INK),("completa.",CYAN)]:
        d.text((M,y),ln,font=f(FB,104),fill=col); y+=124
    d.text((M,y+34),"Pensamos el concepto, lo dirigimos",font=f(FR,36),fill=BODY)
    d.text((M,y+86),"y lo producimos de punta a punta.",font=f(FR,36),fill=BODY)
    yy=H-360
    for lbl in ["MÚSICA EN VIVO","EVENTOS Y EXPERIENCIAS","CONTENIDO DE MARCA","COLABORACIONES"]:
        wq=d.textlength(lbl,font=f(FB,32))+70
        d.rounded_rectangle([M,yy,M+wq,yy+64],32,outline=CYAN,width=3)
        d.text((M+35,yy+32),lbl,font=f(FB,32),fill=INK,anchor="lm"); yy+=80
    lg=scaled(LOGO,150); im.paste(lg,(W-lg.width-M,H-lg.height-90),lg)
    save(im,"2-que-hacemos.jpg")

# 3 MANIFIESTO
def p3():
    im,d=base(with_glow=True, gy=H//2, gr=460, gc=(12,30,54))
    rule(d,M,190,120,CYAN,10)
    y=430
    lines=[("No hacemos",INK),("“contenido”.",INK),("Creamos",INK),("experiencias",CYAN),("que la gente",INK),("recuerda.",INK)]
    for ln,col in lines:
        d.text((M,y),ln,font=f(FB,82),fill=col); y+=96
    track(d,(M,H-130),"B L U R   ·   @ A M A . B L U R",f(FB,28),DIM,4)
    save(im,"3-manifiesto.jpg")

# 4 CONTACTO
def p4():
    im,d=base(with_glow=True, gy=440, gr=380, gc=(16,40,72))
    lg=scaled(LOGO,440); im.paste(lg,((W-lg.width)//2,300),lg); d=ImageDraw.Draw(im)
    d.text((W//2,650),"¿Tenés una idea?",font=f(FB,74),fill=INK,anchor="ma")
    d.text((W//2,742),"La fabricamos.",font=f(FB,74),fill=CYAN,anchor="ma")
    d.text((W//2,900),"Un evento, una sesión, una campaña.",font=f(FR,38),fill=BODY,anchor="ma")
    d.text((W//2,956),"Contanos y te respondemos.",font=f(FR,38),fill=BODY,anchor="ma")
    pill(d,W//2,1110,"Escribinos por DM",f(FB,38),BG,CYAN)
    track(d,(W//2,H-140),"@ A M A . B L U R",f(FB,34),INK,4,"ma")
    save(im,"4-contacto.jpg")

for fn in [p1,p2,p3,p4]: fn()
print("OK",len(os.listdir(OUT)))
