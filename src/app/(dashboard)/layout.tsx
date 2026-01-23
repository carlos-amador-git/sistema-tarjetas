'use client';

import { useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';

// Lazy load DemoTourButton ya que solo se usa cuando showDemo está activo
const DemoTourButton = lazy(() =>
  import('@/components/DemoTourButton').then((mod) => ({ default: mod.DemoTourButton }))
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background,#f8fafc)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary,#3b82f6)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen w-full overflow-hidden flex bg-[var(--color-background,#f8fafc)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-full relative">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
      {/* Botón flotante del tour demo - solo visible si showDemo está habilitado */}
      <Suspense fallback={null}>
        <DemoTourButton />
      </Suspense>
    </div>
  );
}
