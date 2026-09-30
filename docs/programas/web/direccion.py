# -*- coding: utf-8 -*-
"""La pagina de direccion: el dashboard, la grilla y los cinco programas.

    python3 direccion.py       escribe salida/direccion.html

Esta es la unica pagina donde viven los numeros del estudio. Las paginas de
los integrantes no los llevan adentro, asi que no hay nada que espiar en su
codigo: el link es el acceso.

Las horas y lo cobrado no estan escritos aca. Los carga produccion general a
medida que pasan, y quedan en la base de esta pagina. Lo que si esta escrito
es el plan: lo que la grilla implica por semana y el objetivo de auspicios,
que salen de `datos.py` y de `comercial.py`. Al lado de eso se lee si lo real
va bien o va corto.
"""
import json
import os

import datos_web as W
import sitio as S

SALIDA = S.SALIDA
ENLACES = os.path.join(SALIDA, "enlaces.json")


def enlaces():
    """slug -> link publicado de su pagina, si ya existe el archivo."""
    if os.path.exists(ENLACES):
        return json.load(open(ENLACES, encoding="utf-8"))
    return {}


def pagina():
    docs = W.documentos()
    links = enlaces()
    o = []
    secciones = [("dashboard", "Dashboard"), ("estudio", "Horas"),
                 ("auspicios", "Auspicios"), ("grilla", "La grilla"),
                 ("programas", "Programas"), ("falta", "Falta")]
    o.append(S.cabeza("Producción Nexo"))
    o.append(S.barra('Producción general <i>· dirección</i>', None, secciones))
    o.append('<div class="hoja">')

    # portada
    piso = W.piso_por_dia()
    semanal = sum(a + m for _, a, m in piso)
    o.append('<div class="tapa"><p class="et">' + S.esc(W.TEMPORADA) +
             ' · uso interno</p>'
             '<h1>Producción Nexo</h1>'
             '<p class="bajada">Cinco programas, dos días de piso</p>'
             '<p class="que">Todo lo de la temporada en un lugar: lo que el '
             'estudio factura, cómo va la venta de auspicios, la grilla con sus '
             'cambios de piso, y la página de cada programa con su material.</p>'
             '<div class="franjas">')
    for dia, aire, armado in piso:
        o.append('<div class="franja"><b>%s</b><span class="mono">%s aire + %s '
                 'armado</span></div>' % (S.esc(dia), W.horas(aire),
                                          W.horas(armado)))
    o.append('<div class="franja"><b>Por semana</b><span class="mono">%s de '
             'piso</span></div></div></div>' % W.horas(semanal))

    # ---------------------------------------------------------- dashboard
    obj = W.objetivo()
    o.append("""<section id="dashboard"><div class="titulo"><h2>Este mes</h2>
<p>Lo real sale de lo que cargues abajo. Al lado está el plan, para saber si
va bien o va corto.</p></div>
<div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap;
  margin-bottom:14px">
  <label style="max-width:190px"><span>Mes</span>
    <input type="month" id="mes"></label>
  <span class="dicho" id="d-estado">Cargando lo guardado&#8230;</span>
</div>
<div class="tarjetas">
  <div class="tarjeta"><p class="et">Horas de piso</p>
    <p class="dato" id="k-horas">—</p>
    <p class="pie">el plan son %(semanal)s por semana</p></div>
  <div class="tarjeta"><p class="et">Facturado</p>
    <p class="dato" id="k-facturado">—</p>
    <p class="pie" id="k-sesiones">sin sesiones cargadas</p></div>
  <div class="tarjeta"><p class="et">Cobrado</p>
    <p class="dato" id="k-cobrado">—</p>
    <p class="pie" id="k-pendiente">nada pendiente</p></div>
  <div class="tarjeta pinta"><p class="et">Auspicios cerrados</p>
    <p class="dato" id="k-auspicios">—</p>
    <p class="pie">el objetivo es %(objetivo)s por mes</p></div>
</div>
<div class="aviso" id="k-aviso" style="margin-top:12px"><div class="cuerpo">
  <h3 id="k-aviso-t">El plan de la temporada</h3>
  <p id="k-aviso-p">%(kits)d kits de marca a %(kit)s cubren los cuatro
  programas que van por integrante, y el naming del ciclo de %(naming)s cubre
  Pequeños Grandes Sabios. Total %(objetivo)s por mes.</p></div></div>
</section>""" % {"semanal": W.horas(semanal), "objetivo": W.plata(obj["total"]),
                 "kits": obj["kits"], "kit": W.plata(150_000),
                 "naming": W.plata(obj["naming"])})

    # --------------------------------------------- horas y lo que se cobra
    clientes = "".join('<option>%s</option>' % S.esc(W.PROG[s]["nombre"])
                       for s in W.ORDEN)
    tarifas_js = json.dumps(
        [{"t": t, "p": p, "v": v} for t, p, v in W.TARIFAS], ensure_ascii=False)
    o.append("""<section id="estudio"><div class="titulo">
<h2>Horas de estudio</h2><p>Una fila por jornada. Sirve igual para un programa
propio que para un cliente de afuera: lo que cambia es a quién se le factura.
</p></div>
<form id="f-sesion" hidden>
  <div class="campos">
    <label><span>Fecha</span><input type="date" id="s-fecha" required></label>
    <label><span>Para quién</span><input id="s-cliente" list="l-clientes"
      placeholder="Programa o cliente" required>
      <datalist id="l-clientes">%(clientes)s</datalist></label>
    <label><span>Servicio</span><select id="s-tarifa"></select></label>
    <label><span>Horas</span><input type="number" id="s-horas" min="%(min)d"
      step="0.5" value="%(min)d" required></label>
    <label><span>Se factura</span><input type="number" id="s-monto" min="0"
      step="1000" required></label>
    <label><span>Estado</span><select id="s-estado">
      <option>Pendiente de cobro</option><option>Cobrado</option>
      <option>Interno, no se factura</option></select></label>
  </div>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <button type="submit" id="s-enviar">Anotar la jornada</button>
    <span class="dicho" id="s-dicho">La jornada mínima es de %(min)d horas.</span>
  </div>
</form>
<div class="aviso" id="s-sin" hidden><div class="cuerpo">
  <h3>Esta vista no puede guardar</h3>
  <p>Para cargar horas hace falta entrar con la cuenta que tiene acceso de
  edición a esta página.</p></div></div>
<div style="height:14px"></div>
<div id="s-lista"><div class="vacio">No hay jornadas cargadas en este mes.
La primera que anotes aparece acá.</div></div>
<div style="height:26px"></div>
<div class="titulo"><h2>La grilla de precios</h2><p>De lanzamiento, por los
primeros tres meses. Todo por hora, con el equipo técnico en el piso: la sala
vacía no se alquila.</p></div>
<div class="filas">""" % {"clientes": clientes, "min": W.JORNADA_MINIMA})
    for tipo, paquete, precio in W.TARIFAS:
        o.append('<div class="fila"><div class="izq"><b class="mono" '
                 'style="color:var(--acento);font-size:14px">%s</b></div>'
                 '<div class="der"><h3>%s</h3><p>%s</p></div></div>'
                 % (S.esc(W.plata(precio)), S.esc(tipo), S.esc(paquete)))
    o.append('</div><p class="chico media" style="margin-top:10px">Descuentos '
             'por contrato: %s. Jornada mínima de %d horas. La preproducción y '
             'la edición se cotizan aparte y se cierran antes de tomar la '
             'fecha. Falta definir si el descuento por meses se aplica sobre '
             'el precio de lista o sobre el de paquete, que ya viene '
             'bonificado.</p></section>'
             % (", ".join("%d meses seguidos %d%%" % (m, d)
                          for m, d in W.DESCUENTOS), W.JORNADA_MINIMA))

    # ------------------------------------------------------------ auspicios
    o.append("""<section id="auspicios"><div class="titulo">
<h2>Auspicios</h2><p>Una fila por marca. El objetivo de la grilla son %(obj)s
por mes y se llega sumando kits, no buscando una marca grande.</p></div>
<form id="f-auspicio" hidden>
  <div class="campos">
    <label><span>Marca</span><input id="a-marca" required></label>
    <label><span>Programa</span><select id="a-programa">%(progs)s
      <option>Toda la grilla</option></select></label>
    <label><span>Producto</span><select id="a-producto"></select></label>
    <label><span>Por mes</span><input type="number" id="a-monto" min="0"
      step="1000" required></label>
    <label><span>Desde</span><input type="month" id="a-desde"></label>
    <label><span>Estado</span><select id="a-estado">
      <option>Cerrado</option><option>En charla</option>
      <option>Propuesta enviada</option></select></label>
  </div>
  <label><span>Quién lo trajo</span><input id="a-quien"
    placeholder="El integrante que consiguió el contacto"></label>
  <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <button type="submit" id="a-enviar">Anotar el auspicio</button>
    <span class="dicho" id="a-dicho"></span>
  </div>
</form>
<div style="height:14px"></div>
<div id="a-lista"><div class="vacio">Todavía no hay auspicios cargados.
Van acá a medida que se cierran, y el cuadro de arriba los suma.</div></div>
</section>""" % {"obj": W.plata(obj["total"]),
                 "progs": "".join('<option>%s</option>' % S.esc(W.PROG[s]["nombre"])
                                  for s in W.ORDEN)})

    # ---------------------------------------------------------- la grilla
    o.append('<section id="grilla"><div class="titulo"><h2>La semana</h2>'
             '<p>El hueco se mide de punta a punta: desde que uno sale del aire '
             'hasta que el otro entra.</p></div>'
             '<div class="envuelve"><table><caption>Cambios de piso</caption>'
             '<thead><tr><th>Día</th><th>Pase</th><th class="desc">Hueco</th>'
             '<th>Cómo cierra</th></tr></thead><tbody>')
    for dia, sale, entra, hueco, nec, ok, directo in W.cambios_de_piso():
        if directo:
            estado, color = "Pase directo", "var(--ok)"
            detalle = "no se arma: se pasa"
        elif ok:
            estado, color = "Alcanza", "var(--media)"
            detalle = "%d min, arma en %d" % (hueco, nec)
        else:
            estado, color = "Faltan %d min" % (nec - hueco), "var(--mal)"
            detalle = "%d min, arma en %d" % (hueco, nec)
        o.append('<tr><td class="hora">%s</td><td class="bloque">'
                 '<b>%s</b> <span class="media">→</span> <b>%s</b>'
                 '<span class="chica">%s</span></td>'
                 '<td class="desc">%s</td><td class="que" '
                 'style="color:%s;font-weight:600">%s</td></tr>'
                 % (S.esc(dia), S.esc(sale), S.esc(entra), S.esc(detalle),
                    S.esc(detalle), color, S.esc(estado)))
    o.append('</tbody></table></div>')
    o.append('<div class="aviso" style="margin-top:12px"><div class="cuerpo">'
             '<h3>El número en vivo del miércoles es lo que queda apretado</h3>'
             '<p>El pase directo resuelve la mesa, no el show. La banda o el '
             'stand-up no puede probar sonido a las 20:00 ni a las 19:00: El '
             'Motivo está al aire en la misma sala. Prueba antes de las 18:00 '
             'y espera hasta su bloque. Hay que avisárselo cuando se lo '
             'confirma, no el mismo día.</p></div></div></section>')

    # ------------------------------------------------------- los programas
    o.append('<section id="programas"><div class="titulo">'
             '<h2>Los cinco programas</h2><p>Cada uno tiene su propia página, '
             'que es la que se le pasa a su gente. No llevan los números de '
             'esta.</p></div><div class="accesos">')
    for i, slug in enumerate(W.ORDEN, 1):
        p = W.PROG[slug]
        num = W.numero(slug)
        franjas = " · ".join("%s %s" % (d[:3], a) for d, a, _ in W.franjas(slug))
        link = links.get(slug) or (W.CARPETA % W.id_de_carpeta(slug, "1 · Formato"))
        cual = "su página" if links.get(slug) else "su carpeta del Drive"
        o.append('<a class="acceso" href="%s" target="_blank" rel="noopener">'
                 '<span class="n">%02d</span><h3>%s</h3>'
                 '<p>%s · %d en cámara · %d kits</p>'
                 '<span class="abrir">Abrir %s →</span></a>'
                 % (S.atr(link), i, S.esc(p["nombre"]), S.esc(franjas),
                    num["integrantes"], num["kits"], cual))
    o.append('</div>')

    # 99 · Estudio
    o.append('<div style="height:26px"></div><div class="titulo">'
             '<h2>99 · Estudio</h2><p>Lo transversal: la grilla, los precios, '
             'los roles y los mensajes para repartir.</p></div>'
             '<div class="grupo">')
    for titulo, did in docs["estudio"][""]:
        o.append('<a class="doc" href="%s" target="_blank" rel="noopener">'
                 '<span class="marca"></span><span class="t">%s</span>'
                 '<span class="flecha">→</span></a>'
                 % (S.atr(W.DOC % did), S.esc(titulo)))
    for titulo, did in docs["raiz"][""]:
        o.append('<a class="doc" href="%s" target="_blank" rel="noopener">'
                 '<span class="marca"></span><span class="t">%s</span>'
                 '<span class="flecha">→</span></a>'
                 % (S.atr(W.DOC % did), S.esc(titulo)))
    o.append('<a class="vercarpeta" href="%s" target="_blank" rel="noopener">'
             'Abrir la carpeta general en el Drive →</a></div></section>'
             % S.atr(W.CARPETA % W.M.RAIZ))

    # ------------------------------------------------------ lo que falta
    o.append('<section id="falta"><div class="titulo"><h2>Lo que falta '
             'resolver</h2><p>Por programa, como está escrito en su hoja de '
             'formato.</p></div><div class="filas">')
    for slug in W.ORDEN:
        p = W.PROG[slug]
        for que in p.get("falta", []):
            o.append('<div class="fila"><div class="izq"><b class="et" '
                     'style="color:var(--acento)">%s</b></div>'
                     '<div class="der"><p style="color:var(--tinta);'
                     'font-size:15px">%s</p></div></div>'
                     % (S.esc(p["corto"]), S.esc(que)))
    o.append('</div><p class="chico media" style="margin-top:10px">Las ideas '
             'que deja cada equipo quedan en la página de su programa: las '
             'bases no se cruzan entre páginas. Se leen abriendo cada una.</p>'
             '</section>')

    o.append('</div>')
    o.append(S.pie("99 · Estudio"))
    o.append(js(tarifas_js, obj["total"]))
    return "".join(o)


