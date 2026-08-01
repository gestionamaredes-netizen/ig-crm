# -*- coding: utf-8 -*-
# Historias (1080x1920) para poblar destacadas de @es.impro y @2115films
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

IMGS = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/imgs/"
OUT  = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/historias/"
os.makedirs(OUT, exist_ok=True)
W, H = 1080, 1920
M = 96
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
def f(p, s): return ImageFont.truetype(p, s)

CHAPA = Image.open(IMGS+"logo-2115-new.png").convert("RGBA")
LOGO_TAG = Image.open(IMGS+"logo-impro-blanco-tag.png").convert("RGBA")
LOGO_WM  = Image.open(IMGS+"logo-impro-blanco.png").convert("RGBA")

def scaled(img, w): return img.resize((w, int(img.height*w/img.width)), Image.LANCZOS)

def track(d, xy, text, font, fill, ls=0, anchor="la"):
    x, y = xy
    if ls == 0:
        d.text((x, y), text, font=font, fill=fill, anchor=anchor); return
    total = sum(d.textlength(c, font=font)+ls for c in text)-ls
    if anchor.startswith("m"): x -= total/2
    elif anchor.startswith("r"): x -= total
    for c in text:
        d.text((x, y), c, font=font, fill=fill, anchor="l"+anchor[1])
        x += d.textlength(c, font=font)+ls

def rule(d, x, y, w, c, h=8): d.rectangle([x, y, x+w, y+h], fill=c)

def cover(photo, bg, darken=0.62, blur=2):
    im = Image.open(IMGS+photo).convert("RGB")
    s = max(W/im.width, H/im.height)
    im = im.resize((int(im.width*s), int(im.height*s)), Image.LANCZOS)
    x=(im.width-W)//2; y=(im.height-H)//2
    im = im.crop((x, y, x+W, y+H))
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    return Image.blend(im, Image.new("RGB",(W,H),bg), darken)

def pill(d, cx, y, text, font, fg, bg, padx=44, padh=70):
    w = d.textlength(text, font=font)+padx*2
    d.rounded_rectangle([cx-w/2, y, cx+w/2, y+padh], padh/2, fill=bg)
    d.text((cx, y+padh/2), text, font=font, fill=fg, anchor="mm")
    return padh

def save(im, name):
    im.convert("RGB").save(OUT+name, "JPEG", quality=91); print("·", name)

# ============================ @es.impro ============================
BG=(10,13,28); INK=(245,246,250); BODY=(190,194,208); DIM=(120,126,150)
MINT=(43,228,176); AMBER=(245,168,60); CYAN=(79,198,255); CARD=(21,27,54)

def brand_es(d, col=MINT):
    lw=scaled(LOGO_WM,150); return lw

