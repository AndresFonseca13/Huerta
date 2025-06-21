#!/bin/bash

# Script de deployment para Proyecto Huerta
# Uso: ./scripts/deploy.sh [backend|frontend|all]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para deploy del backend
deploy_backend() {
    print_message "Iniciando deployment del backend..."
    
    cd backend
    
    # Instalar dependencias
    print_message "Instalando dependencias del backend..."
    npm install --production
    
    # Verificar variables de entorno
    if [ ! -f .env ]; then
        print_error "Archivo .env no encontrado en backend/"
        exit 1
    fi
    
    # Build del proyecto (si es necesario)
    if [ -f package.json ] && grep -q "\"build\"" package.json; then
        print_message "Ejecutando build del backend..."
        npm run build
    fi
    
    print_message "Backend deployado exitosamente!"
    cd ..
}

# Función para deploy del frontend
deploy_frontend() {
    print_message "Iniciando deployment del frontend..."
    
    cd frontend
    
    # Instalar dependencias
    print_message "Instalando dependencias del frontend..."
    npm install
    
    # Build del proyecto
    print_message "Ejecutando build del frontend..."
    npm run build
    
    print_message "Frontend deployado exitosamente!"
    cd ..
}

# Función para deploy completo
deploy_all() {
    print_message "Iniciando deployment completo..."
    deploy_backend
    deploy_frontend
    print_message "Deployment completo finalizado!"
}

# Verificar argumentos
case "${1:-all}" in
    "backend")
        deploy_backend
        ;;
    "frontend")
        deploy_frontend
        ;;
    "all")
        deploy_all
        ;;
    *)
        print_error "Uso: $0 [backend|frontend|all]"
        print_error "  backend  - Deploy solo del backend"
        print_error "  frontend - Deploy solo del frontend"
        print_error "  all      - Deploy completo (por defecto)"
        exit 1
        ;;
esac

print_message "Deployment completado exitosamente!" 