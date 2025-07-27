#!/bin/bash

set -e

echo "🚀 Installation rapide de RICE Tool (Mode Local)"
echo "================================================"

# Vérification de Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "📦 Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Vérification de Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installation de Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Téléchargement du projet
echo "📥 Téléchargement de RICE Tool..."
if [ -d "ia-tech-rice" ]; then
    echo "⚠️  Le dossier ia-tech-rice existe déjà - suppression automatique"
    rm -rf ia-tech-rice
fi

git clone https://github.com/machalex/ia-tech-rice.git
cd ia-tech-rice

# Création automatique du fichier .env minimal
echo "📝 Création automatique de la configuration..."
cat > .env << EOF
# ===========================================
# RICE Tool Configuration - Mode Local
# ===========================================
# Configuration générée automatiquement pour installation rapide

MODE=local
DOMAIN=localhost
ADMIN_EMAIL=admin@localhost
EOF

echo "✅ Configuration de base créée (secrets générés automatiquement)"

# Lancement du script d'installation standard
echo ""
echo "🚀 Lancement de l'installation..."
./install.sh