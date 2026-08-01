# -*- coding: utf-8 -*-
# Web de Blur (@ama.blur) — agencia creativa. Self-contained, azul/negro.
import base64, io, os
from PIL import Image

DASH="/tmp/claude-0/-home-user-ig-crm/76061350-7dbf-5f43-a63f-0d21a08487a5/scratchpad/dash/"
OUTDIR="/home/user/ig-crm/web-blur/"
os.makedirs(OUTDIR, exist_ok=True)

def b64(path, maxw=None):
    im=Image.open(path).convert("RGBA")
    if maxw and im.width>maxw:
        im=im.resize((maxw,int(im.height*maxw/im.width)),Image.LANCZOS)
    buf=io.BytesIO(); im.save(buf,"PNG")
    return "data:image/png;base64,"+base64.b64encode(buf.getvalue()).decode()

def jpg(path):
    with open(path,"rb") as fh:
        return "data:image/jpeg;base64,"+base64.b64encode(fh.read()).decode()

LOGO=b64(DASH+"imgs/blur-logo.png", 700)
IMG_HERO=jpg(DASH+"blurmedia/hero.jpg")
IMG_SCS=jpg(DASH+"blurmedia/scs.jpg")
IMG_SESS=jpg(DASH+"blurmedia/sessions.jpg")
IMG_ARTE=jpg(DASH+"blurmedia/arte.jpg")
IMG_JAM=jpg(DASH+"blurmedia/jam.jpg")
IMG_TOMI=jpg(DASH+"blurmedia/tomi-web.jpg")

_POEM='''Los asados
que te rompiste,
las risas
que multiplicaste,
las vidas
que impactaste,
con tu carisma,
con tu actitud
y sobre todo
por tu calidad
humana.

Los vinos
que descorchamos,
los absolut,
los whiskys
y algún vip que
tenias en punga.
siempre firme,
siempre activando
la coreo.

Laburante
como pocos,
emprendedor nato,
lider indiscutido
en cada
partidito
o en cada
movida
que surgía,
tanta magia
y tanto talento
era mucho para
este universo.

Tuvimos nuestro
ultimo ritual,
a pleno freestyle,
algunas flores
y ese smirnof
de manzana que
buscamos en el 24.

Muchos años
compartiendo
vivencias,
Dios me dio
el privilegio
de tenerte
de amigo,
la pucha que
nos vas
a hacer falta.

Tus fideos con manteca,
que eran mas manteca
y casancrem que otra cosa,
pero que terminaban
siendo siempre
tremendo banquete.

La vida
nos hizo amigos,
La calle
nos hizo familia.

Hasta Volvernos
a Encontrar
querido hermano.

Vivís eternamente
en mi alma.'''
POEM_HTML="".join("<p>"+"<br>".join(x.strip() for x in st.split("\n") if x.strip())+"</p>" for st in _POEM.strip().split("\n\n"))

