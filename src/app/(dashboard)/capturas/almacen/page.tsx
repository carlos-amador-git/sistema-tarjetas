'use client';

import { useState } from 'react';
import { Save, Package, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MODULE_TITLES, getProductosAlmacen } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useToast } from '@/components/ui/Toast';

// Productos centralizados para almacén
const PRODUCTOS = getProductosAlmacen();

interface FormData {
  producto: string;
  bovedaTrabajo: string;
  bovedaPrincipal: string;
}

export default function CapturaAlmacenPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const registrarCapturaAlmacen = useInventoryStore((state) => state.registrarCapturaAlmacen);
  const [formData, setFormData] = useState<FormData>({
    producto: 'TC-001',
    bovedaTrabajo: '15207',
    bovedaPrincipal: '26400',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.producto) {
      newErrors.producto = 'Seleccione un producto';
    }

    if (!formData.bovedaTrabajo || parseInt(formData.bovedaTrabajo) < 0) {
      newErrors.bovedaTrabajo = 'Ingrese un valor válido';
    }

    if (!formData.bovedaPrincipal || parseInt(formData.bovedaPrincipal) < 0) {
      newErrors.bovedaPrincipal = 'Ingrese un valor válido';
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

      // Registrar en el store global (actualiza balance + genera historial)
      registrarCapturaAlmacen({
        productoId: formData.producto,
        bovedaTrabajo: parseInt(formData.bovedaTrabajo) || 0,
        bovedaPrincipal: parseInt(formData.bovedaPrincipal) || 0,
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        usuario: user?.nombre || 'Sistema',
      });

      success('Captura guardada', `Inventario de ${productoNombre} actualizado correctamente`);
      setFormData({ producto: '', bovedaTrabajo: '', bovedaPrincipal: '' });
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
    (parseInt(formData.bovedaTrabajo) || 0) + (parseInt(formData.bovedaPrincipal) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{MODULE_TITLES['captura-almacen']}</h1>
        <p className="text-slate-500 mt-1">Registre el inventario físico del almacén central</p>
      </div>

      {/* Info del usuario */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Package className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-blue-900">Capturando como: {user?.nombre}</p>
          <p className="text-sm text-blue-700">Área: {user?.area}</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Producto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Producto <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.producto}
              onChange={(e) => handleInputChange('producto', e.target.value)}
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
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

          {/* Bóveda de Trabajo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bóveda de Trabajo <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.bovedaTrabajo}
              onChange={(e) => handleInputChange('bovedaTrabajo', e.target.value)}
              placeholder="0"
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.bovedaTrabajo ? 'border-red-300' : 'border-slate-200'
              )}
            />
            {errors.bovedaTrabajo && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.bovedaTrabajo}
              </p>
            )}
          </div>

          {/* Bóveda Principal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bóveda Principal <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.bovedaPrincipal}
              onChange={(e) => handleInputChange('bovedaPrincipal', e.target.value)}
              placeholder="0"
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.bovedaPrincipal ? 'border-red-300' : 'border-slate-200'
              )}
            />
            {errors.bovedaPrincipal && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.bovedaPrincipal}
              </p>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total Inventario:</span>
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
              'bg-[var(--brand-primary,#3b82f6)] hover:bg-[var(--brand-secondary,#1e40af)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary,#3b82f6)] focus:ring-offset-2',
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
