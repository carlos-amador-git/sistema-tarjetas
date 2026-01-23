/**
 * Configuración de Roles
 *
 * Define los roles del sistema con sus permisos y módulos accesibles.
 * Nombres genéricos para white-label.
 */

import { RolesConfig, RoleKey } from '@/types';

export const ROLES_CONFIG: RolesConfig = {
  admin: {
    nombre: 'Administrador',
    area: 'Administración',
    color: '#3b82f6',
    modulos: [
      'dashboard',
      'balance',
      'forecast',
      'captura-almacen',
      'captura-logistica',
      'captura-sucursales',
      'historial',
      'ordenes',
      'productos',
      'usuarios',
    ],
  },
  'Administrador': { // Mapping for DB value
    nombre: 'Administrador',
    area: 'Administración',
    color: '#3b82f6',
    modulos: [
      'dashboard',
      'balance',
      'forecast',
      'captura-almacen',
      'captura-logistica',
      'captura-sucursales',
      'historial',
      'ordenes',
      'productos',
      'usuarios',
    ],
  },
  // Rol de almacén (alias: tsys para compatibilidad)
  tsys: {
    nombre: 'Usuario Almacén',
    area: 'Almacén Central',
    color: '#8b5cf6',
    modulos: ['dashboard', 'captura-almacen', 'historial'],
  },
  almacen: {
    nombre: 'Usuario Almacén',
    area: 'Almacén Central',
    color: '#8b5cf6',
    modulos: ['dashboard', 'captura-almacen', 'historial'],
  },
  'Almacén Central': { // Mapping for DB value
    nombre: 'Usuario Almacén',
    area: 'Almacén Central',
    color: '#8b5cf6',
    modulos: ['dashboard', 'captura-almacen', 'historial'],
  },
  // Rol de logística (alias: distribucion para compatibilidad)
  distribucion: {
    nombre: 'Usuario Logística',
    area: 'Logística',
    color: '#f59e0b',
    modulos: ['dashboard', 'captura-logistica', 'historial'],
  },
  logistica: {
    nombre: 'Usuario Logística',
    area: 'Logística',
    color: '#f59e0b',
    modulos: ['dashboard', 'captura-logistica', 'historial'],
  },
  'Logística': { // Mapping for DB value
    nombre: 'Usuario Logística',
    area: 'Logística',
    color: '#f59e0b',
    modulos: ['dashboard', 'captura-logistica', 'historial'],
  },
  // Rol de sucursales (alias: modulos para compatibilidad)
  modulos: {
    nombre: 'Usuario Sucursales',
    area: 'Sucursales',
    color: '#10b981',
    modulos: ['dashboard', 'captura-sucursales', 'historial'],
  },
  sucursales: {
    nombre: 'Usuario Sucursales',
    area: 'Sucursales',
    color: '#10b981',
    modulos: ['dashboard', 'captura-sucursales', 'historial'],
  },
  'Sucursales': { // Mapping for DB value
    nombre: 'Usuario Sucursales',
    area: 'Sucursales',
    color: '#10b981',
    modulos: ['dashboard', 'captura-sucursales', 'historial'],
  },
  // Rol de consulta/directivo
  consulta: {
    nombre: 'Consulta / Directivo',
    area: 'Dirección',
    color: '#6366f1',
    modulos: ['dashboard', 'balance', 'forecast'],
  },
  'Consulta': { // Mapping for DB value
    nombre: 'Consulta / Directivo',
    area: 'Dirección',
    color: '#6366f1',
    modulos: ['dashboard', 'balance', 'forecast'],
  },
};

/**
 * Obtiene la configuración de un rol
 */
export function getRoleConfig(roleKey: RoleKey | string) {
  return ROLES_CONFIG[roleKey] || ROLES_CONFIG.consulta;
}

/**
 * Verifica si un rol tiene acceso a un módulo específico
 */
export function hasModuleAccess(roleKey: RoleKey | string, moduleId: string): boolean {
  const config = getRoleConfig(roleKey);
  return config.modulos.includes(moduleId);
}

/**
 * Obtiene todos los módulos accesibles para un rol
 */
export function getAccessibleModules(roleKey: RoleKey | string): string[] {
  const config = getRoleConfig(roleKey);
  return config.modulos;
}

export default ROLES_CONFIG;
