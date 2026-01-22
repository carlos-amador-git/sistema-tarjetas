'use client';

/**
 * Historial de Movimientos
 *
 * Registro de entradas, salidas y ajustes de inventario.
 * Usa los nuevos componentes adaptables que respetan la configuración de UI.
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  Clock,
  User,
  FileSpreadsheet,
  FileText,
  ChevronDown,
  Activity,
  Grid,
  List,
} from 'lucide-react';
import { MODULE_TITLES } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { useExport } from '@/hooks/useExport';
import { useHistorial } from '@/stores/inventoryStore';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/ui/DataDisplay';
import { useUISettings } from '@/components/ui/UISettings';
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyStateNoHistory, EmptyStateNoResults } from '@/components/ui/EmptyState';

// =============================================================================
// CONSTANTES
// =============================================================================

// Columnas para exportación
const EXPORT_COLUMNS = [
  { header: 'Fecha', key: 'fecha', width: 20 },
  { header: 'Tipo', key: 'tipo', width: 12 },
  { header: 'Producto', key: 'producto', width: 25 },
  { header: 'Código', key: 'productoId', width: 12 },
  { header: 'Cantidad', key: 'cantidad', width: 12 },
  { header: 'Usuario', key: 'usuario', width: 15 },
  { header: 'Área', key: 'area', width: 18 },
  { header: 'Documento', key: 'documento', width: 15 },
  { header: 'Observación', key: 'observacion', width: 30 },
];

// =============================================================================
// COMPONENTES INTERNOS
// =============================================================================

interface HistorialItem {
  id: number;
  fecha: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  producto: string;
  productoId: string;
  cantidad: number;
  usuario: string;
  area: string;
  documento: string;
  observacion: string;
}

interface HistorialRowProps {
  item: HistorialItem;
}

function HistorialRow({ item }: HistorialRowProps) {
  const { settings } = useUISettings();

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA':
        return {
          bg: 'bg-[var(--color-success-bg,#dcfce7)]',
          text: 'text-[var(--color-success,#16a34a)]',
          border: 'border-[var(--color-success-border,#86efac)]',
          icon: ArrowDownLeft,
          sign: '+',
          color: 'text-[var(--color-success,#16a34a)]',
        };
      case 'SALIDA':
        return {
          bg: 'bg-[var(--color-error-bg,#fee2e2)]',
          text: 'text-[var(--color-error,#dc2626)]',
          border: 'border-[var(--color-error-border,#fca5a5)]',
          icon: ArrowUpRight,
          sign: '-',
          color: 'text-[var(--color-error,#dc2626)]',
        };
      case 'AJUSTE':
        return {
          bg: 'bg-[var(--color-warning-bg,#fef9c3)]',
          text: 'text-[var(--color-warning,#ca8a04)]',
          border: 'border-[var(--color-warning-border,#fde047)]',
          icon: Package,
          sign: '',
          color: 'text-[var(--color-warning,#ca8a04)]',
        };
      default:
        return {
          bg: 'bg-[var(--color-info-bg,#e0f2fe)]',
          text: 'text-[var(--color-info,#0284c7)]',
          border: 'border-[var(--color-info-border,#7dd3fc)]',
          icon: Package,
          sign: '',
          color: 'text-[var(--color-text-muted,#64748b)]',
        };
    }
  };

  const tipoConfig = getTipoConfig(item.tipo);
  const TipoIcon = tipoConfig.icon;

  return (
    <tr
      className={cn(
        'transition-colors',
        'hover:bg-[var(--color-surface-hover,#f8fafc)]',
        settings.enableAnimations && 'animate-fade-in'
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-sm text-[var(--color-text-muted,#64748b)]">{item.fecha}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
              tipoConfig.bg,
              tipoConfig.text,
              tipoConfig.border
            )}
          >
            <TipoIcon className="h-3.5 w-3.5" />
            {item.tipo}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-[var(--color-text,#1e293b)]">{item.producto}</p>
        <p className="text-xs text-[var(--color-text-muted,#64748b)]">{item.productoId}</p>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={cn('font-medium', tipoConfig.color)}>
          {tipoConfig.sign}{formatNumber(Math.abs(item.cantidad))}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <div>
            <p className="text-sm text-[var(--color-text,#1e293b)]">{item.usuario}</p>
            <p className="text-xs text-[var(--color-text-muted,#64748b)]">{item.area}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-[var(--color-primary,#3b82f6)] text-sm font-medium">
          {item.documento}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-[var(--color-text-muted,#64748b)] max-w-xs truncate">
        {item.observacion}
      </td>
    </tr>
  );
}

interface HistorialCardProps {
  item: HistorialItem;
}

function HistorialCard({ item }: HistorialCardProps) {
  const { settings } = useUISettings();

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'ENTRADA':
        return {
          bg: 'bg-[var(--color-success-bg,#dcfce7)]',
          text: 'text-[var(--color-success,#16a34a)]',
          border: 'border-[var(--color-success-border,#86efac)]',
          icon: ArrowDownLeft,
          sign: '+',
          color: 'text-[var(--color-success,#16a34a)]',
          iconBg: 'bg-[var(--color-success,#16a34a)]/10',
        };
      case 'SALIDA':
        return {
          bg: 'bg-[var(--color-error-bg,#fee2e2)]',
          text: 'text-[var(--color-error,#dc2626)]',
          border: 'border-[var(--color-error-border,#fca5a5)]',
          icon: ArrowUpRight,
          sign: '-',
          color: 'text-[var(--color-error,#dc2626)]',
          iconBg: 'bg-[var(--color-error,#dc2626)]/10',
        };
      case 'AJUSTE':
        return {
          bg: 'bg-[var(--color-warning-bg,#fef9c3)]',
          text: 'text-[var(--color-warning,#ca8a04)]',
          border: 'border-[var(--color-warning-border,#fde047)]',
          icon: Package,
          sign: '',
          color: 'text-[var(--color-warning,#ca8a04)]',
          iconBg: 'bg-[var(--color-warning,#ca8a04)]/10',
        };
      default:
        return {
          bg: 'bg-[var(--color-info-bg,#e0f2fe)]',
          text: 'text-[var(--color-info,#0284c7)]',
          border: 'border-[var(--color-info-border,#7dd3fc)]',
          icon: Package,
          sign: '',
          color: 'text-[var(--color-text-muted,#64748b)]',
          iconBg: 'bg-[var(--color-info,#0284c7)]/10',
        };
    }
  };

  const tipoConfig = getTipoConfig(item.tipo);
  const TipoIcon = tipoConfig.icon;

  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-200',
        'bg-[var(--color-surface,#ffffff)]',
        'border border-[var(--color-border,#e2e8f0)]',
        settings.enableAnimations && 'hover:shadow-lg hover:scale-[1.02]'
      )}
    >
      {/* Header with Type and Quantity */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
            tipoConfig.bg,
            tipoConfig.text,
            tipoConfig.border
          )}
        >
          <TipoIcon className="h-3.5 w-3.5" />
          {item.tipo}
        </span>
        <span className={cn('text-xl font-bold', tipoConfig.color)}>
          {tipoConfig.sign}{formatNumber(Math.abs(item.cantidad))}
        </span>
      </div>

      {/* Product */}
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('p-2 rounded-lg', tipoConfig.iconBg)}>
          <Package className={cn('h-5 w-5', tipoConfig.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--color-text,#1e293b)] truncate">
            {item.producto}
          </p>
          <p className="text-xs text-[var(--color-text-muted,#64748b)]">
            {item.productoId}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-[var(--color-text-muted,#64748b)]">{item.fecha}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-[var(--color-text,#1e293b)]">{item.usuario}</span>
          <span className="text-[var(--color-text-muted,#64748b)]">({item.area})</span>
        </div>
      </div>

      {/* Document & Observation */}
      <div className="pt-4 border-t border-[var(--color-border,#e2e8f0)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[var(--color-text-muted,#64748b)]">Documento</span>
          <span className="text-sm font-medium text-[var(--color-primary,#3b82f6)]">
            {item.documento}
          </span>
        </div>
        {item.observacion && (
          <p className="text-xs text-[var(--color-text-muted,#64748b)] line-clamp-2">
            {item.observacion}
          </p>
        )}
      </div>
    </div>
  );
}

function HistorialSkeletonLoader() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--color-surface,#ffffff)] rounded-2xl p-5 border border-[var(--color-border,#e2e8f0)]"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table skeleton */}
      <SkeletonTable rows={8} columns={7} />
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function HistorialPage() {
  const { settings } = useUISettings();
  const { user, roleConfig } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Obtener historial del store global
  const historialCompleto = useHistorial();

  // Filtrar por usuario actual (solo para roles no-admin)
  const isAdmin = roleConfig?.nombre === 'Administrador';
  const historialData = isAdmin
    ? historialCompleto
    : historialCompleto.filter(item => item.usuario === user?.username);

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('TODOS');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const { exportExcel, exportPDF, canExportExcel, canExportPDF, isExporting } = useExport({
    baseFilename: 'historial_movimientos',
    title: isAdmin ? 'Historial de Movimientos - Todos' : 'Mi Historial de Movimientos',
    subtitle: isAdmin ? 'Registro completo del sistema' : `Movimientos de ${user?.nombre}`,
    columns: EXPORT_COLUMNS,
  });

  // Simular carga inicial
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filteredHistorial = historialData.filter((item) => {
    const matchesSearch =
      item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'TODOS' || item.tipo === tipoFilter;

    // Filtro de fechas
    let matchesFecha = true;
    if (fechaInicio || fechaFin) {
      const itemDate = item.fecha.split(' ')[0]; // Obtener solo la fecha YYYY-MM-DD
      if (fechaInicio && itemDate < fechaInicio) {
        matchesFecha = false;
      }
      if (fechaFin && itemDate > fechaFin) {
        matchesFecha = false;
      }
    }

    return matchesSearch && matchesTipo && matchesFecha;
  });

  const stats = {
    entradas: historialData.filter((h) => h.tipo === 'ENTRADA').reduce((sum, h) => sum + h.cantidad, 0),
    salidas: historialData.filter((h) => h.tipo === 'SALIDA').reduce((sum, h) => sum + h.cantidad, 0),
    movimientos: historialData.length,
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    setShowExportMenu(false);
    const dataToExport = filteredHistorial.map(item => ({
      ...item,
      cantidad: item.tipo === 'SALIDA' ? -item.cantidad : item.cantidad,
    }));

    if (format === 'excel') {
      exportExcel(dataToExport);
    } else {
      exportPDF(dataToExport);
    }
  };

  if (isLoading) {
    return <HistorialSkeletonLoader />;
  }

  return (
    <div className={cn('space-y-6', settings.enableAnimations && 'animate-fade-in')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text,#1e293b)]">
            {isAdmin ? MODULE_TITLES['historial'] || 'Historial' : 'Mi Historial'}
          </h1>
          <p className="text-[var(--color-text-muted,#64748b)] mt-1">
            {isAdmin
              ? 'Registro completo de movimientos del sistema'
              : `Tus movimientos de inventario - ${user?.nombre}`}
          </p>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting || (!canExportExcel && !canExportPDF)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'bg-[var(--color-primary,#3b82f6)] text-white',
              'hover:opacity-90 transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'shadow-lg shadow-[var(--color-primary,#3b82f6)]/25'
            )}
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exportando...' : 'Exportar'}
            <ChevronDown className="h-4 w-4" />
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div
                className={cn(
                  'absolute right-0 mt-2 w-48 py-1 z-20',
                  'bg-[var(--color-surface,#ffffff)] rounded-xl shadow-lg',
                  'border border-[var(--color-border,#e2e8f0)]'
                )}
              >
                {canExportExcel && (
                  <button
                    onClick={() => handleExport('excel')}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2 text-left',
                      'text-[var(--color-text,#1e293b)]',
                      'hover:bg-[var(--color-surface-hover,#f8fafc)]'
                    )}
                  >
                    <FileSpreadsheet className="h-4 w-4 text-[var(--color-success,#16a34a)]" />
                    Exportar a Excel
                  </button>
                )}
                {canExportPDF && (
                  <button
                    onClick={() => handleExport('pdf')}
                    className={cn(
                      'flex items-center gap-3 w-full px-4 py-2 text-left',
                      'text-[var(--color-text,#1e293b)]',
                      'hover:bg-[var(--color-surface-hover,#f8fafc)]'
                    )}
                  >
                    <FileText className="h-4 w-4 text-[var(--color-error,#dc2626)]" />
                    Exportar a PDF
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-3 gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '50ms' }}
      >
        <StatCard
          title="Total Entradas"
          value={`+${formatNumber(stats.entradas)}`}
          subtitle="Ingresos al inventario"
          icon={<ArrowDownLeft className="h-5 w-5" />}
          color="success"
        />
        <StatCard
          title="Total Salidas"
          value={`-${formatNumber(stats.salidas)}`}
          subtitle="Egresos del inventario"
          icon={<ArrowUpRight className="h-5 w-5" />}
          color="error"
        />
        <StatCard
          title="Movimientos"
          value={stats.movimientos.toString()}
          subtitle="Total de registros"
          icon={<Activity className="h-5 w-5" />}
          color="primary"
        />
      </div>

      {/* Filters */}
      <div
        className={cn(
          'flex flex-col lg:flex-row items-start lg:items-center gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '100ms' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted,#64748b)]" />
          <input
            type="text"
            placeholder="Buscar por producto o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-xl',
              'bg-[var(--color-surface,#ffffff)]',
              'border border-[var(--color-border,#e2e8f0)]',
              'text-[var(--color-text,#1e293b)]',
              'placeholder-[var(--color-text-muted,#64748b)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
            )}
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[var(--color-text-muted,#64748b)]" />
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className={cn(
                'px-4 py-2 rounded-xl',
                'bg-[var(--color-surface,#ffffff)]',
                'border border-[var(--color-border,#e2e8f0)]',
                'text-[var(--color-text,#1e293b)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
              )}
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
              <option value="AJUSTE">Ajustes</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--color-text-muted,#64748b)]" />
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className={cn(
                'px-3 py-2 rounded-xl',
                'bg-[var(--color-surface,#ffffff)]',
                'border border-[var(--color-border,#e2e8f0)]',
                'text-[var(--color-text,#1e293b)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
              )}
            />
            <span className="text-[var(--color-text-muted,#64748b)]">-</span>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className={cn(
                'px-3 py-2 rounded-xl',
                'bg-[var(--color-surface,#ffffff)]',
                'border border-[var(--color-border,#e2e8f0)]',
                'text-[var(--color-text,#1e293b)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
              )}
            />
          </div>
          <div
            className={cn(
              'flex items-center p-1 rounded-xl',
              'bg-[var(--color-surface,#ffffff)]',
              'border border-[var(--color-border,#e2e8f0)]'
            )}
          >
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-[var(--color-primary,#3b82f6)]/10 text-[var(--color-primary,#3b82f6)]'
                  : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-text,#1e293b)]'
              )}
              title="Vista lista"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-[var(--color-primary,#3b82f6)]/10 text-[var(--color-primary,#3b82f6)]'
                  : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-text,#1e293b)]'
              )}
              title="Vista tarjetas"
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Historial View */}
      <div
        className={cn(settings.enableAnimations && 'animate-fade-in-up')}
        style={{ animationDelay: '150ms' }}
      >
        {historialData.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoHistory
              action={{
                label: 'Cambiar filtros',
                onClick: () => {
                  setTipoFilter('TODOS');
                  setFechaInicio('');
                  setFechaFin('');
                },
                variant: 'secondary',
              }}
            />
          </div>
        ) : filteredHistorial.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoResults
              action={{
                label: 'Limpiar filtros',
                onClick: () => {
                  setSearchTerm('');
                  setTipoFilter('TODOS');
                  setFechaInicio('');
                  setFechaFin('');
                },
                variant: 'secondary',
              }}
            />
          </div>
        ) : viewMode === 'list' ? (
          <div
            className={cn(
              'rounded-2xl overflow-hidden',
              'bg-[var(--color-surface,#ffffff)]',
              'border border-[var(--color-border,#e2e8f0)]'
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-surface-hover,#f8fafc)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Observación
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border,#e2e8f0)]">
                  {filteredHistorial.map((item) => (
                    <HistorialRow key={item.id} item={item as HistorialItem} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHistorial.map((item) => (
              <HistorialCard key={item.id} item={item as HistorialItem} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
