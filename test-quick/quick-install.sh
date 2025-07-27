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

# Génération automatique des secrets
echo "🔐 Génération automatique des secrets sécurisés..."
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Création automatique du fichier .env complet
echo "📝 Création automatique de la configuration..."
cat > .env << EOF
# ===========================================
# RICE Tool Configuration - Mode Local
# ===========================================
# Configuration générée automatiquement pour installation rapide

MODE=local
DOMAIN=localhost
ADMIN_EMAIL=admin@localhost
FRONTEND_PORT=8080
BACKEND_PORT=3001
DB_PORT=5433
DB_PASSWORD="${DB_PASSWORD}"
JWT_SECRET="${JWT_SECRET}"
EOF

echo "✅ Configuration complète créée avec secrets sécurisés"

# Lancement du script d'installation standard
echo ""
echo "🚀 Lancement de l'installation..."
./install.sh