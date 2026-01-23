/**
 * Tests para inventoryStore
 */

import { useInventoryStore } from '../inventoryStore';

describe('inventoryStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useInventoryStore.getState().resetToDefaults();
  });

  describe('Initial State', () => {
    it('debe tener balance inicial con datos mock', () => {
      const { balance } = useInventoryStore.getState();
      expect(Object.keys(balance).length).toBeGreaterThan(0);
    });

    it('debe tener historial inicial', () => {
      const { historial } = useInventoryStore.getState();
      expect(Array.isArray(historial)).toBe(true);
    });

    it('debe tener ordenes iniciales', () => {
      const { ordenes } = useInventoryStore.getState();
      expect(Array.isArray(ordenes)).toBe(true);
    });
  });

  describe('registrarCapturaAlmacen', () => {
    it('debe actualizar el balance de almacén', () => {
      const { registrarCapturaAlmacen, balance } = useInventoryStore.getState();

      // Obtener un producto del balance
      const productoId = Object.keys(balance)[0];
      const balanceAnterior = balance[productoId];

      registrarCapturaAlmacen({
        productoId,
        bovedaTrabajo: 1000,
        bovedaPrincipal: 2000,
        fecha: '2026-01-21 10:00:00',
        usuario: 'test_user',
      });

      const { balance: nuevoBalance } = useInventoryStore.getState();
      expect(nuevoBalance[productoId].almacen.bovedaTrabajo).toBe(1000);
      expect(nuevoBalance[productoId].almacen.bovedaPrincipal).toBe(2000);
    });

    it('debe crear movimiento en historial si hay diferencia', () => {
      const { registrarCapturaAlmacen, balance, historial } = useInventoryStore.getState();
      const productoId = Object.keys(balance)[0];
      const historialAnteriorLength = historial.length;

      registrarCapturaAlmacen({
        productoId,
        bovedaTrabajo: 99999, // Valor diferente al actual
        bovedaPrincipal: 99999,
        fecha: '2026-01-21 10:00:00',
        usuario: 'test_user',
      });

      const { historial: nuevoHistorial } = useInventoryStore.getState();
      expect(nuevoHistorial.length).toBeGreaterThan(historialAnteriorLength);
    });

    it('no debe crear movimiento si no hay diferencia', () => {
      const { registrarCapturaAlmacen, balance, historial } = useInventoryStore.getState();
      const productoId = Object.keys(balance)[0];
      const balanceActual = balance[productoId];
      const historialAnteriorLength = historial.length;

      // Registrar con los mismos valores actuales
      registrarCapturaAlmacen({
        productoId,
        bovedaTrabajo: balanceActual.almacen.bovedaTrabajo,
        bovedaPrincipal: balanceActual.almacen.bovedaPrincipal,
        fecha: '2026-01-21 10:00:00',
        usuario: 'test_user',
      });

      const { historial: nuevoHistorial } = useInventoryStore.getState();
      expect(nuevoHistorial.length).toBe(historialAnteriorLength);
    });
  });

  describe('registrarCapturaLogistica', () => {
    it('debe actualizar el balance de logística', () => {
      const { registrarCapturaLogistica, balance } = useInventoryStore.getState();
      const productoId = Object.keys(balance)[0];

      registrarCapturaLogistica({
        productoId,
        destinoId: 'SUC-001',
        colocacion: 500,
        normal: 300,
        fecha: '2026-01-21 10:00:00',
        usuario: 'test_user',
      });

      const { balance: nuevoBalance } = useInventoryStore.getState();
      expect(nuevoBalance[productoId].logistica.colocacion).toBe(500);
      expect(nuevoBalance[productoId].logistica.normal).toBe(300);
    });
  });

  describe('registrarCapturaSucursal', () => {
    it('debe actualizar el balance de sucursales', () => {
      const { registrarCapturaSucursal, balance } = useInventoryStore.getState();
      const productoId = Object.keys(balance)[0];

      registrarCapturaSucursal({
        productoId,
        sucursalId: 'SUC-001',
        colocacion: 200,
        stock: 150,
        fecha: '2026-01-21 10:00:00',
        usuario: 'test_user',
      });

      const { balance: nuevoBalance } = useInventoryStore.getState();
      expect(nuevoBalance[productoId].sucursales.colocacion).toBe(200);
      expect(nuevoBalance[productoId].sucursales.stock).toBe(150);
    });
  });

  describe('crearOrden', () => {
    it('debe crear una nueva orden con ID único', () => {
      const { crearOrden, ordenes } = useInventoryStore.getState();
      const ordenesAnteriorLength = ordenes.length;

      const nuevoId = crearOrden({
        fecha: '2026-01-21',
        producto: 'Tarjeta Test',
        productoId: 'TC-001',
        cantidad: 1000,
        solicitante: 'Test User',
        area: 'Test Area',
        costoTotal: 5000,
        estatus: 'PENDIENTE',
      });

      const { ordenes: nuevasOrdenes } = useInventoryStore.getState();
      expect(nuevasOrdenes.length).toBe(ordenesAnteriorLength + 1);
      expect(nuevoId).toMatch(/^OC-2026-\d{3}$/);
    });

    it('debe agregar la orden al principio de la lista', () => {
      const { crearOrden } = useInventoryStore.getState();

      const nuevoId = crearOrden({
        fecha: '2026-01-21',
        producto: 'Tarjeta Nueva',
        productoId: 'TC-NEW',
        cantidad: 500,
        solicitante: 'Usuario',
        area: 'Area',
        costoTotal: 2500,
        estatus: 'PENDIENTE',
      });

      const { ordenes } = useInventoryStore.getState();
      expect(ordenes[0].id).toBe(nuevoId);
    });
  });

  describe('actualizarEstatusOrden', () => {
    it('debe actualizar el estatus de una orden existente', () => {
      const { ordenes, actualizarEstatusOrden } = useInventoryStore.getState();
      const ordenId = ordenes[0].id;

      actualizarEstatusOrden(ordenId, 'APROBADA');

      const { ordenes: ordenesActualizadas } = useInventoryStore.getState();
      const ordenActualizada = ordenesActualizadas.find(o => o.id === ordenId);
      expect(ordenActualizada?.estatus).toBe('APROBADA');
    });

    it('debe agregar movimiento al historial cuando se completa una orden', () => {
      const { ordenes, actualizarEstatusOrden, historial } = useInventoryStore.getState();
      const ordenId = ordenes[0].id;
      const historialAnteriorLength = historial.length;

      actualizarEstatusOrden(ordenId, 'COMPLETADA');

      const { historial: nuevoHistorial } = useInventoryStore.getState();
      expect(nuevoHistorial.length).toBe(historialAnteriorLength + 1);
      expect(nuevoHistorial[0].documento).toBe(ordenId);
    });
  });

  describe('agregarMovimiento', () => {
    it('debe agregar un movimiento al historial', () => {
      const { agregarMovimiento, historial } = useInventoryStore.getState();
      const historialAnteriorLength = historial.length;

      agregarMovimiento({
        fecha: '2026-01-21 12:00:00',
        tipo: 'ENTRADA',
        producto: 'Test Product',
        productoId: 'TP-001',
        cantidad: 100,
        usuario: 'test_user',
        area: 'Test',
        observacion: 'Test movement',
        documento: 'TEST-001',
      });

      const { historial: nuevoHistorial } = useInventoryStore.getState();
      expect(nuevoHistorial.length).toBe(historialAnteriorLength + 1);
    });
  });

  describe('getResumenGlobal', () => {
    it('debe calcular el resumen global correctamente', () => {
      const { getResumenGlobal } = useInventoryStore.getState();
      const resumen = getResumenGlobal();

      expect(resumen).toHaveProperty('totalInventario');
      expect(resumen).toHaveProperty('enAlmacen');
      expect(resumen).toHaveProperty('enLogistica');
      expect(resumen).toHaveProperty('enSucursales');
      expect(resumen).toHaveProperty('enProceso');

      // El total debe ser la suma de almacén + logística + sucursales
      expect(resumen.totalInventario).toBe(
        resumen.enAlmacen + resumen.enLogistica + resumen.enSucursales
      );
    });
  });

  describe('resetToDefaults', () => {
    it('debe resetear el store a los valores iniciales', () => {
      const { crearOrden, resetToDefaults, ordenes: ordenesIniciales } = useInventoryStore.getState();

      // Modificar el estado
      crearOrden({
        fecha: '2026-01-21',
        producto: 'Test',
        productoId: 'T-001',
        cantidad: 100,
        solicitante: 'Test',
        area: 'Test',
        costoTotal: 500,
        estatus: 'PENDIENTE',
      });

      // Resetear
      resetToDefaults();

      const { ordenes } = useInventoryStore.getState();
      expect(ordenes.length).toBe(ordenesIniciales.length);
    });
  });
});
