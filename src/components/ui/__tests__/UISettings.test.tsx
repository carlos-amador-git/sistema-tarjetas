/**
 * Tests para UISettings
 *
 * Componentes testeados:
 * - UISettingsProvider (Context)
 * - useUISettings (Hook)
 * - UISettingsPanel
 * - UISettingsButton
 * - ThemeTab, LayoutTab, EffectsTab
 * - PaletteOption, ToggleOption
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import {
  UISettingsProvider,
  useUISettings,
  UISettingsPanel,
  UISettingsButton,
  UISettings,
  ThemeMode,
  ViewMode,
  Density,
} from '../UISettings';

// =============================================================================
// MOCKS
// =============================================================================

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

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
});

// Mock colorPalettes
jest.mock('@/config/colorPalettes', () => ({
  COLOR_PALETTES: [
    {
      id: 'corporate-blue',
      name: 'Azul Corporativo',
      category: 'banking',
      description: 'Azul profesional',
      preview: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
    },
    {
      id: 'emerald-bank',
      name: 'Verde Esmeralda',
      category: 'banking',
      description: 'Verde elegante',
      preview: { primary: '#059669', secondary: '#047857', accent: '#34d399' },
    },
    {
      id: 'fintech-purple',
      name: 'Violeta Fintech',
      category: 'fintech',
      description: 'Violeta moderno',
      preview: { primary: '#7c3aed', secondary: '#6d28d9', accent: '#a78bfa' },
    },
    {
      id: 'corporate-slate',
      name: 'Gris Ejecutivo',
      category: 'corporate',
      description: 'Gris profesional',
      preview: { primary: '#475569', secondary: '#334155', accent: '#94a3b8' },
    },
  ],
  getPaletteById: jest.fn((id: string) => {
    const palettes = [
      {
        id: 'corporate-blue',
        name: 'Azul Corporativo',
        category: 'banking',
        description: 'Azul profesional',
        preview: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' },
      },
      {
        id: 'emerald-bank',
        name: 'Verde Esmeralda',
        category: 'banking',
        description: 'Verde elegante',
        preview: { primary: '#059669', secondary: '#047857', accent: '#34d399' },
      },
    ];
    return palettes.find(p => p.id === id) || palettes[0];
  }),
  generatePaletteCSSVariables: jest.fn(() => ({
    '--color-primary': '#3b82f6',
    '--color-secondary': '#1e40af',
  })),
}));

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

// Component to test useUISettings hook
function TestConsumer() {
  const { settings, updateSettings, currentPalette, effectiveMode, resetToDefaults } =
    useUISettings();

  return (
    <div>
      <span data-testid="palette-id">{settings.paletteId}</span>
      <span data-testid="theme-mode">{settings.themeMode}</span>
      <span data-testid="view-mode">{settings.viewMode}</span>
      <span data-testid="density">{settings.density}</span>
      <span data-testid="animations">{String(settings.enableAnimations)}</span>
      <span data-testid="glassmorphism">{String(settings.enableGlassmorphism)}</span>
      <span data-testid="gradients">{String(settings.enableGradients)}</span>
      <span data-testid="reduce-motion">{String(settings.reduceMotion)}</span>
      <span data-testid="high-contrast">{String(settings.highContrast)}</span>
      <span data-testid="current-palette">{currentPalette.name}</span>
      <span data-testid="effective-mode">{effectiveMode}</span>
      <button onClick={() => updateSettings({ themeMode: 'dark' })} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => updateSettings({ viewMode: 'list' })} data-testid="set-list">
        Set List
      </button>
      <button onClick={() => updateSettings({ density: 'compact' })} data-testid="set-compact">
        Set Compact
      </button>
      <button onClick={resetToDefaults} data-testid="reset">
        Reset
      </button>
    </div>
  );
}

// =============================================================================
// SETUP
// =============================================================================

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  // Reset matchMedia mock
  window.matchMedia = jest.fn().mockImplementation(() => mockMatchMedia(false));
  // Reset document classes
  document.documentElement.classList.remove('dark', 'reduce-motion', 'high-contrast');
  document.documentElement.removeAttribute('data-density');
});

// =============================================================================
// USE UI SETTINGS HOOK TESTS
// =============================================================================

describe('useUISettings', () => {
  it('debe lanzar error si se usa fuera del provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useUISettings must be used within UISettingsProvider');

    consoleSpy.mockRestore();
  });
});

// =============================================================================
// UI SETTINGS PROVIDER TESTS
// =============================================================================

describe('UISettingsProvider', () => {
  describe('Default Values', () => {
    it('debe proporcionar valores por defecto', () => {
      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('palette-id')).toHaveTextContent('corporate-blue');
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
      expect(screen.getByTestId('density')).toHaveTextContent('comfortable');
      expect(screen.getByTestId('animations')).toHaveTextContent('true');
      expect(screen.getByTestId('glassmorphism')).toHaveTextContent('true');
      expect(screen.getByTestId('gradients')).toHaveTextContent('true');
      expect(screen.getByTestId('reduce-motion')).toHaveTextContent('false');
      expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
    });

    it('debe usar defaultPaletteId cuando se proporciona', () => {
      render(
        <UISettingsProvider defaultPaletteId="emerald-bank">
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('palette-id')).toHaveTextContent('emerald-bank');
    });
  });

  describe('localStorage', () => {
    it('debe cargar settings desde localStorage', () => {
      const storedSettings: Partial<UISettings> = {
        themeMode: 'dark',
        viewMode: 'list',
        density: 'compact',
      };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(storedSettings));

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
      expect(screen.getByTestId('density')).toHaveTextContent('compact');
    });

    it('debe guardar settings en localStorage cuando cambian', () => {
      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'cardsystem-ui-settings',
        expect.stringContaining('"themeMode":"dark"')
      );
    });

    it('debe ignorar JSON inválido en localStorage', () => {
      localStorageMock.setItem('cardsystem-ui-settings', 'invalid json');

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      // Should use defaults
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    });
  });

  describe('updateSettings', () => {
    it('debe actualizar themeMode', () => {
      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      fireEvent.click(screen.getByTestId('set-dark'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });

    it('debe actualizar viewMode', () => {
      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
      fireEvent.click(screen.getByTestId('set-list'));
      expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
    });

    it('debe actualizar density', () => {
      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('density')).toHaveTextContent('comfortable');
      fireEvent.click(screen.getByTestId('set-compact'));
      expect(screen.getByTestId('density')).toHaveTextContent('compact');
    });
  });

  describe('resetToDefaults', () => {
    it('debe restablecer todos los valores a sus defaults', () => {
      const storedSettings: Partial<UISettings> = {
        themeMode: 'dark',
        viewMode: 'list',
        density: 'compact',
        enableAnimations: false,
      };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(storedSettings));

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      // Verify loaded from storage
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

      // Reset
      fireEvent.click(screen.getByTestId('reset'));

      // Check defaults restored
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
      expect(screen.getByTestId('density')).toHaveTextContent('comfortable');
      expect(screen.getByTestId('animations')).toHaveTextContent('true');
    });

    it('debe preservar defaultPaletteId al resetear', () => {
      const storedSettings: Partial<UISettings> = {
        paletteId: 'fintech-purple',
      };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(storedSettings));

      render(
        <UISettingsProvider defaultPaletteId="emerald-bank">
          <TestConsumer />
        </UISettingsProvider>
      );

      // Verify storage overrode default
      expect(screen.getByTestId('palette-id')).toHaveTextContent('fintech-purple');

      // Reset should use defaultPaletteId
      fireEvent.click(screen.getByTestId('reset'));
      expect(screen.getByTestId('palette-id')).toHaveTextContent('emerald-bank');
    });
  });

  describe('effectiveMode', () => {
    it('debe retornar light cuando themeMode es light', () => {
      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('effective-mode')).toHaveTextContent('light');
    });

    it('debe retornar dark cuando themeMode es dark', () => {
      const stored = { themeMode: 'dark' };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(stored));

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('effective-mode')).toHaveTextContent('dark');
    });

    it('debe usar preferencia del sistema cuando themeMode es system', () => {
      window.matchMedia = jest.fn().mockImplementation((query: string) => {
        if (query === '(prefers-color-scheme: dark)') {
          return mockMatchMedia(true);
        }
        return mockMatchMedia(false);
      });

      const stored = { themeMode: 'system' };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(stored));

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('effective-mode')).toHaveTextContent('dark');
    });
  });

  describe('CSS Variables and Classes', () => {
    it('debe agregar clase dark cuando effectiveMode es dark', () => {
      const stored = { themeMode: 'dark' };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(stored));

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('debe agregar clase reduce-motion cuando reduceMotion es true', () => {
      const stored = { reduceMotion: true };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(stored));

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(document.documentElement.classList.contains('reduce-motion')).toBe(true);
    });

    it('debe agregar clase high-contrast cuando highContrast es true', () => {
      const stored = { highContrast: true };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(stored));

      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    });

    it('debe establecer data-density en el documento', () => {
      render(
        <UISettingsProvider>
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(document.documentElement.dataset.density).toBe('comfortable');
    });
  });
});

// =============================================================================
// UI SETTINGS PANEL TESTS
// =============================================================================

describe('UISettingsPanel', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('no debe renderizar cuando isOpen es false', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={false} onClose={mockOnClose} />
      </UISettingsProvider>
    );

    expect(screen.queryByText('Personalizar Interfaz')).not.toBeInTheDocument();
  });

  it('debe renderizar cuando isOpen es true', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={true} onClose={mockOnClose} />
      </UISettingsProvider>
    );

    expect(screen.getByText('Personalizar Interfaz')).toBeInTheDocument();
    expect(screen.getByText('Ajusta la apariencia del sistema')).toBeInTheDocument();
  });

  it('debe tener 3 tabs', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={true} onClose={mockOnClose} />
      </UISettingsProvider>
    );

    expect(screen.getByText('Tema')).toBeInTheDocument();
    expect(screen.getByText('Vista')).toBeInTheDocument();
    expect(screen.getByText('Efectos')).toBeInTheDocument();
  });

  it('debe llamar onClose cuando se hace click en el backdrop', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={true} onClose={mockOnClose} />
      </UISettingsProvider>
    );

    // Click on backdrop (has bg-black/50 class)
    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('debe llamar onClose cuando se hace click en el botón X', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={true} onClose={mockOnClose} />
      </UISettingsProvider>
    );

    // Find close button (X icon)
    const closeButton = document.querySelector('button svg.lucide-x')?.closest('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  describe('Theme Tab', () => {
    it('debe mostrar opciones de modo de tema', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
        </UISettingsProvider>
      );

      expect(screen.getByText('Modo de Tema')).toBeInTheDocument();
      expect(screen.getByText('Claro')).toBeInTheDocument();
      expect(screen.getByText('Oscuro')).toBeInTheDocument();
      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });

    it('debe mostrar categorías de paletas', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
        </UISettingsProvider>
      );

      expect(screen.getByText('Paleta de Colores')).toBeInTheDocument();
      expect(screen.getByText('Banca Tradicional')).toBeInTheDocument();
      expect(screen.getByText('Fintech & Digital')).toBeInTheDocument();
      expect(screen.getByText('Corporativo')).toBeInTheDocument();
    });

    it('debe cambiar themeMode cuando se selecciona una opción', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      fireEvent.click(screen.getByText('Oscuro'));
      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    });

    it('debe expandir/colapsar categorías de paletas', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
        </UISettingsProvider>
      );

      // Banking category should be expanded by default
      expect(screen.getByText('Azul Corporativo')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('Banca Tradicional'));

      // Palettes should be hidden
      expect(screen.queryByText('Azul Corporativo')).not.toBeInTheDocument();

      // Click to expand again
      fireEvent.click(screen.getByText('Banca Tradicional'));
      expect(screen.getByText('Azul Corporativo')).toBeInTheDocument();
    });
  });

  describe('Layout Tab', () => {
    it('debe mostrar opciones de visualización', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByText('Vista'));

      expect(screen.getByText('Estilo de Visualización')).toBeInTheDocument();
      expect(screen.getByText('Tarjetas')).toBeInTheDocument();
      expect(screen.getByText('Lista')).toBeInTheDocument();
      // 'Compacto' appears in both viewMode and density, so we use getAllByText
      expect(screen.getAllByText('Compacto').length).toBeGreaterThanOrEqual(1);
    });

    it('debe mostrar opciones de densidad', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByText('Vista'));

      expect(screen.getByText('Densidad de Información')).toBeInTheDocument();
      expect(screen.getByText('Espacioso')).toBeInTheDocument();
      expect(screen.getByText('Normal')).toBeInTheDocument();
      // 'Compacto' appears twice (viewMode and density)
    });

    it('debe cambiar viewMode cuando se selecciona una opción', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
          <TestConsumer />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByText('Vista'));

      expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
      fireEvent.click(screen.getByText('Lista'));
      expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
    });

    it('debe cambiar density cuando se selecciona una opción', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
          <TestConsumer />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByText('Vista'));

      expect(screen.getByTestId('density')).toHaveTextContent('comfortable');
      fireEvent.click(screen.getByText('Espacioso'));
      expect(screen.getByTestId('density')).toHaveTextContent('spacious');
    });
  });

  describe('Effects Tab', () => {
    it('debe mostrar toggles de efectos', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByText('Efectos'));

      expect(screen.getByText('Animaciones')).toBeInTheDocument();
      expect(screen.getByText('Efecto Cristal')).toBeInTheDocument();
      expect(screen.getByText('Gradientes')).toBeInTheDocument();
      expect(screen.getByText('Reducir Movimiento')).toBeInTheDocument();
      expect(screen.getByText('Alto Contraste')).toBeInTheDocument();
    });

    it('debe cambiar enableAnimations cuando se hace toggle', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
          <TestConsumer />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByText('Efectos'));

      expect(screen.getByTestId('animations')).toHaveTextContent('true');

      // Click on the Animaciones toggle
      const animationsToggle = screen.getByText('Animaciones').closest('button');
      if (animationsToggle) {
        fireEvent.click(animationsToggle);
      }

      expect(screen.getByTestId('animations')).toHaveTextContent('false');
    });

    it('debe cambiar reduceMotion cuando se hace toggle', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
          <TestConsumer />
        </UISettingsProvider>
      );

      fireEvent.click(screen.getByText('Efectos'));

      expect(screen.getByTestId('reduce-motion')).toHaveTextContent('false');

      const reduceMotionToggle = screen.getByText('Reducir Movimiento').closest('button');
      if (reduceMotionToggle) {
        fireEvent.click(reduceMotionToggle);
      }

      expect(screen.getByTestId('reduce-motion')).toHaveTextContent('true');
    });
  });

  describe('Reset Button', () => {
    it('debe mostrar botón de restablecer', () => {
      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
        </UISettingsProvider>
      );

      expect(screen.getByText('Restablecer valores predeterminados')).toBeInTheDocument();
    });

    it('debe restablecer valores cuando se hace click', () => {
      const stored = { themeMode: 'dark', viewMode: 'list' };
      localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(stored));

      render(
        <UISettingsProvider>
          <UISettingsPanel isOpen={true} onClose={mockOnClose} />
          <TestConsumer />
        </UISettingsProvider>
      );

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('list');

      fireEvent.click(screen.getByText('Restablecer valores predeterminados'));

      expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
      expect(screen.getByTestId('view-mode')).toHaveTextContent('cards');
    });
  });
});

// =============================================================================
// UI SETTINGS BUTTON TESTS
// =============================================================================

describe('UISettingsButton', () => {
  it('debe renderizar botón de configuración', () => {
    render(
      <UISettingsProvider>
        <UISettingsButton />
      </UISettingsProvider>
    );

    const button = screen.getByTitle('Personalizar interfaz');
    expect(button).toBeInTheDocument();
  });

  it('debe abrir el panel cuando se hace click', () => {
    render(
      <UISettingsProvider>
        <UISettingsButton />
      </UISettingsProvider>
    );

    expect(screen.queryByText('Personalizar Interfaz')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Personalizar interfaz'));

    expect(screen.getByText('Personalizar Interfaz')).toBeInTheDocument();
  });

  it('debe cerrar el panel cuando se hace click en el backdrop', () => {
    render(
      <UISettingsProvider>
        <UISettingsButton />
      </UISettingsProvider>
    );

    // Open panel
    fireEvent.click(screen.getByTitle('Personalizar interfaz'));
    expect(screen.getByText('Personalizar Interfaz')).toBeInTheDocument();

    // Close via backdrop
    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(screen.queryByText('Personalizar Interfaz')).not.toBeInTheDocument();
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

describe('UISettings Accessibility', () => {
  it('el panel debe tener estructura semántica correcta', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={true} onClose={jest.fn()} />
      </UISettingsProvider>
    );

    // Header
    expect(screen.getByRole('heading', { level: 2, name: 'Personalizar Interfaz' })).toBeInTheDocument();

    // Buttons
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('los toggles deben ser accesibles como botones', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={true} onClose={jest.fn()} />
      </UISettingsProvider>
    );

    fireEvent.click(screen.getByText('Efectos'));

    const animationsToggle = screen.getByText('Animaciones').closest('button');
    expect(animationsToggle).toBeInTheDocument();
    expect(animationsToggle?.tagName).toBe('BUTTON');
  });

  it('debe aplicar clase reduce-motion cuando el usuario prefiere movimiento reducido', () => {
    window.matchMedia = jest.fn().mockImplementation((query: string) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    render(
      <UISettingsProvider>
        <TestConsumer />
      </UISettingsProvider>
    );

    // Provider should detect system preference and set reduceMotion
    expect(screen.getByTestId('reduce-motion')).toHaveTextContent('true');
  });
});

// =============================================================================
// EDGE CASES
// =============================================================================

describe('UISettings Edge Cases', () => {
  it('debe manejar paleta inexistente gracefully', () => {
    const stored = { paletteId: 'non-existent-palette' };
    localStorageMock.setItem('cardsystem-ui-settings', JSON.stringify(stored));

    render(
      <UISettingsProvider>
        <TestConsumer />
      </UISettingsProvider>
    );

    // Should fall back to first palette
    expect(screen.getByTestId('current-palette')).toHaveTextContent('Azul Corporativo');
  });

  it('debe manejar múltiples actualizaciones rápidas', () => {
    render(
      <UISettingsProvider>
        <TestConsumer />
      </UISettingsProvider>
    );

    // Rapid updates
    fireEvent.click(screen.getByTestId('set-dark'));
    fireEvent.click(screen.getByTestId('set-list'));
    fireEvent.click(screen.getByTestId('set-compact'));

    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('view-mode')).toHaveTextContent('list');
    expect(screen.getByTestId('density')).toHaveTextContent('compact');
  });

  it('debe cambiar de tab correctamente', () => {
    render(
      <UISettingsProvider>
        <UISettingsPanel isOpen={true} onClose={jest.fn()} />
      </UISettingsProvider>
    );

    // Start on Theme tab
    expect(screen.getByText('Modo de Tema')).toBeInTheDocument();

    // Go to Vista
    fireEvent.click(screen.getByText('Vista'));
    expect(screen.getByText('Estilo de Visualización')).toBeInTheDocument();
    expect(screen.queryByText('Modo de Tema')).not.toBeInTheDocument();

    // Go to Efectos
    fireEvent.click(screen.getByText('Efectos'));
    expect(screen.getByText('Animaciones')).toBeInTheDocument();
    expect(screen.queryByText('Estilo de Visualización')).not.toBeInTheDocument();

    // Back to Tema
    fireEvent.click(screen.getByText('Tema'));
    expect(screen.getByText('Modo de Tema')).toBeInTheDocument();
  });
});
