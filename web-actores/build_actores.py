# -*- coding: utf-8 -*-
import base64, io, os
from PIL import Image, ImageFilter, ImageEnhance
DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
OUT="/home/user/ig-crm/web-actores/"; os.makedirs(OUT, exist_ok=True)

def b64png(path,w):
    im=Image.open(path).convert("RGBA")
    if im.width>w: im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
    bf=io.BytesIO(); im.save(bf,"PNG")
    return "data:image/png;base64,"+base64.b64encode(bf.getvalue()).decode()
def b64jpg(path,w,darken=0.0):
    im=Image.open(path).convert("RGB")
    if im.width>w: im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
    if darken: im=ImageEnhance.Brightness(im).enhance(1-darken)
    bf=io.BytesIO(); im.save(bf,"JPEG",quality=82)
    return "data:image/jpeg;base64,"+base64.b64encode(bf.getvalue()).decode()

LOGO=b64png(DASH+"imgs/logo-impro-blanco-tag.png",560)
HERO=b64jpg(DASH+"imgs/crop-barra.jpg",1200,0.25)

HTML=f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>IMPRO — Casting abierto · Actuá tu capítulo</title>
<meta name="description" content="Casting abierto para IMPRO, la serie que se filma en bares reales de Zona Oeste. Actuá tu capítulo de un minuto y quedátelo para siempre.">
<style>
 :root{{--bg:#0A0D1C;--panel:#111631;--card:#151B36;--ink:#EEF1F8;--body:#C3C8DC;--dim:#7C83A0;--line:#242C52;--mint:#2BE4B0;--amber:#F5A83C;--cyan:#4FC6FF;}}
 *{{box-sizing:border-box;margin:0;padding:0}}
 html{{scroll-behavior:smooth}}
 body{{background:var(--bg);color:var(--ink);font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;line-height:1.55;overflow-x:hidden}}
 .wrap{{max-width:1080px;margin:0 auto;padding:0 22px}}
 a{{color:inherit;text-decoration:none}}
 .mint{{color:var(--mint)}}
 .nav{{position:sticky;top:0;z-index:40;background:color-mix(in srgb,var(--bg) 84%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}}
 .nav .wrap{{display:flex;align-items:center;justify-content:space-between;height:64px}}
 .nav img{{height:24px}}
 .btn{{display:inline-block;padding:13px 24px;border-radius:40px;font-weight:800;font-size:15px;cursor:pointer;border:none;font-family:inherit}}
 .btn-p{{background:linear-gradient(120deg,var(--mint),var(--cyan));color:#04120C}}
 .btn-s{{border:1px solid var(--line);color:var(--ink);background:transparent}}
 .btn-s:hover{{border-color:var(--mint);color:var(--mint)}}
 .hero{{position:relative;padding:96px 0 84px;text-align:center;overflow:hidden;
   background:linear-gradient(180deg,rgba(10,13,28,.62),rgba(10,13,28,.9) 70%,var(--bg)),url('{HERO}');background-size:cover;background-position:center}}
 .kicker{{font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--mint);font-weight:800}}
 .hero img.logo{{height:78px;margin-bottom:26px;filter:drop-shadow(0 6px 26px rgba(43,228,176,.35))}}
 .hero h1{{font-size:clamp(40px,8vw,76px);font-weight:800;letter-spacing:-.02em;line-height:1.02;margin-top:10px}}
 .hero .sub{{color:var(--body);font-size:clamp(16px,2.4vw,20px);margin:18px auto 0;max-width:560px}}
 .hero .cta{{margin-top:34px}}
 section{{padding:78px 0}}
 .sec-k{{font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--mint);font-weight:800;margin-bottom:12px}}
 .sec-t{{font-size:clamp(26px,4.5vw,42px);font-weight:800;line-height:1.1}}
 .lead{{color:var(--body);font-size:18px;max-width:640px;margin-top:14px}}
 .qes{{background:var(--panel);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}}
 .qes p{{font-size:clamp(20px,3vw,28px);font-weight:700;max-width:820px}}
 .qes p .mint{{white-space:nowrap}}
 .grid{{display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-top:34px}}
 @media(max-width:680px){{.grid{{grid-template-columns:1fr}}}}
 .card{{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:26px}}
 .card .ic{{font-size:26px;margin-bottom:12px}}
 .card h3{{font-size:19px;font-weight:800;margin-bottom:8px}}
 .card p{{color:var(--body);font-size:15px}}
 .grid3{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}}
 @media(max-width:760px){{.grid3{{grid-template-columns:1fr}}}}
 .card .price{{font-size:30px;font-weight:800;color:var(--mint);margin:8px 0 6px}}
 .card .price span{{font-size:14px;color:var(--dim);font-weight:600}}
 .fine{{color:var(--dim);font-size:13.5px;margin-top:20px;max-width:680px}}
 .steps{{margin-top:30px;display:flex;flex-direction:column;gap:2px}}
 .step{{display:flex;gap:18px;padding:18px 0;border-bottom:1px solid var(--line)}}
 .step .n{{font-size:28px;font-weight:800;color:var(--mint);min-width:44px;font-variant-numeric:tabular-nums}}
 .step h4{{font-size:18px;font-weight:800}}
 .step p{{color:var(--body);font-size:15px;margin-top:3px}}
 .chips{{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px}}
 .chip{{border:1px solid var(--line);border-radius:30px;padding:10px 18px;font-weight:700;font-size:15px}}
 .viral{{background:linear-gradient(150deg,#15224a,#0C1230);border:1px solid var(--line);border-radius:20px;padding:clamp(26px,4vw,44px);margin-top:10px}}
 .viral h2{{font-size:clamp(24px,4vw,36px);font-weight:800;line-height:1.12}}
 .viral p{{color:var(--body);font-size:17px;margin-top:14px;max-width:680px}}
 /* form */
 .form{{background:var(--panel);border-top:1px solid var(--line)}}
 form.f{{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:720px;margin-top:26px}}
 form.f .full{{grid-column:1 / -1}}
 form.f label{{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--dim);font-weight:700;display:block;margin-bottom:6px}}
 form.f input,form.f select,form.f textarea{{width:100%;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:13px 15px;color:var(--ink);font-size:15px;font-family:inherit}}
 form.f input:focus,form.f select:focus,form.f textarea:focus{{outline:none;border-color:var(--mint)}}
 form.f textarea{{min-height:90px;resize:vertical}}
 @media(max-width:680px){{form.f{{grid-template-columns:1fr}}}}
 .ok{{display:none;background:rgba(43,228,176,.12);border:1px solid var(--mint);border-radius:12px;padding:15px 17px;color:var(--mint);font-size:15px;margin-top:16px}}
 footer{{padding:40px 0;border-top:1px solid var(--line);color:var(--dim);font-size:13px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}}
 :focus-visible{{outline:2px solid var(--cyan);outline-offset:2px}}
</style>
</head>
<body>

<nav class="nav"><div class="wrap">
  <img src="{LOGO}" alt="IMPRO">
  <a class="btn btn-p" href="#reservar">Reservá tu función</a>
</div></nav>

<header class="hero" id="top"><div class="wrap">
  <img class="logo" src="{LOGO}" alt="IMPRO">
  <div class="kicker">Convocatoria de lanzamiento · Serie web interactiva</div>
  <h1>Actuá tu capítulo.</h1>
  <p class="sub">Una serie web interactiva e innovadora que se filma en bares reales. Un minuto tuyo, frente a un desconocido, filmado como cine. Y es para siempre.</p>
  <div class="cta"><a class="btn btn-p" href="#reservar">Reservá tu función</a></div>
</div></header>

<section class="qes"><div class="wrap">
  <div class="sec-k">Qué es</div>
  <p>Te sentás frente a alguien que no conocés, te llega un <span class="mint">guion disparador</span> con el plato, y tenés un minuto. Sin libreto, sin ensayo, sin red. Dos cámaras te filman. Lo que pasa, queda.</p>
</div></section>

<section><div class="wrap">
  <div class="sec-k">Por qué sumarte</div>
  <h2 class="sec-t">Tu escena, tu material, tu momento</h2>
  <div class="grid">
    <div class="card"><div class="ic">🎬</div><h3>Tu capítulo es tuyo</h3><p>Te llevás la escena terminada con calidad de cine. Material real para tu reel, no un ejercicio de clase.</p></div>
    <div class="card"><div class="ic">🔥</div><h3>Vos lo hacés viral</h3><p>Cuando estrenamos tu capítulo, sos el protagonista y el que lo comparte. Tu escena, tu red, tu gente.</p></div>
    <div class="card"><div class="ic">🎭</div><h3>No hace falta ser actor</h3><p>Importa la presencia, la escucha y la verdad. Si tenés desparpajo y ganas de jugar, entrás.</p></div>
    <div class="card"><div class="ic">⭐</div><h3>Primera temporada</h3><p>Sé parte de un formato nuevo desde el capítulo uno. Los primeros son los que quedan en la historia.</p></div>
  </div>
</div></section>

<section style="padding-top:0"><div class="wrap">
  <div class="viral">
    <h2>La estrategia es simple: cada capítulo, un actor que lo hace explotar.</h2>
    <p>Estrenamos un capítulo por día a las 21:15. Cada uno tiene su protagonista, y cada protagonista tiene su red. Así IMPRO se vuelve viral: no con una cuenta empujando, sino con vos compartiendo tu propia película. Cuantos más sos, más lejos llega — y más lejos llega tu escena.</p>
  </div>
</div></section>

<section><div class="wrap">
  <div class="sec-k">Cómo funciona</div>
  <h2 class="sec-t">Tu función, paso a paso</h2>
  <div class="steps">
    <div class="step"><div class="n">01</div><div><h4>Te postulás acá</h4><p>Completás el formulario de abajo. Te escribimos para coordinar.</p></div></div>
    <div class="step"><div class="n">02</div><div><h4>Elegís tu género</h4><p>Comedia, drama, thriller, romance o misterio. Jugás en el que te copa.</p></div></div>
    <div class="step"><div class="n">03</div><div><h4>Te llega el disparador</h4><p>Una situación, tu rol y un objetivo que el otro no conoce. De ahí para adelante, lo resolvés vos.</p></div></div>
    <div class="step"><div class="n">04</div><div><h4>Un minuto, sin cortes</h4><p>Dos cámaras, un bar real, una escena. Improvisación pura.</p></div></div>
    <div class="step"><div class="n">05</div><div><h4>Se estrena a las 21:15</h4><p>Tu capítulo sale con terminación de cine, listo para que lo compartas.</p></div></div>
  </div>
  <div class="chips">
    <span class="chip">Comedia</span><span class="chip">Drama</span><span class="chip">Thriller</span><span class="chip">Romance</span><span class="chip">Misterio</span>
  </div>
</div></section>

<section id="precios"><div class="wrap">
  <div class="sec-k">Precio de lanzamiento</div>
  <h2 class="sec-t">Reservá tu función</h2>
  <p class="lead">Precio fundador para los primeros capítulos. Incluye el rodaje de tu escena, tu capítulo terminado y un tapeo con bebida en la mesa.</p>
  <div class="grid3">
    <div class="card"><div class="ic">🎬</div><h3>Individual</h3><p class="price">$30.000 <span>/ persona</span></p><p>Actuás con un desconocido. Un capítulo compartido — la esencia de IMPRO.</p></div>
    <div class="card"><div class="ic">👥</div><h3>Dúo</h3><p class="price">$30.000 <span>/ persona</span></p><p>Venís con tu partner y actúan la escena entre ustedes.</p></div>
    <div class="card"><div class="ic">🔥</div><h3>Grupo (4)</h3><p class="price">$25.000 <span>/ persona</span></p><p>Cuatro amigos, dos escenas. El precio más bajo por cabeza.</p></div>
  </div>
  <p class="fine">🍟 Tapeo incluido: papas, bastones de muzzarella o porción de pizza + una bebida (con o sin alcohol). · Precio fundador por tiempo limitado — después sube.</p>
</div></section>

<section class="form" id="reservar"><div class="wrap">
  <div class="sec-k">Reservá</div>
  <h2 class="sec-t">Asegurá tu lugar</h2>
  <p class="lead">Completá tus datos y te escribimos para coordinar fecha, bar y forma de pago. No importa el CV — importan las ganas de jugar en cámara.</p>
  <form class="f" name="reserva-funcion" method="POST" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="reserva-funcion">
    <p style="display:none"><label>No llenar: <input name="bot-field"></label></p>
    <div><label>Nombre y apellido</label><input type="text" name="nombre" required></div>
    <div><label>Edad</label><input type="number" name="edad" min="18" required></div>
    <div><label>Zona / localidad</label><input type="text" name="zona" placeholder="Ramos, San Justo, Morón…" required></div>
    <div><label>Instagram</label><input type="text" name="instagram" placeholder="@tuusuario"></div>
    <div><label>¿Cómo venís?</label><select name="tier"><option>Individual ($30.000)</option><option>Dúo — con mi partner ($30.000 c/u)</option><option>Grupo de 4 ($25.000 c/u)</option><option>Todavía no sé</option></select></div>
    <div class="full"><label>¿Tenés experiencia? Contanos</label><input type="text" name="experiencia" placeholder="Teatro, impro, nada formal… todo suma"></div>
    <div class="full"><label>Link a un video tuyo (opcional)</label><input type="url" name="video" placeholder="YouTube, Drive, Instagram… 30-60 seg"></div>
    <div class="full"><label>Disponibilidad / algo que quieras contarnos</label><textarea name="mensaje" placeholder="Días que podés, en qué género te ves, lo que sea"></textarea></div>
    <div class="full"><button type="submit" class="btn btn-p">Reservar mi función</button>
      <div class="ok" id="ok">¡Reserva recibida! Te escribimos para coordinar fecha, bar y pago. Seguinos en @es.impro mientras tanto.</div></div>
  </form>
</div></section>

<footer><div class="wrap" style="display:flex;justify-content:space-between;width:100%;flex-wrap:wrap;gap:12px">
  <span>IMPRO · Producido por 21:15 Films — Zona Oeste, Buenos Aires</span>
  <span>@es.impro · @2115films · @fabbenok</span>
</div></footer>

<script>
 var form=document.querySelector('form[name="reserva-funcion"]');
 if(form){{form.addEventListener('submit',function(e){{
   e.preventDefault();
   var data=new FormData(form);
   fetch('/',{{method:'POST',headers:{{'Content-Type':'application/x-www-form-urlencoded'}},body:new URLSearchParams(data).toString()}})
   .then(function(){{document.getElementById('ok').style.display='block';form.reset();}})
   .catch(function(){{document.getElementById('ok').style.display='block';document.getElementById('ok').textContent='Si no se envió, escribinos por DM a @es.impro';}});
 }});}}
</script>
</body>
</html>"""
open(OUT+"index.html","w",encoding="utf-8").write(HTML)
print("OK web-actores/index.html",round(len(HTML)/1024),"kb")
