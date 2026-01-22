'use client';

/**
 * Hook para manejo de tema de demo
 *
 * Permite hacer override temporal del tema del tenant durante demos con clientes.
 * - Guarda la selección en localStorage para persistencia durante la demo
 * - No afecta la configuración real del tenant
 * - Se activa con ?demo=true en la URL o en modo desarrollo
 */

import { useState, useEffect, useCallback } from 'react';
import {
  DEMO_PALETTES,
  DemoPalette,
  getDemoPaletteById,
  applyDemoPalette
} from '@/config/colorPalettes';

const STORAGE_KEY = 'cardsystem-demo-theme';
const DEFAULT_PALETTE_ID = 'default';

interface ThemeDemoState {
  isEnabled: boolean;
  paletteId: string;
}

interface UseThemeDemoReturn {
  /** Whether demo mode is active */
  isDemoMode: boolean;
  /** Current demo palette (null if demo mode is off) */
  currentPalette: DemoPalette | null;
  /** All available demo palettes */
  palettes: DemoPalette[];
  /** Set the active demo palette */
  setPalette: (paletteId: string) => void;
  /** Enable demo mode */
  enableDemo: () => void;
  /** Disable demo mode and reset to tenant theme */
  disableDemo: () => void;
  /** Toggle demo mode on/off */
  toggleDemo: () => void;
}

/**
 * Checks if demo mode should be enabled
 */
function checkDemoMode(): boolean {
  if (typeof window === 'undefined') return false;

  // Check URL param
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('demo') === 'true') return true;

  // Check development mode
  if (process.env.NODE_ENV === 'development') return true;

  // Check stored preference
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const state = JSON.parse(stored) as ThemeDemoState;
      return state.isEnabled;
    } catch {
      // Ignore parsing errors
    }
  }

  return false;
}

/**
 * Gets stored palette ID or default
 */
function getStoredPaletteId(): string {
  if (typeof window === 'undefined') return DEFAULT_PALETTE_ID;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const state = JSON.parse(stored) as ThemeDemoState;
      return state.paletteId || DEFAULT_PALETTE_ID;
    } catch {
      // Ignore parsing errors
    }
  }

  return DEFAULT_PALETTE_ID;
}

export function useThemeDemo(): UseThemeDemoReturn {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [paletteId, setPaletteId] = useState(DEFAULT_PALETTE_ID);

  // Initialize from storage/URL on mount
  useEffect(() => {
    const demoEnabled = checkDemoMode();
    const storedPaletteId = getStoredPaletteId();

    setIsDemoMode(demoEnabled);
    setPaletteId(storedPaletteId);

    // Apply palette if demo mode is enabled
    if (demoEnabled) {
      const palette = getDemoPaletteById(storedPaletteId);
      if (palette) {
        applyDemoPalette(palette);
      }
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const state: ThemeDemoState = {
      isEnabled: isDemoMode,
      paletteId,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [isDemoMode, paletteId]);

  const setPalette = useCallback((newPaletteId: string) => {
    const palette = getDemoPaletteById(newPaletteId);
    if (palette) {
      setPaletteId(newPaletteId);
      if (isDemoMode) {
        applyDemoPalette(palette);
      }
    }
  }, [isDemoMode]);

  const enableDemo = useCallback(() => {
    setIsDemoMode(true);
    const palette = getDemoPaletteById(paletteId);
    if (palette) {
      applyDemoPalette(palette);
    }
  }, [paletteId]);

  const disableDemo = useCallback(() => {
    setIsDemoMode(false);
    // The TenantProvider will re-apply tenant theme on next render
    // or we can trigger a page reload
    if (typeof window !== 'undefined') {
      // Remove demo-specific overrides by resetting to empty
      // The tenant provider will re-apply the correct values
      window.location.reload();
    }
  }, []);

  const toggleDemo = useCallback(() => {
    if (isDemoMode) {
      disableDemo();
    } else {
      enableDemo();
    }
  }, [isDemoMode, enableDemo, disableDemo]);

  const currentPalette = isDemoMode ? getDemoPaletteById(paletteId) || null : null;

  return {
    isDemoMode,
    currentPalette,
    palettes: DEMO_PALETTES,
    setPalette,
    enableDemo,
    disableDemo,
    toggleDemo,
  };
}

export default useThemeDemo;
