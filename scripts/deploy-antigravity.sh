#!/bin/bash

# ============================================
# CardSystem - Deploy to Antigravity
# Script específico para despliegue rápido
# ============================================

set -e

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}  ${BLUE}CardSystem - Deploy to Antigravity${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Configuración (editar según necesidad)
IMAGE_NAME="${IMAGE_NAME:-cardsystem-nextjs}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
REGISTRY="${REGISTRY:-}"  # ej: registry.antigravity.com/tu-proyecto

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker no está instalado${NC}"
    exit 1
fi

# 1. Build de producción
echo -e "${BLUE}[1/4]${NC} Generando build de producción..."
npm run build

# 2. Construir imagen Docker
echo -e "${BLUE}[2/4]${NC} Construyendo imagen Docker..."
docker build \
    --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000/api}" \
    -t "$IMAGE_NAME:$IMAGE_TAG" \
    .

# 3. Tag para registry (si está configurado)
if [ -n "$REGISTRY" ]; then
    echo -e "${BLUE}[3/4]${NC} Etiquetando para registry..."
    FULL_IMAGE="$REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
    docker tag "$IMAGE_NAME:$IMAGE_TAG" "$FULL_IMAGE"

    echo -e "${BLUE}[4/4]${NC} Subiendo a registry..."
    docker push "$FULL_IMAGE"

    echo ""
    echo -e "${GREEN}✓ Imagen subida: $FULL_IMAGE${NC}"
else
    echo -e "${BLUE}[3/4]${NC} Skipping registry (no configurado)"
    echo -e "${BLUE}[4/4]${NC} Skipping push"

    echo ""
    echo -e "${YELLOW}Para subir a un registry, configura:${NC}"
    echo "  export REGISTRY=registry.antigravity.com/tu-proyecto"
    echo "  ./scripts/deploy-antigravity.sh"
fi

# Mostrar información
echo ""
echo -e "${CYAN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Build completado${NC}"
echo ""
echo "Imagen local: $IMAGE_NAME:$IMAGE_TAG"
echo "Tamaño: $(docker images "$IMAGE_NAME:$IMAGE_TAG" --format "{{.Size}}")"
echo ""
echo -e "${BLUE}Para probar localmente:${NC}"
echo "  docker run -p 3000:3000 $IMAGE_NAME:$IMAGE_TAG"
echo ""
echo -e "${BLUE}Variables de entorno para Antigravity:${NC}"
echo "  PORT=3000"
echo "  HOSTNAME=0.0.0.0"
echo "  NEXT_PUBLIC_API_URL=https://api.tu-dominio.com"
echo "  NEXT_PUBLIC_DEMO_MODE=false"
echo ""
