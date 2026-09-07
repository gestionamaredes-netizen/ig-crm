import React from 'react';
import { interpolate, useCurrentFrame, Easing } from 'remotion';
import { COLORS } from '../styles/tokens';

interface PhoneUIProps {
  from: number;
  duration: number;
  message?: string;
  signalBars?: number;
}

export const PhoneUI: React.FC<PhoneUIProps> = ({
  from,
  duration,
  message = 'SIN SEÑAL',
  signalBars = 0,
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

  const antennaRotation = interpolate(
    relativeFrame,
    [0, 30, duration - 30, duration],
    [0, 45, 45, 0],
    { easing: Easing.inOut(Easing.cubic) }
  );

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
          width: 120,
          height: 180,
          backgroundColor: '#1a1a1a',
          borderRadius: 12,
          border: '2px solid #333',
          boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 10,
            right: 10,
            height: 80,
            backgroundColor: '#a8d8a8',
            border: '1px solid #333',
            borderRadius: 4,
            padding: 8,
            fontSize: 10,
            fontFamily: 'monospace',
            color: COLORS.black,
            overflow: 'hidden',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          {message.substring(0, 15)}
        </div>

        <div
          style={{
            position: 'absolute',
            top: 25,
            right: 15,
            display: 'flex',
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map((bar) => (
            <div
              key={bar}
              style={{
                width: 2,
                height: bar * 3,
                backgroundColor: bar <= signalBars ? COLORS.red : '#333',
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 15,
            right: 15,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
          }}
        >
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <div
              key={num}
              style={{
                width: 20,
                height: 16,
                backgroundColor: '#444',
                border: '1px solid #222',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 8,
                color: COLORS.white,
                fontWeight: 'bold',
              }}
            >
              {num}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            top: -5,
            right: 10,
            width: 3,
            height: 40,
            backgroundColor: '#666',
            borderRadius: 2,
            transformOrigin: 'bottom center',
            transform: `rotate(${antennaRotation}deg)`,
          }}
        />
      </div>
    </div>
  );
};
