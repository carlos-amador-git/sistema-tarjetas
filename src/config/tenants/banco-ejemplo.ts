/**
 * Configuración de ejemplo para un banco cliente
 * Copiar este archivo y modificar para cada nuevo cliente
 */

import { TenantConfig } from '@/types';

const bancoEjemploTenant: TenantConfig = {
  id: 'banco-ejemplo',
  name: 'Banco Ejemplo',

  // Branding personalizado
  branding: {
    companyName: 'Banco',
    companySubtitle: 'Ejemplo',
    fullName: 'Banco Ejemplo',
    systemName: 'Control de Plásticos',
    systemDescription: 'Gestión de Tarjetas Bancarias',
    sidebarSubtitle: 'Sistema de Control de Plásticos',
    pageTitle: 'Banco Ejemplo - Control de Plásticos',
    logo: {
      type: 'image',
      imagePath: '/tenants/banco-ejemplo/logo.svg',
      imageAlt: 'Banco Ejemplo Logo',
    },
  },

  // Tema personalizado (colores del cliente)
  theme: {
    primary: '#059669',      // emerald-600
    secondary: '#047857',    // emerald-700
    accent: '#34d399',       // emerald-400
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f0fdf4',   // emerald-50
    sidebar: '#064e3b',      // emerald-900
  },

  // Features habilitados para este cliente
  features: {
    showDemo: false,         // Sin demo en producción
    enableForecast: true,
    enableOrders: true,
    enableFacialRecognition: false,  // No requieren esta feature
    enableExcelExport: true,
    enablePDFExport: true,
  },

  // Sin credenciales de demo en producción
  demoCredentials: {},

  // API del cliente
  api: {
    baseUrl: process.env.BANCO_EJEMPLO_API_URL || 'https://api.bancoejemplo.com',
  },
};

export default bancoEjemploTenant;
