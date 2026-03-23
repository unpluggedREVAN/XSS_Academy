import { useEffect, useState } from 'react';
import { Trophy, Target, Zap, Award, CheckCircle, Circle } from 'lucide-react';
import { storage } from '../lib/storage';
import { labs } from '../data/labs';

interface UserProgress {
  lab_id: string;
  completed: boolean;
  attempts: number;
  hints_used: number;
  completed_at: string | null;
}

export function ProgressDashboard() {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const data = storage.getProgress();
    setProgress(data);
    setLoading(false);
  };

  const completedLabs = progress.filter(p => p.completed).length;
  const totalLabs = labs.length;
  const completionRate = totalLabs > 0 ? (completedLabs / totalLabs) * 100 : 0;

  const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);
  const totalHints = progress.reduce((sum, p) => sum + p.hints_used, 0);

  const getLabProgress = (labId: string) => {
    return progress.find(p => p.lab_id === labId);
  };

  const categories = {
    reflected: labs.filter(l => l.category === 'reflected'),
    stored: labs.filter(l => l.category === 'stored'),
    dom: labs.filter(l => l.category === 'dom'),
    'filter-bypass': labs.filter(l => l.category === 'filter-bypass'),
    advanced: labs.filter(l => l.category === 'advanced'),
  };

  const getCategoryProgress = (category: string) => {
    const categoryLabs = categories[category as keyof typeof categories] || [];
    const completed = categoryLabs.filter(lab => {
      const p = getLabProgress(lab.id);
      return p?.completed;
    }).length;

    return {
      completed,
      total: categoryLabs.length,
      percentage: categoryLabs.length > 0 ? (completed / categoryLabs.length) * 100 : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Cargando progreso...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Tu Progreso</h1>
            <p className="text-gray-400">Sigue tu avance en el XSS Academy</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-lg p-6 border border-blue-700">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Labs Completados</h3>
          </div>
          <p className="text-4xl font-bold text-blue-400 mb-1">
            {completedLabs}/{totalLabs}
          </p>
          <p className="text-sm text-gray-400">{completionRate.toFixed(0)}% completado</p>
          <div className="mt-3 bg-gray-900 rounded-full h-2">
            <div
              className="bg-blue-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-lg p-6 border border-purple-700">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Total Intentos</h3>
          </div>
          <p className="text-4xl font-bold text-purple-400">{totalAttempts}</p>
          <p className="text-sm text-gray-400">A través de todos los labs</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 rounded-lg p-6 border border-yellow-700">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Hints Usados</h3>
          </div>
          <p className="text-4xl font-bold text-yellow-400">{totalHints}</p>
          <p className="text-sm text-gray-400">Ayuda utilizada</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-lg p-6 border border-green-700">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Tasa de Éxito</h3>
          </div>
          <p className="text-4xl font-bold text-green-400">
            {totalAttempts > 0 ? Math.round((completedLabs / totalAttempts) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-400">Labs vs Intentos</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Progreso por Categoría</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([category, categoryLabs]) => {
            const categoryProgress = getCategoryProgress(category);

            return (
              <div key={category} className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {category.replace('-', ' ')}
                  </h3>
                  <span className="text-sm text-gray-400">
                    {categoryProgress.completed}/{categoryProgress.total}
                  </span>
                </div>

                <div className="bg-gray-800 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-3 transition-all duration-500"
                    style={{ width: `${categoryProgress.percentage}%` }}
                  />
                </div>

                <div className="space-y-2">
                  {categoryLabs.map(lab => {
                    const labProgress = getLabProgress(lab.id);

                    return (
                      <div
                        key={lab.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {labProgress?.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-600" />
                          )}
                          <span className={labProgress?.completed ? 'text-green-400' : 'text-gray-400'}>
                            Nivel {lab.level}: {lab.title.slice(0, 30)}
                            {lab.title.length > 30 ? '...' : ''}
                          </span>
                        </div>
                        {labProgress && !labProgress.completed && labProgress.attempts > 0 && (
                          <span className="text-yellow-400 text-xs">
                            {labProgress.attempts} intentos
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-2xl font-bold text-white mb-6">Logros Recientes</h2>

        <div className="space-y-3">
          {progress
            .filter(p => p.completed)
            .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
            .slice(0, 5)
            .map(p => {
              const lab = labs.find(l => l.id === p.lab_id);
              if (!lab) return null;

              return (
                <div
                  key={p.lab_id}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <h3 className="text-white font-medium">{lab.title}</h3>
                      <p className="text-gray-400 text-sm">
                        Completado el {new Date(p.completed_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{p.attempts} intentos</p>
                    <p className="text-sm text-yellow-400">{p.hints_used} hints</p>
                  </div>
                </div>
              );
            })}

          {progress.filter(p => p.completed).length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Aún no has completado ningún laboratorio. ¡Empieza ahora!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
