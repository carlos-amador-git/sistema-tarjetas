/**
 * Tests para utilidades generales
 */

import {
  cn,
  formatNumber,
  formatCurrency,
  formatDate,
  formatDateTime,
  capitalize,
  generateId,
  debounce,
  truncate,
  percentage,
  getStatusColor,
} from '../utils';

// =============================================================================
// cn (class name merger)
// =============================================================================

describe('cn', () => {
  it('debe combinar clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('debe manejar clases condicionales', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz');
  });

  it('debe fusionar clases de Tailwind conflictivas', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('debe manejar arrays de clases', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });

  it('debe manejar objetos de clases', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('debe manejar undefined y null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('debe manejar strings vacíos', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar');
  });
});

// =============================================================================
// formatNumber
// =============================================================================

describe('formatNumber', () => {
  it('debe formatear números con separadores de miles', () => {
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(1000000)).toBe('1,000,000');
  });

  it('debe manejar números pequeños', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(123)).toBe('123');
  });

  it('debe manejar números negativos', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });

  it('debe manejar decimales', () => {
    const result = formatNumber(1234.56);
    expect(result).toContain('1,234');
  });
});

// =============================================================================
// formatCurrency
// =============================================================================

describe('formatCurrency', () => {
  it('debe formatear como moneda mexicana', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('$');
    expect(result).toContain('1,000');
  });

  it('debe manejar decimales', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('$');
  });

  it('debe manejar cero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('$');
    expect(result).toContain('0');
  });

  it('debe manejar números negativos', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('$');
  });
});

// =============================================================================
// formatDate
// =============================================================================

describe('formatDate', () => {
  it('debe formatear una fecha desde string', () => {
    const result = formatDate('2024-01-15');
    expect(result).toContain('2024');
    // El día puede variar por timezone, solo verificamos que es un formato válido
    expect(result).toMatch(/\d{1,2}/);
  });

  it('debe formatear una fecha desde Date object', () => {
    const date = new Date(2024, 0, 15);
    const result = formatDate(date);
    expect(result).toContain('2024');
  });

  it('debe usar formato español', () => {
    const result = formatDate('2024-03-15');
    // Marzo en español abreviado
    expect(result.toLowerCase()).toMatch(/mar|marzo/);
  });
});

// =============================================================================
// formatDateTime
// =============================================================================

describe('formatDateTime', () => {
  it('debe formatear fecha con hora desde string', () => {
    const result = formatDateTime('2024-01-15T14:30:00');
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('debe formatear fecha con hora desde Date object', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = formatDateTime(date);
    expect(result).toContain('2024');
    expect(result).toContain('15');
  });

  it('debe incluir hora y minutos', () => {
    const date = new Date(2024, 0, 15, 14, 30);
    const result = formatDateTime(date);
    // La hora puede variar por timezone pero debe tener formato de hora
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });
});

// =============================================================================
// capitalize
// =============================================================================

describe('capitalize', () => {
  it('debe capitalizar primera letra', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('debe convertir resto a minúsculas', () => {
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('debe manejar string de un solo carácter', () => {
    expect(capitalize('a')).toBe('A');
    expect(capitalize('A')).toBe('A');
  });

  it('debe manejar string vacío', () => {
    expect(capitalize('')).toBe('');
  });

  it('debe manejar strings con espacios', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });
});

// =============================================================================
// generateId
// =============================================================================

describe('generateId', () => {
  it('debe generar un string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('debe generar IDs de longitud 7', () => {
    const id = generateId();
    expect(id).toHaveLength(7);
  });

  it('debe generar IDs únicos', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });

  it('debe generar solo caracteres alfanuméricos', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });
});

// =============================================================================
// debounce
// =============================================================================

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debe retrasar la ejecución', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('debe cancelar llamadas anteriores', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('debe pasar argumentos correctamente', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('debe reiniciar el timer en cada llamada', () => {
    const fn = jest.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    jest.advanceTimersByTime(50);

    debouncedFn();
    jest.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

// =============================================================================
// truncate
// =============================================================================

describe('truncate', () => {
  it('debe truncar texto largo', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...');
  });

  it('no debe truncar texto corto', () => {
    expect(truncate('Hi', 5)).toBe('Hi');
  });

  it('no debe truncar texto de longitud exacta', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('debe manejar string vacío', () => {
    expect(truncate('', 5)).toBe('');
  });

  it('debe manejar longitud 0', () => {
    expect(truncate('Hello', 0)).toBe('...');
  });
});

// =============================================================================
// percentage
// =============================================================================

describe('percentage', () => {
  it('debe calcular porcentaje correctamente', () => {
    expect(percentage(25, 100)).toBe(25);
    expect(percentage(50, 200)).toBe(25);
    expect(percentage(1, 3)).toBe(33);
  });

  it('debe redondear al entero más cercano', () => {
    expect(percentage(1, 3)).toBe(33);
    expect(percentage(2, 3)).toBe(67);
  });

  it('debe retornar 0 cuando total es 0', () => {
    expect(percentage(50, 0)).toBe(0);
  });

  it('debe manejar valor 0', () => {
    expect(percentage(0, 100)).toBe(0);
  });

  it('debe manejar 100%', () => {
    expect(percentage(100, 100)).toBe(100);
  });

  it('debe manejar más del 100%', () => {
    expect(percentage(150, 100)).toBe(150);
  });
});

// =============================================================================
// getStatusColor
// =============================================================================

describe('getStatusColor', () => {
  const thresholds = { warning: 50, danger: 20 };

  it('debe retornar rojo para valores bajo el umbral de danger', () => {
    expect(getStatusColor(10, thresholds)).toBe('text-red-500');
    expect(getStatusColor(20, thresholds)).toBe('text-red-500');
  });

  it('debe retornar amarillo para valores entre danger y warning', () => {
    expect(getStatusColor(30, thresholds)).toBe('text-yellow-500');
    expect(getStatusColor(50, thresholds)).toBe('text-yellow-500');
  });

  it('debe retornar verde para valores sobre el umbral de warning', () => {
    expect(getStatusColor(60, thresholds)).toBe('text-green-500');
    expect(getStatusColor(100, thresholds)).toBe('text-green-500');
  });

  it('debe manejar diferentes umbrales', () => {
    const customThresholds = { warning: 80, danger: 40 };
    expect(getStatusColor(30, customThresholds)).toBe('text-red-500');
    expect(getStatusColor(60, customThresholds)).toBe('text-yellow-500');
    expect(getStatusColor(90, customThresholds)).toBe('text-green-500');
  });

  it('debe manejar valor 0', () => {
    expect(getStatusColor(0, thresholds)).toBe('text-red-500');
  });
});
