/**
 * Modal Component Tests
 */

import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Modal } from '../../compositions/modals/Modal';
import { render, expectComponentToRender, generateTestProps, cleanup } from '../setup';

// Mock createPortal to render in the same container
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));

describe('Modal Component', () => {
  afterEach(cleanup);

  describe('Rendering', () => {
    it('renders when open', () => {
      const props = generateTestProps.modal();
      expectComponentToRender(<Modal {...props} />);
    });

    it('does not render when closed', () => {
      const props = generateTestProps.modal({ isOpen: false });
      const { container } = render(<Modal {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders with title', () => {
      const props = generateTestProps.modal({ title: 'Test Modal Title' });
      render(<Modal {...props} />);
      expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    });

    it('renders with custom content', () => {
      const content = <div data-testid="modal-content">Custom Content</div>;
      const props = generateTestProps.modal({ children: content });
      render(<Modal {...props} />);
      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
      
      sizes.forEach(size => {
        const props = generateTestProps.modal({ size });
        const { rerender } = render(<Modal {...props} />);
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
        rerender(<div />); // Clear for next iteration
      });
    });
  });

  describe('Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      const props = generateTestProps.modal();
      render(<Modal {...props} />);
      
      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);
      
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', () => {
      const props = generateTestProps.modal({ closeOnOverlayClick: true });
      render(<Modal {...props} />);
      
      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);
      
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when overlay is clicked and closeOnOverlayClick is false', () => {
      const props = generateTestProps.modal({ closeOnOverlayClick: false });
      render(<Modal {...props} />);
      
      const overlay = screen.getByTestId('modal-overlay');
      fireEvent.click(overlay);
      
      expect(props.onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const props = generateTestProps.modal({ closeOnEscape: true });
      render(<Modal {...props} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape key is pressed and closeOnEscape is false', () => {
      const props = generateTestProps.modal({ closeOnEscape: false });
      render(<Modal {...props} />);
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(props.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      const props = generateTestProps.modal({ title: 'Test Modal' });
      render(<Modal {...props} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveAttribute('aria-modal', 'true');
      expect(modal).toHaveAttribute('aria-labelledby');
    });

    it('focuses modal when opened', async () => {
      const props = generateTestProps.modal();
      render(<Modal {...props} />);
      
      const modal = screen.getByRole('dialog');
      await waitFor(() => {
        expect(modal).toHaveFocus();
      });
    });

    it('traps focus within modal', () => {
      const props = generateTestProps.modal();
      render(<Modal {...props} />);
      
      const modal = screen.getByRole('dialog');
      const closeButton = screen.getByLabelText('Close modal');
      
      expect(modal).toHaveFocus();
      
      // Tab should move to close button
      fireEvent.keyDown(modal, { key: 'Tab' });
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Body Scroll Lock', () => {
    it('locks body scroll when modal is open', () => {
      const props = generateTestProps.modal();
      render(<Modal {...props} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const props = generateTestProps.modal();
      const { rerender } = render(<Modal {...props} />);
      
      expect(document.body.style.overflow).toBe('hidden');
      
      rerender(<Modal {...props} isOpen={false} />);
      
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Configuration', () => {
    it('hides close button when showCloseButton is false', () => {
      const props = generateTestProps.modal({ showCloseButton: false });
      render(<Modal {...props} />);
      
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('renders without title when title is not provided', () => {
      const props = generateTestProps.modal({ title: undefined });
      render(<Modal {...props} />);
      
      const modal = screen.getByRole('dialog');
      expect(modal).not.toHaveAttribute('aria-labelledby');
    });
  });
});