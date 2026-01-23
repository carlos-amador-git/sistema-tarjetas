/**
 * Sanitización de Inputs contra XSS
 *
 * Funciones para limpiar y validar inputs de usuario
 * para prevenir ataques de Cross-Site Scripting (XSS).
 */

/**
 * Caracteres HTML que deben ser escapados
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escapa caracteres HTML peligrosos
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Elimina tags HTML del string
 */
export function stripHtmlTags(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitiza un string eliminando caracteres peligrosos y escapando HTML
 */
export function sanitizeString(str: string, options?: {
  maxLength?: number;
  allowNewlines?: boolean;
  trim?: boolean;
}): string {
  if (typeof str !== 'string') {
    return '';
  }

  const opts = {
    maxLength: 10000,
    allowNewlines: false,
    trim: true,
    ...options,
  };

  let result = str;

  // Eliminar null bytes
  result = result.replace(/\0/g, '');

  // Eliminar caracteres de control excepto newlines si están permitidos
  if (opts.allowNewlines) {
    result = result.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  } else {
    result = result.replace(/[\x00-\x1F\x7F]/g, '');
  }

  // Trim
  if (opts.trim) {
    result = result.trim();
  }

  // Limitar longitud
  if (opts.maxLength && result.length > opts.maxLength) {
    result = result.substring(0, opts.maxLength);
  }

  // Escapar HTML
  result = escapeHtml(result);

  return result;
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options?: {
    maxStringLength?: number;
    maxDepth?: number;
    allowHtml?: string[];
  }
): T {
  const opts = {
    maxStringLength: 10000,
    maxDepth: 10,
    allowHtml: [] as string[],
    ...options,
  };

  function sanitizeValue(value: unknown, depth: number, key?: string): unknown {
    if (depth > opts.maxDepth) {
      return null;
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      // Si el campo permite HTML, solo hacer strip de tags peligrosos
      if (key && opts.allowHtml.includes(key)) {
        return stripDangerousTags(value);
      }
      return sanitizeString(value, { maxLength: opts.maxStringLength });
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => sanitizeValue(item, depth + 1));
    }

    if (typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        sanitized[k] = sanitizeValue(v, depth + 1, k);
      }
      return sanitized;
    }

    return null;
  }

  return sanitizeValue(obj, 0) as T;
}

/**
 * Elimina tags HTML peligrosos pero permite algunos seguros
 */
export function stripDangerousTags(str: string): string {
  if (typeof str !== 'string') {
    return '';
  }

  // Tags permitidos (sin atributos peligrosos)
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'];

  // Eliminar scripts y event handlers
  let result = str;

  // Eliminar scripts
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Eliminar event handlers (onclick, onerror, etc.)
  result = result.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  result = result.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Eliminar javascript: URLs
  result = result.replace(/href\s*=\s*["']?\s*javascript:[^"'>\s]*/gi, 'href="#"');

  // Eliminar data: URLs
  result = result.replace(/src\s*=\s*["']?\s*data:[^"'>\s]*/gi, 'src=""');

  // Eliminar tags no permitidos
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  result = result.replace(tagRegex, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      // Para tags permitidos, eliminar atributos peligrosos
      return match.replace(/\s+[a-z-]+\s*=\s*["'][^"']*["']/gi, '');
    }
    return ''; // Eliminar tag no permitido
  });

  return result;
}

/**
 * Valida y sanitiza un email
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const sanitized = email.trim().toLowerCase();

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  // Verificar longitud
  if (sanitized.length > 254) {
    return null;
  }

  return sanitized;
}

/**
 * Valida y sanitiza un username
 */
export function sanitizeUsername(username: string): string | null {
  if (typeof username !== 'string') {
    return null;
  }

  // Solo permitir alfanuméricos, guiones y guiones bajos
  const sanitized = username.trim().toLowerCase();
  const usernameRegex = /^[a-z0-9_-]+$/;

  if (!usernameRegex.test(sanitized)) {
    return null;
  }

  // Verificar longitud
  if (sanitized.length < 3 || sanitized.length > 50) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitiza un número (verifica que sea un número válido)
 */
export function sanitizeNumber(
  value: unknown,
  options?: {
    min?: number;
    max?: number;
    allowFloat?: boolean;
    defaultValue?: number;
  }
): number {
  const opts = {
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    allowFloat: true,
    defaultValue: 0,
    ...options,
  };

  let num: number;

  if (typeof value === 'number') {
    num = value;
  } else if (typeof value === 'string') {
    num = opts.allowFloat ? parseFloat(value) : parseInt(value, 10);
  } else {
    return opts.defaultValue;
  }

  if (isNaN(num) || !isFinite(num)) {
    return opts.defaultValue;
  }

  if (!opts.allowFloat) {
    num = Math.floor(num);
  }

  return Math.max(opts.min, Math.min(opts.max, num));
}

/**
 * Verifica si un string contiene posibles ataques de inyección SQL
 */
export function detectSqlInjection(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)/i,
    /(\b(UNION|JOIN)\s+(ALL\s+)?SELECT\b)/i,
    /(--|\#|\/\*)/,
    /(\bOR\b|\bAND\b)\s*\d+\s*=\s*\d+/i,
    /('\s*(OR|AND)\s*')/i,
    /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP))/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(str));
}

/**
 * Verifica si un string contiene posibles ataques XSS
 */
export function detectXssAttempt(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /data:\s*text\/html/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<link\b/i,
    /<meta\b/i,
    /expression\s*\(/i,
    /vbscript:/i,
  ];

  return xssPatterns.some((pattern) => pattern.test(str));
}
