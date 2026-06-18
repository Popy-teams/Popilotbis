import { test, expect } from '@playwright/test';

const DEMO_EMAIL = 'admin@popilot.com';
const DEMO_PASSWORD = 'Popilot2026!';

const ROUTES_TO_CHECK = [
  { path: 'audit', label: 'Audit ISO 9001' },
  { path: 'taches', label: 'Tâches' },
  { path: 'documentation', label: 'Documentation' },
  { path: 'budget', label: 'Budget' },
  { path: 'vue-ensemble', label: "Vue d'ensemble" },
];

test.beforeEach(async ({ page }) => {
  await page.goto('/connexion');
  await page.getByLabel('Adresse email').fill(DEMO_EMAIL);
  await page.getByLabel('Mot de passe').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/mon-tableau-de-bord/);
});

test.describe('Navigation', () => {
  for (const route of ROUTES_TO_CHECK) {
    test(`charge la vue ${route.label}`, async ({ page }) => {
      await page.goto(`/${route.path}`);
      await expect(page).toHaveURL(new RegExp(`/${route.path}`));
      await expect(page.getByRole('main')).toBeVisible();
    });
  }

  test('redirige vers la connexion si non authentifié', async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/audit');
    await expect(page).toHaveURL(/\/connexion/);
  });
});
