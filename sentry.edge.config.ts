/**
 * Sentry Edge Configuration
 *
 * Configuración de Sentry para Edge Runtime (middleware, etc.)
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Desactivar en desarrollo
  enabled: process.env.NODE_ENV === 'production',

  // Porcentaje de requests a rastrear
  tracesSampleRate: 0.1, // 10%

  // Configuración de debug
  debug: false,

  // Versión de la aplicación
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Entorno
  environment: process.env.NODE_ENV,
});
