'use client';

/**
 * Gestión de Usuarios
 *
 * Administración de usuarios con filtros, búsqueda y acciones.
 * Usa los nuevos componentes adaptables que respetan la configuración de UI.
 */

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Users,
  Edit2,
  Trash2,
  Shield,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Grid,
  List,
  Clock,
  Mail,
} from 'lucide-react';
import { MODULE_TITLES } from '@/config';
import { cn } from '@/lib/utils';
import { ROLES_COLORS } from '@/data/mockData';
import { useUserStore, useUsuarios } from '@/stores/userStore';
import { Modal } from '@/components/ui/Modal';
import { EditUsuarioForm } from '@/components/forms/EditUsuarioForm';
import { NuevoUsuarioForm } from '@/components/forms/NuevoUsuarioForm';
import { useToast } from '@/components/ui/Toast';
import { StatCard, StatusBadge } from '@/components/ui/DataDisplay';
import { useUISettings } from '@/components/ui/UISettings';
import { SkeletonUsers } from '@/components/ui/Skeleton';
import { EmptyStateNoUsers, EmptyStateNoResults } from '@/components/ui/EmptyState';
import type { Usuario } from '@/data/mockData';

// =============================================================================
// COMPONENTES INTERNOS
// =============================================================================

interface UserRowProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onToggleActivo: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
}

function UserRow({ usuario, onEdit, onToggleActivo, onDelete }: UserRowProps) {
  const { settings } = useUISettings();

  return (
    <tr
      className={cn(
        'transition-colors',
        'hover:bg-[var(--color-surface-hover,#f8fafc)]',
        settings.enableAnimations && 'animate-fade-in'
      )}
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold',
              'transition-all duration-200',
              usuario.activo
                ? 'bg-[var(--color-primary,#3b82f6)]'
                : 'bg-[var(--color-text-muted,#94a3b8)]'
            )}
          >
            {usuario.nombre.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-[var(--color-text,#1e293b)]">{usuario.nombre}</p>
            <p className="text-sm text-[var(--color-text-muted,#64748b)]">@{usuario.username}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            ROLES_COLORS[usuario.rol] || 'bg-slate-100 text-slate-700'
          )}
        >
          <Shield className="h-3 w-3" />
          {usuario.rol}
        </span>
      </td>
      <td className="px-4 py-4 text-[var(--color-text,#1e293b)]">{usuario.area}</td>
      <td className="px-4 py-4">
        <div className="flex justify-center">
          <StatusBadge
            text={usuario.activo ? 'Activo' : 'Inactivo'}
            variant={usuario.activo ? 'success' : 'warning'}
            size="sm"
          />
        </div>
      </td>
      <td className="px-4 py-4 text-[var(--color-text-muted,#64748b)] text-sm">
        {usuario.ultimoAcceso}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onEdit(usuario)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#94a3b8)]',
              'hover:text-[var(--color-primary,#3b82f6)]',
              'hover:bg-[var(--color-primary,#3b82f6)]/10'
            )}
            title="Editar usuario"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onToggleActivo(usuario)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              usuario.activo
                ? 'text-[var(--color-success,#16a34a)] hover:text-[var(--color-warning,#ca8a04)] hover:bg-[var(--color-warning,#ca8a04)]/10'
                : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-success,#16a34a)] hover:bg-[var(--color-success,#16a34a)]/10'
            )}
            title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
          >
            {usuario.activo ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onDelete(usuario)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'text-[var(--color-text-muted,#94a3b8)]',
              'hover:text-[var(--color-error,#dc2626)]',
              'hover:bg-[var(--color-error,#dc2626)]/10'
            )}
            title="Eliminar usuario"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

interface UserCardProps {
  usuario: Usuario;
  onEdit: (usuario: Usuario) => void;
  onToggleActivo: (usuario: Usuario) => void;
  onDelete: (usuario: Usuario) => void;
}

