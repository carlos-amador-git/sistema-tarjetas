# Monitoring & Observabilidad

Este documento describe la configuración de monitoring y observabilidad para CardSystem.

## 1. Sentry (Error Tracking)

### Configuración

1. **Crear cuenta en Sentry**: https://sentry.io

2. **Crear proyecto**: Seleccionar "Next.js" como plataforma

3. **Configurar variables de entorno**:

```bash
# .env.local o variables de entorno de producción
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=cardsystem-frontend
SENTRY_AUTH_TOKEN=xxxxx  # Solo necesario para subir source maps
```

4. **Verificar instalación**:

```typescript
// En cualquier componente para probar
import * as Sentry from '@sentry/nextjs';

// Capturar error de prueba
Sentry.captureException(new Error('Test error from CardSystem'));
```

### Archivos de configuración

- `sentry.client.config.ts` - Configuración del cliente (browser)
- `sentry.server.config.ts` - Configuración del servidor (Node.js)
- `sentry.edge.config.ts` - Configuración de Edge Runtime

### Características habilitadas

- **Error Tracking**: Captura automática de errores y excepciones
- **Performance Monitoring**: Rastreo de transacciones y tiempos de carga
- **Session Replay**: Grabación de sesiones para reproducir errores
- **Source Maps**: Mapeo de errores minificados a código fuente

### Best Practices

1. **No capturar datos sensibles**:
   - Passwords
   - Tokens
   - Información personal

2. **Configurar alertas**:
   - Error rate > 1%
   - P99 latency > 5s
   - Nuevos errores

## 2. Métricas de Aplicación

### Performance Metrics (Web Vitals)

```typescript
// src/lib/monitoring.ts
import { onCLS, onFID, onLCP, onTTFB, onFCP } from 'web-vitals';

export function initWebVitals() {
  onCLS((metric) => console.log('CLS:', metric));
  onFID((metric) => console.log('FID:', metric));
  onLCP((metric) => console.log('LCP:', metric));
  onTTFB((metric) => console.log('TTFB:', metric));
  onFCP((metric) => console.log('FCP:', metric));
}
```

### Métricas Personalizadas

```typescript
// Ejemplo: Medir tiempo de login
const startTime = performance.now();
await login(username, password);
const loginTime = performance.now() - startTime;

// Enviar a Sentry
Sentry.addBreadcrumb({
  category: 'performance',
  message: `Login completed in ${loginTime}ms`,
  level: 'info',
});
```

## 3. Logging

### Configuración de Logs

Los logs de auditoría se almacenan en:
- **Desarrollo**: localStorage + console
- **Producción**: Servicio centralizado (a configurar)

### Tipos de logs

| Tipo | Descripción |
|------|-------------|
| `INFO` | Operaciones normales |
| `WARNING` | Situaciones inusuales |
| `ERROR` | Errores recuperables |
| `CRITICAL` | Errores graves |

### Eventos auditados

- Login/Logout
- Cambios de usuarios
- Operaciones de inventario
- Errores de seguridad
- Rate limiting

## 4. Datadog (Opcional)

Si se requiere Datadog además de Sentry:

### Instalación

```bash
npm install @datadog/browser-rum @datadog/browser-logs
```

### Configuración

```typescript
// src/lib/datadog.ts
import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'cardsystem-frontend',
  env: process.env.NODE_ENV,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
});

datadogLogs.init({
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sessionSampleRate: 100,
});
```

## 5. Alertas Recomendadas

### Sentry

1. **Error Rate Alert**: > 1% de requests con error
2. **New Issue Alert**: Notificar nuevos tipos de errores
3. **Regression Alert**: Error que reaparece después de resolverse

### Health Checks

```typescript
// src/app/api/health/route.ts
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION,
    checks: {
      database: await checkDatabase(),
      cache: await checkCache(),
    },
  };

  return Response.json(health);
}
```

## 6. Dashboard

### Métricas clave a monitorear

| Métrica | Objetivo | Alerta |
|---------|----------|--------|
| Error Rate | < 1% | > 1% |
| P95 Response Time | < 500ms | > 1000ms |
| Uptime | > 99.9% | < 99.5% |
| LCP | < 2.5s | > 4s |
| FID | < 100ms | > 300ms |
| CLS | < 0.1 | > 0.25 |

## 7. Runbook

### Error: Alto error rate

1. Verificar logs en Sentry
2. Identificar endpoint afectado
3. Verificar estado del backend
4. Rollback si es necesario

### Error: Performance degradada

1. Verificar métricas de servidor
2. Revisar queries lentas
3. Verificar CDN y cache
4. Escalar recursos si es necesario

---

**Variables de entorno necesarias**:

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=

# Versión de la app
NEXT_PUBLIC_APP_VERSION=

# Datadog (opcional)
NEXT_PUBLIC_DD_APPLICATION_ID=
NEXT_PUBLIC_DD_CLIENT_TOKEN=
```
