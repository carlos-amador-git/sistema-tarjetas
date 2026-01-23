/**
 * Paletas de Colores Institucionales para Bancos
 *
 * Sistema de paletas predefinidas basadas en colores típicos
 * de instituciones financieras mexicanas e internacionales.
 *
 * Cada paleta incluye:
 * - Colores primarios, secundarios y de acento
 * - Variantes para fondos y bordes
 * - Colores semánticos (éxito, advertencia, error)
 * - Modos claro y oscuro
 */

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  category: 'banking' | 'fintech' | 'corporate' | 'custom';
  preview: {
    primary: string;
    secondary: string;
    accent: string;
  };
  light: PaletteColors;
  dark: PaletteColors;
}

export interface PaletteColors {
  // Colores de marca
  primary: string;
  primaryHover: string;
  primaryActive: string;
  secondary: string;
  secondaryHover: string;
  accent: string;
  accentHover: string;

  // Gradientes
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;

  // Fondos
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;

  // Sidebar
  sidebarBg: string;
  sidebarText: string;
  sidebarTextMuted: string;
  sidebarActive: string;
  sidebarHover: string;

  // Bordes
  border: string;
  borderHover: string;
  borderFocus: string;

  // Textos
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Estados semánticos
  success: string;
  successBg: string;
  successBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  error: string;
  errorBg: string;
  errorBorder: string;
  info: string;
  infoBg: string;
  infoBorder: string;

  // Sombras
  shadowColor: string;
  shadowColorStrong: string;
}

// =============================================================================
// PALETAS PREDEFINIDAS - INSTITUCIONES FINANCIERAS
// =============================================================================

