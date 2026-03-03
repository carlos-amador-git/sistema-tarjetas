/**
 * Tests para componentes Skeleton
 *
 * Componentes testeados:
 * - Skeleton (base)
 * - SkeletonText
 * - SkeletonCircle
 * - SkeletonImage
 * - SkeletonCard
 * - SkeletonStatCard
 * - SkeletonTable
 * - SkeletonList
 * - SkeletonDashboard
 * - SkeletonBalance
 * - SkeletonUsers
 */

import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonImage,
  SkeletonCard,
  SkeletonStatCard,
  SkeletonTable,
  SkeletonList,
  SkeletonDashboard,
  SkeletonBalance,
  SkeletonUsers,
} from '../Skeleton';

// =============================================================================
// SKELETON BASE TESTS
// =============================================================================

describe('Skeleton', () => {
  it('debe renderizar con clases de animación', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('debe aplicar className personalizado', () => {
    const { container } = render(<Skeleton className="h-10 w-40" />);
    expect(container.firstChild).toHaveClass('h-10', 'w-40');
  });

  it('debe aplicar estilos inline', () => {
    const { container } = render(<Skeleton style={{ width: '200px' }} />);
    expect(container.firstChild).toHaveStyle({ width: '200px' });
  });

  it('debe renderizar children cuando se proporcionan', () => {
    render(
      <Skeleton>
        <span data-testid="child">Content</span>
      </Skeleton>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('debe tener efecto shimmer', () => {
    const { container } = render(<Skeleton />);
    const shimmer = container.querySelector('.animate-\\[shimmer_2s_infinite\\]');
    expect(shimmer).toBeInTheDocument();
  });
});

// =============================================================================
// SKELETON TEXT TESTS
// =============================================================================

describe('SkeletonText', () => {
  it('debe renderizar 3 líneas por defecto', () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(3);
  });

  it('debe renderizar número personalizado de líneas', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines.length).toBe(5);
  });

  it('debe aplicar ancho 60% a la última línea por defecto', () => {
    const { container } = render(<SkeletonText lines={2} />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines[1]).toHaveStyle({ width: '60%' });
  });

  it('debe aplicar ancho personalizado a la última línea', () => {
    const { container } = render(<SkeletonText lines={2} lastLineWidth="80%" />);
    const lines = container.querySelectorAll('.animate-pulse');
    expect(lines[1]).toHaveStyle({ width: '80%' });
  });
});

// =============================================================================
// SKELETON CIRCLE TESTS
// =============================================================================

describe('SkeletonCircle', () => {
  it('debe ser redondo', () => {
    const { container } = render(<SkeletonCircle />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it.each([
    ['sm', 'w-8', 'h-8'],
    ['md', 'w-10', 'h-10'],
    ['lg', 'w-12', 'h-12'],
    ['xl', 'w-16', 'h-16'],
  ] as const)('debe aplicar tamaño %s correctamente', (size, widthClass, heightClass) => {
    const { container } = render(<SkeletonCircle size={size} />);
    expect(container.firstChild).toHaveClass(widthClass, heightClass);
  });

  it('debe usar tamaño md por defecto', () => {
    const { container } = render(<SkeletonCircle />);
    expect(container.firstChild).toHaveClass('w-10', 'h-10');
  });
});

// =============================================================================
// SKELETON IMAGE TESTS
// =============================================================================

describe('SkeletonImage', () => {
  it('debe tener aspect-ratio video por defecto', () => {
    const { container } = render(<SkeletonImage />);
    expect(container.firstChild).toHaveClass('aspect-video');
  });

  it.each([
    ['square', 'aspect-square'],
    ['video', 'aspect-video'],
    ['wide', 'aspect-[21/9]'],
  ] as const)('debe aplicar aspect-ratio %s correctamente', (ratio, className) => {
    const { container } = render(<SkeletonImage aspectRatio={ratio} />);
    expect(container.firstChild).toHaveClass(className);
  });

  it('debe ocupar ancho completo', () => {
    const { container } = render(<SkeletonImage />);
    expect(container.firstChild).toHaveClass('w-full');
  });
});

// =============================================================================
// SKELETON CARD TESTS
// =============================================================================

describe('SkeletonCard', () => {
  it('debe renderizar sin imagen por defecto', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.aspect-video')).not.toBeInTheDocument();
  });

  it('debe renderizar con imagen cuando hasImage es true', () => {
    const { container } = render(<SkeletonCard hasImage />);
    expect(container.querySelector('.aspect-video')).toBeInTheDocument();
  });

  it('debe tener borde y esquinas redondeadas', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveClass('rounded-2xl', 'border');
  });

  it('debe contener avatar skeleton', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });
});

// =============================================================================
// SKELETON STAT CARD TESTS
// =============================================================================

describe('SkeletonStatCard', () => {
  it('debe renderizar estructura de stat card', () => {
    const { container } = render(<SkeletonStatCard />);
    expect(container.firstChild).toHaveClass('rounded-2xl', 'p-6');
  });

  it('debe contener icono skeleton', () => {
    const { container } = render(<SkeletonStatCard />);
    expect(container.querySelector('.rounded-xl.w-12.h-12')).toBeInTheDocument();
  });
});

// =============================================================================
// SKELETON TABLE TESTS
// =============================================================================

describe('SkeletonTable', () => {
  it('debe renderizar 5 filas por defecto', () => {
    const { container } = render(<SkeletonTable />);
    // Header + 5 filas = 6 divs con border-b
    const rows = container.querySelectorAll('.border-b');
    expect(rows.length).toBe(6);
  });

  it('debe renderizar número personalizado de filas', () => {
    const { container } = render(<SkeletonTable rows={3} />);
    const rows = container.querySelectorAll('.border-b');
    expect(rows.length).toBe(4); // header + 3 rows
  });

  it('debe renderizar 4 columnas por defecto', () => {
    const { container } = render(<SkeletonTable />);
    const headerRow = container.querySelector('.border-b');
    const columns = headerRow?.querySelectorAll('.animate-pulse');
    expect(columns?.length).toBe(4);
  });

  it('debe renderizar número personalizado de columnas', () => {
    const { container } = render(<SkeletonTable columns={6} />);
    const headerRow = container.querySelector('.border-b');
    const columns = headerRow?.querySelectorAll('.animate-pulse');
    expect(columns?.length).toBe(6);
  });
});

// =============================================================================
// SKELETON LIST TESTS
// =============================================================================

describe('SkeletonList', () => {
  it('debe renderizar 5 items por defecto', () => {
    const { container } = render(<SkeletonList />);
    const items = container.querySelectorAll('.flex.items-center.gap-3');
    expect(items.length).toBe(5);
  });

  it('debe renderizar número personalizado de items', () => {
    const { container } = render(<SkeletonList items={3} />);
    const items = container.querySelectorAll('.flex.items-center.gap-3');
    expect(items.length).toBe(3);
  });

  it('debe mostrar avatar por defecto', () => {
    const { container } = render(<SkeletonList items={1} />);
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('debe ocultar avatar cuando hasAvatar es false', () => {
    const { container } = render(<SkeletonList items={1} hasAvatar={false} />);
    expect(container.querySelector('.rounded-full')).not.toBeInTheDocument();
  });
});

// =============================================================================
// SKELETON DASHBOARD TESTS
// =============================================================================

describe('SkeletonDashboard', () => {
  it('debe renderizar estructura de dashboard', () => {
    const { container } = render(<SkeletonDashboard />);
    expect(container.firstChild).toHaveClass('space-y-6', 'animate-fade-in');
  });

  it('debe renderizar 4 stat cards', () => {
    const { container } = render(<SkeletonDashboard />);
    const statCards = container.querySelectorAll('.rounded-2xl.p-6');
    expect(statCards.length).toBeGreaterThanOrEqual(4);
  });

  it('debe renderizar grid de stats', () => {
    const { container } = render(<SkeletonDashboard />);
    expect(container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4')).toBeInTheDocument();
  });
});

// =============================================================================
// SKELETON BALANCE TESTS
// =============================================================================

describe('SkeletonBalance', () => {
  it('debe renderizar estructura de balance', () => {
    const { container } = render(<SkeletonBalance />);
    expect(container.firstChild).toHaveClass('space-y-6', 'animate-fade-in');
  });

  it('debe renderizar tarjeta de total destacada', () => {
    const { container } = render(<SkeletonBalance />);
    expect(container.querySelector('.border-2')).toBeInTheDocument();
  });

  it('debe renderizar grid de áreas', () => {
    const { container } = render(<SkeletonBalance />);
    expect(container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')).toBeInTheDocument();
  });
});

// =============================================================================
// SKELETON USERS TESTS
// =============================================================================

describe('SkeletonUsers', () => {
  it('debe renderizar estructura de página de usuarios', () => {
    const { container } = render(<SkeletonUsers />);
    expect(container.firstChild).toHaveClass('space-y-6', 'animate-fade-in');
  });

  it('debe renderizar 3 stat cards', () => {
    const { container } = render(<SkeletonUsers />);
    const statGrid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-3');
    expect(statGrid).toBeInTheDocument();
    expect(statGrid?.children.length).toBe(3);
  });

  it('debe renderizar área de búsqueda y filtros', () => {
    const { container } = render(<SkeletonUsers />);
    const searchArea = container.querySelector('.flex.gap-4');
    expect(searchArea).toBeInTheDocument();
  });

  it('debe renderizar tabla skeleton', () => {
    const { container } = render(<SkeletonUsers />);
    // La tabla tiene múltiples filas con border-b
    const tableRows = container.querySelectorAll('.border-b');
    expect(tableRows.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// ACCESSIBILITY TESTS
// =============================================================================

describe('Skeleton Accessibility', () => {
  it('los skeletons no deben ser anunciados por lectores de pantalla', () => {
    const { container } = render(<Skeleton />);
    // Los elementos skeleton son decorativos, no deberían tener contenido de texto
    expect(container.textContent).toBe('');
  });

  it('skeletons con children deben mostrar el contenido', () => {
    render(
      <Skeleton>
        <span>Cargando...</span>
      </Skeleton>
    );
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });
});
