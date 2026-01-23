'use client';

import { useState } from 'react';
import { Save, Building2, AlertCircle, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MODULE_TITLES, getProductosSucursales, SUCURSALES } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useToast } from '@/components/ui/Toast';

// Productos centralizados para sucursales
const PRODUCTOS = getProductosSucursales();

interface FormData {
  producto: string;
  sucursal: string;
  enModulo: string;
  enBoveda: string;
  observaciones: string;
}

export default function CapturaSucursalesPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const registrarCapturaSucursal = useInventoryStore((state) => state.registrarCapturaSucursal);
  const [formData, setFormData] = useState<FormData>({
    producto: 'TD-001',
    sucursal: 'SUC-001',
    enModulo: '15000',
    enBoveda: '3000',
    observaciones: 'Inventario actualizado - Sucursal Centro',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.producto) {
      newErrors.producto = 'Seleccione un producto';
    }

    if (!formData.sucursal) {
      newErrors.sucursal = 'Seleccione una sucursal';
    }

    if (!formData.enModulo || parseInt(formData.enModulo) < 0) {
      newErrors.enModulo = 'Ingrese un valor válido';
    }

    if (!formData.enBoveda || parseInt(formData.enBoveda) < 0) {
      newErrors.enBoveda = 'Ingrese un valor válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simular envío al backend
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Obtener nombre del producto para el toast
      const productoNombre = PRODUCTOS.find(p => p.id === formData.producto)?.nombre || formData.producto;
      const sucursalNombre = SUCURSALES.find(s => s.id === formData.sucursal)?.nombre || formData.sucursal;

      // Registrar en el store global (actualiza balance + genera historial)
      // enModulo → colocacion, enBoveda → stock (nomenclatura del store)
      registrarCapturaSucursal({
        productoId: formData.producto,
        sucursalId: formData.sucursal,
        colocacion: parseInt(formData.enModulo) || 0,
        stock: parseInt(formData.enBoveda) || 0,
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        usuario: user?.nombre || 'Sistema',
      });

      success('Captura guardada', `Inventario de ${productoNombre} en ${sucursalNombre} actualizado`);
      setFormData({ producto: '', sucursal: '', enModulo: '', enBoveda: '', observaciones: '' });
    } catch {
      showError('Error al guardar', 'No se pudo registrar la captura. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const total =
    (parseInt(formData.enModulo) || 0) + (parseInt(formData.enBoveda) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{MODULE_TITLES['captura-sucursales']}</h1>
        <p className="text-slate-500 mt-1">Registre el inventario disponible en sucursales</p>
      </div>

      {/* Info del usuario */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Building2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="font-medium text-emerald-900">Capturando como: {user?.nombre}</p>
          <p className="text-sm text-emerald-700">Área: {user?.area}</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sucursal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sucursal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={formData.sucursal}
                onChange={(e) => handleInputChange('sucursal', e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-slate-700',
                  'focus:outline-none focus:ring-2 focus:ring-emerald-500',
                  errors.sucursal ? 'border-red-300' : 'border-slate-200'
                )}
              >
                <option value="">Seleccione sucursal...</option>
                {SUCURSALES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} - {s.nombre}
                  </option>
                ))}
              </select>
            </div>
            {errors.sucursal && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.sucursal}
              </p>
            )}
          </div>

          {/* Producto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Producto <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.producto}
              onChange={(e) => handleInputChange('producto', e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500',
                errors.producto ? 'border-red-300' : 'border-slate-200'
              )}
            >
              <option value="">Seleccione un producto...</option>
              {PRODUCTOS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.nombre}
                </option>
              ))}
            </select>
            {errors.producto && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.producto}
              </p>
            )}
          </div>

          {/* En Módulo de Atención */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              En Módulo de Atención <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.enModulo}
              onChange={(e) => handleInputChange('enModulo', e.target.value)}
              placeholder="0"
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500',
                errors.enModulo ? 'border-red-300' : 'border-slate-200'
              )}
            />
            {errors.enModulo && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.enModulo}
              </p>
            )}
          </div>

          {/* En Bóveda de Sucursal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              En Bóveda de Sucursal <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.enBoveda}
              onChange={(e) => handleInputChange('enBoveda', e.target.value)}
              placeholder="0"
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500',
                errors.enBoveda ? 'border-red-300' : 'border-slate-200'
              )}
            />
            {errors.enBoveda && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.enBoveda}
              </p>
            )}
          </div>

          {/* Observaciones */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Observaciones (Opcional)
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => handleInputChange('observaciones', e.target.value)}
              placeholder="Notas adicionales sobre el inventario..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Total */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total Inventario Sucursal:</span>
            <span className="text-2xl font-bold text-slate-800">{formatNumber(total)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white',
              'bg-emerald-500 hover:bg-emerald-600',
              'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200'
            )}
          >
            <Save className="h-5 w-5" />
            {isSubmitting ? 'Guardando...' : 'Guardar Captura'}
          </button>
        </div>
      </form>
    </div>
  );
}
