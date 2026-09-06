import React from 'react';
import { COLORS, FONTS } from '../../styles/tokens';
import { ModoFarraDots } from './ModoFarraDots';

interface ModoFarraLogoProps {
  size?: number;
  color?: string;
  opacity?: number;
  position?: { top?: number; left?: number; right?: number; bottom?: number };
  includeText?: boolean;
  glitch?: boolean;
}

export const ModoFarraLogo: React.FC<ModoFarraLogoProps> = ({
  size = 120,
  color = COLORS.red,
  opacity = 1,
  position = { bottom: 40, right: 40 },
  includeText = true,
  glitch = false,
}) => {
  const dotSize = size * 0.15;
  const textSize = size * 0.6;

  return (
    <div
      style={{
        position: 'absolute',
        ...position,
        opacity: opacity,
        transform: glitch ? `skewX(${Math.random() * 2 - 1}deg)` : 'none',
      }}
    >
      {includeText && (
        <div
          style={{
            fontFamily: FONTS.brand.family,
            fontSize: `${textSize}px`,
            fontWeight: FONTS.brand.weight,
            color: color,
            textTransform: 'uppercase',
            letterSpacing: -2,
            textAlign: 'center',
            marginBottom: `${size * 0.2}px`,
            lineHeight: 1,
          }}
        >
          FARRA
        </div>
      )}

      <ModoFarraDots
        size={dotSize}
        color={color}
        opacity={1}
        position={{ left: `calc(50% - ${dotSize * 1.75}px)` }}
      />
    </div>
  );
};
