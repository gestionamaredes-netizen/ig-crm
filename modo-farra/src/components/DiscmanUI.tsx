import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS } from '../styles/tokens';

interface DiscmanUIProps {
  from: number;
  duration: number;
  trackTitle?: string;
  isPlaying?: boolean;
}

export const DiscmanUI: React.FC<DiscmanUIProps> = ({
  from,
  duration,
  trackTitle = 'PONE ESA',
  isPlaying = true,
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

  const cdRotation = isPlaying ? (relativeFrame * 2) % 360 : 0;

  return (
    <div
      style={{
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 180,
          height: 120,
          background: 'linear-gradient(135deg, #e8e8e8 0%, #c0c0c0 100%)',
          borderRadius: 8,
          border: '2px solid #999',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
          overflow: 'hidden',
          padding: 12,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 80,
            height: 30,
            backgroundColor: '#a8d8a8',
            border: '1px solid #666',
            borderRadius: 3,
            padding: 4,
            fontSize: 9,
            fontFamily: 'monospace',
            color: COLORS.black,
            fontWeight: 'bold',
            overflow: 'hidden',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {trackTitle.substring(0, 10)}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 12,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            color: COLORS.red,
            fontWeight: 'bold',
          }}
        >
          {isPlaying ? '▶' : '⏸'}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            right: 12,
            display: 'flex',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          {['⏮', '⏪', '⏯', '⏩', '⏭'].map((btn, idx) => (
            <div
              key={idx}
              style={{
                width: 28,
                height: 18,
                backgroundColor: '#999',
                border: '1px solid #666',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: COLORS.black,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              {btn}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 12,
            width: 60,
            height: 60,
            backgroundColor: '#333',
            borderRadius: '50%',
            border: '2px solid #666',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `rotate(${cdRotation}deg)`,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: '#1a1a1a',
              borderRadius: '50%',
              border: '1px solid #444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: COLORS.red,
                borderRadius: '50%',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
