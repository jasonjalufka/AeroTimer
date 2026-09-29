import { createContext, useContext } from 'react';
import type { BrewAudio } from '../utils/brewAudio';

export type SoundStatus = 'off' | 'enabling' | 'on' | 'blocked' | 'unavailable';

export interface SoundControls {
  audio: BrewAudio;
  soundStatus: SoundStatus;
  toggleSound: () => void;
  resumeSound: () => void;
}

export const SoundContext = createContext<SoundControls | null>(null);

export function useSound() {
  const sound = useContext(SoundContext);
  if (!sound) throw new Error('Sound controls require SoundProvider');
  return sound;
}
