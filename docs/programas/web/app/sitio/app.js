// La web interna de Nexo Studios.
//
// Lo que esta version resuelve y las seis paginas publicadas no podian: el
// permiso lo decide el servidor. Un integrante no ve los costos de produccion
// porque la base no se los manda, no porque la pantalla se los esconda. Por
// eso tampoco hay contenido escrito en el HTML: hasta la escaleta sale de la
// base, filtrada por las mismas politicas. Lo que no te toca, no viaja.
//
// La clave de abajo es publica a proposito: es la que identifica al proyecto,
// no a la persona. Sola no abre nada, porque el rol anonimo no tiene ninguna
// politica a favor. Lo que abre puertas es tu sesion.

import { createClient } from
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const PROYECTO = 'https://yjcuatjsbyaluirdshnb.supabase.co';
const CLAVE = 'sb_publishable_gNvAjq7uIwDPjfKAJuS9qQ_TApoZnlu';

const sb = createClient(PROYECTO, CLAVE);

const $ = (id) => document.getElementById(id);
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes',
              'sábado'];
const SEMANA = 10080;

const estado = { rol: null, persona: null, programas: [], estudio: null };

// ---------------------------------------------------------------- utilidades

function el(tag, clase, texto) {
  const e = document.createElement(tag);
  if (clase) e.className = clase;
  if (texto !== undefined && texto !== null) e.textContent = texto;
  return e;
}

function plata(n) {
  return '$ ' + Math.round(Number(n) || 0).toLocaleString('es-AR');
}

function horas(min) {
  return Math.floor(min / 60) + ' h ' + String(min % 60).padStart(2, '0');
}

function falta(m) {
  if (m < 60) return m + ' min';
  const h = Math.floor(m / 60), r = m % 60;
  return h + ' h' + (r ? ' ' + String(r).padStart(2, '0') : '');
}

// La hora del piso es la de Buenos Aires, no la del aparato: hay gente en
// Bogota y en Ibiza y el horario de aire es uno solo.
function ahoraBA() {
  try {
    const f = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
    const p = {};
    f.formatToParts(new Date()).forEach((x) => { p[x.type] = x.value; });
    const d = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
    if (d === undefined) return null;
    return d * 1440 + (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10);
  } catch (e) { return null; }
}

function dentro(m, a, b) {
  if (m >= a && m < b) return m;
  if (m + SEMANA >= a && m + SEMANA < b) return m + SEMANA;
  return null;
}

function hhmm(min) {
  const m = ((min % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' +
         String(m % 60).padStart(2, '0');
}

// ------------------------------------------------------------------ la puerta

function puerta(mensaje, clase) {
  $('esperando').hidden = true;
  $('adentro').hidden = true;
  $('puerta').hidden = false;
  if (mensaje) {
    const d = $('puerta-dicho');
    d.textContent = mensaje;
    d.className = 'dicho' + (clase ? ' ' + clase : '');
  }
}

$('f-entrar').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const mail = $('mail').value.trim();
  if (!mail) return;
  const boton = $('b-entrar');
  boton.disabled = true;
  boton.textContent = 'Mandando…';
  const { error } = await sb.auth.signInWithOtp({
    email: mail,
    options: { emailRedirectTo: location.origin + location.pathname },
  });
  boton.disabled = false;
  boton.textContent = 'Mandame el link';
  if (error) {
    puerta('No salió: ' + error.message, 'mal');
  } else {
    puerta('Listo. Te mandamos un link a ' + mail +
           '. Abrilo desde este mismo aparato.', 'bien');
  }
});

$('b-salir').addEventListener('click', async () => {
  await sb.auth.signOut();
  location.hash = '';
  location.reload();
});

// -------------------------------------------------------------- cargar lo mio

