# -*- coding: utf-8 -*-
# Propuesta para Jeremías Zárate — rol, contenido en redes y estrategia
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
pdfmetrics.registerFont(TTFont("DVB", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))

W, H = landscape(A4)
BG   = colors.HexColor("#0A0A0C")
CARD = colors.HexColor("#17171B")
LINE = colors.HexColor("#2A2A31")
INK  = colors.white
BODY = colors.HexColor("#B0B2B8")
DIM  = colors.HexColor("#6C6E76")
AC   = colors.HexColor("#E5241F")   # rojo 21:15

BASE = "/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
JERE   = ImageReader(BASE+"imgs/jere-circle.png")
CHAPA  = ImageReader(BASE+"imgs/logo-2115-new.png")     # 1386x742

def bgfill(c):
    c.setFillColor(BG); c.rect(0, 0, W, H, fill=1, stroke=0)

def wrap(c, text, x, y, size, font, color, maxw, leading=None):
    c.setFont(font, size); c.setFillColor(color)
    lead = leading or size*1.4
    line = ""
    for w0 in text.split(" "):
        t = (line+" "+w0).strip()
        if pdfmetrics.stringWidth(t, font, size) <= maxw: line = t
        else: c.drawString(x, y, line); y -= lead; line = w0
    if line: c.drawString(x, y, line)
    return y - lead

def chapa(c, x, y, w):
    h = w*742/1386
    c.drawImage(CHAPA, x, y, w, h, mask="auto")

def foot(c, page, deck="Propuesta"):
    c.setFont("DV", 9); c.setFillColor(DIM)
    c.drawString(24*mm, 10*mm, f"21:15 FILMS · {deck}")
    c.drawRightString(W-24*mm, 10*mm, f"JEREMÍAS ZÁRATE · {page}")

def head(c, kicker, title, page):
    bgfill(c)
    c.setStrokeColor(LINE); c.setLineWidth(0.8)
    c.line(24*mm, H-22*mm, W-24*mm, H-22*mm)
    chapa(c, W-24*mm-26*mm, H-20*mm, 26*mm)
    c.setFont("DVB", 12); c.setFillColor(AC)
    c.drawString(24*mm, H-34*mm, kicker.upper())
    ts = 32
    while pdfmetrics.stringWidth(title, "DVB", ts) > W - 60*mm and ts > 17:
        ts -= 1
    c.setFont("DVB", ts); c.setFillColor(INK)
    c.drawString(24*mm, H-48*mm, title)
    foot(c, page)

def steps(c, items, y=None, size=15.5):
    y = y or H-68*mm
    for i, (t, d) in enumerate(items):
        c.setFont("DVB", 28); c.setFillColor(AC)
        c.drawString(24*mm, y-2*mm, f"{i+1:02d}")
        c.setFont("DVB", size); c.setFillColor(INK)
        c.drawString(44*mm, y, t)
        y = wrap(c, d, 44*mm, y-7.2*mm, 12, "DV", BODY, W-78*mm, leading=16.5)
        y -= 5.5*mm
    return y

def statement(c, lines, page, footline=None):
    bgfill(c)
    c.setFillColor(AC); c.rect(26*mm, H-44*mm, 40*mm, 2*mm, fill=1, stroke=0)
    y = H-52*mm
    for ln, sz, col in lines:
        y -= sz*1.25
        c.setFont("DVB", sz); c.setFillColor(col)
        c.drawString(26*mm, y, ln)
    if footline:
        wrap(c, footline, 26*mm, 30*mm, 13, "DV", BODY, W-90*mm, leading=19)
    chapa(c, W-24*mm-30*mm, H-22*mm, 30*mm)
    foot(c, page); c.showPage()

