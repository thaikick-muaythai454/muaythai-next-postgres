/**
 * Button Component Tests
 */

import { fireEvent, screen } from '@testing-library/react';
import { Button } from '../../primitives/Button';
import { render, expectComponentToRender, generateTestProps, cleanup } from '../setup';

describe('Button Component', () => {
  afterEach(cleanup);

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const props = generateTestProps.button();
      expectComponentToRender(<Button {...props} />);
    });

    it('renders with custom text', () => {
      render(<Button>Custom Button Text</Button>);
      expect(screen.getByText('Custom Button Text')).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const variants = ['primary', 'secondary', 'danger', 'ghost'] as const;
      
      variants.forEach(variant => {
        const { rerender } = render(<Button variant={variant}>Test</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        rerender(<div />); // Clear for next iteration
      });
    });

    it('renders with different sizes', () => {
      const sizes = ['sm', 'md', 'lg'] as const;
      
      sizes.forEach(size => {
        const { rerender } = render(<Button size={size}>Test</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        rerender(<div />); // Clear for next iteration
      });
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const props = generateTestProps.button();
      render(<Button {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(props.onClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const props = generateTestProps.button({ disabled: true });
      render(<Button {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(props.onClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const props = generateTestProps.button({ loading: true });
      render(<Button {...props} />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(props.onClick).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('shows loading state correctly', () => {
      render(<Button loading>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('shows disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<Button aria-label="Custom Label">Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('supports keyboard navigation', () => {
      const props = generateTestProps.button();
      render(<Button {...props} />);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(props.onClick).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(button, { key: ' ' });
      expect(props.onClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Icons', () => {
    it('renders with left icon', () => {
      const leftIcon = <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={leftIcon}>With Left Icon</Button>);
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByText('With Left Icon')).toBeInTheDocument();
    });

    it('renders with right icon', () => {
      const rightIcon = <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={rightIcon}>With Right Icon</Button>);
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      expect(screen.getByText('With Right Icon')).toBeInTheDocument();
    });

    it('renders icon-only button', () => {
      const icon = <span data-testid="icon">⚡</span>;
      render(<Button leftIcon={icon} aria-label="Icon Button" />);
      
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByLabelText('Icon Button')).toBeInTheDocument();
    });
  });
});