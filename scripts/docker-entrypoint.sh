#!/bin/sh
set -e

echo "Starting deployment scripts..."

# Aplicar cambios en la base de datos
# Usamos db push para sincronizar el esquema con la base de datos
# Esto es útil para el primer despliegue o cuando no se tienen migraciones generadas
echo "Pushing database schema..."
npx prisma db push

# Iniciar la aplicación
echo "Starting application..."
exec "$@"
