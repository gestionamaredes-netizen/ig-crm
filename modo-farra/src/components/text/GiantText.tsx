import React from 'react';
import { COLORS, FONTS } from '../../styles/tokens';

interface GiantTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  style?: React.CSSProperties;
}

export const GiantText: React.FC<GiantTextProps> = ({
  text,
  fontSize = 140,
  color = COLORS.white,
  opacity = 1,
  style,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.giant.family,
          fontSize: `${fontSize}px`,
          fontWeight: FONTS.giant.weight,
          color: color,
          opacity: opacity,
          textTransform: 'uppercase',
          letterSpacing: -3,
          textAlign: 'center',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          textShadow: 'none',
          ...style,
        }}
      >
        {text}
      </div>
    </div>
  );
};
