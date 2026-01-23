'use client';

/**
 * Dashboard Principal
 *
 * Panel de control con KPIs, alertas y resumen del día.
 * Usa los nuevos componentes adaptables que respetan la configuración de UI.
 */

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Package,
  Truck,
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { MODULE_TITLES } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { useInventoryStore, useOrdenes } from '@/stores/inventoryStore';
import { ALERTAS } from '@/data/mockData';
import { StatCard, StatusBadge } from '@/components/ui/DataDisplay';
import { useUISettings } from '@/components/ui/UISettings';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdaptiveAreaChart, AdaptiveDonutChart } from '@/components/charts';

// =============================================================================
// TIPOS
// =============================================================================

interface AlertItemProps {
  producto: string;
  mensaje: string;
  tipo: 'warning' | 'info' | 'error' | 'success';
}

// =============================================================================
// COMPONENTES INTERNOS
// =============================================================================

function AlertItem({ producto, mensaje, tipo }: AlertItemProps) {
  const { settings } = useUISettings();

  const variants = {
    warning: {
      bg: 'bg-[var(--color-warning-bg,#fef9c3)]',
      border: 'border-[var(--color-warning-border,#fde047)]',
      text: 'text-[var(--color-warning,#ca8a04)]',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-[var(--color-info-bg,#e0f2fe)]',
      border: 'border-[var(--color-info-border,#7dd3fc)]',
      text: 'text-[var(--color-info,#0284c7)]',
      icon: Clock,
    },
    error: {
      bg: 'bg-[var(--color-error-bg,#fee2e2)]',
      border: 'border-[var(--color-error-border,#fca5a5)]',
      text: 'text-[var(--color-error,#dc2626)]',
      icon: AlertTriangle,
    },
    success: {
      bg: 'bg-[var(--color-success-bg,#dcfce7)]',
      border: 'border-[var(--color-success-border,#86efac)]',
      text: 'text-[var(--color-success,#16a34a)]',
      icon: CheckCircle,
    },
  };

  const variant = variants[tipo];
  const Icon = variant.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border transition-all duration-200',
        variant.bg,
        variant.border,
        variant.text,
        settings.enableAnimations && 'hover:scale-[1.01]'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{producto}</p>
        <p className="text-sm opacity-80">{mensaje}</p>
      </div>
      <StatusBadge
        text={tipo === 'warning' ? 'Atención' : tipo === 'error' ? 'Crítico' : tipo === 'success' ? 'OK' : 'Info'}
        variant={tipo}
        size="sm"
      />
    </div>
  );
}

function QuickStatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  const { settings } = useUISettings();

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 rounded-xl',
        'bg-[var(--color-surface-hover,#f8fafc)]',
        'transition-all duration-200',
        settings.enableAnimations && 'hover:bg-[var(--color-surface-active,#f1f5f9)]'
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', color)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[var(--color-text-muted,#64748b)]">{label}</span>
      </div>
      <span className="text-xl font-bold text-[var(--color-text,#1e293b)]">{value}</span>
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function DashboardPage() {
  const { user, roleConfig } = useAuth();
  const { settings } = useUISettings();
  const [isLoading, setIsLoading] = useState(true);

  // Obtener datos del store global
  const getResumenGlobal = useInventoryStore((state) => state.getResumenGlobal);
  const ordenes = useOrdenes();

  // Calcular métricas dinámicas
  const resumen = getResumenGlobal();
  const ordenesPendientes = ordenes.filter((o) => o.estatus === 'PENDIENTE').length;
  const capturasHoy = 12; // En producción esto vendría del historial

  // Simular carga inicial
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Datos para sparklines (simulados - en producción vendrían del backend)
  const inventarioHistory = [12500, 13200, 12800, 14100, 13800, 14500, resumen.totalInventario];
  const almacenHistory = [4200, 4500, 4300, 4800, 4600, 4900, resumen.enAlmacen];

  // Datos para gráficos
  const inventarioTendencia = [
    { mes: 'Ago', inventario: 12500, almacen: 4200, logistica: 3100, sucursales: 5200 },
    { mes: 'Sep', inventario: 13200, almacen: 4500, logistica: 3400, sucursales: 5300 },
    { mes: 'Oct', inventario: 12800, almacen: 4300, logistica: 3000, sucursales: 5500 },
    { mes: 'Nov', inventario: 14100, almacen: 4800, logistica: 3500, sucursales: 5800 },
    { mes: 'Dic', inventario: 13800, almacen: 4600, logistica: 3200, sucursales: 6000 },
    { mes: 'Ene', inventario: resumen.totalInventario, almacen: resumen.enAlmacen, logistica: resumen.enLogistica, sucursales: resumen.enSucursales },
  ];

  const distribucionStock = [
    { name: 'Almacén', value: resumen.enAlmacen },
    { name: 'Logística', value: resumen.enLogistica },
    { name: 'Sucursales', value: resumen.enSucursales },
  ];

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className={cn('space-y-6', settings.enableAnimations && 'animate-fade-in')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text,#1e293b)]">
            {MODULE_TITLES['dashboard']}
          </h1>
          <p className="text-[var(--color-text-muted,#64748b)] mt-1">
            Bienvenido, <span className="font-medium text-[var(--color-text,#1e293b)]">{user?.nombre}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted,#64748b)]">
            {new Date().toLocaleDateString('es-MX', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid - Usa los nuevos StatCard adaptables */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inventario"
          value={formatNumber(resumen.totalInventario)}
          subtitle="Todas las áreas"
          icon={<CreditCard className="h-5 w-5" />}
          color="primary"
          trend={{ value: 5.2, label: 'vs mes anterior' }}
          sparkline={inventarioHistory}
          href="/balance"
        />
        <StatCard
          title="En Almacén"
          value={formatNumber(resumen.enAlmacen)}
          subtitle="Bóveda + Trabajo"
          icon={<Package className="h-5 w-5" />}
          color="info"
          sparkline={almacenHistory}
          href="/capturas/almacen"
        />
        <StatCard
          title="En Logística"
          value={formatNumber(resumen.enLogistica)}
          subtitle="En tránsito"
          icon={<Truck className="h-5 w-5" />}
          color="warning"
          href="/capturas/logistica"
        />
        <StatCard
          title="En Sucursales"
          value={formatNumber(resumen.enSucursales)}
          subtitle="Puntos de venta"
          icon={<Building2 className="h-5 w-5" />}
          color="success"
          href="/capturas/sucursales"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={cn(
            'lg:col-span-2',
            settings.enableAnimations && 'animate-fade-in-up'
          )}
          style={{ animationDelay: '100ms' }}
        >
          <AdaptiveAreaChart
            title="Tendencia de Inventario"
            subtitle="Últimos 6 meses"
            data={inventarioTendencia}
            series={[
              { dataKey: 'almacen', name: 'Almacén', color: 'var(--color-info, #0284c7)' },
              { dataKey: 'logistica', name: 'Logística', color: 'var(--color-warning, #ca8a04)' },
              { dataKey: 'sucursales', name: 'Sucursales', color: 'var(--color-success, #16a34a)' },
            ]}
            xAxisKey="mes"
            height={280}
            showLegend
            gradient
          />
        </div>
        <div
          className={cn(settings.enableAnimations && 'animate-fade-in-up')}
          style={{ animationDelay: '150ms' }}
        >
          <AdaptiveDonutChart
            title="Distribución de Stock"
            subtitle="Por área"
            data={distribucionStock}
            height={280}
            centerLabel={{
              title: 'Total',
              value: formatNumber(resumen.totalInventario),
            }}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas */}
        <div
          className={cn(
            'lg:col-span-2 rounded-2xl p-6',
            'bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e2e8f0)]',
            settings.enableAnimations && 'animate-fade-in-up'
          )}
          style={{ animationDelay: '100ms' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[var(--color-primary,#3b82f6)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text,#1e293b)]">
                Alertas y Notificaciones
              </h2>
            </div>
            {ALERTAS.length > 0 && (
              <span className="text-sm text-[var(--color-text-muted,#64748b)]">
                {ALERTAS.length} pendientes
              </span>
            )}
          </div>

          <div className="space-y-3">
            {ALERTAS.length > 0 ? (
              ALERTAS.map((alerta, index) => (
                <AlertItem
                  key={index}
                  {...alerta}
                  tipo={alerta.tipo as AlertItemProps['tipo']}
                />
              ))
            ) : (
              <EmptyState
                icon={<CheckCircle className="h-8 w-8" />}
                title="Sin alertas pendientes"
                description="Todo está en orden. No hay notificaciones que requieran tu atención."
                size="sm"
              />
            )}
          </div>
        </div>

        {/* Resumen Rápido */}
        <div
          className={cn(
            'rounded-2xl p-6',
            'bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#e2e8f0)]',
            settings.enableAnimations && 'animate-fade-in-up'
          )}
          style={{ animationDelay: '200ms' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-[var(--color-primary,#3b82f6)]" />
            <h2 className="text-lg font-semibold text-[var(--color-text,#1e293b)]">
              Resumen del Día
            </h2>
          </div>

          <div className="space-y-3">
            <QuickStatItem
              icon={Package}
              label="Capturas hoy"
              value={capturasHoy}
              color="bg-[var(--color-info-bg,#e0f2fe)] text-[var(--color-info,#0284c7)]"
            />
            <QuickStatItem
              icon={Clock}
              label="Órdenes pendientes"
              value={ordenesPendientes}
              color="bg-[var(--color-warning-bg,#fef9c3)] text-[var(--color-warning,#ca8a04)]"
            />
            <QuickStatItem
              icon={Activity}
              label="En proceso"
              value={formatNumber(resumen.enProceso)}
              color="bg-[var(--color-primary,#3b82f6)]/10 text-[var(--color-primary,#3b82f6)]"
            />
          </div>

          {/* Quick Links */}
          <div className="mt-6 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
            <p className="text-xs text-[var(--color-text-muted,#64748b)] mb-3">Accesos rápidos</p>
            <div className="space-y-2">
              <Link
                href="/balance"
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg',
                  'text-sm text-[var(--color-text,#1e293b)]',
                  'hover:bg-[var(--color-surface-hover,#f8fafc)] transition-colors'
                )}
              >
                <span>Ver balance general</span>
                <ArrowRight className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
              </Link>
              <Link
                href="/ordenes"
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg',
                  'text-sm text-[var(--color-text,#1e293b)]',
                  'hover:bg-[var(--color-surface-hover,#f8fafc)] transition-colors'
                )}
              >
                <span>Gestionar órdenes</span>
                <ArrowRight className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Info del Rol */}
      <div
        className={cn(
          'rounded-2xl p-6 text-white overflow-hidden relative',
          settings.enableGradients
            ? 'bg-gradient-to-r from-[var(--color-primary,#3b82f6)] to-[var(--color-secondary,#1e40af)]'
            : 'bg-[var(--color-text,#1e293b)]',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '300ms' }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {user?.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg">{roleConfig?.nombre || user?.rol}</p>
              <p className="text-white/70 text-sm">Área: {roleConfig?.area || user?.area}</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {user?.activo ? 'Sesión activa' : 'Inactivo'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
