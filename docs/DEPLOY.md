# Guía de Despliegue - CardSystem

> Última actualización: 2026-01-22

## Requisitos Previos

- Docker 20.10+
- Acceso a un registry Docker (opcional)
- Secreto JWT generado
- Volumen persistente para datos

## Variables de Entorno

### Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `JWT_SECRET` | Secreto para tokens JWT (mín. 32 caracteres) | `openssl rand -base64 32` |
| `DATABASE_URL` | URL de la base de datos SQLite | `file:/app/data/production.db` |

### Opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto de la aplicación | `3000` |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN de Sentry para monitoreo | - |
| `ADMIN_INITIAL_PASSWORD` | Contraseña inicial del admin | Auto-generada |

## Despliegue Rápido

### 1. Generar secretos

```bash
# Generar JWT_SECRET seguro
export JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET: $JWT_SECRET"

# Guardar en lugar seguro
```

### 2. Con Docker Compose (Recomendado)

```bash
# Clonar repositorio
git clone <repo-url> cardsystem
cd cardsystem

# Configurar variables
export JWT_SECRET="tu-secreto-seguro-de-32-caracteres"

# Iniciar
docker-compose up -d app

# Ver logs
docker-compose logs -f app
```

### 3. Con Docker Run

```bash
# Crear volumen para datos
docker volume create cardsystem_data

# Ejecutar
docker run -d \
  --name cardsystem \
  -p 3000:3000 \
  -e JWT_SECRET="$JWT_SECRET" \
  -e DATABASE_URL="file:/app/data/production.db" \
  -v cardsystem_data:/app/data \
  --restart unless-stopped \
  cardsystem:latest
```

## Construcción de Imagen

### Build local

```bash
# Build estándar
docker build -t cardsystem:latest .

# Build con versión
docker build \
  --build-arg NEXT_PUBLIC_APP_VERSION="1.0.0" \
  -t cardsystem:1.0.0 .
```

### Push a Registry

```bash
# Tag para registry
docker tag cardsystem:latest registry.ejemplo.com/cardsystem:latest

# Push
docker push registry.ejemplo.com/cardsystem:latest
```

### Script automatizado

```bash
# Usar script de deploy
export REGISTRY=registry.ejemplo.com/cardsystem
./scripts/deploy-antigravity.sh
```

## Primer Inicio

Al iniciar por primera vez, el sistema:

1. **Inicializa la base de datos** - Crea el schema SQLite automáticamente
2. **Requiere crear usuario admin** - Ver sección siguiente

### Crear usuario administrador

La base de datos se inicializa automáticamente desde una plantilla con el schema ya aplicado. Para crear el usuario admin:

```bash
# Opción 1: Ejecutar seed desde el host (recomendado)
# Primero, copiar la BD del contenedor
docker cp $(docker-compose ps -q app):/app/data/production.db ./production.db

# Ejecutar seed
DATABASE_URL="file:./production.db" npm run db:seed:prod

# Copiar BD de vuelta al contenedor
docker cp ./production.db $(docker-compose ps -q app):/app/data/production.db

# Opción 2: Crear admin manualmente con SQL
docker exec -it cardsystem sqlite3 /app/data/production.db \
  "INSERT INTO User (username, email, password, nombre, rol, area, activo, updatedAt)
   VALUES ('admin', 'admin@example.com', '\$2b\$12\$...hash...', 'Admin', 'Administrador', 'Sistemas', 1, datetime('now'));"
```

**IMPORTANTE**: Observa los logs para ver la contraseña del admin:

```
=============================================
  ADMIN USER CREATED SUCCESSFULLY
=============================================

  Username: admin
  Password: Abc123!@#XyZ789

  IMPORTANT: Save this password and change it
  after your first login!
=============================================
```

## Verificación

### Health Check

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-22T12:00:00.000Z",
  "version": "0.1.0"
}
```

### Métricas (requiere autenticación admin)

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/metrics
```

## Backup y Restore

### Backup de la base de datos

```bash
# Crear backup
docker cp $(docker-compose ps -q app):/app/data/production.db ./backup-$(date +%Y%m%d).db

# O usando volumen
docker run --rm \
  -v cardsystem_data:/data \
  -v $(pwd):/backup \
  alpine cp /data/production.db /backup/backup.db
```

### Restore

```bash
# Detener aplicación
docker-compose stop app

# Restaurar
docker cp ./backup.db $(docker-compose ps -q app):/app/data/production.db

# Reiniciar
docker-compose start app
```

## Actualización

### Con Docker Compose

```bash
# Pull nueva imagen
docker-compose pull app

# Recrear contenedor
docker-compose up -d app
```

### Manual

```bash
# Detener
docker stop cardsystem

# Remover contenedor (datos persisten en volumen)
docker rm cardsystem

# Pull nueva imagen
docker pull cardsystem:latest

# Iniciar con nueva imagen
docker run -d \
  --name cardsystem \
  -p 3000:3000 \
  -e JWT_SECRET="$JWT_SECRET" \
  -e DATABASE_URL="file:/app/data/production.db" \
  -v cardsystem_data:/app/data \
  --restart unless-stopped \
  cardsystem:latest
```

## Troubleshooting

### Container no inicia

```bash
# Ver logs completos
docker-compose logs --tail=100 app

# Verificar estado
docker-compose ps -a
```

### Error de base de datos

```bash
# Verificar que el volumen existe
docker volume ls | grep cardsystem

# Verificar permisos
docker exec cardsystem ls -la /app/data/
```

### Puerto en uso

```bash
# Cambiar puerto
PORT=3001 docker-compose up -d app

# O en docker run
docker run -p 3001:3000 ...
```

### Reset completo (DESTRUCTIVO)

```bash
# Detener y eliminar todo
docker-compose down -v

# Reiniciar desde cero
docker-compose up -d app
```

## Arquitectura de Producción

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (Nginx/HAProxy)│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼───────┐┌─────▼─────┐┌───────▼───────┐
      │  CardSystem   ││ CardSystem ││  CardSystem   │
      │   Container 1 ││ Container 2││   Container N │
      └───────┬───────┘└─────┬─────┘└───────┬───────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Shared Volume  │
                    │   (SQLite DB)   │
                    └─────────────────┘
```

> **Nota**: Para alta disponibilidad, considerar migrar a PostgreSQL.

## Checklist de Deploy

- [ ] JWT_SECRET generado y guardado de forma segura
- [ ] Volumen de datos creado
- [ ] Variables de entorno configuradas
- [ ] Build exitoso de imagen Docker
- [ ] Container iniciado sin errores
- [ ] Health check respondiendo
- [ ] Contraseña de admin guardada
- [ ] Primer login exitoso
- [ ] Backup configurado
- [ ] Monitoreo activo (Sentry)
