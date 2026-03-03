/**
 * Tests de Integración - Flujos Críticos
 *
 * Verifica que los diferentes stores trabajan correctamente juntos
 * y que los flujos de negocio funcionan end-to-end.
 */

import { useInventoryStore } from '@/stores/inventoryStore';
import { useUserStore } from '@/stores/userStore';
import { useProductStore } from '@/stores/productStore';

describe('Flujos de Integración', () => {
  beforeEach(() => {
    // Reset all stores
    useInventoryStore.getState().resetToDefaults();
    useUserStore.getState().resetToDefaults();
    useProductStore.getState().resetToDefaults();
  });

  describe('Flujo: Captura de Inventario → Balance → Dashboard', () => {
    it('una captura de almacén debe actualizar el balance global', () => {
      const { balance, registrarCapturaAlmacen, getResumenGlobal } = useInventoryStore.getState();

      // Obtener resumen inicial
      const resumenInicial = getResumenGlobal();

      // Realizar captura
      const productoId = Object.keys(balance)[0];
      const balanceActual = balance[productoId];

      registrarCapturaAlmacen({
        productoId,
        bovedaTrabajo: balanceActual.almacen.bovedaTrabajo + 1000,
        bovedaPrincipal: balanceActual.almacen.bovedaPrincipal,
        fecha: '2026-01-21 10:00:00',
        usuario: 'admin',
      });

      // Verificar que el resumen se actualizó
      const nuevoResumen = useInventoryStore.getState().getResumenGlobal();
      expect(nuevoResumen.enAlmacen).toBe(resumenInicial.enAlmacen + 1000);
      expect(nuevoResumen.totalInventario).toBe(resumenInicial.totalInventario + 1000);
    });

    it('múltiples capturas deben acumularse correctamente', () => {
      const { balance, registrarCapturaAlmacen, registrarCapturaLogistica, getResumenGlobal } =
        useInventoryStore.getState();

      const productoId = Object.keys(balance)[0];
      const balanceActual = balance[productoId];

      // Captura en almacén
      registrarCapturaAlmacen({
        productoId,
        bovedaTrabajo: balanceActual.almacen.bovedaTrabajo + 500,
        bovedaPrincipal: balanceActual.almacen.bovedaPrincipal + 500,
        fecha: '2026-01-21 10:00:00',
        usuario: 'admin',
      });

      // Captura en logística
      registrarCapturaLogistica({
        productoId,
        destinoId: 'SUC-001',
        colocacion: balanceActual.logistica.colocacion + 200,
        normal: balanceActual.logistica.normal + 100,
        fecha: '2026-01-21 11:00:00',
        usuario: 'logistica',
      });

      const { historial } = useInventoryStore.getState();

      // Debe haber al menos 2 movimientos nuevos
      const movimientosNuevos = historial.filter((h) => h.fecha.includes('2026-01-21'));
      expect(movimientosNuevos.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Flujo: Orden de Compra → Aprobación → Historial', () => {
    it('crear y completar una orden debe generar entrada en historial', () => {
      const { crearOrden, actualizarEstatusOrden, historial } = useInventoryStore.getState();
      const historialInicial = historial.length;

      // Crear orden
      const ordenId = crearOrden({
        fecha: '2026-01-21',
        producto: 'Tarjeta Clásica',
        productoId: 'TC-001',
        cantidad: 5000,
        solicitante: 'Admin',
        area: 'Almacén Central',
        costoTotal: 25000,
        estatus: 'PENDIENTE',
      });

      // Aprobar orden
      actualizarEstatusOrden(ordenId, 'APROBADA');

      // Completar orden
      actualizarEstatusOrden(ordenId, 'COMPLETADA');

      const { historial: historialFinal, ordenes } = useInventoryStore.getState();

      // La orden debe estar completada
      const orden = ordenes.find((o) => o.id === ordenId);
      expect(orden?.estatus).toBe('COMPLETADA');

      // Debe haber una nueva entrada en historial
      expect(historialFinal.length).toBe(historialInicial + 1);

      // La entrada debe ser de tipo ENTRADA
      const entradaNueva = historialFinal.find((h) => h.documento === ordenId);
      expect(entradaNueva?.tipo).toBe('ENTRADA');
      expect(entradaNueva?.cantidad).toBe(5000);
    });

    it('cancelar una orden no debe generar entrada en historial', () => {
      const { crearOrden, actualizarEstatusOrden, historial } = useInventoryStore.getState();
      const historialInicial = historial.length;

      const ordenId = crearOrden({
        fecha: '2026-01-21',
        producto: 'Tarjeta Premium',
        productoId: 'TP-001',
        cantidad: 1000,
        solicitante: 'Admin',
        area: 'Almacén',
        costoTotal: 10000,
        estatus: 'PENDIENTE',
      });

      // Cancelar orden (rechazar)
      actualizarEstatusOrden(ordenId, 'RECHAZADA');

      const { historial: historialFinal } = useInventoryStore.getState();
      expect(historialFinal.length).toBe(historialInicial);
    });
  });

  describe('Flujo: Gestión de Usuarios', () => {
    it('crear usuario → activar/desactivar → eliminar', () => {
      const { crearUsuario, toggleActivoUsuario, eliminarUsuario, usuarios } =
        useUserStore.getState();
      const usuariosInicial = usuarios.length;

      // Crear usuario
      const userId = crearUsuario({
        nombre: 'Test User',
        username: 'testflow',
        email: 'test@flow.com',
        rol: 'Usuario',
        area: 'Test',
      });

      let state = useUserStore.getState();
      expect(state.usuarios.length).toBe(usuariosInicial + 1);

      // Desactivar
      toggleActivoUsuario(userId);
      state = useUserStore.getState();
      expect(state.usuarios.find((u) => u.id === userId)?.activo).toBe(false);

      // Reactivar
      toggleActivoUsuario(userId);
      state = useUserStore.getState();
      expect(state.usuarios.find((u) => u.id === userId)?.activo).toBe(true);

      // Eliminar
      eliminarUsuario(userId);
      state = useUserStore.getState();
      expect(state.usuarios.length).toBe(usuariosInicial);
    });
  });

  describe('Flujo: Gestión de Productos', () => {
    it('crear producto → ajustar stock → verificar estado', () => {
      const { crearProducto, ajustarStock, productos } = useProductStore.getState();
      const productosInicial = productos.length;

      // Crear producto
      const productoId = crearProducto({
        nombre: 'Nuevo Producto Test',
        categoria: 'tarjeta',
        stock: 100,
        stockMinimo: 50,
        precio: 5,
        areas: ['almacen', 'logistica'],
      });

      let state = useProductStore.getState();
      expect(state.productos.length).toBe(productosInicial + 1);

      // Ajustar stock
      ajustarStock(productoId, 500, 'set');
      state = useProductStore.getState();
      const producto = state.productos.find((p) => p.id === productoId);
      expect(producto?.stock).toBe(500);

      // Stock > stockMinimo, debería estar en buen estado
      expect(producto!.stock).toBeGreaterThan(producto!.stockMinimo);
    });
  });

  describe('Consistencia de Datos', () => {
    it('los IDs de producto deben ser consistentes entre stores', () => {
      const { balance } = useInventoryStore.getState();
      const { productos } = useProductStore.getState();

      // Verificar que los productos del balance existen en productStore
      const balanceProductIds = Object.keys(balance);
      const productStoreIds = productos.map((p) => p.id);

      // Al menos algunos productos del balance deben estar en productStore
      const idsComunes = balanceProductIds.filter((id) => productStoreIds.includes(id));
      expect(idsComunes.length).toBeGreaterThan(0);
    });

    it('los historial deben tener referencias válidas', () => {
      const { historial } = useInventoryStore.getState();

      historial.forEach((movimiento) => {
        // El productoId debe existir en el balance o ser un ID válido
        expect(movimiento.productoId).toBeTruthy();
        expect(movimiento.producto).toBeTruthy();
        // La cantidad puede ser negativa en ajustes, pero debe ser un número
        expect(typeof movimiento.cantidad).toBe('number');
      });
    });
  });

  describe('Resiliencia', () => {
    it('el sistema debe manejar operaciones simultáneas', () => {
      const { crearOrden } = useInventoryStore.getState();

      // Crear múltiples órdenes "simultáneamente"
      const ordenIds = [];
      for (let i = 0; i < 10; i++) {
        const id = crearOrden({
          fecha: '2026-01-21',
          producto: `Producto ${i}`,
          productoId: `PROD-${i}`,
          cantidad: 100 * i,
          solicitante: `User ${i}`,
          area: 'Test',
          costoTotal: 1000 * i,
          estatus: 'PENDIENTE',
        });
        ordenIds.push(id);
      }

      // Verificar que todos los IDs son únicos
      const uniqueIds = new Set(ordenIds);
      expect(uniqueIds.size).toBe(10);

      // Verificar que todas las órdenes existen
      const { ordenes } = useInventoryStore.getState();
      ordenIds.forEach((id) => {
        expect(ordenes.find((o) => o.id === id)).toBeDefined();
      });
    });
  });
});
