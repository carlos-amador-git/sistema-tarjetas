# Guía de Levantamiento para Desarrolladores

## CardSystem - Sistema de Inventario de Tarjetas Bancarias

Este documento contiene toda la información necesaria para levantar, entender y trabajar con el proyecto.

---

## Tabla de Contenidos

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación Paso a Paso](#instalación-paso-a-paso)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Arquitectura](#arquitectura)
6. [Base de Datos](#base-de-datos)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
8. [API Endpoints](#api-endpoints)
9. [Componentes Principales](#componentes-principales)
10. [Sistema de Paletas/Temas](#sistema-de-paletastemas)
11. [Testing](#testing)
12. [Deploy con Docker](#deploy-con-docker)
13. [Variables de Entorno](#variables-de-entorno)
14. [Troubleshooting](#troubleshooting)
15. [Convenciones de Código](#convenciones-de-código)

---

## Resumen del Proyecto

**CardSystem** es un sistema white-label para gestión de inventario de tarjetas bancarias.

### Funcionalidades Principales

- Control de inventario en múltiples ubicaciones (Almacén, Logística, Sucursales)
- Dashboard con KPIs y gráficos en tiempo real
- Sistema de roles y permisos por área
- Autenticación con 2FA (TOTP)
- Forecast y alertas de stock
- Órdenes de compra
- Exportación a Excel/PDF
- 6 paletas de colores para demos con clientes
- Tour demo interactivo

### Stack Tecnológico

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Next.js | 16.1.4 | Framework fullstack |
| React | 19.2.3 | UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos |
| Prisma | 7.3.0 | ORM |
| SQLite | - | Base de datos |
| Zustand | 5.0.10 | Estado global |
| TanStack Query | 5.90.19 | Data fetching |
| Recharts | 3.6.0 | Gráficos |
| Jest | 30.2.0 | Tests unitarios |
| Playwright | 1.57.0 | Tests E2E |

---

## Requisitos Previos

### Software Requerido

```bash
# Node.js 18+ (recomendado 20+)
node --version  # v20.x.x

# npm 9+
npm --version   # 9.x.x

# Git
git --version

# Docker (opcional, para producción)
docker --version
docker-compose --version
```

### Herramientas Recomendadas

- **VS Code** con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Prisma
- **Postman** o **Insomnia** para probar APIs
- **TablePlus** o **DBeaver** para inspeccionar SQLite

---

## Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MarxCha/sistema-tarjetas.git
cd sistema-tarjetas
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará ~1200 paquetes. Tiempo aproximado: 1-2 minutos.

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar .env.local con tus valores
```

Contenido mínimo de `.env.local`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="genera-un-secreto-seguro-de-32-caracteres"
NEXT_PUBLIC_DEMO_MODE="true"
```

Para generar un JWT_SECRET seguro:

```bash
openssl rand -base64 32
```

### 4. Configurar Base de Datos

```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas en SQLite
npm run db:push

# Cargar datos de ejemplo
npm run db:seed
```

Después de esto tendrás:
- Archivo `dev.db` en la raíz
- 5 usuarios de prueba
- Productos de ejemplo
- Datos de inventario

### 5. Iniciar en Desarrollo

```bash
npm run dev
```

La app estará en: **http://localhost:3000**

### 6. Verificar Instalación

```bash
# En otra terminal
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{"status":"healthy","version":"0.1.0",...}
```

### 7. Probar Login

Abrir http://localhost:3000 y usar:
- Usuario: `admin`
- Contraseña: `admin123`

---

## Estructura del Proyecto

```
sistema-tarjetas/
├── .claude/                    # Contexto para Claude AI
│   ├── context.json            # Estado del proyecto
│   └── PLAN_FASES.md           # Plan de desarrollo
│
├── .github/workflows/          # CI/CD
│   ├── ci.yml                  # Tests en PRs
│   └── cd.yml                  # Deploy automático
│
├── docs/                       # Documentación
│   ├── API.md                  # Referencia de API
│   ├── DEPLOY.md               # Guía de deploy
│   └── MANUAL_USUARIO.md       # Manual para usuarios
│
├── prisma/
│   ├── schema.prisma           # Modelos de datos
│   ├── seed.ts                 # Seed de desarrollo
│   └── migrations/             # Migraciones SQL
│
├── public/
│   └── images/                 # Assets estáticos
│
├── scripts/
│   ├── docker-entrypoint.sh    # Entrypoint Docker
│   └── deploy-antigravity.sh   # Script de deploy
│
├── src/
│   ├── app/                    # App Router (Next.js 14+)
│   │   ├── (auth)/             # Grupo de rutas auth
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/        # Grupo de rutas dashboard
│   │   │   ├── layout.tsx      # Layout con Sidebar
│   │   │   ├── dashboard/
│   │   │   ├── balance/
│   │   │   ├── forecast/
│   │   │   ├── capturas/
│   │   │   ├── ordenes/
│   │   │   ├── productos/
│   │   │   ├── usuarios/
│   │   │   └── historial/
│   │   ├── api/                # API Routes
│   │   │   ├── auth/
│   │   │   ├── productos/
│   │   │   ├── balance/
│   │   │   ├── historial/
│   │   │   ├── ordenes/
│   │   │   ├── health/
│   │   │   └── metrics/
│   │   ├── globals.css         # Estilos globales
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/
│   │   ├── ui/                 # Componentes base (Button, Modal, etc.)
│   │   ├── forms/              # Formularios
│   │   ├── charts/             # Gráficos con Recharts
│   │   ├── Sidebar.tsx         # Menú lateral
│   │   ├── DemoTour.tsx        # Tour interactivo
│   │   ├── ThemeSelector.tsx   # Selector de paleta
│   │   └── TwoFactorSetup.tsx  # Configuración 2FA
│   │
│   ├── config/
│   │   ├── tenants/            # Configuración multi-tenant
│   │   │   └── default.ts
│   │   ├── colorPalettes.ts    # Paletas de colores
│   │   ├── modules.ts          # Definición de módulos
│   │   └── roles.ts            # Roles y permisos
│   │
│   ├── hooks/
│   │   ├── useAuth.ts          # Hook de autenticación
│   │   ├── useTenant.ts        # Hook de tenant
│   │   ├── useThemeDemo.ts     # Hook de paletas
│   │   └── useQueries.ts       # Queries con TanStack
│   │
│   ├── lib/
│   │   ├── auth/               # Lógica de auth
│   │   │   ├── jwt.ts          # Manejo de tokens
│   │   │   ├── password.ts     # Bcrypt
│   │   │   └── two-factor.ts   # TOTP con speakeasy
│   │   ├── security/
│   │   │   ├── rateLimit.ts    # Rate limiting
│   │   │   └── csrf.ts         # CSRF protection
│   │   ├── prisma.ts           # Cliente Prisma singleton
│   │   └── utils.ts            # Utilidades generales
│   │
│   ├── stores/
│   │   ├── authStore.ts        # Estado de auth (Zustand)
│   │   └── inventoryStore.ts   # Estado de inventario
│   │
│   └── types/
│       └── index.ts            # TypeScript types
│
├── e2e/                        # Tests E2E (Playwright)
│
├── Dockerfile                  # Build de Docker
├── docker-compose.yml          # Orquestación
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## Arquitectura

### Flujo de Datos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js    │────▶│   Prisma    │
│   (React)   │◀────│  API Routes │◀────│   SQLite    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │
      │                    ▼
      │            ┌─────────────┐
      └───────────▶│   Zustand   │
                   │   Store     │
                   └─────────────┘
```

### Capas de la Aplicación

1. **Presentación** (React Components)
   - Componentes en `src/components/`
   - Páginas en `src/app/(dashboard)/`

2. **Estado** (Zustand + TanStack Query)
   - Stores en `src/stores/`
   - Queries en `src/hooks/useQueries.ts`

3. **API** (Next.js API Routes)
   - Endpoints en `src/app/api/`
   - Autenticación en `src/lib/auth/`

4. **Datos** (Prisma + SQLite)
   - Schema en `prisma/schema.prisma`
   - Cliente en `src/lib/prisma.ts`

### Patrón de Autenticación

```
Login → JWT Access Token (15min) + Refresh Token (7d)
      → Cookies httpOnly
      → Middleware valida en cada request
```

---

## Base de Datos

### Modelos Principales

```prisma
// prisma/schema.prisma

model User {
  id                Int      @id @default(autoincrement())
  username          String   @unique
  password          String   // bcrypt hash
  nombre            String
  rol               String   // admin, almacen, logistica, sucursales, consulta
  area              String
  activo            Boolean  @default(true)
  twoFactorSecret   String?  // TOTP secret
  twoFactorEnabled  Boolean  @default(false)
  backupCodes       String?  // JSON array
}

model Producto {
  id          Int      @id @default(autoincrement())
  codigo      String   @unique
  nombre      String
  descripcion String?
  tipo        String   // DEBITO, CREDITO
  activo      Boolean  @default(true)
}

model BalanceProducto {
  id          Int      @id @default(autoincrement())
  productoId  Int      @unique
  boveda      Int      @default(0)
  workcenter  Int      @default(0)
  logistica   Int      @default(0)
  sucursales  Int      @default(0)
  enProceso   Int      @default(0)
}

model MovimientoHistorial {
  id          Int      @id @default(autoincrement())
  productoId  Int
  tipo        String   // ENTRADA, SALIDA, AJUSTE
  cantidad    Int
  ubicacion   String
  descripcion String?
  usuarioId   Int
  createdAt   DateTime @default(now())
}

model OrdenCompra {
  id            Int      @id @default(autoincrement())
  numero        String   @unique
  productoId    Int
  cantidad      Int
  estatus       String   // PENDIENTE, EN_PROCESO, COMPLETADA, CANCELADA
  proveedor     String
  fechaEstimada DateTime?
  notas         String?
}
```

### Comandos de Base de Datos

```bash
# Regenerar cliente Prisma después de cambios al schema
npm run db:generate

# Aplicar cambios al schema (desarrollo)
npm run db:push

# Crear migración (producción)
npx prisma migrate dev --name descripcion_del_cambio

# Resetear base de datos
npx prisma migrate reset

# Abrir Prisma Studio (GUI)
npm run db:studio

# Ver datos directamente
sqlite3 dev.db ".tables"
sqlite3 dev.db "SELECT * FROM User;"
```

---

## Autenticación y Seguridad

### Flujo de Login

```typescript
// 1. Usuario envía credenciales
POST /api/auth/login
{ "username": "admin", "password": "admin123" }

// 2. Backend valida y genera tokens
const accessToken = jwt.sign({ userId, rol }, SECRET, { expiresIn: '15m' });
const refreshToken = jwt.sign({ userId }, SECRET, { expiresIn: '7d' });

// 3. Tokens se envían como cookies httpOnly
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: user_info=...; // Legible por JS para UI
```

### Archivos Clave

| Archivo | Función |
|---------|---------|
| `src/lib/auth/jwt.ts` | Generación y verificación de JWT |
| `src/lib/auth/password.ts` | Hash y verificación bcrypt |
| `src/lib/auth/two-factor.ts` | TOTP con speakeasy |
| `src/lib/security/rateLimit.ts` | Rate limiting por IP |
| `src/hooks/useAuth.ts` | Hook de autenticación en frontend |
| `src/stores/authStore.ts` | Estado de auth con Zustand |

### 2FA (Two-Factor Authentication)

```typescript
// Flujo de activación
1. GET /api/auth/2fa/setup    → Genera secret + QR
2. Usuario escanea QR con Google Authenticator
3. POST /api/auth/2fa/enable  → Valida código y activa
4. Se generan 8 backup codes

// Flujo de login con 2FA
1. POST /api/auth/login       → Retorna requiresTwoFactor: true
2. POST /api/auth/2fa/verify  → Valida código TOTP
3. Se establecen cookies de sesión
```

### Rate Limiting

```typescript
// Configuración en src/lib/security/rateLimit.ts
const RATE_LIMITS = {
  login: { windowMs: 60000, max: 5 },    // 5 intentos/min
  api: { windowMs: 60000, max: 100 },    // 100 req/min
};
```

---

## API Endpoints

### Resumen

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |
| POST | `/api/auth/refresh` | Renovar token | Sí |
| GET | `/api/auth/session` | Sesión actual | Sí |
| GET | `/api/productos` | Listar productos | Sí |
| POST | `/api/productos` | Crear producto | Admin |
| GET | `/api/balance` | Obtener inventario | Sí |
| PUT | `/api/balance/[id]` | Actualizar balance | Captura |
| GET | `/api/historial` | Listar movimientos | Sí |
| POST | `/api/historial` | Registrar movimiento | Captura |
| GET | `/api/ordenes` | Listar órdenes | Sí |
| POST | `/api/ordenes` | Crear orden | Admin/Almacén |
| GET | `/api/health` | Estado del sistema | No |
| GET | `/api/metrics` | Métricas | Admin |

### Documentación Completa

Ver `docs/API.md` para ejemplos de request/response de cada endpoint.

---

## Componentes Principales

### Sidebar (`src/components/Sidebar.tsx`)

Menú lateral con navegación. Características:
- Colapsa en desktop
- Drawer en mobile
- Filtra módulos por rol
- Incluye ThemeSelector

### StatCard (`src/components/ui/DataDisplay.tsx`)

Tarjeta de estadísticas adaptable:
```tsx
<StatCard
  title="Total Inventario"
  value={12500}
  icon={<CreditCard />}
  trend={{ value: 5.2, label: "vs mes anterior" }}
  sparkline={[100, 120, 115, 130, 125, 140]}
  href="/balance"
/>
```

### DemoTour (`src/components/DemoTour.tsx`)

Tour interactivo paso a paso:
- 6 pasos por los módulos principales
- Navegación automática
- Panel lateral con información

### ThemeSelector (`src/components/ThemeSelector.tsx`)

Selector de paletas de colores:
- 6 temas bancarios predefinidos
- Aplica CSS variables dinámicamente
- Persiste en localStorage

---

## Sistema de Paletas/Temas

### Cómo Funciona

1. Las paletas se definen en `src/config/colorPalettes.ts`
2. `applyDemoPalette()` aplica CSS variables a `:root`
3. Los componentes usan variables como `var(--brand-primary)`

### CSS Variables

```css
:root {
  --brand-primary: #3b82f6;
  --brand-secondary: #1e40af;
  --brand-accent: #60a5fa;
  --color-sidebar: #1e293b;
  --color-background: #f8fafc;
}
```

### Agregar Nueva Paleta

```typescript
// src/config/colorPalettes.ts
export const DEMO_PALETTES: DemoPalette[] = [
  // ... paletas existentes
  {
    id: 'mi-banco',
    name: 'Mi Banco',
    primary: '#FF0000',
    secondary: '#CC0000',
    accent: '#FF6666',
    sidebar: '#1a1a1a',
    background: '#f5f5f5',
  },
];
```

### Uso en Componentes

```tsx
// Usar variables CSS
<button className="bg-[var(--brand-primary,#3b82f6)]">
  Click
</button>

// O con fallback de Tailwind
<div style={{ backgroundColor: 'var(--brand-primary)' }}>
  ...
</div>
```

---

## Testing

### Tests Unitarios (Jest)

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con watch
npm test -- --watch

# Ejecutar un archivo específico
npm test -- src/lib/auth/__tests__/password.test.ts

# Ver coverage
npm test -- --coverage
```

**Estadísticas actuales:** 654 tests, ~50% coverage

### Tests E2E (Playwright)

```bash
# Ejecutar todos (requiere app corriendo)
npm run test:e2e

# Ejecutar con UI
npx playwright test --ui

# Ejecutar un archivo
npx playwright test e2e/auth.spec.ts

# Ver reporte
npx playwright show-report
```

**Estadísticas actuales:** 108 tests en 4 browsers (Chromium, Firefox, WebKit, Mobile Chrome)

### Estructura de Tests

```
src/
├── lib/auth/__tests__/
│   ├── jwt.test.ts
│   └── password.test.ts
├── components/ui/__tests__/
│   └── DataDisplay.test.tsx
└── hooks/__tests__/
    └── useAuth.test.tsx

e2e/
├── auth.spec.ts
├── navigation.spec.ts
└── two-factor.spec.ts
```

---

## Deploy con Docker

### Build Local

```bash
# Build imagen
docker-compose build app

# Iniciar
docker-compose up -d app

# Ver logs
docker-compose logs -f app

# Verificar
curl http://localhost:3000/api/health
```

### Dockerfile Explicado

```dockerfile
# Stage 1: Dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "server.js"]
```

### Variables de Producción

```yaml
# docker-compose.yml
environment:
  - NODE_ENV=production
  - DATABASE_URL=file:/app/data/production.db
  - JWT_SECRET=${JWT_SECRET}
  - NEXT_PUBLIC_DEMO_MODE=true
  - ALLOW_HTTP_COOKIES=true  # Solo para desarrollo sin HTTPS
```

---

## Variables de Entorno

### Archivo `.env.local` (Desarrollo)

```env
# Base de datos
DATABASE_URL="file:./dev.db"

# Autenticación
JWT_SECRET="tu-secreto-super-seguro-de-32-chars"

# Demo
NEXT_PUBLIC_DEMO_MODE="true"

# Opcional: Sentry
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### Archivo `.env.production` (Producción)

```env
DATABASE_URL="file:/app/data/production.db"
JWT_SECRET="${JWT_SECRET}"  # Desde secrets
NODE_ENV="production"
NEXT_PUBLIC_DEMO_MODE="true"
```

### Variables Disponibles

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `DATABASE_URL` | Sí | Ruta a SQLite |
| `JWT_SECRET` | Sí | Secreto para firmar JWT |
| `NODE_ENV` | No | development/production |
| `NEXT_PUBLIC_DEMO_MODE` | No | Habilita modo demo |
| `NEXT_PUBLIC_SENTRY_DSN` | No | DSN de Sentry |
| `ALLOW_HTTP_COOKIES` | No | Permite cookies sin HTTPS |

---

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### Error: "Database file not found"

```bash
npm run db:push
npm run db:seed
```

### Error: "SQLITE_BUSY"

Cerrar otras conexiones a la base de datos (Prisma Studio, etc.)

### Error: "JWT malformed"

Limpiar cookies del navegador y volver a hacer login.

### Error: "Too many requests" (429)

Esperar 1 minuto. Rate limiting activo.

### Cookies no funcionan en localhost

Agregar a `.env.local`:
```env
ALLOW_HTTP_COOKIES=true
```

### Build falla con errores de TypeScript

```bash
# Ver errores específicos
npx tsc --noEmit

# Los errores en archivos de test pueden ignorarse para build
npm run build  # Solo compila src/
```

### Hot reload no funciona

```bash
# Reiniciar servidor de desarrollo
npm run dev
```

---

## Convenciones de Código

### Estructura de Archivos

```
ComponentName/
├── index.tsx           # Componente principal
├── ComponentName.test.tsx
└── styles.module.css   # (si aplica)
```

### Nombrado

- **Componentes**: PascalCase (`StatCard.tsx`)
- **Hooks**: camelCase con prefix `use` (`useAuth.ts`)
- **Utilidades**: camelCase (`formatNumber.ts`)
- **Constantes**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`)

### Imports

```typescript
// 1. React/Next
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. Librerías externas
import { format } from 'date-fns';

// 3. Componentes internos
import { Button } from '@/components/ui';

// 4. Hooks/Utils
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

// 5. Types
import type { User } from '@/types';
```

### Commits

Formato: `tipo(scope): descripción`

```
feat(auth): agregar soporte para 2FA
fix(balance): corregir cálculo de totales
docs(readme): actualizar instrucciones de instalación
refactor(api): simplificar manejo de errores
test(auth): agregar tests para login
```

---

## Contacto

Para dudas técnicas sobre este proyecto, revisar:

1. Este documento
2. `docs/API.md` para endpoints
3. `docs/MANUAL_USUARIO.md` para funcionalidad
4. `.claude/context.json` para estado del proyecto

---

*Documento generado: 2026-01-23*
*Versión del proyecto: 0.1.0*
*Estado: 100% completado*
