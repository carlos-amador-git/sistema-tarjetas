'use client';

/**
 * Componentes Skeleton para Estados de Carga
 *
 * Proporcionan feedback visual durante la carga de datos,
 * mejorando la percepción de rendimiento.
 */

import { cn } from '@/lib/utils';

// =============================================================================
// SKELETON BASE
// =============================================================================

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export function Skeleton({ className, children, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[var(--color-surface-hover,#f1f5f9)]',
        'relative overflow-hidden',
        className
      )}
      style={style}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
}

// =============================================================================
// VARIANTES ESPECÍFICAS
// =============================================================================

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 3,
  className,
  lastLineWidth = '60%',
}: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
}

interface SkeletonCircleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SkeletonCircle({ size = 'md', className }: SkeletonCircleProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton className={cn('rounded-full', sizes[size], className)} />;
}

interface SkeletonImageProps {
  aspectRatio?: 'square' | 'video' | 'wide';
  className?: string;
}

export function SkeletonImage({ aspectRatio = 'video', className }: SkeletonImageProps) {
  const ratios = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
  };

  return <Skeleton className={cn('w-full', ratios[aspectRatio], className)} />;
}

// =============================================================================
// PRESETS PARA COMPONENTES COMUNES
// =============================================================================

interface SkeletonCardProps {
  hasImage?: boolean;
  className?: string;
}

export function SkeletonCard({ hasImage = false, className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] p-4',
        className
      )}
    >
      {hasImage && <SkeletonImage className="mb-4 rounded-xl" />}

      <div className="flex items-start gap-3">
        <SkeletonCircle size="md" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <div className="mt-4">
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

interface SkeletonStatCardProps {
  className?: string;
}

export function SkeletonStatCard({ className }: SkeletonStatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] p-6',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-6 h-6 rounded-lg" />
      </div>

      <Skeleton className="h-8 w-32 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: SkeletonTableProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-[var(--color-border,#e2e8f0)]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${100 / columns}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-4 border-b border-[var(--color-border,#e2e8f0)]"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-5"
              style={{
                width: `${100 / columns}%`,
                opacity: 1 - rowIndex * 0.1,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface SkeletonListProps {
  items?: number;
  hasAvatar?: boolean;
  className?: string;
}

export function SkeletonList({
  items = 5,
  hasAvatar = true,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {hasAvatar && <SkeletonCircle size="md" />}
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// SKELETON PARA DASHBOARD
// =============================================================================

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        {/* Sidebar */}
        <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <SkeletonList items={4} hasAvatar={false} />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SKELETON PARA PÁGINAS ESPECÍFICAS
// =============================================================================

export function SkeletonBalance() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Total Card */}
      <div className="rounded-2xl border-2 border-[var(--color-primary,#3b82f6)]/20 bg-gradient-to-r from-[var(--color-primary,#3b82f6)]/5 to-transparent p-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="w-16 h-16 rounded-2xl" />
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonUsers() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] p-4"
          >
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 max-w-sm rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] overflow-hidden">
        <SkeletonTable rows={6} columns={5} />
      </div>
    </div>
  );
}

// =============================================================================
// ANIMACIÓN SHIMMER (agregar al CSS global si no existe)
// =============================================================================

// Nota: Esta animación ya debería estar en animations.css
// Si no está, agregar:
// @keyframes shimmer {
//   100% { transform: translateX(100%); }
// }

export default Skeleton;
