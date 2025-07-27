#!/bin/bash

set -e

echo "🚀 RICE Tool Setup"
echo "=================="

# Vérification du fichier .env
if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant"
    echo ""
    echo "📝 Copiez et configurez votre fichier .env :"
    echo "   cp .env.example .env"
    echo "   nano .env  # ou votre éditeur préféré"
    echo ""
    echo "💡 Variables à configurer :"
    echo "   DOMAIN=localhost      # ou votre domaine"
    echo "   MODE=local           # ou 'production'"
    echo "   ADMIN_EMAIL=admin@localhost  # votre email"
    echo ""
    echo "Puis relancez: ./setup.sh"
    exit 1
else
    echo "✅ Fichier .env trouvé"
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