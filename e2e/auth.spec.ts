/**
 * E2E Tests - Autenticación
 *
 * Tests end-to-end para el flujo de login/logout
 */

import { test, expect } from '@playwright/test';

test.describe('Autenticación', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('debe mostrar la página de login', async ({ page }) => {
    // Verificar elementos de la página
    await expect(page.locator('input[id="username"]')).toBeVisible();
    await expect(page.locator('input[id="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('no debe poder enviar formulario con campos vacíos', async ({ page }) => {
    // El botón debe estar deshabilitado cuando los campos están vacíos
    const submitButton = page.getByRole('button', { name: /iniciar sesión/i });
    await expect(submitButton).toBeDisabled();
  });

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.locator('input[id="username"]').fill('usuario_invalido');
    await page.locator('input[id="password"]').fill('password_invalido');
    await page.getByRole('button', { name: /iniciar sesión/i }).click();

    // Esperar mensaje de error
    await expect(page.getByText(/inválid|error|incorrect/i)).toBeVisible({ timeout: 10000 });
  });

  test('debe mostrar/ocultar contraseña con botón de toggle', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    const toggleButton = page.getByRole('button', { name: /mostrar contraseña|ocultar contraseña/i });

    // Inicialmente tipo password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click en toggle
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click de nuevo
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('debe tener protección contra acceso sin autenticación', async ({ page }) => {
    // Intentar acceder directamente al dashboard
    await page.goto('/dashboard');

    // Debe redirigir al login
    await expect(page).toHaveURL(/login/);
  });
});

test.describe('Navegación protegida', () => {
  test('las rutas protegidas deben redirigir a login', async ({ page }) => {
    const rutasProtegidas = [
      '/dashboard',
      '/balance',
      '/ordenes',
      '/historial',
      '/usuarios',
      '/productos',
    ];

    for (const ruta of rutasProtegidas) {
      await page.goto(ruta);
      // Debe redirigir a login
      await expect(page).toHaveURL(/login/);
    }
  });
});

test.describe('Credenciales de demostración', () => {
  test('debe mostrar botones de demostración si están habilitados', async ({ page }) => {
    // Verificar si hay credenciales de demostración
    const demoSection = page.getByText(/demostración/i);
    const hasDemoSection = await demoSection.count() > 0;

    if (hasDemoSection) {
      // Verificar que hay botones de demo
      const demoButtons = page.locator('button').filter({ hasText: /admin|almacen|consulta/i });
      await expect(demoButtons.first()).toBeVisible();
    }
  });

  test('los botones de demo deben llenar el formulario', async ({ page }) => {
    // Verificar si hay credenciales de demostración
    const demoButtons = page.locator('button').filter({ hasText: /admin/i });
    const hasDemo = await demoButtons.count() > 0;

    if (hasDemo) {
      await demoButtons.first().click();

      // Verificar que el formulario se llenó
      const usernameInput = page.locator('input[id="username"]');
      await expect(usernameInput).not.toHaveValue('');
    }
  });
});

test.describe('Validación del formulario', () => {
  test('el botón se habilita al llenar ambos campos', async ({ page }) => {
    await page.goto('/login');

    const submitButton = page.getByRole('button', { name: /iniciar sesión/i });

    // Inicialmente deshabilitado
    await expect(submitButton).toBeDisabled();

    // Llenar solo usuario
    await page.locator('input[id="username"]').fill('test');
    await expect(submitButton).toBeDisabled();

    // Llenar contraseña - esperar un momento para que React actualice el estado
    await page.locator('input[id="password"]').fill('test123');
    await page.waitForTimeout(100);
    await expect(submitButton).toBeEnabled();
  });

  test('debe manejar envío del formulario', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[id="username"]').fill('test');
    await page.locator('input[id="password"]').fill('test123');

    const submitButton = page.getByRole('button', { name: /iniciar sesión/i });

    // Verificar que el botón está habilitado antes de hacer click
    await expect(submitButton).toBeEnabled();

    // Click para enviar
    await submitButton.click();

    // Después del envío, debe mostrar error (credenciales inválidas) o redirigir
    // Esperamos ver un mensaje de error ya que las credenciales son de prueba
    await expect(
      page.getByText(/inválid|error|incorrect|iniciando/i)
    ).toBeVisible({ timeout: 10000 });
  });
});
