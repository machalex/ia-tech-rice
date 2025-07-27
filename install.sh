#!/bin/bash

set -e

echo "🚀 Installation de RICE Tool"
echo "=============================="

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

# Vérification du fichier .env
echo ""
echo "📋 Configuration"
echo "================="

if [ ! -f ".env" ]; then
    echo "❌ Fichier .env manquant"
    echo "📝 Copiez .env.example vers .env et configurez vos variables:"
    echo "   cp .env.example .env"
    echo "   nano .env"
    echo ""
    echo "💡 Pour une installation rapide en mode local:"
    echo "   MODE=local"
    echo "   DOMAIN=localhost" 
    echo "   DB_PASSWORD=\$(openssl rand -base64 32)"
    echo "   JWT_SECRET=\$(openssl rand -base64 64)"
    exit 1
fi

# Chargement des variables d'environnement
source .env

# Validation des variables obligatoires
if [ -z "$MODE" ]; then
    echo "❌ Variable MODE manquante dans .env"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo "❌ Variable DOMAIN manquante dans .env"
    exit 1
fi

# Génération automatique des secrets s'ils n'existent pas
echo "🔐 Génération des secrets sécurisés..."

if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 32)
    echo "DB_PASSWORD=\"${DB_PASSWORD}\"" >> .env
fi

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 64)
    echo "JWT_SECRET=\"${JWT_SECRET}\"" >> .env
fi

# Définition des ports par défaut
FRONTEND_PORT=${FRONTEND_PORT:-8080}
BACKEND_PORT=${BACKEND_PORT:-3001}
DB_PORT=${DB_PORT:-5433}

# Ajout des ports au .env s'ils n'y sont pas
if ! grep -q "FRONTEND_PORT" .env; then
    echo "FRONTEND_PORT=${FRONTEND_PORT}" >> .env
fi

if ! grep -q "BACKEND_PORT" .env; then
    echo "BACKEND_PORT=${BACKEND_PORT}" >> .env
fi

if ! grep -q "DB_PORT" .env; then
    echo "DB_PORT=${DB_PORT}" >> .env
fi

echo "✅ Configuration .env complétée"
echo "   Mode: $MODE"
echo "   Domaine: $DOMAIN"
echo "   Port frontend: $FRONTEND_PORT"

# Vérification que Docker fonctionne
if ! docker info >/dev/null 2>&1; then
    echo "⚠️  Docker n'est pas encore prêt. Redémarrez votre terminal et relancez le script."
    exit 1
fi

# Démarrage selon le mode
echo ""
echo "🚀 Démarrage de l'application..."

if [[ "$MODE" == "local" ]]; then
    # Mode local - utilise docker-compose.local.yml
    echo "Mode local : utilisation de docker-compose.local.yml"
    if [ ! -f "docker-compose.local.yml" ]; then
        echo "❌ Fichier docker-compose.local.yml manquant"
        exit 1
    fi
    docker-compose -f docker-compose.local.yml up -d
else
    # Mode production - utilise docker-compose.yml avec SSL
    echo "Mode production : configuration SSL automatique"
    if [ ! -f "docker-compose.yml" ]; then
        echo "❌ Fichier docker-compose.yml manquant"
        exit 1
    fi
    mkdir -p ssl certbot-www
    docker-compose up -d
fi

echo ""
echo "✅ Installation terminée !"
echo ""

if [[ "$MODE" == "local" ]]; then
    # Mode local
    echo "🌐 Votre application est accessible sur:"
    echo "   http://localhost:${FRONTEND_PORT:-8080}"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   docker-compose -f docker-compose.local.yml logs -f    # Voir les logs"
    echo "   docker-compose -f docker-compose.local.yml down       # Arrêter"
    echo "   docker-compose -f docker-compose.local.yml up -d      # Redémarrer"
else
    # Mode production
    echo "🌐 Votre application sera accessible sur:"
    echo "   http://${DOMAIN} (redirection automatique vers HTTPS)"
    echo "   https://${DOMAIN}"
    echo ""
    echo "📧 Les notifications SSL seront envoyées à: ${ADMIN_EMAIL}"
    echo ""
    echo "⚠️  Note: Le certificat SSL peut prendre quelques minutes à être généré."
    echo "   Vérifiez les logs avec: docker-compose logs rice-certbot"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   docker-compose logs -f          # Voir les logs en temps réel"
    echo "   docker-compose down             # Arrêter l'application"
    echo "   docker-compose up -d            # Redémarrer l'application"
fi