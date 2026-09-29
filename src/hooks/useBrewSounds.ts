import { useEffect, useRef } from 'react';
import { useSound } from '../audio/soundContext';
import type { BrewTimer } from './useBrewTimer';

type CueTimer = Pick<BrewTimer, 'status' | 'elapsedMs' | 'stepIndex' | 'stepRemaining'>;

export function useBrewSounds(timer: CueTimer) {
  const sounds = useSound();
  const { audio, soundStatus } = sounds;
  const previous = useRef<CueTimer | null>(null);
  const played = useRef(new Set<string>());
  const { status, elapsedMs, stepIndex, stepRemaining } = timer;

  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.visibilityState === 'hidden') audio.stop();
    };
    document.addEventListener('visibilitychange', stopWhenHidden);
    return () => {
      // The provider keeps the unlocked context across recipe navigation.
      audio.stop();
      document.removeEventListener('visibilitychange', stopWhenHidden);
    };
  }, [audio]);

  useEffect(() => {
    const last = previous.current;
    previous.current = { status, elapsedMs, stepIndex, stepRemaining };
    if (status === 'ready') played.current.clear();
    if (soundStatus !== 'on' || ((status === 'paused' || status === 'ready') && last?.status !== status)) {
      audio.stop();
      return;
    }
    // Ignore stale cues after pausing, enabling sound late, or catching up from sleep.
    if (!last || last.status !== 'running' || elapsedMs - last.elapsedMs > 1500
      || document.visibilityState === 'hidden') return;

    const stepFinished = (status === 'running' && stepIndex === last.stepIndex + 1)
      || status === 'complete';
    const countdownTick = status === 'running' && last.stepIndex === stepIndex
      && last.stepRemaining !== stepRemaining && stepRemaining >= 1 && stepRemaining <= 3;
    if (!stepFinished && !countdownTick) return;

    const cueId = stepFinished ? `end:${last.stepIndex}` : `${stepIndex}:${stepRemaining}`;
    if (played.current.has(cueId)) return;
    played.current.add(cueId);
    // Let the final ding ring out on the completion screen, just like other steps.
    audio.play(stepFinished ? 'ding' : 'tick');
  }, [audio, soundStatus, status, elapsedMs, stepIndex, stepRemaining]);

  return sounds;
}
