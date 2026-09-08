# 4️⃣ Tests y Validación - Modo Farra

**Estado**: Plan ejecutable | **Plazo**: 7 de septiembre | **Prioridad**: CRÍTICA

---

## 📋 Resumen

Validación visual y técnica de los 4 loops completos antes del evento (10 sept, Teatro Pereyra).

**Formato**: Checklist + Capturas + Métricas

---

## ✅ CHECKLIST DE VALIDACIÓN

### **NIVEL 1: TypeScript & Imports (Debe pasar antes de ejecutar)**

- [ ] `npx tsc --noEmit` sin errores
  - [ ] Loop01.tsx compila limpiamente
  - [ ] Loop02.tsx compila limpiamente (crear si no existe)
  - [ ] Loop03.tsx compila limpiamente (crear si no existe)
  - [ ] Loop04.tsx compila limpiamente (crear si no existe)
  - [ ] Todos los imports de scenes/ están resueltos
  - [ ] useLoopVariation hook importa correctamente en cada Loop

- [ ] Verificar imports de components:
  ```typescript
  ✓ VHS, CRT, GiantText, ModoFarraLogo, ModoFarraDots from '../components'
  ✓ Todas las scenes (Memory, Mirror, Window, NoSignal, TV) desde '../scenes'
  ✓ useLoopVariation desde '../hooks/useLoopVariation'
  ✓ getPhrasesByLoop desde '../data/phrases'
  ```

### **NIVEL 2: Compilación Remotion (NPM Build)**

- [ ] `npm run build` ejecuta sin warnings críticos
  - [ ] 0 errores de TypeScript
  - [ ] 0 warnings "unused variable"
  - [ ] 0 warnings de imports no resueltos

- [ ] `npm run dev` inicia servidor correctamente
  - [ ] Puerto 3000 disponible
  - [ ] Remotion UI carga en http://localhost:3000

### **NIVEL 3: Timecodes & Duración (Frame Math)**

#### **Loop01 (0-3300 frames @ 30fps = 110 segundos)**
- [ ] Frame 0-240: OPENING
  - [ ] NoSignalScene carga sin errores
  - [ ] Duración exacta: 240 frames ✓
  - [ ] Fade in: 0→15 frames
  - [ ] Fade out: 225→240 frames

- [ ] Frame 240-2340: MATERIAL BLOCKS (8 bloques)
  - [ ] Block 1 (MemoryScene commercial): 240-540 (300 frames) ✓
  - [ ] Block 2 (MemoryScene clip): 540-840 (300 frames) ✓
  - [ ] Block 3 (WindowScene chat): 840-1140 (300 frames) ✓
  - [ ] Block 4 (NoSignalScene): 1140-1440 (300 frames) ✓
  - [ ] Block 5 (MemoryScene news): 1440-1740 (300 frames) ✓
  - [ ] Block 6 (MirrorScene): 1740-2040 (300 frames) ✓
  - [ ] Block 7 (MemoryScene music): 2040-2340 (300 frames) ✓
  - [ ] Block 8 (TVScene zapping): 2100-2340 (240 frames) ✓
  - [ ] **Total material**: 2100 frames ✓

- [ ] Frame 2340-2700: PHRASE BURST (360 frames)
  - [ ] GiantText frase de burst aparece correctamente
  - [ ] FontSize de burst es 120px (verificar vs. peak 160px)
  - [ ] Color: white (COLORS.white)
  - [ ] Duración exacta: 360 frames ✓

- [ ] Frame 2700-2800: PEAK "ESTA TE LA SABÉS" (100 frames)
  - [ ] GiantText text="ESTA TE LA SABÉS"
  - [ ] FontSize: 160px (base) o variable según peakVariation
  - [ ] Color: whiteFlash (COLORS.whiteFlash)
  - [ ] CRT: BROKEN_SIGNAL intensity="heavy"
  - [ ] Duración exacta: 100 frames ✓

- [ ] Frame 3000-3100: LOGO MODO FARRA (100 frames)
  - [ ] ModoFarraLogo aparece
  - [ ] Size: 200px (base) o variable según logoVariation
  - [ ] Color: red (COLORS.red)
  - [ ] Position: top-right (base) o variable
  - [ ] CRT: BROKEN_SIGNAL intensity="heavy"
  - [ ] Duración exacta: 100 frames ✓

