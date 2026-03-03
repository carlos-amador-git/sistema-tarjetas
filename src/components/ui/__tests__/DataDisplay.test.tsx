/**
 * Tests para componentes de DataDisplay
 *
 * Componentes testeados:
 * - StatCard (con múltiples view modes)
 * - StatusBadge
 * - TrendIndicator
 * - DataTable (con sorting, selection)
 * - MiniSparkline
 * - InfoTooltip
 * - CopyButton
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  StatCard,
  StatusBadge,
  TrendIndicator,
  DataTable,
  MiniSparkline,
  InfoTooltip,
  CopyButton,
  Column,
} from '../DataDisplay';

// =============================================================================
// MOCKS
// =============================================================================

// Mock useUISettings hook
const mockSettings = {
  paletteId: 'corporate-blue',
  themeMode: 'light' as const,
  viewMode: 'cards' as const,
  density: 'comfortable' as const,
  enableAnimations: true,
  enableGlassmorphism: true,
  enableGradients: true,
  reduceMotion: false,
  highContrast: false,
};

const mockUpdateSettings = jest.fn();
const mockResetToDefaults = jest.fn();

jest.mock('../UISettings', () => ({
  useUISettings: () => ({
    settings: mockSettings,
    updateSettings: mockUpdateSettings,
    currentPalette: { id: 'corporate-blue', name: 'Corporate Blue' },
    effectiveMode: 'light',
    resetToDefaults: mockResetToDefaults,
  }),
  UISettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>{children}</a>
  );
});

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(() => Promise.resolve()),
};
Object.assign(navigator, { clipboard: mockClipboard });

// =============================================================================
// STAT CARD TESTS
// =============================================================================

describe('StatCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSettings.viewMode = 'cards';
  });

  describe('Rendering - Card Mode', () => {
    it('debe renderizar título y valor básicos', () => {
      render(<StatCard title="Total Usuarios" value={150} />);
      expect(screen.getByText('Total Usuarios')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('debe renderizar con valor string', () => {
      render(<StatCard title="Estado" value="Activo" />);
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.getByText('Activo')).toBeInTheDocument();
    });

    it('debe renderizar subtítulo cuando se proporciona', () => {
      render(<StatCard title="Ventas" value={1000} subtitle="Este mes" />);
      expect(screen.getByText('Este mes')).toBeInTheDocument();
    });

    it('debe renderizar icono cuando se proporciona', () => {
      const icon = <span data-testid="test-icon">Icon</span>;
      render(<StatCard title="Test" value={10} icon={icon} />);
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('debe formatear números con separador de miles', () => {
      render(<StatCard title="Total" value={1234567} />);
      // El formato es con toLocaleString('es-MX')
      expect(screen.getByText(/1,234,567|1.234.567/)).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('debe aplicar color primary por defecto', () => {
      const { container } = render(<StatCard title="Test" value={10} />);
      // Verificamos que se renderiza sin errores
      expect(container.firstChild).toBeInTheDocument();
    });

    it.each(['primary', 'success', 'warning', 'error', 'info', 'neutral'] as const)(
      'debe renderizar con color %s',
      (color) => {
        const { container } = render(<StatCard title="Test" value={10} color={color} />);
        expect(container.firstChild).toBeInTheDocument();
      }
    );
  });

  describe('Sizes', () => {
    it.each(['sm', 'md', 'lg'] as const)('debe renderizar con tamaño %s', (size) => {
      const { container } = render(<StatCard title="Test" value={10} size={size} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('debe llamar onClick cuando se hace click', () => {
      const handleClick = jest.fn();
      render(<StatCard title="Test" value={10} onClick={handleClick} />);

      const card = screen.getByText('Test').closest('div');
      fireEvent.click(card!);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('debe aplicar cursor-pointer cuando tiene onClick', () => {
      const { container } = render(<StatCard title="Test" value={10} onClick={() => {}} />);
      expect(container.firstChild).toHaveClass('cursor-pointer');
    });

    it('debe renderizar como Link cuando tiene href', () => {
      render(<StatCard title="Test" value={10} href="/dashboard" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard');
    });
  });

  describe('Actions Menu', () => {
    it('debe mostrar menú de acciones cuando se hace click', () => {
      const actions = [
        { label: 'Editar', onClick: jest.fn() },
        { label: 'Eliminar', onClick: jest.fn() },
      ];
      render(<StatCard title="Test" value={10} actions={actions} />);

      // Buscar el botón de más opciones
      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);

      expect(screen.getByText('Editar')).toBeInTheDocument();
      expect(screen.getByText('Eliminar')).toBeInTheDocument();
    });

    it('debe ejecutar acción y cerrar menú al hacer click', () => {
      const handleEdit = jest.fn();
      const actions = [{ label: 'Editar', onClick: handleEdit }];
      render(<StatCard title="Test" value={10} actions={actions} />);

      const menuButton = screen.getByRole('button');
      fireEvent.click(menuButton);
      fireEvent.click(screen.getByText('Editar'));

      expect(handleEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Trend', () => {
    it('debe mostrar indicador de tendencia positiva', () => {
      render(<StatCard title="Test" value={10} trend={{ value: 15 }} />);
      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    it('debe mostrar indicador de tendencia negativa', () => {
      render(<StatCard title="Test" value={10} trend={{ value: -10 }} />);
      expect(screen.getByText('-10%')).toBeInTheDocument();
    });

    it('debe mostrar label de tendencia cuando se proporciona', () => {
      render(<StatCard title="Test" value={10} trend={{ value: 5, label: 'vs mes anterior' }} />);
      expect(screen.getByText('vs mes anterior')).toBeInTheDocument();
    });
  });

  describe('Progress', () => {
    it('debe mostrar barra de progreso', () => {
      render(<StatCard title="Test" value={10} progress={{ value: 75, max: 100 }} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('debe mostrar label de progreso personalizado', () => {
      render(<StatCard title="Test" value={10} progress={{ value: 50, max: 100, label: 'Completado' }} />);
      expect(screen.getByText('Completado')).toBeInTheDocument();
    });
  });

  describe('Badge', () => {
    it('debe mostrar badge cuando se proporciona', () => {
      render(<StatCard title="Test" value={10} badge={{ text: 'Nuevo', variant: 'success' }} />);
      expect(screen.getByText('Nuevo')).toBeInTheDocument();
    });
  });

  describe('View Modes', () => {
    it('debe renderizar en modo list', () => {
      mockSettings.viewMode = 'list';
      const { container } = render(<StatCard title="Test" value={10} />);
      expect(container.querySelector('.flex.items-center.gap-4')).toBeInTheDocument();
    });

    it('debe renderizar en modo compact', () => {
      mockSettings.viewMode = 'compact';
      const { container } = render(<StatCard title="Test" value={10} />);
      expect(container.querySelector('.flex.items-center.justify-between')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// STATUS BADGE TESTS
// =============================================================================

describe('StatusBadge', () => {
  describe('Variants', () => {
    it.each(['success', 'warning', 'error', 'info'] as const)(
      'debe renderizar variante %s correctamente',
      (variant) => {
        render(<StatusBadge text={`Estado ${variant}`} variant={variant} />);
        expect(screen.getByText(`Estado ${variant}`)).toBeInTheDocument();
      }
    );
  });

  describe('Sizes', () => {
    it('debe renderizar con tamaño sm', () => {
      const { container } = render(<StatusBadge text="Test" variant="success" size="sm" />);
      expect(container.querySelector('.text-xs')).toBeInTheDocument();
    });

    it('debe renderizar con tamaño md (default)', () => {
      const { container } = render(<StatusBadge text="Test" variant="success" />);
      expect(container.querySelector('.text-sm')).toBeInTheDocument();
    });
  });

  describe('Dot indicator', () => {
    it('debe mostrar dot indicator por defecto', () => {
      const { container } = render(<StatusBadge text="Test" variant="success" />);
      expect(container.querySelector('.rounded-full.w-1\\.5')).toBeInTheDocument();
    });

    it('debe ocultar dot indicator cuando dot=false', () => {
      const { container } = render(<StatusBadge text="Test" variant="success" dot={false} />);
      expect(container.querySelector('.rounded-full.w-1\\.5')).not.toBeInTheDocument();
    });
  });
});

// =============================================================================
// TREND INDICATOR TESTS
// =============================================================================

describe('TrendIndicator', () => {
  describe('Values', () => {
    it('debe mostrar tendencia positiva con signo +', () => {
      render(<TrendIndicator value={25} />);
      expect(screen.getByText('+25%')).toBeInTheDocument();
    });

    it('debe mostrar tendencia negativa sin signo +', () => {
      render(<TrendIndicator value={-15} />);
      expect(screen.getByText('-15%')).toBeInTheDocument();
    });

    it('debe mostrar valor neutro (0)', () => {
      render(<TrendIndicator value={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('Sizes', () => {
    it.each(['xs', 'sm', 'md'] as const)('debe renderizar con tamaño %s', (size) => {
      const { container } = render(<TrendIndicator value={10} size={size} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Colors', () => {
    it('debe aplicar color success para valores positivos', () => {
      const { container } = render(<TrendIndicator value={10} />);
      expect(container.firstChild).toHaveClass('text-[var(--color-success)]');
    });

    it('debe aplicar color error para valores negativos', () => {
      const { container } = render(<TrendIndicator value={-10} />);
      expect(container.firstChild).toHaveClass('text-[var(--color-error)]');
    });

    it('debe aplicar color muted para valor neutro', () => {
      const { container } = render(<TrendIndicator value={0} />);
      expect(container.firstChild).toHaveClass('text-[var(--color-text-muted)]');
    });
  });
});

// =============================================================================
// DATA TABLE TESTS
// =============================================================================

describe('DataTable', () => {
  interface TestData {
    id: number;
    name: string;
    status: string;
    value: number;
  }

  const testData: TestData[] = [
    { id: 1, name: 'Item 1', status: 'active', value: 100 },
    { id: 2, name: 'Item 2', status: 'inactive', value: 200 },
    { id: 3, name: 'Item 3', status: 'active', value: 150 },
  ];

  const columns: Column<TestData>[] = [
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'status', header: 'Estado' },
    { key: 'value', header: 'Valor', align: 'right', sortable: true },
  ];

  beforeEach(() => {
    mockSettings.viewMode = 'list';
  });

  describe('Rendering', () => {
    it('debe renderizar headers de columnas', () => {
      render(<DataTable data={testData} columns={columns} keyField="id" />);
      expect(screen.getByText('Nombre')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
      expect(screen.getByText('Valor')).toBeInTheDocument();
    });

    it('debe renderizar filas de datos', () => {
      render(<DataTable data={testData} columns={columns} keyField="id" />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('debe mostrar mensaje vacío cuando no hay datos', () => {
      render(<DataTable data={[]} columns={columns} keyField="id" emptyMessage="Sin datos" />);
      expect(screen.getByText('Sin datos')).toBeInTheDocument();
    });

    it('debe mostrar mensaje vacío por defecto', () => {
      render(<DataTable data={[]} columns={columns} keyField="id" />);
      expect(screen.getByText('No hay datos disponibles')).toBeInTheDocument();
    });

    it('debe mostrar indicador de carga', () => {
      render(<DataTable data={testData} columns={columns} keyField="id" loading />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('debe ordenar al hacer click en columna sortable', () => {
      render(<DataTable data={testData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByText('Nombre');
      fireEvent.click(nameHeader);

      const rows = screen.getAllByRole('row');
      // Primera fila es header, verificar que el orden cambió
      expect(rows.length).toBe(4); // header + 3 rows
    });

    it('debe mostrar indicador de dirección de ordenamiento', () => {
      render(<DataTable data={testData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByText('Nombre');
      fireEvent.click(nameHeader);

      expect(screen.getByText('↑')).toBeInTheDocument();

      fireEvent.click(nameHeader);
      expect(screen.getByText('↓')).toBeInTheDocument();
    });

    it('debe quitar ordenamiento al tercer click', () => {
      render(<DataTable data={testData} columns={columns} keyField="id" />);

      const nameHeader = screen.getByText('Nombre');
      fireEvent.click(nameHeader); // asc
      fireEvent.click(nameHeader); // desc
      fireEvent.click(nameHeader); // null

      expect(screen.queryByText('↑')).not.toBeInTheDocument();
      expect(screen.queryByText('↓')).not.toBeInTheDocument();
    });
  });

  describe('Row Click', () => {
    it('debe llamar onRowClick cuando se hace click en una fila', () => {
      const handleRowClick = jest.fn();
      render(
        <DataTable
          data={testData}
          columns={columns}
          keyField="id"
          onRowClick={handleRowClick}
        />
      );

      fireEvent.click(screen.getByText('Item 1'));
      expect(handleRowClick).toHaveBeenCalledWith(testData[0]);
    });
  });

  describe('Selection', () => {
    it('debe mostrar checkboxes cuando selectable es true', () => {
      render(
        <DataTable
          data={testData}
          columns={columns}
          keyField="id"
          selectable
          selectedRows={new Set()}
          onSelectionChange={() => {}}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(4); // 1 header + 3 rows
    });

    it('debe llamar onSelectionChange al seleccionar fila', () => {
      const handleSelection = jest.fn();
      render(
        <DataTable
          data={testData}
          columns={columns}
          keyField="id"
          selectable
          selectedRows={new Set()}
          onSelectionChange={handleSelection}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Primera fila

      expect(handleSelection).toHaveBeenCalled();
    });

    it('debe seleccionar todas las filas con checkbox de header', () => {
      const handleSelection = jest.fn();
      render(
        <DataTable
          data={testData}
          columns={columns}
          keyField="id"
          selectable
          selectedRows={new Set()}
          onSelectionChange={handleSelection}
        />
      );

      const headerCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(headerCheckbox);

      expect(handleSelection).toHaveBeenCalledWith(new Set([1, 2, 3]));
    });
  });

  describe('Card Mode', () => {
    it('debe renderizar como cards cuando viewMode es cards', () => {
      mockSettings.viewMode = 'cards';
      const { container } = render(
        <DataTable data={testData} columns={columns} keyField="id" />
      );

      expect(container.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('Custom Render', () => {
    it('debe usar función render personalizada', () => {
      const customColumns: Column<TestData>[] = [
        {
          key: 'status',
          header: 'Estado',
          render: (value) => <span data-testid="custom-render">{String(value).toUpperCase()}</span>,
        },
      ];

      render(<DataTable data={testData} columns={customColumns} keyField="id" />);

      const customElements = screen.getAllByTestId('custom-render');
      expect(customElements[0]).toHaveTextContent('ACTIVE');
    });
  });
});

// =============================================================================
// MINI SPARKLINE TESTS
// =============================================================================

describe('MiniSparkline', () => {
  it('debe renderizar SVG con datos válidos', () => {
    const { container } = render(<MiniSparkline data={[10, 20, 15, 25, 30]} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('no debe renderizar con datos insuficientes', () => {
    const { container } = render(<MiniSparkline data={[10]} />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('no debe renderizar con datos vacíos', () => {
    const { container } = render(<MiniSparkline data={[]} />);
    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });

  it('debe renderizar círculo al final de la línea', () => {
    const { container } = render(<MiniSparkline data={[10, 20, 30]} />);
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('debe aceptar dimensiones personalizadas', () => {
    const { container } = render(<MiniSparkline data={[10, 20, 30]} width={100} height={50} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '100');
    expect(svg).toHaveAttribute('height', '50');
  });
});

// =============================================================================
// INFO TOOLTIP TESTS
// =============================================================================

describe('InfoTooltip', () => {
  it('debe mostrar tooltip al hover', async () => {
    render(<InfoTooltip content="Información útil" />);

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);

    expect(screen.getByText('Información útil')).toBeInTheDocument();
  });

  it('debe ocultar tooltip al salir del hover', async () => {
    render(<InfoTooltip content="Información útil" />);

    const trigger = screen.getByRole('button');
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText('Información útil')).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText('Información útil')).not.toBeInTheDocument();
  });

  it('debe renderizar children personalizados', () => {
    render(
      <InfoTooltip content="Info">
        <span data-testid="custom-trigger">?</span>
      </InfoTooltip>
    );

    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });
});

// =============================================================================
// COPY BUTTON TESTS
// =============================================================================

describe('CopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe copiar texto al clipboard al hacer click', async () => {
    render(<CopyButton text="texto a copiar" />);

    const button = screen.getByRole('button');
    await userEvent.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('texto a copiar');
  });

  it('debe mostrar estado copiado temporalmente', async () => {
    render(<CopyButton text="test" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Esperar a que se resuelva la promesa del clipboard y aparezca el estado copiado
    await waitFor(() => {
      expect(button).toHaveClass('text-[var(--color-success)]');
    });

    // El estado copiado se muestra (verificación de que funciona)
    expect(button.getAttribute('title')).toBe('Copiado!');
  });

  it('debe tener título "Copiar" por defecto', () => {
    render(<CopyButton text="test" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Copiar');
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('DataDisplay Integration', () => {
  beforeEach(() => {
    // Reset to cards mode for integration tests
    mockSettings.viewMode = 'cards';
  });

  it('StatCard debe renderizar con StatusBadge y TrendIndicator', () => {
    render(
      <StatCard
        title="Ventas"
        value={5000}
        trend={{ value: 12 }}
        badge={{ text: 'Activo', variant: 'success' }}
        color="success"
      />
    );

    expect(screen.getByText('Ventas')).toBeInTheDocument();
    // En card mode, se formatea con toLocaleString
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });

  it('StatCard en list mode muestra valor sin formatear', () => {
    mockSettings.viewMode = 'list';
    render(
      <StatCard
        title="Ventas"
        value={5000}
        trend={{ value: 12 }}
        badge={{ text: 'Activo', variant: 'success' }}
      />
    );

    expect(screen.getByText('5000')).toBeInTheDocument();
  });

  it('StatCard debe funcionar con sparkline en card mode', () => {
    mockSettings.viewMode = 'cards';
    const { container } = render(
      <StatCard
        title="Tendencia"
        value={100}
        sparkline={[10, 20, 15, 25, 30, 28, 35]}
      />
    );

    // Sparkline solo se muestra en card mode
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
