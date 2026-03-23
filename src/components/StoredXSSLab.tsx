import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Trash2, MessageSquare } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Lab } from '../types';

interface StoredXSSLabProps {
  lab: Lab;
  onComplete: () => void;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  created_at: string;
}

export function StoredXSSLab({ lab, onComplete }: StoredXSSLabProps) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [lab.id]);

  const loadComments = () => {
    const data = storage.getComments(lab.id);
    setComments(data.reverse());
    checkForXSS(data);
  };

  const checkForXSS = (commentsList: Comment[]) => {
    const xssPatterns = [
      /<script/i,
      /onerror/i,
      /onload/i,
      /javascript:/i,
      /<img/i,
      /<svg/i,
    ];

    const hasXSS = commentsList.some(comment =>
      xssPatterns.some(pattern => pattern.test(comment.content))
    );

    if (hasXSS) {
      setResult({
        success: true,
        message: '¡XSS Detectado! Tu payload se ha almacenado y se ejecutará para todos los usuarios que vean los comentarios.'
      });
      onComplete();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let processedContent = content;
    if (lab.id === 'filter-bypass-encoding') {
      const div = document.createElement('div');
      div.innerHTML = content;
      processedContent = div.textContent || content;
    }

    storage.addComment(lab.id, author || 'Anonymous', processedContent);
    setAuthor('');
    setContent('');
    setResult(null);
    loadComments();

    setLoading(false);
  };

  const deleteComment = (id: string) => {
    storage.deleteComment(id);
    loadComments();
  };

  const clearAll = () => {
    storage.clearComments(lab.id);
    loadComments();
  };

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
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full">
                Stored XSS
              </span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 mb-4">{lab.description}</p>

        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <h3 className="text-red-400 font-semibold mb-2">⚠️ Advertencia sobre Stored XSS</h3>
          <p className="text-gray-300 text-sm">
            Stored XSS es el tipo más peligroso porque el payload se guarda en la base de datos
            y afecta a TODOS los usuarios que vean el contenido. En un escenario real, esto podría
            comprometer las cuentas de muchos usuarios.
          </p>
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
            <p className={result.success ? 'text-green-400' : 'text-red-400'}>
              {result.message}
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Agregar Comentario
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre (opcional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Tu nombre..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comentario
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Escribe tu comentario (o payload)..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
            >
              {loading ? 'Enviando...' : 'Publicar Comentario'}
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Comentarios ({comments.length})
            </h3>
            {comments.length > 0 && (
              <button
                onClick={clearAll}
                className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar Todo
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay comentarios aún. ¡Sé el primero!</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-blue-400 font-medium text-sm">{comment.author}</span>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div
                    className="text-gray-300 text-sm"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                  />
                  <span className="text-gray-500 text-xs mt-2 block">
                    {new Date(comment.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Código Vulnerable</h3>
        <pre className="text-sm text-gray-300 overflow-x-auto bg-gray-900 p-4 rounded">
          <code>{lab.vulnerableCode}</code>
        </pre>
      </div>
    </div>
  );
}
