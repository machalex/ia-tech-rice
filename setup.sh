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

# Lecture du MODE depuis .env
source .env
MODE=${MODE:-production}

echo ""
echo "🚀 Lancement de l'application en mode: $MODE"

if [ "$MODE" = "local" ]; then
    echo "docker-compose --profile local up -d"
    docker-compose --profile local up -d
else
    echo "docker-compose up -d"
    docker-compose up -d
fi

echo ""
echo "✅ RICE Tool démarré !"
if [ "$MODE" = "local" ]; then
    echo "🌐 Accès : http://localhost:8080"
    echo ""
    echo "🔧 Commandes utiles :"
    echo "   docker-compose --profile local logs -f    # Logs"
    echo "   docker-compose --profile local down       # Arrêter"  
    echo "   docker-compose --profile local up -d      # Redémarrer"
else
    echo "🌐 Accès : https://$DOMAIN"
    echo ""
    echo "🔧 Commandes utiles :"
    echo "   docker-compose logs -f    # Logs"
    echo "   docker-compose down       # Arrêter"
    echo "   docker-compose up -d      # Redémarrer"
fi