/**
 * Tests para useTenant hook y TenantProvider
 */

import { render, screen, waitFor } from '@testing-library/react';
import { TenantProvider, useTenant, useTenantBranding, useTenantTheme, useTenantFeatures } from '../useTenant';
import { ReactNode } from 'react';

// Componente de prueba para verificar el hook
function TestComponent() {
  const { tenant, isLoading } = useTenant();
  return (
    <div>
      <span data-testid="loading">{isLoading ? 'loading' : 'loaded'}</span>
      <span data-testid="tenant-id">{tenant.id}</span>
      <span data-testid="tenant-name">{tenant.name}</span>
    </div>
  );
}

function BrandingComponent() {
  const branding = useTenantBranding();
  return <span data-testid="company-name">{branding.companyName}</span>;
}

function ThemeComponent() {
  const theme = useTenantTheme();
  return <span data-testid="primary-color">{theme.primary}</span>;
}

function FeaturesComponent() {
  const features = useTenantFeatures();
  return (
    <div>
      <span data-testid="show-demo">{features.showDemo ? 'true' : 'false'}</span>
      <span data-testid="enable-forecast">{features.enableForecast ? 'true' : 'false'}</span>
    </div>
  );
}

// Wrapper para proveer contexto
function Wrapper({ children }: { children: ReactNode }) {
  return <TenantProvider>{children}</TenantProvider>;
}

describe('TenantProvider', () => {
  it('should provide default tenant when no initialTenant', async () => {
    render(
      <Wrapper>
        <TestComponent />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('tenant-id')).toHaveTextContent('default');
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('CardSystem');
  });

  it('should use initialTenant when provided', () => {
    const customTenant = {
      id: 'custom',
      name: 'Custom Tenant',
      branding: {
        companyName: 'Custom',
        companySubtitle: 'Corp',
        fullName: 'Custom Corp',
        systemName: 'Custom System',
        systemDescription: 'Custom Description',
        sidebarSubtitle: 'Custom Sidebar',
        pageTitle: 'Custom Title',
        logo: { type: 'text' as const, imagePath: '', imageAlt: '' },
      },
      theme: {
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        background: '#ffffff',
        sidebar: '#1e293b',
      },
      features: {
        showDemo: false,
        enableForecast: true,
        enableOrders: true,
        enableFacialRecognition: false,
        enableExcelExport: true,
        enablePDFExport: true,
      },
      demoCredentials: {},
      api: { baseUrl: 'http://localhost' },
    };

    render(
      <TenantProvider initialTenant={customTenant}>
        <TestComponent />
      </TenantProvider>
    );

    expect(screen.getByTestId('tenant-id')).toHaveTextContent('custom');
    expect(screen.getByTestId('tenant-name')).toHaveTextContent('Custom Tenant');
  });
});

describe('useTenant', () => {
  it('should throw error when used outside provider', () => {
    // Suprimir console.error para este test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTenant must be used within a TenantProvider');

    consoleSpy.mockRestore();
  });
});

describe('useTenantBranding', () => {
  it('should return branding from tenant', async () => {
    render(
      <Wrapper>
        <BrandingComponent />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('company-name')).toHaveTextContent('Card');
    });
  });
});

describe('useTenantTheme', () => {
  it('should return theme from tenant', async () => {
    render(
      <Wrapper>
        <ThemeComponent />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('primary-color')).toHaveTextContent('#3b82f6');
    });
  });
});

describe('useTenantFeatures', () => {
  it('should return features from tenant', async () => {
    render(
      <Wrapper>
        <FeaturesComponent />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('enable-forecast')).toHaveTextContent('true');
    });
  });
});