function UserCard({ usuario, onEdit, onToggleActivo, onDelete }: UserCardProps) {
  const { settings } = useUISettings();

  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-200',
        'bg-[var(--color-surface,#ffffff)]',
        'border border-[var(--color-border,#e2e8f0)]',
        !usuario.activo && 'opacity-60',
        settings.enableAnimations && 'hover:shadow-lg hover:scale-[1.02]'
      )}
    >
      {/* Header with Avatar and Status */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg',
            usuario.activo
              ? 'bg-[var(--color-primary,#3b82f6)]'
              : 'bg-[var(--color-text-muted,#94a3b8)]'
          )}
        >
          {usuario.nombre.charAt(0)}
        </div>
        <StatusBadge
          text={usuario.activo ? 'Activo' : 'Inactivo'}
          variant={usuario.activo ? 'success' : 'warning'}
          size="sm"
        />
      </div>

      {/* User Info */}
      <h3 className="font-semibold text-[var(--color-text,#1e293b)] mb-1">
        {usuario.nombre}
      </h3>
      <p className="text-sm text-[var(--color-text-muted,#64748b)] mb-3">
        @{usuario.username}
      </p>

      {/* Role Badge */}
      <div className="mb-4">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            ROLES_COLORS[usuario.rol] || 'bg-slate-100 text-slate-700'
          )}
        >
          <Shield className="h-3 w-3" />
          {usuario.rol}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-[var(--color-text,#1e293b)]">{usuario.area}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-[var(--color-text-muted,#64748b)] truncate">
            {usuario.email}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-[var(--color-text-muted,#64748b)]" />
          <span className="text-[var(--color-text-muted,#64748b)]">
            {usuario.ultimoAcceso}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
        <button
          onClick={() => onEdit(usuario)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 text-sm rounded-lg transition-colors',
            'text-[var(--color-primary,#3b82f6)]',
            'hover:bg-[var(--color-primary,#3b82f6)]/10'
          )}
        >
          <Edit2 className="h-4 w-4" />
          Editar
        </button>
        <button
          onClick={() => onToggleActivo(usuario)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            usuario.activo
              ? 'text-[var(--color-success,#16a34a)] hover:text-[var(--color-warning,#ca8a04)] hover:bg-[var(--color-warning,#ca8a04)]/10'
              : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-success,#16a34a)] hover:bg-[var(--color-success,#16a34a)]/10'
          )}
          title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
        >
          {usuario.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onDelete(usuario)}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'text-[var(--color-text-muted,#94a3b8)]',
            'hover:text-[var(--color-error,#dc2626)]',
            'hover:bg-[var(--color-error,#dc2626)]/10'
          )}
          title="Eliminar usuario"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// PÁGINA PRINCIPAL
// =============================================================================

