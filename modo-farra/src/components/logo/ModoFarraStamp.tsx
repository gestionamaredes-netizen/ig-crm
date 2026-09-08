import React from 'react';
import { COLORS } from '../../styles/tokens';
import { ModoFarraDots } from './ModoFarraDots';

interface ModoFarraStampProps {
  opacity?: number;
  color?: string;
  size?: number;
}

export const ModoFarraStamp: React.FC<ModoFarraStampProps> = ({
  opacity = 0.3,
  color = COLORS.red,
  size = 40,
}) => {
  const dotSize = size * 0.2;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: opacity,
        pointerEvents: 'none',
      }}
    >
      <ModoFarraDots
        size={dotSize}
        color={color}
        opacity={1}
        position={{ left: `calc(50% - ${dotSize * 1.75}px)` }}
      />
    </div>
  );
};
