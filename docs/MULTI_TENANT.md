# Guía de Configuración Multi-Tenant

## Descripción General

El sistema CardSystem soporta múltiples clientes (tenants) desde una única instalación. Cada tenant puede tener:

- **Branding personalizado**: Logo, nombre, colores
- **Tema visual**: Colores de marca, sidebar, botones
- **Features habilitadas**: Módulos específicos por cliente
- **API independiente**: Conexión a backend dedicado

## Estructura de Archivos

```
src/config/tenants/
├── index.ts          # Registro de tenants y funciones helper
├── default.ts        # Configuración por defecto
└── [cliente].ts      # Configuración por cliente
```

## Agregar un Nuevo Cliente

### 1. Crear Archivo de Configuración

Copiar `banco-ejemplo.ts` como plantilla:

```typescript
// src/config/tenants/mi-cliente.ts
import { TenantConfig } from '@/types';

const miClienteTenant: TenantConfig = {
  id: 'mi-cliente',
  name: 'Mi Cliente',

  branding: {
    companyName: 'Mi',
    companySubtitle: 'Cliente',
    fullName: 'Mi Cliente',
    systemName: 'Control de Tarjetas',
    systemDescription: 'Sistema de Inventario',
    sidebarSubtitle: 'Gestión de Plásticos',
    pageTitle: 'Mi Cliente - Sistema de Tarjetas',
    logo: {
      type: 'image',
      imagePath: '/tenants/mi-cliente/logo.svg',
      imageAlt: 'Mi Cliente Logo',
    },
  },

  theme: {
    primary: '#3b82f6',     // Color principal
    secondary: '#1e40af',   // Color secundario
    accent: '#60a5fa',      // Color de acento
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f8fafc',
    sidebar: '#1e293b',
  },

  features: {
    showDemo: false,
    enableForecast: true,
    enableOrders: true,
    enableFacialRecognition: true,
    enableExcelExport: true,
    enablePDFExport: true,
  },

  demoCredentials: {},

  api: {
    baseUrl: 'https://api.micliente.com',
  },
};

export default miClienteTenant;
```

### 2. Registrar el Tenant

En `src/config/tenants/index.ts`:

```typescript
import miClienteTenant from './mi-cliente';

export const TENANTS: Record<string, TenantConfig> = {
  // ... otros tenants

  // Agregar dominios del cliente
  'tarjetas.micliente.com': miClienteTenant,
  'sistema.micliente.mx': miClienteTenant,
};
```

### 3. Agregar Assets del Cliente

```
public/tenants/mi-cliente/
├── logo.svg          # Logo principal (recomendado: 64x64 o SVG)
├── logo-white.svg    # Logo para fondos oscuros (opcional)
└── favicon.ico       # Favicon personalizado (opcional)
```

## Configuración de Colores

### Colores de Marca

| Variable | Uso | Ejemplo |
|----------|-----|---------|
| `primary` | Botones principales, links activos | `#3b82f6` (azul) |
| `secondary` | Gradientes, hover states | `#1e40af` (azul oscuro) |
| `accent` | Textos destacados, badges | `#60a5fa` (azul claro) |

### Colores del Sistema

| Variable | Uso |
|----------|-----|
| `success` | Mensajes de éxito, estados positivos |
| `warning` | Alertas, advertencias |
| `error` | Errores, estados negativos |
| `background` | Fondo de la aplicación |
| `sidebar` | Fondo del menú lateral |

## Features Configurables

| Feature | Descripción |
|---------|-------------|
| `showDemo` | Mostrar credenciales de demo en login |
| `enableForecast` | Habilitar módulo de pronóstico |
| `enableOrders` | Habilitar módulo de órdenes |
| `enableFacialRecognition` | Habilitar login con Face ID |
| `enableExcelExport` | Permitir exportación a Excel |
| `enablePDFExport` | Permitir exportación a PDF |

## Detección de Tenant

El sistema detecta el tenant automáticamente basado en:

1. **Hostname**: El dominio desde donde se accede
2. **Fallback**: Si no se encuentra, usa configuración `default`

### Flujo de Detección

```
Usuario accede a tarjetas.micliente.com
        ↓
Middleware detecta hostname
        ↓
Busca en TENANTS['tarjetas.micliente.com']
        ↓
Inyecta configuración en headers
        ↓
TenantProvider lee y aplica CSS variables
```

## Uso en Componentes

### Acceder a la Configuración

```tsx
import { useTenant } from '@/hooks/useTenant';

function MiComponente() {
  const { tenant } = useTenant();
  const { branding, theme, features } = tenant;

  return (
    <div>
      <h1>{branding.companyName}</h1>
      {features.enableForecast && <ForecastModule />}
    </div>
  );
}
```

### Hooks Especializados

```tsx
import {
  useTenantBranding,
  useTenantTheme,
  useTenantFeatures
} from '@/hooks/useTenant';

// Solo branding
const branding = useTenantBranding();

// Solo tema
const theme = useTenantTheme();

// Solo features
const features = useTenantFeatures();
```

## Despliegue

### Opción 1: Un Dominio por Cliente

Cada cliente accede desde su propio dominio:
- `tarjetas.cliente-a.com` → Tenant A
- `sistema.cliente-b.com` → Tenant B

### Opción 2: Subdominio

Usar subdominios del sistema principal:
- `cliente-a.cardsystem.com`
- `cliente-b.cardsystem.com`

### Variables de Entorno por Cliente

```env
# .env.cliente-a
NEXT_PUBLIC_API_URL=https://api.cliente-a.com
CLIENTE_A_DB_URL=postgresql://...

# .env.cliente-b
NEXT_PUBLIC_API_URL=https://api.cliente-b.com
CLIENTE_B_DB_URL=postgresql://...
```

## Consideraciones de Producción

1. **Base de Datos**: Para producción multi-tenant real, considerar migrar de SQLite a PostgreSQL con schemas separados por tenant.

2. **Caché**: Implementar caché de configuración de tenant para mejor rendimiento.

3. **CDN**: Servir assets de cada tenant desde CDN con rutas separadas.

4. **Monitoreo**: Configurar logs y métricas por tenant.

## Troubleshooting

### El tenant no se detecta

1. Verificar que el hostname está registrado en `TENANTS`
2. Revisar que el archivo del tenant se exporta correctamente
3. Verificar que no hay errores de sintaxis en la configuración

### Los colores no se aplican

1. Verificar que `TenantProvider` está en el árbol de componentes
2. Revisar que las CSS variables se están inyectando en `:root`
3. Limpiar caché del navegador

### El logo no carga

1. Verificar ruta del archivo en `public/tenants/[cliente]/`
2. Asegurar que la ruta en configuración coincide
3. Verificar permisos de archivo
