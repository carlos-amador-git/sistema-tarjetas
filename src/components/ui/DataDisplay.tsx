'use client';

/**
 * Componentes de Visualización de Datos Adaptables
 *
 * Sistema de componentes que permiten mostrar información en:
 * - Modo Tarjetas (cards)
 * - Modo Lista (list)
 * - Modo Compacto (compact)
 *
 * Con animaciones, interacciones novedosas y soporte para temas.
 */

import { ReactNode, useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useUISettings, ViewMode } from './UISettings';

// =============================================================================
// STAT CARD - Tarjeta de Estadísticas con Múltiples Visualizaciones
// =============================================================================

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  actions?: { label: string; onClick: () => void }[];
  sparkline?: number[];
  progress?: {
    value: number;
    max: number;
    label?: string;
  };
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  size = 'md',
  onClick,
  actions,
  sparkline,
  progress,
  badge,
  className,
  href,
}: StatCardProps) {
  const { settings } = useUISettings();
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const colorClasses = {
    primary: {
      bg: 'bg-[var(--color-primary)]/10',
      text: 'text-[var(--color-primary)]',
      border: 'border-[var(--color-primary)]/20',
      gradient: 'from-[var(--color-primary)] to-[var(--color-secondary)]',
    },
    success: {
      bg: 'bg-[var(--color-success-bg)]',
      text: 'text-[var(--color-success)]',
      border: 'border-[var(--color-success-border)]',
      gradient: 'from-emerald-500 to-green-600',
    },
    warning: {
      bg: 'bg-[var(--color-warning-bg)]',
      text: 'text-[var(--color-warning)]',
      border: 'border-[var(--color-warning-border)]',
      gradient: 'from-amber-500 to-orange-600',
    },
    error: {
      bg: 'bg-[var(--color-error-bg)]',
      text: 'text-[var(--color-error)]',
      border: 'border-[var(--color-error-border)]',
      gradient: 'from-red-500 to-rose-600',
    },
    info: {
      bg: 'bg-[var(--color-info-bg)]',
      text: 'text-[var(--color-info)]',
      border: 'border-[var(--color-info-border)]',
      gradient: 'from-blue-500 to-cyan-600',
    },
    neutral: {
      bg: 'bg-[var(--color-surface-hover)]',
      text: 'text-[var(--color-text-secondary)]',
      border: 'border-[var(--color-border)]',
      gradient: 'from-slate-500 to-slate-600',
    },
  };

  const sizeClasses = {
    sm: {
      padding: 'p-3',
      title: 'text-xs',
      value: 'text-xl',
      icon: 'w-8 h-8',
    },
    md: {
      padding: 'p-4',
      title: 'text-sm',
      value: 'text-2xl',
      icon: 'w-10 h-10',
    },
    lg: {
      padding: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      icon: 'w-12 h-12',
    },
  };

  const colors = colorClasses[color];
  const sizes = sizeClasses[size];

  // Renderizado según el modo de vista
  if (settings.viewMode === 'list') {
    return (
      <div
        className={cn(
          'flex items-center gap-4 p-3 rounded-lg',
          'bg-[var(--color-surface)] border border-[var(--color-border)]',
          'hover:border-[var(--color-border-hover)] hover:shadow-sm',
          'transition-all duration-200',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {icon && (
          <div className={cn('flex-shrink-0 p-2 rounded-lg', colors.bg, colors.text)}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-text-muted)] truncate">{title}</p>
          <p className="text-lg font-bold text-[var(--color-text)]">{value}</p>
        </div>
        {trend && (
          <TrendIndicator value={trend.value} size="sm" />
        )}
        {badge && (
          <StatusBadge text={badge.text} variant={badge.variant} size="sm" />
        )}
        {onClick && (
          <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
        )}
      </div>
    );
  }

  if (settings.viewMode === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-2 rounded-md',
          'hover:bg-[var(--color-surface-hover)]',
          'transition-colors duration-150',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <span className={cn('text-sm', colors.text)}>{icon}</span>
          )}
          <span className="text-sm text-[var(--color-text-muted)]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--color-text)]">{value}</span>
          {trend && <TrendIndicator value={trend.value} size="xs" />}
        </div>
      </div>
    );
  }

  // Modo tarjetas (default)
  const CardContent = (
    <>
      {/* Gradient accent line */}
      {settings.enableGradients && (
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-1 bg-gradient-to-r',
            colors.gradient,
            'opacity-0 transition-opacity duration-300',
            isHovered && 'opacity-100'
          )}
        />
      )}

      <div className={sizes.padding}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={cn(
                  'flex items-center justify-center rounded-xl',
                  sizes.icon,
                  settings.enableGradients
                    ? cn('bg-gradient-to-br', colors.gradient, 'text-white')
                    : cn(colors.bg, colors.text)
                )}
              >
                {icon}
              </div>
            )}
            <div>
              <h3 className={cn(sizes.title, 'font-medium text-[var(--color-text-muted)]')}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Actions menu */}
          {actions && actions.length > 0 && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault(); // Prevent link navigation if inside Link
                  setShowActions(!showActions);
                }}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  'hover:bg-[var(--color-surface-hover)]',
                  showActions && 'bg-[var(--color-surface-hover)]'
                )}
              >
                <MoreHorizontal className="h-4 w-4 text-[var(--color-text-muted)]" />
              </button>

              {showActions && (
                <div className="absolute right-0 top-full mt-1 z-10 min-w-[120px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-lg py-1">
                  {actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        action.onClick();
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {badge && !actions && (
            <StatusBadge text={badge.text} variant={badge.variant} />
          )}
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <div>
            <p className={cn(sizes.value, 'font-bold text-[var(--color-text)]')}>
              {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
            </p>
            {trend && (
              <div className="flex items-center gap-2 mt-1">
                <TrendIndicator value={trend.value} />
                {trend.label && (
                  <span className="text-xs text-[var(--color-text-muted)]">{trend.label}</span>
                )}
              </div>
            )}
          </div>

          {/* Mini sparkline */}
          {sparkline && sparkline.length > 0 && (
            <MiniSparkline data={sparkline} color={color} />
          )}
        </div>

        {/* Progress bar */}
        {progress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
              <span>{progress.label || 'Progreso'}</span>
              <span>{Math.round((progress.value / progress.max) * 100)}%</span>
            </div>
            <div className="h-2 bg-[var(--color-surface-hover)] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  settings.enableGradients
                    ? cn('bg-gradient-to-r', colors.gradient)
                    : colors.bg.replace('/10', '')
                )}
                style={{ width: `${(progress.value / progress.max) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );

  const commonClasses = cn(
    'relative rounded-2xl overflow-hidden block text-left w-full',
    'bg-[var(--color-surface)] border border-[var(--color-border)]',
    'transition-all duration-300',
    settings.enableAnimations && 'hover:scale-[1.02]',
    isHovered && 'shadow-lg border-[var(--color-border-hover)]',
    (onClick || href) && 'cursor-pointer',
    className
  );

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowActions(false);
  };

  if (href) {
    return (
      <Link
        href={href}
        className={commonClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {CardContent}
      </Link>
    );
  }

  return (
    <div
      className={commonClasses}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {CardContent}
    </div>
  );
}

// =============================================================================
// DATA TABLE - Tabla de Datos con Múltiples Visualizaciones
// =============================================================================

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  selectable?: boolean;
  selectedRows?: Set<unknown>;
  onSelectionChange?: (selected: Set<unknown>) => void;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  loading,
  striped = true,
  hoverable = true,
  selectable,
  selectedRows,
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  const { settings } = useUISettings();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const aVal = a[sortConfig.key as keyof T];
    const bVal = b[sortConfig.key as keyof T];
    const modifier = sortConfig.direction === 'asc' ? 1 : -1;
    if (aVal < bVal) return -1 * modifier;
    if (aVal > bVal) return 1 * modifier;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc'
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleRowSelection = (id: unknown) => {
    if (!selectable || !onSelectionChange) return;
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onSelectionChange(newSelected);
  };

  if (settings.viewMode === 'cards') {
    return (
      <div className={cn('grid gap-4', 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {sortedData.map((row, index) => (
          <DataCard
            key={String(row[keyField])}
            data={row}
            columns={columns}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            selectable={selectable}
            selected={selectedRows?.has(row[keyField])}
            onToggleSelect={() => toggleRowSelection(row[keyField])}
            index={index}
          />
        ))}
        {sortedData.length === 0 && !loading && (
          <div className="col-span-full p-8 text-center text-[var(--color-text-muted)]">
            {emptyMessage}
          </div>
        )}
      </div>
    );
  }

  // List/Compact mode - Traditional table
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            {selectable && (
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedRows?.size === data.length && data.length > 0}
                  onChange={() => {
                    if (selectedRows?.size === data.length) {
                      onSelectionChange?.(new Set());
                    } else {
                      onSelectionChange?.(new Set(data.map(r => r[keyField])));
                    }
                  }}
                  className="rounded border-[var(--color-border)]"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={cn(
                  'p-3 text-xs font-semibold uppercase tracking-wider',
                  'text-[var(--color-text-muted)]',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right',
                  col.sortable && 'cursor-pointer hover:text-[var(--color-text)] select-none'
                )}
                style={{ width: col.width }}
                onClick={() => col.sortable && handleSort(String(col.key))}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortConfig?.key === col.key && (
                    <span className="text-[var(--color-primary)]">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="p-8 text-center">
                <div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
                  <div className="w-5 h-5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                  Cargando...
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="p-8 text-center text-[var(--color-text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={String(row[keyField])}
                className={cn(
                  'transition-colors',
                  striped && index % 2 === 1 && 'bg-[var(--color-surface-hover)]/50',
                  hoverable && 'hover:bg-[var(--color-surface-hover)]',
                  onRowClick && 'cursor-pointer',
                  selectedRows?.has(row[keyField]) && 'bg-[var(--color-primary)]/5'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {selectable && (
                  <td className="p-3 w-10" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows?.has(row[keyField])}
                      onChange={() => toggleRowSelection(row[keyField])}
                      className="rounded border-[var(--color-border)]"
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className={cn(
                      settings.viewMode === 'compact' ? 'p-2 text-sm' : 'p-3',
                      'text-[var(--color-text)]',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render
                      ? col.render(row[col.key as keyof T], row, index)
                      : String(row[col.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// DATA CARD - Tarjeta para visualización de filas en modo cards
// =============================================================================

interface DataCardProps<T> {
  data: T;
  columns: Column<T>[];
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  index: number;
}

function DataCard<T extends Record<string, unknown>>({
  data,
  columns,
  onClick,
  selectable,
  selected,
  onToggleSelect,
  index,
}: DataCardProps<T>) {
  const { settings } = useUISettings();
  const [isHovered, setIsHovered] = useState(false);

  // Tomar las primeras 2 columnas como destacadas
  const [primary, secondary, ...rest] = columns;

  return (
    <div
      className={cn(
        'rounded-xl p-4',
        'bg-[var(--color-surface)] border border-[var(--color-border)]',
        'transition-all duration-200',
        settings.enableAnimations && 'hover:scale-[1.01]',
        isHovered && 'shadow-md border-[var(--color-border-hover)]',
        onClick && 'cursor-pointer',
        selected && 'ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        animationDelay: settings.enableAnimations ? `${index * 50}ms` : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {primary && (
            <p className="font-semibold text-[var(--color-text)] truncate">
              {primary.render
                ? primary.render(data[primary.key as keyof T], data, index)
                : String(data[primary.key as keyof T] ?? '-')}
            </p>
          )}
          {secondary && (
            <p className="text-sm text-[var(--color-text-muted)] truncate mt-0.5">
              {secondary.render
                ? secondary.render(data[secondary.key as keyof T], data, index)
                : String(data[secondary.key as keyof T] ?? '-')}
            </p>
          )}
        </div>
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            onClick={e => e.stopPropagation()}
            className="rounded border-[var(--color-border)] ml-2"
          />
        )}
      </div>

      {/* Details */}
      {rest.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[var(--color-border)]">
          {rest.map(col => (
            <div key={String(col.key)} className="flex justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">{col.header}</span>
              <span className="text-[var(--color-text)] font-medium">
                {col.render
                  ? col.render(data[col.key as keyof T], data, index)
                  : String(data[col.key as keyof T] ?? '-')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

interface TrendIndicatorProps {
  value: number;
  size?: 'xs' | 'sm' | 'md';
}

export function TrendIndicator({ value, size = 'sm' }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;

  const sizeClasses = {
    xs: 'text-xs gap-0.5',
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
  };

  const iconSize = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  return (
    <div
      className={cn(
        'flex items-center font-medium',
        sizeClasses[size],
        isPositive && 'text-[var(--color-success)]',
        !isPositive && !isNeutral && 'text-[var(--color-error)]',
        isNeutral && 'text-[var(--color-text-muted)]'
      )}
    >
      {isPositive ? (
        <TrendingUp className={iconSize[size]} />
      ) : isNeutral ? (
        <Minus className={iconSize[size]} />
      ) : (
        <TrendingDown className={iconSize[size]} />
      )}
      <span>{isPositive ? '+' : ''}{value}%</span>
    </div>
  );
}

interface StatusBadgeProps {
  text: string;
  variant: 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function StatusBadge({ text, variant, size = 'md', dot = true }: StatusBadgeProps) {
  const variants = {
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-[var(--color-success-border)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border-[var(--color-warning-border)]',
    error: 'bg-[var(--color-error-bg)] text-[var(--color-error)] border-[var(--color-error-border)]',
    info: 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-[var(--color-info-border)]',
  };

  const dotColors = {
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    error: 'bg-[var(--color-error)]',
    info: 'bg-[var(--color-info)]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border',
        variants[variant],
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {text}
    </span>
  );
}

interface MiniSparklineProps {
  data: number[];
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  width?: number;
  height?: number;
}

export function MiniSparkline({
  data,
  color = 'primary',
  width = 60,
  height = 24,
}: MiniSparklineProps) {
  const { settings } = useUISettings();

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const strokeColor = `var(--color-${color === 'primary' ? 'primary' : color})`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={settings.enableAnimations ? 'animate-draw' : ''}
      />
      {/* Dot at end */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={strokeColor}
        className={settings.enableAnimations ? 'animate-pulse' : ''}
      />
    </svg>
  );
}

// =============================================================================
// INFO TOOLTIP
// =============================================================================

interface InfoTooltipProps {
  content: string;
  children?: ReactNode;
}

export function InfoTooltip({ content, children }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-flex">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="p-1 rounded-full hover:bg-[var(--color-surface-hover)] transition-colors"
      >
        {children || <Info className="h-4 w-4 text-[var(--color-text-muted)]" />}
      </button>
      {isVisible && (
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
            'px-3 py-2 rounded-lg text-sm',
            'bg-[var(--color-text)] text-[var(--color-text-inverse)]',
            'shadow-lg z-50 max-w-xs',
            'animate-in fade-in slide-in-from-bottom-2 duration-200'
          )}
        >
          {content}
          <div
            className={cn(
              'absolute top-full left-1/2 -translate-x-1/2 -mt-1',
              'border-4 border-transparent border-t-[var(--color-text)]'
            )}
          />
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COPY BUTTON
// =============================================================================

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'p-1.5 rounded-lg transition-all',
        'hover:bg-[var(--color-surface-hover)]',
        copied && 'text-[var(--color-success)]',
        className
      )}
      title={copied ? 'Copiado!' : 'Copiar'}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4 text-[var(--color-text-muted)]" />
      )}
    </button>
  );
}

export default StatCard;
