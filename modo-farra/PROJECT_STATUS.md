# MODO FARRA — PROJECT STATUS

**Event:** Teatro Pereyra, Ibiza — September 10, 2026 (4 days)  
**Status:** Foundation Complete ✅ — Core systems ready for scene development

---

## ✅ COMPLETED

### Infrastructure (Priority 1)
- ✅ Remotion project initialized
- ✅ Config: 1920×1080, 30fps, 3300 frames (110s)
- ✅ TypeScript + React configured
- ✅ Project structure per CLAUDE.md architecture rules

### Token System (Priority 1)
- ✅ Color palette: black, red (#E01B1B), white + intruders
- ✅ Typography (5 voices): brand, giant, screen, timestamp, bailanta
- ✅ Single source of truth: `src/styles/tokens.ts`

### Phrases (Priority 1)
- ✅ All 80 frases imported from FRASES_MODO_FARRA.md
- ✅ Organized by family: MSN, FOTOLOG, CELULARES, MÚSICA, TV, PREVIA, BOLICHE, SISTEMA
- ✅ Weight system: 20 essential phrases (weight 10), 60 rotating (weight 1-3)
- ✅ Loop assignment: Each phrase tagged for loops 1-4
- ✅ Helper functions: `getPhrasesByLoop()`, `getEssentialPhrases()`

### Degradation Components (Priority 2)
- ✅ **VHS**: Grain, scanlines (3-4px for projection), tape warble
- ✅ **CRT**: TV_90 (warm), TV_2000 (clean), BROKEN_SIGNAL (roll/snow)
- ✅ **Glitch**: RGB shift, chromatic aberration, displacement
- ✅ Intensity system: `subtle` (baseline) or `heavy` (4-12 frames at peaks)

### Text Components (Priority 2)
- ✅ **GiantText**: Grotesca condensada, bold (main voice)
- ✅ **Timestamp**: VCR OSD Mono for UI
- ✅ **ScreenText**: Tahoma/MS Sans Serif, pixelated
- ✅ **BailantaText**: Bold italic with shadow/glow

### Logo System (Priority 2)
- ✅ **ModoFarraDots**: 3-dot mark (animated pulse)
- ✅ **ModoFarraLogo**: Full logo (FARRA + dots)
- ✅ **ModoFarraStamp**: Watermark version
- ✅ Rule: Dots appear 8× more than full logo

### Scenes (Priority 3)
- ✅ **TVScene**: Simulates channel zapping with color/text cycling
- ✅ **PlaceholderScene**: Filler for material blocks (easily replaceable)

### Loop01 Implementation (Priority 4)
- ✅ Fixed timecode structure per CLAUDE.md:
  - Frame 0–240: Opening/splice point
  - Frame 240–2340: Material blocks (7 scenes)
  - Frame 2340–2700: Phrase burst (random high-weight phrase, 120px)
  - Frame 2700–2800: **ESTA TE LA SABÉS** peak (160px white, BROKEN_SIGNAL CRT)
  - Frame 3000–3100: Modo Farra logo (red, top-right, BROKEN_SIGNAL CRT)
  - Frame 3210–3300: Splice back to frame 0 (seamless loop)
- ✅ Seamless infinite looping: frame 0→3300→0

### Build & Deployment
- ✅ npm install completes successfully
- ✅ TypeScript compilation passes (no errors)
- ✅ Git commits & push to `claude/new-session-caqa5g`
- ✅ PR #3 created (draft)

---

## ⏳ IN PROGRESS / NEXT

### Priority 3 (Day 1-2)
1. **Asset acquisition** (parallel):
   - Recreate: MSN window (HTML + degrade), keystrokes, phones, CD player, Discman
   - Search: 90s commercials, Argentine TV, cumbia videoclips, bailanta posters
   - Textures: VHS damage, CRT curves, dropout, tape warble, paper, glass

2. **Material blocks for Loop01** (replace placeholders):
   - Block 1-2: TV/zapping scenes
   - Block 3-6: Archive material (real or recreated video clips)
   - Total material block: 2100 frames (70 seconds)

### Priority 4 (Day 2-3)
3. **Complete Loop01** →  **PROJECTABLE BY SEPT 9**
   - Fill material blocks with actual clips/scenes
   - Test on projector (luminance check: >15% brightness, no silent black frames)
   - Validate all effects at 30m distance with smoke/red lights

### Priority 5 (Day 3-4) — Only if Loop01 is locked
4. **Randomizer engine**:
   - Shuffle phrase order respecting weights
   - Vary material block order and duration
   - Generate 3 Loop01 variations (fallback if time runs out)

5. **Loops 02–04** (reuse Loop01 motor, change scenes & phrases):
   - Loop02: ¿ESTÁS EN MSN? (digital corruption, Fotolog, webcam, dialup)
   - Loop03: PONE ESA (CD skip, radio, cumbia, music visual)
   - Loop04: UNA MÁS Y NOS VAMOS (party, mirror, friends, mobile)

### Priority 6 (Day 4 / if time allows)
6. **Validation & final render**
7. **Delivery**: 4 MP4 files to `renders/final/`

---

## 🔴 CRITICAL PATH

**Sept 9 (Day 3, midnight):** Loop01 must be:
- ✅ Projectable (no black silent frames, >15% luminance)
- ✅ Tested on actual theater projector
- ✅ Seamlessly looping (frame 0→3300→0)
- ✅ Synced to DJ/music (mute in theater, timing via cuts & flashes)

**If Loop01 not ready by Sept 9 midday:**
- Abandon loops 2–4
- Use randomizer to create 3 variations of Loop01
- Deploy 3 variations looping all night

---

## 📋 COMMANDS

```bash
npm run preview              # Studio (full UI)
npm run preview:loop01       # Loop01 only, reduced resolution
npm run validate             # Check specs
npm run render:loop01        # Final MP4
```

---

## 📁 STRUCTURE

```
src/
  config.ts                  # ✅ Specs closed
  styles/tokens.ts           # ✅ Colors & fonts
  data/phrases.ts            # ✅ 80 frases + weights
  components/
    degradation/             # ✅ VHS, CRT, Glitch
    text/                    # ✅ GiantText, Timestamp, etc.
    logo/                    # ✅ ModoFarraDots, Logo, Stamp
  scenes/                    # ⏳ TVScene, Placeholder → +5 material scenes
  compositions/
    Loop01.tsx               # ✅ Structure complete, placeholders
    Loop02-04.tsx            # ⏳ Stubs ready
```

---

## ⚡ OPTIMIZATIONS FOR TIME

1. **Scenes are parametric** — same TVScene can be reused 8 ways (different channels)
2. **Phrases randomized by weight** — no manual selection needed
3. **Degradation composable** — VHS + CRT + Glitch can stack
4. **Fallback is built in** — if 4 loops impossible, 3 Loop01 variations work fine
5. **No audio in theater** → only image and cuts matter → simpler render pipeline

---

## 👀 VISUAL CHECKLIST

Loop01 must pass these before deploy:

- [ ] Text readable at 30m (large enough, high contrast)
- [ ] No plain gray (only red/black/white)
- [ ] Scanlines visible but not distracting (3-4px)
- [ ] Degradation resets between blocks (not always on)
- [ ] Seamless loop (no pop/flicker at frame 0)
- [ ] Logo appears once per loop (frame 3000)
- [ ] Dots appear ~8× more than logo
- [ ] **ESTA TE LA SABÉS** is the climax (peak moment)
- [ ] No black silence >2 seconds

---

**Last updated:** Sept 6, 2026 — Foundation locked, scenes pending.
