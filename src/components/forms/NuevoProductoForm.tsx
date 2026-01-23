'use client';

import { useState } from 'react';
import { AlertCircle, Package, DollarSign, Layers, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductStore } from '@/stores/productStore';
import type { Producto } from '@/data/mockData';

const CATEGORIAS: { value: Producto['categoria']; label: string }[] = [
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'kit', label: 'Kit' },
  { value: 'etiqueta', label: 'Etiqueta' },
  { value: 'sobre', label: 'Sobre' },
  { value: 'otro', label: 'Otro' },
];

const AREAS: { value: 'almacen' | 'logistica' | 'sucursales'; label: string }[] = [
  { value: 'almacen', label: 'Almacén' },
  { value: 'logistica', label: 'Logística' },
  { value: 'sucursales', label: 'Sucursales' },
];

interface NuevoProductoFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  nombre: string;
  categoria: Producto['categoria'] | '';
  areas: Producto['areas'];
  stock: string;
  stockMinimo: string;
  precio: string;
}

export function NuevoProductoForm({ onSuccess, onCancel }: NuevoProductoFormProps) {
  const crearProducto = useProductStore((state) => state.crearProducto);

  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    categoria: '',
    areas: [],
    stock: '',
    stockMinimo: '',
    precio: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Seleccione una categoría';
    }

    if (formData.areas.length === 0) {
      newErrors.areas = 'Seleccione al menos un área';
    }

    const stock = parseInt(formData.stock);
    if (isNaN(stock) || stock < 0) {
      newErrors.stock = 'Ingrese un stock inicial válido';
    }

    const stockMinimo = parseInt(formData.stockMinimo);
    if (isNaN(stockMinimo) || stockMinimo < 0) {
      newErrors.stockMinimo = 'Ingrese un valor válido';
    }

    const precio = parseFloat(formData.precio);
    if (isNaN(precio) || precio < 0) {
      newErrors.precio = 'Ingrese un precio válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | Producto['categoria'] | Producto['areas']) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAreaToggle = (area: 'almacen' | 'logistica' | 'sucursales') => {
    const newAreas = formData.areas.includes(area)
      ? formData.areas.filter((a) => a !== area)
      : [...formData.areas, area];
    handleInputChange('areas', newAreas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      crearProducto({
        nombre: formData.nombre,
        categoria: formData.categoria as Producto['categoria'],
        areas: formData.areas,
        stock: parseInt(formData.stock),
        stockMinimo: parseInt(formData.stockMinimo),
        precio: parseFloat(formData.precio),
      });
      onSuccess();
    } catch {
      console.error('Error al crear producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Nombre del producto"
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.nombre ? 'border-red-300' : 'border-slate-200'
            )}
          />
        </div>
        {errors.nombre && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.nombre}
          </p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Categoría <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select
            value={formData.categoria}
            onChange={(e) => handleInputChange('categoria', e.target.value as Producto['categoria'])}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.categoria ? 'border-red-300' : 'border-slate-200'
            )}
          >
            <option value="">Seleccionar categoría...</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        {errors.categoria && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.categoria}
          </p>
        )}
      </div>

      {/* Áreas */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Áreas donde aplica <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((area) => (
            <button
              key={area.value}
              type="button"
              onClick={() => handleAreaToggle(area.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                formData.areas.includes(area.value)
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200'
              )}
            >
              {area.label}
            </button>
          ))}
        </div>
        {errors.areas && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.areas}
          </p>
        )}
      </div>

      {/* Stock Inicial */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Stock Inicial <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="number"
            min="0"
            value={formData.stock}
            onChange={(e) => handleInputChange('stock', e.target.value)}
            placeholder="0"
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.stock ? 'border-red-300' : 'border-slate-200'
            )}
          />
        </div>
        {errors.stock && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.stock}
          </p>
        )}
      </div>

      {/* Stock Mínimo y Precio */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Stock Mínimo <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            value={formData.stockMinimo}
            onChange={(e) => handleInputChange('stockMinimo', e.target.value)}
            placeholder="0"
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.stockMinimo ? 'border-red-300' : 'border-slate-200'
            )}
          />
          {errors.stockMinimo && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.stockMinimo}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Precio Unitario <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={(e) => handleInputChange('precio', e.target.value)}
              placeholder="0.00"
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.precio ? 'border-red-300' : 'border-slate-200'
              )}
            />
          </div>
          {errors.precio && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.precio}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          El código del producto se generará automáticamente basado en la categoría seleccionada.
        </p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'px-6 py-2 bg-blue-500 text-white rounded-xl font-medium',
            'hover:bg-blue-600 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Creando...' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}
