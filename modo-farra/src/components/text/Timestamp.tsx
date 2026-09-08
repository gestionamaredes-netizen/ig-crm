import React from 'react';
import { COLORS, FONTS } from '../../styles/tokens';

interface TimestampProps {
  text: string;
  fontSize?: number;
  opacity?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const Timestamp: React.FC<TimestampProps> = ({
  text,
  fontSize = 24,
  opacity = 0.8,
  position = 'top-left',
}) => {
  const positionMap = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...positionMap[position],
        fontFamily: FONTS.timestamp.family,
        fontSize: `${fontSize}px`,
        fontWeight: FONTS.timestamp.weight,
        color: COLORS.whiteFlash,
        opacity: opacity,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontVariantNumeric: 'tabular-nums',
        textShadow: `0 2px 4px ${COLORS.black}`,
      }}
    >
      {text}
    </div>
  );
};
