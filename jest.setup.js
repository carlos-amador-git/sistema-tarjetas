/**
 * Jest Setup
 *
 * Configuración global que se ejecuta antes de cada archivo de test
 */

import '@testing-library/jest-dom';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Variables de entorno para tests
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api';
process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
process.env.NEXT_PUBLIC_DEMO_ADMIN_USER = 'admin';
process.env.NEXT_PUBLIC_DEMO_ADMIN_PASS = 'admin123';
process.env.NEXT_PUBLIC_DEMO_ADMIN_LABEL = 'Admin';

// Mock de fetch global
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
