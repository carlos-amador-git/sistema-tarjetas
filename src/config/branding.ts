/**
 * Configuración de Marca (Branding)
 *
 * Este archivo centraliza toda la configuración relacionada con la marca.
 * Para personalizar para un cliente, modifique los valores aquí.
 */

import { BrandingConfig } from '@/types';

const BRANDING: BrandingConfig = {
  // Nombre de la empresa/producto
  companyName: 'Card',
  companySubtitle: 'System',
  fullName: 'CardSystem',

  // Textos del sistema
  systemName: 'Sistema de Inventario',
  systemDescription: 'Control de Tarjetas Bancarias',
  sidebarSubtitle: 'Sistema de Inventario de Tarjetas',

  // Título de la página (browser tab)
  pageTitle: 'CardSystem - Sistema de Inventario de Tarjetas',

  // Configuración de demo (para desarrollo/demostración)
  showDemo: true,
  demoCredentials: {
    admin: {
      user: 'admin',
      pass: 'admin123',
      label: 'Admin'
    },
    almacen: {
      user: 'tsys_user',
      pass: 'tsys123',
      label: 'Almacén Central'
    },
    logistica: {
      user: 'dist_user',
      pass: 'dist123',
      label: 'Logística'
    },
    sucursales: {
      user: 'mod_user',
      pass: 'mod123',
      label: 'Sucursales'
    },
    consulta: {
      user: 'director',
      pass: 'dir123',
      label: 'Consulta'
    }
  },

  // Logo
  logo: {
    type: 'text', // 'text' o 'image'
    imagePath: '/images/logo.svg',
    imageAlt: 'Logo'
  }
};

export default BRANDING;
