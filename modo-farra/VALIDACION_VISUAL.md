# ✅ Validación Visual - Modo Farra

**Estado**: CHECKLIST EJECUTABLE | **Fecha**: 7 de septiembre 2026

---

## 🎬 Instrucciones de Validación en Vivo

### **Paso 1: Iniciar servidor Remotion**
```bash
cd modo-farra
npm run dev
# Output: http://localhost:3000
```

### **Paso 2: Seleccionar Loop en UI**
En http://localhost:3000, aparecerá dropdown. Seleccionar:
- [ ] Loop 1
- [ ] Loop 2
- [ ] Loop 3
- [ ] Loop 4

### **Paso 3: Reproducir y Validar cada Loop**

---

## 📋 CHECKLIST LOOP 1 (TV/Nosignal)

### **Frame 0-240: OPENING**
- [ ] NoSignalScene carga sin errores
- [ ] Patrón de nieve (turbulencia) visible
- [ ] Barras de sincronización se mueven (sync-roll animation)
- [ ] Texto "SIN SEÑAL" centrado, legible
- [ ] Fade in suave (primeros 15 frames)
- [ ] Duración exacta: 8 segundos (240 frames @ 30fps)

### **Frame 240-2340: MATERIAL BLOCKS** (70 seg)
**Block 1 (240-540): MemoryScene commercial**
- [ ] Fondo color coherente (comercial)
- [ ] VHS scanlines visibles pero no pixela texto
- [ ] CRT TV_90 preset: curvatura sutil
- [ ] Duración: 10 segundos
- [ ] Fade out suave antes de siguiente bloque

**Block 2 (540-840): MemoryScene clip**
- [ ] Diferenciable visualmente de Block 1
- [ ] Colores distintos (clip vs comercial)
- [ ] Transición limpia desde Block 1
- [ ] Duración: 10 segundos

**Block 3 (840-1140): WindowScene (MSN/Chat)**
- [ ] Ventana Windows 98 renderiza correctamente
- [ ] Título bar azul oscuro
- [ ] Contenido: "¿ESTÁS EN MSN?" visible
- [ ] Cursor parpadea | cada 10 frames
- [ ] Bordes beveled auténticos
- [ ] Duración: 10 segundos

**Block 4 (1140-1440): NoSignalScene**
- [ ] Nieve TV: diferente del OPENING (sin fade)
- [ ] Animación barras visible
- [ ] Duración: 10 segundos

**Block 5 (1440-1740): MemoryScene news**
- [ ] Color news diferente a otros tipos
- [ ] Estética noticieros (gris azulado)
- [ ] Duración: 10 segundos

**Block 6 (1740-2040): MirrorScene**
- [ ] Fondo blanco + marco rojo
- [ ] Texto "ESPEJO" en rojo
- [ ] Flash effect cada 30 frames (3 frames blancos)
- [ ] Brightness modulation suave
- [ ] Duración: 10 segundos

**Block 7 (2040-2340): MemoryScene music**
- [ ] Distinto a otros tipos
- [ ] Tema musical coherente visualmente
- [ ] Duración: 10 segundos

**Block 8 (2100-2340): TVScene zapping**
- [ ] Canales: TANDA COMERCIAL, PELÍCULA, VIDEOCLIP, NOTICIEROS
- [ ] Cambios de canal rápidos (efecto zapping)
- [ ] Duración: 8 segundos
- [ ] Se solapa con Block 7 (normal)

**Material Total**: 70 segundos ✓

### **Frame 2340-2700: PHRASE BURST** (12 seg)
- [ ] GiantText aparece (frase ponderada)
- [ ] FontSize: 120px
- [ ] Color: white (COLORS.white)
- [ ] Fondo: black
- [ ] Fade in: primeros 15 frames
- [ ] Fade out: últimos 15 frames
- [ ] Duración exacta: 12 segundos (360 frames)

**Frase esperada Loop 1**: Una de:
- "ESTA TE LA SABÉS"
- "NO CAMBIES DE CANAL"
- "NO TOQUES LA ANTENA"
- "ESTÁN DANDO ESA"

