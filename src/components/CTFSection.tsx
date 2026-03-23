import React, { useState, useEffect } from 'react';
import { Shield, Lock, Unlock, Trophy, AlertTriangle, BookOpen, Eye, EyeOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ctfChallenges, CTFChallenge } from '../data/ctfChallenges';

interface CTFState {
  isUnlocked: boolean;
  challenges: {
    [key: string]: {
      hintsRevealed: number;
      payload: string;
      isCompleted: boolean;
      currentScore: number;
      solutionUnlocked: boolean;
    };
  };
}

const STORAGE_KEY = 'xss_academy_ctf_state';

const loadState = (): CTFState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading CTF state:', error);
  }

  return {
    isUnlocked: false,
    challenges: {}
  };
};

const saveState = (state: CTFState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving CTF state:', error);
  }
};

export default function CTFSection() {
  const [state, setState] = useState<CTFState>(loadState);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === 'vivaelhackatorio') {
      setState(prev => ({ ...prev, isUnlocked: true }));
      setError('');
    } else {
      setError('Contraseña incorrecta. Intenta de nuevo.');
      setPassword('');
    }
  };

  if (!state.isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/10 rounded-full">
                <Lock className="w-12 h-12 text-red-400" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2 text-white">
              Sección CTF
            </h1>
            <p className="text-slate-400 text-center mb-8">
              Esta sección está protegida. Necesitas la contraseña para acceder a los retos.
            </p>

            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="Ingresa la contraseña"
                    data-hint="inspect-me"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div
                  className="mt-2 text-xs text-slate-500"
                  style={{ display: 'none' }}
                  data-secret="dml2YWVsaGFja2F0b3Jpbw=="
                >
                  Hint: Base64 encoded
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertTriangle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Unlock size={20} />
                Desbloquear
              </button>
            </form>

            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-400 text-sm flex items-start gap-2">
                <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Pista:</strong> Si prestas atención a lo que aprendiste en esta academia,
                  podrías encontrar algo interesante en esta página...
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-green-400" />
            <h1 className="text-4xl font-bold text-white">Competencia CTF</h1>
          </div>
          <p className="text-xl text-slate-300 mb-2">
            Demuestra tus habilidades en XSS
          </p>
          <p className="text-slate-400">
            Completa los retos para poner en práctica todo lo aprendido
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {ctfChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              state={state}
              setState={setState}
            />
          ))}
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="text-yellow-400" />
            Reglas de la Competencia
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Cada reto vale 100 puntos inicialmente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Puedes solicitar hasta 3 pistas por reto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Cada pista reduce tu puntuación en 15 puntos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>Lee la historia y el contexto cuidadosamente para entender el escenario</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>El solucionario se desbloquea solo después de usar todas las pistas</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

interface ChallengeCardProps {
  challenge: CTFChallenge;
  state: CTFState;
  setState: React.Dispatch<React.SetStateAction<CTFState>>;
}

