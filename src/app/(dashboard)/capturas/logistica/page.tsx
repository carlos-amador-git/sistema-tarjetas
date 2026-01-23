'use client';

import { useState } from 'react';
import { Save, Truck, AlertCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { MODULE_TITLES, getProductosLogistica, DESTINOS } from '@/config';
import { cn, formatNumber } from '@/lib/utils';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useToast } from '@/components/ui/Toast';

// Productos centralizados para logística
const PRODUCTOS = getProductosLogistica();

interface FormData {
  producto: string;
  destino: string;
  enTransito: string;
  enBodega: string;
  referencia: string;
}

export default function CapturaLogisticaPage() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const registrarCapturaLogistica = useInventoryStore((state) => state.registrarCapturaLogistica);
  const [formData, setFormData] = useState<FormData>({
    producto: 'WK-001',
    destino: 'Z-NORTE',
    enTransito: '2000',
    enBodega: '3000',
    referencia: 'ENV-2026-050',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.producto) {
      newErrors.producto = 'Seleccione un producto';
    }

    if (!formData.destino) {
      newErrors.destino = 'Seleccione un destino';
    }

    if (!formData.enTransito || parseInt(formData.enTransito) < 0) {
      newErrors.enTransito = 'Ingrese un valor válido';
    }

    if (!formData.enBodega || parseInt(formData.enBodega) < 0) {
      newErrors.enBodega = 'Ingrese un valor válido';
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
      registrarCapturaLogistica({
        productoId: formData.producto,
        destinoId: formData.destino,
        colocacion: parseInt(formData.enTransito) || 0,
        normal: parseInt(formData.enBodega) || 0,
        fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
        usuario: user?.nombre || 'Sistema',
      });

      success('Captura guardada', `Inventario de ${productoNombre} en logística actualizado`);
      setFormData({ producto: '', destino: '', enTransito: '', enBodega: '', referencia: '' });
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
    (parseInt(formData.enTransito) || 0) + (parseInt(formData.enBodega) || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{MODULE_TITLES['captura-logistica']}</h1>
        <p className="text-slate-500 mt-1">Registre el inventario en tránsito y bodegas de distribución</p>
      </div>

      {/* Info del usuario */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Truck className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <p className="font-medium text-purple-900">Capturando como: {user?.nombre}</p>
          <p className="text-sm text-purple-700">Área: {user?.area}</p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                'focus:outline-none focus:ring-2 focus:ring-purple-500',
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

          {/* Destino */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Zona de Destino <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={formData.destino}
                onChange={(e) => handleInputChange('destino', e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-slate-700',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500',
                  errors.destino ? 'border-red-300' : 'border-slate-200'
                )}
              >
                <option value="">Seleccione zona...</option>
                {DESTINOS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            {errors.destino && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.destino}
              </p>
            )}
          </div>

          {/* En Tránsito */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              En Tránsito <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.enTransito}
              onChange={(e) => handleInputChange('enTransito', e.target.value)}
              placeholder="0"
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-purple-500',
                errors.enTransito ? 'border-red-300' : 'border-slate-200'
              )}
            />
            {errors.enTransito && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.enTransito}
              </p>
            )}
          </div>

          {/* En Bodega */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              En Bodega Distribución <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.enBodega}
              onChange={(e) => handleInputChange('enBodega', e.target.value)}
              placeholder="0"
              className={cn(
                'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-purple-500',
                errors.enBodega ? 'border-red-300' : 'border-slate-200'
              )}
            />
            {errors.enBodega && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.enBodega}
              </p>
            )}
          </div>

          {/* Referencia de Envío */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Referencia de Envío (Opcional)
            </label>
            <input
              type="text"
              value={formData.referencia}
              onChange={(e) => handleInputChange('referencia', e.target.value)}
              placeholder="Ej: ENV-2026-001"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Total */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Total Inventario Logística:</span>
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
              'bg-purple-500 hover:bg-purple-600',
              'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
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
