/**
 * Configuración de Módulos
 *
 * Títulos y etiquetas de los módulos del sistema.
 * Nombres genéricos para white-label.
 */

import { RoleKey } from '@/types';

export const MODULE_TITLES: Record<string, string> = {
  'dashboard': 'Dashboard Ejecutivo',
  'dashboard-lectura': 'Dashboard de Inventario',
  'balance': 'Balance General de Inventario',
  'forecast': 'Pronóstico y Planeación de Compras',
  // Nombres genéricos
  'captura-almacen': 'Captura de Inventario - Almacén Central',
  'captura-logistica': 'Captura de Demanda - Logística',
  'captura-sucursales': 'Captura de Datos - Sucursales',
  // Alias para compatibilidad con IDs existentes
  'captura-tsys': 'Captura de Inventario - Almacén',
  'captura-distribucion': 'Captura de Demanda - Logística',
  'captura-modulos': 'Captura de Datos - Sucursales',
  'mi-historial': 'Mi Historial de Capturas',
  'historial': 'Historial de Movimientos',
  'productos': 'Catálogo de Productos',
  'ordenes': 'Órdenes de Compra',
  'usuarios': 'Gestión de Usuarios',
  'materiales': 'Inventario de Materiales',
  'procesos-bau': 'Procesos BAU',
};

// Mapeo de roles a nombres genéricos (para compatibilidad)
export const ROLE_AREA_LABELS: Record<string, { nombre: string; area: string }> = {
  admin: {
    nombre: 'Administrador',
    area: 'Administración',
  },
  almacen: {
    nombre: 'Usuario Almacén',
    area: 'Almacén Central',
  },
  tsys: {
    nombre: 'Usuario Almacén',
    area: 'Almacén Central',
  },
  logistica: {
    nombre: 'Usuario Logística',
    area: 'Logística',
  },
  distribucion: {
    nombre: 'Usuario Logística',
    area: 'Logística',
  },
  sucursales: {
    nombre: 'Usuario Sucursales',
    area: 'Sucursales',
  },
  modulos: {
    nombre: 'Usuario Sucursales',
    area: 'Sucursales',
  },
  consulta: {
    nombre: 'Directivo',
    area: 'Dirección',
  },
};

// Configuración de módulos con permisos por rol
export interface ModuleNavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: RoleKey[];
}

export const NAVIGATION_MODULES: ModuleNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    roles: ['admin', 'consulta', 'tsys', 'almacen', 'distribucion', 'logistica', 'modulos', 'sucursales'],
  },
  {
    id: 'balance',
    label: 'Balance',
    icon: 'BarChart3',
    path: '/balance',
    roles: ['admin', 'consulta'],
  },
  {
    id: 'forecast',
    label: 'Pronóstico',
    icon: 'TrendingUp',
    path: '/forecast',
    roles: ['admin', 'consulta'],
  },
  {
    id: 'captura-almacen',
    label: 'Almacén',
    icon: 'Warehouse',
    path: '/capturas/almacen',
    roles: ['admin', 'tsys', 'almacen'],
  },
  {
    id: 'captura-logistica',
    label: 'Logística',
    icon: 'Truck',
    path: '/capturas/logistica',
    roles: ['admin', 'distribucion', 'logistica'],
  },
  {
    id: 'captura-sucursales',
    label: 'Sucursales',
    icon: 'Building2',
    path: '/capturas/sucursales',
    roles: ['admin', 'modulos', 'sucursales'],
  },
  {
    id: 'historial',
    label: 'Mi Historial',
    icon: 'History',
    path: '/historial',
    roles: ['admin', 'tsys', 'almacen', 'distribucion', 'logistica', 'modulos', 'sucursales'],
  },
  {
    id: 'ordenes',
    label: 'Órdenes',
    icon: 'ShoppingCart',
    path: '/ordenes',
    roles: ['admin'],
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: 'CreditCard',
    path: '/productos',
    roles: ['admin'],
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: 'Users',
    path: '/usuarios',
    roles: ['admin'],
  },
];

export default MODULE_TITLES;
