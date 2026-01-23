/**
 * Tests para userStore
 */

import { useUserStore } from '../userStore';

describe('userStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useUserStore.getState().resetToDefaults();
  });

  describe('Initial State', () => {
    it('debe tener usuarios iniciales', () => {
      const { usuarios } = useUserStore.getState();
      expect(Array.isArray(usuarios)).toBe(true);
      expect(usuarios.length).toBeGreaterThan(0);
    });

    it('debe tener nextUserId calculado correctamente', () => {
      const { usuarios, nextUserId } = useUserStore.getState();
      const maxId = Math.max(...usuarios.map((u) => u.id));
      expect(nextUserId).toBe(maxId + 1);
    });
  });

  describe('crearUsuario', () => {
    it('debe crear un nuevo usuario con ID único', () => {
      const { crearUsuario, usuarios } = useUserStore.getState();
      const usuariosAnteriorLength = usuarios.length;

      const nuevoId = crearUsuario({
        nombre: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        rol: 'Admin',
        area: 'Test Area',
      });

      const { usuarios: nuevosUsuarios } = useUserStore.getState();
      expect(nuevosUsuarios.length).toBe(usuariosAnteriorLength + 1);
      expect(typeof nuevoId).toBe('number');
    });

    it('debe crear usuario con activo=true por defecto', () => {
      const { crearUsuario } = useUserStore.getState();

      const nuevoId = crearUsuario({
        nombre: 'Active User',
        username: 'activeuser',
        email: 'active@example.com',
        rol: 'Usuario',
        area: 'Operaciones',
      });

      const { usuarios } = useUserStore.getState();
      const nuevoUsuario = usuarios.find((u) => u.id === nuevoId);
      expect(nuevoUsuario?.activo).toBe(true);
    });

    it('debe crear usuario con ultimoAcceso="Nunca"', () => {
      const { crearUsuario } = useUserStore.getState();

      const nuevoId = crearUsuario({
        nombre: 'New User',
        username: 'newuser',
        email: 'new@example.com',
        rol: 'Usuario',
        area: 'Soporte',
      });

      const { usuarios } = useUserStore.getState();
      const nuevoUsuario = usuarios.find((u) => u.id === nuevoId);
      expect(nuevoUsuario?.ultimoAcceso).toBe('Nunca');
    });

    it('debe agregar usuario al principio de la lista', () => {
      const { crearUsuario } = useUserStore.getState();

      const nuevoId = crearUsuario({
        nombre: 'First User',
        username: 'firstuser',
        email: 'first@example.com',
        rol: 'Admin',
        area: 'TI',
      });

      const { usuarios } = useUserStore.getState();
      expect(usuarios[0].id).toBe(nuevoId);
    });

    it('debe incrementar nextUserId', () => {
      const { crearUsuario, nextUserId: nextIdAnterior } = useUserStore.getState();

      crearUsuario({
        nombre: 'User',
        username: 'user',
        email: 'user@example.com',
        rol: 'Usuario',
        area: 'Area',
      });

      const { nextUserId: nuevoNextId } = useUserStore.getState();
      expect(nuevoNextId).toBe(nextIdAnterior + 1);
    });
  });

  describe('actualizarUsuario', () => {
    it('debe actualizar un usuario existente', () => {
      const { usuarios, actualizarUsuario } = useUserStore.getState();
      const usuario = usuarios[0];

      actualizarUsuario(usuario.id, {
        nombre: 'Nombre Actualizado',
        email: 'actualizado@example.com',
      });

      const { usuarios: usuariosActualizados } = useUserStore.getState();
      const usuarioActualizado = usuariosActualizados.find((u) => u.id === usuario.id);

      expect(usuarioActualizado?.nombre).toBe('Nombre Actualizado');
      expect(usuarioActualizado?.email).toBe('actualizado@example.com');
    });

    it('debe mantener propiedades no actualizadas', () => {
      const { usuarios, actualizarUsuario } = useUserStore.getState();
      const usuario = usuarios[0];
      const rolOriginal = usuario.rol;

      actualizarUsuario(usuario.id, { nombre: 'Otro Nombre' });

      const { usuarios: usuariosActualizados } = useUserStore.getState();
      const usuarioActualizado = usuariosActualizados.find((u) => u.id === usuario.id);

      expect(usuarioActualizado?.rol).toBe(rolOriginal);
    });

    it('no debe hacer nada si el usuario no existe', () => {
      const { usuarios, actualizarUsuario, lastUpdated } = useUserStore.getState();

      actualizarUsuario(99999, { nombre: 'No Existe' });

      const { usuarios: usuariosActualizados } = useUserStore.getState();
      expect(usuariosActualizados).toEqual(usuarios);
    });
  });

  describe('toggleActivoUsuario', () => {
    it('debe desactivar un usuario activo', () => {
      const { usuarios, toggleActivoUsuario } = useUserStore.getState();
      const usuarioActivo = usuarios.find((u) => u.activo);

      if (usuarioActivo) {
        toggleActivoUsuario(usuarioActivo.id);

        const { usuarios: usuariosActualizados } = useUserStore.getState();
        const usuarioToggled = usuariosActualizados.find((u) => u.id === usuarioActivo.id);
        expect(usuarioToggled?.activo).toBe(false);
      }
    });

    it('debe activar un usuario inactivo', () => {
      const { usuarios, toggleActivoUsuario, actualizarUsuario } = useUserStore.getState();
      const usuario = usuarios[0];

      // Primero desactivar
      actualizarUsuario(usuario.id, { activo: false });

      // Luego toggle (debería activar)
      toggleActivoUsuario(usuario.id);

      const { usuarios: usuariosActualizados } = useUserStore.getState();
      const usuarioToggled = usuariosActualizados.find((u) => u.id === usuario.id);
      expect(usuarioToggled?.activo).toBe(true);
    });

    it('no debe hacer nada si el usuario no existe', () => {
      const { usuarios } = useUserStore.getState();
      const estadosOriginales = usuarios.map((u) => ({ id: u.id, activo: u.activo }));

      useUserStore.getState().toggleActivoUsuario(99999);

      const { usuarios: usuariosActualizados } = useUserStore.getState();
      estadosOriginales.forEach(({ id, activo }) => {
        const u = usuariosActualizados.find((usr) => usr.id === id);
        expect(u?.activo).toBe(activo);
      });
    });
  });

  describe('eliminarUsuario', () => {
    it('debe eliminar un usuario de la lista', () => {
      const { usuarios, eliminarUsuario } = useUserStore.getState();
      const usuario = usuarios[0];
      const cantidadOriginal = usuarios.length;

      eliminarUsuario(usuario.id);

      const { usuarios: usuariosActualizados } = useUserStore.getState();
      expect(usuariosActualizados.length).toBe(cantidadOriginal - 1);
      expect(usuariosActualizados.find((u) => u.id === usuario.id)).toBeUndefined();
    });

    it('no debe afectar otros usuarios', () => {
      const { usuarios, eliminarUsuario } = useUserStore.getState();
      const usuarioAEliminar = usuarios[0];
      const otroUsuario = usuarios[1];

      eliminarUsuario(usuarioAEliminar.id);

      const { usuarios: usuariosActualizados } = useUserStore.getState();
      const otroUsuarioActualizado = usuariosActualizados.find((u) => u.id === otroUsuario.id);
      expect(otroUsuarioActualizado).toEqual(otroUsuario);
    });
  });

  describe('resetToDefaults', () => {
    it('debe resetear el store a valores iniciales', () => {
      const { crearUsuario, resetToDefaults, usuarios: usuariosIniciales } = useUserStore.getState();

      // Modificar el estado
      crearUsuario({
        nombre: 'Temp',
        username: 'temp',
        email: 'temp@example.com',
        rol: 'User',
        area: 'Temp',
      });

      // Resetear
      resetToDefaults();

      const { usuarios } = useUserStore.getState();
      expect(usuarios.length).toBe(usuariosIniciales.length);
    });
  });
});
