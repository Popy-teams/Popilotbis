import { test, expect } from '@playwright/test';

const DEMO_EMAIL = 'admin@popilot.com';
const DEMO_PASSWORD = 'Popilot2026!';

test.beforeEach(async ({ page }) => {
  await page.goto('/connexion');
  await page.getByLabel('Adresse email').fill(DEMO_EMAIL);
  await page.getByLabel('Mot de passe').fill(DEMO_PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/mon-tableau-de-bord/);
});

test.describe('Projet actif', () => {
  test('affiche le sélecteur de projet dans le header', async ({ page }) => {
    await page.goto('/mon-tableau-de-bord');
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByLabel('Projet actif')).toBeVisible();
  });

  test('la page portfolio projets est accessible', async ({ page }) => {
    await page.goto('/portfolio-projets');
    await expect(page).toHaveURL(/\/portfolio-projets/);
    await expect(page.getByText(/Portfolio|Projet/i).first()).toBeVisible();
  });
});
