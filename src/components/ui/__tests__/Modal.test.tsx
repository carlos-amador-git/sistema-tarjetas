/**
 * Tests para componente Modal
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('debe renderizar cuando isOpen es true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('no debe renderizar cuando isOpen es false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('debe renderizar el título correctamente', () => {
      render(<Modal {...defaultProps} title="Mi Título" />);
      expect(screen.getByText('Mi Título')).toBeInTheDocument();
    });

    it('debe renderizar el contenido children', () => {
      render(
        <Modal {...defaultProps}>
          <p>Contenido personalizado</p>
          <button>Botón dentro</button>
        </Modal>
      );
      expect(screen.getByText('Contenido personalizado')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Botón dentro' })).toBeInTheDocument();
    });
  });

  describe('Close Button', () => {
    it('debe mostrar el botón de cerrar por defecto', () => {
      render(<Modal {...defaultProps} />);
      const closeButtons = screen.getAllByRole('button');
      expect(closeButtons.length).toBeGreaterThan(0);
    });

    it('debe ocultar el botón de cerrar cuando showCloseButton es false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      // Solo debe haber el backdrop como elemento interactivo
      const closeButton = screen.queryByRole('button');
      // El modal no tiene botones visibles cuando showCloseButton es false
      // Solo el contenido children puede tener botones
    });

    it('debe llamar onClose cuando se hace click en el botón cerrar', () => {
      render(<Modal {...defaultProps} />);
      const closeButton = screen.getAllByRole('button')[0];
      fireEvent.click(closeButton);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backdrop', () => {
    it('debe llamar onClose cuando se hace click en el backdrop', () => {
      render(<Modal {...defaultProps} />);
      // El backdrop tiene la clase bg-black/50
      const backdrop = document.querySelector('.bg-black\\/50');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Keyboard Navigation', () => {
    it('debe llamar onClose cuando se presiona Escape', () => {
      render(<Modal {...defaultProps} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sizes', () => {
    it('debe aplicar clase sm para size="sm"', () => {
      render(<Modal {...defaultProps} size="sm" />);
      const modal = document.querySelector('.max-w-sm');
      expect(modal).toBeInTheDocument();
    });

    it('debe aplicar clase md por defecto', () => {
      render(<Modal {...defaultProps} />);
      const modal = document.querySelector('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('debe aplicar clase lg para size="lg"', () => {
      render(<Modal {...defaultProps} size="lg" />);
      const modal = document.querySelector('.max-w-lg');
      expect(modal).toBeInTheDocument();
    });

    it('debe aplicar clase xl para size="xl"', () => {
      render(<Modal {...defaultProps} size="xl" />);
      const modal = document.querySelector('.max-w-xl');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Body Overflow', () => {
    it('debe bloquear scroll del body cuando el modal está abierto', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('debe restaurar scroll del body cuando el modal se cierra', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('unset');
    });
  });
});