export const COLOR_PALETTES: ColorPalette[] = [
  // ---------------------------------------------------------------------------
  // AZUL CORPORATIVO (Default - Estilo BBVA/Citibanamex)
  // ---------------------------------------------------------------------------
  {
    id: 'corporate-blue',
    name: 'Azul Corporativo',
    description: 'Estilo clásico bancario, transmite confianza y profesionalismo',
    category: 'banking',
    preview: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
    },
    light: {
      primary: '#1e40af',
      primaryHover: '#1e3a8a',
      primaryActive: '#172554',
      secondary: '#3b82f6',
      secondaryHover: '#2563eb',
      accent: '#60a5fa',
      accentHover: '#3b82f6',
      gradientStart: '#1e40af',
      gradientEnd: '#3b82f6',
      gradientAngle: 135,
      background: '#f8fafc',
      backgroundAlt: '#f1f5f9',
      surface: '#ffffff',
      surfaceHover: '#f8fafc',
      surfaceActive: '#f1f5f9',
      sidebarBg: '#0f172a',
      sidebarText: '#f8fafc',
      sidebarTextMuted: '#94a3b8',
      sidebarActive: '#3b82f6',
      sidebarHover: '#1e293b',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
      borderFocus: '#3b82f6',
      text: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      textInverse: '#ffffff',
      success: '#16a34a',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#ca8a04',
      warningBg: '#fef9c3',
      warningBorder: '#fde047',
      error: '#dc2626',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0284c7',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(30, 64, 175, 0.1)',
      shadowColorStrong: 'rgba(30, 64, 175, 0.25)',
    },
    dark: {
      primary: '#3b82f6',
      primaryHover: '#60a5fa',
      primaryActive: '#2563eb',
      secondary: '#1e40af',
      secondaryHover: '#1e3a8a',
      accent: '#93c5fd',
      accentHover: '#60a5fa',
      gradientStart: '#3b82f6',
      gradientEnd: '#1e40af',
      gradientAngle: 135,
      background: '#0f172a',
      backgroundAlt: '#1e293b',
      surface: '#1e293b',
      surfaceHover: '#334155',
      surfaceActive: '#475569',
      sidebarBg: '#020617',
      sidebarText: '#f8fafc',
      sidebarTextMuted: '#64748b',
      sidebarActive: '#3b82f6',
      sidebarHover: '#0f172a',
      border: '#334155',
      borderHover: '#475569',
      borderFocus: '#3b82f6',
      text: '#f8fafc',
      textSecondary: '#e2e8f0',
      textMuted: '#94a3b8',
      textInverse: '#0f172a',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#eab308',
      warningBg: '#422006',
      warningBorder: '#713f12',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // ---------------------------------------------------------------------------
  // ROJO INSTITUCIONAL (Estilo Santander/HSBC)
  // ---------------------------------------------------------------------------
  {
    id: 'institutional-red',
    name: 'Rojo Institucional',
    description: 'Estilo elegante y distintivo, ideal para bancos con identidad fuerte',
    category: 'banking',
    preview: {
      primary: '#b91c1c',
      secondary: '#dc2626',
      accent: '#f87171',
    },
    light: {
      primary: '#b91c1c',
      primaryHover: '#991b1b',
      primaryActive: '#7f1d1d',
      secondary: '#dc2626',
      secondaryHover: '#b91c1c',
      accent: '#f87171',
      accentHover: '#ef4444',
      gradientStart: '#b91c1c',
      gradientEnd: '#dc2626',
      gradientAngle: 135,
      background: '#fafafa',
      backgroundAlt: '#f5f5f5',
      surface: '#ffffff',
      surfaceHover: '#fafafa',
      surfaceActive: '#f5f5f5',
      sidebarBg: '#1c1917',
      sidebarText: '#fafafa',
      sidebarTextMuted: '#a8a29e',
      sidebarActive: '#dc2626',
      sidebarHover: '#292524',
      border: '#e5e5e5',
      borderHover: '#d4d4d4',
      borderFocus: '#dc2626',
      text: '#171717',
      textSecondary: '#404040',
      textMuted: '#737373',
      textInverse: '#ffffff',
      success: '#15803d',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#a16207',
      warningBg: '#fef9c3',
      warningBorder: '#fde047',
      error: '#b91c1c',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0369a1',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(185, 28, 28, 0.1)',
      shadowColorStrong: 'rgba(185, 28, 28, 0.25)',
    },
    dark: {
      primary: '#ef4444',
      primaryHover: '#f87171',
      primaryActive: '#dc2626',
      secondary: '#b91c1c',
      secondaryHover: '#991b1b',
      accent: '#fca5a5',
      accentHover: '#f87171',
      gradientStart: '#ef4444',
      gradientEnd: '#b91c1c',
      gradientAngle: 135,
      background: '#0a0a0a',
      backgroundAlt: '#171717',
      surface: '#171717',
      surfaceHover: '#262626',
      surfaceActive: '#404040',
      sidebarBg: '#0a0a0a',
      sidebarText: '#fafafa',
      sidebarTextMuted: '#737373',
      sidebarActive: '#ef4444',
      sidebarHover: '#171717',
      border: '#262626',
      borderHover: '#404040',
      borderFocus: '#ef4444',
      text: '#fafafa',
      textSecondary: '#e5e5e5',
      textMuted: '#a3a3a3',
      textInverse: '#0a0a0a',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#eab308',
      warningBg: '#422006',
      warningBorder: '#713f12',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.6)',
    },
  },

  // ---------------------------------------------------------------------------
  // VERDE FINANCIERO (Estilo Banorte/Azteca)
  // ---------------------------------------------------------------------------
  {
    id: 'financial-green',
    name: 'Verde Financiero',
    description: 'Transmite crecimiento, prosperidad y solidez financiera',
    category: 'banking',
    preview: {
      primary: '#047857',
      secondary: '#059669',
      accent: '#34d399',
    },
    light: {
      primary: '#047857',
      primaryHover: '#065f46',
      primaryActive: '#064e3b',
      secondary: '#059669',
      secondaryHover: '#047857',
      accent: '#34d399',
      accentHover: '#10b981',
      gradientStart: '#047857',
      gradientEnd: '#059669',
      gradientAngle: 135,
      background: '#f0fdf4',
      backgroundAlt: '#ecfdf5',
      surface: '#ffffff',
      surfaceHover: '#f0fdf4',
      surfaceActive: '#dcfce7',
      sidebarBg: '#022c22',
      sidebarText: '#f0fdf4',
      sidebarTextMuted: '#6ee7b7',
      sidebarActive: '#10b981',
      sidebarHover: '#064e3b',
      border: '#d1fae5',
      borderHover: '#a7f3d0',
      borderFocus: '#10b981',
      text: '#022c22',
      textSecondary: '#064e3b',
      textMuted: '#047857',
      textInverse: '#ffffff',
      success: '#15803d',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#a16207',
      warningBg: '#fef9c3',
      warningBorder: '#fde047',
      error: '#b91c1c',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0369a1',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(4, 120, 87, 0.1)',
      shadowColorStrong: 'rgba(4, 120, 87, 0.25)',
    },
    dark: {
      primary: '#10b981',
      primaryHover: '#34d399',
      primaryActive: '#059669',
      secondary: '#047857',
      secondaryHover: '#065f46',
      accent: '#6ee7b7',
      accentHover: '#34d399',
      gradientStart: '#10b981',
      gradientEnd: '#047857',
      gradientAngle: 135,
      background: '#022c22',
      backgroundAlt: '#064e3b',
      surface: '#064e3b',
      surfaceHover: '#065f46',
      surfaceActive: '#047857',
      sidebarBg: '#012318',
      sidebarText: '#ecfdf5',
      sidebarTextMuted: '#6ee7b7',
      sidebarActive: '#10b981',
      sidebarHover: '#022c22',
      border: '#065f46',
      borderHover: '#047857',
      borderFocus: '#10b981',
      text: '#ecfdf5',
      textSecondary: '#d1fae5',
      textMuted: '#a7f3d0',
      textInverse: '#022c22',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#eab308',
      warningBg: '#422006',
      warningBorder: '#713f12',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // ---------------------------------------------------------------------------
  // NARANJA DINÁMICO (Estilo ING/BanCoppel)
  // ---------------------------------------------------------------------------
  {
    id: 'dynamic-orange',
    name: 'Naranja Dinámico',
    description: 'Energético y moderno, ideal para fintech y banca digital',
    category: 'fintech',
    preview: {
      primary: '#c2410c',
      secondary: '#ea580c',
      accent: '#fb923c',
    },
    light: {
      primary: '#c2410c',
      primaryHover: '#9a3412',
      primaryActive: '#7c2d12',
      secondary: '#ea580c',
      secondaryHover: '#c2410c',
      accent: '#fb923c',
      accentHover: '#f97316',
      gradientStart: '#c2410c',
      gradientEnd: '#ea580c',
      gradientAngle: 135,
      background: '#fffbeb',
      backgroundAlt: '#fef3c7',
      surface: '#ffffff',
      surfaceHover: '#fffbeb',
      surfaceActive: '#fef3c7',
      sidebarBg: '#1c1917',
      sidebarText: '#fffbeb',
      sidebarTextMuted: '#fdba74',
      sidebarActive: '#f97316',
      sidebarHover: '#292524',
      border: '#fed7aa',
      borderHover: '#fdba74',
      borderFocus: '#f97316',
      text: '#1c1917',
      textSecondary: '#44403c',
      textMuted: '#78716c',
      textInverse: '#ffffff',
      success: '#15803d',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#a16207',
      warningBg: '#fef9c3',
      warningBorder: '#fde047',
      error: '#b91c1c',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0369a1',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(194, 65, 12, 0.1)',
      shadowColorStrong: 'rgba(194, 65, 12, 0.25)',
    },
    dark: {
      primary: '#f97316',
      primaryHover: '#fb923c',
      primaryActive: '#ea580c',
      secondary: '#c2410c',
      secondaryHover: '#9a3412',
      accent: '#fdba74',
      accentHover: '#fb923c',
      gradientStart: '#f97316',
      gradientEnd: '#c2410c',
      gradientAngle: 135,
      background: '#1c1917',
      backgroundAlt: '#292524',
      surface: '#292524',
      surfaceHover: '#44403c',
      surfaceActive: '#57534e',
      sidebarBg: '#0c0a09',
      sidebarText: '#fafaf9',
      sidebarTextMuted: '#a8a29e',
      sidebarActive: '#f97316',
      sidebarHover: '#1c1917',
      border: '#44403c',
      borderHover: '#57534e',
      borderFocus: '#f97316',
      text: '#fafaf9',
      textSecondary: '#e7e5e4',
      textMuted: '#a8a29e',
      textInverse: '#1c1917',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#eab308',
      warningBg: '#422006',
      warningBorder: '#713f12',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.6)',
    },
  },

  // ---------------------------------------------------------------------------
  // PÚRPURA PREMIUM (Estilo Nu Bank/Nubank)
  // ---------------------------------------------------------------------------
  {
    id: 'premium-purple',
    name: 'Púrpura Premium',
    description: 'Sofisticado y disruptivo, perfecto para banca digital innovadora',
    category: 'fintech',
    preview: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
    },
    light: {
      primary: '#7c3aed',
      primaryHover: '#6d28d9',
      primaryActive: '#5b21b6',
      secondary: '#8b5cf6',
      secondaryHover: '#7c3aed',
      accent: '#a78bfa',
      accentHover: '#8b5cf6',
      gradientStart: '#7c3aed',
      gradientEnd: '#8b5cf6',
      gradientAngle: 135,
      background: '#faf5ff',
      backgroundAlt: '#f3e8ff',
      surface: '#ffffff',
      surfaceHover: '#faf5ff',
      surfaceActive: '#f3e8ff',
      sidebarBg: '#1e1b4b',
      sidebarText: '#faf5ff',
      sidebarTextMuted: '#c4b5fd',
      sidebarActive: '#8b5cf6',
      sidebarHover: '#312e81',
      border: '#e9d5ff',
      borderHover: '#d8b4fe',
      borderFocus: '#8b5cf6',
      text: '#1e1b4b',
      textSecondary: '#3730a3',
      textMuted: '#6366f1',
      textInverse: '#ffffff',
      success: '#15803d',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#a16207',
      warningBg: '#fef9c3',
      warningBorder: '#fde047',
      error: '#b91c1c',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0369a1',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(124, 58, 237, 0.1)',
      shadowColorStrong: 'rgba(124, 58, 237, 0.25)',
    },
    dark: {
      primary: '#8b5cf6',
      primaryHover: '#a78bfa',
      primaryActive: '#7c3aed',
      secondary: '#6d28d9',
      secondaryHover: '#5b21b6',
      accent: '#c4b5fd',
      accentHover: '#a78bfa',
      gradientStart: '#8b5cf6',
      gradientEnd: '#6d28d9',
      gradientAngle: 135,
      background: '#0f0d1a',
      backgroundAlt: '#1e1b4b',
      surface: '#1e1b4b',
      surfaceHover: '#312e81',
      surfaceActive: '#3730a3',
      sidebarBg: '#030014',
      sidebarText: '#faf5ff',
      sidebarTextMuted: '#a78bfa',
      sidebarActive: '#8b5cf6',
      sidebarHover: '#1e1b4b',
      border: '#312e81',
      borderHover: '#3730a3',
      borderFocus: '#8b5cf6',
      text: '#faf5ff',
      textSecondary: '#f3e8ff',
      textMuted: '#c4b5fd',
      textInverse: '#0f0d1a',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#eab308',
      warningBg: '#422006',
      warningBorder: '#713f12',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.6)',
    },
  },

  // ---------------------------------------------------------------------------
  // TEAL TECNOLÓGICO (Estilo Albo/Klar)
  // ---------------------------------------------------------------------------
  {
    id: 'tech-teal',
    name: 'Teal Tecnológico',
    description: 'Fresco y tecnológico, transmite innovación y accesibilidad',
    category: 'fintech',
    preview: {
      primary: '#0d9488',
      secondary: '#14b8a6',
      accent: '#5eead4',
    },
    light: {
      primary: '#0d9488',
      primaryHover: '#0f766e',
      primaryActive: '#115e59',
      secondary: '#14b8a6',
      secondaryHover: '#0d9488',
      accent: '#5eead4',
      accentHover: '#2dd4bf',
      gradientStart: '#0d9488',
      gradientEnd: '#14b8a6',
      gradientAngle: 135,
      background: '#f0fdfa',
      backgroundAlt: '#ccfbf1',
      surface: '#ffffff',
      surfaceHover: '#f0fdfa',
      surfaceActive: '#ccfbf1',
      sidebarBg: '#042f2e',
      sidebarText: '#f0fdfa',
      sidebarTextMuted: '#5eead4',
      sidebarActive: '#14b8a6',
      sidebarHover: '#134e4a',
      border: '#99f6e4',
      borderHover: '#5eead4',
      borderFocus: '#14b8a6',
      text: '#042f2e',
      textSecondary: '#134e4a',
      textMuted: '#0f766e',
      textInverse: '#ffffff',
      success: '#15803d',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#a16207',
      warningBg: '#fef9c3',
      warningBorder: '#fde047',
      error: '#b91c1c',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0369a1',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(13, 148, 136, 0.1)',
      shadowColorStrong: 'rgba(13, 148, 136, 0.25)',
    },
    dark: {
      primary: '#14b8a6',
      primaryHover: '#2dd4bf',
      primaryActive: '#0d9488',
      secondary: '#0f766e',
      secondaryHover: '#115e59',
      accent: '#99f6e4',
      accentHover: '#5eead4',
      gradientStart: '#14b8a6',
      gradientEnd: '#0d9488',
      gradientAngle: 135,
      background: '#042f2e',
      backgroundAlt: '#134e4a',
      surface: '#134e4a',
      surfaceHover: '#115e59',
      surfaceActive: '#0f766e',
      sidebarBg: '#021716',
      sidebarText: '#f0fdfa',
      sidebarTextMuted: '#5eead4',
      sidebarActive: '#14b8a6',
      sidebarHover: '#042f2e',
      border: '#115e59',
      borderHover: '#0f766e',
      borderFocus: '#14b8a6',
      text: '#f0fdfa',
      textSecondary: '#ccfbf1',
      textMuted: '#99f6e4',
      textInverse: '#042f2e',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#eab308',
      warningBg: '#422006',
      warningBorder: '#713f12',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
    },
  },

  // ---------------------------------------------------------------------------
  // DORADO EJECUTIVO (Estilo Private Banking)
  // ---------------------------------------------------------------------------
  {
    id: 'executive-gold',
    name: 'Dorado Ejecutivo',
    description: 'Lujo y exclusividad, perfecto para banca privada y premium',
    category: 'corporate',
    preview: {
      primary: '#92400e',
      secondary: '#b45309',
      accent: '#d97706',
    },
    light: {
      primary: '#92400e',
      primaryHover: '#78350f',
      primaryActive: '#451a03',
      secondary: '#b45309',
      secondaryHover: '#92400e',
      accent: '#d97706',
      accentHover: '#b45309',
      gradientStart: '#92400e',
      gradientEnd: '#b45309',
      gradientAngle: 135,
      background: '#fffbeb',
      backgroundAlt: '#fef3c7',
      surface: '#ffffff',
      surfaceHover: '#fffbeb',
      surfaceActive: '#fef3c7',
      sidebarBg: '#1c1917',
      sidebarText: '#fef3c7',
      sidebarTextMuted: '#fcd34d',
      sidebarActive: '#d97706',
      sidebarHover: '#292524',
      border: '#fde68a',
      borderHover: '#fcd34d',
      borderFocus: '#d97706',
      text: '#1c1917',
      textSecondary: '#44403c',
      textMuted: '#78716c',
      textInverse: '#ffffff',
      success: '#15803d',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#92400e',
      warningBg: '#fef3c7',
      warningBorder: '#fcd34d',
      error: '#b91c1c',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0369a1',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(146, 64, 14, 0.1)',
      shadowColorStrong: 'rgba(146, 64, 14, 0.25)',
    },
    dark: {
      primary: '#d97706',
      primaryHover: '#f59e0b',
      primaryActive: '#b45309',
      secondary: '#92400e',
      secondaryHover: '#78350f',
      accent: '#fcd34d',
      accentHover: '#fbbf24',
      gradientStart: '#d97706',
      gradientEnd: '#92400e',
      gradientAngle: 135,
      background: '#1c1917',
      backgroundAlt: '#292524',
      surface: '#292524',
      surfaceHover: '#44403c',
      surfaceActive: '#57534e',
      sidebarBg: '#0c0a09',
      sidebarText: '#fef3c7',
      sidebarTextMuted: '#fcd34d',
      sidebarActive: '#d97706',
      sidebarHover: '#1c1917',
      border: '#44403c',
      borderHover: '#57534e',
      borderFocus: '#d97706',
      text: '#fef3c7',
      textSecondary: '#fde68a',
      textMuted: '#fcd34d',
      textInverse: '#1c1917',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#f59e0b',
      warningBg: '#451a03',
      warningBorder: '#78350f',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.4)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.6)',
    },
  },

  // ---------------------------------------------------------------------------
  // SLATE MODERNO (Estilo Minimalista)
  // ---------------------------------------------------------------------------
  {
    id: 'modern-slate',
    name: 'Slate Moderno',
    description: 'Minimalista y versátil, se adapta a cualquier identidad',
    category: 'corporate',
    preview: {
      primary: '#475569',
      secondary: '#64748b',
      accent: '#94a3b8',
    },
    light: {
      primary: '#475569',
      primaryHover: '#334155',
      primaryActive: '#1e293b',
      secondary: '#64748b',
      secondaryHover: '#475569',
      accent: '#94a3b8',
      accentHover: '#64748b',
      gradientStart: '#475569',
      gradientEnd: '#64748b',
      gradientAngle: 135,
      background: '#f8fafc',
      backgroundAlt: '#f1f5f9',
      surface: '#ffffff',
      surfaceHover: '#f8fafc',
      surfaceActive: '#f1f5f9',
      sidebarBg: '#0f172a',
      sidebarText: '#f8fafc',
      sidebarTextMuted: '#94a3b8',
      sidebarActive: '#64748b',
      sidebarHover: '#1e293b',
      border: '#e2e8f0',
      borderHover: '#cbd5e1',
      borderFocus: '#64748b',
      text: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      textInverse: '#ffffff',
      success: '#16a34a',
      successBg: '#dcfce7',
      successBorder: '#86efac',
      warning: '#ca8a04',
      warningBg: '#fef9c3',
      warningBorder: '#fde047',
      error: '#dc2626',
      errorBg: '#fee2e2',
      errorBorder: '#fca5a5',
      info: '#0284c7',
      infoBg: '#e0f2fe',
      infoBorder: '#7dd3fc',
      shadowColor: 'rgba(71, 85, 105, 0.1)',
      shadowColorStrong: 'rgba(71, 85, 105, 0.25)',
    },
    dark: {
      primary: '#94a3b8',
      primaryHover: '#cbd5e1',
      primaryActive: '#64748b',
      secondary: '#475569',
      secondaryHover: '#334155',
      accent: '#e2e8f0',
      accentHover: '#cbd5e1',
      gradientStart: '#64748b',
      gradientEnd: '#475569',
      gradientAngle: 135,
      background: '#0f172a',
      backgroundAlt: '#1e293b',
      surface: '#1e293b',
      surfaceHover: '#334155',
      surfaceActive: '#475569',
      sidebarBg: '#020617',
      sidebarText: '#f8fafc',
      sidebarTextMuted: '#64748b',
      sidebarActive: '#94a3b8',
      sidebarHover: '#0f172a',
      border: '#334155',
      borderHover: '#475569',
      borderFocus: '#94a3b8',
      text: '#f8fafc',
      textSecondary: '#e2e8f0',
      textMuted: '#94a3b8',
      textInverse: '#0f172a',
      success: '#22c55e',
      successBg: '#14532d',
      successBorder: '#166534',
      warning: '#eab308',
      warningBg: '#422006',
      warningBorder: '#713f12',
      error: '#ef4444',
      errorBg: '#450a0a',
      errorBorder: '#7f1d1d',
      info: '#0ea5e9',
      infoBg: '#082f49',
      infoBorder: '#0c4a6e',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowColorStrong: 'rgba(0, 0, 0, 0.5)',
    },
  },
];

