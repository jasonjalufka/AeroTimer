import { useEffect, useReducer } from 'react';
import { getTotalTime, type BrewRecipe } from '../recipes';

type Status = 'ready' | 'running' | 'paused' | 'complete';

interface TimerState {
  status: Status;
  elapsedMs: number;
  baseElapsedMs: number;
  startedAt: number | null;
}

type Action = { type: 'tick' | 'pause' | 'start' | 'reset'; now: number };

function elapsedAt(state: TimerState, now: number, totalMs: number): number {
  const runningMs = state.startedAt === null ? 0 : Math.max(0, now - state.startedAt);
  return Math.min(totalMs, Math.max(state.elapsedMs, state.baseElapsedMs + runningMs));
}

function reduceTimer(state: TimerState, action: Action, totalMs: number): TimerState {
  switch (action.type) {
    case 'reset':
      return { status: 'ready', elapsedMs: 0, baseElapsedMs: 0, startedAt: null };
    case 'start':
      if (state.status !== 'ready' && state.status !== 'paused') return state;
      return { ...state, status: 'running', startedAt: action.now };
    case 'pause':
    case 'tick': {
      if (state.status !== 'running') return state;
      const elapsedMs = elapsedAt(state, action.now, totalMs);
      if (elapsedMs >= totalMs || action.type === 'pause') {
        return {
          status: elapsedMs >= totalMs ? 'complete' : 'paused',
          elapsedMs,
          baseElapsedMs: elapsedMs,
          startedAt: null,
        };
      }
      return { ...state, elapsedMs };
    }
  }
}

/** Mount a new timer for each recipe. Reset waits for an explicit Start. */
export function useBrewTimer(recipe: BrewRecipe) {
  const totalMs = getTotalTime(recipe) * 1000;
  const [state, dispatch] = useReducer(
    (state: TimerState, action: Action) => reduceTimer(state, action, totalMs),
    undefined,
    (): TimerState => ({ status: 'running', elapsedMs: 0, baseElapsedMs: 0, startedAt: Date.now() }),
  );

  useEffect(() => {
    if (state.status !== 'running') return;

    // Callbacks only refresh the display; timestamps determine the actual time.
    // Date.now also includes time spent with the device asleep.
    const tick = () => dispatch({ type: 'tick', now: Date.now() });
    const interval = window.setInterval(tick, 100);
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('pageshow', tick);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
      window.removeEventListener('pageshow', tick);
    };
  }, [state.status]);

  let stepIndex = 0;
  let stepEndMs = recipe.steps[0].duration * 1000;
  while (state.elapsedMs >= stepEndMs && stepIndex < recipe.steps.length - 1) {
    stepIndex += 1;
    stepEndMs += recipe.steps[stepIndex]!.duration * 1000;
  }

  return {
    status: state.status,
    elapsedMs: state.elapsedMs,
    stepIndex,
    step: recipe.steps[stepIndex]!,
    stepElapsedMs: state.elapsedMs - (stepEndMs - recipe.steps[stepIndex]!.duration * 1000),
    stepProgress: Math.min(1, Math.max(0, 1 - (stepEndMs - state.elapsedMs) / (recipe.steps[stepIndex]!.duration * 1000))),
    stepRemaining: Math.max(0, Math.ceil((stepEndMs - state.elapsedMs) / 1000)),
    remaining: Math.max(0, Math.ceil((totalMs - state.elapsedMs) / 1000)),
    pause: () => dispatch({ type: 'pause', now: Date.now() }),
    start: () => dispatch({ type: 'start', now: Date.now() }),
    reset: () => dispatch({ type: 'reset', now: Date.now() }),
  };
}

export type BrewTimer = ReturnType<typeof useBrewTimer>;
