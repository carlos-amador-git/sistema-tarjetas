# =============================================================================
# Dockerfile - CardSystem (Next.js + Prisma + PostgreSQL)
#
# Multi-stage build optimizado para producción
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Instalar TODAS las dependencias (necesarias para Prisma generate)
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar dependencias y Prisma client generado
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_APP_VERSION=0.1.0
ARG NEXT_PUBLIC_DEMO_MODE=false
ARG NEXT_PUBLIC_DEMO_ADMIN_USER
ARG NEXT_PUBLIC_DEMO_ADMIN_PASS
ARG NEXT_PUBLIC_DEMO_ADMIN_LABEL
ARG NEXT_PUBLIC_DEMO_ALMACEN_USER
ARG NEXT_PUBLIC_DEMO_ALMACEN_PASS
ARG NEXT_PUBLIC_DEMO_ALMACEN_LABEL
ARG NEXT_PUBLIC_DEMO_LOGISTICA_USER
ARG NEXT_PUBLIC_DEMO_LOGISTICA_PASS
ARG NEXT_PUBLIC_DEMO_LOGISTICA_LABEL
ARG NEXT_PUBLIC_DEMO_SUCURSALES_USER
ARG NEXT_PUBLIC_DEMO_SUCURSALES_PASS
ARG NEXT_PUBLIC_DEMO_SUCURSALES_LABEL
ARG NEXT_PUBLIC_DEMO_CONSULTA_USER
ARG NEXT_PUBLIC_DEMO_CONSULTA_PASS
ARG NEXT_PUBLIC_DEMO_CONSULTA_LABEL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_DEMO_MODE=$NEXT_PUBLIC_DEMO_MODE
ENV NEXT_PUBLIC_DEMO_ADMIN_USER=$NEXT_PUBLIC_DEMO_ADMIN_USER
ENV NEXT_PUBLIC_DEMO_ADMIN_PASS=$NEXT_PUBLIC_DEMO_ADMIN_PASS
ENV NEXT_PUBLIC_DEMO_ADMIN_LABEL=$NEXT_PUBLIC_DEMO_ADMIN_LABEL
ENV NEXT_PUBLIC_DEMO_ALMACEN_USER=$NEXT_PUBLIC_DEMO_ALMACEN_USER
ENV NEXT_PUBLIC_DEMO_ALMACEN_PASS=$NEXT_PUBLIC_DEMO_ALMACEN_PASS
ENV NEXT_PUBLIC_DEMO_ALMACEN_LABEL=$NEXT_PUBLIC_DEMO_ALMACEN_LABEL
ENV NEXT_PUBLIC_DEMO_LOGISTICA_USER=$NEXT_PUBLIC_DEMO_LOGISTICA_USER
ENV NEXT_PUBLIC_DEMO_LOGISTICA_PASS=$NEXT_PUBLIC_DEMO_LOGISTICA_PASS
ENV NEXT_PUBLIC_DEMO_LOGISTICA_LABEL=$NEXT_PUBLIC_DEMO_LOGISTICA_LABEL
ENV NEXT_PUBLIC_DEMO_SUCURSALES_USER=$NEXT_PUBLIC_DEMO_SUCURSALES_USER
ENV NEXT_PUBLIC_DEMO_SUCURSALES_PASS=$NEXT_PUBLIC_DEMO_SUCURSALES_PASS
ENV NEXT_PUBLIC_DEMO_SUCURSALES_LABEL=$NEXT_PUBLIC_DEMO_SUCURSALES_LABEL
ENV NEXT_PUBLIC_DEMO_CONSULTA_USER=$NEXT_PUBLIC_DEMO_CONSULTA_USER
ENV NEXT_PUBLIC_DEMO_CONSULTA_PASS=$NEXT_PUBLIC_DEMO_CONSULTA_PASS
ENV NEXT_PUBLIC_DEMO_CONSULTA_LABEL=$NEXT_PUBLIC_DEMO_CONSULTA_LABEL
ENV NEXT_TELEMETRY_DISABLED=1

# Build de la aplicación
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner (Production)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Configuración de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar esquema de prisma (necesario para migraciones/db push)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./

# Instalar prisma CLI globalmente para ejecutar migraciones/db push en runtime
# Esto evita tener que copiar todo node_modules
RUN npm install -g prisma

# Script de inicio
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Usar entrypoint para setup inicial
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
