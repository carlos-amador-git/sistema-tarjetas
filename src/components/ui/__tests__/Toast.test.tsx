/**
 * Tests para componente Toast
 */

import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ToastProvider, useToast } from '../Toast';

// Componente helper para testear el hook
function TestComponent() {
  const { success, error, warning, info, toasts } = useToast();

  return (
    <div>
      <button onClick={() => success('Success!', 'Operation completed')}>
        Show Success
      </button>
      <button onClick={() => error('Error!', 'Something went wrong')}>
        Show Error
      </button>
      <button onClick={() => warning('Warning!', 'Be careful')}>
        Show Warning
      </button>
      <button onClick={() => info('Info', 'Just so you know')}>
        Show Info
      </button>
      <div data-testid="toast-count">{toasts.length}</div>
    </div>
  );
}

describe('Toast System', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('ToastProvider', () => {
    it('debe renderizar children correctamente', () => {
      render(
        <ToastProvider>
          <div>Test Content</div>
        </ToastProvider>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('useToast hook', () => {
    it('debe lanzar error si se usa fuera del provider', () => {
      // Suprimir console.error para este test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useToast must be used within a ToastProvider');

      consoleSpy.mockRestore();
    });

    it('debe mostrar toast de éxito', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    it('debe mostrar toast de error', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Error'));

      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('debe mostrar toast de warning', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Warning'));

      expect(screen.getByText('Warning!')).toBeInTheDocument();
      expect(screen.getByText('Be careful')).toBeInTheDocument();
    });

    it('debe mostrar toast de info', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Info'));

      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(screen.getByText('Just so you know')).toBeInTheDocument();
    });

    it('debe incrementar el contador de toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');

      fireEvent.click(screen.getByText('Show Success'));
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

      fireEvent.click(screen.getByText('Show Error'));
      expect(screen.getByTestId('toast-count')).toHaveTextContent('2');
    });

    it('debe auto-remover toast después del duration', async () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));
      expect(screen.getByText('Success!')).toBeInTheDocument();

      // Avanzar el tiempo para que el toast se auto-remueva (4000ms por defecto)
      act(() => {
        jest.advanceTimersByTime(4500);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success!')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast Item', () => {
    it('debe tener rol de alert para accesibilidad', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('debe poder cerrarse manualmente con el botón X', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));
      expect(screen.getByTestId('toast-count')).toHaveTextContent('1');

      // Encontrar el botón de cerrar dentro del toast
      const alert = screen.getByRole('alert');
      const closeButton = alert.querySelector('button');
      if (closeButton) {
        fireEvent.click(closeButton);
      }

      expect(screen.getByTestId('toast-count')).toHaveTextContent('0');
    });
  });

  describe('Multiple Toasts', () => {
    it('debe poder mostrar múltiples toasts', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));
      fireEvent.click(screen.getByText('Show Error'));
      fireEvent.click(screen.getByText('Show Warning'));

      expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Warning!')).toBeInTheDocument();
    });
  });
});
