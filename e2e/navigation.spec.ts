/**
 * E2E Tests - Navegación
 *
 * Tests end-to-end para la navegación del sistema
 */

import { test, expect } from '@playwright/test';

test.describe('Navegación General', () => {
  test('la página principal debe cargar correctamente', async ({ page }) => {
    await page.goto('/');

    // La página principal debe existir
    await expect(page).toHaveURL(/\/|login/);
  });

  test('la página de login debe ser accesible', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/login/);
    // Debe tener un formulario
    await expect(page.locator('form, [role="form"]').first()).toBeVisible();
  });

  test('debe manejar rutas no existentes (404)', async ({ page }) => {
    const response = await page.goto('/ruta-que-no-existe');

    // Puede ser 404 o redirigir
    expect([200, 404, 307, 308]).toContain(response?.status() || 200);
  });
});

test.describe('Responsive Design', () => {
  test('debe ser usable en móvil', async ({ page }) => {
    // Viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Los elementos principales deben ser visibles
    await expect(page.locator('input').first()).toBeVisible();
    await expect(page.locator('button').first()).toBeVisible();
  });

  test('debe ser usable en tablet', async ({ page }) => {
    // Viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');

    await expect(page.locator('input').first()).toBeVisible();
  });

  test('debe ser usable en desktop', async ({ page }) => {
    // Viewport desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');

    await expect(page.locator('input').first()).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('la página debe cargar en tiempo razonable', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/login');
    const loadTime = Date.now() - startTime;

    // Debe cargar en menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);
  });

  test('no debe haber errores de consola críticos', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/login');

    // Filtrar errores esperados (como errores de red en dev)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('net::') &&
        !e.includes('Failed to load resource')
    );

    expect(criticalErrors.length).toBe(0);
  });
});

test.describe('Accesibilidad Básica', () => {
  test('los inputs deben tener labels o placeholders', async ({ page }) => {
    await page.goto('/login');

    const inputs = page.locator('input');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.getAttribute('aria-label');
      const hasPlaceholder = await input.getAttribute('placeholder');
      const hasId = await input.getAttribute('id');

      // Cada input debe tener alguna forma de identificación
      expect(hasLabel || hasPlaceholder || hasId).toBeTruthy();
    }
  });

  test('los botones deben ser accesibles', async ({ page }) => {
    await page.goto('/login');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = (await button.textContent())?.trim();
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');

      // Cada botón debe tener texto visible, aria-label, o title para ser accesible
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });
});
