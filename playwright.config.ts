import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration
 *
 * LOCAL (npm run test:e2e)
 *   → auto-starts `npm run dev` on http://localhost:5173
 *   → set BASE_URL env var to override
 *
 * CI / GitHub Actions (env CI=true)
 *   → no dev server started; tests hit the already-deployed site
 *   → BASE_URL is set to https://tests.arcanes.ca in the workflow
 */

const isCI = !!process.env.CI;
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 40_000,
    maxFailures: isCI ? 5 : undefined,
    fullyParallel: true,
    workers: isCI ? 2 : undefined,

    reporter: isCI
        ? [['github'], ['html', { open: 'never' }]]
        : [['list'], ['html', { open: 'on-failure' }]],

    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        navigationTimeout: 30_000,
        actionTimeout: 15_000,
    },

    /* Auto-start the Vite dev server when running locally */
    webServer: isCI
        ? undefined
        : {
            command: 'npm run dev',
            url: 'http://localhost:5173',
            reuseExistingServer: true, // reuse if `npm run dev` already running
            timeout: 60_000,
        },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
