/**
 * Sentry Client Configuration
 *
 * Configuración de Sentry para el cliente (browser)
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Desactivar en desarrollo
  enabled: process.env.NODE_ENV === 'production',

  // Porcentaje de sesiones a rastrear para performance
  tracesSampleRate: 0.1, // 10%

  // Porcentaje de sesiones a rastrear para replays
  replaysSessionSampleRate: 0.1, // 10%
  replaysOnErrorSampleRate: 1.0, // 100% en errores

  // Configuración de debug
  debug: false,

  // Versión de la aplicación
  release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',

  // Entorno
  environment: process.env.NODE_ENV,

  // Configuración de integraciones
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Antes de enviar el evento
  beforeSend(event) {
    // No enviar eventos en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    // Filtrar información sensible
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }

    return event;
  },

  // Ignorar ciertos errores
  ignoreErrors: [
    // Errores de red comunes
    'Network request failed',
    'Failed to fetch',
    'Load failed',
    // Errores de navegación del usuario
    'ResizeObserver loop',
    'Non-Error promise rejection',
    // Extensiones de navegador
    /chrome-extension/,
    /moz-extension/,
  ],
});