async function cargar() {
  const [rol, contenido] = await Promise.all([
    sb.rpc('mi_rol'),
    sb.from('programa_contenido').select('datos'),
  ]);

  if (contenido.error) throw contenido.error;
  estado.rol = rol.data || null;
  estado.programas = (contenido.data || []).map((f) => f.datos);

  // El orden de la grilla, no el que devuelva la base.
  const orden = ['tercer-tiempo', 'el-motivo', 'sex-and-the-baires',
                 'pequenos-grandes-sabios', 'exitosa-yo'];
  estado.programas.sort((a, b) => orden.indexOf(a.slug) - orden.indexOf(b.slug));

  if (estado.rol === 'direccion') {
    const e = await sb.from('estudio').select('datos').maybeSingle();
    estado.estudio = e.data ? e.data.datos : null;
  }
}

// ------------------------------------------------------------------ la barra

function barra() {
  const nav = $('nav');
  nav.textContent = '';
  const items = [];
  if (estado.rol === 'direccion') items.push(['', 'Tablero']);
  estado.programas.forEach((p) => items.push([p.slug, p.corto]));
  if (items.length < 2) { nav.hidden = true; return; }
  nav.hidden = false;
  items.forEach(([destino, rotulo]) => {
    const a = el('a', null, rotulo);
    a.href = '#' + destino;
    nav.appendChild(a);
  });
}

// --------------------------------------------------------- la hoja: programa