def es1():  # QUÉ ES
    im=cover("crop-botellas.jpg", BG, 0.68, 3); d=ImageDraw.Draw(im)
    lg=scaled(LOGO_TAG, 560); im.paste(lg,((W-lg.width)//2,300),lg)
    d.text((W//2, 640), "La serie que se filma", font=f(FB,58), fill=INK, anchor="ma")
    d.text((W//2, 712), "en bares reales.", font=f(FB,58), fill=INK, anchor="ma")
    y=980
    for ln in ["Un bar. Dos personas.","Un minuto. Una escena","de cine, improvisada."]:
        d.text((W//2, y), ln, font=f(FR,42), fill=BODY, anchor="ma"); y+=64
    pill(d, W//2, 1560, "Deslizá para saber cómo →", f(FB,34), BG, MINT)
    save(im,"es-1-que-es.jpg")

def es2():  # CÓMO JUGAR
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    rule(d, M, 250, 120, MINT, 8)
    track(d,(M,300),"C Ó M O   J U G A R", f(FB,34), MINT, 5)
    steps=[("1","Reservás tu función en el bar."),
           ("2","Elegís un guion disparador."),
           ("3","Actuás la escena. Un minuto."),
           ("4","Dos cámaras te filman."),
           ("5","Tu capítulo sale a las 21:15.")]
    y=470
    for n,t in steps:
        d.ellipse([M, y, M+72, y+72], outline=MINT, width=5)
        d.text((M+36, y+36), n, font=f(FB,40), fill=MINT, anchor="mm")
        d.text((M+108, y+36), t, font=f(FR,40), fill=INK, anchor="lm")
        y+=176
    lw=scaled(LOGO_WM,150); im.paste(lw,(M,H-190),lw)
    save(im,"es-2-como-jugar.jpg")

def es3():  # GÉNEROS
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    track(d,(W//2,320),"E L   U N I V E R S O", f(FB,34), MINT, 6, "ma")
    d.text((W//2,420),"5 géneros.", font=f(FB,72), fill=INK, anchor="ma")
    d.text((W//2,510),"Historias de todos.", font=f(FB,72), fill=INK, anchor="ma")
    y=760
    for g in ["COMEDIA","DRAMA","THRILLER","ROMANCE","MISTERIO"]:
        d.rounded_rectangle([M,y,W-M,y+118],18,fill=CARD)
        d.text((W//2,y+59),g,font=f(FB,50),fill=INK,anchor="mm"); y+=140
    save(im,"es-3-generos.jpg")

def es4():  # BARES
    im=cover("crop-barra.jpg", BG, 0.66, 2); d=ImageDraw.Draw(im)
    rule(d,0,0,W,AMBER,12)
    track(d,(M,170),"¿ T E N É S   U N   B A R ?", f(FB,36), AMBER, 3)
    y=1120
    d.text((M,y),"Puede ser", font=f(FB,96), fill=INK)
    d.text((M,y+112),"un set de cine.", font=f(FB,96), fill=INK)
    d.text((M,y+280),"Rodamos en tu horario muerto.", font=f(FR,42), fill=BODY)
    d.text((M,y+340),"Vos sumás noche, nosotros cámaras.", font=f(FR,42), fill=BODY)
    pill(d, M+ (W-2*M)//2, H-260, "Escribinos por DM", f(FB,36), BG, AMBER)
    save(im,"es-4-bares.jpg")

def es5():  # CASTING
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    rule(d,M,250,120,MINT,8)
    track(d,(M,300),"C A S T I N G   A B I E R T O", f(FB,34), MINT, 3)
    y=520
    for ln,col in [("¿Actuarías",INK),("una escena",INK),("con un",INK),("desconocido?",MINT)]:
        d.text((M,y),ln,font=f(FB,104),fill=col); y+=126
    d.text((M,y+50),"No hace falta ser actor.", font=f(FR,44), fill=BODY)
    d.text((M,y+112),"Un minuto y quedás en cámara.", font=f(FR,44), fill=BODY)
    pill(d, M+(W-2*M)//2, H-280, "Postulate por DM", f(FB,36), BG, MINT)
    save(im,"es-5-casting.jpg")

def es6():  # RESERVAS
    im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im)
    rule(d,M,250,120,CYAN,8)
    track(d,(M,300),"P R E V E N T A   ·   T 1", f(FB,34), CYAN, 3)
    y=470
    for ln,col in [("Sé uno de",INK),("los primeros",INK),("30 capítulos.",CYAN)]:
        d.text((M,y),ln,font=f(FB,100),fill=col); y+=124
    d.text((M,y+50),"Reservás tu función y actuás", font=f(FR,44), fill=BODY)
    d.text((M,y+112),"tu escena. Cuando llegamos", font=f(FR,44), fill=BODY)
    d.text((M,y+174),"a 30, arranca la serie.", font=f(FR,44), fill=BODY)
    # barra
    by=y+330; bw=W-2*M
    d.rounded_rectangle([M,by,M+bw,by+28],14,fill=CARD)
    d.rounded_rectangle([M,by,M+int(bw*0.06),by+28],14,fill=CYAN)
    d.text((M,by-56),"0 de 30 reservadas", font=f(FB,36), fill=INK)
    pill(d, M+bw//2, H-280, "Reservá — link en bio", f(FB,36), BG, CYAN)
    save(im,"es-6-reservas.jpg")

# ============================ @2115films ============================
NBG=(10,10,12); NINK=(245,245,247); NBODY=(176,178,184); RED=(229,36,31); NCARD=(23,23,27)

def tf1():  # PRODUCTORA / bienvenida
    im=cover("crop-botellas.jpg", NBG, 0.74, 3); d=ImageDraw.Draw(im)
    ch=scaled(CHAPA,520); im.paste(ch,((W-ch.width)//2,560),ch)
    d.text((W//2,1000),"Cine en formato corto.", font=f(FB,56), fill=NINK, anchor="ma")
    track(d,(W//2,1078),"C U A N D O   C A E   L A   N O C H E", f(FR,32), RED, 4, "ma")
    d.text((W//2,1300),"Una productora nacida", font=f(FR,40), fill=NBODY, anchor="ma")
    d.text((W//2,1354),"en Zona Oeste.", font=f(FR,40), fill=NBODY, anchor="ma")
    save(im,"tf-1-productora.jpg")

def tf2():  # IMPRO
    im=Image.new("RGB",(W,H),NBG); d=ImageDraw.Draw(im)
    track(d,(M,330),"N U E S T R O   P R I M E R   P R O Y E C T O", f(FB,30), (120,120,128), 3)
    d.text((M,430),"IMPRO", font=f(FB,240), fill=RED)
    rule(d,M,720,W-2*M,(34,34,40),4)
    d.text((M,810),"La serie que se filma", font=f(FB,62), fill=NINK)
    d.text((M,888),"en bares reales.", font=f(FB,62), fill=NINK)
    d.text((M,1030),"Un capítulo nuevo cada día, 21:15.", font=f(FR,44), fill=NBODY)
    box_y=1300
    d.rounded_rectangle([M,box_y,W-M,box_y+130],18,fill=NCARD)
    rule(d,M,box_y,8,RED,130)
    d.text((M+48,box_y+34),"Seguí la serie", font=f(FR,36), fill=NBODY)
    track(d,(M+48,box_y+80),"@ E S . I M P R O", f(FB,40), NINK, 3)
    save(im,"tf-2-impro.jpg")

def tf3():  # CONTACTO
    im=Image.new("RGB",(W,H),NBG); d=ImageDraw.Draw(im)
    rule(d,M,330,120,RED,8)
    track(d,(M,380),"H A B L E M O S", f(FB,34), RED, 4)
    y=560
    for ln in ["¿Una historia?","¿Una marca con","una historia?"]:
        d.text((M,y),ln,font=f(FB,92),fill=NINK); y+=112
    d.text((M,y+60),"Producimos ficción, series en vivo", font=f(FR,42), fill=NBODY)
    d.text((M,y+120),"y contenido de marca con cine.", font=f(FR,42), fill=NBODY)
    box_y=H-520
    for lbl,val in [("Instagram","@2115films"),("Creador","@fabbenok"),("Dirección","@jeremiaszarate_")]:
        d.rounded_rectangle([M,box_y,W-M,box_y+120],16,fill=NCARD)
        d.text((M+44,box_y+60),lbl,font=f(FR,34),fill=NBODY,anchor="lm")
        track(d,(W-M-44,box_y+60),val,f(FB,38),NINK,2,"rm")
        box_y+=140
    save(im,"tf-3-contacto.jpg")

for fn in [es1,es2,es3,es4,es5,es6,tf1,tf2,tf3]:
    fn()
print("\nOK", len(os.listdir(OUT)))
