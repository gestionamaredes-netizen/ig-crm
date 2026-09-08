import { Composition } from 'remotion';
import { CONFIG } from './config';
import Loop01 from './compositions/Loop01';
import Loop02 from './compositions/Loop02';
import Loop03 from './compositions/Loop03';
import Loop04 from './compositions/Loop04';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Loop01"
        component={Loop01}
        durationInFrames={CONFIG.DURATION_FRAMES}
        fps={CONFIG.FPS}
        width={CONFIG.WIDTH}
        height={CONFIG.HEIGHT}
      />
      <Composition
        id="Loop02"
        component={Loop02}
        durationInFrames={CONFIG.DURATION_FRAMES}
        fps={CONFIG.FPS}
        width={CONFIG.WIDTH}
        height={CONFIG.HEIGHT}
      />
      <Composition
        id="Loop03"
        component={Loop03}
        durationInFrames={CONFIG.DURATION_FRAMES}
        fps={CONFIG.FPS}
        width={CONFIG.WIDTH}
        height={CONFIG.HEIGHT}
      />
      <Composition
        id="Loop04"
        component={Loop04}
        durationInFrames={CONFIG.DURATION_FRAMES}
        fps={CONFIG.FPS}
        width={CONFIG.WIDTH}
        height={CONFIG.HEIGHT}
      />
    </>
  );
};
