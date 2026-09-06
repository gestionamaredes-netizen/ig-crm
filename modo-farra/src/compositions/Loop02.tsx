import React from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import { COLORS } from '../styles/tokens';

const Loop02: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        fontSize: 48,
        color: COLORS.white,
      }}
    >
      <Sequence from={0} durationInFrames={durationInFrames}>
        <div>LOOP 02 — ¿ESTÁS EN MSN?</div>
      </Sequence>
    </div>
  );
};

export default Loop02;
