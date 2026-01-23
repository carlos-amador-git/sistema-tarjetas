/**
 * Configuración por defecto del tenant
 * Esta configuración se usa cuando no se detecta un tenant específico
 *
 * SEGURIDAD: Las credenciales de demo se cargan desde variables de entorno.
 * En producción, NEXT_PUBLIC_DEMO_MODE debe estar en false o no definido.
 */

import { TenantConfig } from '@/types';

/**
 * Obtiene las credenciales de demo desde variables de entorno.
 * Solo se cargan si NEXT_PUBLIC_DEMO_MODE=true
 */
function getDemoCredentials(): TenantConfig['demoCredentials'] {
  // Solo cargar credenciales si el modo demo está habilitado
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  if (!isDemoMode) {
    return {};
  }

  const credentials: TenantConfig['demoCredentials'] = {};

  // Admin
  if (process.env.NEXT_PUBLIC_DEMO_ADMIN_USER) {
    credentials.admin = {
      user: process.env.NEXT_PUBLIC_DEMO_ADMIN_USER,
      pass: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASS || '',
      label: process.env.NEXT_PUBLIC_DEMO_ADMIN_LABEL || 'Admin',
    };
  }

  // Almacén
  if (process.env.NEXT_PUBLIC_DEMO_ALMACEN_USER) {
    credentials.almacen = {
      user: process.env.NEXT_PUBLIC_DEMO_ALMACEN_USER,
      pass: process.env.NEXT_PUBLIC_DEMO_ALMACEN_PASS || '',
      label: process.env.NEXT_PUBLIC_DEMO_ALMACEN_LABEL || 'Almacén',
    };
  }

  // Logística
  if (process.env.NEXT_PUBLIC_DEMO_LOGISTICA_USER) {
    credentials.logistica = {
      user: process.env.NEXT_PUBLIC_DEMO_LOGISTICA_USER,
      pass: process.env.NEXT_PUBLIC_DEMO_LOGISTICA_PASS || '',
      label: process.env.NEXT_PUBLIC_DEMO_LOGISTICA_LABEL || 'Logística',
    };
  }

  // Sucursales
  if (process.env.NEXT_PUBLIC_DEMO_SUCURSALES_USER) {
    credentials.sucursales = {
      user: process.env.NEXT_PUBLIC_DEMO_SUCURSALES_USER,
      pass: process.env.NEXT_PUBLIC_DEMO_SUCURSALES_PASS || '',
      label: process.env.NEXT_PUBLIC_DEMO_SUCURSALES_LABEL || 'Sucursales',
    };
  }

  // Consulta
  if (process.env.NEXT_PUBLIC_DEMO_CONSULTA_USER) {
    credentials.consulta = {
      user: process.env.NEXT_PUBLIC_DEMO_CONSULTA_USER,
      pass: process.env.NEXT_PUBLIC_DEMO_CONSULTA_PASS || '',
      label: process.env.NEXT_PUBLIC_DEMO_CONSULTA_LABEL || 'Consulta',
    };
  }

  return credentials;
}

const defaultTenant: TenantConfig = {
  id: 'default',
  name: 'CardSystem',

  // Branding
  branding: {
    companyName: 'Card',
    companySubtitle: 'System',
    fullName: 'CardSystem',
    systemName: 'Sistema de Inventario',
    systemDescription: 'Control de Tarjetas Bancarias',
    sidebarSubtitle: 'Sistema de Inventario de Tarjetas',
    pageTitle: 'CardSystem - Sistema de Inventario de Tarjetas',
    logo: {
      type: 'text',
      imagePath: '/images/logo.svg',
      imageAlt: 'Logo',
    },
  },

  // Tema de colores
  theme: {
    primary: '#3b82f6',      // blue-500
    secondary: '#1e40af',    // blue-800
    accent: '#60a5fa',       // blue-400
    success: '#22c55e',      // green-500
    warning: '#f59e0b',      // amber-500
    error: '#ef4444',        // red-500
    background: '#f8fafc',   // slate-50
    sidebar: '#1e293b',      // slate-800
  },

  // Configuración de features
  features: {
    showDemo: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
    enableForecast: true,
    enableOrders: true,
    enableFacialRecognition: true,
    enableExcelExport: true,
    enablePDFExport: true,
  },

  // Credenciales de demo (cargadas desde variables de entorno)
  demoCredentials: getDemoCredentials(),

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

export default defaultTenant;