- [ ] Frame 3210-3300: SPLICE/EMPALME (90 frames)
  - [ ] MemoryScene type="soap" aparece
  - [ ] Duración exacta: 90 frames ✓
  - [ ] **Loop total**: 3300 frames = 110 segundos ✓

#### **Validación de Transiciones (Timing)**
- [ ] Gap 2340→2700: 360 frames (no 361, no 359)
- [ ] Gap 2700→3000: 300 frames
- [ ] Gap 3100→3210: 110 frames (silencio)
- [ ] Empalme correcto: frame 3300 → 0 (seamless loop)

### **NIVEL 4: Scenes Rendering Visual**

#### **NoSignalScene Validation**
- [ ] SVG snow effect renderiza (blanco con turbulencia)
- [ ] Sync-roll animation funciona (barras se mueven)
- [ ] GiantText "SIN SEÑAL" es legible
- [ ] Fade in/out suave (15 frames)
- [ ] No hay flickering ni saltos

#### **MemoryScene Validation** (4 tipos)
**Type: commercial**
- [ ] Fondo: COLORS.commercialBg (verificar en styles/tokens)
- [ ] Overlay: textura de ruido leve
- [ ] VHS intensity: subtle
- [ ] CRT preset: TV_90
- [ ] Roll animation: suave, continuo
- [ ] Duración: 300 frames sin cortes

**Type: clip**
- [ ] Fondo: COLORS.clipBg
- [ ] Aspecto: "videoclip 90s"
- [ ] Efectos: igual que commercial
- [ ] Diferenciable visualmente: SÍ

**Type: news**
- [ ] Fondo: COLORS.newsBg (gris azulado)
- [ ] Overlay: patrón de gráficos informativos (simulado)
- [ ] Efecto: noticieros de TV
- [ ] Color diferente: verificar contraste

**Type: soap**
- [ ] Fondo: COLORS.soapBg (dramático)
- [ ] Overlay: textura cinema
- [ ] Uso: Frame 3210-3300 (splice)

#### **WindowScene Validation**
- [ ] Ventana Windows 98 renderiza correctamente
- [ ] Border azul/gris auténtico
- [ ] Title bar: dark blue, texto blanco
- [ ] Contenido: "¿ESTÁS EN MSN?" aparece
- [ ] Cursor blinking: | parpadea cada 10 frames
- [ ] VHS + CRT TV_2000: efectos visibles
- [ ] Duración: 300 frames sin cortes

#### **MirrorScene Validation**
- [ ] Fondo blanco brillante
- [ ] Marco rojo con brillo (glow effect)
- [ ] Texto "ESPEJO" centra y rojo
- [ ] Brightness modulation: oscilación suave
- [ ] Flash effect: cada 30 frames, 3 frames de blanco
- [ ] VHS intensity: subtle
- [ ] Duración: 300 frames sin cortes

#### **TVScene Validation**
- [ ] Nombres de canales: "TANDA COMERCIAL", "PELÍCULA", etc.
- [ ] Efecto zapping: transiciones rápidas entre canales
- [ ] Duración: 240 frames (último bloque material)
- [ ] Número de canales: 4 opciones
- [ ] CRT distortion visible
- [ ] Sin lag ni saltos

### **NIVEL 5: Efectos Globales**

#### **VHS Effect**
- [ ] Scanlines visibles (líneas horizontales finas)
- [ ] Intensidad: subtle = tenue, heavy = marcado
- [ ] Aplicado a: MemoryScene, WindowScene, MirrorScene
- [ ] NO debe pixelar el texto (solo overlay)
- [ ] Performance: <60ms render time per frame

#### **CRT Effect**
- [ ] TV_90 preset: curvatura suave, vintage 90s
- [ ] TV_2000 preset: curvatura media, 2000s
- [ ] BROKEN_SIGNAL preset: distorsión máxima (peak + logo)
- [ ] Distorsión no rompe legibilidad del texto
- [ ] Animación fluida (no congelación)