def js(tarifas_js, objetivo_mes):
    return """<script>
(function(){
  var TARIFAS=%(tarifas)s, OBJETIVO=%(objetivo)d,
      PRODUCTOS=[["Kit de marca",150000],["Kit doble",300000],
                 ["Naming de bloque",300000],["Naming del ciclo",600000],
                 ["A cotizar",0]];
  var db=null, sesiones=[], auspicios=[];
  var $=function(id){return document.getElementById(id)};

  function pesos(n){
    return '$ '+Math.round(n||0).toLocaleString('es-AR');
  }
  function mesDe(f){ return (f||'').slice(0,7); }
  function hoyMes(){
    var d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  }
  function fechaCorta(f){
    var p=(f||'').split('-');
    return p.length===3 ? p[2]+'/'+p[1] : (f||'');
  }

  // los selects que salen de la grilla de precios
  TARIFAS.forEach(function(t,i){
    var op=document.createElement('option');
    op.value=String(i); op.textContent=t.t+' · '+t.p;
    $('s-tarifa').appendChild(op);
  });
  PRODUCTOS.forEach(function(p){
    var op=document.createElement('option');
    op.value=p[0]; op.textContent=p[0]+(p[1]?' · '+pesos(p[1]):'');
    $('a-producto').appendChild(op);
  });
  function sugerirMonto(){
    var t=TARIFAS[Number($('s-tarifa').value)||0],
        h=Number($('s-horas').value)||0;
    if(t) $('s-monto').value=Math.round(t.v*h);
  }
  $('s-tarifa').addEventListener('change',sugerirMonto);
  $('s-horas').addEventListener('input',sugerirMonto);
  $('a-producto').addEventListener('change',function(){
    var p=PRODUCTOS.filter(function(x){return x[0]===$('a-producto').value})[0];
    if(p&&p[1]) $('a-monto').value=p[1];
  });

  function tabla(filas, columnas){
    var env=document.createElement('div'); env.className='envuelve';
    var t=document.createElement('table'); t.className='datos';
    var thead=document.createElement('thead'), tr=document.createElement('tr');
    columnas.forEach(function(c){
      var th=document.createElement('th'); th.textContent=c[0];
      tr.appendChild(th);
    });
    thead.appendChild(tr); t.appendChild(thead);
    var tb=document.createElement('tbody');
    filas.forEach(function(f){
      var fila=document.createElement('tr');
      columnas.forEach(function(c){
        var td=document.createElement('td');
        td.className=c[2]||'';
        td.setAttribute('data-et', c[0]);   // el rótulo que se ve en celular
        td.textContent=c[1](f);
        fila.appendChild(td);
      });
      tb.appendChild(fila);
    });
    t.appendChild(tb); env.appendChild(t);
    return env;
  }

  function pintar(){
    var mes=$('mes').value||hoyMes();
    var delMes=sesiones.filter(function(s){return mesDe(s.fecha)===mes});
    var horas=delMes.reduce(function(a,s){return a+(Number(s.horas)||0)},0);
    var factura=delMes.filter(function(s){return s.estado!=='Interno, no se factura'});
    var facturado=factura.reduce(function(a,s){return a+(Number(s.monto)||0)},0);
    var cobrado=factura.filter(function(s){return s.estado==='Cobrado'})
                       .reduce(function(a,s){return a+(Number(s.monto)||0)},0);
    var cerrados=auspicios.filter(function(a){
      return a.estado==='Cerrado' && (!a.desde || a.desde<=mes);
    });
    var suma=cerrados.reduce(function(a,x){return a+(Number(x.monto)||0)},0);

    $('k-horas').textContent = horas ? (horas+' h') : '0 h';
    $('k-facturado').textContent = pesos(facturado);
    $('k-cobrado').textContent = pesos(cobrado);
    $('k-auspicios').textContent = pesos(suma);
    $('k-sesiones').textContent = delMes.length
      ? (delMes.length+(delMes.length===1?' jornada':' jornadas')+' cargadas')
      : 'sin jornadas cargadas';
    var falta=facturado-cobrado;
    $('k-pendiente').textContent = falta>0 ? (pesos(falta)+' pendientes')
                                           : 'nada pendiente';
    var av=$('k-aviso'), t=$('k-aviso-t'), p=$('k-aviso-p');
    if(suma<=0){
      av.className='aviso';
      t.textContent='Todavía no hay auspicios cerrados';
      p.textContent='El objetivo es '+pesos(OBJETIVO)+' por mes. Se llega '+
        'sumando kits, uno por integrante, no buscando una marca grande.';
    }else if(suma>=OBJETIVO){
      av.className='aviso bien';
      t.textContent='La grilla se sostiene sola';
      p.textContent=pesos(suma)+' cerrados contra un objetivo de '+
        pesos(OBJETIVO)+' por mes.';
    }else{
      av.className='aviso';
      t.textContent='Faltan '+pesos(OBJETIVO-suma)+' por mes';
      p.textContent=pesos(suma)+' cerrados de '+pesos(OBJETIVO)+'. Son '+
        Math.ceil((OBJETIVO-suma)/150000)+' kits de marca más.';
    }

    var ls=$('s-lista'); ls.textContent='';
    if(!delMes.length){
      var v=document.createElement('div'); v.className='vacio';
      v.textContent='No hay jornadas cargadas en este mes. La primera que '+
        'anotes aparece acá.';
      ls.appendChild(v);
    }else{
      delMes.sort(function(a,b){return (a.fecha||'')<(b.fecha||'')?-1:1});
      ls.appendChild(tabla(delMes,[
        ['Fecha',function(s){return fechaCorta(s.fecha)},'hora'],
        ['Para quién',function(s){return s.cliente||''},''],
        ['Servicio',function(s){return s.servicio||''},'que'],
        ['Horas',function(s){return (s.horas||0)+' h'},'dur'],
        ['Se factura',function(s){return pesos(s.monto)},'num'],
        ['Estado',function(s){return s.estado||''},'que']
      ]));
    }

    var la=$('a-lista'); la.textContent='';
    if(!auspicios.length){
      var v2=document.createElement('div'); v2.className='vacio';
      v2.textContent='Todavía no hay auspicios cargados. Van acá a medida que '+
        'se cierran, y el cuadro de arriba los suma.';
      la.appendChild(v2);
    }else{
      auspicios.sort(function(a,b){return (a.marca||'')<(b.marca||'')?-1:1});
      la.appendChild(tabla(auspicios,[
        ['Marca',function(a){return a.marca||''},''],
        ['Programa',function(a){return a.programa||''},'que'],
        ['Producto',function(a){return a.producto||''},'que'],
        ['Por mes',function(a){return pesos(a.monto)},'num'],
        ['Desde',function(a){return a.desde||'—'},'hora'],
        ['Estado',function(a){return a.estado||''},'que'],
        ['Lo trajo',function(a){return a.quien||'—'},'que']
      ]));
    }
  }

  $('mes').value=hoyMes();
  $('a-desde').value=hoyMes();
  $('mes').addEventListener('change',pintar);
  sugerirMonto();
  pintar();

  (async function(){
    db = await (window.claude&&window.claude.use ? window.claude.use('db') : null);
    if(!db){
      $('s-sin').hidden=false;
      $('d-estado').textContent='Sin conexión a los datos guardados.';
      return;
    }
    $('f-sesion').hidden=false; $('f-auspicio').hidden=false;
    $('d-estado').textContent='';
    try{
      db.collection('sesiones').limit(400).onSnapshot(function(snap){
        sesiones=(snap.docs||[]).map(function(d){return d.data()}); pintar();
      });
      db.collection('auspicios').limit(200).onSnapshot(function(snap){
        auspicios=(snap.docs||[]).map(function(d){return d.data()}); pintar();
      });
    }catch(e){ $('d-estado').textContent='No se pudieron leer los datos.'; }
  })();

  function nuevoId(){
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  }
  async function guardar(coleccion, datos, dicho, boton){
    if(!db){ dicho.textContent='Esta vista no puede guardar.'; return false; }
    boton.disabled=true; dicho.textContent='Guardando\\u2026';
    try{
      await db.collection(coleccion).doc(nuevoId()).set(datos);
      dicho.textContent='Anotado.';
      boton.disabled=false; return true;
    }catch(e){
      dicho.textContent=(e&&e.code==='not_granted')
        ? 'Tu acceso a esta página es de lectura.'
        : 'No se pudo guardar. Probá de nuevo en un rato.';
      boton.disabled=false; return false;
    }
  }

  $('f-sesion').addEventListener('submit', async function(ev){
    ev.preventDefault();
    var h=Number($('s-horas').value)||0;
    if(h < %(min)d){
      $('s-dicho').textContent='La jornada mínima es de %(min)d horas.';
      return;
    }
    var t=TARIFAS[Number($('s-tarifa').value)||0];
    var ok=await guardar('sesiones',{
      fecha:$('s-fecha').value, cliente:$('s-cliente').value.trim(),
      servicio:t?(t.t+' · '+t.p):'', horas:h,
      monto:Number($('s-monto').value)||0, estado:$('s-estado').value,
      creado:new Date().toISOString()
    }, $('s-dicho'), $('s-enviar'));
    if(ok){ $('s-cliente').value=''; }
  });

  $('f-auspicio').addEventListener('submit', async function(ev){
    ev.preventDefault();
    var ok=await guardar('auspicios',{
      marca:$('a-marca').value.trim(), programa:$('a-programa').value,
      producto:$('a-producto').value, monto:Number($('a-monto').value)||0,
      desde:$('a-desde').value, estado:$('a-estado').value,
      quien:$('a-quien').value.trim(), creado:new Date().toISOString()
    }, $('a-dicho'), $('a-enviar'));
    if(ok){ $('a-marca').value=''; $('a-quien').value=''; }
  });
})();
</script>
""" % {"tarifas": tarifas_js, "objetivo": objetivo_mes, "min": W.JORNADA_MINIMA}


def main():
    os.makedirs(SALIDA, exist_ok=True)
    ruta = os.path.join(SALIDA, "direccion.html")
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(pagina())
    links = enlaces()
    print("  direccion.html                     %6.1f KB"
          % (os.path.getsize(ruta) / 1024.0))
    print("  enlaces a las páginas de programa: %d de %d"
          % (len(links), len(W.ORDEN)))


if __name__ == "__main__":
    main()
