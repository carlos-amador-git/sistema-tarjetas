'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { TenantProvider } from '@/hooks/useTenant';
import { ToastProvider } from '@/components/ui/Toast';
import { UISettingsProvider } from '@/components/ui/UISettings';

interface ProvidersProps {
  children: React.ReactNode;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Con SSR, queremos staleTime mayor a 0 para evitar refetches inmediatos en cliente
        staleTime: 60 * 1000, // 1 minuto
        gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: siempre crear nuevo QueryClient
    return makeQueryClient();
  } else {
    // Browser: reutilizar el mismo QueryClient
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: ProvidersProps) {
  // Esto asegura que no recreamos el QueryClient en cada render
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TenantProvider>
        <UISettingsProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </UISettingsProvider>
      </TenantProvider>
    </QueryClientProvider>
  );
}
