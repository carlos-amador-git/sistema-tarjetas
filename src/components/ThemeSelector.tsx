'use client';

/**
 * Selector de Tema para Demos
 *
 * Dropdown que permite cambiar rápidamente entre paletas de colores
 * durante demos con clientes. Visible solo en modo desarrollo o con ?demo=true.
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Palette, ChevronDown, Check, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeDemo } from '@/hooks/useThemeDemo';
import type { DemoPalette } from '@/config/colorPalettes';

interface ThemeSelectorProps {
  className?: string;
  collapsed?: boolean;
}

export function ThemeSelector({ className, collapsed = false }: ThemeSelectorProps) {
  const {
    isDemoMode,
    currentPalette,
    palettes,
    setPalette,
    enableDemo,
  } = useThemeDemo();

  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8, // Position below button
        left: rect.left,
      });
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Don't render in production without demo flag
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = process.env.NODE_ENV === 'development';
    const hasDemoParam = urlParams.get('demo') === 'true';
    const isDemoModeEnv = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

    if (!isDev && !hasDemoParam && !isDemoModeEnv) {
      return null;
    }
  }

  const handlePaletteSelect = (palette: DemoPalette) => {
    if (!isDemoMode) {
      enableDemo();
    }
    setPalette(palette.id);
    setIsOpen(false);
  };

  // Collapsed mode - just show icon
  if (collapsed) {
    return (
      <div className={cn('relative', className)}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'p-2 rounded-xl transition-all duration-200',
            'bg-white/10 hover:bg-white/20',
            'text-slate-300 hover:text-white'
          )}
          title="Paleta de colores (Demo)"
        >
          <Palette className="h-5 w-5" />
        </button>

        {isOpen && typeof document !== 'undefined' && createPortal(
          <PaletteMenu
            ref={menuRef}
            palettes={palettes}
            currentPalette={currentPalette}
            onSelect={handlePaletteSelect}
            style={{
              position: 'fixed',
              top: menuPosition.top,
              left: menuPosition.left + 50,
            }}
          />,
          document.body
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 w-full',
          'bg-white/10 hover:bg-white/20',
          'text-slate-300 hover:text-white'
        )}
      >
        <Palette className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 text-left text-sm truncate">
          {currentPalette?.name || 'Demo Theme'}
        </span>
        <div className="flex items-center gap-1">
          {/* Color preview dots */}
          {currentPalette && (
            <div className="flex -space-x-1">
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: currentPalette.primary }}
              />
              <div
                className="w-3 h-3 rounded-full border border-white/30"
                style={{ backgroundColor: currentPalette.accent }}
              />
            </div>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <PaletteMenu
          ref={menuRef}
          palettes={palettes}
          currentPalette={currentPalette}
          onSelect={handlePaletteSelect}
          style={{
            position: 'fixed',
            top: menuPosition.top,
            left: menuPosition.left,
            minWidth: '220px',
          }}
        />,
        document.body
      )}
    </div>
  );
}

interface PaletteMenuProps {
  palettes: DemoPalette[];
  currentPalette: DemoPalette | null;
  onSelect: (palette: DemoPalette) => void;
  style?: React.CSSProperties;
}

const PaletteMenu = ({ palettes, currentPalette, onSelect, style }: PaletteMenuProps & { ref?: React.Ref<HTMLDivElement> }) => {
  return (
    <div
      className={cn(
        'z-[9999] py-2',
        'bg-slate-800 rounded-xl shadow-2xl',
        'border border-slate-600',
      )}
      style={style}
    >
      <div className="px-3 py-2 border-b border-slate-600">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Paleta de Demo
        </p>
      </div>

      <div className="py-1 max-h-80 overflow-y-auto">
        {palettes.map((palette) => {
          const isSelected = currentPalette?.id === palette.id;

          return (
            <button
              key={palette.id}
              onClick={() => onSelect(palette)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 transition-colors',
                isSelected
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Color preview */}
              <div className="flex -space-x-1 flex-shrink-0">
                <div
                  className="w-5 h-5 rounded-full border-2 border-slate-600"
                  style={{ backgroundColor: palette.primary }}
                />
                <div
                  className="w-5 h-5 rounded-full border-2 border-slate-600"
                  style={{ backgroundColor: palette.secondary }}
                />
                <div
                  className="w-5 h-5 rounded-full border-2 border-slate-600"
                  style={{ backgroundColor: palette.accent }}
                />
              </div>

              <span className="flex-1 text-left text-sm font-medium">
                {palette.name}
              </span>

              {isSelected && (
                <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t border-slate-600">
        <p className="text-xs text-slate-500">
          6 paletas disponibles
        </p>
      </div>
    </div>
  );
};

/**
 * Indicator badge for demo mode
 */
export function DemoModeIndicator() {
  const { isDemoMode } = useThemeDemo();

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500 text-amber-950 text-xs font-medium shadow-lg">
        <Eye className="h-3 w-3" />
        Modo Demo
      </div>
    </div>
  );
}

export default ThemeSelector;
