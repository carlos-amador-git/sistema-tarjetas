/**
 * Tests para useThemeDemo hook
 *
 * Funcionalidades testeadas:
 * - Inicialización desde localStorage
 * - Toggle, enable, disable demo mode
 * - Set palette
 * - Persistencia en localStorage
 *
 * Nota: No se testea window.location.reload() porque jsdom no lo permite mockear
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useThemeDemo from '../useThemeDemo';

// =============================================================================
// MOCKS
// =============================================================================

jest.mock('@/config/colorPalettes', () => ({
  DEMO_PALETTES: [
    {
      id: 'default',
      name: 'CardSystem',
      description: 'Paleta por defecto',
      colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
    },
    {
      id: 'emerald',
      name: 'Esmeralda',
      description: 'Verde esmeralda',
      colors: { primary: '#059669', secondary: '#047857', accent: '#34d399' },
    },
    {
      id: 'rose',
      name: 'Rosa Corporativo',
      description: 'Rosa elegante',
      colors: { primary: '#e11d48', secondary: '#be123c', accent: '#fb7185' },
    },
  ],
  getDemoPaletteById: (id: string) => {
    const palettes = [
      {
        id: 'default',
        name: 'CardSystem',
        description: 'Paleta por defecto',
        colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
      },
      {
        id: 'emerald',
        name: 'Esmeralda',
        description: 'Verde esmeralda',
        colors: { primary: '#059669', secondary: '#047857', accent: '#34d399' },
      },
      {
        id: 'rose',
        name: 'Rosa Corporativo',
        description: 'Rosa elegante',
        colors: { primary: '#e11d48', secondary: '#be123c', accent: '#fb7185' },
      },
    ];
    return palettes.find(p => p.id === id) || null;
  },
  applyDemoPalette: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// =============================================================================
// SETUP
// =============================================================================

const STORAGE_KEY = 'cardsystem-demo-theme';

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// =============================================================================
// BASIC FUNCTIONALITY TESTS
// =============================================================================

describe('useThemeDemo', () => {
  describe('Initialization', () => {
    it('debe inicializar con demo mode habilitado cuando hay state guardado', async () => {
      // Store state with demo enabled
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ isEnabled: true, paletteId: 'default' }));

      const { result } = renderHook(() => useThemeDemo());

      // Wait for effects to run
      await waitFor(() => {
        expect(result.current.isDemoMode).toBe(true);
      });
    });

    it('debe retornar la lista de paletas disponibles', () => {
      const { result } = renderHook(() => useThemeDemo());

      expect(result.current.palettes).toHaveLength(3);
      expect(result.current.palettes[0].id).toBe('default');
      expect(result.current.palettes[1].id).toBe('emerald');
    });

    it('debe retornar paleta actual cuando demo mode está habilitado', async () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ isEnabled: true, paletteId: 'default' }));

      const { result } = renderHook(() => useThemeDemo());

      await waitFor(() => {
        expect(result.current.isDemoMode).toBe(true);
        expect(result.current.currentPalette).not.toBeNull();
        expect(result.current.currentPalette?.id).toBe('default');
      });
    });

    it('debe cargar paletteId desde localStorage', async () => {
      const storedState = { isEnabled: true, paletteId: 'emerald' };
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify(storedState));

      const { result } = renderHook(() => useThemeDemo());

      await waitFor(() => {
        expect(result.current.currentPalette?.id).toBe('emerald');
      });
    });

    it('debe inicializar sin demo mode por defecto cuando no hay storage', () => {
      const { result } = renderHook(() => useThemeDemo());

      // Initial state should be false
      expect(result.current.isDemoMode).toBe(false);
    });
  });

  describe('setPalette', () => {
    it('debe cambiar la paleta actual cuando demo está habilitado', async () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ isEnabled: true, paletteId: 'default' }));

      const { result } = renderHook(() => useThemeDemo());

      await waitFor(() => {
        expect(result.current.isDemoMode).toBe(true);
      });

      act(() => {
        result.current.setPalette('emerald');
      });

      expect(result.current.currentPalette?.id).toBe('emerald');
    });

    it('debe aplicar la paleta cuando demo mode está habilitado', async () => {
      const { applyDemoPalette } = require('@/config/colorPalettes');
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ isEnabled: true, paletteId: 'default' }));

      const { result } = renderHook(() => useThemeDemo());

      await waitFor(() => {
        expect(result.current.isDemoMode).toBe(true);
      });

      act(() => {
        result.current.setPalette('rose');
      });

      expect(applyDemoPalette).toHaveBeenCalled();
    });

    it('debe ignorar paletas inexistentes', async () => {
      localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ isEnabled: true, paletteId: 'default' }));

      const { result } = renderHook(() => useThemeDemo());

      await waitFor(() => {
        expect(result.current.currentPalette?.id).toBe('default');
      });

      act(() => {
        result.current.setPalette('non-existent');
      });

      // Palette should not change
      expect(result.current.currentPalette?.id).toBe('default');
    });

    it('debe guardar paletteId en localStorage', () => {
      const { result } = renderHook(() => useThemeDemo());

      act(() => {
        result.current.setPalette('emerald');
      });

      const stored = JSON.parse(localStorageMock.getItem(STORAGE_KEY) || '{}');
      expect(stored.paletteId).toBe('emerald');
    });
  });

  describe('enableDemo', () => {
    it('debe habilitar demo mode', () => {
      const { result } = renderHook(() => useThemeDemo());

      expect(result.current.isDemoMode).toBe(false);

      act(() => {
        result.current.enableDemo();
      });

      expect(result.current.isDemoMode).toBe(true);
    });

    it('debe aplicar la paleta actual al habilitar', () => {
      const { applyDemoPalette } = require('@/config/colorPalettes');

      const { result } = renderHook(() => useThemeDemo());

      act(() => {
        result.current.enableDemo();
      });

      expect(applyDemoPalette).toHaveBeenCalled();
    });
  });

  describe('disableDemo', () => {
    it('currentPalette debe ser null cuando demo está deshabilitado', () => {
      const { result } = renderHook(() => useThemeDemo());

      expect(result.current.isDemoMode).toBe(false);
      expect(result.current.currentPalette).toBeNull();
    });
  });

  describe('toggleDemo', () => {
    it('debe alternar demo mode de deshabilitado a habilitado', () => {
      const { result } = renderHook(() => useThemeDemo());

      expect(result.current.isDemoMode).toBe(false);

      act(() => {
        result.current.toggleDemo();
      });

      expect(result.current.isDemoMode).toBe(true);
    });
  });

  describe('localStorage Persistence', () => {
    it('debe guardar el estado en localStorage cuando cambia', () => {
      const { result } = renderHook(() => useThemeDemo());

      act(() => {
        result.current.setPalette('rose');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"paletteId":"rose"')
      );
    });

    it('debe guardar isEnabled en localStorage', () => {
      renderHook(() => useThemeDemo());

      // El hook guarda el estado inicial
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.stringContaining('"isEnabled"')
      );
    });
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('useThemeDemo Edge Cases', () => {
  it('debe retornar todos los métodos esperados', () => {
    const { result } = renderHook(() => useThemeDemo());

    expect(typeof result.current.isDemoMode).toBe('boolean');
    expect(typeof result.current.palettes).toBe('object');
    expect(typeof result.current.setPalette).toBe('function');
    expect(typeof result.current.enableDemo).toBe('function');
    expect(typeof result.current.disableDemo).toBe('function');
    expect(typeof result.current.toggleDemo).toBe('function');
  });

  it('debe mantener estabilidad de referencias en callbacks', () => {
    const { result, rerender } = renderHook(() => useThemeDemo());

    const initialEnableDemo = result.current.enableDemo;
    const initialDisableDemo = result.current.disableDemo;

    rerender();

    // Callbacks should maintain reference stability due to useCallback
    expect(result.current.enableDemo).toBe(initialEnableDemo);
    expect(result.current.disableDemo).toBe(initialDisableDemo);
  });

  it('debe manejar múltiples cambios de paleta cuando demo está habilitado', async () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify({ isEnabled: true, paletteId: 'default' }));

    const { result } = renderHook(() => useThemeDemo());

    await waitFor(() => {
      expect(result.current.isDemoMode).toBe(true);
    });

    act(() => {
      result.current.setPalette('emerald');
    });
    expect(result.current.currentPalette?.id).toBe('emerald');

    act(() => {
      result.current.setPalette('rose');
    });
    expect(result.current.currentPalette?.id).toBe('rose');

    act(() => {
      result.current.setPalette('default');
    });
    expect(result.current.currentPalette?.id).toBe('default');
  });
});