### **Frame 2700-2800: PEAK** (3.3 seg)
- [ ] Texto: "ESTA TE LA SABÉS"
- [ ] FontSize: variable (140-180px según randomizer)
- [ ] Color: whiteFlash (COLORS.whiteFlash)
- [ ] CRT: BROKEN_SIGNAL preset
- [ ] Intensity: heavy (distorsión máxima)
- [ ] Impacto emocional: ALTO
- [ ] Duración exacta: 3.3 segundos (100 frames)

### **Frame 2800-3000: GAP** (6.6 seg)
- [ ] Negro/silencio puro
- [ ] Sin transiciones o efectos
- [ ] Transición suave a LOGO

### **Frame 3000-3100: LOGO MODO FARRA** (3.3 seg)
- [ ] ModoFarraLogo aparece
- [ ] Color: red (COLORS.red)
- [ ] Size: variable (150-250px según randomizer)
- [ ] Position: variable (9 posiciones posibles)
- [ ] CRT: BROKEN_SIGNAL preset (glitch efecto)
- [ ] Intensity: heavy
- [ ] Sensación: "falla de señal", NO publicidad
- [ ] Duración exacta: 3.3 segundos (100 frames)

### **Frame 3100-3210: GAP** (3.6 seg)
- [ ] Negro
- [ ] Transición suave a SPLICE

### **Frame 3210-3300: SPLICE/EMPALME** (3 seg)
- [ ] MemoryScene type="soap" aparece
- [ ] Cierra el loop sutilmente
- [ ] Fade out suave (últimos 15 frames)
- [ ] Frame 3300 = Frame 0 (seamless loop)
- [ ] Duración exacta: 3 segundos (90 frames)

### **LOOP 1 TOTAL**: 110 segundos ✅

---

## 📋 CHECKLIST LOOP 2 (Digital/MSN)

### **Diferenciadores vs Loop 1:**
- [ ] OPENING: NoSignalScene (igual)
- [ ] Material: MSN focused (ventanas chat dominan)
- [ ] Block 1: WindowScene MSN MESSENGER
- [ ] Block 3: WindowScene CONECTANDO...
- [ ] Block 6: WindowScene SISTEMA/ERROR
- [ ] Peak: "CONECTANDO..." (no "ESTA TE LA SABÉS")
- [ ] Burst: Frase MSN/SISTEMA family
- [ ] Canales TV: FOTOLOG, MESSENGER, CHAT, CONECTANDO

### **Validación Visual:**
- [ ] Loop 2 "se ve" digital/online (windowsene prevalece)
- [ ] Paleta de colores: más azules/grises
- [ ] Transiciones suave entre ventanas
- [ ] Peak "CONECTANDO..." diferenciable de Loop 1
- [ ] Timecodes idénticos a Loop 1 ✓
- [ ] Duración: 110 segundos ✓

---

## 📋 CHECKLIST LOOP 3 (Música/Cumbia)

### **Diferenciadores:**
- [ ] Material: Música/Cumbia focused
- [ ] Block 1: MemoryScene music
- [ ] Block 7: MemoryScene music
- [ ] Colores: más vibrantes (cumbia aesthetic)
- [ ] Peak: "SE ARMÓ"
- [ ] Burst: Frase MUSICA family
- [ ] Canales TV: MÚSICA, VIDEOCLIP, CUMBIA, BAILANTA

### **Validación Visual:**
- [ ] Loop 3 "se ve" energético/festivo
- [ ] Más movimiento que Loop 1-2
- [ ] Paleta: rojos, naranjas, amarillos
- [ ] Peak "SE ARMÓ" impactante
- [ ] Timecodes: 3300 frames ✓
- [ ] Transiciones dinámicas

---

## 📋 CHECKLIST LOOP 4 (Previa/Boliche)

### **Diferenciadores:**
- [ ] Material: Previa/Boliche focused
- [ ] Colores: nocturnos (más oscuros)
- [ ] Peak: "ESTO RECIÉN EMPIEZA"
- [ ] Burst: Frase PREVIA/BOLICHE family
- [ ] Canales TV: LA ÚLTIMA, HASTA LA 1 GRATIS, NO SE VA NADIE, AFUERA HAY COLA

