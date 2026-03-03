# CardSystem - Guía de Despliegue en Antigravity

## Resumen Rápido

```bash
# 1. Dar permisos
chmod +x scripts/*.sh

# 2. Ejecutar script interactivo
./scripts/setup.sh

# O directamente:
./scripts/deploy-antigravity.sh
```

---

## Requisitos

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **Docker** (para contenedores)
- Cuenta en **Antigravity**

---

## Opción 1: Despliegue con Docker (Recomendado)

### Paso 1: Construir imagen

```bash
# Desde la raíz del proyecto
docker build -t cardsystem-nextjs .
```

### Paso 2: Probar localmente

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:8000/api \
  -e NEXT_PUBLIC_DEMO_MODE=false \
  cardsystem-nextjs
```

Abrir: http://localhost:3000

### Paso 3: Subir a Registry

```bash
# Etiquetar
docker tag cardsystem-nextjs registry.antigravity.com/tu-proyecto/cardsystem:latest

# Subir
docker push registry.antigravity.com/tu-proyecto/cardsystem:latest
```

### Paso 4: Configurar en Antigravity

En el dashboard de Antigravity:

| Campo | Valor |
|-------|-------|
| **Imagen** | `registry.antigravity.com/tu-proyecto/cardsystem:latest` |
| **Puerto** | `3000` |
| **Replicas** | `1` (o más para alta disponibilidad) |

**Variables de entorno:**

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `PORT` | `3000` | Puerto interno |
| `HOSTNAME` | `0.0.0.0` | Bind address |
| `NEXT_PUBLIC_API_URL` | `https://api.tu-dominio.com` | URL del backend |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Desactivar demo |

---

## Opción 2: Despliegue Standalone

### Paso 1: Build

```bash
npm ci
npm run build
```

### Paso 2: Preparar archivos

Subir a Antigravity:
- Carpeta `.next/standalone/` completa
- Carpeta `.next/static/` → a `.next/static/` en el servidor
- Carpeta `public/` → a `public/` en el servidor

### Paso 3: Configurar inicio

**Comando de inicio:**
```bash
node server.js
```

**Variables de entorno:**
```
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com
```

---

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `./scripts/setup.sh` | Menú interactivo completo |
| `./scripts/setup.sh --install` | Instalación completa |
| `./scripts/setup.sh --dev` | Iniciar desarrollo |
| `./scripts/setup.sh --build` | Build producción |
| `./scripts/setup.sh --docker` | Construir imagen Docker |
| `./scripts/deploy-antigravity.sh` | Deploy directo a Antigravity |

---

## Variables de Entorno

### Desarrollo (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_DEMO_MODE=true

# Credenciales demo
NEXT_PUBLIC_DEMO_ADMIN_USER=admin
NEXT_PUBLIC_DEMO_ADMIN_PASS=admin123
# ... etc
```

### Producción

```env
NEXT_PUBLIC_API_URL=https://api.produccion.com
NEXT_PUBLIC_DEMO_MODE=false
```

**IMPORTANTE:** En producción, `NEXT_PUBLIC_DEMO_MODE=false` oculta todos los botones de login rápido y credenciales demo.

---

## Healthcheck

El contenedor incluye healthcheck automático:

```bash
# Verificar manualmente
curl http://localhost:3000/
```

---

## Troubleshooting

### Error: "Cannot find module 'server.js'"

El build no generó output standalone. Verificar en `next.config.ts`:

```typescript
output: 'standalone',
```

### Error: Puerto en uso

```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# O cambiar puerto
docker run -p 3001:3000 cardsystem-nextjs
```

### Build falla con memoria

```bash
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

### API no conecta

1. Verificar que `NEXT_PUBLIC_API_URL` apunta al backend correcto
2. Verificar CORS en el backend incluye el dominio del frontend
3. Probar conectividad:
   ```bash
   curl $NEXT_PUBLIC_API_URL/health
   ```

---

## Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────┐
│                    Antigravity                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐        ┌─────────────────────┐    │
│  │   Frontend  │        │      Backend        │    │
│  │  (Next.js)  │───────▶│     (Python)        │    │
│  │  Port 3000  │        │     Port 8000       │    │
│  └─────────────┘        └─────────────────────┘    │
│         │                        │                  │
│         │                        │                  │
│         ▼                        ▼                  │
│  ┌─────────────┐        ┌─────────────────────┐    │
│  │   Nginx/    │        │      SQLite/        │    │
│  │  Traefik    │        │     PostgreSQL      │    │
│  └─────────────┘        └─────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Soporte

- Revisar logs en Antigravity dashboard
- Verificar variables de entorno
- Probar localmente con Docker antes de deploy

---

© 2025 CardSystem
