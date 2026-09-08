# 3️⃣ Motor de Randomizer - Modo Farra

**Estado**: Implementado | **Componentes**: 2 files (util + hook) | **Plazo**: 7 de septiembre

---

## 📋 Resumen

El **Motor de Randomizer** genera **variaciones únicas de loops** manteniendo coherencia visual y temática. Cada vez que Modo Farra se reproduce, los 4 loops (110s c/u) son *ligeramente distintos* pero reconocibles.

**Principio**: Máxima repetibilidad, mínima previsibilidad.

---

## 🎯 Objetivos Alcanzados

### ✅ 1. Randomización Controlada (Seed-based)
- PRNG con seed reproducible: misma seed = mismo resultado
- Permite "rebobinar" la instalación o debuggear con valores fijos
- Basado en fecha: cada día genera variaciones nuevas automáticamente

### ✅ 2. Variabilidad por Loop
- **Loop 1**: 20% cambios (identidad fija)
- **Loop 2**: 40% cambios (aceleración)
- **Loop 3**: 60% cambios (caos creciente)
- **Loop 4**: 80% cambios (máximo caos/énfasis)

### ✅ 3. Cuatro Áreas de Variación

#### A. **Orden de Bloques Material** (Frame 240-2340)
```
DEFAULT: commercial → clip → chat → nosignal → news → mirror → music → zapping

Con randomizer:
- Hasta 20-80% de los bloques se intercambian
- Cada bloque solo puede reemplazarse por tipos "coherentes"
  Ej: chat ↔ news (ambos "diálogo"), music ↔ zapping (ambos "audio/movimiento")
- Garantiza: nunca 2 noticias seguidas, nunca 3 clips consecutivos
```

**Mapeo de variaciones permitidas**:
```typescript
commercial → [ commercial, clip, news ]
clip → [ clip, music, zapping ]
chat → [ chat, news, nosignal ]
nosignal → [ nosignal, mirror ]
news → [ news, commercial, clip ]
mirror → [ mirror, nosignal ]
music → [ music, zapping, commercial ]
zapping → [ zapping, clip, news ]
```

#### B. **Frase de Burst** (Frame 2340-2700, 12 seg)
```
Selecciona de frases con weight ≥ 8 (alta relevancia) por loop
- Loop 1: "ESTA TE LA SABÉS", "NO CAMBIES DE CANAL", etc.
- Loop 2: "¿ESTÁS EN MSN?", "CONECTANDO...", etc.
- Loop 3: "PONE ESA", "¿QUIÉN TIENE CD?", etc.
- Loop 4: "HOY SE SALE", "ESTO RECIÉN EMPIEZA", etc.

Cada sesión elige una diferente (pero coherente con el loop)
```

#### C. **Pico Emocional** (Frame 2700-2800, "ESTA TE LA SABÉS")
```
Variaciones visuales del momento más intenso:

fontSize:    140-180px (default 160)
intensity:   subtle ↔ heavy (CRT distortion)
flashCount:  0-3 (flashes adicionales)

Ej: 
  - Sesión A: fontSize=168, heavy, 2 flashes
  - Sesión B: fontSize=145, subtle, 0 flashes
  - Sesión C: fontSize=178, heavy, 3 flashes
```

#### D. **Logo Modo Farra** (Frame 3000-3100, 3.3 seg)
```
Aparece como "glitch de señal" (no como publicidad)

Variaciones:
size:        150-250px (default 200)
rotation:    -5° a +5° (tilt aleatorio)
positionX:   left | center | right
positionY:   top | center | bottom
opacity:     0.7-1.0

Ej: Logo apareció TOP-RIGHT en Loop1, ahora aparece CENTER-BOTTOM
(Sensación de inestabilidad de señal)
```

---

## 📁 Archivos Creados

### **src/utils/randomizer.ts** (250+ líneas)
Funciones de utilidad para:
- `randomChoice()` — selecciona elemento aleatorio
- `weightedRandomChoice()` — selecciona ponderado por weight
- `generateMaterialOrder()` — crea orden variado de bloques
- `selectBurstPhrase()` — elige frase de alta puntuación
- `generatePeakVariation()` — variaciones del pico emocional
- `generateLogoVariation()` — variaciones de posicionamiento del logo
- `generateFullLoopVariation()` — genera TODO para un loop
- `generateFullInstallationVariation()` — genera los 4 loops

**Sistema de Seed**:
```typescript
generateSessionSeed(loopNumber: number): number
// Calcula seed único basado en:
// - Año + Mes + Día (fecha actual)
// - loopNumber (1-4)
// Resultado: Mismo día = mismo loop, día diferente = variaciones nuevas
```

### **src/hooks/useLoopVariation.ts** (40 líneas)
Hook React memoizado para consumir randomizer en componentes:
```typescript
const variation = useLoopVariation(loopNumber);

// Acceso a:
variation.materialOrder    // MaterialBlockType[]
variation.burstPhrase      // Phrase
variation.peakVariation    // { fontSize, intensity, flashCount }
variation.logoVariation    // { size, rotation, positionX, positionY, opacity }
```

---

## 🔌 Integración en Loop01

### **Antes** (determinista):
```typescript
const burstPhrase = useMemo(() => {
  const highWeight = loop01Phrases.filter((p) => p.weight >= 8);
  return highWeight.length > 0
    ? highWeight[Math.floor(Math.random() * highWeight.length)]
    : loop01Phrases[0];
}, [loop01Phrases]);
```

