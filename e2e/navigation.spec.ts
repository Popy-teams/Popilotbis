import { test, expect } from '@playwright/test';
import { APP_ROUTES } from '../src/app/routes/viewRoutes';

const DEMO_EMAIL = 'admin@popilot.com';
const DEMO_PASSWORD = 'Popilot2026!';

test.beforeEach(async ({ page }) => {
  await page.goto('/connexion');
  await page.getByLabel('Adresse email').fill(DEMO_EMAIL);
  await page.getByLabel('Mot de passe').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/mon-tableau-de-bord/);
});

test.describe('Navigation', () => {
  for (const route of APP_ROUTES.filter((r) =>
    ['audit', 'taches', 'documentation', 'budget', 'vue-ensemble'].includes(r.path)
  )) {
    test(`charge la vue ${route.label}`, async ({ page }) => {
      await page.goto(`/${route.path}`);
      await expect(page).toHaveURL(new RegExp(`/${route.path}`));
      await expect(page.locator('body')).not.toBeEmpty();
      // Pas d'écran blanc : au moins un titre ou contenu principal
      await expect(page.locator('main, [role="main"], .saas-shell, body')).toBeVisible();
    });
  }

  test('redirige vers la connexion si non authentifié', async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/audit');
    await expect(page).toHaveURL(/\/connexion/);
  });
});
