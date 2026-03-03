'use client';

/**
 * Primitivos de Gráficos Adaptables
 *
 * Componentes base que comparten todos los gráficos:
 * - ChartContainer: Wrapper con estilos y responsive
 * - ChartTooltip: Tooltip personalizado
 * - ChartLegend: Leyenda personalizada
 * - useChartColors: Hook para colores adaptables
 */

import { ReactNode, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useUISettings } from '@/components/ui/UISettings';

// =============================================================================
// HOOK: useChartColors - Obtiene colores del tema actual
// =============================================================================

export interface ChartColorSet {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string;
  textMuted: string;
  surface: string;
  border: string;
  // Colores para series de datos
  series: string[];
}

export function useChartColors(): ChartColorSet {
  const [colors, setColors] = useState<ChartColorSet>({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#16a34a',
    warning: '#ca8a04',
    error: '#dc2626',
    info: '#0284c7',
    text: '#1e293b',
    textMuted: '#64748b',
    surface: '#ffffff',
    border: '#e2e8f0',
    series: ['#3b82f6', '#8b5cf6', '#16a34a', '#ca8a04', '#dc2626', '#0284c7'],
  });

  useEffect(() => {
    const updateColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      const getColor = (varName: string, fallback: string): string => {
        const value = computedStyle.getPropertyValue(varName).trim();
        return value || fallback;
      };

      setColors({
        primary: getColor('--color-primary', '#3b82f6'),
        secondary: getColor('--color-secondary', '#8b5cf6'),
        success: getColor('--color-success', '#16a34a'),
        warning: getColor('--color-warning', '#ca8a04'),
        error: getColor('--color-error', '#dc2626'),
        info: getColor('--color-info', '#0284c7'),
        text: getColor('--color-text', '#1e293b'),
        textMuted: getColor('--color-text-muted', '#64748b'),
        surface: getColor('--color-surface', '#ffffff'),
        border: getColor('--color-border', '#e2e8f0'),
        series: [
          getColor('--color-primary', '#3b82f6'),
          getColor('--color-secondary', '#8b5cf6'),
          getColor('--color-success', '#16a34a'),
          getColor('--color-warning', '#ca8a04'),
          getColor('--color-error', '#dc2626'),
          getColor('--color-info', '#0284c7'),
        ],
      });
    };

    // Actualizar colores al montar
    updateColors();

    // Observar cambios en el tema
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

// =============================================================================
// ChartContainer - Wrapper para todos los gráficos
// =============================================================================

export interface ChartContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  height?: number | string;
  loading?: boolean;
  error?: string;
  actions?: ReactNode;
}

export function ChartContainer({
  children,
  title,
  subtitle,
  className,
  height = 300,
  loading,
  error,
  actions,
}: ChartContainerProps) {
  const { settings } = useUISettings();

  if (loading) {
    return (
      <div
        className={cn(
          'rounded-2xl p-6',
          'bg-[var(--color-surface,#ffffff)]',
          'border border-[var(--color-border,#e2e8f0)]',
          className
        )}
        style={{ minHeight: typeof height === 'number' ? height : undefined }}
      >
        {title && (
          <div className="mb-4">
            <div className="h-6 w-48 bg-[var(--color-border,#e2e8f0)] rounded animate-pulse" />
            {subtitle && (
              <div className="h-4 w-64 bg-[var(--color-border,#e2e8f0)] rounded animate-pulse mt-2" />
            )}
          </div>
        )}
        <div
          className="flex items-center justify-center"
          style={{ height: typeof height === 'number' ? height - 80 : 200 }}
        >
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-[var(--color-border,#e2e8f0)]" />
            <div className="h-4 w-24 bg-[var(--color-border,#e2e8f0)] rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          'rounded-2xl p-6',
          'bg-[var(--color-surface,#ffffff)]',
          'border border-[var(--color-error-border,#fca5a5)]',
          className
        )}
        style={{ minHeight: typeof height === 'number' ? height : undefined }}
      >
        {title && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text,#1e293b)]">{title}</h3>
          </div>
        )}
        <div
          className="flex items-center justify-center"
          style={{ height: typeof height === 'number' ? height - 80 : 200 }}
        >
          <div className="text-center">
            <div className="text-[var(--color-error,#dc2626)] text-4xl mb-2">!</div>
            <p className="text-[var(--color-text-muted,#64748b)]">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-6',
        'bg-[var(--color-surface,#ffffff)]',
        'border border-[var(--color-border,#e2e8f0)]',
        settings.enableAnimations && 'animate-fade-in',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-[var(--color-text,#1e293b)]">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--color-text-muted,#64748b)] mt-1">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div style={{ height: typeof height === 'number' ? height : undefined }}>{children}</div>
    </div>
  );
}

// =============================================================================
// ChartTooltip - Tooltip personalizado para Recharts
// =============================================================================

export interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey?: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
  labelFormatter?: (label: string) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(label || '') : label;

  return (
    <div
      className={cn(
        'rounded-xl p-3 shadow-lg',
        'bg-[var(--color-surface,#ffffff)]',
        'border border-[var(--color-border,#e2e8f0)]'
      )}
    >
      {formattedLabel && (
        <p className="text-sm font-medium text-[var(--color-text,#1e293b)] mb-2">
          {formattedLabel}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--color-text-muted,#64748b)]">{entry.name}:</span>
            <span className="font-medium text-[var(--color-text,#1e293b)]">
              {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// ChartLegend - Leyenda personalizada para Recharts
// =============================================================================

export interface ChartLegendItem {
  value: string;
  color: string;
  type?: 'line' | 'square' | 'circle';
}

export interface ChartLegendProps {
  payload?: ChartLegendItem[];
  onClick?: (item: ChartLegendItem) => void;
  align?: 'left' | 'center' | 'right';
}

export function ChartLegend({ payload, onClick, align = 'center' }: ChartLegendProps) {
  if (!payload || payload.length === 0) {
    return null;
  }

  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={cn('flex flex-wrap gap-4 mt-4', alignClass[align])}>
      {payload.map((entry, index) => (
        <button
          key={index}
          onClick={() => onClick?.(entry)}
          className={cn(
            'flex items-center gap-2 text-sm',
            'text-[var(--color-text-muted,#64748b)]',
            'hover:text-[var(--color-text,#1e293b)]',
            'transition-colors'
          )}
        >
          <div
            className={cn(
              'w-3 h-3',
              entry.type === 'line' ? 'h-0.5 w-4' : entry.type === 'circle' ? 'rounded-full' : 'rounded-sm'
            )}
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Utilidades
// =============================================================================

export function formatChartValue(value: number, type: 'number' | 'currency' | 'percent' = 'number'): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
      }).format(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString('es-MX');
  }
}