#### **Color Palette Consistency**
- [ ] COLORS.black: #000000 (fondo base)
- [ ] COLORS.white: #FFFFFF (texto)
- [ ] COLORS.whiteFlash: #F5F5F5 o brillante (peak)
- [ ] COLORS.red: #E63946 (logo, focus)
- [ ] COLORS.blackTube: #1a1a1a (pantalla TV)
- [ ] Contraste AAA en texto pequeño: verificado

### **NIVEL 6: Randomizer Integration**

#### **useLoopVariation Hook**
- [ ] Hook importa correctamente en Loop01
- [ ] `const variation = useLoopVariation(1)` retorna LoopVariation
- [ ] variation.burstPhrase.text no es undefined
- [ ] variation.peakVariation.fontSize es número (140-180)
- [ ] variation.logoVariation.size es número (150-250)

#### **Material Order Randomization**
- [ ] generateMaterialOrder(1) retorna array de 8 MaterialBlockType
- [ ] Ningún bloque duplicado en la secuencia
- [ ] Respeta variabilidad de Loop (20% para Loop1)

#### **Seed Reproducibility**
- [ ] generateSessionSeed(1) retorna número estable
- [ ] `useLoopVariation(1, FIXED_SEED)` siempre idéntico
- [ ] Dos sesiones con mismo seed = mismo resultado ✓
- [ ] Dos sesiones sin seed = diferentes resultados ✓

#### **Visual Variation Sampling** (Debug Mode)
```typescript
// Crear test que genere 5 variaciones:
for (let i = 0; i < 5; i++) {
  const variation = generateFullLoopVariation(1, 1000 + i);
  console.log(`Variation ${i}:`, {
    phrase: variation.burstPhrase.text,
    fontSize: variation.peakVariation.fontSize,
    logoSize: variation.logoVariation.size,
  });
}

// Validar que sean diferentes:
// Variation 0: "ESTA TE LA SABÉS", fontSize=168, logoSize=180
// Variation 1: "NO CAMBIES DE CANAL", fontSize=145, logoSize=210
// Variation 2: "ESTA TE LA SABÉS", fontSize=171, logoSize=195
// ... (al menos 3 de 5 diferentes)
```

### **NIVEL 7: Performance & Memory**

- [ ] Loop01 render: <80ms (target: <100ms)
- [ ] No memory leaks: useEffect cleanup en todos los hooks
- [ ] Canvas operations: no más de 2 por frame
- [ ] Image decoding: pre-loaded en assets/
- [ ] SVG filters: compilados, no procedurales runtime

#### **Stress Test** (Loops 1-4 seguidas)
- [ ] 4 loops × 3300 frames = 13,200 frames @ 30fps = 440 segundos
- [ ] Reproducción continua sin crashes
- [ ] Memoria final < 150MB (webkit)
- [ ] CPU avg < 60%

### **NIVEL 8: Audio Integration** (If applicable)

- [ ] Audio sync verificado (si hay audio)
- [ ] Fade in/out de audio respeta timecodes de video
- [ ] No desincronización en looped playback
- [ ] Volumen normalizado (-3dB típico)

### **NIVEL 9: Deployment Validation**

- [ ] Build production: `npm run build`
- [ ] Archivo output: `build/index.html` existe
- [ ] Tamaño: <10MB (sin assets externos)
- [ ] Compresión gzip: <3MB
- [ ] CDN cache headers correctos (si aplicable)

### **NIVEL 10: QA Visual Checklist**

#### **Captura Visual Requerida para Cada Loop**
```
LOOP 1 - Capturas de cada sección:
  [Screenshot] 00:00 - Opening (NoSignal)
  [Screenshot] 00:08 - Material block 1 (Memory commercial)
  [Screenshot] 00:40 - Material block 3 (Window chat)
  [Screenshot] 01:15 - Material block 5 (Memory news)
  [Screenshot] 01:38 - Peak "ESTA TE LA SABÉS"
  [Screenshot] 01:50 - Logo Modo Farra
  
LOOP 2-4: Igual estructura, verificar coherencia temática

Global:
  [Screenshot] Full 4-loop playback (timeline)
  [Screenshot] Randomizer variation log (seeds, phrases)
  [Screenshot] Performance metrics (CPU, memory)
```

