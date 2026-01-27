'use client';

import { useState } from 'react';
import { AlertCircle, User, Mail, Shield, Building2, Lock, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/stores/userStore';
import { useToast } from '@/components/ui/Toast';

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

interface NuevoUsuarioFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  nombre: string;
  username: string;
  email: string;
  rol: string;
  area: string;
  password?: string;
  confirmPassword?: string;
}

export function NuevoUsuarioForm({ onSuccess, onCancel }: NuevoUsuarioFormProps) {
  // const crearUsuario = useUserStore((state) => state.crearUsuario); // Deprecated: usar API
  const { success } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    username: '',
    email: '',
    rol: 'Consulta', // Valor por defecto seguro
    area: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<Partial<FormData & { general: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData & { general: string }> = {};

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
    
    // Validaciones de contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          rol: formData.rol,
          area: formData.area,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }
      
      // Usar toast de éxito
      if (success) {
        success('Usuario creado', `El usuario ${formData.username} ha sido creado exitosamente.`);
      } else {
        alert('Usuario creado exitosamente');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error creating user:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: error instanceof Error ? error.message : 'Error al crear usuario' 
      }));
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
      
      {/* Contraseña y Confirmación */}
      <div className="grid grid-cols-2 gap-4">
        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Mín. 8 caracteres"
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.password ? 'border-red-300' : 'border-slate-200'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.password}
            </p>
          )}
        </div>
        
        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirmar <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Repetir contraseña"
              className={cn(
                'w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white text-slate-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.confirmPassword ? 'border-red-300' : 'border-slate-200'
              )}
            />
             <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
      
      {/* Error General */}
      {errors.general && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {errors.general}
        </div>
      )}

      {/* Info */}

      <div className="p-3 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          El usuario se creará como <span className="font-medium">Activo</span> por defecto.
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
          {isSubmitting ? 'Creando...' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
}

