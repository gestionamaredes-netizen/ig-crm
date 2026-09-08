import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CRTProps } from './types';
import { COLORS } from '../../styles/tokens';

export const CRT: React.FC<CRTProps> = ({
  children,
  intensity = 'subtle',
  enabled = true,
  preset = 'TV_2000',
  curvature = 1,
  phosphorColor = COLORS.whiteFlash,
}) => {
  const frame = useCurrentFrame();
  const isHeavy = intensity === 'heavy';

  let filterStyles = '';
  let overlayOpacity = 0;
  let roll = 0;

  switch (preset) {
    case 'TV_90':
      // Curved, warm, low sharpness
      filterStyles = 'blur(0.5px) saturate(0.95) brightness(0.98)';
      overlayOpacity = 0.04;
      break;
    case 'TV_2000':
      // Flatter, brighter, cleaner
      filterStyles = 'contrast(1.05) brightness(1.02)';
      overlayOpacity = 0.02;
      break;
    case 'BROKEN_SIGNAL':
      // Roll, sync loss, snow
      filterStyles = 'brightness(0.95)';
      overlayOpacity = 0.08;
      roll = isHeavy ? Math.sin(frame * 0.1) * 8 : Math.sin(frame * 0.05) * 3;
      break;
  }

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        filter: filterStyles,
        transform: `translateY(${roll}px)`,
      }}
    >
      {/* CRT glass effect */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>

      {/* Phosphor glow overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          backgroundColor: phosphorColor,
          opacity: overlayOpacity * (isHeavy ? 2 : 1),
          mixBlendMode: 'screen',
        }}
      />

      {/* CRT tube glass reflection */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          background: `
            radial-gradient(ellipse at 50% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Sync loss for BROKEN_SIGNAL */}
      {preset === 'BROKEN_SIGNAL' && (
        <>
          {/* Roll bars */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: isHeavy ? '30%' : '10%',
              backgroundColor: COLORS.black,
              opacity: 0.3,
              pointerEvents: 'none',
              animation: isHeavy
                ? `sync-roll-heavy 0.4s linear infinite`
                : `sync-roll 0.8s linear infinite`,
            }}
          />

          {/* Snow effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='snow'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='8' numOctaves='1' result='noise' /%3E%3C/filter%3E%3Crect width='200' height='200' fill='white' filter='url(%23snow)' opacity='0.1' /%3E%3C/svg%3E")`,
              opacity: isHeavy ? 0.15 : 0.08,
              pointerEvents: 'none',
              mixBlendMode: 'screen',
            }}
          />
        </>
      )}

      <style>{`
        @keyframes sync-roll {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        @keyframes sync-roll-heavy {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
