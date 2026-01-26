/**
 * API Route: Health Check
 *
 * GET /api/health - Verificar estado del sistema
 *
 * Usado por:
 * - Load balancers
 * - Kubernetes probes
 * - Docker HEALTHCHECK
 * - Monitoreo externo
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Tiempo de inicio del servidor
const startTime = Date.now();

interface HealthCheck {
  status: 'up' | 'down';
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: HealthCheck;
    sentry: { configured: boolean };
  };
}

export async function GET() {
  const checks: HealthResponse['checks'] = {
    database: { status: 'down' },
    sentry: { configured: false },
  };

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'up',
      latencyMs: Date.now() - dbStart,
    };
  } catch (error) {
    console.error('Health Check DB Error:', error);
    checks.database = {
      status: 'down',
      error: error instanceof Error ? error.message : 'Database connection failed',
    };
  }

  // Check Sentry configuration
  checks.sentry = {
    configured: !!(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN),
  };

  // Determine overall status
  let status: HealthResponse['status'] = 'healthy';
  if (checks.database.status === 'down') {
    status = 'unhealthy';
  } else if (!checks.sentry.configured && process.env.NODE_ENV === 'production') {
    status = 'degraded';
  }

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  };

  // Return 200 always for debugging, to see the error in the response body
  // const httpStatus = status === 'unhealthy' ? 503 : 200;
  const httpStatus = 200;

  return NextResponse.json(response, { status: httpStatus });
}
