const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Middleware de sécurité
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite à 100 requêtes par IP
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard.'
});
app.use('/api/', limiter);

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// Routes d'authentification

// POST /api/auth/setup - Création du premier utilisateur admin
app.post('/api/auth/setup', async (req, res) => {
  try {
    // Vérifier qu'il n'y a pas déjà d'utilisateur
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Un utilisateur admin existe déjà' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const result = await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username, created_at',
      [username, passwordHash]
    );

    res.status(201).json({
      message: 'Utilisateur admin créé avec succès',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Erreur lors de la création de l\'utilisateur admin:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/auth/login - Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    // Récupérer l'utilisateur
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = result.rows[0];

    // Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Erreur lors de la connexion:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/check - Vérifier si un utilisateur existe
app.get('/api/auth/check', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    const hasAdmin = parseInt(result.rows[0].count) > 0;
    res.json({ hasAdmin });
  } catch (err) {
    console.error('Erreur lors de la vérification de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/auth/me - Récupérer les informations de l'utilisateur connecté
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, created_at FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes API protégées

// GET /api/tasks - Récupérer toutes les tâches
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur lors de la récupération des tâches:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/tasks - Créer une nouvelle tâche
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { name, description, reach, impact, confidence, effort, status, hourly_rate } = req.body;
    
    const result = await pool.query(
      'INSERT INTO tasks (name, description, reach, impact, confidence, effort, status, hourly_rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, description, reach, impact, confidence, effort, status, hourly_rate]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la création de la tâche:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/tasks/:id - Mettre à jour une tâche
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, reach, impact, confidence, effort, status, hourly_rate } = req.body;
    
    const result = await pool.query(
      'UPDATE tasks SET name = $1, description = $2, reach = $3, impact = $4, confidence = $5, effort = $6, status = $7, hourly_rate = $8 WHERE id = $9 RETURNING *',
      [name, description, reach, impact, confidence, effort, status, hourly_rate, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la tâche:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/tasks/:id - Supprimer une tâche
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }
    
    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la tâche:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/settings - Récupérer les paramètres
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (err) {
    console.error('Erreur lors de la récupération des paramètres:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/settings/:key - Mettre à jour un paramètre
app.put('/api/settings/:key', authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const result = await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *',
      [key, value]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du paramètre:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});