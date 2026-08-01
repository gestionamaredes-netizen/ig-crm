# -*- coding: utf-8 -*-
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("DV","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

W,H=landscape(A4)
BG=colors.HexColor("#0E1017"); INK=colors.white; BODY=colors.HexColor("#C7CBDA")
DIM=colors.HexColor("#8A90A2"); LINE=colors.HexColor("#262B3A"); CARD=colors.HexColor("#161A26")
BASE="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"

def bg(c): c.setFillColor(BG); c.rect(0,0,W,H,fill=1,stroke=0)
def wrap(c,text,x,y,size,font,color,maxw,lead):
    c.setFont(font,size); c.setFillColor(color); line=""
    for w0 in text.split(" "):
        t=(line+" "+w0).strip()
        if pdfmetrics.stringWidth(t,font,size)<=maxw: line=t
        else: c.drawString(x,y,line); y-=lead; line=w0
    if line: c.drawString(x,y,line)
    return y-lead

ACC={"impro":colors.HexColor("#2BE4B0"),"films":colors.HexColor("#E5241F"),
     "fab":colors.HexColor("#4FB8F0"),"jere":colors.HexColor("#F5A83C"),
     "blur":colors.HexColor("#37BEF7")}

c=pdfcanvas.Canvas(BASE+"Calendario-Agosto-2026.pdf",pagesize=landscape(A4))
c.setTitle("Calendario de contenido — Agosto 2026")

# ---------- PAGINA 1: portada + reglas ----------
bg(c)
c.setFillColor(ACC["impro"]); c.rect(0,H-5,W,5,fill=1,stroke=0)
c.setFont("DVB",13); c.setFillColor(DIM); c.drawString(24*mm,H-26*mm,"PLAN DE CONTENIDO")
c.setFont("DVB",40); c.setFillColor(INK); c.drawString(24*mm,H-46*mm,"Calendario · Agosto 2026")
c.setFont("DV",15); c.setFillColor(BODY)
wrap(c,"Cinco cuentas, una misma película. El mes de construir expectativa: el estreno diario a las 21:15 arranca en octubre.",24*mm,H-58*mm,15,"DV",BODY,W-120*mm,20)

# reglas en tres columnas
cols=[
 ("La regla de oro","Cada cuenta tiene UNA voz. El mismo hecho se cuenta distinto en cada una. Las historias se comparten cruzadas el mismo día; el feed nunca repite el mismo video."),
 ("Las voces","@es.impro = la serie · @2115films = la productora · @fabbenok = el creador en público · @jeremiaszarate_ = el director/oficio · @ama.blur = la agencia."),
 ("La cadencia","es.impro 3-4 por semana · 2115films 2-3 · fabbenok 2 · jeremias 1-2 · ama.blur 2. Historias los días de actividad real."),
]
cw=(W-48*mm-16*mm)/3
for i,(t,d) in enumerate(cols):
    x=24*mm+i*(cw+8*mm); y=H-92*mm
    c.setFillColor(CARD); c.roundRect(x,y-46*mm,cw,50*mm,3*mm,fill=1,stroke=0)
    c.setFillColor(ACC["impro"]); c.rect(x,y+4*mm-2,cw,2,fill=1,stroke=0)
    c.setFont("DVB",14); c.setFillColor(INK); c.drawString(x+7*mm,y-4*mm,t)
    wrap(c,d,x+7*mm,y-13*mm,11.5,"DV",BODY,cw-14*mm,16)
c.setFont("DV",11); c.setFillColor(DIM)
c.drawString(24*mm,20*mm,"Objetivo de agosto: dejar los perfiles llenos y con expectativa instalada, para que octubre no arranque de cero.")
c.showPage()

# ---------- PAGINA 2: grilla ----------
bg(c)
c.setFont("DVB",13); c.setFillColor(DIM); c.drawString(24*mm,H-20*mm,"AGOSTO 2026 · SEMANA POR SEMANA")
c.setFont("DVB",22); c.setFillColor(INK); c.drawString(24*mm,H-31*mm,"Qué publica cada cuenta")

x0=24*mm; top=H-40*mm
name_w=40*mm; grid_w=W-48*mm-name_w
colw=grid_w/4
rowh=30*mm; header_h=9*mm

weeks=["Semana 1 (4–10)","Semana 2 (11–17)","Semana 3 (18–24)","Semana 4 (25–31)"]
# header
c.setFillColor(CARD); c.rect(x0,top-header_h,W-48*mm,header_h,fill=1,stroke=0)
c.setFont("DVB",10.5); c.setFillColor(INK)
for j,wk in enumerate(weeks):
    c.drawString(x0+name_w+j*colw+4*mm,top-header_h+3*mm,wk)

rows=[
 ("@es.impro","La serie","impro",[
   ["Fijar 1·Anuncio","2·Qué es","3·21:15","Historias: reservas"],
   ["5·Casting actores","6·Preventa 30","Historia: votá género"],
   ["4·Casting bares","7·Géneros","Avance de preventa"],
   ["Teaser del piloto","'Última semana de preventa'","Countdown en historias"],
 ]),
 ("@2115films","La productora","films",[
   ["Fijar 1·Presentación","3·IMPRO"],
   ["2·Qué hacemos","4·Fundador"],
   ["5·Próximamente","Reel 'cómo funciona una función'"],
   ["Teaser del piloto: claqueta","'El piloto ya se rodó'"],
 ]),
 ("@fabbenok","El creador","fab",[
   ["'Hace años tengo esta idea anotada'"],
   ["El banco de guiones","+1 reel de tu línea mantra"],
   ["'Por qué bares' / la visita a los bares"],
   ["El día del piloto, desde adentro"],
 ]),
 ("@jeremiaszarate_","El director","jere",[
   ["'Me llamaron para dirigir algo que no existía. Dije que sí.'"],
   ["Cómo se ilumina una mesa de bar (antes/después)"],
   ["Prueba técnica: 2 cámaras en una cena real"],
   ["Dirigir a gente que nunca actuó"],
 ]),
 ("@ama.blur","La agencia","blur",[
   ["Fijar 1·Presentación","El homenaje (foto + poema)"],
   ["2·Qué hacemos","1 intervención (reel Aviv Arte)"],
   ["3·Manifiesto","Somos Como Somos"],
   ["4·Contacto","Jam Joint (evento en Cerrito)"],
 ]),
]
y=top-header_h
for name,role,ac,cells in rows:
    y-=rowh
    col=ACC[ac]
    # name cell
    c.setFillColor(CARD); c.roundRect(x0,y+1*mm,name_w-2*mm,rowh-2*mm,2*mm,fill=1,stroke=0)
    c.setFillColor(col); c.rect(x0,y+1*mm,2*mm,rowh-2*mm,fill=1,stroke=0)
    ns=11.5
    while pdfmetrics.stringWidth(name,"DVB",ns)>name_w-10*mm and ns>8.5: ns-=0.5
    c.setFont("DVB",ns); c.setFillColor(INK); c.drawString(x0+6*mm,y+rowh-8*mm,name)
    c.setFont("DV",8.5); c.setFillColor(DIM); c.drawString(x0+6*mm,y+rowh-13*mm,role)
    # week cells
    for j,items in enumerate(cells):
        cx=x0+name_w+j*colw
        c.setStrokeColor(LINE); c.setLineWidth(0.6); c.rect(cx,y,colw,rowh,fill=0,stroke=1)
        yy=y+rowh-6*mm
        for it in items:
            c.setFillColor(col); c.circle(cx+4.2*mm,yy+1.1*mm,0.9*mm,fill=1,stroke=0)
            yy=wrap(c,it,cx+7*mm,yy,8.3,"DV",colors.HexColor("#D6DAE6"),colw-9*mm,10.2)-1.5*mm

c.setFont("DV",9); c.setFillColor(DIM)
c.drawString(26*mm,11*mm,"Cruce: el mismo día, historias compartidas entre las cuentas. El feed nunca repite el mismo video. @jeremiaszarate_ arranca cuando confirme.")
c.showPage()
c.save()
print("OK Calendario-Agosto-2026.pdf")
