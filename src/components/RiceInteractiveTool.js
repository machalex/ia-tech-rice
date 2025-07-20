import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, List, BarChart3, Target, TrendingUp, CheckCircle, LogOut, Save } from 'lucide-react';

const RiceInteractiveTool = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [globalHourlyRate, setGlobalHourlyRate] = useState(35); // Taux horaire global par défaut
  const [lastSaved, setLastSaved] = useState(null);
  const [showSaveToast, setShowSaveToast] = useState(false);
  
  // Charger les données sauvegardées au démarrage
  useEffect(() => {
    const savedTasks = localStorage.getItem('riceTasks');
    const savedHourlyRate = localStorage.getItem('riceHourlyRate');
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Erreur lors du chargement des tâches:', error);
      }
    }
    
    if (savedHourlyRate) {
      setGlobalHourlyRate(parseFloat(savedHourlyRate) || 35);
    }
    
    const savedTime = localStorage.getItem('riceLastSaved');
    if (savedTime) {
      setLastSaved(new Date(savedTime));
    }
  }, []);

  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Envoi rapports hebdomadaires",
      description: "Automatiser la génération et envoi des rapports de vente",
      reach: 15,
      timeFrequency: 'jour', // 'jour', 'semaine', 'mois'
      impact: 2,
      confidence: 80,
      effort: 4,
      status: 'todo',
      hourlyRate: 35
    },
    {
      id: 2,
      name: "Saisie commandes clients",
      description: "Intégration automatique email → CRM",
      reach: 50,
      timeFrequency: 'jour',
      impact: 3,
      confidence: 70,
      effort: 12,
      status: 'todo',
      hourlyRate: 45
    },
    {
      id: 3,
      name: "Relances clients automatiques",
      description: "Emails de relance selon échéances factures",
      reach: 30,
      timeFrequency: 'jour',
      impact: 2,
      confidence: 90,
      effort: 6,
      status: 'done',
      hourlyRate: 35
    }
  ]);

  const addTask = () => {
    const newTask = {
      id: Date.now(),
      name: "Nouvelle tâche",
      description: "",
      reach: 1,
      timeFrequency: 'jour',
      impact: 1,
      confidence: 50,
      effort: 1,
      status: 'todo',
      hourlyRate: globalHourlyRate
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // Fonction de sauvegarde
  const saveData = () => {
    try {
      localStorage.setItem('riceTasks', JSON.stringify(tasks));
      localStorage.setItem('riceHourlyRate', globalHourlyRate.toString());
      const now = new Date();
      localStorage.setItem('riceLastSaved', now.toISOString());
      setLastSaved(now);
      
      // Afficher le toast de confirmation
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde des données');
    }
  };

  const calculateRiceScore = (task) => {
    const annualHours = calculateAnnualGain(task);
    return Math.round((annualHours * task.impact * (task.confidence / 100)) / task.effort * 10) / 10;
  };

  const calculateAnnualGain = (task) => {
    const timeInHours = task.reach; // Seulement le temps économisé, pas l'impact
    const multipliers = {
      'jour': 365, // 365 jours par an
      'semaine': 52, // 52 semaines par an
      'mois': 12 // 12 mois par an
    };
    return Math.round(timeInHours * (multipliers[task.timeFrequency] || multipliers['jour']));
  };

  const calculateMonetaryGain = (task) => {
    return calculateAnnualGain(task) * (task.hourlyRate || globalHourlyRate);
  };

  const getImpactEffortQuadrant = (task) => {
    const riceScore = calculateRiceScore(task);
    const impact = riceScore > 5 ? 'high' : 'low';
    const effort = task.effort > 8 ? 'high' : 'low';
    
    if (impact === 'high' && effort === 'low') return { quadrant: 'quick-wins', label: '🚀 Quick Wins', color: 'bg-green-100 border-green-300' };
    if (impact === 'high' && effort === 'high') return { quadrant: 'strategic', label: '🎯 Stratégique', color: 'bg-blue-100 border-blue-300' };
    if (impact === 'low' && effort === 'low') return { quadrant: 'fill-ins', label: '🔧 Fill-ins', color: 'bg-yellow-100 border-yellow-300' };
    return { quadrant: 'avoid', label: '⚠️ À éviter', color: 'bg-red-100 border-red-300' };
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => calculateRiceScore(b) - calculateRiceScore(a));
  }, [tasks]);

  const todoTasks = tasks.filter(task => task.status === 'todo' || task.status === 'in-progress');
  const doneTasks = tasks.filter(task => task.status === 'done');

  const remainingGains = useMemo(() => {
    const hours = todoTasks.reduce((sum, task) => sum + calculateAnnualGain(task), 0);
    const money = todoTasks.reduce((sum, task) => sum + calculateMonetaryGain(task), 0);
    return { hours, money };
  }, [todoTasks, globalHourlyRate]);

  const achievedGains = useMemo(() => {
    const hours = doneTasks.reduce((sum, task) => sum + calculateAnnualGain(task), 0);
    const money = doneTasks.reduce((sum, task) => sum + calculateMonetaryGain(task), 0);
    return { hours, money };
  }, [doneTasks, globalHourlyRate]);


  const getStatusColor = (status) => {
    switch(status) {
      case 'done': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (currentPage === 'list') {
    return (
      <div className="w-full p-6 bg-black min-h-screen pb-12">
        <div className="bg-black rounded-xl shadow-2xl p-6">
          {/* Header avec navigation */}
          <div className="flex items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-2 hover:opacity-80 transition-all" style={{color: '#24C4E1'}}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold" style={{color: '#24C4E1'}}>
                Gestion des tâches
              </h1>
            </div>
            
            <div className="flex-1 flex justify-center">
              <div className="text-sm text-gray-300">
                Taux horaire par défaut: 
                <input
                  type="number"
                  value={globalHourlyRate}
                  onChange={(e) => setGlobalHourlyRate(parseFloat(e.target.value) || 0)}
                  className="ml-2 w-16 px-2 py-1 bg-gray-800 border border-gray-500 rounded text-center text-sm text-white focus:bg-gray-700 focus:border-gray-400"
                />
                €/h
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={addTask}
                className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
                style={{background: 'linear-gradient(135deg, #24C4E1, #CC33F9)'}}
              >
                <Plus size={20} />
                Nouvelle tâche
              </button>
              <button
                onClick={saveData}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center h-10"
                title={lastSaved ? `Dernière sauvegarde: ${lastSaved.toLocaleString()}` : 'Sauvegarder les données'}
              >
                <Save size={20} />
              </button>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-red-500 p-2 rounded-lg transition-colors"
                title="Se déconnecter"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Tableau des tâches */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-blue-50 border-b" style={{backgroundColor: '#24C4E1'}}>
                  <th className="text-left p-3 font-semibold text-white">Statut</th>
                  <th className="text-left p-3 font-semibold text-white">Tâche</th>
                  <th className="text-left p-3 font-semibold text-white">Temps</th>
                  <th className="text-left p-3 font-semibold text-white">Tarif horaire</th>
                  <th className="text-left p-3 font-semibold text-white">Impact</th>
                  <th className="text-left p-3 font-semibold text-white">Faisabilité</th>
                  <th className="text-left p-3 font-semibold text-white">Difficulté</th>
                  <th className="text-left p-3 font-semibold text-white">Score RICE</th>
                  <th className="text-left p-3 font-semibold text-white">Gain/an</th>
                  <th className="text-left p-3 font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <tr className="border-b hover:bg-gray-700 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateTask(task.id, 'status', e.target.value);
                            }}
                            className={`text-xs px-2 py-1 rounded-full border-0 font-medium ${getStatusColor(task.status)}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="todo">À faire</option>
                            <option value="in-progress">En cours</option>
                            <option value="done">Automatisé</option>
                          </select>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <input
                            type="text"
                            value={task.name}
                            onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                            className="font-medium text-white bg-transparent border-none outline-none w-full mb-1 focus:bg-gray-700 focus:px-2 focus:py-1 focus:rounded"
                            placeholder="Nom de la tâche"
                          />
                          <input
                            type="text"
                            value={task.description}
                            onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                            className="text-sm text-gray-300 bg-transparent border-none outline-none w-full focus:bg-gray-700 focus:px-2 focus:py-1 focus:rounded"
                            placeholder="Description"
                          />
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div>
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={task.reach}
                              onChange={(e) => updateTask(task.id, 'reach', parseInt(e.target.value) || 1)}
                              className="w-12 text-center text-white bg-transparent border-none outline-none focus:bg-gray-700 focus:px-1 focus:py-1 focus:rounded"
                              min="1"
                            />
                            <span className="text-xs text-gray-400">h</span>
                            <select
                              value={task.timeFrequency}
                              onChange={(e) => updateTask(task.id, 'timeFrequency', e.target.value)}
                              className="text-xs text-white bg-transparent border-none outline-none focus:bg-gray-700 focus:px-1 focus:py-1 focus:rounded"
                            >
                              <option value="jour" className="bg-gray-800">/jour</option>
                              <option value="semaine" className="bg-gray-800">/sem</option>
                              <option value="mois" className="bg-gray-800">/mois</option>
                            </select>
                          </div>
                          <div 
                            className="w-16 h-1 bg-gray-600 rounded mt-2 cursor-pointer relative mx-auto"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const percentage = Math.max(0, Math.min(1, x / rect.width));
                              const newValue = Math.round(Math.max(1, percentage * 100)); // Limité à 100 pour plus de sens
                              updateTask(task.id, 'reach', newValue);
                            }}
                          >
                            <div 
                              className="h-1 bg-blue-400 rounded" 
                              style={{width: `${Math.min((task.reach / 100) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={task.hourlyRate || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            const value = parseFloat(e.target.value) || null;
                            updateTask(task.id, 'hourlyRate', value);
                          }}
                          className="w-16 px-2 py-1 bg-gray-800 border border-gray-500 rounded text-center text-sm text-white focus:bg-gray-700 focus:border-gray-400"
                          onClick={(e) => e.stopPropagation()}
                          placeholder={globalHourlyRate}
                        />
                      </td>
                      <td className="p-3 text-center">
                        <div>
                          <select
                            value={task.impact}
                            onChange={(e) => updateTask(task.id, 'impact', parseFloat(e.target.value))}
                            className="text-white bg-transparent border-none outline-none focus:bg-gray-700 focus:px-2 focus:py-1 focus:rounded"
                          >
                            <option value={3} className="bg-gray-800">Massif</option>
                            <option value={2} className="bg-gray-800">Élevé</option>
                            <option value={1} className="bg-gray-800">Moyen</option>
                            <option value={0.5} className="bg-gray-800">Faible</option>
                            <option value={0.25} className="bg-gray-800">Minimal</option>
                          </select>
                          <div 
                            className="w-20 h-1 bg-gray-600 rounded mt-2 mx-auto cursor-pointer relative"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const percentage = Math.max(0, Math.min(1, x / rect.width));
                              const values = [0.25, 0.5, 1, 2, 3];
                              const index = Math.round(percentage * (values.length - 1));
                              const newValue = values[Math.max(0, Math.min(index, values.length - 1))];
                              updateTask(task.id, 'impact', newValue);
                            }}
                          >
                            <div 
                              className="h-1 bg-green-400 rounded" 
                              style={{width: `${((task.impact - 0.25) / (3 - 0.25)) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div>
                          <div>
                            <input
                              type="number"
                              value={task.confidence}
                              onChange={(e) => updateTask(task.id, 'confidence', parseInt(e.target.value) || 50)}
                              className="w-16 text-center text-white bg-transparent border-none outline-none focus:bg-gray-700 focus:px-2 focus:py-1 focus:rounded"
                              min="10"
                              max="100"
                            />
                            <span className="text-xs text-gray-400 ml-1">%</span>
                          </div>
                          <div 
                            className="w-16 h-1 bg-gray-600 rounded mt-2 cursor-pointer relative"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const percentage = Math.max(0, Math.min(1, x / rect.width));
                              const newValue = Math.round(Math.max(10, Math.min(100, percentage * 100)));
                              updateTask(task.id, 'confidence', newValue);
                            }}
                          >
                            <div 
                              className="h-1 bg-yellow-400 rounded" 
                              style={{width: `${task.confidence}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div>
                          <div>
                            <input
                              type="number"
                              value={task.effort}
                              onChange={(e) => updateTask(task.id, 'effort', parseFloat(e.target.value) || 1)}
                              className="w-16 text-center text-white bg-transparent border-none outline-none focus:bg-gray-700 focus:px-2 focus:py-1 focus:rounded"
                              min="0.5"
                              step="0.5"
                            />
                          </div>
                          <div 
                            className="w-16 h-1 bg-gray-600 rounded mt-2 cursor-pointer relative"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = e.clientX - rect.left;
                              const percentage = Math.max(0, Math.min(1, x / rect.width));
                              const newValue = Math.max(0.5, percentage * 40);
                              const roundedValue = Math.round(newValue * 2) / 2; // Arrondi par pas de 0.5
                              updateTask(task.id, 'effort', roundedValue);
                            }}
                          >
                            <div 
                              className="h-1 bg-red-400 rounded" 
                              style={{width: `${Math.min((task.effort / 40) * 100, 100)}%`}}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div>
                          <div className="font-bold" style={{color: '#24C4E1'}}>{calculateRiceScore(task)}</div>
                          <div className="w-16 h-1 bg-gray-600 rounded mt-2 mx-auto">
                            <div 
                              className="h-1 rounded" 
                              style={{
                                width: `${Math.min((calculateRiceScore(task) / 1000) * 100, 100)}%`,
                                backgroundColor: calculateRiceScore(task) > 500 ? '#10B981' : calculateRiceScore(task) > 100 ? '#F59E0B' : '#EF4444'
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="text-sm">
                          <div className="text-white">{calculateAnnualGain(task)}h</div>
                          <div className="font-medium" style={{color: '#24C4E1'}}>{calculateMonetaryGain(task).toLocaleString()}€</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 hover:opacity-80"
                          style={{color: '#CC33F9'}}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Toast de notification */}
        {showSaveToast && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
            <CheckCircle size={18} />
            Données sauvegardées avec succès
          </div>
        )}
        
        {/* Footer avec logo */}
        <div className="text-center py-6">
          <a 
            href="https://ia-tech.fr" 
            className="inline-block"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img 
              src="https://spark.thrivecart.com/0x0/user_assets%2FEHY8FYED%2Fuploads%2Fimages%2Flogo-ia-tech-1736629550.png" 
              alt="meilleur consultant IA en France" 
              className="w-20 h-20 object-contain opacity-60 hover:opacity-80 transition-opacity"
            />
          </a>
        </div>
      </div>
    );
  }

  // Page d'accueil (tableau de bord)
  return (
    <div className="w-full p-6 bg-black min-h-screen pb-12">
      <div className="bg-black rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{color: '#24C4E1'}}>
              Dashboard Automatisation
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('list')}
              className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all hover:opacity-90"
              style={{background: 'linear-gradient(135deg, #24C4E1, #CC33F9)'}}
            >
              <List size={20} />
              Gérer les tâches
            </button>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-500 p-2 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Blocs de gains - 3 colonnes alignées */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Gains réalisés */}
          <div className="bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-500 rounded-xl p-4 shadow-xl">
            <h3 className="text-sm font-medium text-green-400 mb-3 flex items-center gap-2">
              <CheckCircle className="text-green-400" />
              Gains réalisés
            </h3>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-white">{achievedGains.hours}</span>
                <span className="text-lg text-white ml-1">h/an</span>
              </div>
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-white">{achievedGains.money.toLocaleString()}</span>
                <span className="text-lg text-white ml-1">€/an</span>
              </div>
            </div>
          </div>

          {/* Gains potentiels */}
          <div className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 rounded-xl p-4 shadow-xl" style={{borderColor: '#CC33F9'}}>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{color: '#CC33F9'}}>
              <Target style={{color: '#CC33F9'}} />
              Gains potentiels
            </h3>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-white">{remainingGains.hours}</span>
                <span className="text-lg text-white ml-1">h/an</span>
              </div>
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-white">{remainingGains.money.toLocaleString()}</span>
                <span className="text-lg text-white ml-1">€/an</span>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 border-2 rounded-xl p-4 shadow-xl" style={{borderColor: '#24C4E1'}}>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2" style={{color: '#24C4E1'}}>
              <TrendingUp style={{color: '#24C4E1'}} />
              ROI Global
            </h3>
            <div className="flex justify-center items-center gap-4">
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-white">
                  {tasks.length > 0 ? Math.round(((achievedGains.money + remainingGains.money) / 
                    (tasks.reduce((sum, task) => sum + (task.effort * (task.hourlyRate || globalHourlyRate)), 0))) * 100) : 0}
                </span>
                <span className="text-lg text-white ml-1">%</span>
              </div>
              <div className="text-center flex-1">
                <span className="text-2xl font-bold text-white">{(achievedGains.money + remainingGains.money).toLocaleString()}</span>
                <span className="text-lg text-white ml-1">€/an</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top des priorités */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Target style={{color: '#24C4E1'}} />
            Tâches prioritaires à automatiser
          </h2>
          
          <div className="grid gap-3">
            {sortedTasks.filter(task => task.status !== 'done').slice(0, 5).map((task, index) => {
              const riceScore = calculateRiceScore(task);
              const quadrant = getImpactEffortQuadrant(task);
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg bg-gray-800`}
                  style={{borderColor: '#24C4E1'}}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full w-8 h-8 flex items-center justify-center font-bold text-white" style={{background: 'linear-gradient(135deg, #24C4E1, #CC33F9)'}}>
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{task.name}</h3>
                        <p className="text-gray-300 text-sm">{task.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-12">
                      <div className="flex gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{calculateAnnualGain(task)}h/an</div>
                          <div className="text-xs text-gray-400">Temps</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold" style={{color: '#24C4E1'}}>{calculateMonetaryGain(task).toLocaleString()}€/an</div>
                          <div className="text-xs text-gray-400">Économies</div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold" style={{color: '#CC33F9'}}>{riceScore}</div>
                        <div className="text-xs text-gray-400">Score RICE</div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-sm font-medium" style={{color: '#24C4E1', backgroundColor: 'rgba(36, 196, 225, 0.2)', border: '1px solid #24C4E1'}}>
                        {quadrant.label}
                      </div>
                      <div className="flex items-center gap-2">
                        {task.status === 'todo' && (
                          <button
                            onClick={() => updateTask(task.id, 'status', 'in-progress')}
                            className="hover:opacity-80 text-white px-3 py-1 rounded-full text-sm transition-all"
                            style={{backgroundColor: '#CC33F9'}}
                            title="Marquer comme en cours"
                          >
                            Démarrer
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button
                            onClick={() => updateTask(task.id, 'status', 'done')}
                            className="hover:opacity-80 text-white px-3 py-1 rounded-full text-sm transition-all"
                            style={{backgroundColor: '#24C4E1'}}
                            title="Marquer comme terminé"
                          >
                            Terminé
                          </button>
                        )}
                        {task.status === 'done' && (
                          <button
                            onClick={() => updateTask(task.id, 'status', 'todo')}
                            className="bg-gray-500 hover:bg-gray-400 text-white px-3 py-1 rounded-full text-sm transition-colors"
                            title="Remettre à faire"
                          >
                            Réouvrir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matrice Impact/Effort */}
        <div className="bg-black rounded-xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BarChart3 style={{color: '#24C4E1'}} />
            Matrice Impact/Effort (tâches restantes)
          </h2>
          
          {/* Matrice avec axes corrigés */}
        <div className="relative pb-12 pr-6 pt-16">
          {/* Axe Y (IMPACT) - T aligné avec le haut de l'axe, texte près de la ligne */}
          <div className="absolute left-6 transform -rotate-90 z-10" style={{top: 'calc(4rem + 1.5rem)', transformOrigin: '0 100%'}}>
            <div className="text-lg font-bold whitespace-nowrap bg-black px-1" style={{color: '#CC33F9'}}>
              IMPACT →
            </div>
          </div>
          
          {/* Ligne verticale de l'axe Y - centrée avec le texte IMPACT */}
          <div className="absolute left-2 top-16 bottom-12 w-0.5" style={{backgroundColor: '#CC33F9'}}></div>
          
          {/* Axe X (EFFORT) - Corrigé */}
          <div className="absolute left-2 right-6 bottom-8 flex items-center">
            <div className="flex-1 h-0.5" style={{backgroundColor: '#CC33F9'}}></div>
            <div className="text-lg font-bold ml-2 whitespace-nowrap" style={{color: '#CC33F9'}}>
              EFFORT →
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 h-80 ml-12 mb-10">
            {/* Quick Wins - Haut gauche */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 border-2 border-blue-500 rounded-lg p-4 shadow-lg h-full">
              <h3 className="font-bold mb-3 text-center text-lg" style={{color: '#24C4E1'}}>🚀 Quick Wins</h3>
              {sortedTasks
                .filter(task => task.status !== 'done' && getImpactEffortQuadrant(task).quadrant === 'quick-wins')
                .map(task => (
                  <div key={task.id} className="bg-black bg-opacity-30 p-2 rounded mb-2 shadow-sm flex justify-between items-center">
                    <div className="font-medium text-sm text-white">{task.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-300">{calculateAnnualGain(task)}h | {calculateMonetaryGain(task).toLocaleString()}€/an</div>
                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTask(task.id, 'status', 'in-progress')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Démarrer"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Stratégique - Haut droit */}
            <div className="bg-gradient-to-br from-green-900 to-green-800 border-2 border-green-500 rounded-lg p-4 shadow-lg h-full">
              <h3 className="font-bold mb-3 text-center text-lg" style={{color: '#24C4E1'}}>🎯 Projets Stratégiques</h3>
              {sortedTasks
                .filter(task => task.status !== 'done' && getImpactEffortQuadrant(task).quadrant === 'strategic')
                .map(task => (
                  <div key={task.id} className="bg-black bg-opacity-30 p-2 rounded mb-2 shadow-sm flex justify-between items-center">
                    <div className="font-medium text-sm text-white">{task.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-300">{calculateAnnualGain(task)}h | {calculateMonetaryGain(task).toLocaleString()}€/an</div>
                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTask(task.id, 'status', 'in-progress')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Démarrer"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Fill-ins - Bas gauche */}
            <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 border-2 border-yellow-500 rounded-lg p-4 shadow-lg h-full">
              <h3 className="font-bold mb-3 text-center text-lg" style={{color: '#24C4E1'}}>🔧 Fill-ins</h3>
              {sortedTasks
                .filter(task => task.status !== 'done' && getImpactEffortQuadrant(task).quadrant === 'fill-ins')
                .map(task => (
                  <div key={task.id} className="bg-black bg-opacity-30 p-2 rounded mb-2 shadow-sm flex justify-between items-center">
                    <div className="font-medium text-sm text-white">{task.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-300">{calculateAnnualGain(task)}h | {calculateMonetaryGain(task).toLocaleString()}€/an</div>
                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTask(task.id, 'status', 'in-progress')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Démarrer"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* À éviter - Bas droit */}
            <div className="bg-gradient-to-br from-red-900 to-red-800 border-2 border-red-500 rounded-lg p-4 shadow-lg h-full">
              <h3 className="font-bold mb-3 text-center text-lg" style={{color: '#24C4E1'}}>⚠️ À éviter</h3>
              {sortedTasks
                .filter(task => task.status !== 'done' && getImpactEffortQuadrant(task).quadrant === 'avoid')
                .map(task => (
                  <div key={task.id} className="bg-black bg-opacity-30 p-2 rounded mb-2 shadow-sm flex justify-between items-center">
                    <div className="font-medium text-sm text-white">{task.name}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-300">{calculateAnnualGain(task)}h | {calculateMonetaryGain(task).toLocaleString()}€/an</div>
                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTask(task.id, 'status', 'in-progress')}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-xs transition-colors"
                          title="Démarrer"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        </div>

      </div>
      
      {/* Toast de notification */}
      {showSaveToast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle size={18} />
          Données sauvegardées avec succès
        </div>
      )}
      
      {/* Footer avec logo */}
      <div className="text-center py-6">
        <a 
          href="https://ia-tech.fr"
          className="inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img 
            src="https://spark.thrivecart.com/0x0/user_assets%2FEHY8FYED%2Fuploads%2Fimages%2Flogo-ia-tech-1736629550.png" 
            alt="meilleur consultant IA en France" 
            className="w-20 h-20 object-contain opacity-60 hover:opacity-80 transition-opacity"
          />
        </a>
      </div>
    </div>
  );
};

export default RiceInteractiveTool;