# -*- coding: utf-8 -*-
"""Genera el tablero de prospectos como una sola pagina HTML."""
import json, re, sys, unicodedata
import prospectos as D

LOGO = open(sys.argv[1]).read().strip()

def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")

for p in D.P:
    p["id"] = slug(p["nombre"])

DATOS = json.dumps(D.P, ensure_ascii=False)
ESTADOS = json.dumps([{"k": k, "n": n, "c": c} for k, n, c in D.ESTADOS], ensure_ascii=False)
EQUIPO = json.dumps(D.EQUIPO, ensure_ascii=False)
RUBROS = json.dumps(sorted({p["rubro"] for p in D.P}), ensure_ascii=False)
LOCS = json.dumps(sorted({p["localidad"] for p in D.P}), ensure_ascii=False)
CANTERA = json.dumps([{"q": q, "e": e, "n": n} for q, e, n in D.CANTERA], ensure_ascii=False)

HTML = """<title>Prospectos San Martín</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&family=Barlow+Condensed:wght@600;700&display=swap">
<style>
:root{
  --ink:#05070B; --surf:#0D1219; --surf2:#131A24; --line:rgba(255,255,255,.10);
  --line2:rgba(255,255,255,.06);
  --tx:#EDF1F6; --tx2:#A8B3C2; --tx3:#6C7889;
  --azul:#4DA3FF; --azul2:#1B6FE8; --rojo:#FF3F4D; --oro:#C7A45E;
  --ok:#50D000; --alerta:#FFB020;
  --disp:'Sora',system-ui,sans-serif; --body:'Inter',system-ui,sans-serif;
  --util:'Barlow Condensed','Arial Narrow',sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--tx);font-family:var(--body);
  font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased}
.wrap{max-width:1120px;margin:0 auto;padding:0 16px;padding-block:0 56px}
a{color:var(--azul)}
button,select,input,textarea{font:inherit;color:inherit}
:focus-visible{outline:2px solid var(--azul);outline-offset:2px;border-radius:6px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

/* ---- encabezado ---- */
header{position:sticky;top:env(safe-area-inset-top,0px);z-index:20;
  background:linear-gradient(180deg,var(--ink) 74%,rgba(5,7,11,.92) 100%);
  border-bottom:1px solid var(--line2);margin:0 -16px;padding:14px 16px 12px}
.hrow{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.hrow img{height:34px;width:auto;display:block}
.htit{font-family:var(--disp);font-size:19px;font-weight:800;letter-spacing:-.02em;
  line-height:1.15;flex:1 1 180px;min-width:0}
.htit small{display:block;font-family:var(--util);font-size:13px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--tx3);margin-top:3px}
.hcount{font-family:var(--util);font-size:14px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--tx3);white-space:nowrap}
.hcount b{color:var(--tx);font-size:19px}

/* ---- embudo ---- */
.embudo{display:flex;gap:8px;overflow-x:auto;margin:14px -16px 0;padding:0 16px 4px;
  scrollbar-width:none}
.embudo::-webkit-scrollbar{display:none}
.est{flex:0 0 auto;display:flex;flex-direction:column;gap:2px;min-width:92px;
  background:var(--surf);border:1px solid var(--line);border-left:3px solid var(--c);
  border-radius:11px;padding:9px 13px;cursor:pointer;text-align:left;
  transition:background .12s,border-color .12s}
.est:hover{background:var(--surf2)}
.est[aria-pressed="true"]{background:var(--surf2);border-color:var(--c)}
.est .n{font-family:var(--util);font-size:26px;font-weight:700;line-height:1;
  color:var(--c);font-variant-numeric:tabular-nums}
.est .l{font-family:var(--util);font-size:12.5px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--tx3);white-space:nowrap}

/* ---- filtros ---- */
.filtros{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}
.filtros input[type=search]{flex:1 1 220px;min-width:0;background:var(--surf);
  border:1px solid var(--line);border-radius:10px;padding:10px 13px;color:var(--tx)}
.filtros input::placeholder{color:var(--tx3)}
.filtros select{flex:0 1 auto;background:var(--surf);border:1px solid var(--line);
  border-radius:10px;padding:10px 12px}
.limpiar{background:none;border:1px solid var(--line);border-radius:10px;
  padding:10px 15px;color:var(--tx2);cursor:pointer}
.limpiar:hover{color:var(--tx);border-color:var(--azul)}

/* ---- avisos ---- */
.aviso{display:flex;gap:12px;align-items:flex-start;background:rgba(199,164,94,.07);
  border:1px solid rgba(199,164,94,.30);border-radius:13px;padding:14px 16px;margin-top:18px}
.aviso .ic{font-family:var(--util);font-size:12px;font-weight:700;letter-spacing:.12em;
  color:var(--oro);border:1px solid rgba(199,164,94,.4);border-radius:999px;
  padding:3px 9px 2px;flex:0 0 auto;margin-top:1px}
.aviso p{margin:0;font-size:14px;color:var(--tx2)}
.aviso p b{color:var(--tx)}
.estado-db{font-family:var(--util);font-size:13px;font-weight:600;letter-spacing:.1em;
  text-transform:uppercase;color:var(--tx3);margin-top:12px}
.estado-db b{color:var(--ok)}
.estado-db.off b{color:var(--alerta)}

/* ---- seccion ---- */
h2{font-family:var(--disp);font-size:16px;font-weight:700;letter-spacing:.02em;
  margin:30px 0 4px;display:flex;align-items:center;gap:10px}
h2::after{content:"";flex:1;height:1px;background:var(--line2)}
.sub{font-size:14px;color:var(--tx3);margin:0 0 14px}

/* ---- tarjeta ---- */
.lista{display:grid;gap:10px;grid-template-columns:1fr}
@media(min-width:760px){.lista{grid-template-columns:1fr 1fr}}
@media(min-width:1040px){.lista{grid-template-columns:1fr 1fr 1fr}}
.p{background:var(--surf);border:1px solid var(--line);border-radius:14px;
  overflow:hidden;align-self:start;border-left:3px solid var(--c,#7A8698)}
.p.abierta{border-color:var(--line);background:var(--surf2)}
.phead{width:100%;display:block;background:none;border:0;padding:14px 15px;
  text-align:left;cursor:pointer}
.pnom{font-family:var(--disp);font-size:16.5px;font-weight:700;letter-spacing:-.015em;
  line-height:1.25}
.pmeta{font-family:var(--util);font-size:13.5px;font-weight:600;letter-spacing:.09em;
  text-transform:uppercase;color:var(--tx3);margin-top:5px}
.ptags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px;align-items:center}
.pill{font-family:var(--util);font-size:12.5px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;border-radius:999px;padding:4px 11px 3px;
  color:#05070B;background:var(--c,#7A8698)}
.tag{font-family:var(--util);font-size:12.5px;font-weight:600;letter-spacing:.09em;
  text-transform:uppercase;border:1px solid var(--line);border-radius:999px;
  padding:3px 10px 2px;color:var(--tx3)}
.tag.ok{color:var(--ok);border-color:rgba(80,208,0,.35)}
.tag.parcial{color:var(--alerta);border-color:rgba(255,176,32,.35)}
.tag.nombre{color:var(--rojo);border-color:rgba(255,63,77,.35)}
.tag.alta{color:var(--oro);border-color:rgba(199,164,94,.4)}
.pbody{border-top:1px solid var(--line2);padding:15px}
.campo{margin-bottom:14px}
.campo:last-child{margin-bottom:0}
.lab{font-family:var(--util);font-size:12.5px;font-weight:700;letter-spacing:.14em;
  text-transform:uppercase;color:var(--tx3);margin-bottom:5px}
.dato{font-size:14.5px;color:var(--tx);word-break:break-word}
.dato.falta{color:var(--tx3);font-style:italic}
.enl{display:flex;gap:7px;flex-wrap:wrap}
.enl a{font-family:var(--util);font-size:14px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;text-decoration:none;border:1px solid var(--line);
  border-radius:9px;padding:7px 13px 6px;color:var(--azul)}
.enl a:hover{border-color:var(--azul);background:rgba(77,163,255,.08)}
.enl a.mapa{color:var(--oro)}
.enl a.mapa:hover{border-color:var(--oro);background:rgba(199,164,94,.08)}
.contenido{font-size:14.5px;color:var(--tx2);line-height:1.52}
.fuente{font-size:12.5px;color:var(--tx3);margin-top:8px}
.seguimiento{background:var(--ink);border:1px solid var(--line2);border-radius:11px;
  padding:13px;margin-top:4px}
.sgrid{display:grid;gap:10px;grid-template-columns:1fr 1fr}
.sgrid .full{grid-column:1/-1}
.seguimiento label{display:block}
.seguimiento select,.seguimiento input,.seguimiento textarea{width:100%;
  background:var(--surf);border:1px solid var(--line);border-radius:9px;
  padding:9px 11px;color:var(--tx)}
.seguimiento textarea{resize:vertical;min-height:62px;line-height:1.45}
.guardado{font-family:var(--util);font-size:12.5px;font-weight:600;letter-spacing:.11em;
  text-transform:uppercase;color:var(--tx3);margin-top:9px;min-height:16px}
.guardado.ok{color:var(--ok)}
.vacio{border:1px dashed var(--line);border-radius:13px;padding:26px 18px;
  text-align:center;color:var(--tx3);font-size:14.5px}

/* ---- cantera ---- */
.cant{display:grid;gap:8px;grid-template-columns:1fr}
@media(min-width:680px){.cant{grid-template-columns:1fr 1fr}}
.crow{display:flex;align-items:center;gap:13px;background:var(--surf);
  border:1px solid var(--line);border-radius:11px;padding:11px 14px}
.crow .cn{font-family:var(--util);font-size:25px;font-weight:700;color:var(--oro);
  line-height:1;font-variant-numeric:tabular-nums;flex:0 0 auto;min-width:30px}
.crow .ct{font-family:var(--disp);font-size:14.5px;font-weight:700;letter-spacing:-.01em}
.crow .cd{font-size:13px;color:var(--tx3);margin-top:2px}
.dirs{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}
.dirs a{font-family:var(--util);font-size:13.5px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;text-decoration:none;border:1px solid var(--line);
  border-radius:9px;padding:7px 12px 6px;color:var(--tx2)}
.dirs a:hover{color:var(--azul);border-color:var(--azul)}

/* ---- alta ---- */
.alta{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:16px}
.agrid{display:grid;gap:10px;grid-template-columns:1fr 1fr}
.agrid .full{grid-column:1/-1}
.alta input,.alta select,.alta textarea{width:100%;background:var(--ink);
  border:1px solid var(--line);border-radius:9px;padding:10px 12px;color:var(--tx)}
.alta textarea{resize:vertical;min-height:60px}
.btn{font-family:var(--util);font-size:15px;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;background:var(--azul2);border:0;border-radius:10px;
  padding:12px 22px;color:#fff;cursor:pointer}
.btn:hover{background:var(--azul)}
.btn[disabled]{opacity:.45;cursor:not-allowed}
footer{margin-top:36px;padding-top:18px;border-top:1px solid var(--line2);
  font-family:var(--util);font-size:13px;font-weight:600;letter-spacing:.12em;
  text-transform:uppercase;color:var(--tx3);display:flex;justify-content:space-between;
  gap:16px;flex-wrap:wrap}
</style>

<div class="wrap">
<header>
  <div class="hrow">
    <img src="__LOGO__" alt="Nexo Studios">
    <div class="htit">Prospectos de sponsoreo<small>General San Martín · PBA</small></div>
    <div class="hcount"><b id="cTotal">0</b> negocios</div>
  </div>
  <div class="embudo" id="embudo"></div>
</header>

<div class="aviso">
  <span class="ic">Leer</span>
  <p><b>Ningún teléfono ni mail está inventado.</b> Cada ficha dice de dónde salió el dato
  y qué falta. Los mails no son públicos en casi ningún comercio de la zona: se consiguen
  en el mostrador o por mensaje. El chip de color marca cuánto hay verificado de cada uno.</p>
</div>
<div class="estado-db off" id="dbEstado">Seguimiento local · <b>sin conectar</b></div>

<div class="filtros">
  <input type="search" id="fBusca" placeholder="Buscar por nombre, rubro o dirección…" aria-label="Buscar">
  <select id="fRubro" aria-label="Filtrar por rubro"></select>
  <select id="fLoc" aria-label="Filtrar por localidad"></select>
  <select id="fResp" aria-label="Filtrar por responsable"></select>
  <button class="limpiar" id="fLimpiar" type="button">Limpiar</button>
</div>

<h2>Prospectos</h2>
<p class="sub" id="subLista">Tocá una ficha para ver los datos y cargar el seguimiento.</p>
<div class="lista" id="lista"></div>

<h2>La cantera</h2>
<p class="sub">Lo que falta salir a buscar para pasar los 50. Los números son la meta por
frente, no lo que hay cargado.</p>
<div class="cant" id="cantera"></div>
<div class="dirs">
  <a href="https://www.google.com/maps/search/comercios+en+Villa+Ballester+General+San+Mart%C3%ADn" target="_blank" rel="noopener">Google Maps</a>
  <a href="https://www.instagram.com/explore/locations/" target="_blank" rel="noopener">Lugares en Instagram</a>
  <a href="https://www.paginasamarillas.com.ar/b/comercios/villa-ballester-buenos-aires" target="_blank" rel="noopener">Páginas Amarillas</a>
  <a href="https://www.instagram.com/ballestergastronomia/" target="_blank" rel="noopener">@ballestergastronomia</a>
</div>

<h2>Agregar un prospecto</h2>
<p class="sub">Lo que carguen acá lo ve todo el equipo.</p>
<form class="alta" id="alta">
  <div class="agrid">
    <label class="full"><span class="lab">Nombre del negocio</span>
      <input id="aNombre" required maxlength="80"></label>
    <label><span class="lab">Rubro</span><select id="aRubro"></select></label>
    <label><span class="lab">Localidad</span><select id="aLoc"></select></label>
    <label><span class="lab">Instagram (sin @)</span><input id="aIg" maxlength="60"></label>
    <label><span class="lab">Teléfono</span><input id="aTel" maxlength="40"></label>
    <label class="full"><span class="lab">Dirección</span><input id="aDir" maxlength="120"></label>
    <label class="full"><span class="lab">Mail</span><input id="aMail" type="email" maxlength="80"></label>
    <label class="full"><span class="lab">Qué contenido viene haciendo</span>
      <textarea id="aCont" maxlength="600"></textarea></label>
  </div>
  <div style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
    <button class="btn" type="submit" id="aBtn">Agregar</button>
    <span class="guardado" id="aMsg"></span>
  </div>
</form>

<footer><span>Nexo Studios · Equipo comercial</span><span id="fSync">Datos base: búsqueda web, sept. 2026</span></footer>
</div>

<script>
const BASE = __DATOS__;
const ESTADOS = __ESTADOS__;
const EQUIPO = __EQUIPO__;
const RUBROS = __RUBROS__;
const LOCS = __LOCS__;
const CANTERA = __CANTERA__;
const VERTXT = {ok:"Datos ok", parcial:"Faltan datos", nombre:"Solo el nombre"};
const EMAP = {}; ESTADOS.forEach(e => EMAP[e.k] = e);

let seg = {};          // id -> {estado, responsable, proxima, fecha, notas}
let extra = [];        // prospectos agregados desde la pagina
let db = null;
let abiertas = new Set();

const $ = s => document.querySelector(s);
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
  c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

function todos(){ return BASE.concat(extra); }
function segDe(id){ return seg[id] || {estado:"nuevo", responsable:"Sin asignar", proxima:"", fecha:"", notas:""}; }

/* ---------- filtros ---------- */
const F = {busca:"", rubro:"", loc:"", resp:"", estado:""};

function opciones(sel, lista, todoTxt){
  sel.innerHTML = '<option value="">' + todoTxt + '</option>' +
    lista.map(v => '<option value="' + esc(v) + '">' + esc(v) + '</option>').join("");
}

function pasa(p){
  const s = segDe(p.id);
  if (F.rubro && p.rubro !== F.rubro) return false;
  if (F.loc && p.localidad !== F.loc) return false;
  if (F.resp && s.responsable !== F.resp) return false;
  if (F.estado && s.estado !== F.estado) return false;
  if (F.busca){
    const h = (p.nombre + " " + p.rubro + " " + p.localidad + " " + p.direccion + " " +
               p.instagram + " " + p.contenido).toLowerCase();
    if (!h.includes(F.busca)) return false;
  }
  return true;
}

/* ---------- render ---------- */
function pintarEmbudo(){
  const t = todos();
  const cont = ESTADOS.map(e => {
    const n = t.filter(p => segDe(p.id).estado === e.k).length;
    return '<button class="est" type="button" data-estado="' + e.k + '" style="--c:' + e.c +
      '" aria-pressed="' + (F.estado === e.k) + '">' +
      '<span class="n">' + n + '</span><span class="l">' + esc(e.n) + '</span></button>';
  }).join("");
  $("#embudo").innerHTML = cont;
  $("#cTotal").textContent = t.length;
}

function ficha(p){
  const s = segDe(p.id), e = EMAP[s.estado] || EMAP.nuevo;
  const enl = [];
  if (p.instagram) enl.push('<a href="https://instagram.com/' + esc(p.instagram) +
    '" target="_blank" rel="noopener">@' + esc(p.instagram) + '</a>');
  if (p.facebook) enl.push('<a href="https://facebook.com/' + esc(p.facebook) +
    '" target="_blank" rel="noopener">Facebook</a>');
  if (p.web) enl.push('<a href="' + esc(p.web) + '" target="_blank" rel="noopener">Web</a>');
  if (p.direccion) enl.push('<a class="mapa" href="https://www.google.com/maps/search/' +
    encodeURIComponent(p.direccion) + '" target="_blank" rel="noopener">Ver en el mapa</a>');
  if (p.telefono) enl.push('<a href="tel:' + esc(p.telefono.replace(/[^0-9+]/g,"")) + '">' +
    esc(p.telefono) + '</a>');
  if (p.mail) enl.push('<a href="mailto:' + esc(p.mail) + '">' + esc(p.mail) + '</a>');

  const falta = [];
  if (!p.instagram && !p.facebook) falta.push("redes");
  if (!p.direccion) falta.push("dirección");
  if (!p.telefono) falta.push("teléfono");
  if (!p.mail) falta.push("mail");

  const opts = (lista, val) => lista.map(v =>
    '<option' + (v === val ? " selected" : "") + '>' + esc(v) + '</option>').join("");

  return '<article class="p' + (abiertas.has(p.id) ? " abierta" : "") + '" style="--c:' +
    e.c + '" data-id="' + esc(p.id) + '">' +
    '<button class="phead" type="button" aria-expanded="' + abiertas.has(p.id) + '">' +
      '<div class="pnom">' + esc(p.nombre) + '</div>' +
      '<div class="pmeta">' + esc(p.rubro) + ' · ' + esc(p.localidad) + '</div>' +
      '<div class="ptags">' +
        '<span class="pill">' + esc(e.n) + '</span>' +
        '<span class="tag ' + esc(p.ver) + '">' + esc(VERTXT[p.ver] || p.ver) + '</span>' +
        (p.prioridad === "alta" ? '<span class="tag alta">Prioridad</span>' : "") +
        (p.seguidores ? '<span class="tag">' + esc(p.seguidores) + '</span>' : "") +
        (s.responsable !== "Sin asignar" ? '<span class="tag">' + esc(s.responsable) + '</span>' : "") +
      '</div>' +
    '</button>' +
    '<div class="pbody"' + (abiertas.has(p.id) ? "" : " hidden") + '>' +
      (enl.length ? '<div class="campo"><div class="lab">Contacto</div><div class="enl">' +
        enl.join("") + '</div></div>' : "") +
      (falta.length ? '<div class="campo"><div class="lab">Falta conseguir</div>' +
        '<div class="dato falta">' + esc(falta.join(" · ")) + '</div></div>' : "") +
      (p.contenido ? '<div class="campo"><div class="lab">Qué contenido viene haciendo</div>' +
        '<div class="contenido">' + esc(p.contenido) + '</div></div>' : "") +
      (p.fuente ? '<div class="fuente">Fuente: ' + esc(p.fuente) + '</div>' : "") +
      '<div class="campo" style="margin-top:14px"><div class="lab">Seguimiento</div>' +
      '<div class="seguimiento"><div class="sgrid">' +
        '<label><span class="lab">Estado</span><select data-f="estado">' +
          ESTADOS.map(x => '<option value="' + x.k + '"' + (x.k === s.estado ? " selected" : "") +
            '>' + esc(x.n) + '</option>').join("") + '</select></label>' +
        '<label><span class="lab">Responsable</span><select data-f="responsable">' +
          opts(EQUIPO, s.responsable) + '</select></label>' +
        '<label class="full"><span class="lab">Próxima acción</span>' +
          '<input data-f="proxima" maxlength="120" value="' + esc(s.proxima) +
          '" placeholder="Pasar por el local y pedir el mail"></label>' +
        '<label class="full"><span class="lab">Fecha</span>' +
          '<input data-f="fecha" type="date" value="' + esc(s.fecha) + '"></label>' +
        '<label class="full"><span class="lab">Notas</span>' +
          '<textarea data-f="notas" maxlength="900" placeholder="Con quién hablaste, qué dijo, qué le interesó">' +
          esc(s.notas) + '</textarea></label>' +
      '</div><div class="guardado" data-msg></div></div></div>' +
    '</div></article>';
}

function pintar(){
  const vis = todos().filter(pasa);
  $("#lista").innerHTML = vis.length
    ? vis.map(ficha).join("")
    : '<div class="vacio">Ningún negocio coincide con ese filtro.</div>';
  $("#subLista").textContent = vis.length === todos().length
    ? "Tocá una ficha para ver los datos y cargar el seguimiento."
    : vis.length + " de " + todos().length + " negocios.";
  pintarEmbudo();
}

/* ---------- guardado ---------- */
let pend = {};
function guardar(id, campo, valor, msgEl){
  const s = Object.assign({}, segDe(id));
  s[campo] = valor;
  seg[id] = s;
  pintarEmbudo();
  const card = document.querySelector('.p[data-id="' + CSS.escape(id) + '"]');
  if (card && campo === "estado") card.style.setProperty("--c", (EMAP[valor] || EMAP.nuevo).c);
  if (!db){
    if (msgEl){ msgEl.textContent = "Guardado solo en esta pantalla"; msgEl.className = "guardado"; }
    return;
  }
  clearTimeout(pend[id]);
  pend[id] = setTimeout(async () => {
    try{
      await db.doc("seguimiento/" + id).set(Object.assign({}, s, {actualizado: Date.now()}));
      if (msgEl){ msgEl.textContent = "Guardado"; msgEl.className = "guardado ok";
        setTimeout(() => { msgEl.textContent = ""; }, 2200); }
    }catch(err){
      if (msgEl){ msgEl.textContent = "No se pudo guardar"; msgEl.className = "guardado"; }
    }
  }, 420);
}

/* ---------- eventos ---------- */
$("#lista").addEventListener("click", ev => {
  const h = ev.target.closest(".phead"); if (!h) return;
  const card = h.closest(".p"), id = card.dataset.id;
  const ab = !abiertas.has(id);
  ab ? abiertas.add(id) : abiertas.delete(id);
  h.setAttribute("aria-expanded", ab);
  card.classList.toggle("abierta", ab);
  card.querySelector(".pbody").hidden = !ab;
});
$("#lista").addEventListener("change", ev => {
  const el = ev.target.closest("[data-f]"); if (!el) return;
  const card = el.closest(".p");
  guardar(card.dataset.id, el.dataset.f, el.value, card.querySelector("[data-msg]"));
});
$("#lista").addEventListener("input", ev => {
  const el = ev.target.closest("[data-f]"); if (!el) return;
  if (el.tagName !== "TEXTAREA" && el.type !== "text" && !el.matches("input[data-f=proxima]")) return;
  const card = el.closest(".p");
  guardar(card.dataset.id, el.dataset.f, el.value, card.querySelector("[data-msg]"));
});
$("#embudo").addEventListener("click", ev => {
  const b = ev.target.closest(".est"); if (!b) return;
  F.estado = F.estado === b.dataset.estado ? "" : b.dataset.estado;
  pintar();
});
$("#fBusca").addEventListener("input", e => { F.busca = e.target.value.trim().toLowerCase(); pintar(); });
$("#fRubro").addEventListener("change", e => { F.rubro = e.target.value; pintar(); });
$("#fLoc").addEventListener("change", e => { F.loc = e.target.value; pintar(); });
$("#fResp").addEventListener("change", e => { F.resp = e.target.value; pintar(); });
$("#fLimpiar").addEventListener("click", () => {
  F.busca = F.rubro = F.loc = F.resp = F.estado = "";
  $("#fBusca").value = ""; $("#fRubro").value = ""; $("#fLoc").value = ""; $("#fResp").value = "";
  pintar();
});

$("#alta").addEventListener("submit", async ev => {
  ev.preventDefault();
  const nombre = $("#aNombre").value.trim();
  if (!nombre) return;
  const id = "x-" + nombre.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + Date.now().toString(36).slice(-4);
  const p = {id:id, nombre:nombre, rubro:$("#aRubro").value, localidad:$("#aLoc").value,
    instagram:$("#aIg").value.trim().replace(/^@/,""), facebook:"", web:"",
    direccion:$("#aDir").value.trim(), telefono:$("#aTel").value.trim(),
    mail:$("#aMail").value.trim(), seguidores:"", contenido:$("#aCont").value.trim(),
    fuente:"Cargado por el equipo", ver:"parcial", prioridad:"media"};
  extra.push(p);
  const msg = $("#aMsg");
  if (db){
    try{
      await db.doc("prospectos/" + id).set(p);
      msg.textContent = "Agregado y compartido"; msg.className = "guardado ok";
    }catch(err){ msg.textContent = "Agregado, pero no se pudo compartir"; msg.className = "guardado"; }
  } else {
    msg.textContent = "Agregado solo en esta pantalla"; msg.className = "guardado";
  }
  ev.target.reset();
  $("#aRubro").value = RUBROS[0] || ""; $("#aLoc").value = LOCS[0] || "";
  pintar();
  setTimeout(() => { msg.textContent = ""; }, 3200);
});

/* ---------- arranque ---------- */
opciones($("#fRubro"), RUBROS, "Todos los rubros");
opciones($("#fLoc"), LOCS, "Todas las localidades");
opciones($("#fResp"), EQUIPO, "Todo el equipo");
opciones($("#aRubro"), RUBROS, "—");
opciones($("#aLoc"), LOCS, "—");
$("#cantera").innerHTML = CANTERA.map(c =>
  '<div class="crow"><span class="cn">' + c.n + '</span><div><div class="ct">' +
  esc(c.q) + '</div><div class="cd">' + esc(c.e) + '</div></div></div>').join("");
pintar();

(async () => {
  try{
    db = await window.claude?.use?.("db");
  }catch(err){ db = null; }
  if (!db) return;
  try{
    db.collection("seguimiento").onSnapshot(docs => {
      seg = {};
      (docs || []).forEach(d => { const id = (d.id || "").split("/").pop(); if (id) seg[id] = d; });
      pintar();
    });
    db.collection("prospectos").onSnapshot(docs => {
      extra = (docs || []).map(d => Object.assign({}, d, {id: (d.id || "").split("/").pop()}));
      pintar();
    });
    const de = $("#dbEstado");
    de.classList.remove("off");
    de.innerHTML = 'Seguimiento compartido · <b>al día</b>';
  }catch(err){ db = null; }
})();
</script>"""

out = (HTML.replace("__LOGO__", LOGO).replace("__DATOS__", DATOS)
           .replace("__ESTADOS__", ESTADOS).replace("__EQUIPO__", EQUIPO)
           .replace("__RUBROS__", RUBROS).replace("__LOCS__", LOCS)
           .replace("__CANTERA__", CANTERA))
open("tablero-prospectos.html", "w").write(out)
print("tablero-prospectos.html ·", round(len(out)/1024, 1), "KB ·", len(D.P), "prospectos")
