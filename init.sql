-- Création de la table des tâches
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    reach INTEGER NOT NULL DEFAULT 1,
    impact DECIMAL(3,2) NOT NULL DEFAULT 1,
    confidence INTEGER NOT NULL DEFAULT 50,
    effort DECIMAL(4,1) NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    hourly_rate DECIMAL(6,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des paramètres globaux
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Création de la table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertion des paramètres par défaut
INSERT INTO settings (key, value) VALUES 
('global_hourly_rate', '35')
ON CONFLICT (key) DO NOTHING;

-- Insertion des tâches d'exemple
INSERT INTO tasks (name, description, reach, impact, confidence, effort, status, hourly_rate) VALUES
('Envoi rapports hebdomadaires', 'Automatiser la génération et envoi des rapports de vente', 15, 2, 80, 4, 'todo', 35),
('Saisie commandes clients', 'Intégration automatique email → CRM', 50, 3, 70, 12, 'todo', 45),
('Relances clients automatiques', 'Emails de relance selon échéances factures', 30, 2, 90, 6, 'done', 35)
ON CONFLICT DO NOTHING;

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();