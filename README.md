# AeroTimer

Five AeroPress recipes with step-by-step brewing timers. Built with React, TypeScript, Vite, and CSS Modules. Hosted at [jasonjalufka.github.io/AeroTimer](https://jasonjalufka.github.io/AeroTimer/).

## Development

Use Node **22.23.2** (`nvm use`) and npm. The supported Node ranges are recorded in `package.json`.

```sh
npm ci
npm run dev
```

Open the `/AeroTimer/` URL printed by Vite. `npm start` is an alias for the development server.

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | Check strict TypeScript types |
| `npm run lint` | Check TypeScript and React Hooks rules |
| `npm test` | Run timer, routing, and update-prompt tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run build` | Type-check and produce `dist/`, including the service worker |
| `npm run preview` | Serve the production build locally |
| `npm run check` | Run lint, unit/component tests, and production build |
| `npm run test:e2e` | Build and run browser tests |
| `npm run deploy` | Check, build, and publish `dist/` to the `gh-pages` branch |

Install the browser test runtimes once:

```sh
npx playwright install chromium webkit
npm run test:e2e
```

Browser tests exercise desktop Chromium, mobile Chromium, and mobile WebKit against the production build. They cover recipe refreshes, timer controls, completion, invalid routes, and reloading/brewing offline. The offline-navigation test runs in Chromium only: Playwright 1.63's WebKit offline emulation has a [known service-worker navigation bug](https://github.com/microsoft/playwright/issues/42775). Offline reopening on a physical iPhone/Safari still needs a manual check. CI runs the same checks on pushes and pull requests.

## Brewing behavior

- Choose a recipe and select **Let’s Brew!** to start immediately.
- **Pause** freezes both countdowns; **Resume** continues from the same point.
- **Reset** returns to the first step and waits for **Start**.
- During each **pour**, a wavy water level rises with the target pace. The **Aim for …g poured** guide shows the amount for this pour (not the cumulative brew weight). Both freeze on pause and restart for each new pour.
- Each step after the first starts with one gentle light pulse. Reduced-motion preferences turn off the pulse and animated water; the numeric pour guide remains available.
- Tap **Enable sound** on the timer for a quiet preview and countdown cues: **tick at 3, 2, and 1** second remaining, then **ding when the next step starts** (or the brew finishes). Tap **Sound on** to mute. Your on/off preference is saved in this browser and remembered across recipes and visits. When sound is remembered as on, **Let’s Brew!** automatically unlocks audio using that tap. A direct timer link or refresh may still need **Resume sound** or a Pause/Resume gesture because browsers do not persist autoplay permission. If browser storage is blocked, the setting is remembered for the current visit only. Sounds are synthesized locally and work offline; they stop on pause/reset or when leaving the page.
- Completion stays on **All done!** with **Brew again** and **More recipes** choices. Brew again resets and waits for Start.
- The timer uses elapsed timestamps, so delayed browser callbacks do not accumulate countdown drift. Returning from a backgrounded or sleeping device catches up to the current step or completion without replaying missed sounds. Mobile browsers require a tap to enable audio and may suspend it when locked/backgrounded; cues run while the page is visible, and device volume/mute settings still apply. There are no background alarms. If audio is interrupted, Pause/Resume gives the browser a fresh gesture to resume it.
- Leaving the timer ends that brew. Refreshing or opening a timer URL starts a fresh brew; active sessions are not persisted.

Recipe URLs include stable IDs, for example `#/recipe/verve` and `#/timer/the-charger`. Unknown IDs and legacy URLs without a recipe ID return safely to the recipe list. Hash routing avoids server rewrite requirements on GitHub Pages.

## Offline use and updates

There is no backend: recipe data and timers run locally. The production service worker additionally caches the application, all recipes, artwork, and the bundled Rubik font so the app can reopen without a connection.

1. Visit the production app online once.
2. Wait for **AeroTimer is ready to use offline.**
3. Reopen or refresh it offline, or add it to your home screen using your browser.

The service worker requires HTTPS (or localhost) and is disabled in the development server. To check offline support locally, use `npm run build` followed by `npm run preview`. Browser storage can be cleared or evicted; another online visit is needed after that.

Updates use a prompt. **Update now** applies a waiting version; **Later** dismisses it. Prompts are hidden while on the timer screen, including paused and completed brews, and reappear after returning to recipes. If another tab activates an update, this tab requests a reload instead of automatically interrupting its timer. Offline-registration failures show a dismissible notice; the loaded app remains usable.

## GitHub Pages

The Vite base path, manifest start URL, and service-worker scope are `/AeroTimer/`. Deploy the built `dist/` directory, not the source or the old CRA `build/` directory.

The existing branch deployment workflow is preserved:

```sh
npm run deploy
```

This command publishes to `gh-pages` using your configured Git remote and credentials. GitHub repository **Settings → Pages** should use **Deploy from a branch**, with **gh-pages** and **/(root)**. CI validates changes but does not deploy them automatically.

## Editing recipes and styles

- `src/recipes.ts` defines typed recipes and ordered steps. Durations are seconds, amounts are grams, and temperatures are Fahrenheit.
- Total duration is calculated from steps. Clive now displays **120 seconds**, matching its original step durations, instead of the old inconsistent 122-second total.
- `src/hooks/useBrewTimer.ts` owns the timer lifecycle.
- Page styles live alongside components in `*.module.css`; shared colors and typography are in `src/styles/global.css`.
- The original logo and palette are retained. Text on blue/green surfaces is darker for readability, and recipe tiles are fully clickable.
- The bundled Rubik font is distributed under the SIL Open Font License in `public/Rubik-OFL.txt`.

## Dependency maintenance

The migration replaces Create React App, styled-components, Web Font Loader, and custom history setup with Vite, CSS Modules/variables, a bundled font, and current React Router APIs. `gh-pages` is now development tooling. Commit `package-lock.json` for reproducible installs.

Versions were checked against npm on September 29, 2026. React/React DOM are 19.3, React Router is 8.4, and Vite is 8.3. TypeScript is intentionally on **6.0.3**, the newest release supported by the current `typescript-eslint` peer range (`>=4.8.4 <6.1.0`), rather than unsupported TypeScript 7. Node type definitions match the Node 22 baseline. Revisit TypeScript 7 when the parser supports it; do not bypass compatibility checks with `--force` or `--legacy-peer-deps`.

References: [Vite static deployment](https://vite.dev/guide/static-deploy.html), [Vite PWA React integration](https://vite-pwa-org.netlify.app/frameworks/react), [React Router migration](https://reactrouter.com/upgrading/v7).
