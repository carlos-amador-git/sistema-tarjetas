'use client';

/**
 * Componente de Configuración 2FA
 *
 * Modal/Panel para configurar la autenticación de dos factores.
 * Muestra QR code, códigos de respaldo, y permite activar/desactivar.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  QrCode,
  Copy,
  Check,
  Loader2,
  AlertTriangle,
  Key,
  RefreshCw,
  X,
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (enabled: boolean) => void;
}

type SetupStep = 'status' | 'setup' | 'verify' | 'backup' | 'disable';

export function TwoFactorSetup({ isOpen, onClose, onStatusChange }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('status');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado de 2FA
  const [isEnabled, setIsEnabled] = useState(false);
  const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);

  // Datos de configuración
  const [setupData, setSetupData] = useState<{
    secret: string;
    qr_code: string;
    backup_codes: string[];
  } | null>(null);

  // Código de verificación
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');

  // UI helpers
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsLoading(true);
    setError('');
    try {
      const status = await authService.get2FAStatus();
      setIsEnabled(status.enabled);
      setBackupCodesRemaining(status.backup_codes_remaining);
      setStep('status');
    } catch {
      setError('Error al cargar estado de 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await authService.setup2FA();
      setSetupData(data);
      setStep('setup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (verifyCode.length !== 6) {
      setError('Ingrese un código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.enable2FA(verifyCode);
      setIsEnabled(true);
      setBackupCodesRemaining(setupData?.backup_codes.length || 10);
      setStep('backup');
      onStatusChange?.(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      setError('Ingrese un código de 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.disable2FA(disableCode);
      setIsEnabled(false);
      setBackupCodesRemaining(0);
      setSetupData(null);
      setStep('status');
      onStatusChange?.(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const code = prompt('Ingrese un código de su app de autenticación para regenerar los códigos de respaldo:');
    if (!code || code.length !== 6) {
      setError('Código inválido');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await authService.regenerateBackupCodes(code);
      setSetupData((prev) => prev ? { ...prev, backup_codes: result.backup_codes } : null);
      setBackupCodesRemaining(result.backup_codes.length);
      setStep('backup');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al regenerar códigos');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'codes') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedCodes(true);
        setTimeout(() => setCopiedCodes(false), 2000);
      }
    } catch {
      setError('Error al copiar al portapapeles');
    }
  };

  const handleClose = () => {
    setStep('status');
    setSetupData(null);
    setVerifyCode('');
    setDisableCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-5 w-5 text-[var(--brand-primary,#3b82f6)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Autenticación de dos factores
              </h2>
              <p className="text-sm text-slate-500">
                {isEnabled ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : step === 'status' ? (
            /* Estado actual */
            <div className="space-y-6">
              <div
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl',
                  isEnabled ? 'bg-green-50' : 'bg-amber-50'
                )}
              >
                {isEnabled ? (
                  <ShieldCheck className="h-10 w-10 text-green-600" />
                ) : (
                  <ShieldOff className="h-10 w-10 text-amber-600" />
                )}
                <div>
                  <h3 className={cn('font-medium', isEnabled ? 'text-green-900' : 'text-amber-900')}>
                    {isEnabled ? '2FA está activado' : '2FA está desactivado'}
                  </h3>
                  <p className={cn('text-sm', isEnabled ? 'text-green-700' : 'text-amber-700')}>
                    {isEnabled
                      ? `${backupCodesRemaining} códigos de respaldo restantes`
                      : 'Active 2FA para mayor seguridad'}
                  </p>
                </div>
              </div>

              {isEnabled ? (
                <div className="space-y-3">
                  <button
                    onClick={() => handleRegenerateBackupCodes()}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerar códigos de respaldo
                  </button>
                  <button
                    onClick={() => setStep('disable')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ShieldOff className="h-4 w-4" />
                    Desactivar 2FA
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartSetup}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--brand-primary,#3b82f6)] text-white hover:bg-[var(--brand-secondary,#1e40af)] transition-colors"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Activar 2FA
                </button>
              )}
            </div>
          ) : step === 'setup' && setupData ? (
            /* Configuración: QR Code */
            <div className="space-y-6">
              <div className="text-center">
                <QrCode className="h-8 w-8 mx-auto text-[var(--brand-primary,#3b82f6)] mb-2" />
                <h3 className="font-medium text-slate-900">Escanee el código QR</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Use Google Authenticator, Authy u otra app compatible
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-xl border-2 border-slate-100">
                  <Image
                    src={setupData.qr_code}
                    alt="QR Code para 2FA"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              </div>

              {/* Secret manual */}
              <div className="space-y-2">
                <p className="text-xs text-slate-500 text-center">
                  O ingrese el código manualmente:
                </p>
                <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
                  <code className="flex-1 text-sm font-mono text-slate-700 break-all">
                    {setupData.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(setupData.secret, 'secret')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {copiedSecret ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-500" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep('verify')}
                className="w-full py-3 px-4 rounded-xl bg-[var(--brand-primary,#3b82f6)] text-white hover:bg-[var(--brand-secondary,#1e40af)] transition-colors"
              >
                Continuar
              </button>
            </div>
          ) : step === 'verify' ? (
            /* Verificación del código */
            <div className="space-y-6">
              <div className="text-center">
                <Key className="h-8 w-8 mx-auto text-[var(--brand-primary,#3b82f6)] mb-2" />
                <h3 className="font-medium text-slate-900">Verifique la configuración</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ingrese el código de 6 dígitos de su app
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setVerifyCode(val);
                  setError('');
                }}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-widest py-4 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)] focus:border-transparent"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('setup')}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={verifyCode.length !== 6 || isLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-[var(--brand-primary,#3b82f6)] text-white hover:bg-[var(--brand-secondary,#1e40af)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    'Activar 2FA'
                  )}
                </button>
              </div>
            </div>
          ) : step === 'backup' && setupData ? (
            /* Códigos de respaldo */
            <div className="space-y-6">
              <div className="text-center">
                <ShieldCheck className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <h3 className="font-medium text-slate-900">2FA activado correctamente</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Guarde estos códigos de respaldo en un lugar seguro
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    Cada código solo puede usarse una vez. Si pierde acceso a su app de
                    autenticación, use estos códigos para iniciar sesión.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {setupData.backup_codes.map((code, index) => (
                    <code
                      key={index}
                      className="text-center py-2 px-3 bg-white rounded-lg font-mono text-sm text-slate-700"
                    >
                      {code}
                    </code>
                  ))}
                </div>

                <button
                  onClick={() =>
                    copyToClipboard(setupData.backup_codes.join('\n'), 'codes')
                  }
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-4 bg-white rounded-lg border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors text-sm"
                >
                  {copiedCodes ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiados
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar códigos
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-xl bg-[var(--brand-primary,#3b82f6)] text-white hover:bg-[var(--brand-secondary,#1e40af)] transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : step === 'disable' ? (
            /* Desactivar 2FA */
            <div className="space-y-6">
              <div className="text-center">
                <ShieldOff className="h-8 w-8 mx-auto text-red-600 mb-2" />
                <h3 className="font-medium text-slate-900">Desactivar 2FA</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Ingrese un código para confirmar la desactivación
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-700">
                  Al desactivar 2FA, su cuenta será menos segura. Solo haga esto si es
                  absolutamente necesario.
                </p>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={disableCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDisableCode(val);
                  setError('');
                }}
                placeholder="000000"
                className="w-full text-center text-2xl font-mono tracking-widest py-4 px-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('status')}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisable}
                  disabled={disableCode.length !== 6 || isLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    'Desactivar'
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {/* Error general */}
          {error && step === 'status' && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TwoFactorSetup;
