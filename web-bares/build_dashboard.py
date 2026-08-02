# -*- coding: utf-8 -*-
import json, re, base64, io
from PIL import Image
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
OUT="/home/user/ig-crm/web-bares/"
import os; os.makedirs(OUT, exist_ok=True)

def b64(path, maxw):
    im=Image.open(path).convert("RGBA")
    if im.width>maxw: im=im.resize((maxw,int(im.height*maxw/im.width)),Image.LANCZOS)
    bf=io.BytesIO(); im.save(bf,"PNG")
    return "data:image/png;base64,"+base64.b64encode(bf.getvalue()).decode()

IMPRO=b64(DASH+"imgs/logo-impro-blanco.png",600)
CHAPA=b64(DASH+"imgs/logo-2115-new.png",420)

DATA=[
("Ramos Mejía","La Matanza",[
 ("Rabieta Ramos Mejía","Cervecería artesanal","Necochea 115","@rabieta.ramosmejia","—","011 2157-0445","Cadena grande: salón + patio + terraza; abre hasta la madrugada los fines de semana."),
 ("Mr Jones Blues Pub","Pub rock/blues","Saavedra 399 (esq. Necochea)","@mjpub","info@mrjoneslive.com","+54 11 4469-1997","Música en vivo, ambiente oscuro de bar clásico. Muy fílmico."),
 ("Dubbel","Cervecería / resto-bar","Av. San Martín 1770","@dubbelcerveceria","—","—","Shows, karaoke y noches temáticas vie/sáb. Salón amplio."),
 ("Prinston","Cervecería / bar","Mariano Moreno 272","@cerveceriaprinston","—","—","Pub-cervecería con cocina; onda pub, mesas y buen fondo de barra."),
 ("Container Bar","Resto-bar / cervecería","Necochea 953","@containerbarok","—","+54 11 2722-7043","Estética container industrial; hasta las 03:00. Muy visual."),
 ("Cheka Ramos","Bar / resto-bar","Av. Leandro N. Alem 267","@cheka_ramos_mejia","cheka.ramos0k@gmail.com","011 5860-7728","Salón grande, fuerte presencia local (40k IG)."),
 ("Valinor – The Irish Pub","Pub irlandés","Av. Rivadavia 14802","@valinor.irishbar","info@valinorbar.com.ar","+54 11 4654-3130","Bandas en vivo casi todas las noches + after office."),
 ("Rotterdam Cervecería","Cervecería","Av. Presidente Perón 193","@rotterdamcerveceria","consultas@cerveceriarotterdam.com.ar","+54 11 2591-6700","Carta propia, salón de mesas, pleno centro."),
]),
("San Justo","La Matanza",[
 ("Copper","Cervecería / bar","Comisionado José Indart 2620","@coppercerveceria","—","+54 11 6541-8031","Salón amplio; mar-dom desde las 18 h. Luz cálida y barra."),
 ("Bar A – Cerveza Artesanal","Cervecería","Comisionado José Indart 2285","@barasanjusto","—","+54 11 3204-9310","Artesanal, picadas y pizzas. Corredor nocturno de Indart."),
 ("Quimérico","Resto-bar","Comisionado José Indart 2632","@quimericosanjusto","—","—","Resto-bar-cafetería. Misma cuadra que Copper."),
 ("La Josefa Resto","Resto-bar (cena show)","Comisionado José Indart 2564","@lajosefa.resto","—","011 3838-9834","Salón grande con escenario, DJ y shows. Pensado para noche."),
 ("Mercia Cervecería","Cervecería","Av. Presidente Perón 2775","@merciacerveceria","—","+54 11 3179-5495","Artesanal con cocina; bar con mesas sobre Av. Perón."),
 ("Complejo Santa Birra","Cervecería (cena show)","Av. Pte. J. D. Perón 3450","@santabirra.argentina","—","+54 11 5037-4005","El más grande: cena show, bandas y karaoke, hasta la madrugada."),
 ("Juanita Resto Bar","Resto-bar","— (confirmar por DM)","@juanita_resto_san_justo_","—","—","Carta de bar clásico de noche. Falta dirección pública."),
 ("Juanchos Cervecería","Cervecería","— (sin altura pública)","IG sin confirmar","—","—","Aparece en guías; datos flojos, chequear en persona."),
]),
("Isidro Casanova","La Matanza",[
 ("Raíz Cervecería","Cervecería / resto-bar","República de Portugal 2853","@raizcerveceria","—","+54 11 3597-5270","Primera del barrio; barra cálida, mesas dentro y en la vereda."),
 ("Montana Bar","Bar cultural / rockería","República de Portugal 3214","@montana_bar_casanova","—","—","Cantobar con escenario y bandas. Estética rockera."),
 ("La Birra es Bella","Bar cultural / cervecería","República de Portugal 2620","@labirraesbellabar","—","+54 11 7635-0265","Grande, muchas canillas, al aire libre; hasta las 03."),
 ("La Previa Resto Bar","Resto-bar con shows","Av. J. M. de Rosas 6655","@lapreviacasanova","—","+54 11 6486-2430","Escenario activo; mesas + tarima. Netamente nocturno."),
 ("Patio Santiagueño","Peña / resto-bar (shows)","Av. Cristianía 3049","@patiosantiague","—","—","Salón amplio con escenario; folklore/cumbia en vivo."),
 ("Clapton Bar","Bar","— (altura sin confirmar)","IG sin confirmar","—","—","Lead: figura en guías, sin datos completos. Chequear en Maps."),
]),
("Morón","Morón",[
 ("Prego Bistró & Bar","Resto-bar (italiana)","9 de Julio 402","@prego.bistro","—","+54 11 3905-3015","Salón amplio, luz cálida; hasta 1-2 AM."),
 ("The Laundry Garage","Resto-bar / burger","Bartolomé Mitre 724","@laundrygarage_","—","+54 11 4489-0278","Deco temática, música, clima nocturno. Muy fotogénico."),
 ("Prinston Morón","Cervecería / pub","Bartolomé Mitre 998","@prinstonmoron","—","+54 11 6079-9694","Birra artesanal; salón con energía de noche."),
 ("El Desembarco (Morón)","Cervecería / burgers","Belgrano 410","@eldesembarcook","—","011 3646-7089","Hasta 00:30-01:30; salón grande y concurrido."),
 ("Sarria Cervecería","Cervecería artesanal","Mendoza 355","@sarriamoron","—","+54 11 2335-5715","Pionera de la birra en Morón; jue-sáb desde 19 h."),
 ("FANO Beer & Burgers","Cervecería / resto-bar","Cnel. Machado 901","@fanobar","—","+54 11 3088-2099","De café a bar; vie-sáb hasta 3 AM, birra tirada."),
 ("Baum Morón","Cervecería artesanal","25 de Mayo 599","@baummoron","—","011 7500-6227","Salón amplio con onda de after; mesas y barra."),
 ("Blest Morón","Cervecería / pub","Ntra. Sra. del Buen Viaje 375","@blestmoron","—","+54 9 11 6812-5228","Happy hour y horario extendido; birrero clásico."),
 ("Hormiga Negra (Morón)","Cervecería / pub","25 de Mayo 651","@hormiganegra.ar","—","+54 11 3818-7364","Tres ambientes con música; hasta 1-2 AM. Mucho espacio."),
]),
("Castelar","Morón",[
 ("Ribbon Bar","Cervecería / taberna","Av. Santa Rosa 1327","@ribbonbar","—","—","'La taberna más famosa'; hasta las 02 (finde 04)."),
 ("La Casa Bar","Resto-bar / cervecería","Santa Rosa 1099 (lado Morón)","@lacasabar_","—","—","Restaurante + bar concurrido, salón amplio."),
 ("RYU Castelar","Bar / cocktail bar","Santa Rosa 1001","@ryu.castelar","—","—","Coctelería con música y fechas. Estética oscura."),
 ("CHEKA Castelar","Cervecería / bar","Av. Santa Rosa 1152 (borde Ituzaingó)","@cheka_castelar","—","011 3138-1399","Cerveza tirada, baile hasta la madrugada (53k IG)."),
 ("Lobo Castelar","Resto-bar (cena show)","— (dirección sin confirmar)","@loboesta.castelar","—","011 2353-7070","Cena-show en vivo jue-sáb; escenario."),
 ("Piccolo Castelar","Bar / cervecería","Arias 2368 (centro)","IG sin confirmar","—","011 3387-3167","En el centro (no Santa Rosa). Locación clara en Morón."),
 ("Paul's Rooftop Bar","Rooftop / resto-bar","Santa Rosa ~1100 (dom. en Ituzaingó)","@paulsbuenosaires","—","—","Terraza en altura con luces de noche."),
 ("The Tower Beer House","Cervecería temática","Lavalleja 40, Ituzaingó","@thetower.beerhouse","thetowerbeer@gmail.com","+54 11 2174-4918","Réplica Torre Eiffel; ambiente nocturno fotogénico."),
]),
("Ituzaingó","Ituzaingó",[
 ("Nob3l","Coctelería de autor","Martín Fierro 3290, Parque Leloir","@nob3lbar","—","+54 11 5934-1321","Rooftop 3º piso con vista + sala íntima. Muy cinematográfico."),
 ("Temple Parque Leloir","Resto-bar / boliche","Martín Fierro 3063, Parque Leloir","@templeparqueleloir","—","—","Pista arriba los fines de semana + DJ. Espacio grande."),
 ("Pompeya Leloir","Resto-bar / cervecería","Martín Fierro 2997, Parque Leloir","@pompeyaleloir","—","—","Living + galería + patio cervecero. Varios ambientes."),
 ("Baum Parque Leloir","Cervecería artesanal","Martín Fierro 3290, Parque Leloir","@baumleloir","—","+54 11 2366-2641","Birra de tirador, clima distendido. Barra y chopp."),
 ("Red Devil Ituzaingó","Cervecería / resto-bar","General Mansilla 757","@reddevil.restobar","—","—","Rústico + neón, 12 canillas; ciertas noches DJ."),
 ("El Jardín Resto & Bar","Resto-bar","Juncal 121 (centro)","@eljardinituzaingo","dejuanaeljardin@gmail.com","+54 11 3955-4187","Patio grande y deco de arte; hasta la madrugada."),
 ("La Pava","Resto-bar / parrilla","Santa Rosa 1250","@lapavaituzaingo","—","+54 11 4661-0002","Salón amplio, hasta medianoche/01. Escenas de mesa."),
 ("Azahares Restaurante & Bar","Resto-bar / parrilla","Av. Presidente Perón 7609, Parque Leloir","IG sin confirmar","—","+54 11 7607-8040","Cenas show los fines de semana; escenario y mesas."),
]),
]

