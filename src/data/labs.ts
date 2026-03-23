import type { Lab } from '../types';

export const labs: Lab[] = [
  {
    id: 'reflected-basic',
    title: 'Reflected XSS - Nivel Básico',
    level: 1,
    category: 'reflected',
    difficulty: 'beginner',
    description: 'Aprende los fundamentos de Reflected XSS inyectando un script simple en un campo de búsqueda vulnerable.',
    objectives: [
      'Identificar dónde se refleja tu entrada',
      'Inyectar un payload XSS básico',
      'Ejecutar JavaScript en el contexto de la página'
    ],
    theory: `En Reflected XSS, tu payload se envía al servidor y se refleja inmediatamente en la respuesta HTML sin sanitización.

El servidor toma tu entrada (source) y la inserta directamente en la página (sink), donde el navegador la ejecuta.

Este laboratorio simula un buscador vulnerable que muestra "Resultados para: [tu búsqueda]" sin escapar el HTML.`,
    hints: [
      {
        level: 1,
        title: 'Identifica el punto de inyección',
        content: 'Observa cómo tu búsqueda aparece en la página. El texto se inserta directamente en el HTML sin filtrado.'
      },
      {
        level: 2,
        title: 'Contexto HTML',
        content: 'Estás en contexto HTML puro. Puedes inyectar tags completos como <script>, <img>, etc.'
      },
      {
        level: 3,
        title: 'Payload sugerido',
        content: 'Intenta: <script>alert("XSS")</script> o <img src=x onerror=alert("XSS")>'
      }
    ],
    solution: {
      explanation: 'Este es el XSS más básico. La entrada del usuario se refleja directamente en HTML sin escape.',
      source: 'Campo de búsqueda (parámetro "search")',
      sink: 'innerHTML del elemento de resultados',
      context: 'HTML context - dentro del body',
      payload: '<script>alert("XSS")</script>',
      why: 'El navegador parsea el HTML, encuentra el tag <script>, y ejecuta el código JavaScript dentro.',
      fix: 'Escapar todos los caracteres HTML especiales antes de insertarlos',
      fixCode: `// VULNERABLE
resultsDiv.innerHTML = 'Resultados para: ' + searchQuery;

// SEGURO
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
resultsDiv.innerHTML = 'Resultados para: ' + escapeHtml(searchQuery);

// O mejor aún, usar textContent
resultsDiv.textContent = 'Resultados para: ' + searchQuery;`
    },
    vulnerableCode: `function search(query) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<h3>Resultados para: ' + query + '</h3>';
}`,
    context: 'html'
  },
  {
    id: 'reflected-attribute',
    title: 'Reflected XSS - Contexto de Atributo',
    level: 2,
    category: 'reflected',
    difficulty: 'beginner',
    description: 'Inyecta XSS cuando tu entrada está dentro del valor de un atributo HTML.',
    objectives: [
      'Entender el contexto de atributo',
      'Romper el contexto del atributo',
      'Inyectar un event handler malicioso'
    ],
    theory: `Cuando tu entrada está dentro de un atributo HTML, no puedes simplemente usar <script> porque ya estás dentro de un tag.

Debes SALIR del atributo actual y luego agregar tu propio código malicioso.

Estrategias:
1. Cerrar el atributo con " o '
2. Agregar un nuevo atributo con event handler (onerror, onload, etc.)
3. O cerrar el tag completamente y abrir uno nuevo`,
    hints: [
      {
        level: 1,
        title: 'Observa el código generado',
        content: 'Tu entrada aparece dentro de value="...". Necesitas salir de las comillas.'
      },
      {
        level: 2,
        title: 'Rompe el atributo',
        content: 'Usa comillas " para cerrar el atributo value, luego agrega tu propio atributo.'
      },
      {
        level: 3,
        title: 'Event handler',
        content: 'Intenta: " onfocus="alert(1)" autofocus="'
      }
    ],
    solution: {
      explanation: 'La entrada está en un atributo value. Necesitamos romper el contexto del atributo.',
      source: 'Campo de nombre',
      sink: 'Atributo value de un input',
      context: 'Attribute context',
      payload: '" onfocus="alert(1)" autofocus="',
      why: 'Las comillas cierran el atributo value, luego agregamos onfocus que se ejecuta automáticamente con autofocus.',
      fix: 'Escapar comillas y caracteres especiales en contextos de atributos',
      fixCode: `// VULNERABLE
input.value = userInput;
// Cuando se serializa: <input value="userInput">

// SEGURO: usar setAttribute o textContent
input.setAttribute('value', userInput); // Escapa automáticamente
// O configurar la propiedad directamente
input.value = userInput; // Seguro si no serializa a HTML

// Si DEBES generar HTML string:
function escapeAttr(str) {
  return str.replace(/["&<>]/g, c => ({
    '"': '&quot;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[c]));
}`
    },
    vulnerableCode: `function displayName(name) {
  const html = '<input type="text" value="' + name + '" readonly>';
  document.getElementById('nameDisplay').innerHTML = html;
}`,
    context: 'attribute'
  },
  {
    id: 'stored-xss-basic',
    title: 'Stored XSS - Comentarios',
    level: 3,
    category: 'stored',
    difficulty: 'intermediate',
    description: 'El payload más peligroso: XSS que se almacena en la base de datos y afecta a todos los usuarios.',
    objectives: [
      'Entender la persistencia de Stored XSS',
      'Inyectar un payload que se guarde en la DB',
      'Ver cómo afecta a otros usuarios'
    ],
    theory: `Stored XSS (también llamado Persistent XSS) es el más peligroso porque:

1. El payload se GUARDA en el servidor (base de datos)
2. Se ejecuta cada vez que alguien ve el contenido
3. No requiere que la víctima haga clic en un enlace especial
4. Puede afectar a muchos usuarios

Casos comunes: sistemas de comentarios, perfiles de usuario, mensajes, reviews.

En este lab, los comentarios se guardan en la base de datos real y se muestran a todos sin sanitización.`,
    hints: [
      {
        level: 1,
        title: 'Sistema de comentarios',
        content: 'Este sistema guarda tu comentario y lo muestra a todos. Intenta inyectar código en el campo de comentario.'
      },
      {
        level: 2,
        title: 'Persistencia',
        content: 'Una vez guardado, tu payload se ejecutará cada vez que alguien vea los comentarios.'
      },
      {
        level: 3,
        title: 'Payload simple',
        content: 'Intenta: <img src=x onerror=alert("Stored XSS")>'
      }
    ],
    solution: {
      explanation: 'Los comentarios se guardan en la base de datos sin sanitización y se renderizan con innerHTML.',
      source: 'Formulario de comentarios',
      sink: 'Base de datos → innerHTML al renderizar',
      context: 'HTML context',
      payload: '<img src=x onerror=alert("Stored XSS")>',
      why: 'El payload se guarda tal cual en la DB. Al mostrarse, innerHTML parsea el HTML y ejecuta el onerror.',
      fix: 'Sanitizar en el input Y escapar en el output',
      fixCode: `// En el backend: validar y sanitizar
import DOMPurify from 'isomorphic-dompurify';

function saveComment(content) {
  // Opción 1: Rechazar HTML completamente
  if (/<[^>]*>/g.test(content)) {
    throw new Error('HTML no permitido');
  }

  // Opción 2: Sanitizar permitiendo tags seguros
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
  db.save(clean);
}

// En el frontend: escapar al renderizar
comments.forEach(c => {
  const div = document.createElement('div');
  div.textContent = c.content; // No parsea HTML
  container.appendChild(div);
});`
    },
    vulnerableCode: `async function displayComments() {
  const { data } = await supabase
    .from('stored_comments')
    .select('*');

  let html = '';
  data.forEach(comment => {
    html += '<div class="comment">' + comment.content + '</div>';
  });
  document.getElementById('comments').innerHTML = html;
}`,
    context: 'html'
  },
  {
    id: 'dom-xss-innerhtml',
    title: 'DOM XSS - innerHTML',
    level: 4,
    category: 'dom',
    difficulty: 'intermediate',
    description: 'Explota una vulnerabilidad DOM-based usando innerHTML como sink.',
    objectives: [
      'Entender DOM-based XSS',
      'Identificar source (location.hash) y sink (innerHTML)',
      'Ejecutar código sin interacción con el servidor'
    ],
    theory: `DOM-based XSS ocurre completamente en el cliente. El servidor nunca ve el payload.

Flow típico:
1. Source: location.hash, location.search, etc.
2. JavaScript del cliente procesa este input
3. Sink: innerHTML, eval, document.write, etc.
4. Ejecución sin que el payload toque el servidor

Ventaja para el atacante: El payload no aparece en logs del servidor.

Este lab usa location.hash como source y innerHTML como sink.`,
    hints: [
      {
        level: 1,
        title: 'Fragmento de URL',
        content: 'Este lab lee de location.hash (el #fragment de la URL). Modifica la URL después del #.'
      },
      {
        level: 2,
        title: 'innerHTML sink',
        content: 'El código usa innerHTML para insertar el fragmento. Puedes inyectar HTML completo.'
      },
      {
        level: 3,
        title: 'Payload en URL',
        content: 'Agrega a la URL: #<img src=x onerror=alert("DOM XSS")>'
      }
    ],
    solution: {
      explanation: 'El código lee location.hash y lo inserta directamente con innerHTML sin validación.',
      source: 'location.hash (fragmento de URL después de #)',
      sink: 'element.innerHTML',
      context: 'HTML context',
      payload: '<img src=x onerror=alert("DOM XSS")>',
      why: 'location.hash contiene nuestro payload. innerHTML parsea el HTML y ejecuta el event handler.',
      fix: 'Usar textContent en lugar de innerHTML, o sanitizar la entrada',
      fixCode: `// VULNERABLE
const hash = location.hash.slice(1);
element.innerHTML = hash;

// SEGURO: opción 1 - textContent
element.textContent = hash;

// SEGURO: opción 2 - sanitizar
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(hash);
element.innerHTML = clean;

// SEGURO: opción 3 - validar formato esperado
if (/^[a-zA-Z0-9-_]+$/.test(hash)) {
  element.textContent = hash;
}`
    },
    vulnerableCode: `function loadContent() {
  const hash = location.hash.slice(1); // Quita el #
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = decodeURIComponent(hash);
}

window.addEventListener('hashchange', loadContent);
loadContent();`,
    context: 'html'
  },
  {
    id: 'dom-xss-document-write',
    title: 'DOM XSS - document.write',
    level: 5,
    category: 'dom',
    difficulty: 'intermediate',
    description: 'Explota document.write, uno de los sinks más peligrosos.',
    objectives: [
      'Entender por qué document.write es peligroso',
      'Usar URL parameters como source',
      'Inyectar scripts que se ejecutan inmediatamente'
    ],
    theory: `document.write() es extremadamente peligroso porque:

1. Escribe directamente al documento durante el parsing
2. Puede inyectar scripts que se ejecutan inmediatamente
3. Difícil de sanitizar correctamente
4. Obsoleto y debe evitarse

Este lab usa URLSearchParams (location.search) como source y document.write como sink.`,
    hints: [
      {
        level: 1,
        title: 'Query parameters',
        content: 'El lab lee el parámetro "name" de la URL. Modifica ?name=... en la URL.'
      },
      {
        level: 2,
        title: 'document.write',
        content: 'document.write parsea e inserta HTML directamente en el documento.'
      },
      {
        level: 3,
        title: 'Payload directo',
        content: 'Agrega a la URL: ?name=<script>alert("document.write XSS")</script>'
      }
    ],
    solution: {
      explanation: 'El código lee un parámetro de URL y lo escribe directamente con document.write.',
      source: 'URLSearchParams - parámetro "name"',
      sink: 'document.write()',
      context: 'HTML context',
      payload: '<script>alert("document.write XSS")</script>',
      why: 'document.write inserta el payload como HTML. El navegador parsea y ejecuta el <script>.',
      fix: 'NUNCA usar document.write. Usar métodos modernos del DOM.',
      fixCode: `// VULNERABLE
const params = new URLSearchParams(location.search);
const name = params.get('name');
document.write('<h1>Bienvenido ' + name + '</h1>');

// SEGURO
const params = new URLSearchParams(location.search);
const name = params.get('name');
const h1 = document.createElement('h1');
h1.textContent = 'Bienvenido ' + name;
document.body.appendChild(h1);

// O con template literal seguro
const container = document.getElementById('container');
container.textContent = \`Bienvenido \${name}\`;`
    },
    vulnerableCode: `const urlParams = new URLSearchParams(window.location.search);
const userName = urlParams.get('name') || 'Invitado';
document.write('<div class="welcome">Bienvenido, ' + userName + '</div>');`,
    context: 'html'
  },
  {
    id: 'javascript-context',
    title: 'XSS en Contexto JavaScript',
    level: 6,
    category: 'reflected',
    difficulty: 'advanced',
    description: 'Inyecta código cuando tu entrada está dentro de una cadena JavaScript.',
    objectives: [
      'Entender el contexto JavaScript',
      'Escapar de string literals',
      'Ejecutar código arbitrario en contexto JS'
    ],
    theory: `Cuando tu entrada está dentro de código JavaScript (por ejemplo, en un string literal), las reglas cambian.

No puedes usar tags HTML porque ya estás en contexto JavaScript. Debes:

1. Cerrar el string actual (' o ")
2. Terminar la declaración (;)
3. Ejecutar tu código
4. Comentar el resto (//)

Ejemplo:
var name = 'USER_INPUT';
Payload: '; alert(1); //
Resultado: var name = ''; alert(1); //';`,
    hints: [
      {
        level: 1,
        title: 'Dentro de JavaScript',
        content: 'Tu entrada está dentro de un string JavaScript. Mira el código generado en las DevTools.'
      },
      {
        level: 2,
        title: 'Cerrar el string',
        content: "Usa comilla simple ' para cerrar el string, luego ; para terminar la declaración."
      },
      {
        level: 3,
        title: 'Payload completo',
        content: "Intenta: '; alert('XSS'); //"
      }
    ],
    solution: {
      explanation: 'La entrada está dentro de un string literal JavaScript. Necesitamos escapar del string.',
      source: 'Campo de configuración',
      sink: 'String literal en código JavaScript',
      context: 'JavaScript string context',
      payload: "'; alert('XSS'); //",
      why: "' cierra el string, ; termina la declaración, alert() ejecuta, // comenta el resto.",
      fix: 'Escapar caracteres especiales de JavaScript o usar JSON.stringify',
      fixCode: `// VULNERABLE
const config = '<script>var username = "' + userInput + '";</script>';

// SEGURO: opción 1 - JSON.stringify (escapa automáticamente)
const config = '<script>var username = ' + JSON.stringify(userInput) + ';</script>';

// SEGURO: opción 2 - escapar manualmente
function escapeJs(str) {
  return str.replace(/[\\\\'"\\/\\b\\f\\n\\r\\t]/g, c => ({
    '\\\\': '\\\\\\\\',
    "'": "\\\\'",
    '"': '\\\\"',
    '\\b': '\\\\b',
    '\\f': '\\\\f',
    '\\n': '\\\\n',
    '\\r': '\\\\r',
    '\\t': '\\\\t'
  }[c]));
}

// MEJOR: pasar datos vía data attributes
<div id="app" data-username="\${escapeHtml(username)}"></div>
<script>
  const username = document.getElementById('app').dataset.username;
</script>`
    },
    vulnerableCode: `function initConfig(theme) {
  const script = document.createElement('script');
  script.textContent = 'var userTheme = "' + theme + '"; applyTheme(userTheme);';
  document.head.appendChild(script);
}`,
    context: 'javascript'
  },
  {
    id: 'url-context',
    title: 'XSS en Contexto URL',
    level: 7,
    category: 'reflected',
    difficulty: 'advanced',
    description: 'Explota atributos que esperan URLs usando el protocolo javascript:.',
    objectives: [
      'Entender el contexto URL',
      'Usar el pseudo-protocolo javascript:',
      'Ejecutar código a través de href y src'
    ],
    theory: `Cuando tu entrada va en atributos como href, src, action, etc., puedes usar pseudo-protocolos:

1. javascript: - Ejecuta código JavaScript
2. data: - Data URIs que pueden contener HTML/JavaScript

Ejemplo vulnerable:
<a href="USER_INPUT">Click</a>

Payload: javascript:alert(1)
Resultado: <a href="javascript:alert(1)">Click</a>

Al hacer clic, se ejecuta el JavaScript.

También funciona con:
- <iframe src="javascript:...">
- <object data="javascript:...">`,
    hints: [
      {
        level: 1,
        title: 'Atributo href',
        content: 'Tu entrada va en un atributo href de un enlace. Puedes controlar el destino del enlace.'
      },
      {
        level: 2,
        title: 'javascript: protocol',
        content: 'Usa el pseudo-protocolo javascript: para ejecutar código cuando se hace clic.'
      },
      {
        level: 3,
        title: 'Payload',
        content: 'Intenta: javascript:alert("URL XSS")'
      }
    ],
    solution: {
      explanation: 'La entrada se usa en un atributo href sin validación del protocolo.',
      source: 'Campo de URL',
      sink: 'Atributo href de un enlace',
      context: 'URL context',
      payload: 'javascript:alert("URL XSS")',
      why: 'El navegador ejecuta código JavaScript cuando el usuario hace clic en el enlace.',
      fix: 'Validar que las URLs usen protocolos seguros (http/https)',
      fixCode: `// VULNERABLE
link.href = userUrl;

// SEGURO: whitelist de protocolos
function sanitizeUrl(url) {
  const parsed = new URL(url, location.href);
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Protocolo no permitido');
  }
  return parsed.href;
}

try {
  link.href = sanitizeUrl(userUrl);
} catch (e) {
  link.href = '#'; // Fallback seguro
}

// O usar una librería
import { sanitizeUrl } from '@braintree/sanitize-url';
link.href = sanitizeUrl(userUrl);`
    },
    vulnerableCode: `function createLink(url, text) {
  const link = document.createElement('a');
  link.href = url;
  link.textContent = text;
  return link;
}

const userLink = createLink(userInput, 'Click aquí');
document.body.appendChild(userLink);`,
    context: 'url'
  },
  {
    id: 'filter-bypass-basic',
    title: 'Filter Bypass - Blacklist Naive',
    level: 8,
    category: 'filter-bypass',
    difficulty: 'advanced',
    description: 'Bypasea un filtro que bloquea la palabra "script".',
    objectives: [
      'Entender limitaciones de blacklists',
      'Encontrar vectores alternativos',
      'Bypassear filtros simples'
    ],
    theory: `Los filtros blacklist intentan bloquear patrones maliciosos conocidos, pero tienen problemas:

1. **Incomplete coverage**: No pueden bloquear todos los vectores XSS
2. **Case sensitivity**: <script> vs <ScRiPt>
3. **Encoding**: &lt;script&gt; puede decodificarse
4. **Alternative vectors**: Si <script> está bloqueado, usa <img>, <svg>, etc.

Este lab bloquea la palabra "script" (case-insensitive) pero nada más.

Vectors alternativos:
- <img src=x onerror=alert(1)>
- <svg onload=alert(1)>
- <iframe src="javascript:alert(1)">
- <body onload=alert(1)>`,
    hints: [
      {
        level: 1,
        title: 'El filtro bloquea "script"',
        content: 'Si tu input contiene "script" (mayúsculas o minúsculas), será rechazado.'
      },
      {
        level: 2,
        title: 'Usa tags alternativos',
        content: 'Hay muchos otros tags y atributos que pueden ejecutar JavaScript.'
      },
      {
        level: 3,
        title: 'Vectors que funcionan',
        content: 'Intenta: <img src=x onerror=alert(1)> o <svg onload=alert(1)>'
      }
    ],
    solution: {
      explanation: 'El filtro solo bloquea "script" pero permite todos los demás vectores XSS.',
      source: 'Campo de entrada',
      sink: 'innerHTML',
      context: 'HTML context',
      payload: '<img src=x onerror=alert(1)>',
      why: 'El filtro no reconoce <img> como peligroso. El onerror handler ejecuta JavaScript.',
      fix: 'NO usar blacklists. Usar whitelist o sanitización completa.',
      fixCode: `// MALO: Blacklist
function filter(input) {
  if (/script/i.test(input)) {
    return '';
  }
  return input; // Muchos otros vectores permitidos!
}

// MEJOR: Whitelist de caracteres permitidos
function filter(input) {
  if (!/^[a-zA-Z0-9 .,!?-]+$/.test(input)) {
    throw new Error('Caracteres no permitidos');
  }
  return input;
}

// MEJOR AÚN: Sanitización completa
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(input);

// O simplemente no permitir HTML
element.textContent = input; // Más seguro`
    },
    vulnerableCode: `function validateInput(input) {
  // Filtro naive: solo bloquea "script"
  if (/script/i.test(input)) {
    throw new Error('Input no permitido');
  }
  return input;
}

function processInput(input) {
  const validated = validateInput(input);
  document.getElementById('output').innerHTML = validated;
}`,
    context: 'html'
  },
  {
    id: 'filter-bypass-encoding',
    title: 'Filter Bypass - HTML Encoding',
    level: 9,
    category: 'filter-bypass',
    difficulty: 'advanced',
    description: 'Bypasea filtros usando HTML entities y encoding.',
    objectives: [
      'Entender HTML entity encoding',
      'Explotar doble decodificación',
      'Bypassear filtros basados en pattern matching'
    ],
    theory: `HTML entities permiten representar caracteres especiales:
- &lt; = <
- &gt; = >
- &quot; = "
- &#60; = <
- &#x3C; = <

Si un filtro busca "<script>" pero la aplicación decodifica HTML entities DESPUÉS del filtro, podemos bypassear:

1. Filtro ve: &lt;script&gt; (parece seguro)
2. Aplicación decodifica: <script> (¡peligroso!)
3. innerHTML parsea y ejecuta el script

Este lab decodifica HTML entities después de validar.`,
    hints: [
      {
        level: 1,
        title: 'Doble procesamiento',
        content: 'El filtro revisa el input, luego la aplicación decodifica HTML entities.'
      },
      {
        level: 2,
        title: 'Encoda tu payload',
        content: 'Usa HTML entities para ocultar caracteres especiales del filtro.'
      },
      {
        level: 3,
        title: 'Payload encoded',
        content: 'Intenta: &lt;img src=x onerror=alert(1)&gt;'
      }
    ],
    solution: {
      explanation: 'El filtro verifica antes de decodificar entities. Podemos bypassear encodificando.',
      source: 'Campo de entrada',
      sink: 'innerHTML (después de decodificar)',
      context: 'HTML context',
      payload: '&lt;img src=x onerror=alert(1)&gt;',
      why: 'El filtro no ve < ni >, solo entities. Después se decodifica y innerHTML ejecuta.',
      fix: 'Validar DESPUÉS de toda decodificación, o no decodificar input de usuario.',
      fixCode: `// VULNERABLE
function process(input) {
  // 1. Filtro ve input original
  if (/<[^>]*>/.test(input)) {
    throw new Error('HTML no permitido');
  }

  // 2. Luego decodifica (¡MAL!)
  const decoded = decodeHtmlEntities(input);
  element.innerHTML = decoded;
}

// SEGURO: decodificar ANTES de validar
function process(input) {
  // 1. Primero decodificar
  const decoded = decodeHtmlEntities(input);

  // 2. Luego validar
  if (/<[^>]*>/.test(decoded)) {
    throw new Error('HTML no permitido');
  }

  // 3. Usar textContent (no parsea HTML)
  element.textContent = decoded;
}

// MEJOR: nunca decodificar input de usuario innecesariamente`
    },
    vulnerableCode: `function sanitize(input) {
  if (/<script|<img|onerror|onload/i.test(input)) {
    throw new Error('Payload detectado');
  }
  return input;
}

function decodeHtmlEntities(str) {
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

function display(input) {
  const safe = sanitize(input);
  const decoded = decodeHtmlEntities(safe);
  document.getElementById('output').innerHTML = decoded;
}`,
    context: 'html'
  },
  {
    id: 'filter-bypass-case',
    title: 'Filter Bypass - Case Variation',
    level: 10,
    category: 'filter-bypass',
    difficulty: 'intermediate',
    description: 'Bypasea filtros que no consideran variaciones de mayúsculas/minúsculas.',
    objectives: [
      'Explotar case sensitivity',
      'Entender HTML case-insensitivity',
      'Usar variaciones de case para bypass'
    ],
    theory: `HTML es case-insensitive: <script> = <ScRiPt> = <SCRIPT>

Si un filtro busca exactamente "<script>" (case-sensitive), podemos bypassear con:
- <ScRiPt>
- <SCRIPT>
- <Script>
- <sCrIpT>

El navegador trata todos igual y los ejecuta.

Mismo problema con atributos:
- onerror = oNerRor = ONERROR

Este lab tiene un filtro case-sensitive que solo bloquea "<script>" en minúsculas.`,
    hints: [
      {
        level: 1,
        title: 'Filtro case-sensitive',
        content: 'El filtro busca exactamente "<script>" en minúsculas.'
      },
      {
        level: 2,
        title: 'HTML es case-insensitive',
        content: 'El navegador trata <ScRiPt> igual que <script>.'
      },
      {
        level: 3,
        title: 'Cambia el case',
        content: 'Intenta: <ScRiPt>alert(1)</ScRiPt> o <IMG SRC=X ONERROR=ALERT(1)>'
      }
    ],
    solution: {
      explanation: 'El filtro es case-sensitive pero HTML no lo es.',
      source: 'Campo de entrada',
      sink: 'innerHTML',
      context: 'HTML context',
      payload: '<ScRiPt>alert(1)</ScRiPt>',
      why: 'El filtro no detecta <ScRiPt>, pero el navegador lo parsea como <script> y ejecuta.',
      fix: 'Hacer validación case-insensitive o normalizar a lowercase primero.',
      fixCode: `// VULNERABLE
function filter(input) {
  if (input.includes('<script>')) { // Solo minúsculas
    throw new Error('Bloqueado');
  }
  return input;
}

// MEJOR: case-insensitive
function filter(input) {
  if (/<script/i.test(input)) { // 'i' flag = case-insensitive
    throw new Error('Bloqueado');
  }
  return input;
}

// MEJOR AÚN: normalizar primero
function filter(input) {
  const normalized = input.toLowerCase();
  if (normalized.includes('<script')) {
    throw new Error('Bloqueado');
  }
  return input;
}

// ÓPTIMO: no usar blacklist
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(input);`
    },
    vulnerableCode: `function validateInput(input) {
  const blocked = [
    '<script>',
    '<img',
    'onerror',
    'javascript:'
  ];

  for (const pattern of blocked) {
    if (input.includes(pattern)) {
      throw new Error('Patrón bloqueado: ' + pattern);
    }
  }
  return input;
}

function render(input) {
  const validated = validateInput(input);
  document.getElementById('output').innerHTML = validated;
}`,
    context: 'html'
  },
  {
    id: 'dom-xss-eval',
    title: 'DOM XSS - eval() y similares',
    level: 11,
    category: 'dom',
    difficulty: 'expert',
    description: 'Explota eval() y funciones similares que ejecutan strings como código.',
    objectives: [
      'Entender por qué eval() es peligroso',
      'Explotar setTimeout/setInterval con strings',
      'Inyectar código JavaScript arbitrario'
    ],
    theory: `eval() y funciones similares ejecutan strings como código JavaScript:

Peligrosos:
- eval(string)
- setTimeout(string, delay)
- setInterval(string, delay)
- Function(string)
- new Function('return ' + string)()

Si input de usuario llega a estos sinks, el atacante puede ejecutar código arbitrario.

Ejemplo:
eval('var x = "' + userInput + '"');

Si userInput = '"; alert(1); //'
Resultado: eval('var x = ""; alert(1); //"');

Este lab usa setTimeout con un string construido desde user input.`,
    hints: [
      {
        level: 1,
        title: 'setTimeout con string',
        content: 'El código usa setTimeout con un string que incluye tu input.'
      },
      {
        level: 2,
        title: 'Escapar del string',
        content: 'Tu input está en un string. Cierra el string y agrega tu código.'
      },
      {
        level: 3,
        title: 'Payload',
        content: 'Intenta: "); alert(1); //'
      }
    ],
    solution: {
      explanation: 'setTimeout con string ejecuta el código después del delay, permitiendo inyección.',
      source: 'Campo de delay message',
      sink: 'setTimeout(string, delay)',
      context: 'JavaScript execution context',
      payload: '"); alert(1); //',
      why: '") cierra el string y la función, ; termina, alert() ejecuta, // comenta el resto.',
      fix: 'NUNCA pasar strings a eval/setTimeout/setInterval. Usar funciones.',
      fixCode: `// VULNERABLE
setTimeout('showMessage("' + userMsg + '")', 1000);
eval('var msg = "' + userMsg + '"');

// SEGURO: usar funciones en lugar de strings
setTimeout(() => showMessage(userMsg), 1000);
setTimeout(function() { showMessage(userMsg); }, 1000);

// Para eval: generalmente hay alternativas
// Si REALMENTE necesitas eval, valida estrictamente
const parsed = JSON.parse(userInput); // Más seguro que eval

// NUNCA hagas esto:
const result = eval(userCode); // ❌

// Function constructor también es peligroso
const fn = new Function('x', userCode); // ❌`
    },
    vulnerableCode: `function scheduleMessage(message, delay) {
  // Extremadamente peligroso: string en setTimeout
  setTimeout('displayMessage("' + message + '")', delay);
}

function calculate(expression) {
  // Extremadamente peligroso: eval con input de usuario
  try {
    const result = eval(expression);
    return result;
  } catch (e) {
    return 'Error';
  }
}`,
    context: 'javascript'
  },
  {
    id: 'mutation-xss',
    title: 'Mutation XSS - mXSS',
    level: 12,
    category: 'advanced',
    difficulty: 'expert',
    description: 'Explota mutation XSS causado por el parsing del navegador que "corrige" HTML.',
    objectives: [
      'Entender Mutation XSS',
      'Explotar el parsing del navegador',
      'Bypassear sanitización mediante mutaciones'
    ],
    theory: `Mutation XSS (mXSS) ocurre cuando el navegador "corrige" o modifica HTML malformado de formas inesperadas.

Proceso:
1. Aplicación sanitiza: <noscript><p title="</noscript><img src=x onerror=alert(1)>">
2. Parece seguro (está dentro de <noscript>)
3. Navegador parsea y "corrige": cierra <noscript> prematuramente
4. El <img> queda fuera y se ejecuta

Otro ejemplo:
Input: <form><math><mtext></form><form><mglyph><style></math><img src=x onerror=alert(1)>
Después de parsing: el <img> se ejecuta debido a cómo el navegador cierra tags.

mXSS es difícil de detectar y prevenir con sanitizadores naive.`,
    hints: [
      {
        level: 1,
        title: 'HTML malformado',
        content: 'Este lab intenta sanitizar pero tiene problemas con tags anidados complejos.'
      },
      {
        level: 2,
        title: 'Explotar parsing',
        content: 'Usa tags como <noscript>, <form>, <math>, <svg> anidados de formas inesperadas.'
      },
      {
        level: 3,
        title: 'Payload mXSS',
        content: 'Intenta: <noscript><p title="</noscript><img src=x onerror=alert(1)>">'
      }
    ],
    solution: {
      explanation: 'El sanitizador no anticipa cómo el navegador parseará HTML malformado complejo.',
      source: 'Campo de rich text',
      sink: 'innerHTML después de sanitización naive',
      context: 'HTML context con mutaciones',
      payload: '<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
      why: 'El navegador cierra <noscript> al ver </noscript> en el atributo, dejando <img> ejecutable.',
      fix: 'Usar sanitizadores robustos como DOMPurify que entienden mXSS.',
      fixCode: `// VULNERABLE: sanitizador naive
function naiveSanitize(html) {
  // Intenta remover scripts
  return html.replace(/<script[^>]*>.*?<\\/script>/gi, '');
  // No maneja mXSS!
}

// SEGURO: DOMPurify maneja mXSS
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(dirtyHtml, {
  SAFE_FOR_TEMPLATES: true,
  // DOMPurify parsea y re-serializa para prevenir mXSS
});

// DOMPurify:
// 1. Parsea el HTML
// 2. Detecta mutaciones
// 3. Re-serializa de forma segura
// 4. Previene mXSS conocidos`
    },
    vulnerableCode: `function customSanitize(html) {
  // Sanitizador simple que remueve tags peligrosos
  let clean = html;
  const dangerous = ['script', 'iframe', 'object', 'embed'];

  dangerous.forEach(tag => {
    const regex = new RegExp(\`<\${tag}[^>]*>.*?</\${tag}>\`, 'gi');
    clean = clean.replace(regex, '');
  });

  return clean;
}

function renderContent(userHtml) {
  const sanitized = customSanitize(userHtml);
  document.getElementById('content').innerHTML = sanitized;
}`,
    context: 'html'
  },
  {
    id: 'csp-bypass',
    title: 'CSP Bypass - Misconfiguration',
    level: 13,
    category: 'advanced',
    difficulty: 'expert',
    description: 'Bypasea una Content Security Policy mal configurada.',
    objectives: [
      'Entender CSP (Content Security Policy)',
      'Identificar misconfigurations comunes',
      'Bypassear CSP débil'
    ],
    theory: `Content Security Policy (CSP) es un header HTTP que restringe qué scripts pueden ejecutarse.

CSP bien configurado:
Content-Security-Policy: default-src 'self'; script-src 'self'

Esto bloquea:
- Inline scripts (<script>alert(1)</script>)
- Inline event handlers (onclick="alert(1)")
- eval()
- Scripts de otros dominios

Misconfigurations comunes:
1. script-src 'unsafe-inline' - Permite inline scripts
2. script-src * - Permite cualquier dominio
3. script-src https: - Permite cualquier HTTPS
4. base-uri no configurado - Permite <base> injection

Este lab tiene CSP con 'unsafe-inline', permitiendo inline scripts.`,
    hints: [
      {
        level: 1,
        title: 'Revisa el CSP',
        content: 'Mira las DevTools → Network → Headers. El CSP tiene unsafe-inline.'
      },
      {
        level: 2,
        title: 'unsafe-inline permite inline scripts',
        content: 'Puedes usar <script> tags directamente o event handlers inline.'
      },
      {
        level: 3,
        title: 'Payload normal',
        content: 'Debido a unsafe-inline, payloads normales funcionan: <script>alert(1)</script>'
      }
    ],
    solution: {
      explanation: 'El CSP incluye unsafe-inline, que anula la mayoría de protecciones contra XSS.',
      source: 'Campo de entrada',
      sink: 'innerHTML',
      context: 'HTML context con CSP débil',
      payload: '<script>alert("CSP Bypass")</script>',
      why: "unsafe-inline permite inline scripts. El CSP no bloquea nuestro payload.",
      fix: 'Remover unsafe-inline y usar nonces o hashes para scripts legítimos.',
      fixCode: `// VULNERABLE CSP
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline'
  ☝️ unsafe-inline permite inline scripts!

// SEGURO: sin unsafe-inline, usar nonces
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}'

// En HTML, solo scripts con nonce correcto ejecutan:
<script nonce="{RANDOM}">
  // Este script ejecuta
</script>

<script>alert(1)</script>
☝️ Este NO ejecuta (sin nonce)

// O usar hashes para scripts estáticos
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'sha256-{HASH_DEL_SCRIPT}'

// Generar hash:
echo -n 'alert(1)' | openssl dgst -sha256 -binary | openssl base64`
    },
    vulnerableCode: `// Simulación: Este lab tiene este CSP header
// Content-Security-Policy:
//   default-src 'self';
//   script-src 'self' 'unsafe-inline';
//   object-src 'none';

// La aplicación inserta input de usuario:
function display(input) {
  document.getElementById('output').innerHTML = input;
}

// Debido a 'unsafe-inline', inline scripts ejecutan normalmente`,
    context: 'html'
  },
  {
    id: 'postmessage-xss',
    title: 'DOM XSS - postMessage',
    level: 14,
    category: 'dom',
    difficulty: 'expert',
    description: 'Explota una vulnerabilidad en un event listener de postMessage.',
    objectives: [
      'Entender postMessage API',
      'Identificar falta de validación de origen',
      'Inyectar payload desde otro origen'
    ],
    theory: `window.postMessage() permite comunicación entre ventanas de diferentes orígenes.

Uso vulnerable:
window.addEventListener('message', (event) => {
  document.body.innerHTML = event.data; // Sin validar origen!
});

Ataque:
targetWindow.postMessage('<img src=x onerror=alert(1)>', '*');

Peligros:
1. No validar event.origin
2. Confiar en event.data sin sanitizar
3. Usar data en sinks peligrosos (innerHTML, eval, etc.)

Defensa:
1. SIEMPRE validar event.origin
2. Sanitizar event.data
3. Usar postMessage solo cuando necesario`,
    hints: [
      {
        level: 1,
        title: 'postMessage listener',
        content: 'Este lab escucha mensajes postMessage sin validar el origen.'
      },
      {
        level: 2,
        title: 'Usar la consola',
        content: 'Puedes enviar un mensaje con: window.postMessage(payload, "*")'
      },
      {
        level: 3,
        title: 'Payload',
        content: 'Ejecuta en la consola: window.postMessage(\'<img src=x onerror=alert("postMessage XSS")>\', "*")'
      }
    ],
    solution: {
      explanation: 'El listener acepta mensajes de cualquier origen y los inserta con innerHTML.',
      source: 'postMessage desde cualquier origen',
      sink: 'innerHTML',
      context: 'HTML context',
      payload: '<img src=x onerror=alert("postMessage XSS")>',
      why: 'No se valida event.origin, cualquiera puede enviar mensajes maliciosos.',
      fix: 'Validar event.origin y sanitizar event.data.',
      fixCode: `// VULNERABLE
window.addEventListener('message', (event) => {
  document.body.innerHTML = event.data;
});

// SEGURO: validar origin
window.addEventListener('message', (event) => {
  // 1. Validar origen
  const trustedOrigins = ['https://trusted-domain.com'];
  if (!trustedOrigins.includes(event.origin)) {
    console.warn('Mensaje de origen no confiable:', event.origin);
    return;
  }

  // 2. Validar estructura de data
  if (typeof event.data !== 'object' || !event.data.action) {
    return;
  }

  // 3. Usar de forma segura
  if (event.data.action === 'updateText') {
    // textContent no parsea HTML
    document.body.textContent = event.data.text;
  }
});

// MEJOR: usar formato específico
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://trusted-domain.com') {
    return;
  }

  try {
    const msg = JSON.parse(event.data);
    handleMessage(msg);
  } catch (e) {
    console.error('Mensaje inválido');
  }
});`
    },
    vulnerableCode: `// Event listener vulnerable
window.addEventListener('message', function(event) {
  // PELIGRO: No valida event.origin
  // PELIGRO: Usa innerHTML con data no confiable

  const messageContainer = document.getElementById('messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.innerHTML = '<strong>Mensaje recibido:</strong> ' + event.data;
  messageContainer.appendChild(messageDiv);
});

// Para testear, un atacante podría hacer:
// window.postMessage('<img src=x onerror=alert(document.cookie)>', '*');`,
    context: 'html'
  }
];
