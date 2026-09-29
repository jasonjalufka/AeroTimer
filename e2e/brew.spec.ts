import { expect, test } from '@playwright/test';

test('recipe refresh, pause/reset, completion, and mobile layout', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  await page.goto('./');
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
  await page.getByRole('link', { name: 'verve', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'verve', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('recipe.png'), fullPage: true });
  await page.getByRole('link', { name: 'Let’s Brew!' }).click();
  // Wait for React Router's transition to commit before advancing the clock.
  await expect(page.getByRole('heading', { name: 'pour', exact: true })).toBeVisible();
  await page.clock.fastForward(10_100);
  await expect(page.getByRole('heading', { name: 'stir', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.screenshot({ path: testInfo.outputPath('paused.png'), fullPage: true });
  const remaining = await page.getByRole('timer', { name: 'Total time remaining' }).textContent();
  await page.clock.fastForward(30_000);
  await expect(page.getByRole('timer', { name: 'Total time remaining' })).toHaveText(remaining!);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('timer', { name: 'Total time remaining' })).toHaveText('95s');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.clock.fastForward(96_000);
  await expect(page.getByRole('heading', { name: 'All done!' })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('complete.png'), fullPage: true });
  await page.getByRole('button', { name: 'Brew again' }).click();
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('reopens cached recipes and brews offline', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit offline navigation bug: https://github.com/microsoft/playwright/issues/42775');
  await page.goto('./');
  await expect(page.getByText('AeroTimer is ready to use offline.')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss', exact: true }).click();
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  // A second navigation is controlled by the installed worker.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'AeroTimer' })).toBeVisible();
  await page.getByRole('link', { name: 'tonx', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'tonx', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Let’s Brew!' }).click();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'pour', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.fonts.check('16px "Rubik Variable"'))).toBe(true);
});

test('handles invalid and old recipe URLs safely', async ({ page }) => {
  await page.goto('./#/timer/missing');
  await expect(page.getByRole('heading', { name: 'AeroTimer' })).toBeVisible();
  await page.goto('./#/recipe/');
  await expect(page.getByRole('heading', { name: 'AeroTimer' })).toBeVisible();
});
