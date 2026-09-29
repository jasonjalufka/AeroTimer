import { expect, test } from '@playwright/test';

test('water follows the pour, pauses, and gives way to a single step pulse', async ({ page }, testInfo) => {
  await page.clock.install();
  await page.goto('./#/timer/verve');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect(page.getByTestId('step-flash')).toHaveCount(0);
  await page.clock.fastForward(5000);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const guide = page.getByRole('progressbar', { name: 'Pour pacing guide' });
  const amount = Number(await guide.getAttribute('aria-valuenow'));
  expect(amount).toBeGreaterThanOrEqual(100);
  expect(amount).toBeLessThan(115);
  await expect(page.getByTestId('pour-water')).toHaveAttribute('data-running', 'false');
  await expect(page.getByTestId('pour-water').locator('svg').first()).toHaveCSS('animation-play-state', 'paused');
  await page.screenshot({ path: testInfo.outputPath('pour-halfway.png'), fullPage: true });
  await page.clock.fastForward(20_000);
  await expect(guide).toHaveAttribute('aria-valuenow', String(amount));
  await page.getByRole('button', { name: 'Resume', exact: true }).click();
  await page.clock.fastForward(5100);
  await expect(page.getByRole('heading', { name: 'stir', exact: true })).toBeVisible();
  await expect(page.getByTestId('pour-water')).toHaveCount(0);
  await expect(page.getByTestId('step-flash')).toHaveCSS('animation-iteration-count', '1');
  await page.screenshot({ path: testInfo.outputPath('step-change.png'), fullPage: true });
  await page.clock.fastForward(1200);
  await expect(page.getByTestId('step-flash')).toHaveCount(0);
});

test('reduced motion keeps the pour guide without waves or a flash', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.clock.install();
  await page.goto('./#/timer/verve');
  await expect(page.getByRole('heading', { name: 'pour', exact: true })).toBeVisible();
  await expect(page.getByTestId('pour-water')).toBeHidden();
  await expect(page.getByRole('progressbar', { name: 'Pour pacing guide' })).toBeVisible();
  await page.clock.fastForward(10_100);
  await expect(page.getByRole('heading', { name: 'stir', exact: true })).toBeVisible();
  await expect(page.getByTestId('step-flash')).toHaveCSS('animation-name', 'none');
  await expect(page.getByTestId('step-flash')).toBeHidden();
});

test('a tap unlocks real Web Audio, ticks at 3, 2, 1 and dings at the next step', async ({ page }) => {
  await page.addInitScript(() => {
    const tones: number[] = [];
    Object.defineProperty(window, '__brewTones', { value: tones });
    // AudioParam.value can still be its default before the audio render quantum.
    const scheduledValues = new WeakMap<AudioParam, number>();
    const setValue = AudioParam.prototype.setValueAtTime;
    AudioParam.prototype.setValueAtTime = function (value, time) {
      scheduledValues.set(this, value);
      return setValue.call(this, value, time);
    };
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...args) {
      tones.push(scheduledValues.get(this.frequency) ?? this.frequency.value);
      start.apply(this, args);
    };
  });
  const tones = () => page.evaluate(() => (window as typeof window & { __brewTones: number[] }).__brewTones);
  await page.clock.install();
  await page.goto('./#/timer/verve');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Enable sound', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(tones).toEqual([740]); // Short audible preview on enable.
  await page.evaluate(() => { (window as typeof window & { __brewTones: number[] }).__brewTones.length = 0; });
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.clock.fastForward(6100);
  await expect(page.getByRole('timer', { name: 'Step time remaining' })).toHaveText('4');
  await page.clock.fastForward(1000);
  await expect.poll(tones).toEqual([740]);
  await page.clock.fastForward(1000);
  await expect.poll(tones).toEqual([740, 740]);
  await page.clock.fastForward(1000);
  await expect.poll(tones).toEqual([740, 740, 740]);
  await expect(page.getByRole('timer', { name: 'Step time remaining' })).toHaveText('1');
  await page.clock.fastForward(1000);
  await expect(page.getByRole('heading', { name: 'stir', exact: true })).toBeVisible();
  await expect.poll(tones).toEqual([740, 740, 740, 660, 990, 1320]);
  await page.getByRole('button', { name: 'Sound on', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enable sound', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('remembers sound across recipes and reloads, and the Brew tap unlocks it', async ({ page }) => {
  await page.goto('./#/timer/verve');
  await page.getByRole('button', { name: 'Enable sound', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toBeVisible();
  await page.getByRole('link', { name: '← verve' }).click();
  await page.getByRole('link', { name: '← Recipes' }).click();
  await page.getByRole('link', { name: 'tonx', exact: true }).click();
  // A full page reload loses browser audio permission but retains the preference.
  await page.reload();
  await page.getByRole('link', { name: 'Let’s Brew!' }).click();
  await expect(page.getByRole('button', { name: 'Sound on', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Sound on', exact: true }).click();
  await page.getByRole('link', { name: '← tonx' }).click();
  await page.reload();
  await page.getByRole('link', { name: 'Let’s Brew!' }).click();
  await expect(page.getByRole('button', { name: 'Enable sound', exact: true })).toHaveAttribute('aria-pressed', 'false');
});
