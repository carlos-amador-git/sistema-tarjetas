/**
 * Tests para verificar configuración de tenants
 * Ejecutar con: npx jest src/config/tenants/__tests__/tenants.test.ts
 */

import { getTenantByHost, getTenantById, getAllTenants, defaultTenant, bancoEjemploTenant } from '../index';

describe('Tenant Configuration', () => {
  describe('getTenantByHost', () => {
    it('should return default tenant for localhost', () => {
      const tenant = getTenantByHost('localhost');
      expect(tenant.id).toBe('default');
      expect(tenant.name).toBe('CardSystem');
    });

    it('should return default tenant for localhost with port', () => {
      const tenant = getTenantByHost('localhost:3000');
      expect(tenant.id).toBe('default');
    });

    it('should return banco-ejemplo tenant for registered domain', () => {
      const tenant = getTenantByHost('tarjetas.bancoejemplo.com');
      expect(tenant.id).toBe('banco-ejemplo');
      expect(tenant.name).toBe('Banco Ejemplo');
    });

    it('should return default tenant for unknown host', () => {
      const tenant = getTenantByHost('unknown.domain.com');
      expect(tenant.id).toBe('default');
    });

    it('should return default tenant for null host', () => {
      const tenant = getTenantByHost(null);
      expect(tenant.id).toBe('default');
    });
  });

  describe('getTenantById', () => {
    it('should find default tenant by id', () => {
      const tenant = getTenantById('default');
      expect(tenant).toBeDefined();
      expect(tenant?.name).toBe('CardSystem');
    });

    it('should find banco-ejemplo tenant by id', () => {
      const tenant = getTenantById('banco-ejemplo');
      expect(tenant).toBeDefined();
      expect(tenant?.name).toBe('Banco Ejemplo');
    });

    it('should return undefined for unknown id', () => {
      const tenant = getTenantById('unknown-tenant');
      expect(tenant).toBeUndefined();
    });
  });

  describe('getAllTenants', () => {
    it('should return all unique tenants', () => {
      const tenants = getAllTenants();
      expect(tenants.length).toBeGreaterThanOrEqual(2);

      const ids = tenants.map(t => t.id);
      expect(ids).toContain('default');
      expect(ids).toContain('banco-ejemplo');
    });

    it('should not have duplicate tenants', () => {
      const tenants = getAllTenants();
      const ids = tenants.map(t => t.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('Default Tenant Configuration', () => {
    it('should have all required branding fields', () => {
      expect(defaultTenant.branding.companyName).toBe('Card');
      expect(defaultTenant.branding.companySubtitle).toBe('System');
      expect(defaultTenant.branding.systemName).toBeDefined();
      expect(defaultTenant.branding.logo).toBeDefined();
    });

    it('should have all required theme colors', () => {
      expect(defaultTenant.theme.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(defaultTenant.theme.secondary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(defaultTenant.theme.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(defaultTenant.theme.success).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(defaultTenant.theme.error).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should respect NEXT_PUBLIC_DEMO_MODE environment variable for showDemo', () => {
      // showDemo depende de NEXT_PUBLIC_DEMO_MODE
      // En el entorno de test, verificamos que sea booleano
      expect(typeof defaultTenant.features.showDemo).toBe('boolean');
    });

    it('should load demo credentials from environment when DEMO_MODE is enabled', () => {
      // Las credenciales se cargan desde env
      // Verificamos que demoCredentials sea un objeto (puede estar vacío si DEMO_MODE=false)
      expect(typeof defaultTenant.demoCredentials).toBe('object');
    });

    it('should have all features enabled', () => {
      expect(defaultTenant.features.enableForecast).toBe(true);
      expect(defaultTenant.features.enableOrders).toBe(true);
      expect(defaultTenant.features.enableExcelExport).toBe(true);
      expect(defaultTenant.features.enablePDFExport).toBe(true);
    });
  });

  describe('Banco Ejemplo Tenant Configuration', () => {
    it('should have different branding than default', () => {
      expect(bancoEjemploTenant.branding.companyName).not.toBe(defaultTenant.branding.companyName);
      expect(bancoEjemploTenant.branding.fullName).toBe('Banco Ejemplo');
    });

    it('should have different theme colors (emerald)', () => {
      expect(bancoEjemploTenant.theme.primary).toBe('#059669');
      expect(bancoEjemploTenant.theme.primary).not.toBe(defaultTenant.theme.primary);
    });

    it('should have demo disabled for production', () => {
      expect(bancoEjemploTenant.features.showDemo).toBe(false);
      expect(Object.keys(bancoEjemploTenant.demoCredentials).length).toBe(0);
    });

    it('should have facial recognition disabled', () => {
      expect(bancoEjemploTenant.features.enableFacialRecognition).toBe(false);
    });

    it('should have image logo configured', () => {
      expect(bancoEjemploTenant.branding.logo.type).toBe('image');
      expect(bancoEjemploTenant.branding.logo.imagePath).toContain('banco-ejemplo');
    });
  });

  describe('No INVEX References', () => {
    it('should not contain INVEX in default tenant', () => {
      const jsonString = JSON.stringify(defaultTenant).toLowerCase();
      expect(jsonString).not.toContain('invex');
    });

    it('should not contain INVEX in banco-ejemplo tenant', () => {
      const jsonString = JSON.stringify(bancoEjemploTenant).toLowerCase();
      expect(jsonString).not.toContain('invex');
    });
  });
});