### **Después** (con randomizer):
```typescript
const loopVariation = useLoopVariation(1);

// Acceso a todas las variaciones:
const { materialOrder, burstPhrase, peakVariation, logoVariation } = loopVariation;

// Usar en componentes:
<GiantText text={burstPhrase.text} fontSize={peakVariation.fontSize} />
<ModoFarraLogo size={logoVariation.size} rotation={logoVariation.rotation} />
```

---

## 🧪 Casos de Uso

### **Caso 1: Reproducción Normal (Auto-variado por fecha)**
```typescript
const variation = useLoopVariation(1);
// Sin seed → usa generateSessionSeed()
// Lunes: A
// Martes: B
// Miércoles: C
// Jueves (misma semana): A nuevamente (patrón 7 días)
```

### **Caso 2: Debugging (Seed Fija)**
```typescript
const variation = useLoopVariation(1, 12345);
// Siempre la misma secuencia
// Útil para validar comportamientos específicos
```

### **Caso 3: Pre-generación de Sesión**
```typescript
const fullSession = generateFullInstallationVariation();
// Genera TODOS los loops de una vez:
// fullSession.loop1 → LoopVariation
// fullSession.loop2 → LoopVariation
// fullSession.loop3 → LoopVariation
// fullSession.loop4 → LoopVariation
// Útil para: QA, render pre-cached, logging
```

---

## 📊 Matriz de Variaciones

| Área | Parámetro | Rango | Loop1 | Loop2 | Loop3 | Loop4 |
|------|-----------|-------|-------|-------|-------|-------|
| **Material** | Bloques intercambiados | 0-8 | 1-2 | 2-3 | 3-5 | 5-7 |
| **Burst** | Frase seleccionada | 5-15 opciones | ✓ | ✓ | ✓ | ✓ |
| **Peak** | fontSize | 140-180 | ✓ | ✓ | ✓ | ✓ |
| | intensity | subtle/heavy | 50% | 50% | 50% | 50% |
| | flashCount | 0-3 | ✓ | ✓ | ✓ | ✓ |
| **Logo** | size | 150-250 | ✓ | ✓ | ✓ | ✓ |
| | rotation | -5°/+5° | ✓ | ✓ | ✓ | ✓ |
| | positionX | left/center/right | ✓ | ✓ | ✓ | ✓ |
| | positionY | top/center/bottom | ✓ | ✓ | ✓ | ✓ |
| | opacity | 0.7-1.0 | ✓ | ✓ | ✓ | ✓ |

---

## 🎨 Ejemplos de Salidas

### **Sesión A (Lunes 8 Sept)**
```
LOOP 1:
- Material: commercial → clip → chat → nosignal → news → mirror → music → zapping
- Burst: "NO CAMBIES DE CANAL" (peso 10)
- Peak: fontSize=165, intensity=heavy, flashCount=1
- Logo: size=180, rotation=-2°, center-top, opacity=0.85

LOOP 2:
- Material: commercial → news → chat → mirror → nosignal → clip → zapping → music
- Burst: "CONECTANDO..." (peso 10)
- Peak: fontSize=152, intensity=subtle, flashCount=0
- Logo: size=210, rotation=3°, right-bottom, opacity=0.92

... (Loop 3 y 4 similares)
```

### **Sesión B (Martes 9 Sept - misma seed base pero +1)**
```
LOOP 1:
- Material: commercial → clip → nosignal → chat → news → mirror → zapping → music
- Burst: "ESTA TE LA SABÉS" (peso 10)
- Peak: fontSize=171, intensity=subtle, flashCount=2
- Logo: size=195, rotation=1°, left-center, opacity=0.78

... (notablemente diferente pero "familiar")
```

---

## 🚀 Características Avanzadas

### **1. Peso por Familia de Frases**
El sistema ya respeta `phrase.weight` para preferir frases "esenciales":
```
Weight 10 (20 frases): Core, máxima relevancia
Weight 8-9 (10 frases): Alta relevancia, variación premium
Weight 1-7 (50+ frases): Secundarias, relleno coherente
```

### **2. Variaciones Coherentes por Loop**
Cada frase tiene `loops: number[]` que especifica dónde aparece:
```
Loop 1: TV/no señal (frases de "NO CAMBIES DE CANAL", "AJUSTE DE IMAGEN")
Loop 2: MSN/chat (frases de "¿ESTÁS EN MSN?", "CONECTANDO...")
Loop 3: Música (frases de "PONE ESA", "¿QUIÉN TIENE CD?")
Loop 4: Previa/boliche (frases de "HOY SE SALE", "ESTO RECIÉN EMPIEZA")
```

### **3. Reproducibilidad Total**
```typescript
// Guardar seed para documentación/reporte:
const seed = useSessionSeed();
console.log(`Modo Farra Session: ${new Date().toISOString()}`);
console.log(`Seed: ${seed}`);

// Luego, reproducir exactamente:
const backup = useLoopVariation(1, seed);
```

---

## 🔄 Próximo Paso

**Tarea #4**: Tests y validación visual
- QA checklist con capturas de cada loop
- Validar que variaciones "sientan" diferentes
- Confirmar que seed-based reproduction funciona
- Documentar "firma visual" de cada sesión

---

## 💡 Notas de Diseño

1. **No es Caos**: Cada variación respeta familia temática del loop
2. **Controlable**: Seed system permite reproducir exactamente
3. **Diario**: Automáticamente nuevo contenido cada día
4. **Performante**: Cálculos mínimos, memoización con React.useMemo()
5. **Escalable**: Fácil agregar más áreas de variación

---

**Firma del Motor**:
```
Tipo: PRNG Seed-based
Control: Full reproducibility via seed
Variabilidad: 20% (Loop1) → 80% (Loop4)
Coherencia: Familia temática preservada
Escalabilidad: +8 áreas de variación disponibles
```
