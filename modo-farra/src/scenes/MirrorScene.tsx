import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../styles/tokens';
import { VHS, ScreenText } from '../components';

interface MirrorSceneProps {
  from: number;
  duration: number;
}

export const MirrorScene: React.FC<MirrorSceneProps> = ({ from, duration }) => {
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

  // Efecto de espejo: cambios de brillo simulando flash
  const brightness = 0.8 + Math.sin(relativeFrame * 0.05) * 0.2;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        opacity,
      }}
    >
      <VHS intensity="subtle">
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: `brightness(${brightness})`,
            position: 'relative',
          }}
        >
          {/* Simulación de espejo con brillo */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '50%',
              backgroundColor: COLORS.blackTube,
              border: `3px solid ${COLORS.red}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 30px ${COLORS.red}`,
            }}
          >
            <ScreenText
              text="ESPEJO"
              fontSize={28}
              color={COLORS.red}
              pixelated={true}
            />
          </div>

          {/* Efecto de flash */}
          {relativeFrame % 30 < 3 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: COLORS.whiteFlash,
                opacity: 0.3,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </VHS>
    </div>
  );
};