// =============================================================================
// FUNCIONES AUXILIARES
// =============================================================================

/**
 * Obtiene una paleta por su ID
 */
export function getPaletteById(id: string): ColorPalette | undefined {
  return COLOR_PALETTES.find(p => p.id === id);
}

/**
 * Obtiene paletas por categoría
 */
export function getPalettesByCategory(category: ColorPalette['category']): ColorPalette[] {
  return COLOR_PALETTES.filter(p => p.category === category);
}

/**
 * Genera CSS variables desde una paleta
 */
export function generatePaletteCSSVariables(
  palette: ColorPalette,
  mode: 'light' | 'dark' = 'light'
): Record<string, string> {
  const colors = mode === 'light' ? palette.light : palette.dark;

  return {
    '--color-primary': colors.primary,
    '--color-primary-hover': colors.primaryHover,
    '--color-primary-active': colors.primaryActive,
    '--color-secondary': colors.secondary,
    '--color-secondary-hover': colors.secondaryHover,
    '--color-accent': colors.accent,
    '--color-accent-hover': colors.accentHover,
    '--gradient-start': colors.gradientStart,
    '--gradient-end': colors.gradientEnd,
    '--gradient-angle': `${colors.gradientAngle}deg`,
    '--color-background': colors.background,
    '--color-background-alt': colors.backgroundAlt,
    '--color-surface': colors.surface,
    '--color-surface-hover': colors.surfaceHover,
    '--color-surface-active': colors.surfaceActive,
    '--color-sidebar-bg': colors.sidebarBg,
    '--color-sidebar-text': colors.sidebarText,
    '--color-sidebar-text-muted': colors.sidebarTextMuted,
    '--color-sidebar-active': colors.sidebarActive,
    '--color-sidebar-hover': colors.sidebarHover,
    '--color-border': colors.border,
    '--color-border-hover': colors.borderHover,
    '--color-border-focus': colors.borderFocus,
    '--color-text': colors.text,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-muted': colors.textMuted,
    '--color-text-inverse': colors.textInverse,
    '--color-success': colors.success,
    '--color-success-bg': colors.successBg,
    '--color-success-border': colors.successBorder,
    '--color-warning': colors.warning,
    '--color-warning-bg': colors.warningBg,
    '--color-warning-border': colors.warningBorder,
    '--color-error': colors.error,
    '--color-error-bg': colors.errorBg,
    '--color-error-border': colors.errorBorder,
    '--color-info': colors.info,
    '--color-info-bg': colors.infoBg,
    '--color-info-border': colors.infoBorder,
    '--shadow-color': colors.shadowColor,
    '--shadow-color-strong': colors.shadowColorStrong,
  };
}

