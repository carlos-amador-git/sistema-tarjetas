/**
 * Tests para componentes EmptyState
 *
 * Componentes testeados:
 * - EmptyState (base)
 * - EmptyStateNoResults
 * - EmptyStateNoData
 * - EmptyStateNoUsers
 * - EmptyStateNoProducts
 * - EmptyStateNoOrders
 * - EmptyStateNoHistory
 * - EmptyStateNoFiles
 * - EmptyStateFiltered
 * - EmptyStateError
 * - EmptyStateWrapper
 */

import { render, screen, fireEvent } from '@testing-library/react';
import {
  EmptyState,
  EmptyStateNoResults,
  EmptyStateNoData,
  EmptyStateNoUsers,
  EmptyStateNoProducts,
  EmptyStateNoOrders,
  EmptyStateNoHistory,
  EmptyStateNoFiles,
  EmptyStateFiltered,
  EmptyStateError,
  EmptyStateWrapper,
} from '../EmptyState';

// =============================================================================
// EMPTY STATE BASE TESTS
// =============================================================================

describe('EmptyState', () => {
  describe('Rendering', () => {
    it('debe renderizar título', () => {
      render(<EmptyState title="Sin datos" />);
      expect(screen.getByText('Sin datos')).toBeInTheDocument();
    });

    it('debe renderizar descripción cuando se proporciona', () => {
      render(
        <EmptyState
          title="Sin datos"
          description="No hay elementos disponibles"
        />
      );
      expect(screen.getByText('No hay elementos disponibles')).toBeInTheDocument();
    });

    it('no debe renderizar descripción cuando no se proporciona', () => {
      render(<EmptyState title="Sin datos" />);
      const description = screen.queryByText(/No hay/);
      expect(description).not.toBeInTheDocument();
    });

    it('debe renderizar icono personalizado', () => {
      const icon = <span data-testid="custom-icon">Icon</span>;
      render(<EmptyState title="Test" icon={icon} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('debe renderizar icono por defecto (Inbox) cuando no se proporciona', () => {
      const { container } = render(<EmptyState title="Test" />);
      // Verificamos que hay un SVG renderizado (el Inbox icon)
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it('debe renderizar con tamaño sm', () => {
      const { container } = render(<EmptyState title="Test" size="sm" />);
      expect(container.querySelector('.py-8')).toBeInTheDocument();
    });

    it('debe renderizar con tamaño md (default)', () => {
      const { container } = render(<EmptyState title="Test" />);
      expect(container.querySelector('.py-12')).toBeInTheDocument();
    });

    it('debe renderizar con tamaño lg', () => {
      const { container } = render(<EmptyState title="Test" size="lg" />);
      expect(container.querySelector('.py-16')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('debe renderizar botón de acción primaria', () => {
      const handleClick = jest.fn();
      render(
        <EmptyState
          title="Test"
          action={{ label: 'Agregar', onClick: handleClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Agregar' });
      expect(button).toBeInTheDocument();
    });

    it('debe llamar onClick cuando se hace click en acción', () => {
      const handleClick = jest.fn();
      render(
        <EmptyState
          title="Test"
          action={{ label: 'Agregar', onClick: handleClick }}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('debe renderizar acción secundaria', () => {
      const handleClick = jest.fn();
      render(
        <EmptyState
          title="Test"
          secondaryAction={{ label: 'Cancelar', onClick: handleClick }}
        />
      );

      const button = screen.getByRole('button', { name: 'Cancelar' });
      expect(button).toBeInTheDocument();
    });

    it('debe renderizar ambas acciones', () => {
      render(
        <EmptyState
          title="Test"
          action={{ label: 'Primario', onClick: () => {} }}
          secondaryAction={{ label: 'Secundario', onClick: () => {} }}
        />
      );

      expect(screen.getByRole('button', { name: 'Primario' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Secundario' })).toBeInTheDocument();
    });

    it('debe aplicar variante secondary al botón', () => {
      render(
        <EmptyState
          title="Test"
          action={{ label: 'Acción', onClick: () => {}, variant: 'secondary' }}
        />
      );

      const button = screen.getByRole('button', { name: 'Acción' });
      expect(button).toHaveClass('bg-[var(--color-surface-hover,#f1f5f9)]');
    });
  });

  describe('Custom className', () => {
    it('debe aplicar className personalizado', () => {
      const { container } = render(
        <EmptyState title="Test" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

// =============================================================================
// PRESET COMPONENTS TESTS
// =============================================================================

describe('EmptyState Presets', () => {
  describe('EmptyStateNoResults', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateNoResults />);
      expect(screen.getByText('Sin resultados')).toBeInTheDocument();
    });

    it('debe mostrar descripción de búsqueda', () => {
      render(<EmptyStateNoResults />);
      expect(screen.getByText(/No se encontraron elementos/)).toBeInTheDocument();
    });

    it('debe mostrar botón por defecto "Limpiar búsqueda"', () => {
      render(<EmptyStateNoResults />);
      expect(screen.getByRole('button', { name: 'Limpiar búsqueda' })).toBeInTheDocument();
    });

    it('debe usar acción personalizada cuando se proporciona', () => {
      const handleClick = jest.fn();
      render(
        <EmptyStateNoResults
          action={{ label: 'Buscar otra vez', onClick: handleClick }}
        />
      );
      expect(screen.getByRole('button', { name: 'Buscar otra vez' })).toBeInTheDocument();
    });
  });

  describe('EmptyStateNoData', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateNoData />);
      expect(screen.getByText('Sin datos')).toBeInTheDocument();
    });

    it('debe mostrar descripción apropiada', () => {
      render(<EmptyStateNoData />);
      expect(screen.getByText(/Aún no hay información disponible/)).toBeInTheDocument();
    });
  });

  describe('EmptyStateNoUsers', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateNoUsers />);
      expect(screen.getByText('Sin usuarios')).toBeInTheDocument();
    });

    it('debe mostrar botón "Agregar usuario" por defecto', () => {
      render(<EmptyStateNoUsers />);
      expect(screen.getByRole('button', { name: 'Agregar usuario' })).toBeInTheDocument();
    });
  });

  describe('EmptyStateNoProducts', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateNoProducts />);
      expect(screen.getByText('Sin productos')).toBeInTheDocument();
    });

    it('debe mostrar botón "Agregar producto" por defecto', () => {
      render(<EmptyStateNoProducts />);
      expect(screen.getByRole('button', { name: 'Agregar producto' })).toBeInTheDocument();
    });
  });

  describe('EmptyStateNoOrders', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateNoOrders />);
      expect(screen.getByText('Sin órdenes')).toBeInTheDocument();
    });

    it('debe mostrar botón "Nueva orden" por defecto', () => {
      render(<EmptyStateNoOrders />);
      expect(screen.getByRole('button', { name: 'Nueva orden' })).toBeInTheDocument();
    });
  });

  describe('EmptyStateNoHistory', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateNoHistory />);
      expect(screen.getByText('Sin historial')).toBeInTheDocument();
    });

    it('debe mostrar botón "Cambiar filtros" por defecto', () => {
      render(<EmptyStateNoHistory />);
      expect(screen.getByRole('button', { name: 'Cambiar filtros' })).toBeInTheDocument();
    });
  });

  describe('EmptyStateNoFiles', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateNoFiles />);
      expect(screen.getByText('Sin archivos')).toBeInTheDocument();
    });

    it('no debe mostrar botón cuando no se proporciona acción', () => {
      render(<EmptyStateNoFiles />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('EmptyStateFiltered', () => {
    it('debe renderizar con título correcto', () => {
      render(<EmptyStateFiltered />);
      expect(screen.getByText('Sin coincidencias')).toBeInTheDocument();
    });

    it('debe mostrar botón "Limpiar filtros" por defecto', () => {
      render(<EmptyStateFiltered />);
      expect(screen.getByRole('button', { name: 'Limpiar filtros' })).toBeInTheDocument();
    });
  });

  describe('EmptyStateError', () => {
    it('debe renderizar con título de error', () => {
      render(<EmptyStateError />);
      expect(screen.getByText('Error al cargar')).toBeInTheDocument();
    });

    it('debe mostrar mensaje de error por defecto', () => {
      render(<EmptyStateError />);
      expect(screen.getByText(/Ocurrió un error al cargar los datos/)).toBeInTheDocument();
    });

    it('debe mostrar mensaje de error personalizado', () => {
      render(<EmptyStateError message="Error de conexión" />);
      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });

    it('debe mostrar botón "Reintentar" por defecto', () => {
      render(<EmptyStateError />);
      expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
    });
  });
});

// =============================================================================
// EMPTY STATE WRAPPER TESTS
// =============================================================================

describe('EmptyStateWrapper', () => {
  const childContent = <div data-testid="content">Contenido</div>;
  const emptyState = <EmptyState title="Vacío" />;
  const loadingState = <div data-testid="loading">Cargando...</div>;

  describe('Rendering states', () => {
    it('debe mostrar children cuando no está vacío', () => {
      render(
        <EmptyStateWrapper isEmpty={false} emptyState={emptyState}>
          {childContent}
        </EmptyStateWrapper>
      );
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });

    it('debe mostrar emptyState cuando está vacío', () => {
      render(
        <EmptyStateWrapper isEmpty={true} emptyState={emptyState}>
          {childContent}
        </EmptyStateWrapper>
      );
      expect(screen.getByText('Vacío')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('debe mostrar loadingState cuando está cargando', () => {
      render(
        <EmptyStateWrapper
          isEmpty={true}
          isLoading={true}
          loadingState={loadingState}
          emptyState={emptyState}
        >
          {childContent}
        </EmptyStateWrapper>
      );
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByText('Vacío')).not.toBeInTheDocument();
    });

    it('debe mostrar EmptyStateError cuando hay error', () => {
      render(
        <EmptyStateWrapper
          isEmpty={false}
          isError={true}
          emptyState={emptyState}
        >
          {childContent}
        </EmptyStateWrapper>
      );
      expect(screen.getByText('Error al cargar')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('debe mostrar mensaje de error personalizado', () => {
      render(
        <EmptyStateWrapper
          isEmpty={false}
          isError={true}
          errorMessage="Error de red"
          emptyState={emptyState}
        >
          {childContent}
        </EmptyStateWrapper>
      );
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  describe('Priority of states', () => {
    it('loading tiene prioridad sobre error', () => {
      render(
        <EmptyStateWrapper
          isEmpty={true}
          isLoading={true}
          isError={true}
          loadingState={loadingState}
          emptyState={emptyState}
        >
          {childContent}
        </EmptyStateWrapper>
      );
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByText('Error al cargar')).not.toBeInTheDocument();
    });

    it('error tiene prioridad sobre empty', () => {
      render(
        <EmptyStateWrapper
          isEmpty={true}
          isError={true}
          emptyState={emptyState}
        >
          {childContent}
        </EmptyStateWrapper>
      );
      expect(screen.getByText('Error al cargar')).toBeInTheDocument();
      expect(screen.queryByText('Vacío')).not.toBeInTheDocument();
    });
  });
});
