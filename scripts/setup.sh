#!/bin/bash

# ============================================
# CardSystem Next.js - Script de Configuración
# Para despliegue en Antigravity
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funciones de utilidad
print_header() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}  ${BLUE}$1${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

# Banner
show_banner() {
    echo ""
    echo -e "${CYAN}   ____              _ ____            _                   ${NC}"
    echo -e "${CYAN}  / ___|__ _ _ __ __| / ___| _   _ ___| |_ ___ _ __ ___   ${NC}"
    echo -e "${CYAN} | |   / _\` | '__/ _\` \\___ \\| | | / __| __/ _ \\ '_ \` _ \\ ${NC}"
    echo -e "${CYAN} | |__| (_| | | | (_| |___) | |_| \\__ \\ ||  __/ | | | | | ${NC}"
    echo -e "${CYAN}  \\____\\__,_|_|  \\__,_|____/ \\__, |___/\\__\\___|_| |_| |_| ${NC}"
    echo -e "${CYAN}                             |___/                         ${NC}"
    echo -e "${BLUE}  Sistema de Inventario de Tarjetas - Next.js${NC}"
    echo ""
}

# Verificar directorio
check_directory() {
    if [ ! -f "package.json" ]; then
        print_error "No se encontró package.json"
        print_info "Ejecuta este script desde la raíz del proyecto"
        exit 1
    fi

    if ! grep -q '"next"' package.json; then
        print_error "Este no parece ser un proyecto Next.js"
        exit 1
    fi
}

# Verificar requisitos
check_requirements() {
    print_header "Verificando Requisitos"

    # Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js $NODE_VERSION"
        else
            print_warning "Node.js $NODE_VERSION (se recomienda v18+)"
        fi
    else
        print_error "Node.js no instalado"
        print_info "Instala desde: https://nodejs.org/"
        exit 1
    fi

    # npm
    if command -v npm &> /dev/null; then
        print_success "npm $(npm -v)"
    else
        print_error "npm no instalado"
        exit 1
    fi

    # Docker (opcional)
    if command -v docker &> /dev/null; then
        print_success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
    else
        print_warning "Docker no instalado (opcional para contenedores)"
    fi
}

# Instalar dependencias
install_dependencies() {
    print_header "Instalando Dependencias"

    if [ -d "node_modules" ]; then
        print_info "node_modules encontrado"
        read -p "¿Reinstalar dependencias? (s/N): " REINSTALL
        if [[ $REINSTALL =~ ^[Ss]$ ]]; then
            rm -rf node_modules .next
            npm ci
        fi
    else
        npm ci
    fi

    print_success "Dependencias instaladas"
}

# Configurar entorno
setup_environment() {
    print_header "Configurando Entorno"

    # Determinar entorno
    echo ""
    echo "Selecciona el entorno:"
    echo "  1) Desarrollo (con credenciales demo)"
    echo "  2) Producción (sin credenciales demo)"
    echo ""
    read -p "Opción [1]: " ENV_CHOICE
    ENV_CHOICE=${ENV_CHOICE:-1}

    if [ "$ENV_CHOICE" == "2" ]; then
        DEMO_MODE="false"
        ENV_FILE=".env.production.local"
    else
        DEMO_MODE="true"
        ENV_FILE=".env.local"
    fi

    # URL del API
    echo ""
    read -p "URL del Backend API [http://localhost:8000/api]: " API_URL
    API_URL=${API_URL:-http://localhost:8000/api}

    # Crear archivo de entorno
    cat > $ENV_FILE << EOF
# CardSystem - Variables de Entorno
# Generado: $(date)
# Entorno: $([ "$DEMO_MODE" == "true" ] && echo "Desarrollo" || echo "Producción")

# Backend API
NEXT_PUBLIC_API_URL=$API_URL

# Modo Demo
NEXT_PUBLIC_DEMO_MODE=$DEMO_MODE
EOF

    if [ "$DEMO_MODE" == "true" ]; then
        cat >> $ENV_FILE << EOF

# Credenciales Demo (SOLO DESARROLLO)
NEXT_PUBLIC_DEMO_ADMIN_USER=admin
NEXT_PUBLIC_DEMO_ADMIN_PASS=admin123
NEXT_PUBLIC_DEMO_ADMIN_LABEL=Admin

NEXT_PUBLIC_DEMO_ALMACEN_USER=tsys_user
NEXT_PUBLIC_DEMO_ALMACEN_PASS=tsys123
NEXT_PUBLIC_DEMO_ALMACEN_LABEL=Almacén Central

NEXT_PUBLIC_DEMO_LOGISTICA_USER=dist_user
NEXT_PUBLIC_DEMO_LOGISTICA_PASS=dist123
NEXT_PUBLIC_DEMO_LOGISTICA_LABEL=Logística

NEXT_PUBLIC_DEMO_SUCURSALES_USER=mod_user
NEXT_PUBLIC_DEMO_SUCURSALES_PASS=mod123
NEXT_PUBLIC_DEMO_SUCURSALES_LABEL=Sucursales

NEXT_PUBLIC_DEMO_CONSULTA_USER=director
NEXT_PUBLIC_DEMO_CONSULTA_PASS=dir123
NEXT_PUBLIC_DEMO_CONSULTA_LABEL=Consulta
EOF
    fi

    print_success "Archivo $ENV_FILE creado"
}

# Build de producción
build_production() {
    print_header "Generando Build de Producción"

    # Limpiar builds anteriores
    rm -rf .next

    # Build
    npm run build

    if [ -d ".next" ]; then
        print_success "Build completado"

        # Mostrar tamaño
        if [ -d ".next/standalone" ]; then
            SIZE=$(du -sh .next/standalone | cut -f1)
            print_info "Tamaño standalone: $SIZE"
        fi
    else
        print_error "Error en el build"
        exit 1
    fi
}

# Build Docker
build_docker() {
    print_header "Construyendo Imagen Docker"

    read -p "Nombre de la imagen [cardsystem-nextjs]: " IMAGE_NAME
    IMAGE_NAME=${IMAGE_NAME:-cardsystem-nextjs}

    read -p "Tag [latest]: " IMAGE_TAG
    IMAGE_TAG=${IMAGE_TAG:-latest}

    # Build con variables de entorno
    docker build \
        --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000/api}" \
        -t "$IMAGE_NAME:$IMAGE_TAG" \
        .

    if [ $? -eq 0 ]; then
        print_success "Imagen creada: $IMAGE_NAME:$IMAGE_TAG"

        # Mostrar tamaño
        SIZE=$(docker images "$IMAGE_NAME:$IMAGE_TAG" --format "{{.Size}}")
        print_info "Tamaño de imagen: $SIZE"
    else
        print_error "Error construyendo imagen"
        exit 1
    fi
}

# Iniciar desarrollo
start_dev() {
    print_header "Iniciando Servidor de Desarrollo"

    print_info "URL: http://localhost:3000"
    print_info "Presiona Ctrl+C para detener"
    echo ""

    npm run dev
}

# Iniciar producción
start_production() {
    print_header "Iniciando Servidor de Producción"

    if [ ! -d ".next" ]; then
        print_warning "No hay build. Generando..."
        build_production
    fi

    print_info "URL: http://localhost:3000"
    print_info "Presiona Ctrl+C para detener"
    echo ""

    npm run start
}

# Desplegar en Antigravity
deploy_antigravity() {
    print_header "Preparar para Antigravity"

    echo ""
    echo "Opciones de despliegue en Antigravity:"
    echo ""
    echo "  1) Docker (recomendado)"
    echo "  2) Node.js standalone"
    echo ""
    read -p "Opción [1]: " DEPLOY_OPTION
    DEPLOY_OPTION=${DEPLOY_OPTION:-1}

    case $DEPLOY_OPTION in
        1)
            echo ""
            print_info "Para desplegar con Docker en Antigravity:"
            echo ""
            echo "  1. Construye la imagen:"
            echo "     ${CYAN}docker build -t cardsystem-nextjs .${NC}"
            echo ""
            echo "  2. Sube a tu registry:"
            echo "     ${CYAN}docker tag cardsystem-nextjs registry.antigravity.com/tu-proyecto/cardsystem${NC}"
            echo "     ${CYAN}docker push registry.antigravity.com/tu-proyecto/cardsystem${NC}"
            echo ""
            echo "  3. En Antigravity, configura:"
            echo "     - Imagen: registry.antigravity.com/tu-proyecto/cardsystem"
            echo "     - Puerto: 3000"
            echo "     - Variables de entorno:"
            echo "       NEXT_PUBLIC_API_URL=https://api.tudominio.com"
            echo "       NEXT_PUBLIC_DEMO_MODE=false"
            echo ""

            read -p "¿Construir imagen ahora? (s/N): " BUILD_NOW
            if [[ $BUILD_NOW =~ ^[Ss]$ ]]; then
                build_docker
            fi
            ;;
        2)
            echo ""
            print_info "Para desplegar standalone en Antigravity:"
            echo ""
            echo "  1. Genera el build:"
            echo "     ${CYAN}npm run build${NC}"
            echo ""
            echo "  2. Sube la carpeta .next/standalone a Antigravity"
            echo ""
            echo "  3. Configura el comando de inicio:"
            echo "     ${CYAN}node server.js${NC}"
            echo ""
            echo "  4. Variables de entorno necesarias:"
            echo "     PORT=3000"
            echo "     HOSTNAME=0.0.0.0"
            echo "     NEXT_PUBLIC_API_URL=https://api.tudominio.com"
            echo ""

            read -p "¿Generar build ahora? (s/N): " BUILD_NOW
            if [[ $BUILD_NOW =~ ^[Ss]$ ]]; then
                build_production
            fi
            ;;
    esac
}