function tablaEscaleta(es, acento) {
  const caja = el('div', 'envuelve');
  const t = el('table');
  t.dataset.dia = es.dia;
  t.dataset.i = es.i;
  t.dataset.f = es.f;

  const cap = el('caption');
  cap.appendChild(el('span', 'cap', es.titulo + ' · ' + es.desde + ' a ' +
                     hhmm(es.f) ));
  t.appendChild(cap);

  const thead = el('thead');
  const tr = el('tr');
  ['Hora', 'Bloque', 'Dura', 'Qué es'].forEach((h, i) => {
    const th = el('th', i === 2 ? 'dur' : (i === 3 ? 'desc' : null), h);
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  t.appendChild(thead);

  const tb = el('tbody');
  es.bloques.forEach((b) => {
    const f = el('tr', b.n ? null : 'tanda');
    f.dataset.i = b.i;
    f.dataset.f = b.f;
    f.appendChild(el('td', 'hora', hhmm(b.i)));

    const td = el('td', 'bloque');
    if (b.n) td.appendChild(el('span', 'n', b.n));
    td.appendChild(el('b', null, b.nombre));
    const chica = el('span', 'chica', b.que);
    chica.appendChild(el('span', 'dur-chica', b.dur));
    td.appendChild(chica);
    f.appendChild(td);

    f.appendChild(el('td', 'dur', b.dur));
    f.appendChild(el('td', 'desc', b.que));
    tb.appendChild(f);
  });

  const fin = el('tr', 'total');
  fin.appendChild(el('td', 'hora', es.f % 1440 === 0 && es.f > es.i
                     ? '24:00' : hhmm(es.f)));
  const tdf = el('td', 'bloque');
  tdf.appendChild(el('b', null, 'Fin'));
  tdf.appendChild(el('span', 'chica', 'Al aire, exacto.'));
  fin.appendChild(tdf);
  fin.appendChild(el('td', 'dur', (es.f - es.i) + "'"));
  fin.appendChild(el('td', 'desc', 'Al aire, exacto.'));
  tb.appendChild(fin);

  t.appendChild(tb);
  caja.appendChild(t);
  return caja;
}

function titulo(h, p) {
  const d = el('div', 'titulo');
  d.appendChild(el('h2', null, h));
  if (p) d.appendChild(el('p', null, p));
  return d;
}

function filas(pares) {
  const c = el('div', 'filas');
  pares.forEach(([izq, der, pie]) => {
    const f = el('div', 'fila');
    const i = el('div', 'izq');
    const b = el('b', 'et');
    b.style.color = 'var(--acento)';
    b.textContent = izq;
    i.appendChild(b);
    f.appendChild(i);
    const d = el('div', 'der');
    const p = el('p', null, der);
    p.style.color = 'var(--tinta)';
    p.style.fontSize = '15px';
    d.appendChild(p);
    if (pie) {
      const q = el('p', 'mono chico', pie);
      q.style.marginTop = '3px';
      d.appendChild(q);
    }
    f.appendChild(d);
    c.appendChild(f);
  });
  return c;
}

function pintarPrograma(p) {
  const hoja = $('hoja');
  hoja.textContent = '';
  hoja.style.setProperty('--acento', p.acento_negro);
  $('quien').textContent = p.corto;

  // tapa
  const tapa = el('div', 'tapa');
  tapa.appendChild(el('p', 'et', p.temporada + ' · producción interna'));
  tapa.appendChild(el('h1', null, p.nombre));
  tapa.appendChild(el('p', 'bajada', p.bajada));
  tapa.appendChild(el('p', 'que', p.que_es));
  const fr = el('div', 'franjas');
  p.franjas.forEach(([d, a, b]) => {
    const x = el('div', 'franja');
    x.appendChild(el('b', null, d));
    x.appendChild(el('span', 'mono', a + ' a ' + b));
    fr.appendChild(x);
  });
  tapa.appendChild(fr);
  const ficha = el('div', 'ficha');
  p.ficha.forEach(([k, v]) => {
    if (k === 'Emisión' || k === 'Duración') return;   // ya están en las franjas
    const d = el('div');
    d.appendChild(el('b', null, k));
    d.appendChild(el('span', null, v));
    ficha.appendChild(d);
  });
  tapa.appendChild(ficha);
  hoja.appendChild(tapa);

  // los tres accesos
  let s = el('section');
  s.appendChild(titulo('Empezá por acá',
    'Los tres documentos que contestan casi todo. Se abren en el Drive y ' +
    'desde el celular se imprimen igual.'));
  const acc = el('div', 'accesos');
  p.entradas.forEach((e, i) => {
    const a = el('a', 'acceso');
    a.href = 'https://docs.google.com/document/d/' + e.id + '/edit';
    a.target = '_blank'; a.rel = 'noopener';
    a.appendChild(el('span', 'n', String(i + 1).padStart(2, '0')));
    a.appendChild(el('h3', null, e.rotulo));
    a.appendChild(el('p', null, e.para));
    a.appendChild(el('span', 'abrir', e.carpeta + ' →'));
    acc.appendChild(a);
  });
  s.appendChild(acc);
  hoja.appendChild(s);

  // la escaleta
  s = el('section');
  s.appendChild(titulo('La escaleta',
    'Los horarios son los reales de aire. Si un bloque se estira, se recorta ' +
    'del siguiente.'));
  const tira = el('div', 'vivo');
  tira.id = 'vivo';
  tira.appendChild(el('span', 'punto'));
  const vq = el('b'); vq.id = 'vivo-que'; tira.appendChild(vq);
  const vc = el('span'); vc.id = 'vivo-cuando'; tira.appendChild(vc);
  s.appendChild(tira);
  p.escaletas.forEach((es) => s.appendChild(tablaEscaleta(es, p.acento_negro)));
  if (p.nota) {
    const av = el('div', 'aviso bien');
    av.style.marginTop = '12px';
    const cu = el('div', 'cuerpo');
    cu.appendChild(el('h3', null, 'Lo que no hay que perder de vista'));
    cu.appendChild(el('p', null, p.nota));
    av.appendChild(cu);
    s.appendChild(av);
  }
  s.appendChild(titulo('La semana de producción',
    'Con la hora límite de cada cosa. Lo que no está a esa hora, no entra.'));
  s.appendChild(filas(p.semana.map(([d, q, h]) => [d, q, h])));
  hoja.appendChild(s);

  // el material
  s = el('section');
  s.appendChild(titulo('Todo el material',
    'Las ocho carpetas del programa en el Drive, con lo que hay adentro.'));
  hoja.appendChild(s);
  p.carpetas.forEach((c) => {
    const g = el('div', 'grupo');
    const cab = el('div', 'cab');
    const h3 = el('h3');
    h3.appendChild(el('span', null, c.nombre.split(' ')[0]));
    h3.appendChild(document.createTextNode(c.nombre.replace(/^\d+\s*·\s*/, '')));
    cab.appendChild(h3);
    cab.appendChild(el('p', null, c.para));
    g.appendChild(cab);
    c.docs.forEach((d) => {
      const a = el('a', 'doc');
      a.href = 'https://docs.google.com/document/d/' + d.id + '/edit';
      a.target = '_blank'; a.rel = 'noopener';
      a.appendChild(el('span', 'marca'));
      a.appendChild(el('span', 't', d.titulo));
      a.appendChild(el('span', 'flecha', '→'));
      g.appendChild(a);
    });
    if (c.carpeta_id) {
      const v = el('a', 'vercarpeta', 'Abrir la carpeta en el Drive →');
      v.href = 'https://drive.google.com/drive/folders/' + c.carpeta_id;
      v.target = '_blank'; v.rel = 'noopener';
      g.appendChild(v);
    }
    s.appendChild(g);
  });

  // la pauta
  s = el('section');
  s.appendChild(titulo('Si salís a conseguir pauta',
    'Un kit de marca se vende a ' + plata(p.pauta.kit_base) + ' por mes, y eso ' +
    'es lo que cubre la parte de un integrante.'));
  const tj = el('div', 'tarjetas');
  [['En cámara', p.pauta.integrantes, 'integrantes que cubre el modelo'],
   ['Kits que hacen falta', p.pauta.kits, 'uno por integrante'],
   ['Lo que cubre por mes', plata(p.pauta.ingreso), 'con los kits vendidos']
  ].forEach(([et, dato, pie], i) => {
    const t = el('div', 'tarjeta' + (i === 1 ? ' pinta' : ''));
    t.appendChild(el('p', 'et', et));
    t.appendChild(el('p', 'dato', String(dato)));
    t.appendChild(el('p', 'pie', pie));
    tj.appendChild(t);
  });
  s.appendChild(tj);
  s.appendChild(filas(p.pauta.escalones.map(
    ([n, precio, que]) => [plata(precio), n + ' · ' + que])));
  s.appendChild(titulo('Lo que falta definir',
    'Si podés cerrar alguno de estos, decilo abajo.'));
  s.appendChild(filas(p.falta.map((f, i) => [String(i + 1).padStart(2, '0'), f])));
  hoja.appendChild(s);

  seccionIdeas(p);
  reloj();
}

// ------------------------------------------------------------------ las ideas

function seccionIdeas(p) {
  const hoja = $('hoja');
  const s = el('section');
  s.appendChild(titulo('Dejar una idea',
    'Para un bloque, un invitado, un clip, lo que sea. Lo lee producción ' +
    'general y queda escrito acá, no se pierde en un chat.'));

  const form = el('form');
  const lab = el('label');
  lab.appendChild(el('span', null, 'Tu idea'));
  const ta = el('textarea');
  ta.rows = 3;
  ta.required = true;
  ta.placeholder = 'Escribila como se te ocurra.';
  lab.appendChild(ta);
  form.appendChild(lab);

  const bot = el('button', null, 'Dejarla');
  bot.type = 'submit';
  form.appendChild(bot);
  s.appendChild(form);

  const dicho = el('p', 'dicho');
  s.appendChild(dicho);

  const lista = el('div', 'filas');
  s.appendChild(lista);
  hoja.appendChild(s);

  async function traer() {
    const { data, error } = await sb.from('ideas')
      .select('texto, creado, estado, autor_id')
      .eq('programa_id', p.programa_id)
      .order('creado', { ascending: false })
      .limit(40);
    lista.textContent = '';
    if (error) { lista.appendChild(el('div', 'vacio', 'No se pudieron leer las ideas.')); return; }
    if (!data.length) {
      lista.appendChild(el('div', 'vacio',
        'Todavía no hay ninguna. La primera que entre aparece acá sola.'));
      return;
    }
    data.forEach((i) => {
      const f = el('div', 'fila');
      const izq = el('div', 'izq');
      const b = el('b', 'et');
      b.style.color = 'var(--acento)';
      b.textContent = new Date(i.creado).toLocaleDateString('es-AR',
        { day: '2-digit', month: '2-digit' });
      izq.appendChild(b);
      f.appendChild(izq);
      const der = el('div', 'der');
      const t = el('p', null, i.texto);
      t.style.color = 'var(--tinta)';
      t.style.fontSize = '15px';
      der.appendChild(t);
      if (i.estado && i.estado !== 'nueva') {
        der.appendChild(el('p', 'mono chico', i.estado));
      }
      f.appendChild(der);
      lista.appendChild(f);
    });
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const texto = ta.value.trim();
    if (!texto) return;
    bot.disabled = true;
    const { error } = await sb.from('ideas').insert({
      programa_id: p.programa_id, texto, autor_id: estado.persona,
    });
    bot.disabled = false;
    if (error) {
      dicho.className = 'dicho mal';
      dicho.textContent = 'No se pudo guardar: ' + error.message;
      return;
    }
    ta.value = '';
    dicho.className = 'dicho bien';
    dicho.textContent = 'Quedó anotada.';
    traer();
  });

  traer();
}

// --------------------------------------------------------- la hoja: dirección

async function pintarDireccion() {
  const hoja = $('hoja');
  hoja.textContent = '';
  hoja.style.setProperty('--acento', '#5495E8');
  $('quien').textContent = 'Dirección';

  const tapa = el('div', 'tapa');
  tapa.appendChild(el('p', 'et', 'Primera temporada 2026 · uso interno'));
  tapa.appendChild(el('h1', null, 'Producción'));
  tapa.appendChild(el('p', 'bajada', 'El estudio, la grilla y la plata'));
  tapa.appendChild(el('p', 'que',
    'Todo lo de la casa en un lugar. Esta pantalla sólo la ve dirección: no ' +
    'es que el resto no la vea, es que el servidor no se la manda.'));
  hoja.appendChild(tapa);

  const s = el('section');
  s.appendChild(titulo('El estudio este mes', 'Lo que se alquiló y lo que entró.'));
  const cifras = el('div', 'cifras');
  s.appendChild(cifras);
  hoja.appendChild(s);

  const desde = new Date();
  desde.setDate(1);
  const iso = desde.toISOString().slice(0, 10);

  const [ses, fac, cos, aus] = await Promise.all([
    sb.from('sesiones').select('horas, monto, estado, fecha').gte('fecha', iso),
    sb.from('facturas').select('monto, emitida').gte('emitida', iso),
    sb.from('costos').select('monto, creado').gte('creado', iso),
    sb.from('auspicios').select('marca, producto, monto_mes, estado'),
  ]);

  const hs = (ses.data || []).reduce((a, x) => a + Number(x.horas), 0);
  const cobrado = (ses.data || [])
    .filter((x) => x.estado !== 'interno')
    .reduce((a, x) => a + Number(x.monto), 0);
  const costos = (cos.data || []).reduce((a, x) => a + Number(x.monto), 0);
  const facturado = (fac.data || []).reduce((a, x) => a + Number(x.monto), 0);

  [['Horas de estudio', hs ? hs.toFixed(1).replace('.0', '') : '0', 'alquiladas este mes'],
   ['Cobrado', plata(cobrado), 'sin contar los programas propios'],
   ['Facturado', plata(facturado), 'emitido este mes'],
   ['Costos', plata(costos), 'operador, asistente, producción'],
   ['Margen', plata(cobrado - costos), 'lo cobrado menos lo que costó']
  ].forEach(([et, n, pie], i) => {
    const c = el('div', 'cifra' + (i === 4 && cobrado - costos > 0 ? ' ok' : ''));
    c.appendChild(el('span', 'et', et));
    c.appendChild(el('span', 'n', String(n)));
    c.appendChild(el('span', 'pie', pie));
    cifras.appendChild(c);
  });

  if (!(ses.data || []).length) {
    const v = el('div', 'vacio',
      'Todavía no hay jornadas cargadas este mes, así que los números están ' +
      'en cero. No es una falla: es que no se cargó nada.');
    v.style.marginTop = '12px';
    s.appendChild(v);
  }

  // auspicios
  const sa = el('section');
  sa.appendChild(titulo('Auspicios', 'Lo que está en charla y lo que ya cerró.'));
  const lista = aus.data || [];
  if (!lista.length) {
    sa.appendChild(el('div', 'vacio', 'Todavía no hay ninguno cargado.'));
  } else {
    sa.appendChild(filas(lista.map((a) => [
      plata(a.monto_mes), a.marca + ' · ' + a.producto, a.estado])));
  }
  hoja.appendChild(sa);

  // el piso
  if (estado.estudio) {
    const sp = el('section');
    sp.appendChild(titulo('El piso', 'Cuánto aire y cuánto armado tiene cada día.'));
    sp.appendChild(filas(estado.estudio.piso.map(([d, aire, armado]) => [
      d, horas(aire) + ' de aire', horas(armado) + ' de armado y prueba'])));
    sp.appendChild(titulo('Tarifas', 'Con el equipo técnico en el piso. La sala vacía no se alquila.'));
    sp.appendChild(filas(estado.estudio.tarifas.map(([serv, plan, precio]) => [
      plata(precio), serv + ' · ' + plan])));
    hoja.appendChild(sp);
  }

  // los programas
  const sg = el('section');
  sg.appendChild(titulo('Los programas', 'Entrá a cualquiera.'));
  const g = el('div', 'programas');
  estado.programas.forEach((p) => {
    const a = el('a', 'pro');
    a.href = '#' + p.slug;
    const b = el('b', null, p.nombre);
    b.style.color = p.acento_negro;
    a.appendChild(b);
    a.appendChild(el('span', null, p.bajada));
    a.appendChild(el('span', 'cuando',
      p.franjas.map(([d, i, f]) => d + ' ' + i + '–' + f).join(' · ')));
    g.appendChild(a);
  });
  sg.appendChild(g);
  hoja.appendChild(sg);
}

// ------------------------------------------------------------- el selector

function pintarInicio() {
  const hoja = $('hoja');
  hoja.textContent = '';
  hoja.style.setProperty('--acento', '#5495E8');
  $('quien').textContent = 'Producción';
  const tapa = el('div', 'tapa');
  tapa.appendChild(el('p', 'et', 'Uso interno'));
  tapa.appendChild(el('h1', null, 'Tus programas'));
  hoja.appendChild(tapa);
  const g = el('div', 'programas');
  estado.programas.forEach((p) => {
    const a = el('a', 'pro');
    a.href = '#' + p.slug;
    const b = el('b', null, p.nombre);
    b.style.color = p.acento_negro;
    a.appendChild(b);
    a.appendChild(el('span', null, p.bajada));
    a.appendChild(el('span', 'cuando',
      p.franjas.map(([d, i, f]) => d + ' ' + i + '–' + f).join(' · ')));
    g.appendChild(a);
  });
  hoja.appendChild(g);
}

// ---------------------------------------------------------------- el reloj

function reloj() {
  const tira = $('vivo');
  const tablas = [].slice.call(document.querySelectorAll('table[data-dia]'));
  if (!tira || !tablas.length) return;

  function pintar() {
    const m = ahoraBA();
    if (m === null) return;
    let vivo = null, espera = SEMANA + 1, proxima = null;

    tablas.forEach((tb) => {
      const base = +tb.dataset.dia * 1440;
      const a = base + +tb.dataset.i, b = base + +tb.dataset.f;
      const aire = dentro(m, a, b);
      [].slice.call(tb.querySelectorAll('tbody tr')).forEach((tr) => {
        if (tr.dataset.i === undefined || aire === null) {
          tr.classList.remove('ahora', 'pasado');
          return;
        }
        const fa = base + +tr.dataset.i, fb = base + +tr.dataset.f;
        tr.classList.toggle('ahora', aire >= fa && aire < fb);
        tr.classList.toggle('pasado', aire >= fb);
      });
      if (aire !== null) {
        const act = tb.querySelector('tr.ahora');
        if (act) vivo = { bloque: act.querySelector('.bloque b').textContent,
                          quedan: base + +act.dataset.f - aire };
      } else {
        let d = a - m; while (d < 0) d += SEMANA;
        if (d < espera) { espera = d; proxima = tb; }
      }
    });

    tira.classList.add('hay');
    tira.classList.toggle('aire', !!vivo);
    if (vivo) {
      $('vivo-que').textContent = 'Al aire ahora · ' + vivo.bloque;
      $('vivo-cuando').textContent = 'quedan ' + falta(Math.max(0, vivo.quedan));
    } else if (proxima) {
      $('vivo-que').textContent = 'Próxima emisión · ' + DIAS[+proxima.dataset.dia] +
        ' ' + proxima.querySelector('tbody .hora').textContent;
      $('vivo-cuando').textContent = espera < 1440 ? 'en ' + falta(espera)
        : 'en ' + Math.round(espera / 1440) + ' días';
    }
  }

  // Y que la de hoy quede primera: el que abre esto un miércoles a las 19:40
  // no tiene que buscar el miércoles.
  const m0 = ahoraBA();
  if (m0 !== null) {
    const hoy = Math.floor(m0 / 1440);
    tablas.forEach((tb) => {
      if (+tb.dataset.dia !== hoy) return;
      const cap = tb.querySelector('caption'), caja = tb.parentNode;
      if (cap && !cap.querySelector('.hoy')) {
        cap.appendChild(el('span', 'hoy', 'HOY'));
      }
      const primera = caja.parentNode.querySelector('.envuelve');
      if (primera && primera !== caja) caja.parentNode.insertBefore(caja, primera);
    });
  }

  pintar();
  clearInterval(reloj._t);
  reloj._t = setInterval(pintar, 30000);
}

// ------------------------------------------------------------------ el ruteo

function ruta() {
  const donde = location.hash.replace('#', '');
  const p = estado.programas.find((x) => x.slug === donde);
  if (p) { pintarPrograma(p); }
  else if (estado.rol === 'direccion') { pintarDireccion(); }
  else if (estado.programas.length === 1) { pintarPrograma(estado.programas[0]); }
  else { pintarInicio(); }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', ruta);

// ------------------------------------------------------------------- arranque

async function arrancar() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { puerta(); return; }

  try {
    // El id de la persona, para firmar las ideas. Si no hay fila, entró
    // alguien con cuenta pero sin cargar: se lo decimos en vez de romper.
    const { data: yo } = await sb.rpc('mi_persona');
    estado.persona = yo || null;
    await cargar();
  } catch (e) {
    puerta('Entraste, pero algo falló al cargar: ' + e.message, 'mal');
    return;
  }

  if (!estado.rol) {
    await sb.auth.signOut();
    puerta('Tu mail no está cargado en producción todavía. Pedile a ' +
           'producción general que te dé de alta y volvé a entrar.', 'mal');
    return;
  }

  // El programa_id lo necesita la caja de ideas, y no viene en el contenido.
  const { data: gs } = await sb.from('programas').select('id, slug');
  (gs || []).forEach((g) => {
    const p = estado.programas.find((x) => x.slug === g.slug);
    if (p) p.programa_id = g.id;
  });

  $('esperando').hidden = true;
  $('puerta').hidden = true;
  $('adentro').hidden = false;
  barra();
  ruta();
}

sb.auth.onAuthStateChange((evento) => {
  if (evento === 'SIGNED_IN' && $('adentro').hidden) arrancar();
});

arrancar();
