import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { VHSProps } from './types';
import { COLORS } from '../../styles/tokens';

export const VHS: React.FC<VHSProps> = ({
  children,
  intensity = 'subtle',
  enabled = true,
  glitchAmount = 2,
  noiseAmount = 0.15,
  scanlineOpacity = 0.12,
}) => {
  const frame = useCurrentFrame();

  if (!enabled) {
    return <>{children}</>;
  }

  const isHeavy = intensity === 'heavy';
  const actualGlitchAmount = isHeavy ? glitchAmount * 3 : glitchAmount;
  const actualNoiseAmount = isHeavy ? noiseAmount * 2 : noiseAmount;
  const actualScanlineOpacity = isHeavy ? scanlineOpacity * 2 : scanlineOpacity;

  const glitchOffset = Math.sin(frame * 0.05) * actualGlitchAmount;
  const colorShift = Math.sin(frame * 0.07) * 2;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Main content with RGB shift */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          filter: `
            brightness(${1 - actualNoiseAmount * 0.5})
            contrast(${1 + actualNoiseAmount * 0.3})
            saturate(${1 - actualNoiseAmount * 0.2})
          `,
          transform: `translateY(${glitchOffset}px)`,
        }}
      >
        {children}
      </div>

      {/* Scanlines overlay */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: actualScanlineOpacity,
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="scanlines-vhs"
            x="0"
            y="0"
            width="100%"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke={COLORS.black}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#scanlines-vhs)"
        />
      </svg>

      {/* Noise grain */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='400' height='400' fill='%23000' filter='url(%23noiseFilter)' opacity='${actualNoiseAmount}' /%3E%3C/svg%3E")`,
          opacity: actualNoiseAmount * 0.5,
          mixBlendMode: 'overlay',
        }}
      />

      {/* Tape warble (horizontal distortion) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `linear-gradient(
            0deg,
            transparent 0%,
            rgba(0, 0, 0, ${actualNoiseAmount * 0.1}) 25%,
            transparent 50%,
            rgba(0, 0, 0, ${actualNoiseAmount * 0.1}) 75%,
            transparent 100%
          )`,
          animation: isHeavy
            ? `vhs-roll 0.3s linear infinite`
            : `vhs-roll 1s linear infinite`,
        }}
      />

      <style>{`
        @keyframes vhs-roll {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
      `}</style>
    </div>
  );
};