/**
 * Convierte paleta a formato de tenant theme
 */
export function paletteToTenantTheme(
  palette: ColorPalette,
  mode: 'light' | 'dark' = 'light'
) {
  const colors = mode === 'light' ? palette.light : palette.dark;

  return {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: colors.background,
    sidebar: colors.sidebarBg,
  };
}

// =============================================================================
// PALETAS SIMPLIFICADAS PARA DEMOS
// =============================================================================

/**
 * Paletas simplificadas para demos con clientes.
 * Cada paleta contiene solo los colores esenciales para un cambio rápido de look.
 */
export interface DemoPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  sidebar: string;
  background: string;
}

export const DEMO_PALETTES: DemoPalette[] = [
  // -------------------------------------------------------------------------
  // CardSystem (Default) - Azul corporativo confiable
  // -------------------------------------------------------------------------
  {
    id: 'default',
    name: 'CardSystem',
    primary: '#3b82f6',    // blue-500 - botones, links, iconos
    secondary: '#1e40af',  // blue-800 - hover states, acentos fuertes
    accent: '#60a5fa',     // blue-400 - highlights, badges
    sidebar: '#1e293b',    // slate-800 - fondo sidebar
    background: '#f8fafc', // slate-50 - fondo general
  },
  // -------------------------------------------------------------------------
  // Rojo Bancario - Estilo Scotiabank/HSBC/Santander
  // -------------------------------------------------------------------------
  {
    id: 'rojo-bancario',
    name: 'Rojo Bancario',
    primary: '#dc2626',    // red-600 - rojo institucional
    secondary: '#991b1b',  // red-800 - rojo oscuro para contraste
    accent: '#fca5a5',     // red-300 - rojo suave para highlights
    sidebar: '#1c1917',    // stone-900 - sidebar elegante oscuro
    background: '#fafafa', // neutral-50 - fondo limpio
  },
  // -------------------------------------------------------------------------
  // Verde Bosque - Estilo IXE Banco / Banorte antiguo
  // -------------------------------------------------------------------------
  {
    id: 'verde-bosque',
    name: 'Verde Bosque',
    primary: '#166534',    // green-800 - verde institucional profundo
    secondary: '#14532d',  // green-900 - verde muy oscuro
    accent: '#86efac',     // green-300 - verde claro para acentos
    sidebar: '#052e16',    // green-950 - sidebar verde muy oscuro
    background: '#f0fdf4', // green-50 - fondo con tinte verde sutil
  },
  // -------------------------------------------------------------------------
  // Verde Fresco - Estilo Falabella / Starbucks
  // -------------------------------------------------------------------------
  {
    id: 'verde-fresco',
    name: 'Verde Fresco',
    primary: '#16a34a',    // green-600 - verde vibrante
    secondary: '#15803d',  // green-700 - verde medio
    accent: '#4ade80',     // green-400 - verde brillante
    sidebar: '#14532d',    // green-900 - sidebar verde oscuro
    background: '#f7fef9', // verde muy pálido personalizado
  },
  // -------------------------------------------------------------------------
  // Púrpura Premium - Estilo NuBank / Fintech moderno
  // -------------------------------------------------------------------------
  {
    id: 'purpura-premium',
    name: 'Púrpura Premium',
    primary: '#7c3aed',    // violet-600 - púrpura distintivo
    secondary: '#5b21b6',  // violet-800 - púrpura profundo
    accent: '#c4b5fd',     // violet-300 - lavanda suave
    sidebar: '#2e1065',    // violet-950 - sidebar púrpura oscuro
    background: '#faf5ff', // violet-50 - fondo con tinte púrpura
  },
  // -------------------------------------------------------------------------
  // Naranja Dinámico - Estilo ING / BanCoppel
  // -------------------------------------------------------------------------
  {
    id: 'naranja-dinamico',
    name: 'Naranja Dinámico',
    primary: '#ea580c',    // orange-600 - naranja energético
    secondary: '#c2410c',  // orange-700 - naranja intenso
    accent: '#fdba74',     // orange-300 - durazno suave
    sidebar: '#431407',    // orange-950 - sidebar café oscuro
    background: '#fff7ed', // orange-50 - fondo cálido
  },
];

