'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Warehouse,
  Truck,
  Building2,
  History,
  ShoppingCart,
  CreditCard,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { NAVIGATION_MODULES, type ModuleNavItem } from '@/config';
import { cn } from '@/lib/utils';
import { UISettingsButton } from '@/components/ui/UISettings';
import { ThemeSelector } from '@/components/ThemeSelector';

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Warehouse,
  Truck,
  Building2,
  History,
  ShoppingCart,
  CreditCard,
  Users,
};

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, roleConfig, logout, hasAccess } = useAuth();
  const { tenant } = useTenant();
  const { branding } = tenant;

  // Filtrar módulos según rol del usuario
  const accessibleModules = NAVIGATION_MODULES.filter((module) => hasAccess(module.id));

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const NavItem = ({ module }: { module: ModuleNavItem }) => {
    const Icon = iconMap[module.icon] || CreditCard;
    const active = isActive(module.path);

    return (
      <Link
        href={module.path}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
          'hover:bg-white/10',
          active && 'bg-white/15 text-white shadow-lg',
          !active && 'text-slate-300 hover:text-white'
        )}
      >
        <Icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-blue-400')} />
        {!isCollapsed && <span className="font-medium truncate">{module.label}</span>}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          {branding.logo.type === 'image' ? (
            <Image
              src={branding.logo.imagePath}
              alt={branding.logo.imageAlt}
              width={40}
              height={40}
              className="rounded-xl flex-shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${tenant.theme.primary}, ${tenant.theme.secondary})` }}
            >
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-white truncate">
                {branding.companyName}
                <span style={{ color: tenant.theme.accent }}>{branding.companySubtitle}</span>
              </h1>
              <p className="text-xs text-slate-400 truncate">{branding.sidebarSubtitle}</p>
            </div>
          )}
        </div>
      </div>

      {/* Theme Selector for Demos */}
      {!isCollapsed && (
        <div className="px-4 pb-2">
          <ThemeSelector />
        </div>
      )}
      {isCollapsed && (
        <div className="px-2 pb-2 flex justify-center">
          <ThemeSelector collapsed />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {accessibleModules.map((module) => (
          <NavItem key={module.id} module={module} />
        ))}
      </nav>

      {/* User Info & Settings */}
      <div className="p-4 border-t border-white/10">
        {user && (
          <div className={cn('flex items-center gap-3 mb-3', isCollapsed && 'justify-center')}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: roleConfig?.color || '#3b82f6' }}
            >
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
                <p className="text-xs text-slate-400 truncate">{roleConfig?.area || user.area}</p>
              </div>
            )}
          </div>
        )}

        {/* Settings & Logout */}
        <div className={cn('flex gap-2', isCollapsed ? 'flex-col items-center' : 'items-center')}>
          {/* UI Settings Button */}
          <div className={cn(!isCollapsed && 'flex-shrink-0')}>
            <UISettingsButton />
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl',
              'text-slate-300 hover:text-white hover:bg-red-500/20',
              'transition-all duration-200',
              isCollapsed ? 'w-full justify-center' : 'flex-1'
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Collapse Toggle (Desktop) */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl bg-slate-800 text-white shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'bg-gradient-to-b from-slate-900 to-slate-800',
          'flex flex-col transition-all duration-300',
          'border-r border-white/10',
          // Desktop
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
