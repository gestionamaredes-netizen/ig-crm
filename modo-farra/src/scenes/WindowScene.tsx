import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../styles/tokens';
import { VHS, CRT, ScreenText } from '../components';

interface WindowSceneProps {
  from: number;
  duration: number;
  title?: string;
  content?: string;
}

export const WindowScene: React.FC<WindowSceneProps> = ({
  from,
  duration,
  title = 'CHATROOM',
  content = 'ESCRIBIENDO...',
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

  // Cursor de escritura animado
  const blink = Math.floor((relativeFrame / 10) % 2) === 0 ? '|' : '';

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        opacity,
      }}
    >
      <CRT preset="TV_2000" intensity="subtle">
        <VHS intensity="subtle">
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: COLORS.blackTube,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
            }}
          >
            {/* Ventana de Windows 98 style */}
            <div
              style={{
                width: '70%',
                height: '60%',
                backgroundColor: '#c0c0c0',
                border: '2px solid',
                borderColor: `${COLORS.white} ${COLORS.black}`,
                boxShadow: `inset 1px 1px 0 0 ${COLORS.white},
                           inset -1px -1px 0 0 ${COLORS.black}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  backgroundColor: '#000080',
                  color: COLORS.white,
                  padding: '2px 2px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 11,
                  fontFamily: 'MS Sans Serif, Arial',
                  fontWeight: 'bold',
                }}
              >
                <span>{title}</span>
                <span>_□X</span>
              </div>

              {/* Content */}
              <div
                style={{
                  flex: 1,
                  padding: 4,
                  backgroundColor: '#c0c0c0',
                  fontSize: 11,
                  fontFamily: 'MS Sans Serif, Arial',
                  overflow: 'hidden',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <ScreenText
                    text={content}
                    fontSize={12}
                    color={COLORS.black}
                    pixelated={true}
                  />
                  <span style={{ color: COLORS.red, fontSize: 12 }}>
                    {blink}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </VHS>
      </CRT>
    </div>
  );
};
