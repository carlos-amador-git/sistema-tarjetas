'use client';

/**
 * Componente de Verificación 2FA
 *
 * Modal para ingresar el código TOTP durante el login.
 */

import { useState, useRef, useEffect } from 'react';
import { Shield, ArrowLeft, Loader2, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TwoFactorVerifyProps {
  userId: number;
  onVerify: (code: string) => Promise<{ success: boolean; error?: string }>;
  onBack: () => void;
  isLoading?: boolean;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function TwoFactorVerify({
  userId,
  onVerify,
  onBack,
  isLoading = false,
  theme,
}: TwoFactorVerifyProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus en el primer input al montar
  useEffect(() => {
    if (!useBackupCode) {
      inputRefs.current[0]?.focus();
    }
  }, [useBackupCode]);

  const handleChange = (index: number, value: string) => {
    // Solo permitir dígitos
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Solo el último dígito
    setCode(newCode);
    setError('');

    // Auto-focus al siguiente campo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando se completa
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    // Si son 6 dígitos, llenar todos los campos
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      setError('');
      inputRefs.current[5]?.focus();

      // Auto-submit
      setTimeout(() => handleSubmit(pastedData), 100);
    }
  };

  const handleSubmit = async (codeToVerify?: string) => {
    const verifyCode = codeToVerify || (useBackupCode ? backupCode : code.join(''));

    if (!useBackupCode && verifyCode.length !== 6) {
      setError('Ingrese el código de 6 dígitos');
      return;
    }

    if (useBackupCode && verifyCode.length !== 8) {
      setError('Ingrese el código de respaldo de 8 caracteres');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const result = await onVerify(verifyCode);
      if (!result.success) {
        setError(result.error || 'Código inválido');
        // Limpiar el código si falla
        if (!useBackupCode) {
          setCode(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setIsVerifying(false);
    }
  };

  const loading = isLoading || isVerifying;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-4"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
          }}
        >
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Verificación en dos pasos</h2>
        <p className="text-slate-400 text-sm mt-2">
          {useBackupCode
            ? 'Ingrese uno de sus códigos de respaldo'
            : 'Ingrese el código de su aplicación de autenticación'}
        </p>
      </div>

      {/* Código TOTP */}
      {!useBackupCode ? (
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              className={cn(
                'w-12 h-14 text-center text-2xl font-bold rounded-xl',
                'bg-slate-800/50 border border-slate-700',
                'text-white',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'transition-all duration-200',
                'disabled:opacity-50'
              )}
              style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
            />
          ))}
        </div>
      ) : (
        /* Código de respaldo */
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={backupCode}
            onChange={(e) => {
              setBackupCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="XXXXXXXX"
            maxLength={8}
            disabled={loading}
            className={cn(
              'block w-full pl-10 pr-4 py-3 rounded-xl',
              'bg-slate-800/50 border border-slate-700',
              'text-white placeholder-slate-500 text-center text-lg font-mono tracking-widest',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'transition-all duration-200'
            )}
            style={{ '--tw-ring-color': theme.primary } as React.CSSProperties}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Botón verificar (solo para código de respaldo o manual) */}
      {useBackupCode && (
        <button
          onClick={() => handleSubmit()}
          disabled={loading || backupCode.length !== 8}
          className={cn(
            'w-full py-3 px-4 rounded-xl font-medium text-white',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-all duration-200',
            'flex items-center justify-center gap-2'
          )}
          style={{
            background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <Shield className="h-5 w-5" />
              Verificar código
            </>
          )}
        </button>
      )}

      {/* Toggle entre TOTP y código de respaldo */}
      <button
        onClick={() => {
          setUseBackupCode(!useBackupCode);
          setError('');
          setBackupCode('');
          setCode(['', '', '', '', '', '']);
        }}
        disabled={loading}
        className="w-full text-sm text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
      >
        {useBackupCode ? 'Usar código de la app' : '¿No tiene acceso? Use un código de respaldo'}
      </button>

      {/* Botón volver */}
      <button
        onClick={onBack}
        disabled={loading}
        className={cn(
          'w-full py-2 px-4 rounded-xl font-medium',
          'bg-slate-800/50 text-slate-400',
          'hover:bg-slate-700/50 hover:text-slate-300',
          'border border-slate-700/50',
          'transition-all duration-200',
          'flex items-center justify-center gap-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio de sesión
      </button>
    </div>
  );
}

export default TwoFactorVerify;
