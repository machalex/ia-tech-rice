import React, { useState, useMemo } from 'react';
import { Plus, Trash2, List, Home, BarChart3, Target, Clock, TrendingUp, CheckCircle, Circle, Edit, LogOut, User } from 'lucide-react';

const RiceInteractiveTool = ({ user, token, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [globalHourlyRate, setGlobalHourlyRate] = useState(35);
  const [editingTask, setEditingTask] = useState(null);
  
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: "Envoi rapports hebdomadaires",
      description: "Automatiser la génération et envoi des rapports de vente",
      reach: 15,
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
      impact: 1,
      confidence: 50,
      effort: 1,
      status: 'todo',
      hourlyRate: globalHourlyRate
    };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask.id);
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, [field]: value } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    setEditingTask(null);
  };

  const calculateRiceScore = (task) => {
    return Math.round((task.reach * task.impact * (task.confidence / 100)) / task.effort * 10) / 10;
  };

  const calculateAnnualGain = (task) => {
    return Math.round(task.reach * task.impact * 4);
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'done': return <CheckCircle className="text-green-400" size={20} />;
      case 'in-progress': return <Clock className="text-yellow-400" size={20} />;
      default: return <Circle className="text-gray-400" size={20} />;
    }
  };

  // Page d'accueil colorée
  return (
    <div className="max-w-7xl mx-auto p-8 bg-black min-h-screen">
      {/* Header ultra coloré */}
      <div className="rounded-3xl p-8 mb-8" style={{
        background: 'linear-gradient(135deg, rgba(36, 196, 225, 0.4), rgba(204, 51, 249, 0.4), rgba(0, 255, 136, 0.3))',
        border: '3px solid #CC33F9',
        boxShadow: '0 20px 60px rgba(204, 51, 249, 0.8), 0 0 100px rgba(36, 196, 225, 0.5), inset 0 0 50px rgba(0, 255, 136, 0.2)'
      }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-black flex items-center gap-4 mb-4" style={{
              background: 'linear-gradient(135deg, #24C4E1, #CC33F9, #00ff88, #ff4757)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(36, 196, 225, 1))'
            }}>
              <img 
                src="https://spark.thrivecart.com/0x0/user_assets%2FEHY8FYED%2Fuploads%2Fimages%2Flogo-ia-tech-1736629550.png" 
                alt="IA Tech Logo" 
                className="w-14 h-14 object-contain"
                style={{filter: 'drop-shadow(0 0 20px rgba(36, 196, 225, 0.8))'}}
              />
              <span>🚀 TABLEAU DE BORD AUTOMATISATION 🎯</span>
            </h1>
            <p className="text-2xl font-bold" style={{
              color: '#00ff88',
              textShadow: '0 0 30px rgba(0, 255, 136, 0.8), 0 0 60px rgba(36, 196, 225, 0.5)'
            }}>
              ⚡ Pilotez vos projets d'automatisation par ordre de priorité ⚡
            </p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentPage('list')}
              className="text-white px-8 py-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-110 font-black text-lg"
              style={{
                background: 'linear-gradient(135deg, #24C4E1, #CC33F9, #ff4757)',
                boxShadow: '0 10px 40px rgba(36, 196, 225, 1), 0 0 80px rgba(204, 51, 249, 0.8)',
                border: '2px solid #00ff88'
              }}
            >
              <List size={24} />
              🎮 GÉRER LES TÂCHES
            </button>
            <div className="flex items-center gap-3 text-lg text-white px-6 py-3 rounded-2xl backdrop-blur-sm font-bold" style={{
              background: 'linear-gradient(135deg, rgba(36, 196, 225, 0.9), rgba(204, 51, 249, 0.9))',
              boxShadow: '0 5px 20px rgba(36, 196, 225, 0.6)'
            }}>
              <User size={20} />
              👑 {user?.username}
            </div>
            <button
              onClick={onLogout}
              className="text-white p-4 rounded-2xl transition-all hover:scale-110 font-bold"
              style={{
                background: 'linear-gradient(135deg, #CC33F9, #ff4757)',
                boxShadow: '0 8px 30px rgba(255, 71, 87, 0.8)'
              }}
              title="Se déconnecter"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Section tâches prioritaires ULTRA colorée */}
      <div className="mb-8">
        <h2 className="text-4xl font-black mb-8 flex items-center gap-4" style={{
          background: 'linear-gradient(135deg, #24C4E1, #00ff88)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 15px rgba(36, 196, 225, 0.8))'
        }}>
          <Target style={{color: '#24C4E1', filter: 'drop-shadow(0 0 15px rgba(36, 196, 225, 1))'}} size={40} />
          🎯 TÂCHES PRIORITAIRES À AUTOMATISER 🚀
        </h2>
        
        <div className="grid gap-6">
          {sortedTasks.filter(task => task.status !== 'done').slice(0, 5).map((task, index) => {
            const riceScore = calculateRiceScore(task);
            const colors = ['#ff4757', '#ffa502', '#1dd1a1', '#5f27cd', '#00d2d3'];
            const bgColor = colors[index % colors.length];
            
            return (
              <div
                key={task.id}
                className="p-8 rounded-3xl transition-all duration-500 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${bgColor}40, rgba(36, 196, 225, 0.3), rgba(204, 51, 249, 0.3))`,
                  border: `3px solid ${bgColor}`,
                  boxShadow: `0 15px 50px ${bgColor}80, 0 0 100px rgba(36, 196, 225, 0.5)`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="rounded-full w-16 h-16 flex items-center justify-center font-black text-2xl text-white" style={{
                      background: `linear-gradient(135deg, ${bgColor}, #24C4E1)`,
                      boxShadow: `0 8px 30px ${bgColor}60`
                    }}>
                      #{index + 1}
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusIcon(task.status)}
                      <div>
                        <h3 className="font-black text-xl text-white mb-2" style={{
                          textShadow: `0 0 20px ${bgColor}`
                        }}>{task.name}</h3>
                        <p className="text-white text-lg font-bold opacity-90">{task.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-3xl font-black text-white mb-1">{calculateAnnualGain(task)}h</div>
                      <div className="text-2xl font-black mb-1" style={{color: '#00ff88', textShadow: '0 0 20px rgba(0, 255, 136, 0.8)'}}>{calculateMonetaryGain(task).toLocaleString()}€</div>
                      <div className="text-sm text-white font-bold">💰 Gain/an</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-black" style={{color: '#CC33F9', textShadow: '0 0 20px rgba(204, 51, 249, 0.8)'}}>{riceScore}</div>
                      <div className="text-sm text-white font-bold">🎯 Score RICE</div>
                    </div>
                    <div className="px-6 py-3 rounded-2xl text-lg font-black text-black" style={{
                      background: 'linear-gradient(135deg, #00ff88, #24C4E1)',
                      boxShadow: '0 8px 25px rgba(0, 255, 136, 0.6)'
                    }}>
                      ⚡ Quick Win
                    </div>
                    <div className="flex items-center gap-3">
                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTask(task.id, 'status', 'in-progress')}
                          className="text-white px-6 py-3 rounded-2xl text-lg font-black transition-all hover:scale-110"
                          style={{
                            backgroundColor: '#ff4757',
                            boxShadow: '0 8px 25px rgba(255, 71, 87, 0.6)'
                          }}
                        >
                          🚀 DÉMARRER
                        </button>
                      )}
                      {task.status === 'in-progress' && (
                        <button
                          onClick={() => updateTask(task.id, 'status', 'done')}
                          className="text-white px-6 py-3 rounded-2xl text-lg font-black transition-all hover:scale-110"
                          style={{
                            backgroundColor: '#00ff88',
                            boxShadow: '0 8px 25px rgba(0, 255, 136, 0.6)'
                          }}
                        >
                          ✅ TERMINÉ
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

      {/* Blocs de gains ULTRA colorés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Gains réalisés */}
        <div className="rounded-3xl p-8 transition-all duration-300 hover:scale-105" style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.4), rgba(36, 196, 225, 0.4))',
          border: '3px solid #00ff88',
          boxShadow: '0 25px 60px rgba(0, 255, 136, 0.8), 0 0 100px rgba(0, 255, 136, 0.4)'
        }}>
          <h3 className="text-3xl font-black mb-8 flex items-center gap-4" style={{
            color: '#00ff88',
            textShadow: '0 0 30px rgba(0, 255, 136, 1)'
          }}>
            <CheckCircle style={{color: '#00ff88'}} size={40} />
            ✅ GAINS RÉALISÉS
          </h3>
          <div className="text-center">
            <div className="text-6xl font-black mb-4" style={{
              color: '#00ff88',
              textShadow: '0 0 40px rgba(0, 255, 136, 1)'
            }}>
              {achievedGains.hours}h
            </div>
            <div className="text-xl text-white mb-6 font-bold">par an économisées</div>
            <div className="text-5xl font-black" style={{
              color: '#00ff88',
              textShadow: '0 0 30px rgba(0, 255, 136, 0.8)'
            }}>
              {achievedGains.money.toLocaleString()}€
            </div>
            <div className="text-xl text-white font-bold">💚 de valeur créée/an</div>
          </div>
        </div>

        {/* Gains potentiels */}
        <div className="rounded-3xl p-8 transition-all duration-300 hover:scale-105" style={{
          background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.4), rgba(204, 51, 249, 0.4))',
          border: '3px solid #ff4500',
          boxShadow: '0 25px 60px rgba(255, 69, 0, 0.8), 0 0 100px rgba(255, 69, 0, 0.4)'
        }}>
          <h3 className="text-3xl font-black mb-8 flex items-center gap-4" style={{
            color: '#ff4500',
            textShadow: '0 0 30px rgba(255, 69, 0, 1)'
          }}>
            <Target style={{color: '#ff4500'}} size={40} />
            🎯 GAINS POTENTIELS
          </h3>
          <div className="text-center">
            <div className="text-6xl font-black mb-4" style={{
              color: '#ff4500',
              textShadow: '0 0 40px rgba(255, 69, 0, 1)'
            }}>
              {remainingGains.hours}h
            </div>
            <div className="text-xl text-white mb-6 font-bold">par an à économiser</div>
            <div className="text-5xl font-black" style={{
              color: '#ff4500',
              textShadow: '0 0 30px rgba(255, 69, 0, 0.8)'
            }}>
              {remainingGains.money.toLocaleString()}€
            </div>
            <div className="text-xl text-white font-bold">🔥 de valeur à créer/an</div>
          </div>
        </div>

        {/* ROI */}
        <div className="rounded-3xl p-8 transition-all duration-300 hover:scale-105" style={{
          background: 'linear-gradient(135deg, rgba(36, 196, 225, 0.4), rgba(204, 51, 249, 0.4))',
          border: '3px solid #24C4E1',
          boxShadow: '0 25px 60px rgba(36, 196, 225, 0.8), 0 0 100px rgba(204, 51, 249, 0.4)'
        }}>
          <h3 className="text-3xl font-black mb-8 flex items-center gap-4" style={{
            background: 'linear-gradient(135deg, #24C4E1, #CC33F9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 20px rgba(36, 196, 225, 0.8))'
          }}>
            <TrendingUp style={{color: '#24C4E1'}} size={40} />
            💎 ROI GLOBAL
          </h3>
          <div className="text-center">
            <div className="text-7xl font-black mb-4" style={{
              background: 'linear-gradient(135deg, #24C4E1, #CC33F9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(36, 196, 225, 0.8))'
            }}>
              {tasks.length > 0 ? Math.round(((achievedGains.money + remainingGains.money) / 
                (tasks.reduce((sum, task) => sum + (task.effort * (task.hourlyRate || globalHourlyRate)), 0))) * 100) : 0}%
            </div>
            <div className="text-xl text-white mb-6 font-bold">retour sur investissement</div>
            <div className="text-5xl font-black" style={{
              background: 'linear-gradient(135deg, #24C4E1, #CC33F9)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {(achievedGains.money + remainingGains.money).toLocaleString()}€
            </div>
            <div className="text-xl text-white font-bold">🌈 valeur totale projetée</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiceInteractiveTool;