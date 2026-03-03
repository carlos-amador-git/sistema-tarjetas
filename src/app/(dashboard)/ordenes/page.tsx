'use client';

/**
 * Órdenes de Compra
 *
 * Gestión de órdenes con filtros, búsqueda y acciones.
 * Usa los nuevos componentes adaptables que respetan la configuración de UI.
 */

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  MoreVertical,
  ChevronDown,
  FileSpreadsheet,
  ShoppingCart,
  AlertTriangle,
  Grid,
  List,
  Package,
  User,
  Calendar,
} from 'lucide-react';
import { MODULE_TITLES } from '@/config';
import { cn, formatNumber, formatDate } from '@/lib/utils';
import { useExport } from '@/hooks/useExport';
import { useOrdenes, useInventoryStore } from '@/stores/inventoryStore';
import type { OrdenCompra } from '@/data/mockData';
import { Modal } from '@/components/ui/Modal';
import { NuevaOrdenForm } from '@/components/forms/NuevaOrdenForm';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatusBadge } from '@/components/ui/DataDisplay';
import { useUISettings } from '@/components/ui/UISettings';
import { Skeleton, SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyStateNoOrders, EmptyStateNoResults } from '@/components/ui/EmptyState';

// =============================================================================
// CONFIGURACIÓN DE ESTADOS
// =============================================================================

const STATUS_CONFIG = {
  PENDIENTE: {
    color: 'warning',
    icon: Clock,
    label: 'Pendiente',
  },
  APROBADA: {
    color: 'info',
    icon: CheckCircle,
    label: 'Aprobada',
  },
  COMPLETADA: {
    color: 'success',
    icon: CheckCircle,
    label: 'Completada',
  },
  RECHAZADA: {
    color: 'error',
    icon: XCircle,
    label: 'Rechazada',
  },
} as const;

// Columnas para exportación
const EXPORT_COLUMNS = [
  { key: 'id', header: 'Folio' },
  { key: 'fecha', header: 'Fecha' },
  { key: 'producto', header: 'Producto' },
  { key: 'cantidad', header: 'Cantidad' },
  { key: 'solicitante', header: 'Solicitante' },
  { key: 'area', header: 'Área' },
  { key: 'costoTotal', header: 'Costo Total' },
  { key: 'estatus', header: 'Estatus' },
];

// =============================================================================
// COMPONENTES INTERNOS
// =============================================================================

interface OrderRowProps {
  orden: OrdenCompra;
  onView: (orden: OrdenCompra) => void;
  onDownload: (orden: OrdenCompra) => void;
}

function OrderRow({ orden, onView, onDownload }: OrderRowProps) {
  const { settings } = useUISettings();
  const statusConfig = STATUS_CONFIG[orden.estatus as keyof typeof STATUS_CONFIG];

  return (
    <tr
      className={cn(
        'transition-colors',
        'hover:bg-[var(--color-surface-hover,#f8fafc)]',
        settings.enableAnimations && 'animate-fade-in'
      )}
    >
      <td className="px-4 py-4">
        <span className="font-medium text-[var(--color-primary,#3b82f6)]">{orden.id}</span>
      </td>
      <td className="px-4 py-4 text-[var(--color-text-muted,#64748b)]">
        {formatDate(orden.fecha)}
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-[var(--color-text,#1e293b)]">{orden.producto}</p>
      </td>
      <td className="px-4 py-4 text-right text-[var(--color-text,#1e293b)]">
        {formatNumber(orden.cantidad)}
      </td>
      <td className="px-4 py-4">
        <p className="text-[var(--color-text,#1e293b)]">{orden.solicitante}</p>
        <p className="text-xs text-[var(--color-text-muted,#64748b)]">{orden.area}</p>
      </td>
      <td className="px-4 py-4 text-right font-medium text-[var(--color-text,#1e293b)]">
        ${formatNumber(orden.costoTotal)}
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-center">
          <StatusBadge
            text={statusConfig.label}
            variant={statusConfig.color as 'warning' | 'info' | 'success' | 'error'}
            size="sm"
          />
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onView(orden)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#94a3b8)]',
              'hover:text-[var(--color-primary,#3b82f6)]',
              'hover:bg-[var(--color-primary,#3b82f6)]/10'
            )}
            title="Ver detalle"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDownload(orden)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#94a3b8)]',
              'hover:text-[var(--color-success,#16a34a)]',
              'hover:bg-[var(--color-success,#16a34a)]/10'
            )}
            title="Descargar PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#94a3b8)]',
              'hover:text-[var(--color-text,#1e293b)]',
              'hover:bg-[var(--color-surface-hover,#f1f5f9)]'
            )}
            title="Más opciones"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface OrderCardProps {
  orden: OrdenCompra;
  onView: (orden: OrdenCompra) => void;
  onDownload: (orden: OrdenCompra) => void;
}

