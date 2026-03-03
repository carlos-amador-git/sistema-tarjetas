/**
 * Configuración Centralizada del Sistema
 *
 * Este archivo exporta toda la configuración del sistema.
 * Importe desde aquí para acceder a cualquier configuración.
 */

// Branding
export { default as BRANDING } from './branding';

// Theme
export { default as THEME, generateCSSVariables, tailwindColors } from './theme';

// Modules
export { MODULE_TITLES, ROLE_AREA_LABELS, NAVIGATION_MODULES } from './modules';
export type { ModuleNavItem } from './modules';

// Roles
export {
  ROLES_CONFIG,
  getRoleConfig,
  hasModuleAccess,
  getAccessibleModules
} from './roles';

// Productos y catálogos
export {
  PRODUCTOS_CATALOGO,
  getProductosAlmacen,
  getProductosLogistica,
  getProductosSucursales,
  DESTINOS,
  SUCURSALES
} from './products';
export type { ProductoCatalogo } from './products';

// Constantes de cookies (httpOnly manejadas por el servidor)
// NOTA: Los tokens JWT se almacenan en httpOnly cookies por seguridad
// y NO son accesibles desde JavaScript del cliente.
export const COOKIE_NAMES = {
  accessToken: 'access_token',   // httpOnly
  refreshToken: 'refresh_token', // httpOnly
  userInfo: 'user_info',         // Legible por JS (info no sensible)
} as const;

// Legacy: mantener por compatibilidad temporal
// TODO: Remover en próxima versión
export const STORAGE_KEYS = COOKIE_NAMES;

// Configuración de API
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
} as const;
