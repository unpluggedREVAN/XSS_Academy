import { useState } from 'react';
import { Code, Copy, CheckCircle } from 'lucide-react';

type Context = 'html' | 'attribute' | 'javascript' | 'url' | 'css';

export function PayloadPlayground() {
  const [payload, setPayload] = useState('<script>alert("XSS")</script>');
  const [context, setContext] = useState<Context>('html');
  const [copied, setCopied] = useState(false);

  const escapeHtml = (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  const escapeJs = (str: string): string => {
    return JSON.stringify(str).slice(1, -1);
  };

  const escapeUrl = (str: string): string => {
    return encodeURIComponent(str);
  };

  const escapeCss = (str: string): string => {
    return str.replace(/[<>"']/g, (c) => `\\${c.charCodeAt(0).toString(16)} `);
  };

  const renderContext = () => {
    let rendered = '';
    let encoded = '';
    let safe = '';

    switch (context) {
      case 'html':
        rendered = payload;
        encoded = escapeHtml(payload);
        safe = escapeHtml(payload);
        return {
          rendered,
          encoded,
          safe,
          explanation: 'En contexto HTML, debes escapar caracteres especiales como <, >, &, ", \' para prevenir XSS.',
          vulnerable: `<div>${payload}</div>`,
          secure: `<div>${escapeHtml(payload)}</div>`,
          safeApi: `element.textContent = userInput; // No parsea HTML`
        };

      case 'attribute':
        rendered = payload;
        encoded = escapeHtml(payload);
        safe = escapeHtml(payload);
        return {
          rendered,
          encoded,
          safe,
          explanation: 'En atributos HTML, debes escapar comillas y caracteres especiales. Ten cuidado con event handlers.',
          vulnerable: `<input value="${payload}">`,
          secure: `<input value="${escapeHtml(payload)}">`,
          safeApi: `element.setAttribute('value', userInput); // Escapa automáticamente`
        };

      case 'javascript':
        rendered = payload;
        encoded = escapeJs(payload);
        safe = escapeJs(payload);
        return {
          rendered,
          encoded,
          safe,
          explanation: 'En strings JavaScript, debes escapar comillas, backslashes y caracteres especiales.',
          vulnerable: `<script>var x = "${payload}";</script>`,
          secure: `<script>var x = "${escapeJs(payload)}";</script>`,
          safeApi: `// Pasar datos vía data attributes en lugar de inline scripts\n<div data-value="${escapeHtml(payload)}"></div>\n<script>const value = element.dataset.value;</script>`
        };

      case 'url':
        rendered = payload;
        encoded = escapeUrl(payload);
        safe = escapeUrl(payload);
        return {
          rendered,
          encoded,
          safe,
          explanation: 'En URLs, usa encodeURIComponent. Además, valida que el protocolo sea http/https.',
          vulnerable: `<a href="${payload}">Click</a>`,
          secure: `<a href="${escapeUrl(payload)}">Click</a>`,
          safeApi: `// Validar protocolo permitido\nconst url = new URL(userInput, location.href);\nif (['http:', 'https:'].includes(url.protocol)) {\n  link.href = url.href;\n}`
        };

      case 'css':
        rendered = payload;
        encoded = escapeCss(payload);
        safe = escapeCss(payload);
        return {
          rendered,
          encoded,
          safe,
          explanation: 'En CSS, evita usar input de usuario directamente. Si es necesario, escapa caracteres especiales.',
          vulnerable: `<style>.user { color: ${payload}; }</style>`,
          secure: `<style>.user { color: ${escapeCss(payload)}; }</style>`,
          safeApi: `// Mejor: usar clases predefinidas en lugar de estilos dinámicos\nelement.className = 'safe-class';`
        };
    }
  };

  const result = renderContext();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const commonPayloads = {
    basic: '<script>alert("XSS")</script>',
    img: '<img src=x onerror=alert(1)>',
    svg: '<svg onload=alert(1)>',
    iframe: '<iframe src="javascript:alert(1)">',
    attribute: '" onfocus="alert(1)" autofocus="',
    js: '\'; alert(1); //',
    url: 'javascript:alert(1)',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Code className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Payload Playground</h1>
            <p className="text-gray-400">Experimenta con payloads XSS en diferentes contextos</p>
          </div>
        </div>

        <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
          <p className="text-gray-300">
            Este playground te permite probar cómo diferentes payloads se comportan en varios contextos.
            Aprende la importancia del encoding context-aware.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Configuración</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selecciona Contexto
                </label>
                <select
                  value={context}
                  onChange={(e) => setContext(e.target.value as Context)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="html">HTML Context</option>
                  <option value="attribute">Attribute Context</option>
                  <option value="javascript">JavaScript Context</option>
                  <option value="url">URL Context</option>
                  <option value="css">CSS Context</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ingresa Payload
                </label>
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Ingresa tu payload..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payloads Comunes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(commonPayloads).map(([name, p]) => (
                    <button
                      key={name}
                      onClick={() => setPayload(p)}
                      className="px-3 py-2 bg-gray-900 hover:bg-gray-700 text-gray-300 rounded text-sm transition-colors border border-gray-600"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Análisis</h2>

            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-2">Explicación</h3>
                <p className="text-gray-300 text-sm">{result.explanation}</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-300">Payload Original</h3>
                  <button
                    onClick={() => copyToClipboard(result.rendered)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div className="bg-gray-900 rounded p-3 border border-gray-700">
                  <code className="text-red-400 text-sm break-all">{result.rendered}</code>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Encoded (Seguro)</h3>
                <div className="bg-gray-900 rounded p-3 border border-gray-700">
                  <code className="text-green-400 text-sm break-all">{result.encoded}</code>
                </div>
              </div>

              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
                <h3 className="text-red-400 font-medium mb-2 text-sm">❌ Código Vulnerable</h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  <code>{result.vulnerable}</code>
                </pre>
              </div>

              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <h3 className="text-green-400 font-medium mb-2 text-sm">✓ Código Seguro (Manual)</h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  <code>{result.secure}</code>
                </pre>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h3 className="text-blue-400 font-medium mb-2 text-sm">✓ API Segura (Recomendado)</h3>
                <pre className="text-xs text-gray-300 overflow-x-auto">
                  <code>{result.safeApi}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Reglas de Encoding por Contexto</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-blue-400 font-medium mb-2">HTML Context</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Escapar: {'<'} {'>'} & " '</li>
              <li>• Usar: textContent</li>
              <li>• Evitar: innerHTML</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-purple-400 font-medium mb-2">JavaScript Context</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Escapar: " ' \ newlines</li>
              <li>• Usar: JSON.stringify</li>
              <li>• Evitar: inline scripts</li>
            </ul>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-green-400 font-medium mb-2">URL Context</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Usar: encodeURIComponent</li>
              <li>• Validar: protocolo http/https</li>
              <li>• Evitar: javascript: URLs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
