# RICE Tool - Outil de Priorisation pour l'Automatisation

Un outil interactif basé sur la méthodologie RICE pour prioriser vos tâches d'automatisation et calculer le ROI de vos projets.

![RICE Tool Dashboard](https://via.placeholder.com/800x400/24C4E1/FFFFFF?text=RICE+Tool+Dashboard)

## 🚀 Installation

Installation simple en une commande avec Docker :

```bash
curl -sL https://raw.githubusercontent.com/machalex/ia-tech-rice/main/install.sh | bash
```

**Le script fait tout automatiquement :**
1. 📦 Installe Docker et Docker Compose si nécessaire
2. 📥 Télécharge l'application
3. ❓ Demande votre domaine (ex: monsite.com)
4. 📧 Demande votre email admin (pour notifications SSL)
5. 🔐 Génère des mots de passe sécurisés
6. 🚀 Démarre l'application avec SSL automatique

**C'est tout !** Votre application sera accessible sur `https://votre-domaine.com`

## ⚠️ Configuration DNS Importante

**Avant de lancer l'installation**, assurez-vous que votre domaine pointe vers votre serveur :

1. **Ajoutez un enregistrement DNS :**
   - Type : `A` 
   - Nom : `@` (pour domaine principal) ou `sous-domaine` (pour sous-domaine)
   - Valeur : `IP.DE.VOTRE.SERVEUR`
   - TTL : 300 (optionnel)

2. **Exemples :**
   ```
   # Domaine principal
   monsite.com → 192.168.1.100
   
   # Sous-domaine  
   rice.monsite.com → 192.168.1.100
   ```

3. **Vérifiez la propagation :**
   ```bash
   nslookup votre-domaine.com
   # ou
   dig votre-domaine.com
   ```

**⏱️ La propagation DNS peut prendre jusqu'à 24h.** Le certificat SSL ne pourra être généré qu'une fois le DNS configuré.

## 📊 Fonctionnalités

- **Dashboard interactif** avec métriques en temps réel
- **Matrice Impact/Effort** avec visualisation par quadrants
- **Calcul automatique du score RICE** et du ROI
- **Gestion des tâches** avec statuts (À faire, En cours, Automatisé)
- **Sauvegarde automatique** des données avec PostgreSQL
- **Interface responsive** optimisée pour tous les écrans
- **Thème sombre** pour un confort d'utilisation

## 🧮 Méthodologie RICE

Le score RICE est calculé selon la formule :
```
Score = (Temps économisé × Impact × Faisabilité) / Difficulté
```

### Critères d'évaluation

| Critère | Description | Échelle |
|---------|-------------|---------|
| **Temps** | Heures économisées par période (jour/semaine/mois) | 1-100h |
| **Impact** | Impact sur l'organisation | Minimal (0.25) à Massif (3) |
| **Faisabilité** | Probabilité de réussite | 10-100% |
| **Difficulté** | Effort de développement | 0.5-40h |

## 🌐 Configuration du serveur

### Prérequis
- **Node.js** 16+ et npm
- **Nginx** (installation automatique par le script)
- **Git** pour le téléchargement
- **Certbot** (optionnel, pour SSL)


## 📱 Utilisation

### 1. Dashboard Principal
- Vue d'ensemble des gains réalisés et potentiels
- Top 5 des tâches prioritaires
- Matrice Impact/Effort interactive

### 2. Gestion des Tâches
- Ajouter/modifier/supprimer des tâches
- Édition en ligne des valeurs
- Barres de progression interactives
- Calcul automatique du score RICE

### 3. Évaluation des Tâches
- **Temps** : Saisir les heures économisées + fréquence
- **Impact** : Choisir l'impact organisationnel
- **Faisabilité** : Estimer la probabilité de réussite
- **Difficulté** : Évaluer l'effort de développement

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` basé sur `.env.example` :
```env
# Configuration du domaine et SSL
DOMAIN=votre-domaine.com
ADMIN_EMAIL=admin@votre-domaine.com

# Base de données
DB_PASSWORD=rice_password_2024

# JWT Secret (IMPORTANT: Changez cette valeur en production)
JWT_SECRET=your-very-secure-secret-key-change-in-production

# Port du frontend (optionnel)
FRONTEND_PORT=8080

# Configuration React (optionnel)
REACT_APP_TITLE=RICE Tool - Mon Entreprise
REACT_APP_DEFAULT_HOURLY_RATE=35
```

**Variables importantes :**
- `ADMIN_EMAIL` : Email qui recevra les notifications SSL (renouvellement certificats Let's Encrypt, etc.)
- `DOMAIN` : Votre domaine pour la configuration SSL automatique

### Personnalisation

#### Modifier les couleurs du thème
Éditer `src/components/RiceInteractiveTool.js` :
```javascript
// Couleur principale (actuellement #24C4E1)
style={{color: '#VOTRE_COULEUR'}}

// Couleur secondaire (actuellement #CC33F9)
style={{background: 'linear-gradient(135deg, #24C4E1, #VOTRE_COULEUR)'}}
```

#### Modifier le logo
Remplacer l'URL dans le footer du composant.

## 🔄 Mise à jour

```bash
cd ia-tech-rice
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

## 🗄️ Persistance des données

Les données sont stockées dans une base PostgreSQL avec un volume Docker persistant. 
Vos données sont automatiquement sauvegardées même lors des redémarrages.

#### Sauvegarde Docker
```bash
# Sauvegarder la base de données
docker exec rice-db pg_dump -U rice_user rice_db > backup.sql

# Restaurer
docker exec -i rice-db psql -U rice_user rice_db < backup.sql
```

## 🚨 Dépannage

### Problèmes courants

**L'application ne se charge pas :**
```bash
# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/votre-domaine.com_error.log

# Vérifier le statut Nginx
sudo systemctl status nginx
```

**Erreur de build :**
```bash
# Nettoyer le cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Domaine non accessible :**
- Vérifier la configuration DNS
- Vérifier les règles firewall : `sudo ufw allow 80` et `sudo ufw allow 443`

### Logs Docker
```bash
# Voir les logs
docker-compose logs -f

# Redémarrer les services
docker-compose restart
```

## 🔒 Sécurité

### Recommandations
- Utiliser HTTPS en production (SSL automatique avec le script)
- Sauvegarder régulièrement les données utilisateur
- Configurer des headers de sécurité (inclus dans la config Nginx)

### Headers de sécurité inclus
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

## 📊 Architecture

### Architecture Docker
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Node.js API   │    │   PostgreSQL    │
│  (Frontend)     │◄───┤   (Backend)     │◄───┤   (Database)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                                              
         │                                              
┌─────────────────┐                                    
│     Nginx       │                                    
│  (Reverse Proxy)│                                    
│                 │                                    
└─────────────────┘                                    
```

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📞 Support

Pour toute question ou problème :
- Créer une [issue GitHub](https://github.com/votre-nom/rice-tool/issues)
- Consulter la [documentation](https://github.com/votre-nom/rice-tool/wiki)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour optimiser vos projets d'automatisation**