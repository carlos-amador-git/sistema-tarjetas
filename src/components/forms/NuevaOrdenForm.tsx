'use client';

import { useState } from 'react';
import { Save, AlertCircle, Package } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useInventoryStore } from '@/stores/inventoryStore';
import { useAuth } from '@/hooks/useAuth';
import { PRODUCTOS } from '@/data/mockData';

interface NuevaOrdenFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  productoId: string;
  cantidad: string;
  area: string;
  observaciones: string;
}

const AREAS = [
  { id: 'almacen', nombre: 'Almacén Central' },
  { id: 'logistica', nombre: 'Logística' },
  { id: 'sucursales', nombre: 'Sucursales' },
];

export function NuevaOrdenForm({ onSuccess, onCancel }: NuevaOrdenFormProps) {
  const { user } = useAuth();
  const crearOrden = useInventoryStore((state) => state.crearOrden);

  const [formData, setFormData] = useState<FormData>({
    productoId: '',
    cantidad: '',
    area: '',
    observaciones: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener producto seleccionado para calcular costo
  const productoSeleccionado = PRODUCTOS.find((p) => p.id === formData.productoId);
  const cantidad = parseInt(formData.cantidad) || 0;
  const costoTotal = productoSeleccionado ? productoSeleccionado.precio * cantidad : 0;

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.productoId) {
      newErrors.productoId = 'Seleccione un producto';
    }

    if (!formData.cantidad || parseInt(formData.cantidad) <= 0) {
      newErrors.cantidad = 'Ingrese una cantidad válida';
    }

    if (!formData.area) {
      newErrors.area = 'Seleccione un área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500));

      const areaSeleccionada = AREAS.find((a) => a.id === formData.area);

      // Crear orden en el store
      crearOrden({
        fecha: new Date().toISOString().split('T')[0],
        productoId: formData.productoId,
        producto: productoSeleccionado?.nombre || '',
        cantidad: parseInt(formData.cantidad),
        solicitante: user?.nombre || 'Sistema',
        area: areaSeleccionada?.nombre || '',
        estatus: 'PENDIENTE',
        costoTotal,
      });

      onSuccess();
    } catch (error) {
      console.error('Error al crear orden:', error);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Producto */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Producto <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.productoId}
          onChange={(e) => handleInputChange('productoId', e.target.value)}
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.productoId ? 'border-red-300' : 'border-slate-200'
          )}
        >
          <option value="">Seleccione un producto...</option>
          {PRODUCTOS.filter((p) => p.activo).map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} - {p.nombre} (${formatNumber(p.precio)}/u)
            </option>
          ))}
        </select>
        {errors.productoId && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.productoId}
          </p>
        )}
      </div>

      {/* Cantidad y Área en grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cantidad <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.cantidad}
            onChange={(e) => handleInputChange('cantidad', e.target.value)}
            placeholder="0"
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.cantidad ? 'border-red-300' : 'border-slate-200'
            )}
          />
          {errors.cantidad && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.cantidad}
            </p>
          )}
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Área Destino <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.area}
            onChange={(e) => handleInputChange('area', e.target.value)}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.area ? 'border-red-300' : 'border-slate-200'
            )}
          >
            <option value="">Seleccione...</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
          {errors.area && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.area}
            </p>
          )}
        </div>
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Observaciones (Opcional)
        </label>
        <textarea
          value={formData.observaciones}
          onChange={(e) => handleInputChange('observaciones', e.target.value)}
          placeholder="Notas adicionales para esta orden..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Resumen de Costo */}
      {productoSeleccionado && cantidad > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium text-blue-900">Resumen de Orden</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-blue-800">
              <span>Producto:</span>
              <span className="font-medium">{productoSeleccionado.nombre}</span>
            </div>
            <div className="flex justify-between text-blue-800">
              <span>Precio unitario:</span>
              <span>${formatNumber(productoSeleccionado.precio)}</span>
            </div>
            <div className="flex justify-between text-blue-800">
              <span>Cantidad:</span>
              <span>{formatNumber(cantidad)} unidades</span>
            </div>
            <div className="border-t border-blue-200 pt-2 mt-2">
              <div className="flex justify-between text-blue-900 font-bold">
                <span>Costo Total:</span>
                <span>${formatNumber(costoTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white',
            'bg-[var(--brand-primary,#3b82f6)] hover:bg-[var(--brand-secondary,#1e40af)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
        >
          <Save className="h-5 w-5" />
          {isSubmitting ? 'Creando...' : 'Crear Orden'}
        </button>
      </div>
    </form>
  );
}

export default NuevaOrdenForm;
