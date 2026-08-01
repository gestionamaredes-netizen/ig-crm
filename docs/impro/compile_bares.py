# -*- coding: utf-8 -*-
import csv, os
OUT="/home/user/ig-crm/docs/impro/"

# (localidad, [ (nombre,tipo,direccion,ig,mail,tel,nota) ... ])
DATA=[
("Ramos Mejía", "La Matanza", [
 ("Rabieta Ramos Mejía","Cervecería artesanal","Necochea 115","@rabieta.ramosmejia","—","011 2157-0445","Cadena grande: salón + patio + terraza; abre hasta la madrugada los fines de semana. Mucho volumen de gente."),
 ("Mr Jones Blues Pub","Pub rock/blues","Saavedra 399 (esq. Necochea)","@mjpub","info@mrjoneslive.com","+54 11 4469-1997","Música en vivo, ambiente oscuro de bar clásico. Muy fílmico para escenas con banda."),
 ("Dubbel","Cervecería / resto-bar","Av. San Martín 1770","@dubbelcerveceria","—","— (tel. inconsistente entre fuentes)","Shows, karaoke y noches temáticas vie/sáb. Salón amplio, ambiente movido."),
 ("Prinston","Cervecería / bar","Mariano Moreno 272","@cerveceriaprinston","—","—","Pub-cervecería con cocina; onda pub, mesas y buen fondo de barra."),
 ("Container Bar","Resto-bar / cervecería","Necochea 953","@containerbarok","—","+54 11 2722-7043","Estética container industrial, cócteles; hasta las 03:00. Muy visual."),
 ("Cheka Ramos","Bar / resto-bar","Av. Leandro N. Alem 267","@cheka_ramos_mejia","cheka.ramos0k@gmail.com","4654-8071 / 11 5860-7728","Salón grande, fuerte presencia local (40k IG). Onda de encuentro nocturno."),
 ("Valinor – The Irish Pub","Pub irlandés","Av. Rivadavia 14802","@valinor.irishbar","info@valinorbar.com.ar","+54 11 4654-3130","Bandas en vivo casi todas las noches + after office. Ambientación cálida."),
 ("Rotterdam Cervecería","Cervecería","Av. Presidente Perón 193","@rotterdamcerveceria","consultas@cerveceriarotterdam.com.ar","+54 11 2591-6700","Carta propia, salón de mesas, pleno centro de Ramos."),
]),
("San Justo", "La Matanza", [
 ("Copper","Cervecería / bar","Comisionado José Indart 2620","@coppercerveceria","—","+54 11 6541-8031","Salón amplio; mar-dom desde las 18 h. Luz cálida y barra."),
 ("Bar A – Cerveza Artesanal","Cervecería","Comisionado José Indart 2285","@barasanjusto","—","+54 11 3204-9310","Artesanal, picadas y pizzas. Sobre el corredor nocturno de Indart."),
 ("Quimérico","Resto-bar","Comisionado José Indart 2632","@quimericosanjusto","—","— (reservas por DM/WhatsApp)","Resto-bar-cafetería, buen caudal de noche. Misma cuadra que Copper."),
 ("La Josefa Resto","Resto-bar (cena show)","Comisionado José Indart 2564","@lajosefa.resto","—","011 4441-1813 / WhatsApp 11 3838-9834","Salón grande climatizado con escenario, DJ y shows. Pensado para noche."),
 ("Mercia Cervecería","Cervecería","Av. Presidente Perón 2775","@merciacerveceria (sin confirmar)","—","+54 11 3179-5495","Artesanal con cocina; formato bar con mesas sobre Av. Perón."),
 ("Complejo Santa Birra","Cervecería / complejo (cena show)","Av. Pte. J. D. Perón 3450","@santabirra.argentina","—","+54 11 5037-4005","El más grande: cena show, bandas y karaoke, hasta la madrugada. Mucho espacio."),
 ("Juanita Resto Bar","Resto-bar","— (confirmar por DM)","@juanita_resto_san_justo_","—","—","Carta de bar clásico de noche. Falta dirección pública."),
 ("Juanchos Cervecería Artesanal","Cervecería","— (sin altura pública)","IG sin confirmar (FB: /juanchosbeerok)","—","—","Aparece en guías; datos de contacto flojos, chequear en persona."),
]),
("Isidro Casanova", "La Matanza", [
 ("Raíz Cervecería","Cervecería / resto-bar","República de Portugal 2853","@raizcerveceria","—","+54 11 3597-5270","Primera cervecería del barrio; barra cálida, mesas dentro y en la vereda. Miér-dom desde 18 h."),
 ("Montana Bar","Bar cultural / rockería","República de Portugal 3214","@montana_bar_casanova","—","—","Cantobar con escenario y bandas. Estética rockera, escenas con público."),
 ("La Birra es Bella","Bar cultural / cervecería","República de Portugal 2620","@labirraesbellabar","—","+54 11 7635-0265","Grande, muchas canillas, espacio al aire libre sobre la plaza; hasta las 03."),
 ("La Previa Resto Bar","Resto-bar con shows","Av. J. M. de Rosas 6655 (esq. Rep. de Portugal)","@lapreviacasanova","—","+54 11 6486-2430","Escenario activo de la escena rockera; mesas + tarima. Netamente nocturno."),
 ("Patio Santiagueño (El Mito de I. Casanova)","Peña / resto-bar con shows","Av. Cristianía 3049","@patiosantiague","—","—","Salón amplio con escenario; folklore/cumbia en vivo. Plano abierto con público."),
 ("Clapton Bar","Bar","— (altura sin confirmar)","IG sin confirmar","—","—","Lead: figura en RestaurantGuru, sin datos completos. Chequear en Maps."),
]),
("Morón", "Morón", [
 ("Prego Bistró & Bar","Resto-bar (italiana)","9 de Julio 402","@prego.bistro","—","+54 11 3905-3015","Salón amplio, luz cálida; abierto hasta 1-2 AM. Buen ambiente de mesas."),
 ("The Laundry Garage","Resto-bar / burger & beer","Bartolomé Mitre 724","@laundrygarage_","—","+54 11 4489-0278","Deco temática vibrante, música, clima nocturno. Muy fotogénico."),
 ("Prinston Morón","Cervecería / pub","Bartolomé Mitre 998","@prinstonmoron","—","+54 11 6079-9694","Birra artesanal desde 17:30; salón con energía de bar de noche."),
 ("El Desembarco (Morón)","Cervecería / hamburguesería","Belgrano 410","@eldesembarcook (marca)","—","011 3646-7089","Hasta 00:30-01:30; salón grande y concurrido. (IG del local sin confirmar aparte)"),
 ("Sarria Cervecería","Cervecería artesanal","Mendoza 355","@sarriamoron","—","+54 11 2335-5715","Pionera de la birra artesanal en Morón; jue-sáb desde 19 h."),
 ("FANO Beer & Burgers","Cervecería / resto-bar","Cnel. Machado 901","@fanobar","—","+54 11 3088-2099","De café a bar nocturno; vie-sáb hasta 3 AM, birra tirada."),
 ("Baum Morón","Cervecería artesanal","25 de Mayo 599","@baummoron","—","011 7500-6227","Salón amplio con onda de after; mesas y barra ideales para escenas."),
 ("Blest Morón","Cervecería / pub","Ntra. Sra. del Buen Viaje 375","@blestmoron","—","+54 9 11 6812-5228","Happy hour y horario extendido; ambiente birrero clásico con mesas."),
 ("Cervecería Hormiga Negra (Morón)","Cervecería / pub","25 de Mayo 651","@hormiganegra.ar (marca)","—","+54 11 3818-7364","Tres ambientes con música; hasta 1-2 AM. Mucho espacio para filmar."),
]),
("Castelar", "Morón", [
 ("Ribbon Bar","Cervecería / taberna","Av. Santa Rosa 1327","@ribbonbar","—","—","'La taberna más famosa'; hasta las 02 (finde 04). Ambiente cerrado, mucha mesa."),
 ("La Casa Bar","Resto-bar / cervecería","Santa Rosa 1099 (lado Morón)","@lacasabar_","—","—","Restaurante + bar concurrido, salón amplio. Punto de encuentro nocturno."),
 ("RYU Castelar","Bar / cocktail bar","Santa Rosa 1001","@ryu.castelar","—","—","Coctelería con música y fechas (DJ/shows). Estética oscura, muy filmable."),
 ("CHEKA Castelar","Cervecería / bar","Av. Santa Rosa 1152 (borde con Ituzaingó)","@cheka_castelar","—","011 3138-1399","Cerveza tirada, baile hasta la madrugada. Mucho volumen (53k IG)."),
 ("Lobo Castelar","Resto-bar (cena show)","— (dirección sin confirmar)","@loboesta.castelar","—","11-2353-7070","Cena-show en vivo jue-sáb desde 18:30; escenario."),
 ("Piccolo Castelar","Bar / cervecería","Arias 2368 (centro — Morón puro)","IG sin confirmar","—","11-3387-3167","En el centro de Castelar (no sobre Santa Rosa). Locación claramente en Morón."),
 ("Paul's Rooftop Bar","Rooftop / resto-bar","Santa Rosa ~1100 (domicilio formal en Ituzaingó)","@paulsbuenosaires","—","—","Terraza en altura con luces de noche. Buen plano de rooftop."),
 ("The Tower Beer House","Cervecería temática","Lavalleja 40, Ituzaingó (pegado a Castelar)","@thetower.beerhouse","thetowerbeer@gmail.com","+54 11 2174-4918","Réplica Torre Eiffel; ambiente nocturno fotogénico. Alternativa cercana."),
]),
("Ituzaingó", "Ituzaingó", [
 ("Nob3l","Bar / coctelería de autor","Martín Fierro 3290, Parque Leloir","@nob3lbar","—","+54 11 5934-1321","Rooftop en 3º piso con vista + sala íntima ('el LAB'). Muy cinematográfico."),
 ("Temple Parque Leloir","Resto-bar / boliche","Martín Fierro 3063, Parque Leloir","@templeparqueleloir","—","—","Pista arriba los fines de semana + DJ. Espacio grande para plano de gente."),
 ("Pompeya Leloir","Resto-bar / cervecería","Martín Fierro 2997 (Complejo Solaria, loc. 10), Parque Leloir","@pompeyaleloir","—","—","Living + galería + patio cervecero al aire libre. Varios ambientes."),
 ("Baum Parque Leloir","Cervecería artesanal","Martín Fierro 3290, Parque Leloir","@baumleloir","—","+54 11 2366-2641","Birra de tirador, clima distendido. Buena para barra y chopp."),
 ("Red Devil Ituzaingó","Cervecería / resto-bar","General Mansilla 757","@reddevil.restobar","—","—","Rústico + luces neón, 12 canillas; ciertas noches DJ. Estética fuerte."),
 ("El Jardín Resto & Bar","Resto-bar","Juncal 121 (centro)","@eljardinituzaingo","dejuanaeljardin@gmail.com","+54 11 3955-4187","Patio grande y deco de arte; hasta la madrugada. Luz cálida."),
 ("La Pava","Resto-bar / parrilla","Santa Rosa 1250","@lapavaituzaingo","—","+54 11 4661-0002","Salón amplio, hasta medianoche/01. Escenas de mesa y sobremesa."),
 ("Azahares Restaurante & Bar","Resto-bar / parrilla","Av. Presidente Perón 7609, Parque Leloir","IG sin confirmar (FB: /azaharesrestaurant)","—","+54 11 7607-8040","Cenas show los fines de semana; escenario y mesas."),
]),
]

