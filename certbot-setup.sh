#!/bin/bash

# Script de configuration SSL avec Certbot
# Utilise les variables d'environnement DOMAIN et ADMIN_EMAIL

set -e

# Vérification des variables d'environnement
if [ -z "$DOMAIN" ]; then
    echo "❌ Erreur: Variable DOMAIN non définie"
    echo "💡 Ajoutez DOMAIN=votre-domaine.com dans votre fichier .env"
    exit 1
fi

if [ -z "$ADMIN_EMAIL" ]; then
    echo "❌ Erreur: Variable ADMIN_EMAIL non définie"
    echo "💡 Ajoutez ADMIN_EMAIL=admin@votre-domaine.com dans votre fichier .env"
    exit 1
fi

echo "🔐 Configuration SSL pour $DOMAIN"
echo "📧 Email admin: $ADMIN_EMAIL"

# Installation de certbot si nécessaire
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Création des certificats SSL
echo "🎫 Génération des certificats SSL..."
sudo certbot --nginx \
    --email "$ADMIN_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --domains "$DOMAIN" \
    --non-interactive

# Vérification du renouvellement automatique
echo "⏰ Configuration du renouvellement automatique..."
sudo crontab -l | grep -q "certbot renew" || (sudo crontab -l; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -

echo "✅ Configuration SSL terminée!"
echo "📧 Les notifications de renouvellement seront envoyées à: $ADMIN_EMAIL"