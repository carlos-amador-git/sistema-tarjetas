# CardSystem - Sistema de Inventario de Tarjetas

Sistema white-label para gestión de inventario de tarjetas bancarias y productos relacionados. Diseñado para ser personalizable y desplegable para múltiples instituciones financieras.

## Características

- **Multi-Tenant**: Soporte para múltiples clientes desde una única instalación
- **White-Label**: Completamente personalizable (logo, colores, textos)
- **TypeScript**: Tipado estático para mejor mantenibilidad
- **Tailwind CSS**: Estilos modernos y responsivos
- **App Router**: Estructura moderna de Next.js
- **Gestión de Inventario**: Control de stock en múltiples ubicaciones
- **Pronóstico (Forecast)**: Proyecciones de demanda y alertas
- **Órdenes de Compra**: Gestión del ciclo de adquisiciones
- **Control por Roles**: Acceso diferenciado según área y permisos
- **Exportación**: Soporte para Excel y PDF
- **Autenticación**: Sistema completo con soporte para login facial

## Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Backend**: Python (FastAPI) con SQLite
- **Autenticación**: JWT con soporte para Face ID

## Requisitos

- Node.js 18+
- npm o yarn
- Python 3.9+ (para el backend)

## Instalación

### Frontend (Next.js)

```bash
cd sistema-tarjetas-nextjs
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

El API estará disponible en `http://localhost:8000`

## Estructura del Proyecto

```
sistema-tarjetas-nextjs/
├── src/
│   ├── app/                    # App Router (páginas)
│   │   ├── (auth)/             # Grupo de rutas de autenticación
│   │   │   └── login/
│   │   ├── (dashboard)/        # Grupo de rutas del dashboard
│   │   │   ├── dashboard/
│   │   │   ├── balance/
│   │   │   ├── forecast/
│   │   │   ├── capturas/
│   │   │   ├── ordenes/
│   │   │   ├── productos/
│   │   │   ├── usuarios/
│   │   │   └── historial/
│   │   └── globals.css
│   ├── components/             # Componentes React
│   ├── config/                 # Configuración
│   │   ├── tenants/            # Configuraciones multi-tenant
│   │   ├── branding.ts
│   │   ├── modules.ts
│   │   └── roles.ts
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilidades y servicios
│   └── types/                  # TypeScript types
├── public/
│   ├── images/
│   └── tenants/                # Assets por cliente
├── docs/                       # Documentación
└── middleware.ts               # Middleware Next.js (multi-tenant)
```

## Configuración

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# URL del backend Python
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Personalización de Marca

Editar `src/config/branding.ts`:

```typescript
const BRANDING = {
  companyName: 'Mi',
  companySubtitle: 'Empresa',
  systemName: 'Control de Tarjetas',
  // ...
};
```

### Multi-Tenant

Ver [docs/MULTI_TENANT.md](docs/MULTI_TENANT.md) para configuración detallada de múltiples clientes.

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Dashboard | `/dashboard` | Vista general y estadísticas |
| Balance | `/balance` | Estado actual del inventario |
| Forecast | `/forecast` | Proyecciones y alertas |
| Captura Almacén | `/capturas/almacen` | Registro inventario central |
| Captura Logística | `/capturas/logistica` | Registro en distribución |
| Captura Sucursales | `/capturas/sucursales` | Registro en puntos de venta |
| Órdenes | `/ordenes` | Gestión de compras |
| Productos | `/productos` | Catálogo de productos |
| Usuarios | `/usuarios` | Administración de usuarios |
| Historial | `/historial` | Log de movimientos |

## Roles de Usuario

| Rol | Área | Acceso |
|-----|------|--------|
| `admin` | Administración | Todos los módulos |
| `almacen` / `tsys` | Almacén Central | Dashboard, Balance, Captura Almacén |
| `logistica` / `distribucion` | Distribución | Dashboard, Balance, Captura Logística |
| `sucursales` / `modulos` | Puntos de Venta | Dashboard, Balance, Captura Sucursales |
| `consulta` | Dirección | Dashboard, Balance, Forecast, Historial |

## Credenciales de Demo

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador |
| tsys_user | tsys123 | Almacén Central |
| dist_user | dist123 | Logística |
| mod_user | mod123 | Sucursales |
| director | dir123 | Consulta |

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

## Despliegue

### Vercel (Recomendado)

1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

### Docker

```bash
docker build -t cardsystem .
docker run -p 3000:3000 cardsystem
```

### Tradicional

```bash
npm run build
npm start
```

## API Endpoints

El backend expone los siguientes endpoints principales:

- `POST /api/auth/login` - Autenticación
- `GET /api/auth/me` - Usuario actual
- `GET /api/inventario` - Inventario por producto
- `POST /api/capturas` - Registrar captura
- `GET /api/productos` - Catálogo de productos
- `GET /api/ordenes` - Órdenes de compra
- `GET /api/usuarios` - Lista de usuarios

Ver documentación completa en `http://localhost:8000/docs`

## Licencia

Propiedad privada - CardSystem. Todos los derechos reservados.

## Soporte

Para soporte técnico, contactar al equipo de desarrollo.
