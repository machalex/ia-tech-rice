#!/bin/bash

set -e

echo "🚀 RICE Tool Setup"
echo "=================="

# Création du fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env..."
    
    # Génération des secrets
    DB_PASSWORD=$(openssl rand -base64 32 2>/dev/null || echo "rice_$(date +%s)")
    JWT_SECRET=$(openssl rand -base64 64 2>/dev/null || echo "jwt_secret_$(date +%s)_$(openssl rand -hex 16)")
    
    cat > .env << EOF
# RICE Tool Configuration
MODE=local
DOMAIN=localhost
ADMIN_EMAIL=admin@localhost
FRONTEND_PORT=8080
BACKEND_PORT=3001
DB_PORT=5433
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
EOF
    
    echo "✅ Fichier .env créé avec secrets sécurisés"
else
    echo "✅ Fichier .env existant trouvé"
fi

# Vérification de Docker
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker ou Docker Compose non installé"
    echo "📦 Installez Docker : https://docs.docker.com/get-docker/"
    exit 1
fi

echo ""
echo "🚀 Lancement de l'application..."
echo "docker-compose -f docker-compose.local.yml up -d"

# Lancement direct
docker-compose -f docker-compose.local.yml up -d

echo ""
echo "✅ RICE Tool démarré !"
echo "🌐 Accès : http://localhost:8080"
echo ""
echo "🔧 Commandes utiles :"
echo "   docker-compose -f docker-compose.local.yml logs -f    # Logs"
echo "   docker-compose -f docker-compose.local.yml down       # Arrêter"
echo "   docker-compose -f docker-compose.local.yml up -d      # Redémarrer"