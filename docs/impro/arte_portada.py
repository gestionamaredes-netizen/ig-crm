# -*- coding: utf-8 -*-
# Portada diseñada para "El arte de encontrarse" (branding Blur, motivo espejo)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
W,H=1200,820
BG=(8,9,13); INK=(238,244,250); CYAN=(58,186,246); DIM=(120,130,150)
FB="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FI="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
def f(p,s): return ImageFont.truetype(p,s)
LOGO=Image.open(DASH+"imgs/blur-logo.png").convert("RGBA")
def scaled(im,w): return im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)

im=Image.new("RGB",(W,H),BG)
# glow
g=Image.new("RGB",(W,H),BG); gd=ImageDraw.Draw(g)
gd.ellipse([W//2-360,-120,W//2+360,460],fill=(14,36,64)); g=g.filter(ImageFilter.GaussianBlur(180))
im=Image.blend(im,g,0.8)
d=ImageDraw.Draw(im)

def ctext(y,txt,fnt,fill):
    d.text((W//2,y),txt,font=fnt,fill=fill,anchor="ma")

# kicker
kf=f(FB,26); ks="P I E Z A   A U D I O V I S U A L"
# tracked centered
def tracked(cy,txt,fnt,fill,ls):
    tot=sum(d.textlength(c,font=fnt)+ls for c in txt)-ls
    x=W/2-tot/2
    for c in txt:
        d.text((x,cy),c,font=fnt,fill=fill,anchor="lm"); x+=d.textlength(c,font=fnt)+ls
tracked(150,"A V I V   A R T E   ×   B L U R",f(FB,24),CYAN,4)

# titulo (dos lineas) centrado
t1,t2="El arte de","encontrarse"
tf=f(FB,92)
ctext(210,t1,tf,INK)
ctext(300,t2,tf,INK)

# linea espejo
my=440
d.line([W//2-300,my,W//2+300,my],fill=(40,70,100),width=2)

# reflejo (copia flipada y desvanecida de las dos lineas)
refl=Image.new("RGBA",(W,220),(0,0,0,0)); rd=ImageDraw.Draw(refl)
rd.text((W//2, 10),t1,font=tf,fill=(210,220,235,255),anchor="ma")
rd.text((W//2,100),t2,font=tf,fill=(210,220,235,255),anchor="ma")
refl=refl.transpose(Image.FLIP_TOP_BOTTOM)
# mascara de desvanecimiento
mask=Image.new("L",(W,220),0); md=mask.load()
for yy in range(220):
    a=int(max(0, 70*(1-yy/150)))
    for xx in range(W): md[xx,yy]=a
refl.putalpha(Image.composite(refl.split()[3], Image.new("L",(W,220),0), mask))
im.paste(refl,(0,my+8),refl)
d=ImageDraw.Draw(im)

# quote
tracked(660,"« El reflejo que ves hoy es lo que nunca se rindió »",f(FI,26),DIM,1)

# logo
lg=scaled(LOGO,150); im.paste(lg,(W-lg.width-46,H-lg.height-40),lg)

im.convert("RGB").save(DASH+"blurmedia/arte-portada.jpg","JPEG",quality=92)
print("OK arte-portada")