def ig_url(ig):
    m=re.search(r'@([A-Za-z0-9._]+)', ig)
    return "https://instagram.com/"+m.group(1) if m else None
def mail_url(mail):
    m=re.search(r'[\w.\-]+@[\w.\-]+\.\w+', mail)
    return "mailto:"+m.group(0) if m else None
def wa_url(tel):
    chunk=tel.split("/")[0]
    d=re.sub(r'\D','',chunk)
    if len(d)<8: return None
    if d.startswith("54"): pass
    elif d.startswith("0"): d="54"+d[1:]
    else: d="54"+d
    return "https://wa.me/"+d

records=[]; idx=0
for pri,(loc,part,rows) in enumerate(DATA,1):
    for (nombre,tipo,direc,ig,mail,tel,nota) in rows:
        records.append({"id":"b%d"%idx,"pri":pri,"loc":loc,"partido":part,"nombre":nombre,
            "tipo":tipo,"dir":direc,"ig":ig,"igUrl":ig_url(ig),"mail":mail if mail!="—" else "",
            "mailUrl":mail_url(mail),"tel":tel if tel!="—" else "","telUrl":wa_url(tel),"nota":nota})
        idx+=1

DATA_JSON=json.dumps(records, ensure_ascii=False)
LOCS=json.dumps([loc for loc,_,_ in DATA], ensure_ascii=False)

SUPA_URL="https://srqmusknvxenjuldasvp.supabase.co"
SUPA_KEY="sb_publishable_Cufb8u2V0LRHh0FfqhHcig_xuZaaw1W"

TPL=open(DASH+"dashboard_template.html",encoding="utf-8").read()
html=(TPL.replace("__DATA__",DATA_JSON).replace("__LOCS__",LOCS)
        .replace("__IMPRO__",IMPRO).replace("__CHAPA__",CHAPA)
        .replace("__SUPA_URL__",SUPA_URL).replace("__SUPA_KEY__",SUPA_KEY))
open(OUT+"index.html","w",encoding="utf-8").write(html)
print("OK dashboard ·",len(records),"bares ·",round(len(html)/1024),"kb")
