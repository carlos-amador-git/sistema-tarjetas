/**
 * Tests para funciones de sanitización
 */

import {
  escapeHtml,
  stripHtmlTags,
  sanitizeString,
  sanitizeObject,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeNumber,
  detectSqlInjection,
  detectXssAttempt,
} from '../sanitize';

describe('Sanitize', () => {
  describe('escapeHtml', () => {
    it('debe escapar caracteres HTML peligrosos', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('debe escapar ampersands', () => {
      expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    it('debe escapar comillas', () => {
      expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
    });

    it('debe manejar strings vacíos', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('debe manejar valores no-string', () => {
      expect(escapeHtml(null as unknown as string)).toBe('');
      expect(escapeHtml(undefined as unknown as string)).toBe('');
    });
  });

  describe('stripHtmlTags', () => {
    it('debe eliminar todos los tags HTML', () => {
      expect(stripHtmlTags('<p>Hello</p>')).toBe('Hello');
      expect(stripHtmlTags('<div><span>Test</span></div>')).toBe('Test');
    });

    it('debe manejar tags anidados', () => {
      expect(stripHtmlTags('<b><i>Bold Italic</i></b>')).toBe('Bold Italic');
    });

    it('debe manejar strings sin tags', () => {
      expect(stripHtmlTags('Plain text')).toBe('Plain text');
    });
  });

  describe('sanitizeString', () => {
    it('debe eliminar caracteres de control', () => {
      const input = 'Hello\x00World\x01';
      expect(sanitizeString(input)).not.toContain('\x00');
      expect(sanitizeString(input)).not.toContain('\x01');
    });

    it('debe respetar el límite de longitud', () => {
      const input = 'a'.repeat(100);
      const result = sanitizeString(input, { maxLength: 50 });
      expect(result.length).toBe(50);
    });

    it('debe hacer trim por defecto', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('debe no hacer trim si se especifica', () => {
      const result = sanitizeString('  hello  ', { trim: false });
      expect(result).toBe('  hello  ');
    });
  });

  describe('sanitizeObject', () => {
    it('debe sanitizar strings en objetos', () => {
      const input = {
        name: '<script>alert("xss")</script>',
        age: 25,
      };
      const result = sanitizeObject(input);
      expect(result.name).not.toContain('<script>');
      expect(result.age).toBe(25);
    });

    it('debe manejar objetos anidados', () => {
      const input = {
        user: {
          name: '<b>Test</b>',
          email: 'test@example.com',
        },
      };
      const result = sanitizeObject(input);
      expect(result.user.name).not.toContain('<b>');
    });

    it('debe manejar arrays', () => {
      const input = {
        items: ['<script>1</script>', '<script>2</script>'],
      };
      const result = sanitizeObject(input);
      expect(result.items[0]).not.toContain('<script>');
      expect(result.items[1]).not.toContain('<script>');
    });
  });

  describe('sanitizeEmail', () => {
    it('debe aceptar emails válidos', () => {
      expect(sanitizeEmail('test@example.com')).toBe('test@example.com');
      expect(sanitizeEmail('user.name@domain.co.uk')).toBe('user.name@domain.co.uk');
    });

    it('debe rechazar emails inválidos', () => {
      expect(sanitizeEmail('invalid')).toBeNull();
      expect(sanitizeEmail('missing@')).toBeNull();
      expect(sanitizeEmail('@nodomain.com')).toBeNull();
    });

    it('debe convertir a minúsculas', () => {
      expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
    });

    it('debe hacer trim', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });
  });

  describe('sanitizeUsername', () => {
    it('debe aceptar usernames válidos', () => {
      expect(sanitizeUsername('admin')).toBe('admin');
      expect(sanitizeUsername('user_name')).toBe('user_name');
      expect(sanitizeUsername('user-123')).toBe('user-123');
    });

    it('debe rechazar usernames con caracteres especiales', () => {
      expect(sanitizeUsername('user@name')).toBeNull();
      expect(sanitizeUsername('user name')).toBeNull();
      expect(sanitizeUsername('user.name')).toBeNull();
    });

    it('debe rechazar usernames muy cortos', () => {
      expect(sanitizeUsername('ab')).toBeNull();
    });

    it('debe convertir a minúsculas', () => {
      expect(sanitizeUsername('ADMIN')).toBe('admin');
    });
  });

  describe('sanitizeNumber', () => {
    it('debe convertir strings a números', () => {
      expect(sanitizeNumber('123')).toBe(123);
      expect(sanitizeNumber('123.45')).toBe(123.45);
    });

    it('debe respetar min/max', () => {
      expect(sanitizeNumber(100, { min: 0, max: 50 })).toBe(50);
      expect(sanitizeNumber(-10, { min: 0, max: 50 })).toBe(0);
    });

    it('debe usar valor por defecto para valores inválidos', () => {
      expect(sanitizeNumber('abc', { defaultValue: 0 })).toBe(0);
      expect(sanitizeNumber(null, { defaultValue: 10 })).toBe(10);
    });

    it('debe truncar decimales si se especifica', () => {
      expect(sanitizeNumber(123.99, { allowFloat: false })).toBe(123);
    });
  });

  describe('detectSqlInjection', () => {
    it('debe detectar intentos de SQL injection', () => {
      expect(detectSqlInjection("'; DROP TABLE users;--")).toBe(true);
      expect(detectSqlInjection('1 OR 1=1')).toBe(true);
      expect(detectSqlInjection('UNION SELECT * FROM users')).toBe(true);
    });

    it('debe no detectar texto normal', () => {
      expect(detectSqlInjection('hello world')).toBe(false);
      expect(detectSqlInjection('user@example.com')).toBe(false);
    });
  });

  describe('detectXssAttempt', () => {
    it('debe detectar intentos de XSS', () => {
      expect(detectXssAttempt('<script>alert("xss")</script>')).toBe(true);
      expect(detectXssAttempt('onclick="alert(1)"')).toBe(true);
      expect(detectXssAttempt('javascript:void(0)')).toBe(true);
      expect(detectXssAttempt('<iframe src="evil.com">')).toBe(true);
    });

    it('debe no detectar texto normal', () => {
      expect(detectXssAttempt('hello world')).toBe(false);
      expect(detectXssAttempt('This is a <b>test</b>')).toBe(false);
    });
  });
});