function OrderCard({ orden, onView, onDownload }: OrderCardProps) {
  const { settings } = useUISettings();
  const statusConfig = STATUS_CONFIG[orden.estatus as keyof typeof STATUS_CONFIG];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-200',
        'bg-[var(--color-surface,#ffffff)]',
        'border border-[var(--color-border,#e2e8f0)]',
        settings.enableAnimations && 'hover:shadow-lg hover:scale-[1.02]'
      )}
    >
      {/* Header with Folio and Status */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-sm text-[var(--color-text-muted,#64748b)]">Folio</span>
          <p className="font-bold text-[var(--color-primary,#3b82f6)]">{orden.id}</p>
        </div>
        <StatusBadge
          text={statusConfig.label}
          variant={statusConfig.color as 'warning' | 'info' | 'success' | 'error'}
          size="sm"
        />
      </div>

      {/* Product */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[var(--color-primary,#3b82f6)]/10">
          <Package className="h-5 w-5 text-[var(--color-primary,#3b82f6)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--color-text,#1e293b)] truncate">
            {orden.producto}
          </p>
          <p className="text-sm text-[var(--color-text-muted,#64748b)]">
            Cantidad: {formatNumber(orden.cantidad)}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-[var(--color-text-muted,#64748b)]">
            {formatDate(orden.fecha)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-[var(--color-text,#1e293b)]">{orden.solicitante}</span>
          <span className="text-[var(--color-text-muted,#64748b)]">({orden.area})</span>
        </div>
      </div>

      {/* Cost */}
      <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)] mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-muted,#64748b)]">Costo Total</span>
          <span className="text-lg font-bold text-[var(--color-text,#1e293b)]">
            ${formatNumber(orden.costoTotal)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
        <button
          onClick={() => onView(orden)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-colors',
            'text-[var(--color-primary,#3b82f6)]',
            'hover:bg-[var(--color-primary,#3b82f6)]/10'
          )}
        >
          <Eye className="h-4 w-4" />
          Ver detalle
        </button>
        <button
          onClick={() => onDownload(orden)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-[var(--color-text-muted,#94a3b8)]',
            'hover:text-[var(--color-success,#16a34a)]',
            'hover:bg-[var(--color-success,#16a34a)]/10'
          )}
          title="Descargar PDF"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-[var(--color-text-muted,#94a3b8)]',
            'hover:text-[var(--color-text,#1e293b)]',
            'hover:bg-[var(--color-surface-hover,#f1f5f9)]'
          )}
          title="Más opciones"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function OrdersSkeletonLoader() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] p-5"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] overflow-hidden">
        <SkeletonTable rows={5} columns={8} />
      </div>
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function OrdenesPage() {
  const { settings } = useUISettings();
  const ordenesData = useOrdenes();
  const actualizarEstatusOrden = useInventoryStore((state) => state.actualizarEstatusOrden);
  const { success } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showNewOrden, setShowNewOrden] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const { exportExcel, exportPDF, canExportExcel, canExportPDF, isExporting } = useExport({
    baseFilename: 'ordenes-compra',
    title: 'Órdenes de Compra',
    columns: EXPORT_COLUMNS,
  });

  // Simular carga inicial
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOrdenes = ordenesData.filter((orden) => {
    const matchesSearch =
      orden.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.solicitante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || orden.estatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: ordenesData.length,
    pendientes: ordenesData.filter((o) => o.estatus === 'PENDIENTE').length,
    aprobadas: ordenesData.filter((o) => o.estatus === 'APROBADA').length,
    completadas: ordenesData.filter((o) => o.estatus === 'COMPLETADA').length,
  };

  // Calcular valor total de órdenes pendientes
  const valorPendientes = ordenesData
    .filter((o) => o.estatus === 'PENDIENTE')
    .reduce((acc, o) => acc + o.costoTotal, 0);

  // Preparar datos para exportación
  const getExportData = () => {
    return filteredOrdenes.map((o) => ({
      id: o.id,
      fecha: formatDate(o.fecha),
      producto: o.producto,
      cantidad: o.cantidad,
      solicitante: o.solicitante,
      area: o.area,
      costoTotal: `$${formatNumber(o.costoTotal)}`,
      estatus: o.estatus,
    }));
  };

  const handleExportExcel = () => {
    exportExcel(getExportData());
    setShowExportMenu(false);
    success('Exportación completada', 'Archivo Excel descargado correctamente');
  };

  const handleExportPDF = () => {
    exportPDF(getExportData());
    setShowExportMenu(false);
    success('Exportación completada', 'Archivo PDF descargado correctamente');
  };

  const handleCreateSuccess = () => {
    setShowNewOrden(false);
    success('Orden creada', 'La nueva orden de compra ha sido registrada');
  };

  const handleViewOrder = (orden: OrdenCompra) => {
    // TODO: Implementar vista de detalle
    console.log('Ver orden:', orden.id);
  };

  const handleDownloadOrder = (orden: OrdenCompra) => {
    // TODO: Implementar descarga individual
    console.log('Descargar orden:', orden.id);
  };

  if (isLoading) {
    return <OrdersSkeletonLoader />;
  }

  return (
    <div className={cn('space-y-6', settings.enableAnimations && 'animate-fade-in')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text,#1e293b)]">
            {MODULE_TITLES['ordenes']}
          </h1>
          <p className="text-[var(--color-text-muted,#64748b)] mt-1">
            Gestión de órdenes de compra
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Dropdown de Exportación */}
          {(canExportExcel || canExportPDF) && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isExporting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200',
                  'bg-[var(--color-surface,#ffffff)]',
                  'border border-[var(--color-border,#e2e8f0)]',
                  'text-[var(--color-text,#1e293b)]',
                  'hover:bg-[var(--color-surface-hover,#f8fafc)]',
                  'disabled:opacity-50'
                )}
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar'}
                <ChevronDown
                  className={cn('h-4 w-4 transition-transform', showExportMenu && 'rotate-180')}
                />
              </button>

              {showExportMenu && (
                <div
                  className={cn(
                    'absolute right-0 mt-2 w-48 py-1 z-10 rounded-xl shadow-lg',
                    'bg-[var(--color-surface,#ffffff)]',
                    'border border-[var(--color-border,#e2e8f0)]',
                    settings.enableAnimations && 'animate-scale-in'
                  )}
                >
                  {canExportExcel && (
                    <button
                      onClick={handleExportExcel}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2 text-left transition-colors',
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
                      onClick={handleExportPDF}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2 text-left transition-colors',
                        'text-[var(--color-text,#1e293b)]',
                        'hover:bg-[var(--color-surface-hover,#f8fafc)]'
                      )}
                    >
                      <FileText className="h-4 w-4 text-[var(--color-error,#dc2626)]" />
                      Exportar a PDF
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setShowNewOrden(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200',
              'bg-[var(--color-primary,#3b82f6)] text-white',
              'hover:bg-[var(--color-primary-dark,#2563eb)]',
              settings.enableAnimations && 'hover:scale-[1.02]'
            )}
          >
            <Plus className="h-4 w-4" />
            Nueva Orden
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
      >
        <StatCard
          title="Total Órdenes"
          value={stats.total}
          subtitle="Registradas"
          icon={<FileText className="h-5 w-5" />}
          color="primary"
          onClick={() => setStatusFilter('TODOS')}
          className={cn(statusFilter === 'TODOS' && 'ring-2 ring-[var(--color-primary,#3b82f6)]')}
        />
        <StatCard
          title="Pendientes"
          value={stats.pendientes}
          subtitle={`$${formatNumber(valorPendientes)}`}
          icon={<Clock className="h-5 w-5" />}
          color="warning"
          trend={stats.pendientes > 5 ? { value: stats.pendientes, label: 'requieren atención' } : undefined}
          onClick={() => setStatusFilter('PENDIENTE')}
          className={cn(statusFilter === 'PENDIENTE' && 'ring-2 ring-[var(--color-warning,#ca8a04)]')}
        />
        <StatCard
          title="Aprobadas"
          value={stats.aprobadas}
          subtitle="En proceso"
          icon={<CheckCircle className="h-5 w-5" />}
          color="info"
          onClick={() => setStatusFilter('APROBADA')}
          className={cn(statusFilter === 'APROBADA' && 'ring-2 ring-[var(--color-info,#0284c7)]')}
        />
        <StatCard
          title="Completadas"
          value={stats.completadas}
          subtitle="Este mes"
          icon={<CheckCircle className="h-5 w-5" />}
          color="success"
          progress={{
            value: stats.completadas,
            max: stats.total,
            label: `${Math.round((stats.completadas / stats.total) * 100)}%`,
          }}
          onClick={() => setStatusFilter('COMPLETADA')}
          className={cn(statusFilter === 'COMPLETADA' && 'ring-2 ring-[var(--color-success,#16a34a)]')}
        />
      </div>

      {/* Filters */}
      <div
        className={cn(
          'flex flex-col sm:flex-row items-stretch sm:items-center gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '100ms' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted,#94a3b8)]" />
          <input
            type="text"
            placeholder="Buscar por folio, producto o solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl transition-all duration-200',
              'bg-[var(--color-surface,#ffffff)]',
              'border border-[var(--color-border,#e2e8f0)]',
              'text-[var(--color-text,#1e293b)]',
              'placeholder-[var(--color-text-muted,#94a3b8)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
            )}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-[var(--color-text-muted,#94a3b8)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'px-4 py-2.5 rounded-xl transition-all duration-200',
              'bg-[var(--color-surface,#ffffff)]',
              'border border-[var(--color-border,#e2e8f0)]',
              'text-[var(--color-text,#1e293b)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
            )}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>
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

      {/* Orders View */}
      <div
        className={cn(settings.enableAnimations && 'animate-fade-in-up')}
        style={{ animationDelay: '150ms' }}
      >
        {ordenesData.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoOrders
              action={{
                label: 'Nueva orden',
                onClick: () => setShowNewOrden(true),
              }}
            />
          </div>
        ) : filteredOrdenes.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoResults
              action={{
                label: 'Limpiar filtros',
                onClick: () => {
                  setSearchTerm('');
                  setStatusFilter('TODOS');
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
                      Folio
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Solicitante
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Costo Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Estatus
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border,#e2e8f0)]">
                  {filteredOrdenes.map((orden) => (
                    <OrderRow
                      key={orden.id}
                      orden={orden}
                      onView={handleViewOrder}
                      onDownload={handleDownloadOrder}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrdenes.map((orden) => (
              <OrderCard
                key={orden.id}
                orden={orden}
                onView={handleViewOrder}
                onDownload={handleDownloadOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      {filteredOrdenes.length > 0 && (
        <div
          className={cn(
            'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-3 rounded-xl',
            'bg-[var(--color-surface-hover,#f8fafc)]',
            'text-sm text-[var(--color-text-muted,#64748b)]'
          )}
        >
          <span>
            Mostrando {filteredOrdenes.length} de {ordenesData.length} órdenes
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-warning,#ca8a04)]" />
              {stats.pendientes} pendientes
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-info,#0284c7)]" />
              {stats.aprobadas} aprobadas
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success,#16a34a)]" />
              {stats.completadas} completadas
            </span>
          </div>
        </div>
      )}

      {/* Modal Nueva Orden */}
      <Modal
        isOpen={showNewOrden}
        onClose={() => setShowNewOrden(false)}
        title="Nueva Orden de Compra"
        size="lg"
      >
        <NuevaOrdenForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowNewOrden(false)}
        />
      </Modal>
    </div>
  );
}
