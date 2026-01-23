'use client';

/**
 * Componente de Configuración de UI
 *
 * Panel de preferencias de interfaz que permite:
 * - Seleccionar paleta de colores institucional
 * - Alternar entre modo claro/oscuro
 * - Cambiar visualización (tarjetas/líneas)
 * - Configurar densidad de información
 * - Activar animaciones y efectos
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  Palette,
  Sun,
  Moon,
  LayoutGrid,
  List,
  Sparkles,
  Settings2,
  ChevronDown,
  Check,
  Monitor,
  Maximize2,
  Minimize2,
  Zap,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  COLOR_PALETTES,
  ColorPalette,
  getPaletteById,
  generatePaletteCSSVariables,
} from '@/config/colorPalettes';

// =============================================================================
// TIPOS
// =============================================================================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ViewMode = 'cards' | 'list' | 'compact';
export type Density = 'comfortable' | 'compact' | 'spacious';

export interface UISettings {
  paletteId: string;
  themeMode: ThemeMode;
  viewMode: ViewMode;
  density: Density;
  enableAnimations: boolean;
  enableGlassmorphism: boolean;
  enableGradients: boolean;
  reduceMotion: boolean;
  highContrast: boolean;
}

interface UISettingsContextType {
  settings: UISettings;
  updateSettings: (updates: Partial<UISettings>) => void;
  currentPalette: ColorPalette;
  effectiveMode: 'light' | 'dark';
  resetToDefaults: () => void;
}

// =============================================================================
// VALORES POR DEFECTO
// =============================================================================

const DEFAULT_SETTINGS: UISettings = {
  paletteId: 'corporate-blue',
  themeMode: 'light',
  viewMode: 'cards',
  density: 'comfortable',
  enableAnimations: true,
  enableGlassmorphism: true,
  enableGradients: true,
  reduceMotion: false,
  highContrast: false,
};

const STORAGE_KEY = 'cardsystem-ui-settings';

// =============================================================================
// CONTEXTO
// =============================================================================

const UISettingsContext = createContext<UISettingsContextType | null>(null);

export function useUISettings() {
  const context = useContext(UISettingsContext);
  if (!context) {
    throw new Error('useUISettings must be used within UISettingsProvider');
  }
  return context;
}

// =============================================================================
// PROVIDER
// =============================================================================

interface UISettingsProviderProps {
  children: ReactNode;
  defaultPaletteId?: string;
}

export function UISettingsProvider({
  children,
  defaultPaletteId,
}: UISettingsProviderProps) {
  const [settings, setSettings] = useState<UISettings>(() => {
    // Cargar desde localStorage si existe
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch {
          // Ignorar errores de parsing
        }
      }
    }
    return {
      ...DEFAULT_SETTINGS,
      paletteId: defaultPaletteId || DEFAULT_SETTINGS.paletteId,
    };
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detectar preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Detectar preferencia de movimiento reducido
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches && !settings.reduceMotion) {
      setSettings(prev => ({ ...prev, reduceMotion: true }));
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Aplicar CSS variables
  useEffect(() => {
    const palette = getPaletteById(settings.paletteId) || COLOR_PALETTES[0];
    const effectiveMode =
      settings.themeMode === 'system'
        ? systemPrefersDark
          ? 'dark'
          : 'light'
        : settings.themeMode;

    const cssVars = generatePaletteCSSVariables(palette, effectiveMode);

    // Aplicar al :root
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Clase de modo oscuro
    root.classList.toggle('dark', effectiveMode === 'dark');

    // Clases de animación
    root.classList.toggle('reduce-motion', settings.reduceMotion || !settings.enableAnimations);
    root.classList.toggle('high-contrast', settings.highContrast);

    // Density classes
    root.dataset.density = settings.density;
  }, [settings, systemPrefersDark]);

  const updateSettings = (updates: Partial<UISettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setSettings({
      ...DEFAULT_SETTINGS,
      paletteId: defaultPaletteId || DEFAULT_SETTINGS.paletteId,
    });
  };

  const currentPalette = getPaletteById(settings.paletteId) || COLOR_PALETTES[0];
  const effectiveMode =
    settings.themeMode === 'system'
      ? systemPrefersDark
        ? 'dark'
        : 'light'
      : settings.themeMode;

  return (
    <UISettingsContext.Provider
      value={{
        settings,
        updateSettings,
        currentPalette,
        effectiveMode,
        resetToDefaults,
      }}
    >
      {children}
    </UISettingsContext.Provider>
  );
}

// =============================================================================
// COMPONENTE PANEL DE CONFIGURACIÓN
// =============================================================================

interface UISettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UISettingsPanel({ isOpen, onClose }: UISettingsPanelProps) {
  const { settings, updateSettings, resetToDefaults } = useUISettings();
  const [activeTab, setActiveTab] = useState<'theme' | 'layout' | 'effects'>('theme');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md bg-[var(--color-surface)] shadow-2xl z-50',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--color-primary)]/10">
              <Settings2 className="h-5 w-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--color-text)]">
                Personalizar Interfaz
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Ajusta la apariencia del sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <X className="h-5 w-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--color-border)]">
          {[
            { id: 'theme', label: 'Tema', icon: Palette },
            { id: 'layout', label: 'Vista', icon: LayoutGrid },
            { id: 'effects', label: 'Efectos', icon: Sparkles },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-140px)]">
          {activeTab === 'theme' && (
            <ThemeTab settings={settings} updateSettings={updateSettings} />
          )}
          {activeTab === 'layout' && (
            <LayoutTab settings={settings} updateSettings={updateSettings} />
          )}
          {activeTab === 'effects' && (
            <EffectsTab settings={settings} updateSettings={updateSettings} />
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <button
            onClick={resetToDefaults}
            className="w-full py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Restablecer valores predeterminados
          </button>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// TABS
// =============================================================================

interface TabProps {
  settings: UISettings;
  updateSettings: (updates: Partial<UISettings>) => void;
}

function ThemeTab({ settings, updateSettings }: TabProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('banking');

  const categories = [
    { id: 'banking', label: 'Banca Tradicional' },
    { id: 'fintech', label: 'Fintech & Digital' },
    { id: 'corporate', label: 'Corporativo' },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Mode */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Modo de Tema
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'light', label: 'Claro', icon: Sun },
            { id: 'dark', label: 'Oscuro', icon: Moon },
            { id: 'system', label: 'Sistema', icon: Monitor },
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => updateSettings({ themeMode: mode.id as ThemeMode })}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                settings.themeMode === mode.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              )}
            >
              <mode.icon
                className={cn(
                  'h-5 w-5',
                  settings.themeMode === mode.id
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  settings.themeMode === mode.id
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                )}
              >
                {mode.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Palettes by Category */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Paleta de Colores
        </label>
        <div className="space-y-2">
          {categories.map(category => {
            const palettes = COLOR_PALETTES.filter(p => p.category === category.id);
            const isExpanded = expandedCategory === category.id;

            return (
              <div
                key={category.id}
                className="border border-[var(--color-border)] rounded-xl overflow-hidden"
              >
                <button
                  onClick={() =>
                    setExpandedCategory(isExpanded ? null : category.id)
                  }
                  className="w-full flex items-center justify-between p-3 hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {category.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-[var(--color-text-muted)] transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="p-2 pt-0 space-y-2">
                    {palettes.map(palette => (
                      <PaletteOption
                        key={palette.id}
                        palette={palette}
                        isSelected={settings.paletteId === palette.id}
                        onSelect={() => updateSettings({ paletteId: palette.id })}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LayoutTab({ settings, updateSettings }: TabProps) {
  return (
    <div className="space-y-6">
      {/* View Mode */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Estilo de Visualización
        </label>
        <div className="space-y-2">
          {[
            {
              id: 'cards',
              label: 'Tarjetas',
              description: 'Información en tarjetas con más detalles visuales',
              icon: LayoutGrid,
            },
            {
              id: 'list',
              label: 'Lista',
              description: 'Vista de lista tradicional para escaneo rápido',
              icon: List,
            },
            {
              id: 'compact',
              label: 'Compacto',
              description: 'Más datos en menos espacio',
              icon: Minimize2,
            },
          ].map(view => (
            <button
              key={view.id}
              onClick={() => updateSettings({ viewMode: view.id as ViewMode })}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                settings.viewMode === view.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg',
                  settings.viewMode === view.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
                )}
              >
                <view.icon className="h-4 w-4" />
              </div>
              <div>
                <p
                  className={cn(
                    'font-medium text-sm',
                    settings.viewMode === view.id
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-text)]'
                  )}
                >
                  {view.label}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {view.description}
                </p>
              </div>
              {settings.viewMode === view.id && (
                <Check className="h-4 w-4 text-[var(--color-primary)] ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Densidad de Información
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'spacious', label: 'Espacioso', icon: Maximize2 },
            { id: 'comfortable', label: 'Normal', icon: Monitor },
            { id: 'compact', label: 'Compacto', icon: Minimize2 },
          ].map(density => (
            <button
              key={density.id}
              onClick={() => updateSettings({ density: density.id as Density })}
              className={cn(
                'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                settings.density === density.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]'
              )}
            >
              <density.icon
                className={cn(
                  'h-5 w-5',
                  settings.density === density.id
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  settings.density === density.id
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)]'
                )}
              >
                {density.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function EffectsTab({ settings, updateSettings }: TabProps) {
  return (
    <div className="space-y-4">
      {/* Toggle Options */}
      {[
        {
          key: 'enableAnimations',
          label: 'Animaciones',
          description: 'Transiciones y micro-interacciones suaves',
          icon: Zap,
        },
        {
          key: 'enableGlassmorphism',
          label: 'Efecto Cristal',
          description: 'Transparencias y blur en elementos flotantes',
          icon: Sparkles,
        },
        {
          key: 'enableGradients',
          label: 'Gradientes',
          description: 'Fondos y botones con degradados',
          icon: Palette,
        },
        {
          key: 'reduceMotion',
          label: 'Reducir Movimiento',
          description: 'Minimiza animaciones para accesibilidad',
          icon: Eye,
        },
        {
          key: 'highContrast',
          label: 'Alto Contraste',
          description: 'Mejora la legibilidad con más contraste',
          icon: Eye,
        },
      ].map(option => (
        <ToggleOption
          key={option.key}
          label={option.label}
          description={option.description}
          icon={option.icon}
          checked={settings[option.key as keyof UISettings] as boolean}
          onChange={checked =>
            updateSettings({ [option.key]: checked })
          }
        />
      ))}
    </div>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

interface PaletteOptionProps {
  palette: ColorPalette;
  isSelected: boolean;
  onSelect: () => void;
}

function PaletteOption({ palette, isSelected, onSelect }: PaletteOptionProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
        isSelected
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
          : 'border-transparent hover:bg-[var(--color-surface-hover)]'
      )}
    >
      {/* Preview Colors */}
      <div className="flex -space-x-1">
        {[palette.preview.primary, palette.preview.secondary, palette.preview.accent].map(
          (color, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: color }}
            />
          )
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <p
          className={cn(
            'text-sm font-medium',
            isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
          )}
        >
          {palette.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
          {palette.description}
        </p>
      </div>

      {/* Check */}
      {isSelected && (
        <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </button>
  );
}

interface ToggleOptionProps {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: ToggleOptionProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-colors"
    >
      <div
        className={cn(
          'p-2 rounded-lg transition-colors',
          checked
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      </div>
      <div
        className={cn(
          'w-10 h-6 rounded-full transition-colors relative',
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
        )}
      >
        <div
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </div>
    </button>
  );
}

// =============================================================================
// BOTÓN DE ACCESO RÁPIDO
// =============================================================================

export function UISettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'p-2 rounded-xl transition-all',
          'bg-[var(--color-surface)] border border-[var(--color-border)]',
          'hover:border-[var(--color-primary)] hover:shadow-lg',
          'group'
        )}
        title="Personalizar interfaz"
      >
        <Settings2
          className={cn(
            'h-5 w-5 text-[var(--color-text-muted)]',
            'group-hover:text-[var(--color-primary)] transition-colors'
          )}
        />
      </button>

      <UISettingsPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default UISettingsPanel;
