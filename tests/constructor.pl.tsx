import { test, expect, Page } from '@playwright/test';
import path from 'path';

const HAR_FILE = path.join(__dirname, 'hars/ingredients.json');

async function setupPage(page: Page) {
  await page.routeFromHAR(HAR_FILE, {
    url: 'https://norma.nomoreparties.space/**',
    notFound: 'fallback'
  });
  await page.goto('/');
  await page.waitForSelector('[data-testid="ingredient-item"]');
}

// ─── Adding ingredients ───────────────────────────────────────────────────────

test.describe('Constructor: adding ingredients', () => {
  test('добавляет булку в конструктор при клике на кнопку', async ({ page }) => {
    await setupPage(page);

    const bunItem = page.locator('[data-testid="ingredient-item"]').filter({
      hasText: 'Краторная булка N-200i'
    });
    await bunItem.getByRole('button', { name: /добавить/i }).first().click();

    const constructor = page.locator('[data-testid="constructor"]').first();
    await expect(constructor).toContainText('Краторная булка N-200i');
  });

  test('добавляет начинку в конструктор при клике на кнопку', async ({ page }) => {
    await setupPage(page);

    const ingredient = page.locator('[data-testid="ingredient-item"]').filter({
      hasText: 'Мясо бессмертных моллюсков'
    });
    await ingredient.getByRole('button', { name: /добавить/i }).first().click();

    const constructor = page.locator('[data-testid="constructor"]').first();
    await expect(constructor).toContainText('Мясо бессмертных моллюсков');
  });
});

// ─── Ingredient modal ─────────────────────────────────────────────────────────

test.describe('Ingredient modal window', () => {
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
      .first()
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

    await page.locator('[data-testid="modal-overlay"]').dispatchEvent('click');
    await expect(page.locator('[data-testid="modal"]')).not.toBeVisible();
  });
});

// ─── Order creation ───────────────────────────────────────────────────────────

test.describe('Order creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/ingredients', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { _id: '643d69a5c3f7b9001cfa093c', name: 'Краторная булка N-200i', type: 'bun', proteins: 80, fat: 24, carbohydrates: 53, calories: 420, price: 1255, image: 'https://code.s3.yandex.net/react-burger/images/bun-02.png', image_mobile: 'https://code.s3.yandex.net/react-burger/images/bun-02-mobile.png', image_large: 'https://code.s3.yandex.net/react-burger/images/bun-02-large.png', __v: 0 },
            { _id: '643d69a5c3f7b9001cfa0941', name: 'Мясо бессмертных моллюсков Protostomia', type: 'main', proteins: 433, fat: 244, carbohydrates: 33, calories: 420, price: 1337, image: 'https://code.s3.yandex.net/react-burger/images/meat-04.png', image_mobile: 'https://code.s3.yandex.net/react-burger/images/meat-04-mobile.png', image_large: 'https://code.s3.yandex.net/react-burger/images/meat-04-large.png', __v: 0 }
          ]
        })
      })
    );

    await page.route('**/api/auth/user', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, user: { email: 'test@test.com', name: 'Test User' } })
      })
    );

    await page.route('**/api/auth/token', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          accessToken: 'Bearer fake-access-token',
          refreshToken: 'fake-refresh-token'
        })
      })
    );

    await page.route('**/api/orders', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, name: 'Бессмертный краторный бургер', order: { number: 12345 } })
      })
    );

    await page.context().addCookies([
      { name: 'accessToken', value: 'Bearer fake-access-token', domain: 'localhost', path: '/' }
    ]);

    await page.goto('/');
    await page.waitForResponse(
      response => response.url().includes('/api/auth/user') && response.status() === 200
    );
    await page.waitForSelector('[data-testid="ingredient-item"]');
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
    await page
      .locator('[data-testid="ingredient-item"]')
      .filter({ hasText: 'Краторная булка N-200i' })
      .getByRole('button', { name: /добавить/i })
      .first()
      .click();

    await page
      .locator('[data-testid="ingredient-item"]')
      .filter({ hasText: 'Мясо бессмертных моллюсков' })
      .getByRole('button', { name: /добавить/i })
      .first()
      .click();

    await page.getByRole('button', { name: /оформить заказ/i }).first().click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('12345');

    await page.locator('[data-testid="modal-close-button"]').click();
    await expect(modal).not.toBeVisible();

    const constructor = page.locator('[data-testid="constructor"]').first();
    await expect(constructor).not.toContainText('Краторная булка N-200i');
    await expect(constructor).not.toContainText('Мясо бессмертных моллюсков');
  });
});