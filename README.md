# RICE Tool - Outil de Priorisation pour l'Automatisation

Un outil interactif basé sur la méthodologie RICE pour prioriser vos tâches d'automatisation et calculer le ROI de vos projets.

## 🚀 Installation

### 📍 Installation en Local (Développement)

Pour tester l'application sur votre machine locale :

```bash
git clone https://github.com/machalex/ia-tech-rice.git
cd ia-tech-rice
cp .env.example .env
```

**Configuration du fichier `.env` pour le local :**
```bash
# .env
DOMAIN=localhost
MODE=local
ADMIN_EMAIL=admin@localhost
```

**Démarrage :**
```bash
./setup.sh
```

**🌐 Accès : http://localhost:8080**

**Commandes de gestion (local) :**
```bash
# Voir les logs
docker-compose --profile local logs -f

# Arrêter l'application
docker-compose --profile local down

# Redémarrer l'application
docker-compose --profile local up -d
```

---

### 🌐 Installation en Production (Serveur)

Pour déployer l'application sur un serveur avec SSL automatique :

#### **Étape 1 : Configuration DNS (OBLIGATOIRE)**

**⚠️ À FAIRE EN PREMIER** - Configurez votre DNS avant de continuer :

1. **Connectez-vous à votre registraire de domaine** (OVH, Cloudflare, GoDaddy, etc.)

2. **Ajoutez un enregistrement DNS de type A :**
   - **Type** : `A`
   - **Nom** : `@` (pour domaine principal) ou `sous-domaine` (pour sous-domaine)
   - **Valeur** : `IP_DE_VOTRE_SERVEUR`
   - **TTL** : `300` ou `Auto`

3. **Exemples de configuration :**
   ```
   # Domaine principal
   monsite.com → 192.168.1.100
   
   # Sous-domaine
   rice.monsite.com → 192.168.1.100
   ```

4. **Vérifiez la propagation DNS :**
   ```bash
   nslookup votre-domaine.com
   # Doit retourner l'IP de votre serveur
   ```

**⏱️ Attendez la propagation DNS (5-30 minutes) avant de continuer.**

#### **Étape 2 : Installation de l'application**

```bash
git clone https://github.com/machalex/ia-tech-rice.git
cd ia-tech-rice
cp .env.example .env
```

**Configuration du fichier `.env` pour la production :**
```bash
# .env
DOMAIN=votre-domaine.com       # OBLIGATOIRE : votre vrai domaine
MODE=production                # mode production avec SSL
ADMIN_EMAIL=admin@votre-domaine.com  # OBLIGATOIRE : email pour SSL
```

#### **Étape 3 : Démarrage**

```bash
./setup.sh
```

**🌐 Accès : https://votre-domaine.com**

**Commandes de gestion (production) :**
```bash
# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Redémarrer l'application
docker-compose up -d
```

### Ce que fait `setup.sh`

1. ✅ Vérifie que le fichier `.env` existe (sinon guide l'utilisateur)
2. ✅ Lance la commande Docker appropriée selon le MODE
3. ✅ Affiche l'URL d'accès et les commandes utiles

**Les secrets sont intégrés dans docker-compose** - pas besoin de les générer !


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


## 🔄 Mise à jour

```bash
cd ia-tech-rice
git pull origin main
./setup.sh
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
---

**Développé avec ❤️ pour optimiser vos projets d'automatisation**