### **Validación Visual:**
- [ ] Loop 4 "se ve" nocturno/boliche
- [ ] Anticipación de fiesta
- [ ] Peak más dramático que otros
- [ ] Cierre como inicio de evento
- [ ] Timecodes: 3300 frames ✓

---

## 🎲 VALIDACIÓN RANDOMIZER

### **Test 1: Reproducibilidad (misma sesión)**
```
Ejecutar Loop01 → pausa → anotar burst phrase
Reproducir Loop01 nuevamente → verificar burst phrase es IDÉNTICA
```
- [ ] Burst phrase repetida (mismo seed por sesión)
- [ ] Peak fontSize igual
- [ ] Logo tamaño igual

### **Test 2: Variabilidad entre sesiones**
```
Día 1: Ejecutar todos los loops → anotar todas las frases
Día 2: Ejecutar → verificar frases diferentes
```
- [ ] Frases diferentes (new seed)
- [ ] Pero temática coherente por loop
- [ ] Peak visual distinto

### **Test 3: Seed Reproducibility (debug mode)**
```typescript
// En código (Debug):
const variation = useLoopVariation(1, 12345); // Seed fija
// Resultado A con 12345
// Reiniciar, misma seed
// Resultado A nuevamente ✓
```
- [ ] Mismo seed = reproducible
- [ ] Distinto seed = distinto resultado

---

## 📊 MÉTRICAS DE PERFORMANCE

### **CPU & Memory**
```bash
npm run dev
# Abrir DevTools → Performance tab
# Reproducir Loop 1-4 seguidas (440 seg)
```

- [ ] CPU avg: <60%
- [ ] Memory after 4 loops: <120MB
- [ ] No memory leaks (memory no sube continuamente)
- [ ] Frame drops: 0-2 máximo

### **Render Time per Frame**
- [ ] Target: <50ms
- [ ] Aceptable: <80ms
- [ ] Crítico: >100ms (marcar como issue)

---

## 🎬 VALIDACIÓN VISUAL COMPARATIVA

### **Captura de pantalla obligatoria:**

#### **Loop 1 (TV)**
- [ ] `screenshots/Loop01_00-Opening.png` (Frame ~120)
- [ ] `screenshots/Loop01_30-Material.png` (Frame ~900)
- [ ] `screenshots/Loop01_80-Peak.png` (Frame ~2750)

#### **Loop 2 (Digital)**
- [ ] `screenshots/Loop02_05-Burst.png` (Frase diferente a Loop1)
- [ ] `screenshots/Loop02_80-Peak.png` ("CONECTANDO..." visible)

#### **Loop 3 (Música)**
- [ ] `screenshots/Loop03_30-Material.png` (Colores vibrantes)
- [ ] `screenshots/Loop03_80-Peak.png` ("SE ARMÓ")

#### **Loop 4 (Boliche)**
- [ ] `screenshots/Loop04_80-Peak.png` ("ESTO RECIÉN EMPIEZA")

---

## ✅ RESUMEN FINAL

### **Validación Completada:**
- [ ] TypeScript: 0 errors
- [ ] Timecodes: Exactos (±0 frames)
- [ ] Rendering: Sin crashes
- [ ] Randomizer: Reproducible + variado
- [ ] Visual: Coherente por loop
- [ ] Performance: Aceptable (<80ms)
- [ ] Screenshots: Documentadas

### **Status de Aprobación:**

| Nivel | Status | Checklist |
|-------|--------|-----------|
| TypeScript | ✅ PASS | 0 errors |
| Timecodes | ✅ PASS | 3300 frames exactos |
| Scenes | ✅ PASS | Todos renderean |
| Randomizer | ✅ PASS | Seed working |
| Performance | ⏳ PENDING | Test en vivo |
| Visual | ⏳ PENDING | Screenshots |
| QA Final | ⏳ PENDING | Aprobación |

**Próximo paso**: Ejecutar en teatro + audio sync + backup

**Status**: 🟡 READY FOR FINAL QA
