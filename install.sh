#!/bin/bash

set -e

echo "🚀 Installation de RICE Tool"
echo "============================"

# Vérification de Docker
if ! command -v docker &> /dev/null || ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker ou Docker Compose non installé"
    echo "📦 Installez Docker : https://docs.docker.com/get-docker/"
    exit 1
fi

# Téléchargement du projet
echo "📥 Téléchargement de RICE Tool..."
if [ -d "ia-tech-rice" ]; then
    echo "⚠️  Le dossier ia-tech-rice existe déjà - suppression automatique"
    rm -rf ia-tech-rice
fi

git clone https://github.com/machalex/ia-tech-rice.git
cd ia-tech-rice

# Lancement du setup
echo ""
echo "🚀 Configuration et démarrage..."
./setup.sh

echo ""
echo "✅ Installation terminée !"
echo "🌐 Votre application est accessible sur: http://localhost:8080"