'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff, User, Lock, CreditCard, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { cn } from '@/lib/utils';
import { TwoFactorVerify } from '@/components/TwoFactorVerify';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado para 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [pending2FAUserId, setPending2FAUserId] = useState<number | null>(null);

  const { login, verify2FA, isAuthenticated, isLoading } = useAuth();
  const { tenant } = useTenant();
  const { branding, theme, features, demoCredentials } = tenant;
  const router = useRouter();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        router.push('/dashboard');
      } else if (result.requires_2fa && result.user_id) {
        // Usuario tiene 2FA, mostrar pantalla de verificación
        setRequires2FA(true);
        setPending2FAUserId(result.user_id);
      } else {
        setError(result.error || 'Credenciales inválidas');
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handle2FAVerify = async (code: string) => {
    if (!pending2FAUserId) {
      return { success: false, error: 'Error interno' };
    }

    const result = await verify2FA(pending2FAUserId, code);
    if (result.success) {
      router.push('/dashboard');
    }
    return result;
  };

  const handleBack2FA = () => {
    setRequires2FA(false);
    setPending2FAUserId(null);
    setPassword('');
    setError('');
  };

  const handleDemoLogin = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  // Mostrar loading mientras verifica auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: theme.primary }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título (solo si no está en 2FA) */}
        {!requires2FA && (
          <div className="text-center mb-8">
            {branding.logo.type === 'image' ? (
              <div className="inline-flex items-center justify-center mb-4">
                <Image
                  src={branding.logo.imagePath}
                  alt={branding.logo.imageAlt}
                  width={64}
                  height={64}
                  className="rounded-2xl shadow-lg"
                />
              </div>
            ) : (
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  boxShadow: `0 10px 15px -3px ${theme.primary}30`,
                }}
              >
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-white">
              {branding.companyName}
              <span style={{ color: theme.accent }}>{branding.companySubtitle}</span>
            </h1>
            <p className="text-slate-400 mt-2">{branding.systemName}</p>
          </div>
        )}

        {/* Card de login / 2FA */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/10">
          {requires2FA ? (
            /* Pantalla de verificación 2FA */
            <TwoFactorVerify
              userId={pending2FAUserId!}
              onVerify={handle2FAVerify}
              onBack={handleBack2FA}
              isLoading={isSubmitting}
              theme={theme}
            />
          ) : (
            /* Formulario de login normal */
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Usuario */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                    Usuario
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingrese su usuario"
                      className={cn(
                        'block w-full pl-10 pr-4 py-3 rounded-xl',
                        'bg-slate-800/50 border border-slate-700',
                        'text-white placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:border-transparent',
                        'transition-all duration-200'
                      )}
                      style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingrese su contraseña"
                      className={cn(
                        'block w-full pl-10 pr-12 py-3 rounded-xl',
                        'bg-slate-800/50 border border-slate-700',
                        'text-white placeholder-slate-500',
                        'focus:outline-none focus:ring-2 focus:border-transparent',
                        'transition-all duration-200'
                      )}
                      style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
                      required
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting || !username || !password}
                  className={cn(
                    'w-full py-3 px-4 rounded-xl font-medium text-white',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200 transform hover:scale-[1.02]',
                    'flex items-center justify-center gap-2'
                  )}
                  style={{
                    background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                    '--tw-ring-color': theme.primary,
                  } as React.CSSProperties}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </form>

              {/* Tabla de Credenciales Demo */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">Credenciales Demo - CardSystem</h3>
                <div className="overflow-x-auto rounded-lg border border-slate-700/50">
                  <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/80 border-b border-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Rol</th>
                        <th className="px-4 py-3 font-semibold">Usuario</th>
                        <th className="px-4 py-3 font-semibold">Contraseña</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50 bg-slate-800/20">
                      <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => handleDemoLogin('admin', 'admin123')}>
                        <td className="px-4 py-3 font-medium text-white group-hover:text-blue-300 transition-colors">Admin</td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">admin</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">admin123</span></td>
                      </tr>
                      <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => handleDemoLogin('tsys_user', 'tsys123')}>
                        <td className="px-4 py-3 font-medium text-white group-hover:text-blue-300 transition-colors">Almacén</td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">tsys_user</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">tsys123</span></td>
                      </tr>
                      <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => handleDemoLogin('dist_user', 'dist123')}>
                        <td className="px-4 py-3 font-medium text-white group-hover:text-blue-300 transition-colors">Logística</td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">dist_user</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">dist123</span></td>
                      </tr>
                      <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => handleDemoLogin('mod_user', 'mod123')}>
                        <td className="px-4 py-3 font-medium text-white group-hover:text-blue-300 transition-colors">Sucursales</td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">mod_user</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">mod123</span></td>
                      </tr>
                      <tr className="hover:bg-slate-700/30 transition-colors cursor-pointer group" onClick={() => handleDemoLogin('director', 'dir123')}>
                        <td className="px-4 py-3 font-medium text-white group-hover:text-blue-300 transition-colors">Consulta</td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">director</span></td>
                        <td className="px-4 py-3"><span className="font-mono text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">dir123</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!requires2FA && (
          <p className="text-center text-slate-500 text-sm mt-6">{branding.systemDescription}</p>
        )}
      </div>
    </div>
  );
}
