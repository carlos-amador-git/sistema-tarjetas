Loaded Prisma config from prisma.config.ts.

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "totpSecret" TEXT,
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "backupCodes" TEXT,
    "ultimoAcceso" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "userId" TEXT,
    "username" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "resource" TEXT,
    "resourceId" TEXT,
    "details" TEXT,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "identifier" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttempt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "areas" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL,
    "precio" REAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BalanceProducto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" TEXT NOT NULL,
    "almacenBovedaTrabajo" INTEGER NOT NULL DEFAULT 0,
    "almacenBovedaPrincipal" INTEGER NOT NULL DEFAULT 0,
    "enProcesoCantidad" INTEGER NOT NULL DEFAULT 0,
    "enProcesoOrdenesActivas" INTEGER NOT NULL DEFAULT 0,
    "logisticaColocacion" INTEGER NOT NULL DEFAULT 0,
    "logisticaNormal" INTEGER NOT NULL DEFAULT 0,
    "logisticaDevoluciones" INTEGER NOT NULL DEFAULT 0,
    "sucursalesColocacion" INTEGER NOT NULL DEFAULT 0,
    "sucursalesStock" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BalanceProducto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Captura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "datos" TEXT NOT NULL,
    "observacion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Captura_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MovimientoHistorial" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "observacion" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MovimientoHistorial_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MovimientoHistorial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrdenCompra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" DATETIME NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "estatus" TEXT NOT NULL,
    "costoTotal" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrdenCompra_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OrdenCompra_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForecastProducto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productoId" TEXT NOT NULL,
    "forecast" TEXT NOT NULL,
    "tendencia" TEXT NOT NULL,
    "alertas" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimit_identifier_key" ON "RateLimit"("identifier");

-- CreateIndex
CREATE INDEX "Producto_categoria_idx" ON "Producto"("categoria");

-- CreateIndex
CREATE INDEX "Producto_activo_idx" ON "Producto"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "BalanceProducto_productoId_key" ON "BalanceProducto"("productoId");

-- CreateIndex
CREATE INDEX "BalanceProducto_productoId_idx" ON "BalanceProducto"("productoId");

-- CreateIndex
CREATE INDEX "Captura_productoId_idx" ON "Captura"("productoId");

-- CreateIndex
CREATE INDEX "Captura_userId_idx" ON "Captura"("userId");

-- CreateIndex
CREATE INDEX "Captura_fecha_idx" ON "Captura"("fecha");

-- CreateIndex
CREATE INDEX "MovimientoHistorial_productoId_idx" ON "MovimientoHistorial"("productoId");

-- CreateIndex
CREATE INDEX "MovimientoHistorial_userId_idx" ON "MovimientoHistorial"("userId");

-- CreateIndex
CREATE INDEX "MovimientoHistorial_fecha_idx" ON "MovimientoHistorial"("fecha");

-- CreateIndex
CREATE INDEX "MovimientoHistorial_tipo_idx" ON "MovimientoHistorial"("tipo");

-- CreateIndex
CREATE INDEX "OrdenCompra_productoId_idx" ON "OrdenCompra"("productoId");

-- CreateIndex
CREATE INDEX "OrdenCompra_userId_idx" ON "OrdenCompra"("userId");

-- CreateIndex
CREATE INDEX "OrdenCompra_estatus_idx" ON "OrdenCompra"("estatus");

-- CreateIndex
CREATE INDEX "OrdenCompra_fecha_idx" ON "OrdenCompra"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastProducto_productoId_key" ON "ForecastProducto"("productoId");

-- CreateIndex
CREATE INDEX "ForecastProducto_productoId_idx" ON "ForecastProducto"("productoId");

