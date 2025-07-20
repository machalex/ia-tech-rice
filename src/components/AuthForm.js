import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Shield } from 'lucide-react';

const AuthForm = ({ onAuthSuccess }) => {
  const [isSetup, setIsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setIsSetup(!data.hasAdmin);
    } catch (err) {
      console.error('Erreur lors de la vérification:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isSetup) {
        // Mode création de compte
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        if (formData.password.length < 6) {
          setError('Le mot de passe doit faire au moins 6 caractères');
          return;
        }

        const response = await fetch('/api/auth/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la création du compte');
        }

        // Après création, se connecter automatiquement
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          throw new Error(loginData.error || 'Erreur lors de la connexion');
        }

        localStorage.setItem('authToken', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        onAuthSuccess(loginData.user, loginData.token);

      } else {
        // Mode connexion
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la connexion');
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onAuthSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{borderColor: '#24C4E1'}}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md" style={{border: '2px solid #24C4E1'}}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{color: '#24C4E1'}}>
            {isSetup ? 'Configuration initiale' : 'Connexion'}
          </h1>
          <p className="text-gray-300">
            {isSetup 
              ? 'Créez votre compte administrateur pour commencer' 
              : 'Connectez-vous pour accéder à votre tableau de bord'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 rounded-lg text-red-300 text-sm" style={{border: '1px solid #ef4444'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#24C4E1'}}>
              Nom d'utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4" style={{color: '#24C4E1'}} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400"
                style={{borderColor: '#24C4E1', '--tw-ring-color': '#24C4E1'}}
                placeholder="Votre nom d'utilisateur"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{color: '#24C4E1'}}>
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4" style={{color: '#24C4E1'}} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400"
                style={{borderColor: '#24C4E1', '--tw-ring-color': '#24C4E1'}}
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 hover:opacity-80"
                style={{color: '#24C4E1'}}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSetup && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: '#24C4E1'}}>
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4" style={{color: '#24C4E1'}} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400"
                  style={{borderColor: '#24C4E1', '--tw-ring-color': '#24C4E1'}}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 hover:opacity-80"
                  style={{color: '#24C4E1'}}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50"
            style={{background: `linear-gradient(135deg, #24C4E1, #CC33F9)`}}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {isSetup ? 'Création...' : 'Connexion...'}
              </>
            ) : (
              <>
                {isSetup ? <Shield className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isSetup ? 'Créer le compte admin' : 'Se connecter'}
              </>
            )}
          </button>
        </form>

        {isSetup && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg" style={{border: '1px solid #24C4E1'}}>
            <p className="text-sm" style={{color: '#24C4E1'}}>
              <strong>Première connexion :</strong> Créez votre compte administrateur unique. 
              Ces identifiants vous permettront d'accéder à votre tableau de bord RICE.
            </p>
          </div>
        )}
      </div>
      
      {/* Footer avec logo */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <a href="https://ia-tech.fr">
          <img 
            src="https://spark.thrivecart.com/0x0/user_assets%2FEHY8FYED%2Fuploads%2Fimages%2Flogo-ia-tech-1736629550.png" 
            alt="meilleur consultant IA en France" 
            className="w-12 h-12 object-contain opacity-60 hover:opacity-80 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
};

export default AuthForm;