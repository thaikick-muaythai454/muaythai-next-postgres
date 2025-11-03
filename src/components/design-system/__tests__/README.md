# Design System Testing Guide

## Overview

This directory contains comprehensive tests for the design system components, ensuring reliability, accessibility, and performance.

## Test Structure

```
__tests__/
├── setup.ts                    # Test setup and utilities
├── README.md                   # This file
├── primitives/                 # Tests for primitive components
│   ├── Button.test.tsx
│   ├── BaseInput.test.tsx
│   ├── Card.test.tsx
│   └── ...
├── compositions/               # Tests for composed components
│   ├── Modal.test.tsx
│   ├── DataTable.test.tsx
│   ├── FormLayout.test.tsx
│   └── ...
└── utils/                      # Tests for utilities
    ├── performance.test.ts
    ├── lazy.test.ts
    └── ...
```

## Running Tests

### Prerequisites

Install testing dependencies:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

### Run All Tests
```bash
npm run test:components
```

### Run Specific Test Files
```bash
# Test specific component
npm test Button.test.tsx

# Test specific category
npm test primitives/

# Test with watch mode
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm run test:components:coverage
```

## Test Categories

### 1. Primitive Components
Tests for basic building blocks:
- **Button**: Variants, states, interactions, accessibility
- **BaseInput**: Validation, states, keyboard navigation
- **Card**: Layouts, variants, composition
- **Container**: Responsive behavior, spacing
- **Loading**: States, animations, accessibility

### 2. Composed Components
Tests for complex compositions:
- **Modal**: Portal rendering, focus management, keyboard navigation
- **DataTable**: Sorting, pagination, row interactions
- **FormLayout**: Field organization, validation display
- **EmptyState**: Variants, actions, accessibility

### 3. Utilities
Tests for helper functions:
- **Performance**: Monitoring, optimization utilities
- **Lazy Loading**: Component loading, error handling
- **Exports**: Tree-shaking, bundle optimization

## Testing Patterns

### Component Rendering
```typescript
import { render, screen } from '../setup';
import { Button } from '../../primitives/Button';

test('renders correctly', () => {
  render(<Button>Test Button</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### User Interactions
```typescript
import { fireEvent } from '../setup';

test('handles click events', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Click Me</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

### Accessibility Testing
```typescript
test('has correct ARIA attributes', () => {
  render(<Button aria-label="Close dialog">×</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-label', 'Close dialog');
});
```

### State Testing
```typescript
test('shows loading state', () => {
  render(<Button loading>Loading...</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
});
```

## Custom Test Utilities

### Setup Functions
- `render()`: Custom render with ThemeProvider
- `expectComponentToRender()`: Assert component renders
- `expectComponentToHaveProps()`: Assert component props
- `generateTestProps()`: Generate test data

### Mock Functions
- `mockFunctions.onClick`: Mock click handler
- `mockFunctions.onSubmit`: Mock form submission
- `mockFunctions.onClose`: Mock close handler
- `mockFunctions.onChange`: Mock change handler

### Test Data Generators
```typescript
import { generateTestProps } from '../setup';

const buttonProps = generateTestProps.button({
  variant: 'primary',
  size: 'lg'
});

const inputProps = generateTestProps.input({
  required: true,
  error: 'This field is required'
});
```

## Best Practices

### 1. Test Structure
- **Arrange**: Set up test data and components
- **Act**: Perform user interactions
- **Assert**: Verify expected outcomes

### 2. Accessibility First
- Test keyboard navigation
- Verify ARIA attributes
- Check screen reader compatibility
- Test focus management

### 3. User-Centric Testing
- Test from user perspective
- Use semantic queries (getByRole, getByLabelText)
- Avoid implementation details
- Test actual user workflows

### 4. Performance Testing
- Test with large datasets
- Verify render times
- Check memory usage
- Test lazy loading behavior

### 5. Error Handling
- Test error states
- Verify error messages
- Test recovery scenarios
- Check fallback behavior

## Visual Regression Testing

### Setup Storybook
```bash
npm install --save-dev @storybook/react @storybook/addon-essentials
```

### Create Stories
```typescript
// Button.stories.tsx
export default {
  title: 'Primitives/Button',
  component: Button,
};

export const Primary = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};
```

### Run Visual Tests
```bash
npm run storybook
npm run test:visual
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Component Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:components
      - run: npm run test:components:coverage
      - uses: codecov/codecov-action@v3
```

## Coverage Goals

### Target Coverage
- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 90%+
- **Lines**: 90%+

### Critical Areas
- User interactions (100%)
- Accessibility features (100%)
- Error handling (95%)
- State management (90%)

## Debugging Tests

### Debug Mode
```bash
npm test -- --debug
```

### Console Logging
```typescript
import { screen, debug } from '../setup';

test('debug test', () => {
  render(<Button>Test</Button>);
  debug(); // Prints DOM tree
  screen.debug(); // Alternative syntax
});
```

### Browser Testing
```bash
npm test -- --watch --verbose
```

## Common Issues

### 1. Portal Components
Mock `createPortal` for modal testing:
```typescript
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}));
```

### 2. Async Components
Use `waitFor` for async operations:
```typescript
import { waitFor } from '../setup';

test('async component', async () => {
  render(<AsyncComponent />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 3. Theme Provider
Always wrap components with ThemeProvider:
```typescript
// Use custom render from setup.ts
import { render } from '../setup';
```

## Maintenance

### Regular Tasks
- Update test snapshots
- Review coverage reports
- Update test utilities
- Refactor common patterns

### Performance Monitoring
- Monitor test execution time
- Optimize slow tests
- Use test parallelization
- Profile memory usage

## Resources

- [Testing Library Docs](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [Accessibility Testing Guide](https://web.dev/accessibility-testing/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)