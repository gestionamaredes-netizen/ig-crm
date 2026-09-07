# 2️⃣ Estrategia de Assets - Modo Farra

**Estado**: Plan ejecutable | **Prioridad**: Crítica para producción | **Plazo**: 7 de septiembre (2 días antes del evento)

---

## 📋 Resumen Ejecutivo

Modo Farra requiere **3 categorías de assets**:

1. **RECREAR EN CÓDIGO** (HTML/SVG/React): Elementos interactivos que varían por loop
2. **BUSCAR EN ARCHIVOS** (video/imagen): Material auténtico 90s/2000s argentino
3. **TEXTURAS DE EFECTOS** (VHS/CRT/glitch): Capas de degradación visual

| Categoría | Prioridad | Recurso | Plazo |
|-----------|-----------|---------|-------|
| Elementos UI | CRÍTICA | Código React | 6-7 sept |
| Material video | ALTA | Búsqueda + licencia | 6-7 sept |
| Texturas | MEDIA | Generación/descargas | 5-6 sept |

---

## 🛠️ RECREAR EN CÓDIGO (Elementos Interactivos)

### **1. Ventana MSN/Chatroom** ✅ PARCIAL HECHO
**Status**: WindowScene.tsx existe pero rudimentario  
**Mejorar**:
- Animación de escritura realista (caracteres aparecen gradualmente)
- Personajes con avatares (8px cuadrados, colores vibrantes)
- Línea de estado: "Usuario conectado hace 2h"
- Múltiples conversaciones posibles (templates)
- Bordes Windows 98 auténticos con sombreado

**Archivos a crear/modificar**:
```
src/components/ChatWindow.tsx       → componente reutilizable
src/data/chatMessages.ts            → frases por tipo de chat
src/scenes/WindowScene.tsx          → mejorar con CharacterAvatar
```

**Tiempo estimado**: 3-4 horas

---

### **2. Teléfono Celular (Flip/BlackBerry)** ❌ NO EXISTE
**Presencia visual**: Aparecería en transiciones o como "fake screenshot"  
**Componentes**:
- Carcasa 3D simple (CSS perspective) o SVG
- Pantalla LCD con texto (SMS, contactos)
- Antena retrácil (animada)
- Teclado numérico (T9 predictivo visual)

**Uso en Loop01**: Posible elemento en bloque de material (reemplazar un MemoryScene o como overlay)

**Tiempo estimado**: 4-5 horas (incluida 3D CSS básica)

---

### **3. Discman/Walkman CD** ❌ NO EXISTE
**Presencia visual**: Icónico de los 90s, ideal para bloque "MÚSICA"  
**Componentes**:
- Carcasa plateada/negra
- Display LCD pequeño (título canción, tiempo)
- Botones (play/pause/skip) animados
- Efecto de vibración (reproduciendo)
- Auriculares conectados (wire detail)

**Variantes**:
- Discman Sony D-EJ001 (icónico plateado)
- iPod (si queremos entrar a 2000s tardío)
- Walkman cassette (analogía sonora)

**Tiempo estimado**: 5-6 horas

---

### **4. Espejo del Baño** ✅ EXISTE
**Status**: MirrorScene.tsx funcional  
**Mejorar**:
- Detalle de azulejos blanco/celeste (patrón repeat)
- Botiquín abierto/cerrado (estados)
- Frascos/productos (silhuetas genéricas)
- Vapor/desempañante animado
- Luz fluorescente parpadeante

**Tiempo estimado**: 2-3 horas

---

### **5. Panel de Canales TV (Zapping)** ✅ PARCIAL HECHO
**Status**: TVScene.tsx existe  
**Mejorar**:
- Nombres de canales más auténticos (Telefe, Canal 13, América, Crónica)
- Números de canal (2, 7, 9, 13 en Argentina)
- Ícono/logo de cada canal (vectores simples)
- Efecto de "cambio de canal" (transición entrelazada)
- Información: horario + rating + publicidad

