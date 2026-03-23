import { useState, useEffect } from 'react';
import { Lock, CheckCircle, PlayCircle } from 'lucide-react';
import { labs } from '../data/labs';
import { LabRunner } from './LabRunner';
import { StoredXSSLab } from './StoredXSSLab';
import { storage } from '../lib/storage';

export function LabsList() {
  const [selectedLab, setSelectedLab] = useState<string | null>(null);
  const [completedLabs, setCompletedLabs] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = () => {
    const progress = storage.getProgress();
    const completed = progress.filter(p => p.completed).map(p => p.lab_id);
    setCompletedLabs(new Set(completed));
  };

  const handleLabComplete = () => {
    loadProgress();
  };

  const selectedLabData = labs.find(l => l.id === selectedLab);

  const filteredLabs = labs.filter(lab => {
    if (filterCategory !== 'all' && lab.category !== filterCategory) return false;
    if (filterDifficulty !== 'all' && lab.difficulty !== filterDifficulty) return false;
    return true;
  });

  if (selectedLabData) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedLab(null)}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          ← Volver a la lista
        </button>

        {selectedLabData.category === 'stored' ? (
          <StoredXSSLab lab={selectedLabData} onComplete={handleLabComplete} />
        ) : (
          <LabRunner lab={selectedLabData} onComplete={handleLabComplete} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">Laboratorios XSS</h1>
        <p className="text-gray-400 mb-4">
          {completedLabs.size} de {labs.length} laboratorios completados
        </p>

        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="reflected">Reflected XSS</option>
              <option value="stored">Stored XSS</option>
              <option value="dom">DOM XSS</option>
              <option value="filter-bypass">Filter Bypass</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dificultad</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="expert">Experto</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLabs.map((lab) => {
          const isCompleted = completedLabs.has(lab.id);

          return (
            <div
              key={lab.id}
              className={`bg-gray-800 rounded-lg p-6 border transition-all cursor-pointer hover:scale-105 ${
                isCompleted
                  ? 'border-green-700 hover:border-green-600'
                  : 'border-gray-700 hover:border-blue-600'
              }`}
              onClick={() => setSelectedLab(lab.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-400">#{lab.level}</span>
                  {isCompleted && <CheckCircle className="w-5 h-5 text-green-400" />}
                </div>
                <div className="flex flex-col gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    lab.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                    lab.difficulty === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                    lab.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {lab.difficulty}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{lab.title}</h3>

              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{lab.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                  {lab.category}
                </span>
                <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  {lab.context}
                </span>
              </div>

              <button
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isCompleted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                {isCompleted ? 'Reintentar' : 'Empezar'}
              </button>
            </div>
          );
        })}
      </div>

      {filteredLabs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron laboratorios con estos filtros.</p>
        </div>
      )}
    </div>
  );
}
