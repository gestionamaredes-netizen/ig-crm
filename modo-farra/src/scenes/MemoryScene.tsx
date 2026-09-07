import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../styles/tokens';
import { VHS, CRT, ScreenText } from '../components';

interface MemorySceneProps {
  from: number;
  duration: number;
  type: 'commercial' | 'clip' | 'news' | 'soap' | 'music';
}

const SCENE_CONFIGS = {
  commercial: {
    bg: COLORS.red,
    text: 'PUBLICIDAD AÑOS 90',
    overlay: 'diagonal-stripes',
  },
  clip: {
    bg: COLORS.white,
    text: 'VIDEOCLIP',
    overlay: 'vhs-artifacts',
  },
  news: {
    bg: COLORS.winBlue,
    text: 'NOTICIEROS',
    overlay: 'scan-lines',
  },
  soap: {
    bg: COLORS.redBlood,
    text: 'TELENOVELA',
    overlay: 'color-shift',
  },
  music: {
    bg: COLORS.phosphorGreen,
    text: 'PROGRAMA MUSICAL',
    overlay: 'flicker',
  },
};

export const MemoryScene: React.FC<MemorySceneProps> = ({
  from,
  duration,
  type = 'commercial',
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - from;

  if (relativeFrame < 0 || relativeFrame >= duration) {
    return null;
  }

  const config = SCENE_CONFIGS[type];

  // Fade in/out
  const opacity = interpolate(
    relativeFrame,
    [0, 15, duration - 15, duration],
    [0, 1, 1, 0],
    { easing: Easing.inOut(Easing.cubic) }
  );

  // TV roll effect
  const rollOffset = Math.sin(relativeFrame * 0.03) * 8;

  // Color shift/flicker
  const flicker = Math.random() > 0.95 ? 0.1 : 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        opacity,
      }}
    >
      <CRT preset="TV_90" intensity="subtle">
        <VHS intensity="subtle">
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: config.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateY(${rollOffset}px)`,
              filter: `brightness(${1 - flicker}) saturate(${1 - flicker * 0.5})`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animación de barras horizontales (típicas de TV antigua) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 0, 0, 0.15) 2px,
                  rgba(0, 0, 0, 0.15) 4px
                )`,
                pointerEvents: 'none',
                animation: `tv-roll 0.3s linear infinite`,
              }}
            />

            {/* Contenido principal */}
            <ScreenText
              text={config.text}
              fontSize={36}
              color={config.bg === COLORS.white ? COLORS.black : COLORS.white}
              pixelated={true}
            />

            <style>{`
              @keyframes tv-roll {
                0% { transform: translateY(0); }
                100% { transform: translateY(4px); }
              }
            `}</style>
          </div>
        </VHS>
      </CRT>
    </div>
  );
};