**Tiempo estimado**: 2-3 horas

---

### **6. Publicidad Fake / Carteles** ❌ PARCIAL
**Presencia**: Carteles con marcas 90s, logos stylizados  
**Ejemplos**:
- "COCACOLA ZERO" (anacrónismo pero icónico)
- "FRUTALES SABOREA EL SABOR"
- "REXONA SIN PREOCUPARTE"
- "FRUGELE YOGUR"

**Técnica**: Vectores SVG + glitch overlay  
**Tiempo estimado**: 3-4 horas (diseño + codificación)

---

## 📹 BUSCAR EN ARCHIVOS (Material Auténtico)

### **Prioridad 1: Material de VIDEO**

#### A. Publicidades Argentinas 90s/2000s
**Fuentes recomendadas**:
- **YouTube Retro Argentina**: buscar "publicidad argentina 1990s"
- **Archivo TV Argentina**: [www.archivoargentino.com](http://www.archivoargentino.com) (si existe)
- **Vimeo Heritage**: filtrar por "Argentine advertising"
- **TikTok Archive**: usuarios con compilaciones de publicidades antiguas

**Qué buscar**:
- Cocacola, Frutales, Rexona (marcas culturales)
- Gaseosas locales (Pritty, Paso de los Toros)
- Alimentos (Maggi, Sancor)
- Duchas/deodorantes (Axe/Lynx primeros anuncios)
- Duración: 15-30 segundos (cortar clips)

**Licencia**: Creative Commons o dominio público si es anterior a 1995  
**Almacenamiento**: `/assets/videos/commercials/`  
**Tiempo estimado**: 6-8 horas de búsqueda

---

#### B. Cumbia/Bailanta/Videoclips
**Fuentes**:
- **YouTube**: Dady Brieva, Grupo Mania, Sonia & Selena, Sabrosos del Groove
- **Cumbia.mx & sites regionales**: archivos de cumbia argentina
- **Vimeo Documentales**: recopilaciones de danza 90s

**Qué buscar**:
- Videoclips cortos (30-60 seg)
- Grupos bailando en estudio (chroma key para remix)
- Plataforma de TV (Videomatch, Ritmo Privado)
- Bailarinas en formaciones (coreografía simple)

**Licencia**: Creative Commons o contactar productoras  
**Almacenamiento**: `/assets/videos/clips/bailanta/`  
**Tiempo estimado**: 4-6 horas de búsqueda

---

#### C. Noticieros/Noticias Argentinas
**Fuentes**:
- **Crónica TV Archive** (si tiene YouTube channel)
- **Telefe Noticias** (búsqueda por año + tema)
- **Canal 26** (especializado en noticias, muchos archivos online)
- **Internet Archive / Wayback Machine**: para URLs antiguas de canales

**Qué buscar**:
- Intertítulos "ÚLTIMA HORA" / "FLASH"
- Gráficos informativos (cotización USD, clima, tránsito)
- Presentadores clásicos (ej: Mauro Viale, Marisa Paredes)
- Duración: 20-40 segundos

**Licencia**: Contactar canales (Telefe/Canal 13) para permisos de reutilización  
**Almacenamiento**: `/assets/videos/news/`  
**Tiempo estimado**: 3-4 horas de búsqueda

---

#### D. Cine/Películas (Fragmentos)
**Fuentes**:
- **Turner Classics / TCM Latino** (películas clásicas argentinas)
- **Cine.ar** (plataforma estatal argentina, películas de dominio público)
- **YouTube**: fragmentos de películas 80s/90s

**Qué buscar**:
- Escenas de drama/acción (15-40 seg)
- Películas argentinas clásicas (Campanelli, Leopoldo Torre Nilsson)
- B-movies y películas de bajo presupuesto (estética auténtica)

**Licencia**: Dominio público o contactar productoras  
**Almacenamiento**: `/assets/videos/cinema/`  
**Tiempo estimado**: 3-4 horas de búsqueda

---

### **Prioridad 2: Material de IMAGEN**

#### A. Fotogramas Estáticos (screenshots de TV)
**Usar para**: Bloques de "memoria" (MemoryScene backgrounds)

**Fuentes**:
- Captura de fotogramas de videos descargados
- Generación procedural (degradado + ruido)
- Fotografías de TV cathode ray (CRT pattern)

**Qué buscar**:
- Fondos TV genéricos (azul TV 90s, patrón genérico)
- Gráficos de noticias (2000s style)
- Patrones de relleno (barras de color, grillas)

**Almacenamiento**: `/assets/images/tv-frames/`  
**Tiempo estimado**: 2-3 horas

---

#### B. Texturas de Objetos (Carteles, Superficies)
**Usar para**: Elementos UI recreados en código

**Fuentes**:
- Google Images (filtrar por licencia Creative Commons)
- Unsplash / Pexels (texturas genéricas)
- 3D model texture sites (CGTrader, Poly Haven)

**Qué buscar**:
- Texturas de acero cepillado (carcasa Discman)
- Plástico negro mate (teléfono celular)
- Azulejos baño blanco/celeste
- Papel de revista/impreso (textura retro)

**Almacenamiento**: `/assets/textures/`  
**Tiempo estimado**: 1-2 horas

---

## 🎨 TEXTURAS DE EFECTOS (Capas de Degradación)

### **Estrategia de Generación vs. Descarga**

#### **VHS Scanlines (Líneas de escaneo)**
- **Opción 1**: Generar proceduralmente en código (interpolate + noise)
- **Opción 2**: Descargar preset `.svg` o `.png`
- **Fuente si descargamos**: VintageFilmEffects.com, TextureHaven

**Recomendación**: **GENERAR en código**  
- Más control dinámico (intensidad por frame)
- Archivo: `src/components/effects/VHSEffect.tsx` (ya existe parcial)

**Tiempo estimado**: 1 hora (optimización)

---

#### **CRT Curve (Distorsión de pantalla CRT)**
- **Opción 1**: Shader GLSL (requiere canvas/WebGL)
- **Opción 2**: Filtro CSS (blur + distortion)
- **Opción 3**: SVG filter (feTurbulence + feDisplacementMap)

**Recomendación**: **USAR BIBLIOTECA**: `crt.js` o `crt-effect-library`  
- Descargar de NPM o GitLab
- Integrar en `src/components/effects/CRTEffect.tsx`

**Tiempo estimado**: 2-3 horas (testing + calibración)

---

#### **Glitch/RGB Shift**
- **Opción 1**: Generar en código (canvas + desplazamiento de canales RGB)
- **Opción 2**: Usar biblioteca `glitch.js`
- **Opción 3**: Filtro CSS (múltiples sombras + offset)

**Recomendación**: **GENERAR en código** (más control)  
- Archivo: `src/components/effects/GlitchEffect.tsx` (crear si no existe)
- Usar canvas para máxima flexibilidad

**Tiempo estimado**: 3-4 horas

---

#### **Degradación Analógica (Ruido, Aberración Cromática)**
- **Técnica**: Mezcla de filtros CSS + SVG filters + generación procedural
- **Fuente**: Remotion tiene helpers para blur, noise

**Recomendación**: **GENERAR en código** combinando:
```tsx
1. filter: "url(#crt-distortion)"  // SVG
2. filter: "blur(0.5px) saturate(0.9)"  // CSS
3. Canvas noise overlay  // JavaScript
```

**Tiempo estimado**: 2-3 horas

---

### **Matriz de Assets de Textura**

| Textura | Técnica | Recurso | Prioridad | Plazo |
|---------|---------|---------|-----------|-------|
| VHS Scanlines | Procedural | Código React | CRÍTICA | 4-5 sept |
| CRT Curve | SVG Filter | SVG + CSS | CRÍTICA | 4-5 sept |
| RGB Glitch | Canvas | Código React | ALTA | 5-6 sept |
| Ruido Analógico | Procedural | SVG feTurbulence | ALTA | 5-6 sept |
| Chromatic Aberration | CSS Filter | CSS 3D | MEDIA | 6-7 sept |

---

## 📁 Estructura de Directorios Propuesta

```
modo-farra/
├── assets/
│   ├── videos/
│   │   ├── commercials/      ← Publicidades 90s
│   │   ├── clips/            ← Cumbia/videoclips
│   │   │   └── bailanta/
│   │   ├── news/             ← Noticieros
│   │   └── cinema/           ← Películas/fragmentos
│   ├── images/
│   │   ├── tv-frames/        ← Screenshots TV
│   │   ├── posters/          ← Carteles fake
│   │   └── thumbnails/       ← Previsualizaciones
│   └── textures/
│       ├── vhs/              ← Scanlines (si descargar)
│       ├── crt/              ← Efectos CRT (si descargar)
│       └── surfaces/         ← Plástico, metal, azulejos
├── src/
│   ├── components/
│   │   ├── effects/
│   │   │   ├── VHSEffect.tsx
│   │   │   ├── CRTEffect.tsx
│   │   │   └── GlitchEffect.tsx
│   │   ├── ChatWindow.tsx     ← CREAR
│   │   ├── PhoneUI.tsx        ← CREAR
│   │   ├── DiscmanUI.tsx      ← CREAR
│   │   └── ...
│   ├── data/
│   │   ├── chatMessages.ts    ← CREAR
│   │   └── phrases.ts
│   └── scenes/
│       └── ...
└── ESTRATEGIA_ASSETS.md       ← Este documento
```

---

## 🎯 Plan de Ejecución (7 de septiembre)

### **Lunes 5 de septiembre** (Hoy)
- [ ] Crear directorios en `/assets/`
- [ ] Iniciar búsqueda de material video (paralelo)
- [ ] Iniciar optimización de texturas de efectos

### **Martes 6 de septiembre**
- [ ] Completar búsqueda de material video
- [ ] Recrear en código: ChatWindow + PhoneUI + DiscmanUI
- [ ] Finalizar texturas y efectos

### **Miércoles 7 de septiembre** (Día antes del evento)
- [ ] QA de todos los assets
- [ ] Integración final en Loop01 + Loop02-04
- [ ] Validación de licencias

---

## 📊 Matriz de Decisiones Rápidas

**Pregunta**: ¿Recrear o buscar?

| Elemento | Criterio | Decisión |
|----------|----------|----------|
| MSN Chat | Variación dinámica, personalización | **RECREAR** |
| Publicidad Cocacola | Autenticidad, material específico | **BUSCAR** |
| Teléfono flip | Reconocimiento icónico, pocos clips | **RECREAR** |
| Noticieros TV | Específico por región, auténtico | **BUSCAR** |
| Discman | Objeto estático, pocos detalles | **RECREAR** |
| Cumbia videoclips | Energía, bailarinas reales | **BUSCAR** |
| VHS scanlines | Control dinámico, repetición | **GENERAR** |
| CRT distortion | Precisión visual, calibración | **GENERAR/DESCARGAR** |

---

## 💡 Recomendaciones Finales

1. **Paralelizar búsquedas**: Asignar personas a YouTubers/archivos mientras se programa
2. **Licencias**: Documentar todas las fuentes (CC-BY-SA, dominio público)
3. **Backups**: Descargar material a disco local (YouTube puede quitar videos)
4. **Testing visual**: Cada asset previsualizarse en Loop01 antes de finalizar
5. **Iteración**: Primero versión básica funcional, luego pulir detalles

---

**Próximo paso**: Tarea #3 - Motor de Randomizer (generar variaciones de loops)
