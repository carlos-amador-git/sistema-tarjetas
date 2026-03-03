'use client';

/**
 * Catálogo de Productos
 *
 * Gestión de productos con vistas grid/list, filtros y acciones.
 * Usa los nuevos componentes adaptables que respetan la configuración de UI.
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Package,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Grid,
  List,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  TrendingDown,
} from 'lucide-react';
import { MODULE_TITLES } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { CATEGORIAS_PRODUCTO } from '@/data/mockData';
import { useProductStore, useProductos } from '@/stores/productStore';
import { Modal } from '@/components/ui/Modal';
import { EditProductoForm } from '@/components/forms/EditProductoForm';
import { NuevoProductoForm } from '@/components/forms/NuevoProductoForm';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatusBadge } from '@/components/ui/DataDisplay';
import { useUISettings } from '@/components/ui/UISettings';
import { Skeleton, SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyStateNoProducts, EmptyStateNoResults } from '@/components/ui/EmptyState';
import type { Producto } from '@/data/mockData';

// =============================================================================
// CONSTANTES
// =============================================================================

const CATEGORIAS = CATEGORIAS_PRODUCTO;

// Mapear categoría interna a UI
const getCategoriaUI = (categoria: string) => {
  const map: Record<string, string> = {
    tarjeta: 'Tarjetas',
    kit: 'Kits',
    etiqueta: 'Etiquetas',
    sobre: 'Sobres',
    otro: 'Otro',
  };
  return map[categoria] || 'Otro';
};

const getStockStatus = (stock: number, stockMinimo: number) => {
  const ratio = stock / stockMinimo;
  if (ratio <= 1) return { variant: 'error' as const, label: 'Crítico' };
  if (ratio <= 1.5) return { variant: 'warning' as const, label: 'Bajo' };
  return { variant: 'success' as const, label: 'Normal' };
};

// =============================================================================
// COMPONENTES INTERNOS
// =============================================================================

interface ProductRowProps {
  producto: Producto & { categoriaUI: string };
  onView: (producto: Producto) => void;
  onEdit: (producto: Producto) => void;
  onToggleActivo: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}

function ProductRow({ producto, onView, onEdit, onToggleActivo, onDelete }: ProductRowProps) {
  const { settings } = useUISettings();
  const stockStatus = getStockStatus(producto.stock, producto.stockMinimo);

  return (
    <tr
      className={cn(
        'transition-colors',
        'hover:bg-[var(--color-surface-hover,#f8fafc)]',
        !producto.activo && 'opacity-60',
        settings.enableAnimations && 'animate-fade-in'
      )}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-2 rounded-lg transition-colors',
              producto.activo
                ? 'bg-[var(--color-primary,#3b82f6)]/10'
                : 'bg-[var(--color-surface-hover,#f1f5f9)]'
            )}
          >
            <Package
              className={cn(
                'h-5 w-5',
                producto.activo
                  ? 'text-[var(--color-primary,#3b82f6)]'
                  : 'text-[var(--color-text-muted,#94a3b8)]'
              )}
            />
          </div>
          <div>
            <p className="font-medium text-[var(--color-text,#1e293b)]">{producto.nombre}</p>
            <p className="text-xs text-[var(--color-text-muted,#64748b)]">{producto.id}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-[var(--color-text,#1e293b)]">{producto.categoriaUI}</td>
      <td className="px-4 py-4 text-right font-medium text-[var(--color-text,#1e293b)]">
        {formatNumber(producto.stock)}
      </td>
      <td className="px-4 py-4 text-right text-[var(--color-text-muted,#64748b)]">
        {formatNumber(producto.stockMinimo)}
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-center">
          <StatusBadge text={stockStatus.label} variant={stockStatus.variant} size="sm" />
        </div>
      </td>
      <td className="px-4 py-4 text-right font-medium text-[var(--color-text,#1e293b)]">
        ${producto.precio.toFixed(2)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onView(producto)}
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
            onClick={() => onEdit(producto)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#94a3b8)]',
              'hover:text-[var(--color-warning,#ca8a04)]',
              'hover:bg-[var(--color-warning,#ca8a04)]/10'
            )}
            title="Editar producto"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleActivo(producto)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              producto.activo
                ? 'text-[var(--color-success,#16a34a)] hover:text-[var(--color-warning,#ca8a04)] hover:bg-[var(--color-warning,#ca8a04)]/10'
                : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-success,#16a34a)] hover:bg-[var(--color-success,#16a34a)]/10'
            )}
            title={producto.activo ? 'Desactivar producto' : 'Activar producto'}
          >
            {producto.activo ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(producto)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#94a3b8)]',
              'hover:text-[var(--color-error,#dc2626)]',
              'hover:bg-[var(--color-error,#dc2626)]/10'
            )}
            title="Eliminar producto"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface ProductCardProps {
  producto: Producto & { categoriaUI: string };
  onView: (producto: Producto) => void;
  onEdit: (producto: Producto) => void;
  onToggleActivo: (producto: Producto) => void;
}

function ProductCard({ producto, onView, onEdit, onToggleActivo }: ProductCardProps) {
  const { settings } = useUISettings();
  const stockStatus = getStockStatus(producto.stock, producto.stockMinimo);

  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-200',
        'bg-[var(--color-surface,#ffffff)]',
        'border border-[var(--color-border,#e2e8f0)]',
        !producto.activo && 'opacity-60',
        settings.enableAnimations && 'hover:shadow-lg hover:scale-[1.02]'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'p-3 rounded-xl',
            producto.activo
              ? 'bg-[var(--color-primary,#3b82f6)]/10'
              : 'bg-[var(--color-surface-hover,#f1f5f9)]'
          )}
        >
          <Package
            className={cn(
              'h-6 w-6',
              producto.activo
                ? 'text-[var(--color-primary,#3b82f6)]'
                : 'text-[var(--color-text-muted,#94a3b8)]'
            )}
          />
        </div>
        <StatusBadge text={stockStatus.label} variant={stockStatus.variant} size="sm" />
      </div>

      <h3 className="font-semibold text-[var(--color-text,#1e293b)] mb-1">{producto.nombre}</h3>
      <p className="text-sm text-[var(--color-text-muted,#64748b)] mb-4">{producto.id}</p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted,#64748b)]">Stock:</span>
          <span className="font-medium text-[var(--color-text,#1e293b)]">
            {formatNumber(producto.stock)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--color-text-muted,#64748b)]">Precio:</span>
          <span className="font-medium text-[var(--color-text,#1e293b)]">
            ${producto.precio.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Progress bar de stock */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted,#64748b)] mb-1">
          <span>Stock vs Mínimo</span>
          <span>{Math.round((producto.stock / producto.stockMinimo) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--color-surface-hover,#f1f5f9)] overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              stockStatus.variant === 'success' && 'bg-[var(--color-success,#16a34a)]',
              stockStatus.variant === 'warning' && 'bg-[var(--color-warning,#ca8a04)]',
              stockStatus.variant === 'error' && 'bg-[var(--color-error,#dc2626)]'
            )}
            style={{ width: `${Math.min((producto.stock / producto.stockMinimo) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
        <button
          onClick={() => onView(producto)}
          className={cn(
            'flex-1 py-2 text-sm rounded-lg transition-colors',
            'text-[var(--color-primary,#3b82f6)]',
            'hover:bg-[var(--color-primary,#3b82f6)]/10'
          )}
        >
          Ver detalle
        </button>
        <button
          onClick={() => onEdit(producto)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-[var(--color-text-muted,#94a3b8)]',
            'hover:text-[var(--color-warning,#ca8a04)]',
            'hover:bg-[var(--color-warning,#ca8a04)]/10'
          )}
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={() => onToggleActivo(producto)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            producto.activo
              ? 'text-[var(--color-success,#16a34a)] hover:text-[var(--color-warning,#ca8a04)] hover:bg-[var(--color-warning,#ca8a04)]/10'
              : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-success,#16a34a)] hover:bg-[var(--color-success,#16a34a)]/10'
          )}
        >
          {producto.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ProductsSkeletonLoader({ viewMode }: { viewMode: 'grid' | 'list' }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {viewMode === 'list' ? (
        <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)] overflow-hidden">
          <SkeletonTable rows={5} columns={7} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function ProductosPage() {
  const { settings } = useUISettings();
  const productos = useProductos();
  const toggleActivoProducto = useProductStore((state) => state.toggleActivoProducto);
  const eliminarProducto = useProductStore((state) => state.eliminarProducto);
  const { success, info } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('Todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  // Simular carga inicial - REMOVIDO PARA PRODUCCIÓN
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Transformar productos para la vista
  const productosUI = productos.map((p) => ({
    ...p,
    categoriaUI: getCategoriaUI(p.categoria),
  }));

  const filteredProductos = productosUI.filter((producto) => {
    const matchesSearch =
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria =
      categoriaFilter === 'Todas' || producto.categoriaUI === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  // Estadísticas
  const stats = {
    total: productos.length,
    activos: productos.filter((p) => p.activo).length,
    stockCritico: productos.filter((p) => p.stock <= p.stockMinimo).length,
    valorInventario: productos.reduce((acc, p) => acc + p.stock * p.precio, 0),
  };

  // Handlers
  const handleEdit = (producto: Producto) => {
    setSelectedProduct(producto);
    setShowEditModal(true);
  };

  const handleDeleteClick = (producto: Producto) => {
    setSelectedProduct(producto);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      const nombre = selectedProduct.nombre;
      eliminarProducto(selectedProduct.id);
      success('Producto eliminado', `${nombre} ha sido eliminado del catálogo`);
      setShowDeleteConfirm(false);
      setSelectedProduct(null);
    }
  };

  const handleToggleActivo = (producto: Producto) => {
    toggleActivoProducto(producto.id);
    const nuevoEstado = !producto.activo;
    if (nuevoEstado) {
      success('Producto activado', `${producto.nombre} ahora está disponible`);
    } else {
      info('Producto desactivado', `${producto.nombre} ya no está disponible`);
    }
  };

  const handleViewDetail = (producto: Producto) => {
    setSelectedProduct(producto);
    setShowDetailModal(true);
  };

  const handleCreateSuccess = () => {
    setShowNewModal(false);
    success('Producto creado', 'El nuevo producto ha sido agregado al catálogo');
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedProduct(null);
    success('Producto actualizado', 'Los cambios han sido guardados');
  };

  if (isLoading) {
    return <ProductsSkeletonLoader viewMode={viewMode} />;
  }

  return (
    <div className={cn('space-y-6', settings.enableAnimations && 'animate-fade-in')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text,#1e293b)]">
            {MODULE_TITLES['productos']}
          </h1>
          <p className="text-[var(--color-text-muted,#64748b)] mt-1">
            Catálogo de productos e inventario
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200',
            'bg-[var(--color-primary,#3b82f6)] text-white',
            'hover:bg-[var(--color-primary-dark,#2563eb)]',
            settings.enableAnimations && 'hover:scale-[1.02]'
          )}
        >
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </button>
      </div>

      {/* Stats */}
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
      >
        <StatCard
          title="Total Productos"
          value={stats.total}
          subtitle="En catálogo"
          icon={<Package className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Activos"
          value={stats.activos}
          subtitle="Disponibles"
          icon={<ToggleRight className="h-5 w-5" />}
          color="success"
          progress={{
            value: stats.activos,
            max: stats.total,
            label: `${Math.round((stats.activos / stats.total) * 100)}%`,
          }}
        />
        <StatCard
          title="Stock Crítico"
          value={stats.stockCritico}
          subtitle="Requieren atención"
          icon={<AlertTriangle className="h-5 w-5" />}
          color={stats.stockCritico > 0 ? 'error' : 'success'}
          trend={stats.stockCritico > 0 ? { value: stats.stockCritico, label: 'por debajo del mínimo' } : undefined}
        />
        <StatCard
          title="Valor Inventario"
          value={`$${formatNumber(stats.valorInventario)}`}
          subtitle="Total estimado"
          icon={<TrendingDown className="h-5 w-5" />}
          color="info"
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
            placeholder="Buscar por nombre o código..."
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[var(--color-text-muted,#94a3b8)]" />
            <select
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              className={cn(
                'px-4 py-2.5 rounded-xl transition-all duration-200',
                'bg-[var(--color-surface,#ffffff)]',
                'border border-[var(--color-border,#e2e8f0)]',
                'text-[var(--color-text,#1e293b)]',
                'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
              )}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Products View */}
      <div
        className={cn(settings.enableAnimations && 'animate-fade-in-up')}
        style={{ animationDelay: '150ms' }}
      >
        {productos.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoProducts
              action={{
                label: 'Agregar producto',
                onClick: () => setShowNewModal(true),
              }}
            />
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoResults
              action={{
                label: 'Limpiar filtros',
                onClick: () => {
                  setSearchTerm('');
                  setCategoriaFilter('Todas');
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
                      Producto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Stock Actual
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Stock Mínimo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border,#e2e8f0)]">
                  {filteredProductos.map((producto) => (
                    <ProductRow
                      key={producto.id}
                      producto={producto}
                      onView={handleViewDetail}
                      onEdit={handleEdit}
                      onToggleActivo={handleToggleActivo}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProductos.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onView={handleViewDetail}
                onEdit={handleEdit}
                onToggleActivo={handleToggleActivo}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      {filteredProductos.length > 0 && (
        <div
          className={cn(
            'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 py-3 rounded-xl',
            'bg-[var(--color-surface-hover,#f8fafc)]',
            'text-sm text-[var(--color-text-muted,#64748b)]'
          )}
        >
          <span>
            Mostrando {filteredProductos.length} de {productos.length} productos
          </span>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success,#16a34a)]" />
              {stats.activos} activos
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-error,#dc2626)]" />
              {stats.stockCritico} críticos
            </span>
          </div>
        </div>
      )}

      {/* Modal Nuevo Producto */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Nuevo Producto"
        size="md"
      >
        <NuevoProductoForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowNewModal(false)}
        />
      </Modal>

      {/* Modal Editar Producto */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        title="Editar Producto"
        size="md"
      >
        {selectedProduct && (
          <EditProductoForm
            producto={selectedProduct}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        title="Detalle del Producto"
        size="md"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'p-4 rounded-xl',
                  selectedProduct.activo
                    ? 'bg-[var(--color-primary,#3b82f6)]/10'
                    : 'bg-[var(--color-surface-hover,#f1f5f9)]'
                )}
              >
                <Package
                  className={cn(
                    'h-8 w-8',
                    selectedProduct.activo
                      ? 'text-[var(--color-primary,#3b82f6)]'
                      : 'text-[var(--color-text-muted,#94a3b8)]'
                  )}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text,#1e293b)]">
                  {selectedProduct.nombre}
                </h3>
                <p className="text-[var(--color-text-muted,#64748b)]">{selectedProduct.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)]">
                <p className="text-sm text-[var(--color-text-muted,#64748b)]">Categoría</p>
                <p className="font-medium text-[var(--color-text,#1e293b)]">
                  {getCategoriaUI(selectedProduct.categoria)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)]">
                <p className="text-sm text-[var(--color-text-muted,#64748b)]">Estado</p>
                <p
                  className={cn(
                    'font-medium',
                    selectedProduct.activo
                      ? 'text-[var(--color-success,#16a34a)]'
                      : 'text-[var(--color-text-muted,#64748b)]'
                  )}
                >
                  {selectedProduct.activo ? 'Activo' : 'Inactivo'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)]">
                <p className="text-sm text-[var(--color-text-muted,#64748b)]">Stock Actual</p>
                <p className="font-medium text-[var(--color-text,#1e293b)]">
                  {formatNumber(selectedProduct.stock)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)]">
                <p className="text-sm text-[var(--color-text-muted,#64748b)]">Stock Mínimo</p>
                <p className="font-medium text-[var(--color-text,#1e293b)]">
                  {formatNumber(selectedProduct.stockMinimo)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)]">
                <p className="text-sm text-[var(--color-text-muted,#64748b)]">Precio Unitario</p>
                <p className="font-medium text-[var(--color-text,#1e293b)]">
                  ${selectedProduct.precio.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)]">
                <p className="text-sm text-[var(--color-text-muted,#64748b)]">Valor en Inventario</p>
                <p className="font-medium text-[var(--color-text,#1e293b)]">
                  ${formatNumber(selectedProduct.stock * selectedProduct.precio)}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-hover,#f8fafc)]">
              <p className="text-sm text-[var(--color-text-muted,#64748b)] mb-2">
                Áreas donde aplica
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.areas.map((area) => (
                  <StatusBadge
                    key={area}
                    text={
                      area === 'almacen'
                        ? 'Almacén'
                        : area === 'logistica'
                          ? 'Logística'
                          : 'Sucursales'
                    }
                    variant="info"
                    size="sm"
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProduct(null);
                }}
                className={cn(
                  'px-4 py-2 rounded-xl transition-colors',
                  'text-[var(--color-text,#1e293b)]',
                  'hover:bg-[var(--color-surface-hover,#f1f5f9)]'
                )}
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedProduct);
                }}
                className={cn(
                  'px-4 py-2 rounded-xl transition-colors',
                  'bg-[var(--color-primary,#3b82f6)] text-white',
                  'hover:bg-[var(--color-primary-dark,#2563eb)]'
                )}
              >
                Editar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedProduct(null);
        }}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text,#1e293b)]">
            ¿Está seguro que desea eliminar el producto{' '}
            <span className="font-medium">{selectedProduct?.nombre}</span>?
          </p>
          <p className="text-sm text-[var(--color-error,#dc2626)]">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedProduct(null);
              }}
              className={cn(
                'px-4 py-2 rounded-xl transition-colors',
                'text-[var(--color-text,#1e293b)]',
                'hover:bg-[var(--color-surface-hover,#f1f5f9)]'
              )}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className={cn(
                'px-4 py-2 rounded-xl transition-colors',
                'bg-[var(--color-error,#dc2626)] text-white',
                'hover:bg-[var(--color-error-dark,#b91c1c)]'
              )}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
