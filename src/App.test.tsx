import { StrictMode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

const sw = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  update: vi.fn().mockResolvedValue(undefined),
  dismiss: vi.fn(),
  options: {} as { onNeedReload?: () => void; onRegisterError?: () => void },
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (options: typeof sw.options) => {
    sw.options = options;
    return {
    offlineReady: [sw.offlineReady, sw.dismiss],
    needRefresh: [sw.needRefresh, sw.dismiss],
    updateServiceWorker: sw.update,
    };
  },
}));

function renderApp(path = '/') {
  return render(<StrictMode><MemoryRouter initialEntries={[path]}><App /></MemoryRouter></StrictMode>);
}

afterEach(() => {
  vi.useRealTimers();
  sw.needRefresh = false;
  sw.offlineReady = false;
  sw.update.mockClear();
});

describe('recipe and timer screens', () => {
  it('navigates from the list to a recipe and starts a brew', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('link', { name: 'The Charger' }));
    expect(screen.getByRole('heading', { name: 'The Charger' })).toBeInTheDocument();
    expect(screen.getByText('120s')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Let’s Brew!' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
    expect(screen.getByText('250 grams')).toBeInTheDocument();
  });

  it('renders a recipe directly without a previous selection', () => {
    renderApp('/recipe/clive');
    expect(screen.getByRole('heading', { name: 'clive' })).toBeInTheDocument();
    expect(screen.getByText('120s')).toBeInTheDocument();
    expect(screen.getByText('200°F')).toBeInTheDocument();
  });

  it('shows pour pacing, freezes it on pause, and flashes only on later step transitions', () => {
    vi.useFakeTimers();
    renderApp('/timer/verve');
    expect(screen.queryByTestId('step-flash')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Pour pacing guide' })).toHaveAttribute('aria-valuenow', '0');
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('pour-water')).toHaveAttribute('data-running', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.queryByTestId('pour-water')).not.toBeInTheDocument();
    expect(screen.getByTestId('step-flash')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1200));
    expect(screen.queryByTestId('step-flash')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.queryByTestId('step-flash')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('restarts the water guide for a later pour using that step’s amount', () => {
    vi.useFakeTimers();
    renderApp('/timer/tonx');
    act(() => vi.advanceTimersByTime(115_000));
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '75');
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '38');
    expect(screen.queryByTestId('step-flash')).not.toBeInTheDocument();
  });

  it.each(['/recipe/missing', '/timer/missing', '/recipe/', '/timer/', '/unknown'])('safely handles %s', path => {
    renderApp(path);
    expect(screen.getByRole('heading', { name: 'AeroTimer' })).toBeInTheDocument();
  });

  it('opens a timer directly, supports controls, and keeps completion visible', () => {
    vi.useFakeTimers();
    renderApp('/timer/verve');
    act(() => vi.advanceTimersByTime(5_000));
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    act(() => vi.advanceTimersByTime(20_000));
    expect(screen.getByRole('timer', { name: 'Total time remaining' })).toHaveTextContent('90s');
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    act(() => vi.advanceTimersByTime(90_000));
    expect(screen.getByRole('heading', { name: 'All done!' })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'More recipes' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Brew again' }));
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('timer', { name: 'Step time remaining' })).toHaveTextContent('10');
  });

  it('defers updates during a running, paused, or completed brew until leaving the timer', () => {
    vi.useFakeTimers();
    sw.needRefresh = true;
    renderApp('/timer/verve');
    expect(screen.queryByRole('button', { name: 'Update now' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.queryByRole('button', { name: 'Update now' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }));
    act(() => vi.advanceTimersByTime(95_000));
    expect(screen.queryByRole('button', { name: 'Update now' })).not.toBeInTheDocument();
    expect(sw.update).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('link', { name: 'More recipes' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update now' }));
    expect(sw.update).toHaveBeenCalledWith(true);
  });

  it('keeps the brew intact when another tab activates a service-worker update', () => {
    vi.useFakeTimers();
    renderApp('/timer/verve');
    act(() => vi.advanceTimersByTime(12_000));
    act(() => sw.options.onNeedReload?.());
    expect(screen.getByRole('heading', { name: 'stir' })).toBeInTheDocument();
    expect(screen.getByRole('timer', { name: 'Total time remaining' })).toHaveTextContent('83s');
    expect(screen.queryByRole('button', { name: 'Update now' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: '← verve' }));
    expect(screen.getByRole('button', { name: 'Update now' })).toBeInTheDocument();
  });

  it('reports unavailable offline caching without blocking recipe access', () => {
    renderApp();
    act(() => sw.options.onRegisterError?.());
    expect(screen.getByRole('status')).toHaveTextContent('Offline setup failed');
    expect(screen.getByRole('link', { name: 'verve' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