function ChallengeCard({ challenge, state, setState }: ChallengeCardProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'challenge' | 'solution'>('story');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [solutionPassword, setSolutionPassword] = useState('');
  const [solutionError, setSolutionError] = useState('');

  const challengeState = state.challenges[challenge.id] || {
    hintsRevealed: 0,
    payload: '',
    isCompleted: false,
    currentScore: challenge.points,
    solutionUnlocked: false
  };

  const updateChallengeState = (updates: Partial<typeof challengeState>) => {
    setState(prev => ({
      ...prev,
      challenges: {
        ...prev.challenges,
        [challenge.id]: {
          ...challengeState,
          ...updates
        }
      }
    }));
  };

  const difficultyColors = {
    easy: 'text-green-400 bg-green-400/10 border-green-400/20',
    medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    hard: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  const handleRevealHint = () => {
    if (challengeState.hintsRevealed < challenge.hints.length) {
      const newHintsRevealed = challengeState.hintsRevealed + 1;
      const newScore = challenge.points - (newHintsRevealed * challenge.hintPenalty);
      updateChallengeState({
        hintsRevealed: newHintsRevealed,
        currentScore: newScore
      });
    }
  };

  const handleTestPayload = () => {
    const testResult = challenge.testFunction(challengeState.payload);
    setResult(testResult);

    if (testResult.success) {
      updateChallengeState({ isCompleted: true });
      setActiveTab('solution');
    }
  };

  const handleUnlockSolution = (e: React.FormEvent) => {
    e.preventDefault();

    if (solutionPassword === challenge.solution.password) {
      updateChallengeState({ solutionUnlocked: true });
      setSolutionError('');
    } else {
      setSolutionError('Contraseña incorrecta.');
      setSolutionPassword('');
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={challenge.imageUrl}
          alt={challenge.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium border backdrop-blur-sm ${difficultyColors[challenge.difficulty]}`}>
          {challenge.difficulty.toUpperCase()}
        </div>
      </div>

      <div className="p-6 border-b border-slate-700">
        <h3 className="text-2xl font-bold text-white mb-3">{challenge.title}</h3>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Trophy size={16} className="text-yellow-400" />
            {challengeState.currentScore} pts
            {challengeState.hintsRevealed > 0 && (
              <span className="text-red-400">(-{challengeState.hintsRevealed * challenge.hintPenalty})</span>
            )}
          </span>
          {challengeState.isCompleted && (
            <span className="flex items-center gap-1 text-green-400">
              <Shield size={16} />
              Completado
            </span>
          )}
        </div>
      </div>

      <div className="border-b border-slate-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab('story')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'story'
                ? 'bg-slate-700/50 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Historia
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'challenge'
                ? 'bg-slate-700/50 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reto
          </button>
          <button
            onClick={() => setActiveTab('solution')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'solution'
                ? 'bg-slate-700/50 text-white border-b-2 border-blue-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solucionario
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto" style={{ maxHeight: '600px' }}>
        {activeTab === 'story' && (
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-blockquote:text-white prose-blockquote:border-l-blue-500 prose-code:text-green-400 prose-pre:bg-slate-950 prose-pre:text-white prose-em:text-white">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {challenge.story}
            </ReactMarkdown>
          </div>
        )}

        {activeTab === 'challenge' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Objetivo</h4>
              <p className="text-white">{challenge.objective}</p>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-code:text-green-400 prose-pre:bg-slate-950 prose-pre:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-em:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {challenge.technicalDetails}
                </ReactMarkdown>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-2">Código Vulnerable</h4>
              <pre className="text-xs text-white overflow-x-auto">
                <code>{challenge.vulnerableCode}</code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-white">Pistas ({challengeState.hintsRevealed}/{challenge.hints.length})</h4>
                {challengeState.hintsRevealed < challenge.hints.length && (
                  <button
                    onClick={handleRevealHint}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Revelar Pista (-{challenge.hintPenalty} pts)
                  </button>
                )}
              </div>
              {challengeState.hintsRevealed > 0 ? (
                <div className="space-y-2">
                  {challenge.hints.slice(0, challengeState.hintsRevealed).map((hint, index) => (
                    <div key={index} className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-white text-sm">
                      <strong>Pista {index + 1}:</strong> {hint}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white text-sm">No has revelado ninguna pista todavía.</p>
              )}
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Tu Payload</h4>
              <textarea
                value={challengeState.payload}
                onChange={(e) => updateChallengeState({ payload: e.target.value })}
                className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-mono text-sm"
                placeholder="Escribe tu payload aquí..."
              />
              <button
                onClick={handleTestPayload}
                className="mt-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Probar Payload
              </button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg border ${
                result.success
                  ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                <p className="font-medium mb-1">
                  {result.success ? '¡Éxito!' : 'Intenta de nuevo'}
                </p>
                <p className="text-sm">{result.message}</p>
                {result.success && (
                  <p className="text-sm mt-2 text-green-300">
                    Puntuación final: <strong>{challengeState.currentScore} puntos</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'solution' && (
          <div>
            {!challengeState.solutionUnlocked ? (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Solucionario Protegido</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Ingresa la contraseña para acceder al solucionario detallado
                  </p>
                </div>

                <form onSubmit={handleUnlockSolution} className="space-y-4">
                  <div>
                    <label htmlFor={`solution-pwd-${challenge.id}`} className="block text-sm font-medium text-slate-300 mb-2">
                      Contraseña del Solucionario
                    </label>
                    <input
                      type="password"
                      id={`solution-pwd-${challenge.id}`}
                      name={`solution-pwd-${challenge.id}`}
                      value={solutionPassword}
                      onChange={(e) => setSolutionPassword(e.target.value)}
                      autoComplete="off"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-500"
                      placeholder="Ingresa la contraseña"
                      required
                    />
                  </div>

                  {solutionError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {solutionError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Desbloquear Solucionario
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-green-400 font-bold mb-2">Payload Correcto</h4>
                  <pre className="text-sm bg-slate-900/50 p-3 rounded text-green-300 overflow-x-auto">
                    <code>{challenge.solution.payload}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">Pasos para Resolver</h4>
                  <ol className="space-y-2 list-decimal list-inside text-white">
                    {challenge.solution.steps.map((step, index) => (
                      <li key={index} className="text-white">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <h4 className="text-white font-bold mb-3">Aprendizajes Clave</h4>
                  <ul className="space-y-2 list-disc list-inside text-white">
                    {challenge.solution.keyLearnings.map((learning, index) => (
                      <li key={index} className="text-white">
                        {learning}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-6">
                  <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-white prose-strong:text-white prose-code:text-green-400 prose-pre:bg-slate-950 prose-pre:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-a:text-blue-400 prose-em:text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {challenge.solution.explanation}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
