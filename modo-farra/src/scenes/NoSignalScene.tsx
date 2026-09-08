import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../styles/tokens';
import { CRT, GiantText } from '../components';

interface NoSignalSceneProps {
  from: number;
  duration: number;
}

export const NoSignalScene: React.FC<NoSignalSceneProps> = ({
  from,
  duration,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - from;

  if (relativeFrame < 0 || relativeFrame >= duration) {
    return null;
  }

  const opacity = interpolate(
    relativeFrame,
    [0, 15, duration - 15, duration],
    [0, 1, 1, 0],
    { easing: Easing.inOut(Easing.cubic) }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        opacity,
      }}
    >
      <CRT preset="BROKEN_SIGNAL" intensity="heavy">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.black,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Patrón de nieve TV */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="snow-effect">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="8"
                  numOctaves="1"
                  result="noise"
                />
              </filter>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill={COLORS.white}
              filter="url(#snow-effect)"
              opacity="0.2"
            />
          </svg>

          {/* Líneas de sincronización */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '30%',
              backgroundColor: COLORS.black,
              opacity: 0.4,
              animation: `sync-roll 0.6s linear infinite`,
            }}
          />

          {/* Texto */}
          <GiantText
            text="SIN SEÑAL"
            fontSize={100}
            color={COLORS.white}
          />

          <style>{`
            @keyframes sync-roll {
              0% { transform: translateY(-100%); }
              100% { transform: translateY(100vh); }
            }
          `}</style>
        </div>
      </CRT>
    </div>
  );
};
