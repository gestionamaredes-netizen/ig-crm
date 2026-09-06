import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { CONFIG } from '../config';
import { COLORS } from '../styles/tokens';
import { VHS, CRT, GiantText, ScreenText } from '../components';

interface TVSceneProps {
  from: number;
  duration: number;
  channels?: string[];
  intensity?: 'subtle' | 'heavy';
}

export const TVScene: React.FC<TVSceneProps> = ({
  from,
  duration,
  channels = [
    'TANDA COMERCIAL',
    'VIDEOCLIP',
    'PELÍCULA',
    'NOTICIEROS',
  ],
  intensity = 'subtle',
}) => {
  const frame = useCurrentFrame();
  const relativeFrame = frame - from;

  if (relativeFrame < 0 || relativeFrame >= duration) {
    return null;
  }

  // Simulate channel switching
  const channelIndex = Math.floor((relativeFrame / duration) * channels.length);
  const currentChannel = channels[channelIndex % channels.length];

  // CRT roll effect
  const rollAmount = Math.sin(relativeFrame * 0.05) * 20;

  // Fade in/out at boundaries
  const opacity = interpolate(
    relativeFrame,
    [0, 10, duration - 10, duration],
    [0, 1, 1, 0],
    { easing: Easing.inOut(Easing.quad) }
  );

  const colors = [COLORS.red, COLORS.white, COLORS.phosphorGreen, COLORS.winBlue];
  const bgColor = colors[channelIndex % colors.length];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        opacity,
      }}
    >
      <CRT preset="TV_90" intensity={intensity}>
        <VHS intensity={intensity}>
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: bgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateY(${rollAmount}px)`,
            }}
          >
            <ScreenText
              text={currentChannel}
              fontSize={28}
              color={COLORS.white}
            />
          </div>
        </VHS>
      </CRT>
    </div>
  );
};