HTML=f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Blur — Agencia creativa</title>
<meta name="description" content="Blur es una agencia creativa. Fabricamos ideas: música en vivo, eventos, experiencias y contenido de marca. Hacemos que las ideas viajen.">
<style>
 :root{{
   --bg:#07080C; --panel:#0D1017; --panel2:#11151F; --ink:#EEF2F8; --muted:#8A90A2;
   --cyan:#37BEF7; --blue:#1E5AE0; --line:rgba(255,255,255,.09);
 }}
 *{{box-sizing:border-box;margin:0;padding:0}}
 html{{scroll-behavior:smooth}}
 body{{background:var(--bg);color:var(--ink);font-family:'Segoe UI',system-ui,-apple-system,sans-serif;line-height:1.55;overflow-x:hidden}}
 .wrap{{max-width:1120px;margin:0 auto;padding:0 22px}}
 a{{color:inherit;text-decoration:none}}
 .cyan{{color:var(--cyan)}}
 h1,h2,h3{{line-height:1.08;letter-spacing:-.01em}}
 /* nav */
 .nav{{position:sticky;top:0;z-index:50;background:color-mix(in srgb,var(--bg) 84%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}}
 .nav .wrap{{display:flex;align-items:center;justify-content:space-between;height:66px}}
 .nav img{{height:26px}}
 .nav .links{{display:flex;gap:26px;font-size:14px;color:var(--muted)}}
 .nav .links a:hover{{color:var(--cyan)}}
 @media(max-width:720px){{.nav .links{{display:none}}}}
 /* hero */
 .hero{{position:relative;padding:120px 0 96px;text-align:center;overflow:hidden;background:linear-gradient(180deg,rgba(7,8,12,.74),rgba(7,8,12,.9) 62%,var(--bg)),url('{IMG_HERO}');background-size:cover;background-position:center 32%}}
 .hero::before{{content:"";position:absolute;inset:0;background:radial-gradient(60% 55% at 50% 24%,rgba(55,190,247,.20),transparent 70%);pointer-events:none}}
 .hero img.logo{{height:120px;margin-bottom:34px;filter:drop-shadow(0 8px 30px rgba(30,90,224,.5))}}
 .hero h1{{font-size:clamp(40px,8vw,78px);font-weight:800}}
 .hero .sub{{color:var(--muted);font-size:clamp(16px,2.4vw,21px);margin:20px auto 0;max-width:560px}}
 .kicker{{font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--cyan);font-weight:700}}
 .cta{{display:flex;gap:14px;justify-content:center;margin-top:38px;flex-wrap:wrap}}
 .btn{{display:inline-block;padding:14px 26px;border-radius:40px;font-weight:700;font-size:15px}}
 .btn-p{{background:linear-gradient(120deg,var(--cyan),var(--blue));color:#04060C}}
 .btn-s{{border:1px solid var(--line);color:var(--ink)}}
 .btn-s:hover{{border-color:var(--cyan);color:var(--cyan)}}
 /* sections */
 section{{padding:88px 0}}
 .sec-k{{font-size:12px;letter-spacing:.26em;text-transform:uppercase;color:var(--cyan);font-weight:700;margin-bottom:14px}}
 .sec-t{{font-size:clamp(28px,5vw,46px);font-weight:800;margin-bottom:14px}}
 .lead{{color:var(--muted);font-size:18px;max-width:640px}}
 .manifesto{{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:var(--panel)}}
 .manifesto p{{font-size:clamp(22px,3.4vw,32px);font-weight:700;max-width:860px}}
 .manifesto p .cyan{{white-space:nowrap}}
 #origen{{background:var(--panel);border-bottom:1px solid var(--line);position:relative;overflow:hidden}}
 #origen::before{{content:"";position:absolute;top:-20%;right:-10%;width:60%;height:120%;background:radial-gradient(closest-side,rgba(55,190,247,.10),transparent);pointer-events:none}}
 .origen p{{font-size:clamp(17px,2.2vw,20px);color:#C4CAD6;margin-bottom:18px;line-height:1.72}}
 .origen p strong{{color:var(--ink)}}
 .origen .ded{{font-weight:800;color:var(--ink);font-size:clamp(20px,2.6vw,24px);margin-top:28px;border-left:3px solid var(--cyan);padding-left:18px}}
 .name-note{{margin-top:36px;font-size:13px;color:var(--muted);letter-spacing:.04em}}
 .tribute{{display:grid;grid-template-columns:330px 1fr;gap:44px;align-items:start;margin-top:52px;padding-top:44px;border-top:1px solid var(--line)}}
 @media(max-width:720px){{.tribute{{grid-template-columns:1fr;gap:30px}}}}
 .tphoto img{{width:100%;border-radius:14px;display:block;border:1px solid var(--line)}}
 .tphoto figcaption{{margin-top:12px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);text-align:center}}
 .poem p{{font-size:16.5px;line-height:1.5;color:#C6CCD8;margin-bottom:16px}}
 .poem .poem-by{{margin-top:22px;color:var(--cyan);font-size:13.5px;font-style:italic}}
 /* servicios */
 .grid{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}}
 @media(max-width:820px){{.grid{{grid-template-columns:1fr 1fr}}}}
 @media(max-width:520px){{.grid{{grid-template-columns:1fr}}}}
 .card{{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:26px}}
 .card .ic{{width:44px;height:44px;border-radius:12px;background:linear-gradient(120deg,rgba(55,190,247,.2),rgba(30,90,224,.2));display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:22px}}
 .card h3{{font-size:19px;font-weight:800;margin-bottom:8px}}
 .card p{{color:var(--muted);font-size:14.5px}}
 /* recorrido */
 .work{{display:grid;grid-template-columns:1fr 1fr;gap:0;border:1px solid var(--line);border-radius:18px;overflow:hidden;margin-top:26px;background:var(--panel)}}
 .work.rev .ph{{order:2}}
 @media(max-width:780px){{.work{{grid-template-columns:1fr}}.work.rev .ph{{order:0}}}}
 .ph{{position:relative;min-height:320px;background:linear-gradient(150deg,#12151E,#0A0C12);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center}}
 .ph.empty::after{{content:attr(data-label);position:absolute;bottom:14px;left:16px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#465065;font-weight:700}}
 .ph .diamond{{width:54px;height:54px;border:2px solid rgba(55,190,247,.35);transform:rotate(45deg);border-radius:8px}}
 .work .txt{{padding:34px}}
 .tag{{display:inline-block;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);font-weight:700;border:1px solid var(--line);border-radius:30px;padding:5px 12px;margin-bottom:16px}}
 .work h3{{font-size:clamp(22px,3vw,30px);font-weight:800;margin-bottom:10px}}
 .work .meta{{color:var(--muted);font-size:13px;margin-bottom:14px}}
 .work p{{color:#B7BDCC;font-size:15px}}
 .quote{{margin-top:16px;padding-left:16px;border-left:3px solid var(--cyan);font-style:italic;color:var(--ink)}}
 /* equipo */
 .team{{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}}
 @media(max-width:720px){{.team{{grid-template-columns:1fr}}}}
 .member{{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:24px}}
 .member .role{{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);font-weight:700;margin-bottom:6px}}
 .member h3{{font-size:20px;font-weight:800}}
 .member p{{color:var(--muted);font-size:14px;margin-top:8px}}
 .member .hd{{font-size:12px;color:var(--muted);margin-top:12px}}
 /* contacto */
 .contact{{background:var(--panel);border-top:1px solid var(--line)}}
 .cform{{display:grid;gap:14px;max-width:560px;margin-top:26px}}
 .cform input,.cform textarea{{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:14px 16px;color:var(--ink);font-size:15px;font-family:inherit}}
 .cform input:focus,.cform textarea:focus{{outline:none;border-color:var(--cyan)}}
 .cform button{{justify-self:start;border:none;cursor:pointer}}
 .handles{{display:flex;gap:22px;margin-top:24px;flex-wrap:wrap;color:var(--muted);font-size:14px}}
 .handles a:hover{{color:var(--cyan)}}
 footer{{padding:40px 0;border-top:1px solid var(--line);color:var(--muted);font-size:13px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}}
 .ok{{display:none;background:rgba(55,190,247,.12);border:1px solid var(--cyan);border-radius:12px;padding:14px 16px;color:var(--cyan);font-size:14px;margin-top:14px}}
</style>
</head>
<body>

<nav class="nav"><div class="wrap">
  <a href="#top"><img src="{LOGO}" alt="Blur"></a>
  <div class="links">
    <a href="#origen">Origen</a>
    <a href="#hacemos">Qué hacemos</a>
    <a href="#recorrido">Recorrido</a>
    <a href="#contacto">Contacto</a>
  </div>
</div></nav>

<header class="hero" id="top"><div class="wrap">
  <img class="logo" src="{LOGO}" alt="Blur">
  <div class="kicker">Agencia de marketing audiovisual</div>
  <h1>Fabricamos ideas.</h1>
  <p class="sub">Música en vivo, eventos, experiencias y contenido de marca. Hacemos que las ideas viajen.</p>
  <div class="cta">
    <a class="btn btn-p" href="#recorrido">Ver el recorrido</a>
    <a class="btn btn-s" href="#contacto">Escribinos</a>
  </div>
</div></header>

<section class="manifesto"><div class="wrap">
  <p>No hacemos "contenido". Creamos <span class="cyan">experiencias que la gente recuerda</span> — y las producimos de punta a punta, del concepto a la noche del evento.</p>
</div></section>

<section id="origen"><div class="wrap" style="max-width:840px">
  <div class="sec-k">El origen</div>
  <h2 class="sec-t">Por qué Blur</h2>
  <div class="origen">
    <p>Blur no nació en una oficina. Nació en una terraza de Isidro Casanova, en una de las últimas charlas con <strong>Tomás Galeano</strong> — Tomi G —, mi amigo de toda la vida.</p>
    <p>Esa noche me habló de no desenfocarme: de dejar de dispersarme y darle prioridad a lo que hacía rato me venía pidiendo el alma. Producir contenido de calidad, en formato cine. Contar historias que dejen una marca.</p>
    <p>Tomi se fue tres días después, el 20 de abril de 2022. La charla quedó; la idea, también.</p>
    <p><span class="cyan">Blur — desenfoque —</span> es la forma de no soltarla nunca: el nombre es el recordatorio de no perder el foco de lo que importa. Cada cosa que hacemos empieza en esa terraza.</p>
    <p class="ded">Para vos, Tomi.</p>
  </div>
  <div class="tribute">
    <figure class="tphoto"><img src="{IMG_TOMI}" alt="Benjamín y Tomi"><figcaption>Tomás Galeano · Tomi G</figcaption></figure>
    <div class="poem">
      {POEM_HTML}
      <p class="poem-by">— Poema para Tomi · Benjamín Ortega</p>
    </div>
  </div>
  <p class="name-note">ama.blur — Agencia de Marketing Audiovisual · Blur.</p>
</div></section>

<section id="hacemos"><div class="wrap">
  <div class="sec-k">Qué hacemos</div>
  <h2 class="sec-t">Una idea, ejecutada completa</h2>
  <p class="lead">Pensamos el concepto, lo dirigimos y lo producimos. Lo mismo si es una sesión de música, un evento o una campaña de marca.</p>
  <div class="grid">
    <div class="card"><div class="ic">🎤</div><h3>Música en vivo</h3><p>Sesiones y shows en vivo. Producción, dirección y registro con estética propia.</p></div>
    <div class="card"><div class="ic">✦</div><h3>Eventos</h3><p>Del concepto a la puerta: curaduría, producción y una comunidad que crece en cada fecha.</p></div>
    <div class="card"><div class="ic">🌐</div><h3>Experiencias</h3><p>Activaciones e intervenciones que conectan gente, marcas y espacios en el mundo real.</p></div>
    <div class="card"><div class="ic">🎬</div><h3>Contenido de marca</h3><p>Piezas audiovisuales con lenguaje de cine para que una marca cuente algo, no que venda a los gritos.</p></div>
    <div class="card"><div class="ic">🤝</div><h3>Colaboraciones</h3><p>Diseñamos dinámicas entre artistas, canales y eventos. Cruces que traspasan países y pantallas.</p></div>
    <div class="card"><div class="ic">🎨</div><h3>Dirección creativa</h3><p>La idea que ordena todo lo demás. El concepto que hace que una noche tenga sentido.</p></div>
  </div>
</div></section>

<section id="recorrido"><div class="wrap">
  <div class="sec-k">Recorrido</div>
  <h2 class="sec-t">Lo que ya hicimos</h2>
  <p class="lead">Una selección de proyectos reales. Cada uno con su gente, su noche y su historia.</p>

  <div class="work">
    <div class="ph" style="background-image:linear-gradient(180deg,rgba(7,8,12,.15),rgba(7,8,12,.45)),url('{IMG_SCS}')"></div>
    <div class="txt">
      <span class="tag">Colaboración internacional</span>
      <h3>Somos Como Somos × Aviv Arte</h3>
      <div class="meta">16.11.2025 · Casablanca Tango, CABA · España ↔ Argentina</div>
      <p>Diseñamos y produjimos la dinámica de colaboración entre el canal de streaming Somos Como Somos (España) y el evento Aviv Arte, realizado en Argentina. Cada participante se encontró con su yo del pasado y su yo del futuro.</p>
      <div class="quote">"El reflejo que ves hoy es lo que nunca se rindió."</div>
    </div>
  </div>

  <div class="work rev">
    <div class="ph" style="background-image:linear-gradient(180deg,rgba(7,8,12,.1),rgba(7,8,12,.35)),url('{IMG_SESS}')"></div>
    <div class="txt">
      <span class="tag">Música en vivo</span>
      <h3>Sessions en Cerrito 1060</h3>
      <div class="meta">Ciclo en vivo · con la voz de Mar · todos los martes</div>
      <p>Un ciclo de sesiones en vivo desde Cerrito 1060: versiones íntimas, crudas y sin filtros. Música que se siente cerca, real, con nuestra dirección creativa y producción.</p>
    </div>
  </div>

  <div class="work">
    <div class="ph" style="background-image:linear-gradient(180deg,rgba(7,8,12,.12),rgba(7,8,12,.4)),url('{IMG_JAM}')"></div>
    <div class="txt">
      <span class="tag">Evento</span>
      <h3>Jam Joint ft Fauna Fest</h3>
      <div class="meta">Cerrito 1060 · Buenos Aires</div>
      <p>Una noche donde todo fluyó: música en vivo, energía real y gente conectando desde el primer acorde. No es solo un evento, es una comunidad creciendo en cada encuentro.</p>
    </div>
  </div>

  <div class="work rev">
    <div class="ph" style="background-image:linear-gradient(180deg,rgba(7,8,12,.15),rgba(7,8,12,.45)),url('{IMG_ARTE}')"></div>
    <div class="txt">
      <span class="tag">Pieza audiovisual</span>
      <h3>El arte de encontrarse</h3>
      <div class="meta">Dirección y producción — Blur</div>
      <p>Una pieza sobre el reencuentro con uno mismo. La misma idea que atraviesa a Blur: las historias que valen la pena son las que conectan miradas, épocas y personas.</p>
    </div>
  </div>
</div></section>

<section id="equipo" style="background:var(--panel);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
  <div class="sec-k">Equipo</div>
  <h2 class="sec-t">Quién fabrica las ideas</h2>
  <div class="team">
    <div class="member">
      <div class="role">Dirección creativa</div>
      <h3>Benjamín Ortega</h3>
      <p>Creador y productor audiovisual. Dirige la parte creativa de Blur y funda 21:15 Films.</p>
      <div class="hd">@fabbenok</div>
    </div>
    <div class="member">
      <div class="role">Co-dirección</div>
      <h3>Wichy</h3>
      <p>Parte del directorio creativo de Blur, en la construcción de cada proyecto.</p>
      <div class="hd">@wichy.odw</div>
    </div>
    <div class="member">
      <div class="role">Red de colaboradores</div>
      <h3>+ equipo por proyecto</h3>
      <p>Sumamos dirección artística, producción y artistas según lo que pida cada idea.</p>
      <div class="hd">Casa: @ama.blur</div>
    </div>
  </div>
</div></section>

<section class="contact" id="contacto"><div class="wrap">
  <div class="sec-k">Contacto</div>
  <h2 class="sec-t">¿Tenés una idea? La fabricamos.</h2>
  <p class="lead">Contanos qué querés hacer —un evento, una sesión, una campaña— y te respondemos.</p>
  <form class="cform" name="contacto-blur" method="POST" data-netlify="true" netlify-honeypot="bot-field">
    <input type="hidden" name="form-name" value="contacto-blur">
    <p style="display:none"><label>No llenar: <input name="bot-field"></label></p>
    <input type="text" name="nombre" placeholder="Tu nombre" required>
    <input type="text" name="contacto" placeholder="Instagram, mail o teléfono" required>
    <textarea name="idea" rows="4" placeholder="Contanos tu idea" required></textarea>
    <button type="submit" class="btn btn-p">Enviar</button>
    <div class="ok" id="ok">¡Recibido! Te escribimos pronto.</div>
  </form>
  <div class="handles">
    <a href="https://instagram.com/ama.blur" target="_blank" rel="noopener">Instagram @ama.blur</a>
    <a href="https://instagram.com/fabbenok" target="_blank" rel="noopener">@fabbenok</a>
    <a href="https://2115films.netlify.app" target="_blank" rel="noopener">21:15 Films</a>
  </div>
</div></section>

<footer><div class="wrap" style="display:flex;justify-content:space-between;width:100%;flex-wrap:wrap;gap:12px">
  <span>ama.blur — Agencia de Marketing Audiovisual · Buenos Aires</span>
  <span>Fabricamos ideas · @ama.blur</span>
</div></footer>

<script>
 var form=document.querySelector('form[name="contacto-blur"]');
 if(form){{form.addEventListener('submit',function(e){{
   e.preventDefault();
   var data=new FormData(form);
   fetch('/',{{method:'POST',headers:{{'Content-Type':'application/x-www-form-urlencoded'}},body:new URLSearchParams(data).toString()}})
   .then(function(){{document.getElementById('ok').style.display='block';form.reset();}})
   .catch(function(){{document.getElementById('ok').style.display='block';document.getElementById('ok').textContent='Si no se envió, escribinos por DM a @ama.blur';}});
 }});}}
</script>
</body>
</html>"""

open(OUTDIR+"index.html","w",encoding="utf-8").write(HTML)
print("OK web-blur/index.html", round(len(HTML)/1024,1),"kb")
