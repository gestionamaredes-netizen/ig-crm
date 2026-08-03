# -*- coding: utf-8 -*-
# Posteos de lanzamiento (carrusel + historia) para @es.impro y @2115films
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
IMGS=DASH+"imgs/"; OUT=DASH+"launch/"; os.makedirs(OUT,exist_ok=True)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FM="/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
def f(p,s): return ImageFont.truetype(p,s)
IMPRO=Image.open(IMGS+"logo-impro-blanco-tag.png").convert("RGBA")
IMPROWM=Image.open(IMGS+"logo-impro-blanco.png").convert("RGBA")
CHAPA=Image.open(IMGS+"logo-2115-new.png").convert("RGBA")
def scaled(im,w): return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)

def cover(photo,W,H,dark=0.6,blur=0):
    im=Image.open(IMGS+photo).convert("RGB")
    s=max(W/im.width,H/im.height); im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    x=(im.width-W)//2; y=(im.height-H)//2; im=im.crop((x,y,x+W,y+H))
    if blur: im=im.filter(ImageFilter.GaussianBlur(blur))
    return Image.blend(im,Image.new("RGB",(W,H),(8,9,14)),dark)

def grad(im,W,H,bgc,start=0.35,to=0.96):
    px=im.convert("RGB"); mask=Image.new("L",(W,H),0); md=mask.load(); top=int(H*start)
    for yy in range(H):
        a=0 if yy<top else int(((yy-top)/(H-top))*to*255)
        for xx in range(0,W,4): md[xx,yy]=a
    for yy in range(H):
        for xx in range(1,W):
            if xx%4: md[xx,yy]=md[(xx//4)*4,yy]
    px.paste(Image.new("RGB",(W,H),bgc),(0,0),mask); return px

def track(d,xy,t,fn,fl,ls,anchor="la"):
    x,y=xy
    if ls==0: d.text((x,y),t,font=fn,fill=fl,anchor=anchor); return
    tot=sum(d.textlength(c,font=fn)+ls for c in t)-ls
    if anchor.startswith("m"): x-=tot/2
    for c in t:
        d.text((x,y),c,font=fn,fill=fl,anchor="l"+anchor[1]); x+=d.textlength(c,font=fn)+ls
def rule(d,x,y,w,c,h=8): d.rectangle([x,y,x+w,y+h],fill=c)
def save(im,n): im.convert("RGB").save(OUT+n,"JPEG",quality=92); print("·",n)

# palettes
NAVY=(10,13,28); INK=(240,244,250); BODY=(190,196,214); MINT=(43,228,176); AMBER=(245,168,60); CYAN=(79,198,255)
NBG=(10,10,12); RED=(229,36,31); NBODY=(176,178,186); DIM=(120,124,140)
M=96
DATE="11 SEP"; HORA="21:15"

# ================= @es.impro carrusel (1080x1350) =================
W,H=1080,1350
def e1():
    im=cover("crop-botellas.jpg",W,H,0.62,3); im=grad(im,W,H,NAVY,0.24); d=ImageDraw.Draw(im)
    rule(d,0,0,W,MINT,10)
    lg=scaled(IMPRO,660); im.paste(lg,((W-lg.width)//2,250),lg); d=ImageDraw.Draw(im)
    track(d,(W//2,640),"E S T R E N O",f(FB,40),MINT,10,"ma")
    d.text((W//2,720),"Viernes 11 de septiembre",font=f(FB,54),fill=INK,anchor="ma")
    d.text((W//2,H-300),HORA,font=f(FM,150),fill=INK,anchor="ma")
    track(d,(W//2,H-120),"L A   S E R I E   Q U E   S E   F I L M A   E N   B A R E S",f(FR,24),BODY,3,"ma")
    save(im,"es-1-estreno.jpg")
def e2():
    im=Image.new("RGB",(W,H),NAVY); d=ImageDraw.Draw(im)
    rule(d,M,150,130,MINT,8); track(d,(M,205),"Q U É   E S",f(FB,30),MINT,6)
    y=360
    for ln,c in [("Una serie web",INK),("interactiva.",MINT),("Se filma en",INK),("bares reales.",INK)]:
        d.text((M,y),ln,font=f(FB,92),fill=c); y+=112
    d.text((M,y+40),"Un bar. Dos personas. Un minuto.",font=f(FR,36),fill=BODY)
    d.text((M,y+92),"Una escena de cine, improvisada.",font=f(FR,36),fill=BODY)
    lw=scaled(IMPROWM,190); im.paste(lw,(M,H-150),lw)
    save(im,"es-2-quees.jpg")
def e3():
    im=Image.new("RGB",(W,H),NAVY); d=ImageDraw.Draw(im)
    rule(d,M,150,130,CYAN,8); track(d,(M,205),"C Ó M O   E S",f(FB,30),CYAN,6)
    steps=[("Reservás tu función.",),("Actuás tu minuto, con un guion disparador.",),("Te llevás tu capítulo de cine.",),("El público vota. Los mejores, vuelven.",)]
    y=380
    for i,(t,) in enumerate(steps,1):
        d.ellipse([M,y,M+70,y+70],outline=CYAN,width=5); d.text((M+35,y+35),str(i),font=f(FB,38),fill=CYAN,anchor="mm")
        # wrap
        words=t.split(" "); line=""; yy=y-4; xx=M+104
        for wd in words:
            tt=(line+" "+wd).strip()
            if d.textlength(tt,font=f(FB,38))<=W-M-104: line=tt
            else: d.text((xx,yy),line,font=f(FB,38),fill=INK); yy+=52; line=wd
        d.text((xx,yy),line,font=f(FB,38),fill=INK)
        y+=180
    save(im,"es-3-como.jpg")
def e4():
    im=cover("crop-barra.jpg",W,H,0.60,2); im=grad(im,W,H,NAVY,0.0); d=ImageDraw.Draw(im)
    rule(d,0,0,W,AMBER,10); track(d,(M,130),"C O N V O C A T O R I A   A B I E R T A",f(FB,28),AMBER,3)
    y=760
    for ln in ["Reservá tu","función."]:
        d.text((M,y),ln,font=f(FB,104),fill=INK); y+=118
    d.text((M,y+30),"Sé parte del estreno. Actuá tu capítulo.",font=f(FR,38),fill=BODY)
    box=H-250
    d.rounded_rectangle([M,box,W-M,box+120],16,fill=(21,27,54)); rule(d,M,box,8,AMBER,120)
    d.text((M+44,box+26),"Funciones desde $25.000 · tapeo incluido",font=f(FB,30),fill=INK)
    track(d,(M+44,box+74),"R E S E R V Á   ·   L I N K   E N   B I O",f(FR,26),AMBER,3)
    save(im,"es-4-reserva.jpg")
def e5():
    im=Image.new("RGB",(W,H),NAVY); d=ImageDraw.Draw(im)
    track(d,(W//2,300),"L A   C I T A",f(FB,32),MINT,8,"ma")
    d.text((W//2,H//2-40),HORA,font=f(FM,240),fill=INK,anchor="mm")
    d.text((W//2,H//2+150),"Todos los días, un capítulo nuevo.",font=f(FB,40),fill=BODY,anchor="ma")
    track(d,(W//2,H-180),"S E G U Í   @ E S . I M P R O",f(FB,28),MINT,4,"ma")
    save(im,"es-5-cita.jpg")

# ================= @2115films carrusel =================
def f1():
    im=cover("crop-botellas.jpg",W,H,0.72,3); im=grad(im,W,H,NBG,0.1); d=ImageDraw.Draw(im)
    ch=scaled(CHAPA,300); im.paste(ch,((W-ch.width)//2,230),ch); d=ImageDraw.Draw(im)
    track(d,(W//2,470),"P R E S E N T A",f(FB,32),RED,6,"ma")
    lg=scaled(IMPROWM,600); im.paste(lg,((W-lg.width)//2,560),lg); d=ImageDraw.Draw(im)
    track(d,(W//2,H-320),"E S T R E N O",f(FB,34),RED,8,"ma")
    d.text((W//2,H-250),"Viernes 11 de septiembre · 21:15",font=f(FB,44),fill=INK,anchor="ma")
    save(im,"films-1-presenta.jpg")
def f2():
    im=Image.new("RGB",(W,H),NBG); d=ImageDraw.Draw(im)
    rule(d,M,150,130,RED,8); track(d,(M,205),"N U E S T R A   1 ª   S E R I E",f(FB,28),RED,3)
    y=360
    for ln in ["Se filma en","bares reales.","Un capítulo","nuevo cada día."]:
        d.text((M,y),ln,font=f(FB,92),fill=INK); y+=112
    d.text((M,y+40),"Cine espontáneo, hecho con la gente.",font=f(FR,36),fill=NBODY)
    save(im,"films-2-serie.jpg")
def f3():
    im=Image.new("RGB",(W,H),NBG); d=ImageDraw.Draw(im)
    track(d,(M,220),"C O N V O C A T O R I A   D E   L A N Z A M I E N T O",f(FB,26),RED,3)
    y=440
    for ln in ["¿Querés actuar","tu capítulo?"]:
        d.text((M,y),ln,font=f(FB,96),fill=INK); y+=116
    d.text((M,y+40),"Reservás tu función y te llevás tu",font=f(FR,38),fill=NBODY)
    d.text((M,y+92),"escena filmada como cine.",font=f(FR,38),fill=NBODY)
    box=H-240; d.rounded_rectangle([M,box,W-M,box+120],16,fill=(23,23,27)); rule(d,M,box,8,RED,120)
    d.text((M+44,box+30),"Toda la info y reservas",font=f(FR,32),fill=NBODY)
    track(d,(M+44,box+72),"@ E S . I M P R O",f(FB,34),INK,3)
    save(im,"films-3-convocatoria.jpg")
def f4():
    im=cover("crop-barra.jpg",W,H,0.74,2); im=grad(im,W,H,NBG,0.0); d=ImageDraw.Draw(im)
    rule(d,0,0,W,RED,10)
    ch=scaled(CHAPA,230); im.paste(ch,(M,H-ch.height-190),ch); d=ImageDraw.Draw(im)
    y=760
    for ln in ["Empieza","el 11 de septiembre."]:
        d.text((M,y),ln,font=f(FB,84),fill=INK); y+=100
    track(d,(M,H-120),"S E G U Í   @ 2 1 1 5 F I L M S",f(FR,26),NBODY,3)
    save(im,"films-4-seguí.jpg")

# ================= Historias 1080x1920 =================
SW,SH=1080,1920
def es_hist():
    im=cover("crop-barra.jpg",SW,SH,0.6,2); im=grad(im,SW,SH,NAVY,0.34); d=ImageDraw.Draw(im)
    rule(d,0,0,SW,MINT,12)
    lg=scaled(IMPRO,620); im.paste(lg,((SW-lg.width)//2,300),lg); d=ImageDraw.Draw(im)
    track(d,(SW//2,720),"E S T R E N O",f(FB,40),MINT,10,"ma")
    d.text((SW//2,800),"Vie 11 de septiembre",font=f(FB,60),fill=INK,anchor="ma")
    d.text((SW//2,SH//2+120),HORA,font=f(FM,180),fill=INK,anchor="mm")
    d.text((SW//2,SH-460),"Reservá tu función",font=f(FB,52),fill=INK,anchor="ma")
    d.text((SW//2,SH-390),"Funciones desde $25.000 · tapeo incluido",font=f(FR,34),fill=BODY,anchor="ma")
    # pill
    tw=d.textlength("Reservá — link abajo",font=f(FB,36))+88
    d.rounded_rectangle([SW/2-tw/2,SH-300,SW/2+tw/2,SH-224],38,fill=MINT)
    d.text((SW//2,SH-262),"Reservá — link abajo",font=f(FB,36),fill=NAVY,anchor="mm")
    save(im,"es-historia.jpg")
def films_hist():
    im=cover("crop-botellas.jpg",SW,SH,0.72,2); im=grad(im,SW,SH,NBG,0.3); d=ImageDraw.Draw(im)
    rule(d,0,0,SW,RED,12)
    ch=scaled(CHAPA,360); im.paste(ch,((SW-ch.width)//2,320),ch); d=ImageDraw.Draw(im)
    track(d,(SW//2,760),"P R E S E N T A",f(FB,34),RED,6,"ma")
    lg=scaled(IMPROWM,560); im.paste(lg,((SW-lg.width)//2,860),lg); d=ImageDraw.Draw(im)
    d.text((SW//2,SH-560),"Estreno",font=f(FB,60),fill=INK,anchor="ma")
    d.text((SW//2,SH-480),"Vie 11 de septiembre · 21:15",font=f(FB,48),fill=INK,anchor="ma")
    track(d,(SW//2,SH-320),"C O N V O C A T O R I A   →   @ E S . I M P R O",f(FR,32),NBODY,3,"ma")
    save(im,"films-historia.jpg")

for fn in [e1,e2,e3,e4,e5,f1,f2,f3,f4,es_hist,films_hist]: fn()
print("OK",len(os.listdir(OUT)))
