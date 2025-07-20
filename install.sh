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
if [ -d "rice-tool" ]; then
    echo "⚠️  Le dossier rice-tool existe déjà"
    read -p "Voulez-vous le supprimer et recommencer ? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf rice-tool
    else
        echo "❌ Installation annulée"
        exit 1
    fi
fi

git clone https://github.com/votre-nom/rice-tool.git
cd rice-tool

# Questions à l'utilisateur
echo ""
echo "📋 Configuration"
echo "================="

# Mode d'installation
echo "Choisissez le mode d'installation :"
echo "1) 🌐 Production (avec domaine et SSL)"
echo "2) 💻 Local (développement, localhost:8080)"
read -p "Votre choix [1-2]: " MODE_CHOICE

if [[ "$MODE_CHOICE" == "2" ]]; then
    # Mode local
    DOMAIN="localhost"
    ADMIN_EMAIL="admin@localhost"
    echo "✅ Mode local sélectionné - Application accessible sur http://localhost:8080"
else
    # Mode production
    # Domaine
    while true; do
        read -p "🌐 Votre domaine (ex: monsite.com): " DOMAIN
        if [[ $DOMAIN =~ ^[a-zA-Z0-9][a-zA-Z0-9\.-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
            break
        else
            echo "❌ Format de domaine invalide. Exemple: monsite.com"
        fi
    done

    # Email admin
    while true; do
        read -p "📧 Email administrateur (notifications SSL): " ADMIN_EMAIL
        if [[ $ADMIN_EMAIL =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
            break
        else
            echo "❌ Format d'email invalide"
        fi
    done
fi

# Mot de passe base de données
echo ""
echo "🔐 Génération d'un mot de passe sécurisé pour la base de données..."
DB_PASSWORD=$(openssl rand -base64 32)

# JWT Secret
echo "🔐 Génération d'une clé JWT sécurisée..."
JWT_SECRET=$(openssl rand -base64 64)

# Création du fichier .env
echo ""
echo "📝 Création de la configuration..."
cat > .env << EOF
# Configuration du domaine et SSL
DOMAIN=${DOMAIN}
ADMIN_EMAIL=${ADMIN_EMAIL}

# Base de données
DB_PASSWORD=${DB_PASSWORD}

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Port du frontend
FRONTEND_PORT=8080
EOF

echo "✅ Configuration créée dans .env"

# Démarrage selon le mode
echo ""
echo "🚀 Démarrage de l'application..."

if [[ "$MODE_CHOICE" == "2" ]]; then
    # Mode local - utilise docker-compose.local.yml
    echo "Mode local : utilisation de docker-compose.local.yml"
    docker-compose -f docker-compose.local.yml up -d
else
    # Mode production - utilise docker-compose.yml avec SSL
    echo "Mode production : configuration SSL automatique"
    mkdir -p ssl certbot-www
    docker-compose up -d
fi


echo ""
echo "✅ Installation terminée !"
echo ""

if [[ "$MODE_CHOICE" == "2" ]]; then
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