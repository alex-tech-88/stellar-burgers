import { test, expect, Page } from '@playwright/test';
import path from 'path';

const HAR_FILE = path.join(__dirname, 'hars/ingredients.json');

// Helper: mount HAR routes and navigate to home page
async function setupPage(page: Page) {
  await page.routeFromHAR(HAR_FILE, {
    url: 'https://norma.nomoreparties.space/**',
    notFound: 'fallback'
  });
  await page.goto('/');
  await page.waitForSelector('[data-testid="ingredient-item"]');
}

// ─── Adding ingredients ───────────────────────────────────────────────────────

describe('Constructor: adding ingredients', () => {
  test('добавляет булку в конструктор при клике на кнопку', async ({ page }) => {
    await setupPage(page);

    const bunItem = page.locator('[data-testid="ingredient-item"]').filter({
      hasText: 'Краторная булка N-200i'
    });
    await bunItem.getByRole('button', { name: /добавить/i }).click();

    const constructor = page.locator('[data-testid="constructor"]');
    await expect(constructor).toContainText('Краторная булка N-200i');
  });

  test('добавляет начинку в конструктор при клике на кнопку', async ({ page }) => {
    await setupPage(page);

    const ingredient = page.locator('[data-testid="ingredient-item"]').filter({
      hasText: 'Мясо бессмертных моллюсков'
    });
    await ingredient.getByRole('button', { name: /добавить/i }).click();

    const constructor = page.locator('[data-testid="constructor"]');
    await expect(constructor).toContainText('Мясо бессмертных моллюсков');
  });
});

// ─── Ingredient modal ─────────────────────────────────────────────────────────

describe('Ingredient modal window', () => {
  test('открывается при клике на ингредиент', async ({ page }) => {
    await setupPage(page);

    await page.locator('[data-testid="ingredient-item"]').first().click();

    await expect(page.locator('[data-testid="modal"]')).toBeVisible();
  });

  test('отображает данные именно того ингредиента по которому кликнули', async ({ page }) => {
    await setupPage(page);

    await page
      .locator('[data-testid="ingredient-item"]')
      .filter({ hasText: 'Краторная булка N-200i' })
      .click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toContainText('Краторная булка N-200i');
    await expect(modal).not.toContainText('Мясо бессмертных моллюсков');
  });

  test('закрывается при клике на крестик', async ({ page }) => {
    await setupPage(page);

    await page.locator('[data-testid="ingredient-item"]').first().click();
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();

    await page.locator('[data-testid="modal-close-button"]').click();
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });

  test('закрывается при клике на оверлей', async ({ page }) => {
    await setupPage(page);

    await page.locator('[data-testid="ingredient-item"]').first().click();
    await expect(page.locator('[data-testid="modal"]')).toBeVisible();

    await page.locator('[data-testid="modal-overlay"]').click({ force: true });
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });
});

// ─── Order creation ───────────────────────────────────────────────────────────

describe('Order creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'Bearer fake-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'fake-refresh-token');
    });
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.removeItem('refreshToken');
    });
  });

  test('оформляет заказ: номер верный, конструктор очищается, модалка закрывается', async ({ page }) => {
    await setupPage(page);

    await page
      .locator('[data-testid="ingredient-item"]')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button', { name: /добавить/i })
      .click();

    await page
      .locator('[data-testid="ingredient-item"]')
      .filter({ hasText: 'Мясо бессмертных моллюсков' })
      .getByRole('button', { name: /добавить/i })
      .click();

    await page.getByRole('button', { name: /оформить заказ/i }).click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('12345');

    await page.locator('[data-testid="modal-close-button"]').click();
    await expect(modal).not.toBeVisible();

    const constructor = page.locator('[data-testid="constructor"]');
    await expect(constructor).not.toContainText('Краторная булка N-200i');
    await expect(constructor).not.toContainText('Мясо бессмертных моллюсков');
  });
});