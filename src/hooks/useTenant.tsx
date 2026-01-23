'use client';

import { createContext, useContext, ReactNode, useMemo, useEffect, useState } from 'react';
import { TenantConfig } from '@/types';
import { getTenantByHost, defaultTenant } from '@/config/tenants';

interface TenantContextValue {
  tenant: TenantConfig;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
  initialTenant?: TenantConfig;
}

/**
 * Provider del Tenant
 * Detecta automáticamente el tenant basado en el hostname
 */
export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenant, setTenant] = useState<TenantConfig>(initialTenant || defaultTenant);
  const [isLoading, setIsLoading] = useState(!initialTenant);

  useEffect(() => {
    if (!initialTenant) {
      // Detectar tenant en el cliente
      const host = window.location.host;
      const detectedTenant = getTenantByHost(host);
      setTenant(detectedTenant);
      setIsLoading(false);
    }
  }, [initialTenant]);

  // Aplicar CSS variables del tema cuando cambia el tenant
  useEffect(() => {
    const root = document.documentElement;
    const { theme } = tenant;

    root.style.setProperty('--brand-primary', theme.primary);
    root.style.setProperty('--brand-secondary', theme.secondary);
    root.style.setProperty('--brand-accent', theme.accent);
    root.style.setProperty('--color-success', theme.success);
    root.style.setProperty('--color-warning', theme.warning);
    root.style.setProperty('--color-error', theme.error);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-sidebar', theme.sidebar);
  }, [tenant]);

  const value = useMemo(() => ({
    tenant,
    isLoading,
  }), [tenant, isLoading]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook para acceder a la configuración del tenant actual
 */
export function useTenant(): TenantContextValue {
  const context = useContext(TenantContext);

  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }

  return context;
}

/**
 * Hook para acceder solo al branding del tenant
 */
export function useTenantBranding() {
  const { tenant } = useTenant();
  return tenant.branding;
}

/**
 * Hook para acceder solo al tema del tenant
 */
export function useTenantTheme() {
  const { tenant } = useTenant();
  return tenant.theme;
}

/**
 * Hook para acceder a las features habilitadas del tenant
 */
export function useTenantFeatures() {
  const { tenant } = useTenant();
  return tenant.features;
}
