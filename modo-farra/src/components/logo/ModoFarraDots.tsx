import React from 'react';
import { COLORS, FONTS } from '../../styles/tokens';

interface ModoFarraDotsProps {
  size?: number;
  color?: string;
  opacity?: number;
  position?: { top?: number; left?: number; right?: number; bottom?: number };
  animated?: boolean;
  delay?: number;
}

export const ModoFarraDots: React.FC<ModoFarraDotsProps> = ({
  size = 20,
  color = COLORS.red,
  opacity = 1,
  position,
  animated = false,
  delay = 0,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        ...position,
        display: 'flex',
        gap: `${size * 0.5}px`,
        opacity: opacity,
      }}
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: color,
            animation: animated
              ? `pulse-dot 0.6s ease-in-out infinite`
              : 'none',
            animationDelay: animated ? `${delay + index * 0.1}s` : '0s',
          }}
        />
      ))}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
