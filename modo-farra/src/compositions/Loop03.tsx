import React from 'react';
import { Sequence } from 'remotion';
import { COLORS } from '../styles/tokens';
import { GiantText, ModoFarraLogo, CRT } from '../components';
import { TVScene, MemoryScene, NoSignalScene } from '../scenes';
import { useLoopVariation } from '../hooks/useLoopVariation';

const TIMECODES = {
  OPEN: 0, OPEN_END: 240, MATERIAL_START: 240, MATERIAL_END: 2340,
  PHRASE_BURST: 2340, PHRASE_BURST_END: 2700, PEAK_FRAME: 2700, PEAK_END: 2800,
  LOGO_FRAME: 3000, LOGO_END: 3100, SPLICE_START: 3210, END: 3300,
};

const Loop03: React.FC = () => {
  const loopVariation = useLoopVariation(3);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.black, position: 'relative', overflow: 'hidden' }}>
      <Sequence from={TIMECODES.OPEN} durationInFrames={TIMECODES.OPEN_END}>
        <NoSignalScene from={TIMECODES.OPEN} duration={TIMECODES.OPEN_END} />
      </Sequence>

      {/* Loop 3: Música/Cumbia/Bailanta focus */}
      <Sequence from={TIMECODES.MATERIAL_START} durationInFrames={300}>
        <MemoryScene from={TIMECODES.MATERIAL_START} duration={300} type="music" />
      </Sequence>
      <Sequence from={TIMECODES.MATERIAL_START + 300} durationInFrames={300}>
        <MemoryScene from={TIMECODES.MATERIAL_START + 300} duration={300} type="clip" />
      </Sequence>
      <Sequence from={TIMECODES.MATERIAL_START + 600} durationInFrames={300}>
        <MemoryScene from={TIMECODES.MATERIAL_START + 600} duration={300} type="commercial" />
      </Sequence>
      <Sequence from={TIMECODES.MATERIAL_START + 900} durationInFrames={300}>
        <NoSignalScene from={TIMECODES.MATERIAL_START + 900} duration={300} />
      </Sequence>
      <Sequence from={TIMECODES.MATERIAL_START + 1200} durationInFrames={300}>
        <MemoryScene from={TIMECODES.MATERIAL_START + 1200} duration={300} type="news" />
      </Sequence>
      <Sequence from={TIMECODES.MATERIAL_START + 1500} durationInFrames={300}>
        <MemoryScene from={TIMECODES.MATERIAL_START + 1500} duration={300} type="clip" />
      </Sequence>
      <Sequence from={TIMECODES.MATERIAL_START + 1800} durationInFrames={300}>
        <MemoryScene from={TIMECODES.MATERIAL_START + 1800} duration={300} type="music" />
      </Sequence>
      <Sequence from={TIMECODES.MATERIAL_START + 2100} durationInFrames={240}>
        <TVScene from={TIMECODES.MATERIAL_START + 2100} duration={240} channels={['MÚSICA', 'VIDEOCLIP', 'CUMBIA', 'BAILANTA']} />
      </Sequence>

      {/* PHRASE BURST */}
      <Sequence from={TIMECODES.PHRASE_BURST} durationInFrames={360}>
        <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GiantText text={loopVariation.burstPhrase.text} fontSize={120} color={COLORS.white} />
        </div>
      </Sequence>

      {/* PEAK */}
      <Sequence from={TIMECODES.PEAK_FRAME} durationInFrames={100}>
        <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.black, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CRT preset="BROKEN_SIGNAL" intensity="heavy">
            <GiantText text="SE ARMÓ" fontSize={loopVariation.peakVariation.fontSize} color={COLORS.whiteFlash} />
          </CRT>
        </div>
      </Sequence>

      {/* LOGO */}
      <Sequence from={TIMECODES.LOGO_FRAME} durationInFrames={100}>
        <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.black, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <CRT preset="BROKEN_SIGNAL" intensity="heavy">
            <ModoFarraLogo size={loopVariation.logoVariation.size} color={COLORS.red} position={{ top: '10%', right: '10%' }} />
          </CRT>
        </div>
      </Sequence>

      {/* SPLICE */}
      <Sequence from={TIMECODES.SPLICE_START} durationInFrames={90}>
        <MemoryScene from={TIMECODES.SPLICE_START} duration={90} type="soap" />
      </Sequence>
    </div>
  );
};

export default Loop03;
