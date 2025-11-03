/**
 * Test Setup for Design System Components
 * 
 * Common setup and utilities for component testing.
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '../ThemeProvider';

// Custom render function with theme provider
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { customRender as render };

// Custom matchers and utilities
export const expectComponentToRender = (component: ReactElement) => {
  const { container } = customRender(component);
  expect(container.firstChild).toBeInTheDocument();
};

export const expectComponentToHaveProps = <T extends Record<string, unknown>>(
  component: ReactElement,
  props: Partial<T>
) => {
  const { container } = customRender(component);
  const element = container.firstChild as HTMLElement;
  
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'className') {
      expect(element).toHaveClass(value as string);
    } else if (key.startsWith('data-')) {
      expect(element).toHaveAttribute(key, value as string);
    }
  });
};

// Mock functions for common use cases
export const mockFunctions = {
  onClick: jest.fn(),
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  onChange: jest.fn(),
};

// Test data generators
export const generateTestProps = {
  button: (overrides = {}) => ({
    children: 'Test Button',
    onClick: mockFunctions.onClick,
    ...overrides,
  }),
  
  input: (overrides = {}) => ({
    label: 'Test Input',
    name: 'test-input',
    ...overrides,
  }),
  
  modal: (overrides = {}) => ({
    isOpen: true,
    onClose: mockFunctions.onClose,
    title: 'Test Modal',
    children: <div>Modal Content</div>,
    ...overrides,
  }),
};

// Cleanup function
export const cleanup = () => {
  Object.values(mockFunctions).forEach(mock => mock.mockClear());
};