# ---------- CSV ----------
with open(OUT+"relevamiento-bares-zona-oeste.csv","w",newline="",encoding="utf-8") as fh:
    w=csv.writer(fh)
    w.writerow(["Prioridad","Localidad","Partido","Nombre","Tipo","Dirección","Instagram","Mail","WhatsApp/Tel","Nota","Estado (a completar)"])
    for i,(loc,part,rows) in enumerate(DATA,1):
        for (nombre,tipo,direc,ig,mail,tel,nota) in rows:
            w.writerow([i,loc,part,nombre,tipo,direc,ig,mail,tel,nota,""])

# ---------- Markdown ----------
md=[]
md.append("# Relevamiento de bares — Zona Oeste (para casting de bares de IMPRO)\n")
md.append("**Fecha:** 2026-08-01  ·  **Método:** investigación web (Google Maps, Instagram, guías gastronómicas). Datos reales, no inventados.\n")
md.append("> **Sobre los datos:** el **Instagram** y la **dirección** están en casi todos. El **mail casi nunca es público** — los bares de la zona manejan todo por DM/WhatsApp —, así que donde no hay mail va el teléfono/WhatsApp y se marca `—`. Lo que no se pudo confirmar dice `sin confirmar`. Antes de ir a scoutear, conviene revalidar la altura fina en Google Maps.\n")
md.append("**Orden de prioridad:** " + " → ".join(loc for loc,_,_ in DATA) + "\n")
md.append("**Total:** " + str(sum(len(r) for _,_,r in DATA)) + " lugares.\n")
md.append("\n---\n")
for i,(loc,part,rows) in enumerate(DATA,1):
    md.append(f"\n## {i}. {loc} · partido de {part}  ({len(rows)} lugares)\n")
    for (nombre,tipo,direc,ig,mail,tel,nota) in rows:
        md.append(f"### {nombre}")
        md.append(f"- **Tipo:** {tipo}")
        md.append(f"- **Dirección:** {direc}")
        md.append(f"- **Instagram:** {ig}")
        md.append(f"- **Mail:** {mail}")
        md.append(f"- **WhatsApp / Tel.:** {tel}")
        md.append(f"- **Por qué sirve:** {nota}\n")

