import React from 'react';
import { useCurrentFrame } from 'remotion';
import { GlitchProps } from './types';
import { COLORS } from '../../styles/tokens';

export const Glitch: React.FC<GlitchProps> = ({
  children,
  intensity = 'subtle',
  enabled = true,
  offset = 4,
  duration = 6,
}) => {
  const frame = useCurrentFrame();
  const isHeavy = intensity === 'heavy';

  if (!enabled) {
    return <>{children}</>;
  }

  const glitchIntensity = isHeavy ? 2 : 1;
  const glitchFreq = isHeavy ? 0.15 : 0.1;

  // Determine if we're in a glitch frame
  const glitchFrame = frame % duration;
  const isGlitching = glitchFrame < 2; // 2 frames of glitch every 6 frames

  if (!isGlitching && !isHeavy) {
    return <>{children}</>;
  }

  const offsetX = isGlitching
    ? Math.sin(frame * glitchFreq) * offset * glitchIntensity
    : 0;
  const offsetY = isGlitching
    ? Math.cos(frame * glitchFreq) * offset * glitchIntensity
    : 0;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>

      {/* RGB channel shift glitch */}
      {isGlitching && (
        <>
          {/* Red channel */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              backgroundColor: COLORS.redBurn,
              opacity: 0.15,
              mixBlendMode: 'multiply',
              transform: `translate(${offsetX}px, ${offsetY}px) skewX(${offsetX * 0.5}deg)`,
            }}
          />

          {/* Chromatic aberration effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              background: `
                linear-gradient(
                  90deg,
                  ${COLORS.red} 0%,
                  transparent 5%,
                  transparent 95%,
                  ${COLORS.red} 100%
                )
              `,
              opacity: 0.08,
              mixBlendMode: 'screen',
              transform: `scaleX(${1 + offsetX * 0.02})`,
            }}
          />

          {/* Displacement noise */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='disp'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100' height='100' fill='white' filter='url(%23disp)' opacity='0.15' /%3E%3C/svg%3E")`,
              opacity: 0.2,
              mixBlendMode: 'overlay',
            }}
          />
        </>
      )}

      {/* Subtle heavy glitch effect (always on for heavy) */}
      {isHeavy && !isGlitching && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            backgroundColor: COLORS.redBurn,
            opacity: 0.02,
            mixBlendMode: 'screen',
          }}
        />
      )}
    </div>
  );
};
