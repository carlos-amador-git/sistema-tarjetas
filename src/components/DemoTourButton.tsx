'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, Play, X } from 'lucide-react';
import { DemoTour } from './DemoTour';
import { useTenantFeatures } from '@/hooks/useTenant';
import { cn } from '@/lib/utils';

export function DemoTourButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const features = useTenantFeatures();

  // Solo mostrar si showDemo está habilitado
  if (!features.showDemo) return null;

  const handleNavigate = (route: string) => {
    setIsOpen(false);
    router.push(route);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Tooltip */}
          {showTooltip && !isOpen && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg whitespace-nowrap animate-fade-in">
              Recorrido del Sistema
              <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800" />
            </div>
          )}

          {/* Button */}
          <button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all",
              "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
              "text-white font-medium",
              "hover:scale-105 hover:shadow-xl",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
          >
            <Play className="h-5 w-5" />
            <span className="hidden sm:inline">Tour Demo</span>
          </button>

          {/* Pulse animation */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          </span>
        </div>
      </div>

      {/* Tour Modal */}
      <DemoTour
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onNavigate={handleNavigate}
      />
    </>
  );
}

// Componente alternativo más compacto para el sidebar
export function DemoTourSidebarButton({ onOpenTour }: { onOpenTour: () => void }) {
  const features = useTenantFeatures();

  if (!features.showDemo) return null;

  return (
    <button
      onClick={onOpenTour}
      className="flex items-center gap-3 w-full px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors"
    >
      <HelpCircle className="h-5 w-5" />
      <span>Recorrido Demo</span>
    </button>
  );
}

export default DemoTourButton;
