# -*- coding: utf-8 -*-
# Historias (1080x1920) para poblar las destacadas de @ama.blur, con fotos reales.
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import os
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
MED=DASH+"blurmedia/"; OUT=DASH+"historias_blur/"; os.makedirs(OUT,exist_ok=True)
W,H=1080,1920; M=96
BG=(8,9,13); INK=(240,244,250); BODY=(190,200,214); AC=(58,186,246)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def f(p,s): return ImageFont.truetype(p,s)
LOGO=Image.open(DASH+"imgs/blur-logo.png").convert("RGBA")
def scaled(im,w): return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)

def cover(photo, darken=0.30, blur=0, pos=0.5):
    im=Image.open(MED+photo).convert("RGB")
    s=max(W/im.width,H/im.height)
    im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    x=int((im.width-W)*0.5); y=int((im.height-H)*pos)
    im=im.crop((x,y,x+W,y+H))
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    return Image.blend(im, Image.new("RGB",(W,H),BG), darken)

def grad(im, start=0.42, to=0.96):
    px=im.convert("RGB"); mask=Image.new("L",(W,H),0); md=mask.load()
    top=int(H*start)
    for yy in range(H):
        a=0 if yy<top else int(((yy-top)/(H-top))*to*255)
        for xx in range(0,W,4): md[xx,yy]=a
    for yy in range(H):
        for xx in range(1,W):
            if xx%4: md[xx,yy]=md[(xx//4)*4,yy]
    px.paste(Image.new("RGB",(W,H),(4,5,9)),(0,0),mask); return px

def track(d,xy,t,fn,fl,ls=0,anchor="la"):
    x,y=xy
    if ls==0: d.text((x,y),t,font=fn,fill=fl,anchor=anchor); return
    tot=sum(d.textlength(c,font=fn)+ls for c in t)-ls
    if anchor.startswith("m"): x-=tot/2
    for c in t:
        d.text((x,y),c,font=fn,fill=fl,anchor="l"+anchor[1]); x+=d.textlength(c,font=fn)+ls

def rule(d,x,y,w,c,h=8): d.rectangle([x,y,x+w,y+h],fill=c)
def pill(d,cx,y,t,fn,fg,bg,padx=44,ph=72):
    w=d.textlength(t,font=fn)+padx*2
    d.rounded_rectangle([cx-w/2,y,cx+w/2,y+ph],ph/2,fill=bg)
    d.text((cx,y+ph/2),t,font=fn,fill=fg,anchor="mm")

def logo(im,w=200,y=None):
    lg=scaled(LOGO,w); im.paste(lg,(M,(y if y else H-lg.height-150)),lg)

def save(im,n): im.convert("RGB").save(OUT+n,"JPEG",quality=90); print("·",n)

# 1 MUSICA — session Se Fue
def h1():
    im=cover("sessions.jpg",0.42,pos=0.25); im=grad(im,0.40); d=ImageDraw.Draw(im)
    rule(d,M,150,120,AC,10)
    y=1180
    track(d,(M,y),"M Ú S I C A   E N   V I V O",f(FB,34),AC,3)
    d.text((M,y+70),"Sessions en",font=f(FB,86),fill=INK)
    d.text((M,y+172),"Cerrito 1060",font=f(FB,86),fill=INK)
    d.text((M,y+300),"Versiones íntimas, crudas y sin filtros.",font=f(FR,40),fill=BODY)
    d.text((M,y+356),"Con la voz de Mar · todos los martes.",font=f(FR,40),fill=BODY)
    save(im,"blur-1-musica.jpg")

# 2 EVENTOS — crowd
def h2():
    im=cover("hero.jpg",0.34,pos=0.30); im=grad(im,0.40); d=ImageDraw.Draw(im)
    rule(d,M,150,120,AC,10)
    y=1200
    track(d,(M,y),"E V E N T O S",f(FB,34),AC,3)
    d.text((M,y+70),"Noches que la",font=f(FB,88),fill=INK)
    d.text((M,y+174),"gente recuerda.",font=f(FB,88),fill=INK)
    d.text((M,y+310),"Del concepto a la puerta. Música en vivo",font=f(FR,40),fill=BODY)
    d.text((M,y+366),"y una comunidad que crece en cada fecha.",font=f(FR,40),fill=BODY)
    save(im,"blur-2-eventos.jpg")

# 3 SOMOS COMO SOMOS — intervencion
def h3():
    im=cover("scs.jpg",0.40,pos=0.5); im=grad(im,0.36); d=ImageDraw.Draw(im)
    rule(d,M,150,120,AC,10)
    track(d,(M,210),"C O L A B O R A C I Ó N   I N T E R N A C I O N A L",f(FB,26),AC,2)
    y=1120
    d.text((M,y),"Somos Como Somos",font=f(FB,68),fill=INK)
    d.text((M,y+84),"× Aviv Arte",font=f(FB,68),fill=INK)
    d.text((M,y+200),"España ↔ Argentina · 16.11.2025",font=f(FR,38),fill=BODY)
    d.text((M,y+256),"Casablanca Tango, CABA.",font=f(FR,38),fill=BODY)
    # quote
    rule(d,M,y+340,8,AC,120)
    d.text((M+34,y+352),"“El reflejo que ves hoy",font=f(FB,40),fill=INK)
    d.text((M+34,y+408),"es lo que nunca se rindió.”",font=f(FB,40),fill=INK)
    save(im,"blur-3-somoscomosomos.jpg")

# 4 ARTE — salon
def h4():
    im=cover("arte.jpg",0.40,pos=0.4); im=grad(im,0.42); d=ImageDraw.Draw(im)
    rule(d,M,150,120,AC,10)
    y=1240
    track(d,(M,y),"A R T E",f(FB,34),AC,3)
    d.text((M,y+70),"El arte de",font=f(FB,88),fill=INK)
    d.text((M,y+174),"encontrarse.",font=f(FB,88),fill=INK)
    d.text((M,y+310),"Intervenciones y piezas que conectan",font=f(FR,40),fill=BODY)
    d.text((M,y+366),"miradas, épocas y personas.",font=f(FR,40),fill=BODY)
    save(im,"blur-4-arte.jpg")

# 5 CONTACTO — diseño
def h5():
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    # glow
    g=Image.new("RGB",(W,H),BG); gd=ImageDraw.Draw(g)
    gd.ellipse([W//2-460,240,W//2+460,1160],fill=(16,40,64)); g=g.filter(ImageFilter.GaussianBlur(180))
    im=Image.blend(im,g,0.9); d=ImageDraw.Draw(im)
    lg=scaled(LOGO,420); im.paste(lg,((W-lg.width)//2,470),lg)
    d.text((W//2,900),"¿Tenés una idea?",font=f(FB,72),fill=INK,anchor="ma")
    d.text((W//2,988),"La fabricamos.",font=f(FB,72),fill=AC,anchor="ma")
    d.text((W//2,1150),"Un evento, una sesión, una campaña.",font=f(FR,40),fill=BODY,anchor="ma")
    d.text((W//2,1206),"Contanos y te respondemos.",font=f(FR,40),fill=BODY,anchor="ma")
    pill(d,W//2,1400,"Escribinos por DM",f(FB,38),BG,AC)
    track(d,(W//2,1560),"@ A M A . B L U R",f(FB,34),INK,4,"ma")
    save(im,"blur-5-contacto.jpg")

for fn in [h1,h2,h3,h4,h5]: fn()
print("OK",len(os.listdir(OUT)))
