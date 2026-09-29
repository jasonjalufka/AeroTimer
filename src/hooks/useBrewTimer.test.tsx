import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recipes, getTotalTime } from '../recipes';
import { useBrewTimer } from './useBrewTimer';

const recipe = recipes[0]!;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-09-29T12:00:00Z'));
});

afterEach(() => vi.useRealTimers());

describe('useBrewTimer', () => {
  it('starts automatically and transitions at exact step boundaries in Strict Mode', () => {
    const { result } = renderHook(() => useBrewTimer(recipe), { wrapper: StrictMode });
    expect(result.current.remaining).toBe(95);
    expect(result.current.stepRemaining).toBe(10);
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.step.type).toBe('stir');
    expect(result.current.stepRemaining).toBe(20);
    expect(result.current.remaining).toBe(85);
  });

  it('pauses with subsecond precision and resumes without counting paused time', () => {
    const { result } = renderHook(() => useBrewTimer(recipe));
    act(() => vi.advanceTimersByTime(2_500));
    act(() => result.current.pause());
    expect(result.current.remaining).toBe(93);
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.remaining).toBe(93);
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(7_500));
    expect(result.current.step.type).toBe('stir');
    expect(result.current.remaining).toBe(85);
  });

  it('handles repeated pause/resume without losing elapsed time', () => {
    const { result } = renderHook(() => useBrewTimer(recipe));
    for (let index = 0; index < 3; index += 1) {
      act(() => vi.advanceTimersByTime(1_000));
      act(() => result.current.pause());
      act(() => vi.advanceTimersByTime(5_000));
      act(() => result.current.start());
    }
    expect(result.current.remaining).toBe(92);
  });

  it('catches up across multiple steps after suspended callbacks', () => {
    const { result } = renderHook(() => useBrewTimer(recipe));
    act(() => {
      vi.setSystemTime(Date.now() + 65_000);
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.step.type).toBe('plunge');
    expect(result.current.stepRemaining).toBe(30);
    expect(result.current.remaining).toBe(30);
  });

  it('completes after a long suspension without negative countdowns', () => {
    const { result } = renderHook(() => useBrewTimer(recipe));
    act(() => {
      vi.setSystemTime(Date.now() + 200_000);
      window.dispatchEvent(new Event('pageshow'));
    });
    expect(result.current.status).toBe('complete');
    expect(result.current.remaining).toBe(0);
    expect(result.current.stepRemaining).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('accounts for elapsed time when paused before the next scheduled tick', () => {
    const { result } = renderHook(() => useBrewTimer(recipe));
    act(() => vi.setSystemTime(Date.now() + 95_000));
    act(() => result.current.pause());
    expect(result.current.status).toBe('complete');
    expect(result.current.remaining).toBe(0);
  });

  it.each(['running', 'paused', 'complete'] as const)('resets a %s brew and waits for Start', status => {
    const { result } = renderHook(() => useBrewTimer(recipe));
    act(() => vi.advanceTimersByTime(status === 'complete' ? 95_000 : 5_000));
    if (status === 'paused') act(() => result.current.pause());
    act(() => result.current.reset());
    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.status).toBe('ready');
    expect(result.current.step.type).toBe('pour');
    expect(result.current.remaining).toBe(95);
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current.remaining).toBe(94);
  });

  it.each(recipes)('finishes $name when its steps finish', recipe => {
    const { result } = renderHook(() => useBrewTimer(recipe));
    act(() => vi.advanceTimersByTime(getTotalTime(recipe) * 1000));
    expect(result.current.status).toBe('complete');
    expect(result.current.remaining).toBe(0);
  });

  it('cleans up intervals and page listeners on unmount', () => {
    const removeDocument = vi.spyOn(document, 'removeEventListener');
    const removeWindow = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useBrewTimer(recipe));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(removeDocument).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    expect(removeWindow).toHaveBeenCalledWith('pageshow', expect.any(Function));
  });
});
