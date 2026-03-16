import { test, expect } from '@playwright/test';

/**
 * Navigation smoke test
 * ──────────────────────
 * Verify that all main corpus routes are reachable (HTTP 200)
 * and don't render a blank page or raw error.
 */
const CORPUS_ROUTES = [
    { name: 'Séminaires', path: '/corpus/seminaires' },
    { name: 'Colloques', path: '/corpus/colloques' },
    { name: 'Journées d\'études', path: '/corpus/journees-etudes' },
    { name: 'Experimentations', path: '/corpus/experimentations' },
    { name: 'Pratiques narratives', path: '/corpus/pratiques-narratives' },
    { name: 'Mises en récits', path: '/corpus/mises-en-recits' },
    { name: 'Intervenants', path: '/intervenants' },
];

for (const route of CORPUS_ROUTES) {
    test(`"${route.name}" – page is accessible`, async ({ page }) => {
        const response = await page.goto(route.path);

        // The SPA returns 200 for all routes (react-router handles 404s in-app)
        expect(response?.status()).toBe(200);

        // Wait for React to hydrate
        await page.waitForLoadState('networkidle');

        // The page must have a <main> or <nav> — not completely empty
        const hasContent = await page
            .locator('main, nav, [role="main"]')
            .count();
        expect(hasContent).toBeGreaterThan(0);

        // Must not be stuck on the loading screen
        const loadingVisible = await page
            .locator('[class*="loading"], [class*="Loading"]')
            .isVisible()
            .catch(() => false);
        expect(loadingVisible).toBe(false);
    });
}
