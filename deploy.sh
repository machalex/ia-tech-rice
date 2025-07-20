#!/bin/bash

# Script de déploiement simple pour RICE Tool
# Usage: ./deploy.sh [domaine]

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Configuration
DOMAIN=${1:-localhost}
BUILD_DIR="build"

print_info "Déploiement de RICE Tool pour: $DOMAIN"

# Build de l'application
print_info "Build de l'application..."
npm install
npm run build

print_success "Build terminé!"

# Si domaine différent de localhost, proposer configuration serveur
if [ "$DOMAIN" != "localhost" ]; then
    echo ""
    echo "Configuration Nginx recommandée pour $DOMAIN:"
    echo ""
    cat << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    root $(pwd)/$BUILD_DIR;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
EOF
    echo ""
    echo "Sauvegardez cette configuration dans: /etc/nginx/sites-available/$DOMAIN"
    echo "Puis activez avec: sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
else
    print_info "Démarrage du serveur local..."
    echo ""
    echo "Pour tester localement:"
    echo "npx serve -s $BUILD_DIR -l 3000"
    echo ""
    echo "Ou utilisez un serveur web de votre choix pour servir le dossier $BUILD_DIR"
fi

print_success "Déploiement terminé!"