export default function UsuariosPage() {
  const { settings } = useUISettings();
  const usuarios = useUsuarios();
  const toggleActivoUsuario = useUserStore((state) => state.toggleActivoUsuario);
  const eliminarUsuario = useUserStore((state) => state.eliminarUsuario);
  const { success, info } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  const roles = ['Todos', ...new Set(usuarios.map((u) => u.rol))];

  // Simular carga inicial
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRol = rolFilter === 'Todos' || usuario.rol === rolFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && usuario.activo) ||
      (statusFilter === 'inactive' && !usuario.activo);
    return matchesSearch && matchesRol && matchesStatus;
  });

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter((u) => u.activo).length,
    inactivos: usuarios.filter((u) => !u.activo).length,
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowEditModal(true);
  };

  const handleDeleteClick = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      const nombre = selectedUser.nombre;
      eliminarUsuario(selectedUser.id);
      success('Usuario eliminado', `${nombre} ha sido eliminado del sistema`);
      setShowDeleteConfirm(false);
      setSelectedUser(null);
    }
  };

  const handleToggleActivo = (usuario: Usuario) => {
    toggleActivoUsuario(usuario.id);
    const nuevoEstado = !usuario.activo;
    if (nuevoEstado) {
      success('Usuario activado', `${usuario.nombre} ahora puede acceder al sistema`);
    } else {
      info('Usuario desactivado', `${usuario.nombre} ya no puede acceder al sistema`);
    }
  };

  const handleCreateSuccess = () => {
    setShowNewModal(false);
    success('Usuario creado', 'El nuevo usuario ha sido registrado exitosamente');
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedUser(null);
    success('Usuario actualizado', 'Los cambios han sido guardados');
  };

  if (isLoading) {
    return <SkeletonUsers />;
  }

  return (
    <div className={cn('space-y-6', settings.enableAnimations && 'animate-fade-in')}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text,#1e293b)]">
            {MODULE_TITLES['usuarios']}
          </h1>
          <p className="text-[var(--color-text-muted,#64748b)] mt-1">
            Gestión de usuarios y permisos del sistema
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200',
            'bg-[var(--color-primary,#3b82f6)] text-white',
            'hover:bg-[var(--color-primary-dark,#2563eb)]',
            settings.enableAnimations && 'hover:scale-[1.02]'
          )}
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-3 gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
      >
        <StatCard
          title="Total Usuarios"
          value={stats.total}
          subtitle="Registrados"
          icon={<Users className="h-5 w-5" />}
          color="primary"
          onClick={() => setStatusFilter('all')}
          className={cn(statusFilter === 'all' && 'ring-2 ring-[var(--color-primary,#3b82f6)]')}
        />
        <StatCard
          title="Activos"
          value={stats.activos}
          subtitle="Con acceso"
          icon={<CheckCircle className="h-5 w-5" />}
          color="success"
          progress={{
            value: stats.activos,
            max: stats.total,
            label: `${Math.round((stats.activos / stats.total) * 100)}%`,
          }}
          onClick={() => setStatusFilter('active')}
          className={cn(statusFilter === 'active' && 'ring-2 ring-[var(--color-success,#16a34a)]')}
        />
        <StatCard
          title="Inactivos"
          value={stats.inactivos}
          subtitle="Sin acceso"
          icon={<XCircle className="h-5 w-5" />}
          color="warning"
          onClick={() => setStatusFilter('inactive')}
          className={cn(statusFilter === 'inactive' && 'ring-2 ring-[var(--color-warning,#ca8a04)]')}
        />
      </div>

      {/* Filters */}
      <div
        className={cn(
          'flex flex-col sm:flex-row items-stretch sm:items-center gap-4',
          settings.enableAnimations && 'animate-fade-in-up'
        )}
        style={{ animationDelay: '100ms' }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted,#94a3b8)]" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl transition-all duration-200',
              'bg-[var(--color-surface,#ffffff)]',
              'border border-[var(--color-border,#e2e8f0)]',
              'text-[var(--color-text,#1e293b)]',
              'placeholder-[var(--color-text-muted,#94a3b8)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
            )}
          />
        </div>
        <select
          value={rolFilter}
          onChange={(e) => setRolFilter(e.target.value)}
          className={cn(
            'px-4 py-2.5 rounded-xl transition-all duration-200',
            'bg-[var(--color-surface,#ffffff)]',
            'border border-[var(--color-border,#e2e8f0)]',
            'text-[var(--color-text,#1e293b)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary,#3b82f6)]'
          )}
        >
          {roles.map((rol) => (
            <option key={rol} value={rol}>
              {rol}
            </option>
          ))}
        </select>
        <div
          className={cn(
            'flex items-center p-1 rounded-xl',
            'bg-[var(--color-surface,#ffffff)]',
            'border border-[var(--color-border,#e2e8f0)]'
          )}
        >
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-[var(--color-primary,#3b82f6)]/10 text-[var(--color-primary,#3b82f6)]'
                : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-text,#1e293b)]'
            )}
            title="Vista lista"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-[var(--color-primary,#3b82f6)]/10 text-[var(--color-primary,#3b82f6)]'
                : 'text-[var(--color-text-muted,#94a3b8)] hover:text-[var(--color-text,#1e293b)]'
            )}
            title="Vista tarjetas"
          >
            <Grid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Users View */}
      <div
        className={cn(settings.enableAnimations && 'animate-fade-in-up')}
        style={{ animationDelay: '150ms' }}
      >
        {usuarios.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoUsers
              action={{
                label: 'Agregar usuario',
                onClick: () => setShowNewModal(true),
              }}
            />
          </div>
        ) : filteredUsuarios.length === 0 ? (
          <div className="rounded-2xl border border-[var(--color-border,#e2e8f0)] bg-[var(--color-surface,#ffffff)]">
            <EmptyStateNoResults
              action={{
                label: 'Limpiar filtros',
                onClick: () => {
                  setSearchTerm('');
                  setRolFilter('Todos');
                  setStatusFilter('all');
                },
                variant: 'secondary',
              }}
            />
          </div>
        ) : viewMode === 'list' ? (
          <div
            className={cn(
              'rounded-2xl overflow-hidden',
              'bg-[var(--color-surface,#ffffff)]',
              'border border-[var(--color-border,#e2e8f0)]'
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-surface-hover,#f8fafc)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Área
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Último Acceso
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-[var(--color-text-muted,#64748b)] uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border,#e2e8f0)]">
                  {filteredUsuarios.map((usuario) => (
                    <UserRow
                      key={usuario.id}
                      usuario={usuario}
                      onEdit={handleEdit}
                      onToggleActivo={handleToggleActivo}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredUsuarios.map((usuario) => (
              <UserCard
                key={usuario.id}
                usuario={usuario}
                onEdit={handleEdit}
                onToggleActivo={handleToggleActivo}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resumen */}
      {filteredUsuarios.length > 0 && (
        <div
          className={cn(
            'flex items-center justify-between px-4 py-3 rounded-xl',
            'bg-[var(--color-surface-hover,#f8fafc)]',
            'text-sm text-[var(--color-text-muted,#64748b)]'
          )}
        >
          <span>
            Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success,#16a34a)]" />
              {stats.activos} activos
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-text-muted,#94a3b8)]" />
              {stats.inactivos} inactivos
            </span>
          </div>
        </div>
      )}

      {/* Modal Nuevo Usuario */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Nuevo Usuario"
        size="md"
      >
        <NuevoUsuarioForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowNewModal(false)}
        />
      </Modal>

      {/* Modal Editar Usuario */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        title="Editar Usuario"
        size="md"
      >
        {selectedUser && (
          <EditUsuarioForm
            usuario={selectedUser}
            onSuccess={handleEditSuccess}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedUser(null);
        }}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-[var(--color-text,#1e293b)]">
            ¿Está seguro que desea eliminar al usuario{' '}
            <span className="font-medium">{selectedUser?.nombre}</span>?
          </p>
          <p className="text-sm text-[var(--color-error,#dc2626)]">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border,#e2e8f0)]">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedUser(null);
              }}
              className={cn(
                'px-4 py-2 rounded-xl transition-colors',
                'text-[var(--color-text,#1e293b)]',
                'hover:bg-[var(--color-surface-hover,#f1f5f9)]'
              )}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className={cn(
                'px-4 py-2 rounded-xl transition-colors',
                'bg-[var(--color-error,#dc2626)] text-white',
                'hover:bg-[var(--color-error-dark,#b91c1c)]'
              )}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
