import { chromium } from "playwright";
import fs from "node:fs";

const cajas = JSON.parse(fs.readFileSync("guia/cajas-login.json", "utf8"));
const logo = fs.readFileSync("/home/user/ig-crm/aquamar/public/marca/logotipo-blanco.png").toString("base64");
const img = (f) => fs.readFileSync(`guia/${f}.png`).toString("base64");

const ANCHO_TARJETA = 1080;
const ANCHO_CAPTURA = 560;
const info = cajas["t1-login"];
const escala = ANCHO_CAPTURA / info.ancho;
const DESDE = 250, HASTA = 700;
const altoRecorte = Math.round((HASTA - DESDE) * escala);

const PUNTOS = [
  { marca: "clave", n: 1 },
  { marca: "boton", n: 2 },
];

const badges = PUNTOS.map((pt) => {
  const c = info.marcas[pt.marca];
  const y = Math.round((c.y - DESDE + c.h / 2) * escala);
  const x = Math.round((c.x + c.w) * escala) + 12;
  return `<div class="linea" style="left:${Math.round((c.x + c.w) * escala)}px;top:${y - 1}px;width:12px"></div>
    <div class="badge" style="left:${x}px;top:${y - 19}px">${pt.n}</div>
    <div class="halo" style="left:${Math.round(c.x * escala) - 6}px;top:${Math.round((c.y - DESDE) * escala) - 6}px;width:${Math.round(c.w * escala) + 12}px;height:${Math.round(c.h * escala) + 12}px"></div>`;
}).join("");

const html = `<!doctype html><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #fff; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-font-smoothing: antialiased; }
  .tarjeta { width: ${ANCHO_TARJETA}px; background: #f4f8fc; padding-bottom: 38px; }
  header { background: #053388; color: #fff; padding: 34px 44px 30px; }
  .logo { height: 30px; width: auto; display: block; margin-bottom: 22px; opacity: .95; }
  .paso { font-size: 17px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #edb730; }
  h1 { font-size: 46px; line-height: 1.1; font-weight: 700; letter-spacing: -.02em; margin-top: 8px; }
  .bajada { font-size: 22px; line-height: 1.4; color: #b9cbe8; margin-top: 12px; max-width: 820px; }
  .link { display: inline-block; margin: 30px 44px 6px; background: #fff; border: 2px solid #053388; border-radius: 14px;
          padding: 16px 24px; font-size: 27px; font-weight: 700; color: #053388; letter-spacing: -.01em; }
  .linkpie { margin: 0 44px; font-size: 20px; color: #5a7290; }
  .captura { display: flex; justify-content: center; padding: 28px 44px 4px; }
  .marco { position: relative; width: ${ANCHO_CAPTURA}px; }
  .recorte { overflow: hidden; height: ${altoRecorte}px; border-radius: 22px; border: 1px solid #dce4ee; background: #fff; box-shadow: 0 12px 34px rgba(14,33,54,.13); }
  .recorte img { display: block; width: ${ANCHO_CAPTURA}px; margin-top: ${-Math.round(DESDE * escala)}px; }
  .badge { position: absolute; width: 38px; height: 38px; border-radius: 50%; background: #edb730; color: #0e2136;
           font-size: 21px; font-weight: 700; display: flex; align-items: center; justify-content: center;
           box-shadow: 0 3px 10px rgba(14,33,54,.3); }
  .halo { position: absolute; border: 3px solid #edb730; border-radius: 12px; }
  .linea { position: absolute; height: 3px; background: #edb730; }
  .pasos { list-style: none; padding: 10px 44px 0; }
  .pasos li { display: flex; gap: 16px; align-items: flex-start; padding: 10px 0; font-size: 25px; line-height: 1.4; color: #0e2136; }
  .pasos .n { flex: 0 0 38px; height: 38px; border-radius: 50%; background: #edb730; color: #0e2136;
              font-size: 21px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 2px; }
  .roles { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; padding: 22px 44px 0; }
  .rol { background: #fff; border: 1px solid #dce4ee; border-radius: 18px; overflow: hidden; }
  .rol img { display: block; width: 100%; }
  .rol .cuerpo { padding: 16px 20px 20px; }
  .rol h2 { font-size: 24px; color: #053388; }
  .rol p { font-size: 19px; line-height: 1.4; color: #5a7290; margin-top: 6px; }
  .nota { margin: 24px 44px 0; padding: 18px 22px; background: #fff; border-left: 5px solid #0c85a2;
          border-radius: 0 14px 14px 0; font-size: 21px; line-height: 1.45; color: #5a7290; }
</style>
<article class="tarjeta" id="t">
  <header>
    <img class="logo" src="data:image/png;base64,${logo}" alt="Aqua Mar" />
    <div class="paso">Panel Aqua Mar</div>
    <h1>Cómo entrar</h1>
    <p class="bajada">El link es el mismo para todos. Lo que cambia es tu clave.</p>
  </header>

  <div class="link">aquamar-panel.netlify.app</div>
  <p class="linkpie">Guardalo en la pantalla de inicio del celular y entrás de una.</p>

  <div class="captura">
    <div class="marco">
      <div class="recorte"><img src="data:image/png;base64,${img("t1-login")}" /></div>
      ${badges}
    </div>
  </div>

  <ol class="pasos">
    <li><span class="n">1</span><span>Escribí tu clave.</span></li>
    <li><span class="n">2</span><span>Tocá Entrar al panel. Quedás adentro por 30 días.</span></li>
  </ol>

  <div class="roles">
    <div class="rol">
      <img src="data:image/png;base64,${img("t2-comercial")}" />
      <div class="cuerpo">
        <h2>Con la clave de Kevin A</h2>
        <p>Abre Comercial y Depósito: clientes, pedidos, precios, compras, caja y reportes.</p>
      </div>
    </div>
    <div class="rol">
      <img src="data:image/png;base64,${img("t3-deposito")}" />
      <div class="cuerpo">
        <h2>Con la clave del galpón</h2>
        <p>Abre solo el Depósito: stock, productos y movimientos. Sin costos ni precios.</p>
      </div>
    </div>
  </div>

  <p class="nota">
    Cada uno entra con la suya. Si alguna vez hay que sacarle el acceso a alguien, se cambia solo esa clave y la otra
    sigue andando.
  </p>
</article>`;

fs.writeFileSync("guia/tutorial-login.html", html);
const nav = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await (await nav.newContext({ viewport: { width: ANCHO_TARJETA, height: 1200 }, deviceScaleFactor: 1.5 })).newPage();
await p.setContent(html, { waitUntil: "networkidle" });
await p.locator("#t").screenshot({ path: "guia/como-entrar.png" });
console.log("listo");
await nav.close();