/**
 * Obtiene una paleta demo por su ID
 */
export function getDemoPaletteById(id: string): DemoPalette | undefined {
  return DEMO_PALETTES.find(p => p.id === id);
}

/**
 * Aplica una paleta demo como CSS variables
 * Actualiza TODAS las variables necesarias para cambio completo de tema
 */
export function applyDemoPalette(palette: DemoPalette) {
  const root = document.documentElement;

  // Variables principales de color
  root.style.setProperty('--color-primary', palette.primary);
  root.style.setProperty('--color-secondary', palette.secondary);
  root.style.setProperty('--color-accent', palette.accent);
  root.style.setProperty('--color-sidebar', palette.sidebar);
  root.style.setProperty('--color-sidebar-bg', palette.sidebar);
  root.style.setProperty('--color-background', palette.background);

  // Variables de marca (para componentes que usan --brand-*)
  root.style.setProperty('--brand-primary', palette.primary);
  root.style.setProperty('--brand-secondary', palette.secondary);
  root.style.setProperty('--brand-accent', palette.accent);
  root.style.setProperty('--brand-gradient', `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`);
  root.style.setProperty('--brand-shadow', `${palette.primary}4D`); // 30% opacity

  // Variables de sidebar
  root.style.setProperty('--sidebar-background', palette.sidebar);
  root.style.setProperty('--sidebar-active', palette.primary);

  // Variable de fondo general
  root.style.setProperty('--neutral-background', palette.background);
}

export default COLOR_PALETTES;
