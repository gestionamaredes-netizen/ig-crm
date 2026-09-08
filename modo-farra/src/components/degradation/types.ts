export type DegradationIntensity = 'subtle' | 'heavy';

export interface DegradationProps {
  children: React.ReactNode;
  intensity?: DegradationIntensity;
  enabled?: boolean;
}

export interface VHSProps extends DegradationProps {
  glitchAmount?: number;
  noiseAmount?: number;
  scanlineOpacity?: number;
}

export interface CRTProps extends DegradationProps {
  preset?: 'TV_90' | 'TV_2000' | 'BROKEN_SIGNAL';
  curvature?: number;
  phosphorColor?: string;
}

export interface GlitchProps extends DegradationProps {
  offset?: number;
  duration?: number;
}
