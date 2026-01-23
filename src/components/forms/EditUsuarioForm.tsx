'use client';

import { useState } from 'react';
import { AlertCircle, User, Mail, Shield, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import type { Usuario } from '@/data/mockData';

const ROLES = [
  'Administrador',
  'Almacén Central',
  'Logística',
  'Sucursales',
  'Consulta',
];

const AREAS = [
  'Sistemas',
  'Almacén',
  'Distribución',
  'Módulos',
  'Dirección',
  'Administración',
];

interface EditUsuarioFormProps {
  usuario: Usuario;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  nombre: string;
  username: string;
  email: string;
  rol: string;
  area: string;
}

export function EditUsuarioForm({ usuario, onSuccess, onCancel }: EditUsuarioFormProps) {
  const actualizarUsuario = useUserStore((state) => state.actualizarUsuario);

  const [formData, setFormData] = useState<FormData>({
    nombre: usuario.nombre,
    username: usuario.username,
    email: usuario.email,
    rol: usuario.rol,
    area: usuario.area,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un email válido';
    }

    if (!formData.rol) {
      newErrors.rol = 'Seleccione un rol';
    }

    if (!formData.area) {
      newErrors.area = 'Seleccione un área';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 300));

      actualizarUsuario(usuario.id, formData);
      onSuccess();
    } catch {
      console.error('Error al actualizar usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre Completo <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) => handleInputChange('nombre', e.target.value)}
            placeholder="Nombre del usuario"
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

      {/* Usuario */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Usuario <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder="nombre_usuario"
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.username ? 'border-red-300' : 'border-slate-200'
            )}
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.username}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="usuario@empresa.com"
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              errors.email ? 'border-red-300' : 'border-slate-200'
            )}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.email}
          </p>
        )}
      </div>

      {/* Rol y Área en grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Rol <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={formData.rol}
              onChange={(e) => handleInputChange('rol', e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.rol ? 'border-red-300' : 'border-slate-200'
              )}
            >
              <option value="">Seleccionar...</option>
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>
          {errors.rol && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.rol}
            </p>
          )}
        </div>

        {/* Área */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Área <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.area ? 'border-red-300' : 'border-slate-200'
              )}
            >
              <option value="">Seleccionar...</option>
              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          {errors.area && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.area}
            </p>
          )}
        </div>
      </div>

      {/* Estado actual */}
      <div className="p-3 bg-slate-50 rounded-xl">
        <p className="text-sm text-slate-600">
          Estado actual:{' '}
          <span className={cn('font-medium', usuario.activo ? 'text-green-600' : 'text-slate-500')}>
            {usuario.activo ? 'Activo' : 'Inactivo'}
          </span>
        </p>
        <p className="text-xs text-slate-500 mt-1">
          El estado se puede cambiar desde la lista de usuarios
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
            'px-6 py-2 bg-[var(--brand-primary,#3b82f6)] text-white rounded-xl font-medium',
            'hover:bg-[var(--brand-secondary,#1e40af)] transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  );
}