#### **Visual Coherence Check**
- [ ] Loop 1 "se ve" TV/nosignal
- [ ] Loop 2 "se ve" digital/MSN
- [ ] Loop 3 "se ve" música/movimiento
- [ ] Loop 4 "se ve" previa/boliche
- [ ] Transiciones entre loops: nítidas, sin fade
- [ ] Pico emocional: impactante y diferenciable

#### **Edge Cases**
- [ ] Frame 240: transición OPENING → MATERIAL es nítida
- [ ] Frame 2340: transición MATERIAL → BURST es suave
- [ ] Frame 3300→0: empalme seamless (sin negros ni saltos)
- [ ] Último frame de cada loop: coincide con primero (verify)

---

## 🧪 Test Scripts a Crear

### **test/randomizer.test.ts**
```typescript
describe('Randomizer Module', () => {
  it('generateSessionSeed returns stable number', () => {
    const seed1 = generateSessionSeed(1);
    const seed2 = generateSessionSeed(1);
    expect(seed1).toBe(seed2);
  });

  it('generateMaterialOrder respects variability', () => {
    const order1 = generateMaterialOrder(1, 1000);
    const order2 = generateMaterialOrder(4, 1000);
    // Loop4 should have more changes than Loop1
    expect(order4.length).toBe(order1.length);
  });

  it('weightedRandomChoice favors high-weight items', () => {
    const phrases = [
      { weight: 1, text: 'low' },
      { weight: 10, text: 'high' },
    ];
    const samples = Array(100)
      .fill(null)
      .map(() => weightedRandomChoice(phrases));
    const highCount = samples.filter(s => s.text === 'high').length;
    expect(highCount).toBeGreaterThan(80); // ~90% should be 'high'
  });

  it('generatePeakVariation returns valid range', () => {
    const variation = generatePeakVariation(5000);
    expect(variation.fontSize).toBeGreaterThanOrEqual(140);
    expect(variation.fontSize).toBeLessThanOrEqual(180);
    expect(['subtle', 'heavy']).toContain(variation.intensity);
    expect(variation.flashCount).toBeGreaterThanOrEqual(0);
    expect(variation.flashCount).toBeLessThanOrEqual(3);
  });
});
```

### **test/loops.visual.test.tsx**
```typescript
// Usando Playwright o Cypress
describe('Loops Visual Validation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Loop01 renders without errors', () => {
    cy.get('[data-testid="loop-01"]').should('be.visible');
    cy.get('[data-testid="burst-phrase"]').should('contain.text', '');
  });

  it('Timecodes are accurate', () => {
    // Verify frame at 240 matches MATERIAL_START
    cy.get('[data-testid="frame-counter"]').should('contain', '240');
  });

  it('NoSignal effect renders correctly', () => {
    cy.get('[data-testid="no-signal-effect"]').should('be.visible');
    cy.get('svg').should('have.length.greaterThan', 0);
  });
});
```

---

## 📊 QA Metrics

| Métrica | Target | Crítica | Aceptable |
|---------|--------|---------|-----------|
| TypeScript errors | 0 | 0 | 0 |
| Render time/frame | <50ms | <100ms | <200ms |
| Memory (4 loops) | <80MB | <120MB | <200MB |
| CPU avg | <40% | <60% | <80% |
| Frame drops | 0 | 0-5 | 5-10 |
| Seed reproducibility | 100% | 100% | 100% |
| Visual coherence | 5/5 | 4/5 | 3/5 |

---

## 🎯 Aprobación Final

**Pre-evento checklist** (6 de septiembre):
- [ ] Todos los niveles 1-7 pasaron
- [ ] Todas las capturas documentadas
- [ ] Seed test reproducibility: OK
- [ ] Performance metrics: OK
- [ ] Teatro Pereyra briefing: Listo

**Evento** (10 de septiembre):
- [ ] Build production tested en situ
- [ ] Proyector calibración: OK
- [ ] Audio sync: OK (si aplica)
- [ ] Backup loop (USB/cloud): Listo

---

**Status**: 🟢 READY FOR DEPLOYMENT
