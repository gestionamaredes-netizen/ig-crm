# MODO FARRA — Video Loops

4 loops audiovisuales para Teatro Pereyra, Ibiza — 10.09.2026

## Especificación

- **Resolución:** 1920×1080 (16:9)
- **FPS:** 30
- **Duración por loop:** 110s = 3300 frames = 1:50
- **Codec:** H.264
- **Salida:** `renders/final/modo-farra-loop-01.mp4` … `loop-04.mp4`

## Estructura

```
src/
  config.ts              # Especificaciones cerradas
  styles/tokens.ts       # Colores y tipografías (únicas fuentes de verdad)
  data/phrases.ts        # 80 frases con familia, loops y peso
  compositions/          # Loop01 … Loop04
  scenes/                # VHSScene, MSNScene, CumbiaScene, etc.
  components/            # Degradation, Text, Logo
```

## Instalación

```bash
npm install
```

## Desarrollo

```bash
# Preview en estudio
npm run preview

# Preview de Loop 01 en resolución reducida
npm run preview:loop01

# Validar especificaciones
npm run validate
```

## Render

```bash
# Renderizar Loop 01
npm run render:loop01

# Renderizar todos los loops
npm run render:all
```

## Reglas arquitectónicas

1. **Los datos afuera del código** — frases, orden, duraciones viven en `src/data/`
2. **Las escenas son componentes reutilizables** — `<VHSScene>` funciona igual en los 4 loops con distintas props
3. **Cada loop se renderiza por separado**
4. **Los assets se agregan copiando archivos** — `assets.ts` lee la carpeta automáticamente

## Prioridad de construcción

1. ✅ `config.ts`, `tokens.ts`, `data/`
2. ⏳ `<VHS>`, `<CRT>`, `<Glitch>`
3. ⏳ `<GiantText>` y sistema de logo
4. ⏳ Escenas de Loop 01
5. ⏳ Loop 01 completo + preview
6. ⏳ Randomizer
7. ⏳ Loops 02, 03, 04
8. ⏳ Validación y render

**Nota crítica:** Si Loop 01 no está proyectable en tiempo, se abandonan los otros 3 y se hacen 3 variaciones del 01 con el randomizer.
