/**
 * BaseInput Component Tests
 */

import { fireEvent, screen } from '@testing-library/react';
import { BaseInput } from '../../primitives/BaseInput';
import { render, expectComponentToRender, generateTestProps, cleanup } from '../setup';

describe('BaseInput Component', () => {
  afterEach(cleanup);

  describe('Rendering', () => {
    it('renders correctly with default props', () => {
      const props = generateTestProps.input();
      expectComponentToRender(<BaseInput {...props} />);
    });

    it('renders with label', () => {
      render(<BaseInput label="Test Label" name="test" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('renders with required indicator', () => {
      render(<BaseInput label="Required Field" name="test" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('renders with helper text', () => {
      render(
        <BaseInput 
          label="Test" 
          name="test" 
          helperText="This is helper text" 
        />
      );
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(
        <BaseInput 
          label="Test" 
          name="test" 
          error="This field is required" 
        />
      );
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('handles input changes', () => {
      const onChange = jest.fn();
      render(<BaseInput label="Test" name="test" onChange={onChange} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(input).toHaveValue('test value');
    });

    it('handles focus and blur events', () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      
      render(
        <BaseInput 
          label="Test" 
          name="test" 
          onFocus={onFocus}
          onBlur={onBlur}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      fireEvent.focus(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
      
      fireEvent.blur(input);
      expect(onBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('States', () => {
    it('shows disabled state correctly', () => {
      render(<BaseInput label="Test" name="test" disabled />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('shows loading state correctly', () => {
      render(<BaseInput label="Test" name="test" loading />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('shows error state correctly', () => {
      render(
        <BaseInput 
          label="Test" 
          name="test" 
          error="Error message"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(
        <BaseInput 
          label="Test Label" 
          name="test"
          helperText="Helper text"
          required
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('associates label with input', () => {
      render(<BaseInput label="Test Label" name="test" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('supports keyboard navigation', () => {
      render(<BaseInput label="Test" name="test" />);
      
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Validation', () => {
    it('shows validation error', () => {
      render(
        <BaseInput 
          label="Email" 
          name="email" 
          type="email"
          error="Please enter a valid email"
        />
      );
      
      const input = screen.getByRole('textbox');
      const error = screen.getByText('Please enter a valid email');
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(error).toBeInTheDocument();
    });

    it('clears error when input becomes valid', () => {
      const { rerender } = render(
        <BaseInput 
          label="Test" 
          name="test" 
          error="Error message"
        />
      );
      
      expect(screen.getByText('Error message')).toBeInTheDocument();
      
      rerender(<BaseInput label="Test" name="test" />);
      
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });
});