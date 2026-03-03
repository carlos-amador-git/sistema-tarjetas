#!/bin/bash
# ============================================
# CardSystem - Deploy to Antigravity
# Script para despliegue a producción
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BLUE}CardSystem - Deploy to Antigravity${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Configuración
IMAGE_NAME="${IMAGE_NAME:-cardsystem}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"  # ej: registry.antigravity.com/cardsystem

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker no está instalado${NC}"
    exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
    echo -e "${RED}✗ Ejecutar desde la raíz del proyecto${NC}"
    exit 1
fi

# 1. Build de producción
echo -e "${BLUE}[1/5]${NC} Generando build de producción..."
npm run build

# 2. Construir imagen Docker
echo -e "${BLUE}[2/5]${NC} Construyendo imagen Docker..."
docker build \
    --build-arg NEXT_PUBLIC_APP_VERSION="${NEXT_PUBLIC_APP_VERSION:-0.1.0}" \
    -t "$IMAGE_NAME:$IMAGE_TAG" \
    .

# 3. Verificar imagen
echo -e "${BLUE}[3/5]${NC} Verificando imagen..."
IMAGE_SIZE=$(docker images "$IMAGE_NAME:$IMAGE_TAG" --format "{{.Size}}")
echo "  Tamaño: $IMAGE_SIZE"

# 4. Tag para registry (si está configurado)
if [ -n "$REGISTRY" ]; then
    echo -e "${BLUE}[4/5]${NC} Etiquetando para registry..."
    FULL_IMAGE="$REGISTRY:$IMAGE_TAG"
    docker tag "$IMAGE_NAME:$IMAGE_TAG" "$FULL_IMAGE"

    echo -e "${BLUE}[5/5]${NC} Subiendo a registry..."
    docker push "$FULL_IMAGE"

    echo ""
    echo -e "${GREEN}✓ Imagen subida: $FULL_IMAGE${NC}"
else
    echo -e "${BLUE}[4/5]${NC} Skipping registry (no configurado)"
    echo -e "${BLUE}[5/5]${NC} Skipping push"

    echo ""
    echo -e "${YELLOW}Para subir a un registry:${NC}"
    echo "  export REGISTRY=registry.antigravity.com/cardsystem"
    echo "  ./scripts/deploy-antigravity.sh"
fi

# Mostrar información
echo ""
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Build completado${NC}"
echo ""
echo "Imagen local: $IMAGE_NAME:$IMAGE_TAG"
echo "Tamaño: $IMAGE_SIZE"
echo ""
echo -e "${BLUE}Para probar localmente:${NC}"
echo "  export JWT_SECRET=\"\$(openssl rand -base64 32)\""
echo "  docker run -p 3000:3000 \\"
echo "    -e JWT_SECRET=\"\$JWT_SECRET\" \\"
echo "    -e DATABASE_URL=\"file:/app/data/production.db\" \\"
echo "    -v cardsystem_data:/app/data \\"
echo "    $IMAGE_NAME:$IMAGE_TAG"
echo ""
echo -e "${BLUE}Variables de entorno requeridas:${NC}"
echo "  JWT_SECRET     - Secreto JWT (generar con: openssl rand -base64 32)"
echo "  DATABASE_URL   - URL de la base de datos SQLite"
echo ""
echo -e "${BLUE}Variables opcionales:${NC}"
echo "  PORT                    - Puerto (default: 3000)"
echo "  NEXT_PUBLIC_SENTRY_DSN  - DSN de Sentry para monitoreo"
echo "  ADMIN_INITIAL_PASSWORD  - Contraseña inicial del admin"
echo ""
echo -e "${YELLOW}IMPORTANTE:${NC}"
echo "  1. Generar un JWT_SECRET único y seguro"
echo "  2. Usar un volumen persistente para /app/data"
echo "  3. Guardar la contraseña del admin mostrada en el primer inicio"
echo ""
