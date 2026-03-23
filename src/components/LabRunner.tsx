import { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Lightbulb, BookOpen, Code } from 'lucide-react';
import type { Lab, LabResult } from '../types';
import { storage } from '../lib/storage';

interface LabRunnerProps {
  lab: Lab;
  onComplete: () => void;
}

export function LabRunner({ lab, onComplete }: LabRunnerProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<LabResult | null>(null);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [guidedMode, setGuidedMode] = useState(false);
  const sandboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lab.category === 'dom' && lab.id.includes('postmessage')) {
      const handleMessage = (event: MessageEvent) => {
        if (sandboxRef.current && typeof event.data === 'string') {
          executeSandboxed(event.data);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [lab]);

  const executeSandboxed = (payload: string) => {
    if (!sandboxRef.current) return;

    const detectionScript = `
      <script>
        window.xssDetected = false;
        const originalAlert = window.alert;
        window.alert = function(...args) {
          window.xssDetected = true;
          window.parent.postMessage({ type: 'XSS_DETECTED', payload: ${JSON.stringify(payload)} }, '*');
          return 'XSS Ejecutado!';
        };
      </script>
    `;

    let content = '';
    switch (lab.id) {
      case 'reflected-basic':
        content = `${detectionScript}<h3>Resultados para: ${payload}</h3>`;
        break;
      case 'reflected-attribute':
        content = `${detectionScript}<input type="text" value="${payload}" readonly>`;
        break;
      case 'dom-xss-innerhtml':
        content = `${detectionScript}<div id="content"></div><script>
          const hash = decodeURIComponent('${encodeURIComponent(payload)}');
          document.getElementById('content').innerHTML = hash;
        </script>`;
        break;
      case 'dom-xss-document-write':
        content = `${detectionScript}<script>
          document.write('<div>Bienvenido, ${payload}</div>');
        </script>`;
        break;
      case 'javascript-context':
        content = `${detectionScript}<script>
          var userTheme = '${payload}';
          console.log('Theme:', userTheme);
        </script>`;
        break;
      case 'url-context':
        content = `${detectionScript}<a href="${payload}" id="testLink">Click aquí</a>
        <script>
          document.getElementById('testLink').addEventListener('click', (e) => {
            e.preventDefault();
            if (window.xssDetected) {
              window.parent.postMessage({ type: 'XSS_DETECTED', payload: ${JSON.stringify(payload)} }, '*');
            }
          });
          setTimeout(() => {
            if (document.getElementById('testLink').href.startsWith('javascript:')) {
              window.parent.postMessage({ type: 'XSS_DETECTED', payload: ${JSON.stringify(payload)} }, '*');
            }
          }, 100);
        </script>`;
        break;
      case 'filter-bypass-basic':
      case 'filter-bypass-encoding':
      case 'filter-bypass-case':
        content = `${detectionScript}<div>${payload}</div>`;
        break;
      case 'dom-xss-eval':
        content = `${detectionScript}<script>
          try {
            setTimeout('console.log("Message: ${payload}")', 100);
          } catch(e) {}
        </script>`;
        break;
      case 'mutation-xss':
      case 'csp-bypass':
        content = `${detectionScript}<div id="output">${payload}</div>`;
        break;
      case 'postmessage-xss':
        content = `${detectionScript}<div id="messages"></div>`;
        break;
      default:
        content = `${detectionScript}<div>${payload}</div>`;
    }

    const blob = new Blob([content], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.sandbox.add('allow-scripts');
    iframe.style.width = '100%';
    iframe.style.height = '200px';
    iframe.style.border = '1px solid #374151';
    iframe.style.borderRadius = '0.5rem';
    iframe.style.backgroundColor = '#1f2937';
    iframe.src = blobUrl;

    if (sandboxRef.current) {
      sandboxRef.current.innerHTML = '';
      sandboxRef.current.appendChild(iframe);
    }

    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  };

  const checkPayload = async (payload: string): Promise<boolean> => {
    if (lab.category === 'filter-bypass') {
      if (lab.id === 'filter-bypass-basic') {
        if (/script/i.test(payload)) return false;
      } else if (lab.id === 'filter-bypass-case') {
        if (payload.includes('<script>')) return false;
      }
    }

    const xssPatterns = [
      /<script/i,
      /onerror\s*=/i,
      /onload\s*=/i,
      /onfocus\s*=/i,
      /onclick\s*=/i,
      /javascript:/i,
      /<img/i,
      /<svg/i,
      /<iframe/i,
      /eval\(/i,
    ];

    return xssPatterns.some(pattern => pattern.test(payload));
  };

  const handleSubmit = async () => {
    setAttempts(prev => prev + 1);

    const isXSS = await checkPayload(input);

    if (isXSS) {
      executeSandboxed(input);

      setTimeout(() => {
        setResult({
          success: true,
          message: '¡Excelente! Has ejecutado XSS exitosamente.',
          executedPayload: input
        });

        storage.saveProgress(lab.id, true, attempts + 1, currentHintLevel);
        onComplete();
      }, 500);
    } else {
      setResult({
        success: false,
        message: 'Ese payload no parece ser XSS. Revisa los hints si necesitas ayuda.'
      });
      executeSandboxed(input);
    }
  };

  const showNextHint = () => {
    if (currentHintLevel < lab.hints.length) {
      setCurrentHintLevel(currentHintLevel + 1);
    }
  };

  useEffect(() => {
    const handleXssDetection = (event: MessageEvent) => {
      if (event.data?.type === 'XSS_DETECTED') {
        setResult({
          success: true,
          message: '¡XSS Detectado! El payload se ejecutó correctamente.',
          executedPayload: event.data.payload
        });
      }
    };

    window.addEventListener('message', handleXssDetection);
    return () => window.removeEventListener('message', handleXssDetection);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{lab.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                Nivel {lab.level}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                {lab.difficulty}
              </span>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                {lab.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => setGuidedMode(!guidedMode)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            {guidedMode ? 'Modo Libre' : 'Modo Guiado'}
          </button>
        </div>

        <p className="text-gray-300 mb-4">{lab.description}</p>

        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Objetivos
          </h3>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            {lab.objectives.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>

        {guidedMode && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Teoría</h3>
            <p className="text-gray-300 whitespace-pre-line">{lab.theory}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Laboratorio Interactivo</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ingresa tu payload
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="<script>alert('XSS')</script>"
              />
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Ejecutar
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">Salida (Sandbox)</h4>
              <button
                onClick={() => setShowCode(!showCode)}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showCode ? 'Ocultar' : 'Ver'} Código Vulnerable
              </button>
            </div>

            {showCode && (
              <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-red-400">Código Vulnerable</span>
                </div>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  <code>{lab.vulnerableCode}</code>
                </pre>
              </div>
            )}

            <div
              ref={sandboxRef}
              className="bg-gray-900 rounded-lg p-4 min-h-[200px] border border-gray-700"
            >
              <p className="text-gray-500 text-sm">La salida aparecerá aquí...</p>
            </div>
          </div>

          {result && (
            <div
              className={`rounded-lg p-4 border ${
                result.success
                  ? 'bg-green-900/30 border-green-700'
                  : 'bg-red-900/30 border-red-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.message}
                  </p>
                  {result.executedPayload && (
                    <p className="text-gray-400 text-sm mt-2">
                      Payload: <code className="bg-gray-800 px-2 py-1 rounded">{result.executedPayload}</code>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Hints ({currentHintLevel}/{lab.hints.length})
            </h3>
            {currentHintLevel < lab.hints.length && (
              <button
                onClick={showNextHint}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors"
              >
                Mostrar Hint
              </button>
            )}
          </div>

          <div className="space-y-3">
            {lab.hints.slice(0, currentHintLevel).map((hint, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-yellow-700/30">
                <h4 className="text-yellow-400 font-medium mb-1">
                  Nivel {hint.level}: {hint.title}
                </h4>
                <p className="text-gray-300 text-sm">{hint.content}</p>
              </div>
            ))}
            {currentHintLevel === 0 && (
              <p className="text-gray-500 text-sm">Haz clic en "Mostrar Hint" si necesitas ayuda.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Solución</h3>
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
            >
              {showSolution ? 'Ocultar' : 'Ver'} Solución
            </button>
          </div>

          {showSolution ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-4">{lab.solution.explanation}</p>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 space-y-3 text-sm">
                <div>
                  <span className="text-blue-400 font-medium">Source:</span>
                  <span className="text-gray-300 ml-2">{lab.solution.source}</span>
                </div>
                <div>
                  <span className="text-red-400 font-medium">Sink:</span>
                  <span className="text-gray-300 ml-2">{lab.solution.sink}</span>
                </div>
                <div>
                  <span className="text-purple-400 font-medium">Contexto:</span>
                  <span className="text-gray-300 ml-2">{lab.solution.context}</span>
                </div>
                <div>
                  <span className="text-green-400 font-medium">Payload:</span>
                  <code className="text-gray-300 ml-2 bg-gray-800 px-2 py-1 rounded">
                    {lab.solution.payload}
                  </code>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h4 className="text-blue-400 font-medium mb-2">¿Por qué funciona?</h4>
                <p className="text-gray-300 text-sm">{lab.solution.why}</p>
              </div>

              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">Cómo Arreglarlo</h4>
                <p className="text-gray-300 text-sm mb-3">{lab.solution.fix}</p>
                <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-900 p-3 rounded">
                  <code>{lab.solution.fixCode}</code>
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Intenta resolver el laboratorio por ti mismo antes de ver la solución.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
