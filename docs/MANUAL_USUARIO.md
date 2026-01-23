# Manual de Usuario - CardSystem

Guía completa para usuarios del Sistema de Inventario de Tarjetas.

## Contenido

1. [Acceso al Sistema](#acceso-al-sistema)
2. [Dashboard](#dashboard)
3. [Balance de Inventario](#balance-de-inventario)
4. [Capturas](#capturas)
5. [Órdenes de Compra](#órdenes-de-compra)
6. [Forecast](#forecast)
7. [Historial](#historial)
8. [Administración](#administración)
9. [Configuración de 2FA](#configuración-de-2fa)
10. [Exportación de Datos](#exportación-de-datos)

---

## Acceso al Sistema

### Iniciar Sesión

1. Abrir el navegador e ir a la URL del sistema
2. Ingresar usuario y contraseña
3. Click en **Iniciar Sesión**

Si tienes 2FA activado, se te pedirá el código de tu app autenticadora.

### Botones de Demo

En modo demo, verás botones de acceso rápido para cada rol:
- **Admin** - Acceso completo
- **Almacén** - Captura de almacén
- **Logística** - Captura de logística
- **Sucursales** - Captura de sucursales
- **Consulta** - Solo lectura

### Cerrar Sesión

Click en **Cerrar Sesión** en la parte inferior del menú lateral.

---

## Dashboard

El dashboard muestra un resumen general del inventario:

### KPIs Principales

| Indicador | Descripción |
|-----------|-------------|
| **Total Inventario** | Suma de todas las tarjetas en el sistema |
| **En Almacén** | Tarjetas en bóveda + workcenter |
| **En Logística** | Tarjetas en proceso de distribución |
| **En Sucursales** | Tarjetas en puntos de venta |

### Gráficos

- **Tendencia de Inventario**: Evolución mensual del stock
- **Distribución por Área**: Proporción en cada ubicación

### Alertas

El sistema muestra alertas cuando:
- Stock bajo el mínimo establecido
- Órdenes próximas a vencer
- Movimientos inusuales

---

## Balance de Inventario

### Vista General

Muestra el inventario actual por producto:

| Columna | Descripción |
|---------|-------------|
| Producto | Código y nombre |
| Bóveda | Stock en bóveda de seguridad |
| Workcenter | Stock en área de trabajo |
| Logística | En tránsito/distribución |
| Sucursales | En puntos de venta |
| En Proceso | Tarjetas en personalización |
| **Total** | Suma de todas las ubicaciones |

### Filtros

- Buscar por nombre o código de producto
- Filtrar por tipo de tarjeta (Débito/Crédito)
- Ver solo productos con stock bajo

### Detalle de Producto

Click en una fila para ver:
- Historial de movimientos
- Gráfico de evolución
- Órdenes pendientes

---

## Capturas

Cada área tiene su módulo de captura específico.

### Captura Almacén

**Acceso**: Roles `admin` y `almacen`

Registrar inventario en:
- **Bóveda**: Stock de seguridad
- **Workcenter**: Área de trabajo diario

**Cómo capturar:**

1. Seleccionar producto
2. Ingresar cantidad en Bóveda
3. Ingresar cantidad en Workcenter
4. Agregar descripción (opcional)
5. Click **Guardar Captura**

### Captura Logística

**Acceso**: Roles `admin` y `logistica`

Registrar tarjetas en tránsito o distribución.

### Captura Sucursales

**Acceso**: Roles `admin` y `sucursales`

Registrar inventario en puntos de venta.

### Validaciones

- No se permiten cantidades negativas
- Los cambios quedan registrados en historial
- Se requiere descripción para ajustes mayores

---

## Órdenes de Compra

### Crear Orden

1. Click en **Nueva Orden**
2. Seleccionar producto
3. Ingresar cantidad solicitada
4. Seleccionar proveedor
5. Establecer fecha estimada de entrega
6. Agregar notas (opcional)
7. Click **Crear Orden**

### Estados de Orden

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Orden creada, esperando procesamiento |
| **En Proceso** | Orden confirmada con proveedor |
| **Completada** | Mercancía recibida |
| **Cancelada** | Orden cancelada |

### Acciones

- **Ver Detalle**: Información completa
- **Editar**: Modificar datos (solo Pendiente)
- **Cambiar Estado**: Actualizar progreso
- **Cancelar**: Cancelar orden pendiente

---

## Forecast

**Acceso**: Roles `admin` y `consulta`

### Proyecciones

El sistema calcula automáticamente:
- **Consumo promedio** mensual
- **Stock proyectado** a 30/60/90 días
- **Fecha de agotamiento** estimada
- **Punto de reorden** sugerido

### Alertas de Forecast

- Stock crítico (menos de 15 días)
- Stock bajo (15-30 días)
- Reorden sugerido

### Configuración

Ajustar parámetros de cálculo:
- Período de análisis
- Factor de seguridad
- Días mínimos de stock

---

## Historial

### Tipos de Movimiento

| Tipo | Descripción |
|------|-------------|
| **Entrada** | Ingreso de tarjetas al sistema |
| **Salida** | Retiro de tarjetas |
| **Ajuste** | Corrección de inventario |
| **Transferencia** | Movimiento entre ubicaciones |

### Filtros

- Por producto
- Por tipo de movimiento
- Por rango de fechas
- Por usuario

### Información del Registro

Cada movimiento incluye:
- Fecha y hora
- Usuario que realizó la acción
- Producto afectado
- Cantidad
- Ubicación
- Descripción

---

## Administración

**Acceso**: Solo rol `admin`

### Gestión de Productos

- Crear nuevos productos
- Editar información
- Activar/desactivar productos

### Gestión de Usuarios

- Crear usuarios
- Asignar roles
- Activar/desactivar cuentas
- Resetear contraseñas

### Métricas del Sistema

Acceso a estadísticas de uso:
- Requests por hora
- Errores recientes
- Uso de base de datos

---

## Configuración de 2FA

### Activar 2FA

1. Ir a configuración de perfil
2. Click en **Activar 2FA**
3. Escanear código QR con app autenticadora:
   - Google Authenticator
   - Authy
   - Microsoft Authenticator
4. Ingresar código de 6 dígitos
5. **Guardar códigos de respaldo**

### Códigos de Respaldo

- Se generan 8 códigos de un solo uso
- Guardarlos en lugar seguro
- Usar si pierdes acceso a la app

### Desactivar 2FA

1. Ir a configuración de perfil
2. Click en **Desactivar 2FA**
3. Confirmar con código de la app

---

## Exportación de Datos

### Excel

Disponible en:
- Balance de inventario
- Historial de movimientos
- Órdenes de compra

Click en el botón **Exportar Excel**.

### PDF

Reportes formateados para impresión:
- Reporte de inventario
- Reporte de órdenes
- Historial filtrado

Click en **Exportar PDF**.

### Datos Exportados

| Reporte | Contenido |
|---------|-----------|
| Balance | Inventario actual por producto y ubicación |
| Historial | Movimientos con fecha, usuario y descripción |
| Órdenes | Lista de órdenes con estado y fechas |

---

## Tour Demo

El sistema incluye un tour interactivo para nuevos usuarios.

### Iniciar Tour

1. Click en el botón **Tour Demo** (esquina inferior derecha)
2. Seguir las instrucciones paso a paso
3. Navegar por los módulos principales

### Contenido del Tour

1. Dashboard y KPIs
2. Balance de inventario
3. Módulos de captura
4. Órdenes de compra
5. Forecast y alertas
6. Historial

---

## Cambiar Tema (Demo)

En modo demo, puedes cambiar la paleta de colores:

1. Click en el selector de paleta (sidebar)
2. Elegir un tema:
   - CardSystem (azul)
   - Rojo Bancario
   - Verde Bosque
   - Verde Fresco
   - Púrpura Premium
   - Naranja Dinámico

Útil para presentaciones a clientes.

---

## Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Esc` | Cerrar modal |
| `Enter` | Confirmar acción |
| `/` | Enfocar búsqueda |

---

## Solución de Problemas

### "Sesión expirada"

Tu sesión expira después de 15 minutos de inactividad. Vuelve a iniciar sesión.

### "Demasiados intentos"

Espera 1 minuto antes de intentar nuevamente. El sistema tiene protección contra ataques.

### "Error de conexión"

Verifica tu conexión a internet. Si persiste, contacta a soporte.

### Olvidé mi contraseña

Contacta al administrador del sistema para resetear tu contraseña.

### Perdí acceso a mi app 2FA

Usa uno de tus códigos de respaldo para iniciar sesión, luego desactiva y reactiva 2FA.

---

## Contacto de Soporte

Para asistencia técnica, contactar al equipo de TI.
