/**
 * Jest Configuration
 *
 * Configuración para testing del proyecto CardSystem
 */

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path al directorio de Next.js para cargar next.config.js y .env
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Configuración del entorno de pruebas
  testEnvironment: 'jest-environment-jsdom',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Mapeo de módulos (alias de paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Patrones de archivos de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{spec,test}.{ts,tsx}',
  ],

  // Ignorar directorios
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  // Transformaciones
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },

  // Cobertura de código
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/**/layout.tsx',
    '!src/app/**/page.tsx',
    // Excluir componentes de formulario (se prueban con E2E)
    '!src/components/forms/**',
    // Excluir componentes de UI complejos
    '!src/components/Sidebar.tsx',
    '!src/components/DemoTour.tsx',
    '!src/components/DemoTourButton.tsx',
    '!src/components/Providers.tsx',
    // Excluir configuración estática
    '!src/config/branding.ts',
    '!src/config/modules.ts',
    '!src/config/products.ts',
    '!src/config/roles.ts',
    '!src/config/theme.ts',
    // Excluir datos mock (no es lógica)
    '!src/data/mockData.ts',
  ],

  // Umbral mínimo de cobertura
  // Nota: Los umbrales están ajustados considerando que:
  // - Componentes de página/formulario se prueban con E2E
  // - Archivos con APIs de Next.js server-side no son testeables con Jest
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 30,
      lines: 25,
      statements: 25,
    },
    // Umbrales específicos para stores (críticos)
    'src/stores/**/*.ts': {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },

  // Reportes de cobertura
  coverageReporters: ['text', 'lcov', 'html'],

  // Verbose output
  verbose: true,
};

// createJestConfig exporta una función async para que Next.js pueda cargar la config
module.exports = createJestConfig(customJestConfig);
