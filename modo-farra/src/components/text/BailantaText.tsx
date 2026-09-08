import React from 'react';
import { COLORS, FONTS } from '../../styles/tokens';

interface BailantaTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  glowColor?: string;
  style?: React.CSSProperties;
}

export const BailantaText: React.FC<BailantaTextProps> = ({
  text,
  fontSize = 80,
  color = COLORS.white,
  opacity = 1,
  glowColor = COLORS.redBurn,
  style,
}) => {
  return (
    <div
      style={{
        fontFamily: FONTS.bailanta.family,
        fontSize: `${fontSize}px`,
        fontWeight: FONTS.bailanta.weight,
        fontStyle: FONTS.bailanta.style,
        color: color,
        opacity: opacity,
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadow: `
          2px 2px 0px ${COLORS.redBlood},
          4px 4px 0px ${COLORS.redBlood},
          6px 6px 12px ${glowColor}
        `,
        transform: 'skewX(-10deg)',
        textAlign: 'center',
        ...style,
      }}
    >
      {text}
    </div>
  );
};
