import React, { useMemo } from 'react';
import { Sequence, useVideoConfig } from 'remotion';
import { CONFIG } from '../config';
import { COLORS } from '../styles/tokens';
import { GiantText, ModoFarraLogo, ModoFarraDots, CRT } from '../components';
import { TVScene, MemoryScene, MirrorScene, WindowScene, NoSignalScene } from '../scenes';
import { PHRASES, getPhrasesByLoop } from '../data/phrases';

// Fixed timecode structure per CLAUDE.md
const TIMECODES = {
  OPEN: 0,
  OPEN_END: 240,
  MATERIAL_START: 240,
  MATERIAL_END: 2340,
  PHRASE_BURST: 2340,
  PHRASE_BURST_END: 2700,
  PEAK_FRAME: 2700,
  PEAK_END: 2800,
  LOGO_FRAME: 3000,
  LOGO_END: 3100,
  SPLICE_START: 3210,
  END: 3300,
};

const Loop01: React.FC = () => {
  const { durationInFrames } = useVideoConfig();

  // Get phrases for this loop
  const loop01Phrases = useMemo(
    () => getPhrasesByLoop(1),
    []
  );

  // Randomly select a high-weight phrase for the burst
  const burstPhrase = useMemo(() => {
    const highWeight = loop01Phrases.filter((p) => p.weight >= 8);
    return highWeight.length > 0
      ? highWeight[Math.floor(Math.random() * highWeight.length)]
      : loop01Phrases[0];
  }, [loop01Phrases]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.black,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* OPENING: Frame 0-240 */}
      <Sequence from={TIMECODES.OPEN} durationInFrames={TIMECODES.OPEN_END}>
        <NoSignalScene
          from={TIMECODES.OPEN}
          duration={TIMECODES.OPEN_END}
        />
      </Sequence>

      {/* MATERIAL BLOCKS: Frame 240-2340 (2100 frames = 70 seconds) */}
      {/* Block 1: Memory Scene - Publicidad */}
      <Sequence
        from={TIMECODES.MATERIAL_START}
        durationInFrames={300}
      >
        <MemoryScene
          from={TIMECODES.MATERIAL_START}
          duration={300}
          type="commercial"
        />
      </Sequence>

      {/* Block 2: Memory Scene - Videoclip */}
      <Sequence
        from={TIMECODES.MATERIAL_START + 300}
        durationInFrames={300}
      >
        <MemoryScene
          from={TIMECODES.MATERIAL_START + 300}
          duration={300}
          type="clip"
        />
      </Sequence>

      {/* Block 3: Window Scene - Chat/MSN */}
      <Sequence
        from={TIMECODES.MATERIAL_START + 600}
        durationInFrames={300}
      >
        <WindowScene
          from={TIMECODES.MATERIAL_START + 600}
          duration={300}
          title="CHATROOM"
          content="¿ESTÁS EN MSN?"
        />
      </Sequence>

      {/* Block 4: No Signal Scene */}
      <Sequence
        from={TIMECODES.MATERIAL_START + 900}
        durationInFrames={300}
      >
        <NoSignalScene
          from={TIMECODES.MATERIAL_START + 900}
          duration={300}
        />
      </Sequence>

      {/* Block 5: Memory Scene - News */}
      <Sequence
        from={TIMECODES.MATERIAL_START + 1200}
        durationInFrames={300}
      >
        <MemoryScene
          from={TIMECODES.MATERIAL_START + 1200}
          duration={300}
          type="news"
        />
      </Sequence>

      {/* Block 6: Mirror Scene */}
      <Sequence
        from={TIMECODES.MATERIAL_START + 1500}
        durationInFrames={300}
      >
        <MirrorScene
          from={TIMECODES.MATERIAL_START + 1500}
          duration={300}
        />
      </Sequence>

      {/* Block 7: Memory Scene - Music */}
      <Sequence
        from={TIMECODES.MATERIAL_START + 1800}
        durationInFrames={300}
      >
        <MemoryScene
          from={TIMECODES.MATERIAL_START + 1800}
          duration={300}
          type="music"
        />
      </Sequence>

      {/* Block 8: TV Scene Zapping */}
      <Sequence
        from={TIMECODES.MATERIAL_START + 2100}
        durationInFrames={240}
      >
        <TVScene
          from={TIMECODES.MATERIAL_START + 2100}
          duration={240}
          channels={[
            'TANDA COMERCIAL',
            'PELÍCULA',
            'VIDEOCLIP',
            'NOTICIEROS',
          ]}
        />
      </Sequence>

      {/* PHRASE BURST: Frame 2340-2700 (360 frames = 12 seconds) */}
      <Sequence
        from={TIMECODES.PHRASE_BURST}
        durationInFrames={TIMECODES.PHRASE_BURST_END - TIMECODES.PHRASE_BURST}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.black,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GiantText
            text={burstPhrase.text}
            fontSize={120}
            color={COLORS.white}
          />
        </div>
      </Sequence>

      {/* PEAK: ESTA TE LA SABÉS — Frame 2700-2800 (100 frames = 3.3 seconds) */}
      <Sequence
        from={TIMECODES.PEAK_FRAME}
        durationInFrames={TIMECODES.PEAK_END - TIMECODES.PEAK_FRAME}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.black,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CRT preset="BROKEN_SIGNAL" intensity="heavy">
            <GiantText
              text="ESTA TE LA SABÉS"
              fontSize={160}
              color={COLORS.whiteFlash}
            />
          </CRT>
        </div>
      </Sequence>

      {/* LOGO: Modo Farra — Frame 3000-3100 (100 frames = 3.3 seconds) */}
      <Sequence
        from={TIMECODES.LOGO_FRAME}
        durationInFrames={TIMECODES.LOGO_END - TIMECODES.LOGO_FRAME}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.black,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <CRT preset="BROKEN_SIGNAL" intensity="heavy">
            <ModoFarraLogo
              size={200}
              color={COLORS.red}
              position={{ top: '10%', right: '10%' }}
            />
          </CRT>
        </div>
      </Sequence>

      {/* SPLICE OVERLAP: Frame 3210-3300 (90 frames = 3 seconds) */}
      {/* This fades back to the opening for seamless loop */}
      <Sequence
        from={TIMECODES.SPLICE_START}
        durationInFrames={TIMECODES.END - TIMECODES.SPLICE_START}
      >
        <MemoryScene
          from={TIMECODES.SPLICE_START}
          duration={TIMECODES.END - TIMECODES.SPLICE_START}
          type="soap"
        />
      </Sequence>
    </div>
  );
};

export default Loop01;
