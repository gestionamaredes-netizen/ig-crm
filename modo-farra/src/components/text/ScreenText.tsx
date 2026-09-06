import React from 'react';
import { COLORS, FONTS } from '../../styles/tokens';

interface ScreenTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  pixelated?: boolean;
  style?: React.CSSProperties;
}

export const ScreenText: React.FC<ScreenTextProps> = ({
  text,
  fontSize = 14,
  color = COLORS.white,
  opacity = 1,
  pixelated = true,
  style,
}) => {
  return (
    <div
      style={{
        fontFamily: FONTS.screen.family,
        fontSize: `${fontSize}px`,
        fontWeight: FONTS.screen.weight,
        color: color,
        opacity: opacity,
        imageRendering: pixelated ? 'pixelated' : 'auto',
        lineHeight: 1.4,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
