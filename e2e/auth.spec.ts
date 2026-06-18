import { test, expect } from '@playwright/test';

const DEMO_EMAIL = 'admin@popilot.com';
const DEMO_PASSWORD = 'Popilot2026!';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/connexion');
  await page.getByLabel('Adresse email').fill(DEMO_EMAIL);
  await page.getByLabel('Mot de passe').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/mon-tableau-de-bord/);
}

test.describe('Authentification', () => {
  test('affiche la page de connexion', async ({ page }) => {
    await page.goto('/connexion');
    await expect(page.getByRole('heading', { name: 'Bon retour parmi nous' })).toBeVisible();
    await expect(page.getByText('Compte de démonstration')).toBeVisible();
  });

  test('connexion avec le compte démo', async ({ page }) => {
    await login(page);
    await expect(page.getByText('Mon tableau de bord').first()).toBeVisible();
  });

  test('refuse des identifiants invalides', async ({ page }) => {
    await page.goto('/connexion');
    await page.getByLabel('Adresse email').fill('wrong@example.com');
    await page.getByLabel('Mot de passe').fill('wrongpassword');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page.getByText(/Identifiants incorrects/)).toBeVisible({ timeout: 10_000 });
  });
});
