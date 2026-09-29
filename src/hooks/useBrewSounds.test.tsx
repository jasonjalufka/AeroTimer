import { StrictMode, type ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrewAudio } from '../utils/brewAudio';
import { recipes } from '../recipes';
import { useBrewTimer } from './useBrewTimer';
import { useBrewSounds } from './useBrewSounds';
import SoundProvider from '../audio/SoundProvider';

function SoundWrapper({ children }: { children: ReactNode }) {
  return <StrictMode><SoundProvider>{children}</SoundProvider></StrictMode>;
}

function renderBrew() {
  return renderHook(() => {
    const timer = useBrewTimer(recipes[0]!);
    const sounds = useBrewSounds(timer);
    return { timer, sounds };
  }, { wrapper: SoundWrapper });
}

function advance(seconds: number) {
  // Render each displayed second, as the browser does.
  for (let second = 0; second < seconds; second += 1) {
    act(() => vi.advanceTimersByTime(1000));
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(BrewAudio.prototype, 'enable').mockResolvedValue(true);
  vi.spyOn(BrewAudio.prototype, 'play').mockImplementation(() => {});
  vi.spyOn(BrewAudio.prototype, 'stop').mockImplementation(() => {});
  vi.spyOn(BrewAudio.prototype, 'dispose').mockImplementation(() => {});
});
afterEach(() => vi.useRealTimers());

describe('brew countdown sounds', () => {
  it('stays silent until enabled by a gesture', () => {
    renderBrew();
    advance(10);
    expect(BrewAudio.prototype.enable).not.toHaveBeenCalled();
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
  });

  it('ticks at 3, 2, 1 and dings when the next step starts, exactly once in Strict Mode', async () => {
    const { result } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    expect(BrewAudio.prototype.play).toHaveBeenCalledWith('tick'); // Enable preview.
    vi.mocked(BrewAudio.prototype.play).mockClear();
    advance(6);
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
    advance(1);
    expect(result.current.timer.stepRemaining).toBe(3);
    expect(BrewAudio.prototype.play).toHaveBeenLastCalledWith('tick');
    advance(1);
    expect(result.current.timer.stepRemaining).toBe(2);
    advance(1);
    expect(result.current.timer.stepRemaining).toBe(1);
    expect(vi.mocked(BrewAudio.prototype.play).mock.calls).toEqual([['tick'], ['tick'], ['tick']]);
    advance(1);
    expect(result.current.timer.step.type).toBe('stir');
    expect(vi.mocked(BrewAudio.prototype.play).mock.calls).toEqual([['tick'], ['tick'], ['tick'], ['ding']]);
  });

  it('stops when paused and does not replay a countdown second on resume', async () => {
    const { result } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    advance(7);
    vi.mocked(BrewAudio.prototype.play).mockClear();
    act(() => result.current.timer.pause());
    expect(BrewAudio.prototype.stop).toHaveBeenCalled();
    advance(20);
    act(() => result.current.timer.start());
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
    advance(1);
    expect(vi.mocked(BrewAudio.prototype.play).mock.calls).toEqual([['tick']]);
  });

  it('mutes immediately and allows a fresh countdown after reset', async () => {
    const { result } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    advance(7);
    act(() => result.current.sounds.toggleSound());
    vi.mocked(BrewAudio.prototype.play).mockClear();
    advance(3);
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
    act(() => result.current.timer.reset());
    await act(async () => result.current.sounds.toggleSound());
    vi.mocked(BrewAudio.prototype.play).mockClear();
    act(() => result.current.timer.start());
    advance(10);
    expect(vi.mocked(BrewAudio.prototype.play).mock.calls).toEqual([['tick'], ['tick'], ['tick'], ['ding']]);
  });

  it('does not replay missed cues when the browser catches up after a long delay', async () => {
    const { result } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    vi.mocked(BrewAudio.prototype.play).mockClear();
    act(() => {
      vi.setSystemTime(Date.now() + 9000);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.timer.stepRemaining).toBe(1);
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
  });

  it('suppresses sounds while the document is hidden', async () => {
    const { result } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    vi.mocked(BrewAudio.prototype.play).mockClear();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    advance(10);
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
  });

  it('handles unavailable audio and closes audio on unmount', async () => {
    vi.mocked(BrewAudio.prototype.enable).mockResolvedValue(false);
    const { result, unmount } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    expect(result.current.sounds.soundStatus).toBe('unavailable');
    advance(9);
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
    unmount();
    expect(BrewAudio.prototype.dispose).toHaveBeenCalled();
  });

  it('does not enable audio after a pending request is cancelled', async () => {
    let resolve!: (enabled: boolean) => void;
    vi.mocked(BrewAudio.prototype.enable).mockReturnValue(new Promise<boolean>(done => { resolve = done; }));
    const { result } = renderBrew();
    act(() => result.current.sounds.toggleSound());
    expect(result.current.sounds.soundStatus).toBe('enabling');
    act(() => result.current.sounds.toggleSound());
    await act(async () => resolve(true));
    expect(result.current.sounds.soundStatus).toBe('off');
    expect(BrewAudio.prototype.play).not.toHaveBeenCalled();
  });

  it('dings at final completion and lets the chime finish', async () => {
    const { result } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    advance(94);
    vi.mocked(BrewAudio.prototype.play).mockClear();
    vi.mocked(BrewAudio.prototype.stop).mockClear();
    advance(1);
    expect(result.current.timer.status).toBe('complete');
    expect(vi.mocked(BrewAudio.prototype.play).mock.calls).toEqual([['ding']]);
    advance(2);
    expect(BrewAudio.prototype.stop).not.toHaveBeenCalled();
    expect(BrewAudio.prototype.play).toHaveBeenCalledTimes(1);
  });

  it('remembers enabled sound across visits, unlocks on a brew gesture, and remembers mute', async () => {
    const first = renderBrew();
    await act(async () => first.result.current.sounds.toggleSound());
    expect(localStorage.getItem('aerotimer:sound-enabled')).toBe('true');
    first.unmount();
    const second = renderBrew();
    expect(second.result.current.sounds.soundStatus).toBe('blocked');
    await act(async () => second.result.current.sounds.resumeSound());
    expect(second.result.current.sounds.soundStatus).toBe('on');
    act(() => second.result.current.sounds.toggleSound());
    expect(localStorage.getItem('aerotimer:sound-enabled')).toBe('false');
    second.unmount();
    const third = renderBrew();
    expect(third.result.current.sounds.soundStatus).toBe('off');
  });

  it('still works when browser storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    const { result } = renderBrew();
    await act(async () => result.current.sounds.toggleSound());
    expect(result.current.sounds.soundStatus).toBe('on');
    act(() => result.current.sounds.toggleSound());
    expect(result.current.sounds.soundStatus).toBe('off');
  });
});
