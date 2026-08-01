# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
IMGS=DASH+"imgs/"; OUT=DASH+"posts2115/"
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def f(p,s): return ImageFont.truetype(p,s)
W,Hp=1080,1350
NBG=(10,10,12); NINK=(245,245,247); NBODY=(176,178,184); RED=(229,36,31)
def track(d,xy,t,fn,fl,ls=0,anchor="la"):
    x,y=xy
    if ls==0: d.text((x,y),t,font=fn,fill=fl,anchor=anchor); return
    tot=sum(d.textlength(c,font=fn)+ls for c in t)-ls
    if anchor.startswith("m"): x-=tot/2
    elif anchor.startswith("r"): x-=tot
    for c in t:
        d.text((x,y),c,font=fn,fill=fl,anchor="l"+anchor[1]); x+=d.textlength(c,font=fn)+ls

im=Image.new("RGB",(W,Hp),NBG)
ph=Image.open(IMGS+"founder-crop.jpg").convert("RGB")
s=W/ph.width; ph=ph.resize((W,int(ph.height*s)),Image.LANCZOS)
ph_h=ph.height
im.paste(ph,(0,0))
# gradiente al negro en la parte baja de la foto
gh=300; start=ph_h-gh
mask=Image.new("L",(W,ph_h),0); mm=mask.load()
for yy in range(ph_h):
    a=0 if yy<start else int(((yy-start)/gh)*255)
    for xx in range(W): mm[xx,yy]=a
im.paste(Image.new("RGB",(W,ph_h),NBG),(0,0),mask)
d=ImageDraw.Draw(im)
track(d,(90,ph_h-120),"F U N D A D O R   ·   P R O D U C T O R",f(FB,26),RED,3)
d.text((90,ph_h-58),"Benjamín Ortega",font=f(FB,76),fill=NINK)
y=ph_h+58
lines=[("Productor y creador de contenido audiovisual.",NBODY),
       ("Dirige la agencia creativa Blur — @ama.blur.",NINK),
       ("Formándose en la Tecnicatura en Artes",NBODY),
       ("Audiovisuales (UNLaM) y la Licenciatura en",NBODY),
       ("Creación de Contenido Audiovisual (UMET).",NBODY)]
for ln,col in lines:
    d.text((90,y),ln,font=f(FR,34),fill=col); y+=52
d.text((90,y+30),"Nacido en Isidro Casanova, radicado en Buenos Aires.",font=f(FR,32),fill=NBODY)
track(d,(90,Hp-120),"@ F A B B E N O K",f(FB,32),NINK,3)
im.save(OUT+"4-fundador.jpg","JPEG",quality=92)
# check widths
dd=ImageDraw.Draw(Image.new("RGB",(10,10)))
for ln,_ in lines:
    print(int(dd.textlength(ln,font=f(FR,34))), ln)
print(int(dd.textlength("Nacido en Isidro Casanova, radicado en Buenos Aires.",font=f(FR,32))),"loc | util 900")
print("OK ph_h",ph_h)