# ---------------- portada ----------------
def cover(c):
    bgfill(c)
    # retrato circular a la derecha
    d = 128*mm
    cx = W-24*mm-d; cy = (H-d)/2 - 6*mm
    c.drawImage(JERE, cx, cy, d, d, mask="auto")
    # barra roja arriba
    c.setFillColor(AC); c.rect(0, H-5, W, 5, fill=1, stroke=0)
    # texto izquierda
    c.setFont("DVB", 13); c.setFillColor(AC)
    c.drawString(26*mm, H-34*mm, "PROPUESTA · AGOSTO 2026")
    c.setFont("DVB", 58); c.setFillColor(INK)
    c.drawString(26*mm, H-70*mm, "Jeremías")
    c.drawString(26*mm, H-88*mm, "Zárate")
    c.setFillColor(AC); c.rect(26*mm, H-96*mm, 44*mm, 2*mm, fill=1, stroke=0)
    c.setFont("DVB", 18); c.setFillColor(colors.HexColor("#E8E8EA"))
    c.drawString(26*mm, H-112*mm, "Dirección · IMPRO")
    wrap(c, "Tu rol, tu voz en redes y la estrategia que vamos a aplicar juntos.",
         26*mm, H-130*mm, 14, "DV", BODY, 118*mm, leading=20)
    chapa(c, 26*mm, 16*mm, 34*mm)
    c.setFont("DV", 10.5); c.setFillColor(DIM)
    c.drawRightString(W-24*mm, 14*mm, "Una propuesta de Benjamín Ortega · 21:15 Films")
    c.showPage()

