# 🎬 MODO FARRA - Video Loop Installation

**Proyecto Visual para Teatro Pereyra, Ibiza** | **10 de Septiembre 2026**

---

## 🎯 ¿Qué es?

**Modo Farra** es una instalación audiovisual de **4 loops de 110 segundos** cada uno que regenera contenido único mediante randomización controlada. Diseñado para proyección continua en espacios públicos/festivales.

### **4 Temáticas**
1. **Loop 1**: TV 90s / Sin Señal
2. **Loop 2**: Internet 2000s / MSN / Fotolog
3. **Loop 3**: Música / Cumbia / Bailanta
4. **Loop 4**: Previa / Boliche / Noche

---

## 🚀 Inicio Rápido (5 minutos)

### **1. Clonar Repositorio**
```bash
git clone https://github.com/gestionamaredes-netizen/ig-crm.git
cd ig-crm/modo-farra
```

### **2. Instalar Dependencias**
```bash
npm install
```

### **3. Renderizar Videos**
```bash
# Un loop (para probar):
npm run render:loop01

# Los 4 loops:
npm run render:all
```

### **4. Salida**
```
renders/final/
├── modo-farra-loop-01.mp4 (110s)
├── modo-farra-loop-02.mp4 (110s)
├── modo-farra-loop-03.mp4 (110s)
└── modo-farra-loop-04.mp4 (110s)
```

---

## 📚 Documentación Completa

| Documento | Contenido |
|-----------|----------|
| **RENDER_LOCAL_GUIA.md** | Cómo renderizar videos (paso a paso) |
| **PROYECTO_FINAL.md** | Resumen ejecutivo completo |
| **INSTRUCCIONES_FINALES.md** | Setup en teatro + troubleshooting |
| **RESUMEN_COMPLETO.md** | Overview técnico del proyecto |
| **VALIDACION_VISUAL.md** | Checklist QA de cada loop |
| **MOTOR_RANDOMIZER.md** | Cómo funciona la variación diaria |
| **ESTRATEGIA_ASSETS.md** | Qué recrear vs. buscar vs. generar |
| **TESTS_VALIDACION.md** | 10 niveles de validación |

---

## 🎨 Características Técnicas

- **Framework**: Remotion (React + Video Composition)
- **Lenguaje**: TypeScript (0 errors)
- **Video**: 1920×1080 @ 30fps, H.264
- **Duración**: 110s/loop, 440s total (7.3 min)
- **Randomizer**: Seed-based (reproducible + variado)
- **Componentes**: 5 escenas + 3 UI (Chat, Phone, Discman)

---

## 📁 Estructura del Proyecto

```
src/
├── compositions/     # 4 loops compilados
├── scenes/           # 5 escenas (NoSignal, Memory, Window, Mirror, TV)
├── components/       # UI (Chat, Phone, Discman)
├── hooks/            # useLoopVariation (randomizer)
├── utils/            # randomizer.ts (seed-based PRNG)
└── data/             # phrases.ts (80 frases, 9 familias)
```

---

## 🎬 Renderización

### **Tiempos Estimados**
| Hardware | 1 Loop | 4 Loops |
|----------|--------|---------|
| M1/M2 Mac | 2-3 min | 8-12 min |
| Intel i7 | 3-5 min | 12-20 min |
| AMD Ryzen 7 | 2-3 min | 8-12 min |

### **Comandos**
```bash
npm run render:loop01    # Un loop
npm run render:all       # Los 4 loops en secuencia
npm run render:loop01 & npm run render:loop02 & npm run render:loop03 & npm run render:loop04  # Paralelo
```

---

## ✅ Status

| Componente | Status |
|-----------|--------|
| **Código** | ✅ 100% completo (0 errores TS) |
| **Tests** | ✅ Checklist completo |
| **Docs** | ✅ 8 documentos |
| **Render** | ✅ Listo para ejecutar |
| **Video** | ⏳ Renderizar localmente |

---

## 🎪 Para el Evento (10 Sept)

1. **Antes**: Renderizar 4 videos localmente
2. **Backup**: USB + Cloud (Google Drive)
3. **Teatro**: Llegar 30 min antes, setup + prueba
4. **Reproducción**: Loop continuo en proyector

Ver **INSTRUCCIONES_FINALES.md** para detalles.

---

## 🎯 Pro Tips

### **Ver preview en vivo**
```bash
npm run preview
# Abre http://localhost:3000 en navegador
```

### **Concatenar los 4 loops para reproducción continua**
```bash
ffmpeg -i renders/final/modo-farra-loop-01.mp4 \
       -i renders/final/modo-farra-loop-02.mp4 \
       -i renders/final/modo-farra-loop-03.mp4 \
       -i renders/final/modo-farra-loop-04.mp4 \
       -filter_complex "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[v]" \
       -map "[v]" modo-farra-session.mp4
```

### **Renderizar con calidad personalizada**
```bash
npx remotion render src/index.ts Loop01 out.mp4 --quality 80
```

---

## 🔧 Troubleshooting

**"remotion: not found"** → `npm install --save-dev remotion`

**"Out of memory"** → Renderiza de a un loop (`npm run render:loop01`)

**"Video con resolución incorrecta"** → Ve a RENDER_LOCAL_GUIA.md

---

## 📞 Soporte

- **Repo**: https://github.com/gestionamaredes-netizen/ig-crm
- **Branch**: claude/new-session-caqa5g
- **Email**: gestionama.redes@gmail.com

---

## 📊 Resumen del Proyecto

✅ **4 loops audiovisuales** (110s c/u)
✅ **Randomizer seed-based** (único cada día)
✅ **5 escenas temáticas** (NoSignal, Memory×4, Window, Mirror, TV)
✅ **3 componentes UI** (Chat, Phone, Discman)
✅ **Paleta 90s auténtica** (VHS + CRT effects)
✅ **TypeScript strict** (0 errors)
✅ **Documentación completa** (8 docs)
✅ **Listo para producción**

---

**Evento**: 10 de Septiembre 2026, Teatro Pereyra, Ibiza 🌴  
**Status**: 🟢 **LISTO PARA RENDERIZAR LOCALMENTE**
