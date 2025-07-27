#!/bin/bash

set -e

echo "🚀 RICE Tool Setup"
echo "=================="

# Création du fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env minimal..."
    cp .env.example .env
    echo "✅ Fichier .env créé (configuration par défaut)"
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