def build():
    c = pdfcanvas.Canvas(BASE+"IMPRO-Propuesta-Jere.pdf", pagesize=landscape(A4))
    c.setTitle("IMPRO — Propuesta para Jeremías Zárate"); c.setAuthor("21:15 Films")
    cover(c)

    # 2 · el proyecto en una línea
    head(c, "De qué se trata", "El proyecto, en una línea", 2)
    y = H-72*mm
    y = wrap(c, "IMPRO es una serie que se filma en bares reales: dos personas, un guion disparador, un minuto de improvisación filmado como cine.", 24*mm, y, 23, "DVB", INK, W-70*mm, leading=33)
    y -= 5*mm
    wrap(c, "Un capítulo nuevo cada día a las 21:15. La produce 21:15 Films, la creé yo (Benjamín) y arranca este mes en Zona Oeste. Falta una sola pata para que esto sea cine y no un video más: la dirección. Ahí entrás vos.", 24*mm, y, 14.5, "DV", BODY, W-88*mm, leading=21.5)
    c.showPage()

    # 3 · tu rol (statement)
    statement(c, [("Vos no dirigís un capítulo.", 30, INK),
                  ("Firmás la mirada", 30, INK),
                  ("de toda la serie.", 30, AC)], 3,
              "Cada capítulo dura un minuto, pero el lenguaje —cómo se ve, cómo se ilumina, cómo se corta— es el mismo los 30 capítulos. Esa vara la ponés vos y no se negocia con nadie.")

    # 4 · qué implica dirigir esto
    head(c, "Tu rol", "Qué significa dirigir IMPRO", 4)
    steps(c, [
      ("Hacer que un bar parezca cine", "Luz, encuadre y sonido en un lugar que no es un set. Que la mesa de siempre, de golpe, tenga clima."),
      ("Dos cámaras en vivo, sin repetir", "La escena pasa una sola vez. Tu puesta tiene que capturarla entera, sin cortar, sin pedir otra toma."),
      ("Dirigir a gente que nunca actuó", "El 90% de los que se sientan no son actores. Tu trabajo es sacarles una escena de verdad en un minuto."),
      ("Convertir un minuto crudo en un capítulo", "Montaje y color: de la improvisación al material que la gente quiere compartir como el tráiler de su película."),
    ])
    c.showPage()

    # 5 · por qué vos
    head(c, "Por qué vos", "No es por casualidad", 5)
    y = H-70*mm
    y = wrap(c, "Yo pienso el proyecto, el negocio y la expansión. Lo que no quiero es meterme en tu terreno: el oficio de la imagen.", 24*mm, y, 16, "DVB", INK, W-80*mm, leading=24)
    y -= 4*mm
    for t, dsc in [
      ("Nos complementamos", "Yo llevo la estrategia y la marca; vos, la cámara y la dirección de intérpretes. Cada uno en lo suyo, sin pisarnos."),
      ("Confío en tu ojo", "Ya vi cómo mirás. Esto necesita a alguien que entienda que un plano mal iluminado mata la escena, por buena que sea la actuación."),
      ("Sos parte del relato", "No sos un proveedor: sos uno de los tres nombres del proyecto. En la presentación, en los créditos y en la calle."),
    ]:
        c.setFillColor(AC); c.rect(24*mm, y+1.5*mm, 5*mm, 1.8*mm, fill=1, stroke=0)
        c.setFont("DVB", 14); c.setFillColor(INK); c.drawString(33*mm, y, t)
        y = wrap(c, dsc, 33*mm, y-6.5*mm, 12, "DV", BODY, W-80*mm, leading=16.5) - 4*mm
    c.showPage()

    # 6 · tu voz en redes (statement)
    statement(c, [("En redes, cada uno", 30, INK),
                  ("tiene una voz.", 30, INK),
                  ("La tuya es el oficio.", 30, AC)], 6,
              "@2115films habla como la serie. @fabbenok cuenta el proceso desde adentro. Vos, @jeremiaszarate_, mostrás cómo se hace el cine. Tres cuentas, tres voces, cero repetición.")

    # 7 · qué vas a postear
    head(c, "Tu contenido", "Lo que vas a postear en tu cuenta", 7)
    steps(c, [
      ("“Me llamaron para dirigir algo que no existía. Dije que sí.”", "El arranque. Contás que te subís a IMPRO y por qué. Presentás tu mirada."),
      ("Cómo se ilumina una mesa de bar", "Oficio puro: sacar la luz de arriba, fuente cálida a la altura de la cara, fondo a negro. Antes y después."),
      ("Por qué dos cámaras y no una", "Lenguaje de cine aplicado a una escena en vivo. Fácil de explicar, imposible de dejar de mirar."),
      ("Dirigir a alguien que nunca actuó", "Lo que aprendés en una noche sacándole una escena real a un desconocido."),
      ("De un minuto de impro a un capítulo", "Montaje y color contados como oficio: cómo se arma el resultado final."),
    ], size=14.5)
    c.showPage()

    # 8 · cómo se ve (formato)
    head(c, "El formato", "Cómo se ve tu contenido", 8)
    y = H-66*mm
    for a, b, dsc in [
      ("Video de proceso, no placas", "AUTÉNTICO", "Lo tuyo se filma en el lugar: tu mano en la cámara, la prueba de luz, el rodaje. Nada de diseño pulido — eso es de la productora."),
      ("Reels de oficio de 20-40 seg", "FORMATO", "Un concepto por pieza, directo al grano. La técnica se muestra, no se explica de más."),
      ("Antes y después", "GANCHO", "El mismo plano sin dirigir y dirigido. Es el contenido que más se comparte porque se entiende sin sonido."),
    ]:
        c.setFillColor(CARD); c.roundRect(24*mm, y-24*mm, W-48*mm, 29*mm, 3*mm, fill=1, stroke=0)
        c.setFillColor(AC); c.rect(24*mm, y+5*mm-2, W-48*mm, 2, fill=1, stroke=0)
        c.setFont("DVB", 15); c.setFillColor(INK); c.drawString(32*mm, y-3*mm, a)
        c.setFont("DVB", 9.5); c.setFillColor(AC); c.drawString(32*mm, y-9.5*mm, b)
        wrap(c, dsc, 118*mm, y-3*mm, 12, "DV", BODY, W-150*mm, leading=16.5)
        y -= 35*mm
    c.showPage()

    # 9 · el calendario
    head(c, "La estrategia", "Tu calendario, mes a mes", 9)
    y = H-64*mm
    for mes, tit, dsc in [
      ("AGOSTO", "Construir en público", "1 o 2 piezas por semana. Nadie estrena nada todavía: mostramos cómo se arma la serie. Tu “dije que sí”, la luz del bar, la prueba técnica, dirigir no-actores."),
      ("SEPTIEMBRE", "Del piloto al tráiler", "Montaje y color: cómo un minuto de impro se vuelve un capítulo. El backstage del piloto ya con caras y cesiones firmadas."),
      ("OCTUBRE", "La cadencia 21:15", "Sale el capítulo diario. Vos sumás 1 pieza de oficio por semana sobre el capítulo más comentado. Poco y bueno: el capítulo es el protagonista."),
    ]:
        c.setFillColor(CARD); c.roundRect(24*mm, y-22*mm, W-48*mm, 27*mm, 3*mm, fill=1, stroke=0)
        c.setFillColor(AC); c.rect(24*mm, y-22*mm, 2.5*mm, 27*mm, fill=1, stroke=0)
        c.setFont("DVB", 15); c.setFillColor(AC); c.drawString(32*mm, y-3*mm, mes)
        c.setFont("DVB", 14); c.setFillColor(INK); c.drawString(90*mm, y-3*mm, tit)
        wrap(c, dsc, 32*mm, y-11*mm, 11.5, "DV", BODY, W-70*mm, leading=16)
        y -= 33*mm
    c.showPage()

    # 10 · qué necesito de vos
    head(c, "El acuerdo", "Qué necesito de vos", 10)
    y = H-70*mm
    colw = (W-52*mm)/2
    c.setFillColor(CARD); c.roundRect(24*mm, 30*mm, colw, y-30*mm, 3*mm, fill=1, stroke=0)
    c.setFillColor(CARD); c.roundRect(28*mm+colw, 30*mm, colw, y-30*mm, 3*mm, fill=1, stroke=0)
    c.setFillColor(AC); c.rect(24*mm, y-2, colw, 2, fill=1, stroke=0)
    c.setFillColor(AC); c.rect(28*mm+colw, y-2, colw, 2, fill=1, stroke=0)
    c.setFont("DVB", 13); c.setFillColor(AC)
    c.drawString(32*mm, y-10*mm, "PONÉS VOS")
    c.drawString(36*mm+colw, y-10*mm, "PONGO YO")
    ly = y-20*mm
    for it in ["La dirección de los rodajes de IMPRO", "1 o 2 piezas por semana en tu cuenta", "Tu ojo para la luz, el encuadre y el montaje", "Aparecer con nombre en el proyecto"]:
        c.setFillColor(AC); c.rect(32*mm, ly+1.4*mm, 4.5*mm, 1.6*mm, fill=1, stroke=0)
        ly = wrap(c, it, 39*mm, ly, 12, "DV", INK, colw-20*mm, leading=16) - 3.5*mm
    ry = y-20*mm
    for it in ["Los copys de cada posteo, escritos", "El diseño y las plantillas que necesites", "La estrategia, el cruce de cuentas y la difusión", "La producción completa: equipo, sedes, edición"]:
        c.setFillColor(AC); c.rect(36*mm+colw, ry+1.4*mm, 4.5*mm, 1.6*mm, fill=1, stroke=0)
        ry = wrap(c, it, 43*mm+colw, ry, 12, "DV", INK, colw-20*mm, leading=16) - 3.5*mm
    c.showPage()

    # 11 · cierre
    statement(c, [("Quiero que dirijas esto", 32, INK),
                  ("conmigo.", 32, AC)], 11,
              "Lo hablamos cuando quieras. Idea y producción: @fabbenok · 21:15 Films · @2115films")
    c.save()
    print("OK deck jere")

build()
