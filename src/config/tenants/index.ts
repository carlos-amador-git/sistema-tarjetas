/**
 * Registro de Tenants
 *
 * Este archivo centraliza todos los tenants disponibles.
 * Para agregar un nuevo cliente:
 * 1. Crear archivo en /config/tenants/[nombre-cliente].ts
 * 2. Importarlo aquí
 * 3. Agregarlo al objeto TENANTS con su dominio como clave
 */

import { TenantConfig } from '@/types';
import defaultTenant from './default';
import bancoEjemploTenant from './banco-ejemplo';

// Mapeo de dominios a configuraciones de tenant
export const TENANTS: Record<string, TenantConfig> = {
  // Desarrollo local
  'localhost': defaultTenant,
  '127.0.0.1': defaultTenant,

  // Demo/Staging
  'demo.cardsystem.com': defaultTenant,
  'staging.cardsystem.com': defaultTenant,

  // Clientes
  'tarjetas.bancoejemplo.com': bancoEjemploTenant,
  'plasticos.bancoejemplo.mx': bancoEjemploTenant,
};

/**
 * Obtiene la configuración del tenant basado en el hostname
 */
export function getTenantByHost(host: string | null): TenantConfig {
  if (!host) return defaultTenant;

  // Remover puerto si existe
  const hostname = host.split(':')[0];

  // Buscar configuración específica o usar default
  return TENANTS[hostname] || defaultTenant;
}

/**
 * Obtiene la configuración del tenant por ID
 */
export function getTenantById(id: string): TenantConfig | undefined {
  return Object.values(TENANTS).find(tenant => tenant.id === id);
}

/**
 * Lista todos los tenants disponibles
 */
export function getAllTenants(): TenantConfig[] {
  // Usar Set para eliminar duplicados (mismo tenant en múltiples dominios)
  const uniqueTenants = new Map<string, TenantConfig>();
  Object.values(TENANTS).forEach(tenant => {
    uniqueTenants.set(tenant.id, tenant);
  });
  return Array.from(uniqueTenants.values());
}

export { defaultTenant, bancoEjemploTenant };
