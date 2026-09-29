import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BrewAudio } from '../utils/brewAudio';
import { SoundContext, type SoundStatus } from './soundContext';

const preferenceKey = 'aerotimer:sound-enabled';

function readPreference() {
  try {
    return localStorage.getItem(preferenceKey) === 'true';
  } catch {
    return false;
  }
}

export default function SoundProvider({ children }: { children: ReactNode }) {
  const [audio] = useState(() => new BrewAudio());
  const [preferred, setPreferred] = useState(readPreference);
  // A saved preference is not browser autoplay permission. A brew/start tap
  // unlocks this shared context without asking the user to toggle sound again.
  const [soundStatus, setSoundStatus] = useState<SoundStatus>(() => preferred ? 'blocked' : 'off');
  const request = useRef(0);

  useEffect(() => () => {
    request.current += 1;
    audio.dispose();
  }, [audio]);

  function remember(enabled: boolean) {
    setPreferred(enabled);
    try {
      localStorage.setItem(preferenceKey, String(enabled));
    } catch {
      // Private/restricted storage still allows the preference for this visit.
    }
  }

  async function enable(preview: boolean) {
    const ticket = ++request.current;
    setSoundStatus('enabling');
    const enabled = await audio.enable();
    if (ticket !== request.current) return;
    setSoundStatus(enabled ? 'on' : 'unavailable');
    if (enabled && preview && document.visibilityState !== 'hidden') audio.play('tick');
  }

  function toggleSound() {
    if (soundStatus === 'on' || soundStatus === 'enabling') {
      request.current += 1;
      remember(false);
      audio.stop();
      setSoundStatus('off');
    } else {
      remember(true);
      void enable(true);
    }
  }

  function resumeSound() {
    // Must run synchronously inside the click handler, before navigation.
    if (preferred) void enable(false);
  }

  return (
    <SoundContext value={{ audio, soundStatus, toggleSound, resumeSound }}>
      {children}
    </SoundContext>
  );
}
