// Un Supabase de mentira, para probar el dibujo sin red.
//
// Devuelve exactamente lo que devolvería la base de verdad para el rol que se
// pida por la URL: ?rol=direccion ve los cinco programas y el tablero,
// ?rol=integrante ve uno solo, ?rol=nadie entra sin estar cargado.
//
// Lo que esto NO prueba son los permisos: eso no se prueba con un cliente
// falso, se probó contra la base con dos cuentas reales de distinto rol.

import datos from './prueba-datos.js';

// Los datos entran como modulo y no por fetch a proposito: con un await
// arriba del modulo, la captura headless sale en «Un momento…» porque
// dibuja antes de que la respuesta llegue.
const url = new URL(location.href);
const rol = url.searchParams.get('rol') || 'direccion';

const mios = rol === 'direccion' ? datos.programas : datos.programas.slice(0, 1);

function tabla(nombre) {
  const filas = {
    programa_contenido: mios.map((d) => ({ datos: d })),
    estudio: rol === 'direccion' ? [{ datos: datos.estudio }] : [],
    programas: datos.programas.map((p, i) => ({ id: 'id-' + i, slug: p.slug })),
    ideas: [
      { texto: 'Para Titulando: pedir fotos al chat durante la semana.',
        creado: new Date(Date.now() - 86400000).toISOString(),
        estado: 'nueva', autor_id: 'x' },
      { texto: 'Invitar a la banda que tocó en el bar de Villa Crespo.',
        creado: new Date(Date.now() - 300000000).toISOString(),
        estado: 'en estudio', autor_id: 'x' },
    ],
    sesiones: rol === 'direccion' ? [
      { horas: 4, monto: 600000, estado: 'cobrado', fecha: '2026-10-01' },
      { horas: 2, monto: 0, estado: 'interno', fecha: '2026-10-01' }] : [],
    facturas: rol === 'direccion'
      ? [{ monto: 600000, emitida: '2026-10-01' }] : [],
    costos: rol === 'direccion'
      ? [{ monto: 180000, creado: '2026-10-01' }] : [],
    auspicios: rol === 'direccion' ? [
      { marca: 'Cerveza del Puerto', producto: 'Naming de bloque B1',
        monto_mes: 300000, estado: 'propuesta enviada' }] : [],
  }[nombre] || [];

  const q = {
    select() { return q; },
    eq() { return q; },
    gte() { return q; },
    order() { return q; },
    limit() { return q; },
    maybeSingle() { return Promise.resolve({ data: filas[0] || null, error: null }); },
    insert() { return Promise.resolve({ error: null }); },
    then(ok) { return Promise.resolve({ data: filas, error: null }).then(ok); },
  };
  return q;
}

export function createClient() {
  return {
    auth: {
      getSession: () => Promise.resolve({
        data: { session: rol === 'nadie' ? null : { user: { id: 'u' } } } }),
      signInWithOtp: () => Promise.resolve({ error: null }),
      signOut: () => Promise.resolve({}),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
    rpc: (f) => Promise.resolve({
      data: f === 'mi_rol' ? (rol === 'nadie' ? null : rol)
            : (rol === 'nadie' ? null : 'persona-1'),
      error: null }),
    from: tabla,
  };
}
