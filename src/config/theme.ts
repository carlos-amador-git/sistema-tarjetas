/**
 * Configuración de Tema (Theme)
 *
 * Este archivo define los colores y estilos del sistema.
 * Todos los colores se configuran aquí para facilitar la personalización.
 */

import { ThemeConfig } from '@/types';

const THEME: ThemeConfig = {
  // Colores de marca - Personalizar para cada cliente
  brand: {
    primary: '#3b82f6',      // Azul principal
    secondary: '#1e40af',    // Azul oscuro
    accent: '#60a5fa',       // Azul claro para acentos
    gradient: 'linear-gradient(135deg, #3b82f6, #1e40af)',
    shadow: 'rgba(59, 130, 246, 0.3)'
  },

  // Colores de estado - Generalmente no necesitan cambio
  status: {
    success: '#22c55e',
    warning: '#eab308',
    error: '#ef4444',
    info: '#3b82f6'
  },

  // Colores neutros - Para fondos y textos
  neutral: {
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    text: '#1e293b',
    textMuted: '#64748b'
  }
};

/**
 * Genera las CSS variables a partir del tema
 */
export function generateCSSVariables(theme: ThemeConfig = THEME): string {
  return `
    :root {
      /* Brand Colors */
      --brand-primary: ${theme.brand.primary};
      --brand-secondary: ${theme.brand.secondary};
      --brand-accent: ${theme.brand.accent};
      --brand-gradient: ${theme.brand.gradient};
      --brand-shadow: ${theme.brand.shadow};

      /* Status Colors */
      --status-success: ${theme.status.success};
      --status-warning: ${theme.status.warning};
      --status-error: ${theme.status.error};
      --status-info: ${theme.status.info};

      /* Neutral Colors */
      --neutral-background: ${theme.neutral.background};
      --neutral-surface: ${theme.neutral.surface};
      --neutral-border: ${theme.neutral.border};
      --neutral-text: ${theme.neutral.text};
      --neutral-text-muted: ${theme.neutral.textMuted};
    }
  `;
}

/**
 * Configuración para Tailwind CSS
 */
export const tailwindColors = {
  brand: {
    primary: 'var(--brand-primary)',
    secondary: 'var(--brand-secondary)',
    accent: 'var(--brand-accent)',
  },
  status: {
    success: 'var(--status-success)',
    warning: 'var(--status-warning)',
    error: 'var(--status-error)',
    info: 'var(--status-info)',
  },
};

export default THEME;