# Tests
run_tests() {
    print_header "Ejecutando Tests"

    echo "Selecciona tipo de test:"
    echo "  1) Unit tests (Jest)"
    echo "  2) E2E tests (Playwright)"
    echo "  3) Todos"
    echo ""
    read -p "Opción [1]: " TEST_OPTION

    case $TEST_OPTION in
        2)
            npm run e2e
            ;;
        3)
            npm test
            npm run e2e
            ;;
        *)
            npm test
            ;;
    esac
}

# Menú principal
show_menu() {
    show_banner

    echo "Selecciona una opción:"
    echo ""
    echo "  ${GREEN}1)${NC} Instalación completa"
    echo "  ${GREEN}2)${NC} Solo instalar dependencias"
    echo "  ${GREEN}3)${NC} Configurar variables de entorno"
    echo "  ${GREEN}4)${NC} Iniciar desarrollo"
    echo "  ${GREEN}5)${NC} Build de producción"
    echo "  ${GREEN}6)${NC} Iniciar producción"
    echo "  ${GREEN}7)${NC} Build imagen Docker"
    echo "  ${GREEN}8)${NC} Desplegar en Antigravity"
    echo "  ${GREEN}9)${NC} Ejecutar tests"
    echo "  ${GREEN}0)${NC} Salir"
    echo ""
    read -p "Opción: " OPTION

    case $OPTION in
        1)
            check_requirements
            install_dependencies
            setup_environment
            print_header "¡Instalación Completa!"
            print_success "Ejecuta: npm run dev (desarrollo)"
            print_success "Ejecuta: npm run build && npm start (producción)"
            ;;
        2) install_dependencies ;;
        3) setup_environment ;;
        4) start_dev ;;
        5) build_production ;;
        6) start_production ;;
        7) build_docker ;;
        8) deploy_antigravity ;;
        9) run_tests ;;
        0)
            print_info "¡Hasta luego!"
            exit 0
            ;;
        *)
            print_error "Opción no válida"
            ;;
    esac

    echo ""
    read -p "Presiona Enter para continuar..."
    show_menu
}

# Verificar directorio
check_directory

# Argumentos
case "$1" in
    --install|-i)
        check_requirements
        install_dependencies
        setup_environment
        ;;
    --dev|-d)
        start_dev
        ;;
    --build|-b)
        build_production
        ;;
    --start|-s)
        start_production
        ;;
    --docker)
        build_docker
        ;;
    --deploy)
        deploy_antigravity
        ;;
    --test|-t)
        run_tests
        ;;
    --help|-h)
        show_banner
        echo "Uso: ./scripts/setup.sh [opción]"
        echo ""
        echo "Opciones:"
        echo "  --install, -i    Instalación completa"
        echo "  --dev, -d        Iniciar desarrollo"
        echo "  --build, -b      Build de producción"
        echo "  --start, -s      Iniciar producción"
        echo "  --docker         Construir imagen Docker"
        echo "  --deploy         Preparar para Antigravity"
        echo "  --test, -t       Ejecutar tests"
        echo "  --help, -h       Mostrar ayuda"
        echo ""
        echo "Sin argumentos: Menú interactivo"
        ;;
    *)
        show_menu
        ;;
esac
