import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { COLORS } from '../styles/tokens';

interface PlaceholderSceneProps {
  from: number;
  duration: number;
  text?: string;
  backgroundColor?: string;
}

export const PlaceholderScene: React.FC<PlaceholderSceneProps> = ({
  from,
  duration,
  text = 'PLACEHOLDER',
  backgroundColor = COLORS.blackTube,
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - from;

  if (relativeFrame < 0 || relativeFrame >= duration) {
    return null;
  }

  const opacity = interpolate(
    relativeFrame,
    [0, 10, duration - 10, duration],
    [0, 1, 1, 0],
    { easing: Easing.inOut(Easing.quad) }
  );

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: COLORS.white,
          fontFamily: 'monospace',
          textAlign: 'center',
        }}
      >
        {text}
      </div>
    </div>
  );
};
