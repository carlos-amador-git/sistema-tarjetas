#!/bin/sh
# =============================================================================
# Docker Entrypoint - CardSystem
# =============================================================================
# 1. Verifica configuración
# 2. Inicializa base de datos si es necesario (copia template)
# 3. Inicia la aplicación
# =============================================================================

set -e

echo "============================================="
echo "  CardSystem - Starting..."
echo "============================================="

# Verificar que DATABASE_URL está configurado
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL not set, using default"
  export DATABASE_URL="file:/app/data/production.db"
fi

echo "Database: $DATABASE_URL"
echo "Environment: ${NODE_ENV:-production}"
echo ""

# Verificar JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
  echo "ERROR: JWT_SECRET is required"
  exit 1
fi

# Verificar que el directorio de datos existe
if [ ! -d "/app/data" ]; then
  echo "Creating data directory..."
  mkdir -p /app/data 2>/dev/null || true
fi

# -----------------------------------------------------------------------------
# Inicializar base de datos SQLite si no existe
# -----------------------------------------------------------------------------
DB_FILE="/app/data/production.db"

if [ ! -f "$DB_FILE" ]; then
  echo "[DB] Database not found, initializing from template..."

  if [ -f "./template.db" ]; then
    cp ./template.db "$DB_FILE"
    echo "[DB] Database initialized successfully"
    echo ""
    echo "  NOTE: No users exist yet. Create admin user by running:"
    echo "  docker exec -it <container> node -e \"...\""
    echo "  Or access the app and follow setup instructions."
  else
    echo "[DB] WARNING: Template database not found!"
    echo "[DB] The application may not work correctly."
  fi
else
  echo "[DB] Database exists at $DB_FILE"
fi

echo ""
echo "============================================="
echo "  CardSystem is ready!"
echo "  Port: ${PORT:-3000}"
echo "============================================="
echo ""

# Ejecutar el comando pasado (node server.js)
exec "$@"
