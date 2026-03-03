'use client';

/**
 * Componente EmptyState
 *
 * Muestra un estado vacío con ilustración, mensaje y acción opcional.
 * Usado cuando no hay datos que mostrar en una lista o tabla.
 */

import { ReactNode } from 'react';
import {
  Package,
  Users,
  ShoppingCart,
  FileText,
  Search,
  AlertCircle,
  Inbox,
  Database,
  FolderOpen,
  Clock,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TIPOS
// =============================================================================

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'w-12 h-12',
      iconInner: 'h-6 w-6',
      title: 'text-base',
      description: 'text-sm',
      button: 'px-3 py-1.5 text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      iconInner: 'h-8 w-8',
      title: 'text-lg',
      description: 'text-sm',
      button: 'px-4 py-2 text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      iconInner: 'h-10 w-10',
      title: 'text-xl',
      description: 'text-base',
      button: 'px-5 py-2.5 text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      {/* Icono con fondo decorativo */}
      <div className="relative mb-4">
        <div
          className={cn(
            'rounded-full bg-[var(--color-surface-hover,#f1f5f9)]',
            'flex items-center justify-center',
            sizes.icon
          )}
        >
          <div className="text-[var(--color-text-muted,#64748b)]">
            {icon || <Inbox className={sizes.iconInner} />}
          </div>
        </div>
        {/* Decorative rings */}
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'border-2 border-dashed border-[var(--color-border,#e2e8f0)]',
            'animate-[spin_20s_linear_infinite] opacity-30'
          )}
          style={{ transform: 'scale(1.3)' }}
        />
      </div>

      {/* Título */}
      <h3
        className={cn(
          'font-semibold text-[var(--color-text,#1e293b)]',
          sizes.title
        )}
      >
        {title}
      </h3>

      {/* Descripción */}
      {description && (
        <p
          className={cn(
            'mt-2 text-[var(--color-text-muted,#64748b)] max-w-sm',
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Acciones */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                'rounded-xl font-medium transition-all duration-200',
                sizes.button,
                action.variant === 'secondary'
                  ? 'bg-[var(--color-surface-hover,#f1f5f9)] text-[var(--color-text,#1e293b)] hover:bg-[var(--color-surface-active,#e2e8f0)]'
                  : 'bg-[var(--color-primary,#3b82f6)] text-white hover:opacity-90 shadow-lg shadow-[var(--color-primary,#3b82f6)]/25'
              )}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={cn(
                'rounded-xl font-medium transition-colors',
                'text-[var(--color-text-muted,#64748b)] hover:text-[var(--color-text,#1e293b)]',
                sizes.button
              )}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PRESETS PARA CASOS COMUNES
// =============================================================================

interface PresetProps {
  action?: EmptyStateProps['action'];
  className?: string;
}

export function EmptyStateNoResults({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<Search className="h-8 w-8" />}
      title="Sin resultados"
      description="No se encontraron elementos que coincidan con tu búsqueda. Intenta con otros términos."
      action={action || {
        label: 'Limpiar búsqueda',
        onClick: () => {},
        variant: 'secondary',
      }}
      className={className}
    />
  );
}

export function EmptyStateNoData({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<Database className="h-8 w-8" />}
      title="Sin datos"
      description="Aún no hay información disponible en esta sección."
      action={action}
      className={className}
    />
  );
}

export function EmptyStateNoUsers({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<Users className="h-8 w-8" />}
      title="Sin usuarios"
      description="No hay usuarios registrados en el sistema. Agrega el primer usuario para comenzar."
      action={action || {
        label: 'Agregar usuario',
        onClick: () => {},
      }}
      className={className}
    />
  );
}

export function EmptyStateNoProducts({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<Package className="h-8 w-8" />}
      title="Sin productos"
      description="No hay productos en el catálogo. Agrega productos para gestionar el inventario."
      action={action || {
        label: 'Agregar producto',
        onClick: () => {},
      }}
      className={className}
    />
  );
}

export function EmptyStateNoOrders({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-8 w-8" />}
      title="Sin órdenes"
      description="No hay órdenes de compra registradas. Crea una nueva orden cuando lo necesites."
      action={action || {
        label: 'Nueva orden',
        onClick: () => {},
      }}
      className={className}
    />
  );
}

export function EmptyStateNoHistory({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<Clock className="h-8 w-8" />}
      title="Sin historial"
      description="No hay movimientos registrados en el período seleccionado."
      action={action || {
        label: 'Cambiar filtros',
        onClick: () => {},
        variant: 'secondary',
      }}
      className={className}
    />
  );
}

export function EmptyStateNoFiles({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-8 w-8" />}
      title="Sin archivos"
      description="No hay archivos en esta ubicación."
      action={action}
      className={className}
    />
  );
}

export function EmptyStateFiltered({ action, className }: PresetProps) {
  return (
    <EmptyState
      icon={<Filter className="h-8 w-8" />}
      title="Sin coincidencias"
      description="Los filtros aplicados no devolvieron resultados. Prueba ajustando los criterios."
      action={action || {
        label: 'Limpiar filtros',
        onClick: () => {},
        variant: 'secondary',
      }}
      className={className}
    />
  );
}

export function EmptyStateError({
  action,
  className,
  message,
}: PresetProps & { message?: string }) {
  return (
    <EmptyState
      icon={<AlertCircle className="h-8 w-8 text-[var(--color-error,#ef4444)]" />}
      title="Error al cargar"
      description={message || 'Ocurrió un error al cargar los datos. Por favor, intenta de nuevo.'}
      action={action || {
        label: 'Reintentar',
        onClick: () => window.location.reload(),
      }}
      className={className}
    />
  );
}

// =============================================================================
// COMPONENTE WRAPPER PARA LISTAS
// =============================================================================

interface EmptyStateWrapperProps {
  isEmpty: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyState: ReactNode;
  loadingState?: ReactNode;
  children: ReactNode;
}

export function EmptyStateWrapper({
  isEmpty,
  isLoading,
  isError,
  errorMessage,
  emptyState,
  loadingState,
  children,
}: EmptyStateWrapperProps) {
  if (isLoading && loadingState) {
    return <>{loadingState}</>;
  }

  if (isError) {
    return <EmptyStateError message={errorMessage} />;
  }

  if (isEmpty) {
    return <>{emptyState}</>;
  }

  return <>{children}</>;
}

export default EmptyState;
