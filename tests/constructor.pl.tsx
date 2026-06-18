import { test, expect, Page } from '@playwright/test';
import path from 'path';

const HAR_FILE = path.join(__dirname, 'hars/mock.json');

async function setupPage(page: Page) {
  await page.routeFromHAR(HAR_FILE, {
    url: 'https://norma.education-services.ru/**',
    notFound: 'abort'
  });
  await page.goto('/');
  await page.waitForSelector('[data-testid="ingredient-item"]');
}

// ─── Adding ingredients ───────────────────────────────────────────────────────

test.describe('Constructor: adding ingredients', () => {
  test('добавляет булку в конструктор при клике на кнопку', async ({ page }) => {
    await setupPage(page);

    const bunItem = page.getByTestId('ingredient-item').filter({
      hasText: 'Краторная булка N-200i'
    });
    await bunItem.getByRole('button', { name: /добавить/i }).first().click();

    const constructor = page.getByTestId('constructor').first();
    await expect(constructor).toContainText('Краторная булка N-200i');
  });

  test('добавляет начинку в конструктор при клике на кнопку', async ({ page }) => {
    await setupPage(page);

    const ingredient = page.getByTestId('ingredient-item').filter({
      hasText: 'Мясо бессмертных моллюсков'
    });
    await ingredient.getByRole('button', { name: /добавить/i }).first().click();

    const constructor = page.getByTestId('constructor').first();
    await expect(constructor).toContainText('Мясо бессмертных моллюсков');
  });
});

// ─── Ingredient modal ─────────────────────────────────────────────────────────

test.describe('Ingredient modal window', () => {
  test('открывается при клике на ингредиент', async ({ page }) => {
    await setupPage(page);

    await page.getByTestId('ingredient-item').first().click();

    await expect(page.getByTestId('modal')).toBeVisible();
  });

  test('отображает данные именно того ингредиента по которому кликнули', async ({ page }) => {
    await setupPage(page);

    await page
      .getByTestId('ingredient-item')
      .filter({ hasText: 'Краторная булка N-200i' })
      .first()
      .click();

    const modal = page.getByTestId('modal');
    await expect(modal).toContainText('Краторная булка N-200i');
    await expect(modal).not.toContainText('Мясо бессмертных моллюсков');
  });

  test('закрывается при клике на крестик', async ({ page }) => {
    await setupPage(page);

    await page.getByTestId('ingredient-item').first().click();
    await expect(page.getByTestId('modal')).toBeVisible();

    await page.getByTestId('modal-close-button').click();
    await expect(page.getByTestId('modal')).not.toBeVisible();
  });

  test('закрывается при клике на оверлей', async ({ page }) => {
    await setupPage(page);

    await page.getByTestId('ingredient-item').first().click();
    await expect(page.getByTestId('modal')).toBeVisible();

    await page.getByTestId('modal-overlay').dispatchEvent('click');
    await expect(page.getByTestId('modal')).not.toBeVisible();
  });
});

// ─── Order creation ───────────────────────────────────────────────────────────

test.describe('Order creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('refreshToken', 'fake-refresh-token');
    });
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'Bearer%20fake-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.routeFromHAR(HAR_FILE, {
      url: 'https://norma.education-services.ru/**',
      notFound: 'abort'
    });
    await page.goto('/');

    await page.waitForSelector('[data-testid="app"]');
    await page.waitForSelector('[data-testid="ingredient-item"]');
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.removeItem('refreshToken');
    });
  });

  test('оформляет заказ: номер верный, конструктор очищается, модалка закрывается', async ({ page }) => {
    await page
      .getByTestId('ingredient-item')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button', { name: /добавить/i })
      .first()
      .click();

    await page
      .getByTestId('ingredient-item')
      .filter({ hasText: 'Мясо бессмертных моллюсков' })
      .getByRole('button', { name: /добавить/i })
      .first()
      .click();

    await page.getByRole('button', { name: /оформить заказ/i }).first().click();

    const modal = page.getByTestId('modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('12345');

    await page.getByTestId('modal-close-button').click();
    await expect(modal).not.toBeVisible();

    const constructor = page.getByTestId('constructor').first();
    await expect(constructor).not.toContainText('Краторная булка N-200i');
    await expect(constructor).not.toContainText('Мясо бессмертных моллюсков');
  });
});