md.append("\n---\n")
md.append("## Clusters para scoutear en una sola recorrida\n")
md.append("- **San Justo — cuadra de Comisionado José Indart (2200-2650):** Copper, Bar A, Quimérico y La Josefa están casi pegados. Cuatro locaciones en una caminata.")
md.append("- **Isidro Casanova — eje Ruta 3 / República de Portugal:** Raíz, Montana, La Birra es Bella, La Previa y Patio Santiagueño sobre el mismo corredor.")
md.append("- **Ituzaingó — Parque Leloir (Martín Fierro y alrededores):** Nob3l, Temple, Pompeya, Baum y Azahares. (Ojo: Nob3l y Baum figuran ambos en Martín Fierro 3290 — mismo complejo, Nob3l es el rooftop.)")
md.append("- **Castelar — Av. Santa Rosa:** Ribbon, La Casa Bar, RYU y CHEKA. **Aviso:** Santa Rosa es el límite Castelar/Ituzaingó; algunos domicilios (CHEKA, Paul's) caen del lado Ituzaingó pese al nombre.\n")
md.append("## Cómo usar esto\n")
md.append("1. Abrí `relevamiento-bares-zona-oeste.csv` en Google Sheets: tiene una columna **Estado** para marcar contactado / interesado / reunión / descartado.")
md.append("2. El primer contacto conviene por **DM de Instagram** (es el canal real de estos lugares), con el PDF `IMPRO-Para-Bares.pdf` a mano.")
md.append("3. Arrancá por los **clusters** de arriba: rinden más por recorrida.")
md.append("4. Prioridad de perfil: los que tienen **escenario / cena show** (La Josefa, Santa Birra, Montana, La Previa, Patio Santiagueño, Lobo) ya están acostumbrados a producir noches — suelen ser los más receptivos.\n")

open(OUT+"relevamiento-bares-zona-oeste.md","w",encoding="utf-8").write("\n".join(md))
print("OK md + csv ·", sum(len(r) for _,_,r in DATA), "lugares")
