import { chromium } from "playwright";
import fs from "node:fs";

const BASE = "http://localhost:3300";
const ANCHO = 430;
const nav = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 1200 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const cajas = {};

async function tomar(nombre, marcas = {}) {
  await p.waitForTimeout(250);
  const alto = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.setViewportSize({ width: ANCHO, height: Math.min(alto, 2200) });
  await p.waitForTimeout(150);
  const medidas = {};
  for (const [clave, sel] of Object.entries(marcas)) {
    const el = p.locator(sel).first();
    if (await el.count()) {
      const c = await el.boundingBox();
      if (c) medidas[clave] = { x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.width), h: Math.round(c.height) };
    }
  }
  cajas[nombre] = { alto: Math.min(alto, 2200), ancho: ANCHO, marcas: medidas };
  await p.screenshot({ path: `guia/${nombre}.png` });
  console.log("✓", nombre, Object.keys(medidas).join(", "));
}

await p.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await tomar("t1-login", {
  titulo: 'text=/Trabajo en Aqua Mar/',
  clave: 'input[type="password"]',
  boton: 'button:has-text("Entrar al panel")',
});

// Cómo queda cada uno adentro
const entrar = async (clave) => {
  const c = await nav.newContext({ viewport: { width: ANCHO, height: 1200 }, deviceScaleFactor: 2 });
  const q = await c.newPage();
  await q.goto(`${BASE}/login`);
  await q.fill('input[type="password"]', clave);
  await q.click('button[type="submit"]');
  await q.waitForLoadState("networkidle");
  return q;
};

const k = await entrar("kevin");
await k.screenshot({ path: "guia/t2-comercial.png", clip: { x: 0, y: 0, width: ANCHO, height: 130 } });
const d = await entrar("galpon");
await d.screenshot({ path: "guia/t3-deposito.png", clip: { x: 0, y: 0, width: ANCHO, height: 130 } });
console.log("✓ encabezados de cada rol");

fs.writeFileSync("guia/cajas-login.json", JSON.stringify(cajas, null, 1));
await nav.close();
