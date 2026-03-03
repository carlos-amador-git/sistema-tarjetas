# CardSystem

Sistema white-label para gestión de inventario de tarjetas bancarias. Diseñado para instituciones financieras que necesitan control de stock en múltiples ubicaciones con personalización completa de marca.

## Características

- **White-Label**: Personalizable por cliente (logo, colores, textos)
- **6 Paletas Bancarias**: Temas prediseñados para demos con clientes
- **Multi-Ubicación**: Control de stock en Almacén, Logística y Sucursales
- **Roles y Permisos**: Acceso diferenciado por área
- **2FA**: Autenticación de dos factores con TOTP
- **Forecast**: Proyecciones de demanda y alertas de stock
- **Exportación**: Excel y PDF
- **Tour Demo**: Recorrido guiado del sistema

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16, React 19, TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Estado | Zustand 5, TanStack Query 5 |
| ORM | Prisma 7 |
| Base de Datos | SQLite |
| Auth | JWT + bcrypt + speakeasy (2FA) |
| Testing | Jest (654 tests), Playwright (108 E2E) |
| Monitoreo | Sentry |

## Inicio Rápido

### Desarrollo Local

```bash
# Clonar e instalar
git clone https://github.com/MarxCha/sistema-tarjetas.git
cd sistema-tarjetas
npm install

# Configurar base de datos
npm run db:generate
npm run db:push
npm run db:seed

# Iniciar
npm run dev
```

Abrir http://localhost:3000

### Docker

```bash
# Build y ejecutar
docker-compose build app
docker-compose up -d app

# Verificar
curl http://localhost:3000/api/health
```

## Credenciales Demo

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `admin123` |
| Almacén | `tsys_user` | `tsys123` |
| Logística | `dist_user` | `dist123` |
| Sucursales | `mod_user` | `mod123` |
| Consulta | `director` | `dir123` |

## Paletas de Colores

El sistema incluye 6 temas bancarios para demos:

| Tema | Estilo | Uso |
|------|--------|-----|
| **CardSystem** | Azul corporativo | Default |
| **Rojo Bancario** | Scotiabank/HSBC | Bancos tradicionales |
| **Verde Bosque** | IXE Banco | Banca seria |
| **Verde Fresco** | Falabella | Retail financiero |
| **Púrpura Premium** | NuBank | Fintech |
| **Naranja Dinámico** | ING/BanCoppel | Banca digital |

Cambiar tema desde el selector en el sidebar (modo demo).

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/dashboard` | KPIs y resumen |
| Balance | `/balance` | Inventario actual |
| Forecast | `/forecast` | Proyecciones |
| Captura Almacén | `/capturas/almacen` | Stock central |
| Captura Logística | `/capturas/logistica` | En tránsito |
| Captura Sucursales | `/capturas/sucursales` | Puntos de venta |
| Órdenes | `/ordenes` | Compras |
| Productos | `/productos` | Catálogo |
| Usuarios | `/usuarios` | Administración |
| Historial | `/historial` | Movimientos |

## Roles y Permisos

| Rol | Área | Acceso |
|-----|------|--------|
| `admin` | Administración | Todos los módulos |
| `almacen` | Almacén Central | Dashboard, Balance, Captura Almacén |
| `logistica` | Distribución | Dashboard, Balance, Captura Logística |
| `sucursales` | Puntos de Venta | Dashboard, Balance, Captura Sucursales |
| `consulta` | Dirección | Solo lectura (Dashboard, Balance, Forecast, Historial) |

## Variables de Entorno

```env
# Requeridas
DATABASE_URL=file:./dev.db
JWT_SECRET=<openssl rand -base64 32>

# Opcionales
NODE_ENV=production
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SENTRY_DSN=<tu-dsn>
ALLOW_HTTP_COOKIES=true  # Solo desarrollo
```

## Estructura del Proyecto

```
src/
├── app/                    # App Router (páginas)
│   ├── (auth)/login/       # Autenticación
│   ├── (dashboard)/        # Módulos del sistema
│   └── api/                # API Routes
├── components/             # Componentes React
├── config/
│   ├── tenants/            # Configuración multi-tenant
│   └── colorPalettes.ts    # Paletas de colores
├── hooks/                  # Custom hooks
├── lib/
│   ├── auth/               # JWT, bcrypt, 2FA
│   └── security/           # Rate limiting, CSRF
├── stores/                 # Zustand stores
└── types/                  # TypeScript types

prisma/
├── schema.prisma           # Modelos de datos
└── seed.ts                 # Datos iniciales
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/session` - Sesión actual
- `POST /api/auth/2fa/*` - Operaciones 2FA

### Recursos
- `GET/POST /api/productos` - Catálogo
- `GET/PUT /api/balance` - Inventario
- `GET/POST /api/historial` - Movimientos
- `GET/POST/PUT/DELETE /api/ordenes` - Órdenes

### Sistema
- `GET /api/health` - Estado del sistema
- `GET /api/metrics` - Métricas (admin)

## Scripts

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Iniciar producción
npm run test         # Tests unitarios
npm run test:e2e     # Tests E2E
npm run db:studio    # Prisma Studio
```

## Despliegue

Ver [docs/DEPLOY.md](docs/DEPLOY.md) para instrucciones detalladas de:
- Docker con docker-compose
- Configuración de producción
- Backup de base de datos

## Tests

```bash
# Unitarios (654 tests)
npm test

# E2E (108 tests en 4 browsers)
npm run test:e2e

# Coverage
npm run test:coverage
```

## Licencia

Propiedad privada - Todos los derechos reservados.
