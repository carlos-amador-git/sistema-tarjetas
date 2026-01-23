/**
 * Tests para productStore
 */

import { useProductStore } from '../productStore';

describe('productStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useProductStore.getState().resetToDefaults();
  });

  describe('Initial State', () => {
    it('debe tener productos iniciales', () => {
      const { productos } = useProductStore.getState();
      expect(Array.isArray(productos)).toBe(true);
      expect(productos.length).toBeGreaterThan(0);
    });

    it('cada producto debe tener las propiedades requeridas', () => {
      const { productos } = useProductStore.getState();

      productos.forEach((producto) => {
        expect(producto).toHaveProperty('id');
        expect(producto).toHaveProperty('nombre');
        expect(producto).toHaveProperty('categoria');
        expect(producto).toHaveProperty('stock');
        expect(producto).toHaveProperty('stockMinimo');
        expect(producto).toHaveProperty('precio');
        expect(producto).toHaveProperty('activo');
        expect(producto).toHaveProperty('areas');
      });
    });
  });

  describe('crearProducto', () => {
    it('debe crear un nuevo producto con ID único', () => {
      const { crearProducto, productos } = useProductStore.getState();
      const productosAnteriorLength = productos.length;

      const nuevoId = crearProducto({
        nombre: 'Tarjeta Test',
        categoria: 'tarjeta',
        stock: 1000,
        stockMinimo: 100,
        precio: 5.5,
        areas: ['almacen', 'logistica'],
      });

      const { productos: nuevosProductos } = useProductStore.getState();
      expect(nuevosProductos.length).toBe(productosAnteriorLength + 1);
      // El ID sigue formato categoria-numero (TC-011, WK-011, etc.)
      expect(nuevoId).toMatch(/^[A-Z]{2}-\d{3}$/);
    });

    it('debe crear producto con activo=true por defecto', () => {
      const { crearProducto } = useProductStore.getState();

      const nuevoId = crearProducto({
        nombre: 'Producto Activo',
        categoria: 'kit',
        stock: 500,
        stockMinimo: 50,
        precio: 10,
        areas: ['almacen'],
      });

      const { productos } = useProductStore.getState();
      const nuevoProducto = productos.find((p) => p.id === nuevoId);
      expect(nuevoProducto?.activo).toBe(true);
    });

    it('debe agregar producto al principio de la lista', () => {
      const { crearProducto } = useProductStore.getState();

      const nuevoId = crearProducto({
        nombre: 'Primer Producto',
        categoria: 'etiqueta',
        stock: 2000,
        stockMinimo: 200,
        precio: 0.5,
        areas: ['logistica'],
      });

      const { productos } = useProductStore.getState();
      expect(productos[0].id).toBe(nuevoId);
    });
  });

  describe('actualizarProducto', () => {
    it('debe actualizar un producto existente', () => {
      const { productos, actualizarProducto } = useProductStore.getState();
      const producto = productos[0];

      actualizarProducto(producto.id, {
        nombre: 'Nombre Actualizado',
        precio: 99.99,
      });

      const { productos: productosActualizados } = useProductStore.getState();
      const productoActualizado = productosActualizados.find((p) => p.id === producto.id);

      expect(productoActualizado?.nombre).toBe('Nombre Actualizado');
      expect(productoActualizado?.precio).toBe(99.99);
    });

    it('debe mantener propiedades no actualizadas', () => {
      const { productos, actualizarProducto } = useProductStore.getState();
      const producto = productos[0];
      const categoriaOriginal = producto.categoria;

      actualizarProducto(producto.id, { nombre: 'Solo Nombre' });

      const { productos: productosActualizados } = useProductStore.getState();
      const productoActualizado = productosActualizados.find((p) => p.id === producto.id);

      expect(productoActualizado?.categoria).toBe(categoriaOriginal);
    });

    it('no debe hacer nada si el producto no existe', () => {
      const { productos, actualizarProducto } = useProductStore.getState();
      const productosOriginal = [...productos];

      actualizarProducto('NO-EXISTE', { nombre: 'No Existe' });

      const { productos: productosActualizados } = useProductStore.getState();
      expect(productosActualizados.map((p) => p.id)).toEqual(productosOriginal.map((p) => p.id));
    });
  });

  describe('toggleActivoProducto', () => {
    it('debe desactivar un producto activo', () => {
      const { productos, toggleActivoProducto } = useProductStore.getState();
      const productoActivo = productos.find((p) => p.activo);

      if (productoActivo) {
        toggleActivoProducto(productoActivo.id);

        const { productos: productosActualizados } = useProductStore.getState();
        const productoToggled = productosActualizados.find((p) => p.id === productoActivo.id);
        expect(productoToggled?.activo).toBe(false);
      }
    });

    it('debe activar un producto inactivo', () => {
      const { productos, toggleActivoProducto, actualizarProducto } = useProductStore.getState();
      const producto = productos[0];

      // Primero desactivar
      actualizarProducto(producto.id, { activo: false });

      // Luego toggle (debería activar)
      toggleActivoProducto(producto.id);

      const { productos: productosActualizados } = useProductStore.getState();
      const productoToggled = productosActualizados.find((p) => p.id === producto.id);
      expect(productoToggled?.activo).toBe(true);
    });
  });

  describe('eliminarProducto', () => {
    it('debe eliminar un producto de la lista', () => {
      const { productos, eliminarProducto } = useProductStore.getState();
      const producto = productos[0];
      const cantidadOriginal = productos.length;

      eliminarProducto(producto.id);

      const { productos: productosActualizados } = useProductStore.getState();
      expect(productosActualizados.length).toBe(cantidadOriginal - 1);
      expect(productosActualizados.find((p) => p.id === producto.id)).toBeUndefined();
    });

    it('no debe afectar otros productos', () => {
      const { productos, eliminarProducto } = useProductStore.getState();
      const productoAEliminar = productos[0];
      const otroProducto = productos[1];

      eliminarProducto(productoAEliminar.id);

      const { productos: productosActualizados } = useProductStore.getState();
      const otroProductoActualizado = productosActualizados.find((p) => p.id === otroProducto.id);
      expect(otroProductoActualizado).toEqual(otroProducto);
    });
  });

  describe('ajustarStock', () => {
    it('debe setear el stock con tipo "set"', () => {
      const { productos, ajustarStock } = useProductStore.getState();
      const producto = productos[0];

      ajustarStock(producto.id, 5000, 'set');

      const { productos: productosActualizados } = useProductStore.getState();
      const productoActualizado = productosActualizados.find((p) => p.id === producto.id);
      expect(productoActualizado?.stock).toBe(5000);
    });

    it('debe agregar al stock con tipo "add"', () => {
      const { productos, ajustarStock } = useProductStore.getState();
      const producto = productos[0];
      const stockOriginal = producto.stock;

      ajustarStock(producto.id, 100, 'add');

      const { productos: productosActualizados } = useProductStore.getState();
      const productoActualizado = productosActualizados.find((p) => p.id === producto.id);
      expect(productoActualizado?.stock).toBe(stockOriginal + 100);
    });

    it('debe restar del stock con tipo "subtract"', () => {
      const { productos, ajustarStock } = useProductStore.getState();
      const producto = productos[0];
      const stockOriginal = producto.stock;

      ajustarStock(producto.id, 50, 'subtract');

      const { productos: productosActualizados } = useProductStore.getState();
      const productoActualizado = productosActualizados.find((p) => p.id === producto.id);
      expect(productoActualizado?.stock).toBe(stockOriginal - 50);
    });
  });

  describe('resetToDefaults', () => {
    it('debe resetear el store a valores iniciales', () => {
      const { crearProducto, resetToDefaults, productos: productosIniciales } = useProductStore.getState();

      // Modificar el estado
      crearProducto({
        nombre: 'Temp',
        categoria: 'otro',
        stock: 100,
        stockMinimo: 10,
        precio: 1,
        areas: ['almacen'],
      });

      // Resetear
      resetToDefaults();

      const { productos } = useProductStore.getState();
      expect(productos.length).toBe(productosIniciales.length);
    });
  });

  describe('Validaciones de negocio', () => {
    it('el stock no debe ser negativo al crear', () => {
      const { crearProducto } = useProductStore.getState();

      const nuevoId = crearProducto({
        nombre: 'Producto',
        categoria: 'tarjeta',
        stock: 0, // Mínimo válido
        stockMinimo: 0,
        precio: 1,
        areas: ['almacen'],
      });

      const { productos } = useProductStore.getState();
      const producto = productos.find((p) => p.id === nuevoId);
      expect(producto?.stock).toBeGreaterThanOrEqual(0);
    });

    it('el precio debe ser positivo', () => {
      const { productos } = useProductStore.getState();

      productos.forEach((producto) => {
        expect(producto.precio).toBeGreaterThanOrEqual(0);
      });
    });

    it('stockMinimo debe ser menor o igual al stock inicial', () => {
      const { crearProducto } = useProductStore.getState();

      const nuevoId = crearProducto({
        nombre: 'Producto Válido',
        categoria: 'tarjeta',
        stock: 100,
        stockMinimo: 50,
        precio: 5,
        areas: ['almacen'],
      });

      const { productos } = useProductStore.getState();
      const producto = productos.find((p) => p.id === nuevoId);
      expect(producto?.stock).toBeGreaterThanOrEqual(producto?.stockMinimo || 0);
    });
  });
});
