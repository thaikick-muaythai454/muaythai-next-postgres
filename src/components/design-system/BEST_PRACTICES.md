# Design System Best Practices

This document outlines best practices for using and contributing to the Muay Thai application design system.

## Table of Contents

1. [Component Development](#component-development)
2. [Design Token Usage](#design-token-usage)
3. [TypeScript Guidelines](#typescript-guidelines)
4. [Performance Optimization](#performance-optimization)
5. [Accessibility Standards](#accessibility-standards)
6. [Testing Practices](#testing-practices)
7. [Documentation Standards](#documentation-standards)

## Component Development

### Component Structure

Follow this structure for all design system components:

```tsx
/**
 * Component Name
 * 
 * Brief description of the component's purpose and usage.
 * 
 * @example
 * <ComponentName variant="primary" size="md">
 *   Content
 * </ComponentName>
 */

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { BaseComponentProps } from '../types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ComponentNameProps extends BaseComponentProps {
  /**
   * Component variant
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'secondary';
  
  /**
   * Component size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Component content
   */
  children: React.ReactNode;
}

// =============================================================================
// COMPONENT IMPLEMENTATION
// =============================================================================

export const ComponentName = React.forwardRef<
  HTMLDivElement,
  ComponentNameProps
>(({ 
  variant = 'default',
  size = 'md',
  className,
  children,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        // Base styles
        'component-base-styles',
        
        // Variant styles
        {
          'variant-default-styles': variant === 'default',
          'variant-primary-styles': variant === 'primary',
          'variant-secondary-styles': variant === 'secondary',
        },
        
        // Size styles
        {
          'size-sm-styles': size === 'sm',
          'size-md-styles': size === 'md',
          'size-lg-styles': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

ComponentName.displayName = 'ComponentName';
```

### Component Guidelines

#### 1. Use Consistent Naming
- **PascalCase** for component names
- **camelCase** for props and functions
- **kebab-case** for CSS classes and file names

#### 2. Extend Base Props
Always extend appropriate base props for consistency:

```tsx
// ✅ Good
interface ButtonProps extends InteractiveProps {
  variant?: 'primary' | 'secondary';
}

// ❌ Avoid
interface ButtonProps {
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  // ... duplicating base props
}
```

#### 3. Use forwardRef for DOM Elements
Components that render DOM elements should use `forwardRef`:

```tsx
// ✅ Good
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => <button ref={ref} {...props} />
);

// ❌ Avoid
export const Button = (props: ButtonProps) => <button {...props} />;
```

#### 4. Provide Default Props
Use default parameters instead of `defaultProps`:

```tsx
// ✅ Good
export const Button = ({ 
  variant = 'default',
  size = 'md',
  ...props 
}) => {
  // component implementation
};

// ❌ Avoid
export const Button = (props) => {
  // component implementation
};
Button.defaultProps = {
  variant: 'default',
  size: 'md',
};
```

## Design Token Usage

### Color Usage

#### Use Semantic Color Names
```tsx
// ✅ Good - semantic meaning
<div className="bg-background-primary text-text-primary">
<div className="bg-brand-primary text-white">
<div className="bg-semantic-error text-white">

// ❌ Avoid - specific color values
<div className="bg-gray-900 text-gray-100">
<div className="bg-red-600 text-white">
```

#### Programmatic Color Access
```tsx
// ✅ Good - use theme hook
import { useTheme } from '@/components/design-system';

const { colors } = useTheme();
const dynamicStyle = {
  backgroundColor: colors.brand.primary,
  color: colors.text.primary,
};

// ❌ Avoid - hardcoded values
const dynamicStyle = {
  backgroundColor: '#D72323',
  color: '#F5EDED',
};
```

### Typography Usage

#### Use Typography Tokens
```tsx
// ✅ Good - design system typography
<h1 className="text-typography-3xl font-typography-bold">
<p className="text-typography-base leading-typography-relaxed">

// ❌ Avoid - arbitrary values
<h1 className="text-3xl font-bold">
<p className="text-base leading-6">
```

#### Responsive Typography
```tsx
// ✅ Good - responsive typography
<h1 className="text-typography-xl md:text-typography-2xl lg:text-typography-3xl">
  Responsive Heading
</h1>
```

### Spacing Usage

#### Use Spacing Tokens
```tsx
// ✅ Good - design system spacing
<div className="p-spacing-md m-spacing-lg gap-spacing-sm">

// ❌ Avoid - arbitrary spacing
<div className="p-4 m-6 gap-2">
```

#### Consistent Spacing Patterns
```tsx
// ✅ Good - consistent spacing scale
const spacingScale = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

// ❌ Avoid - inconsistent spacing
const spacing = ['2px', '8px', '16px', '24px', '40px', '64px'];
```

## TypeScript Guidelines

### Type Definitions

#### Use Strict Types
```tsx
// ✅ Good - strict types
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

// ❌ Avoid - loose types
interface ButtonProps {
  variant?: string;
  size?: string;
  children?: any;
}
```

#### Generic Components
```tsx
// ✅ Good - generic with constraints
interface SelectProps<T extends string | number> {
  value: T;
  options: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
}

// ❌ Avoid - any types
interface SelectProps {
  value: any;
  options: any[];
  onChange: (value: any) => void;
}
```

### Prop Validation

#### Runtime Validation in Development
```tsx
import { validateComponentProps } from '@/components/design-system/types';

export const Button = (props: ButtonProps) => {
  // Validate props in development
  if (process.env.NODE_ENV === 'development') {
    const validation = validateComponentProps(props, buttonSchema);
    if (!validation.isValid) {
      console.warn('Button validation errors:', validation.errors);
    }
  }
  
  // Component implementation
};
```

## Performance Optimization

### Bundle Size Optimization

#### Tree Shaking
```tsx
// ✅ Good - specific imports
import { Button } from '@/components/design-system/primitives/Button';
import { Card } from '@/components/design-system/primitives/Card';

// ❌ Avoid - barrel imports of large modules
import * as DesignSystem from '@/components/design-system';
```

#### Lazy Loading
```tsx
// ✅ Good - lazy load heavy components
import { lazy, Suspense } from 'react';
import { Loading } from '@/components/shared';

const HeavyChart = lazy(() => import('./HeavyChart'));

export const Dashboard = () => (
  <Suspense fallback={<Loading />}>
    <HeavyChart />
  </Suspense>
);
```

### Rendering Optimization

#### Memoization
```tsx
// ✅ Good - memoize expensive calculations
import { useMemo } from 'react';

export const DataTable = ({ data, filters }) => {
  const filteredData = useMemo(() => {
    return data.filter(item => 
      filters.every(filter => filter.test(item))
    );
  }, [data, filters]);
  
  return <table>{/* render filteredData */}</table>;
};
```

#### Component Memoization
```tsx
// ✅ Good - memoize stable components
import { memo } from 'react';

export const ExpensiveComponent = memo(({ data }) => {
  // Expensive rendering logic
  return <div>{/* complex UI */}</div>;
});
```

## Accessibility Standards

### ARIA Attributes

#### Required ARIA Labels
```tsx
// ✅ Good - proper ARIA labels
<button aria-label="Close dialog">
  <CloseIcon />
</button>

<input 
  aria-label="Search products"
  aria-describedby="search-help"
  placeholder="Search..."
/>
<div id="search-help">Enter keywords to search products</div>
```

#### Semantic HTML
```tsx
// ✅ Good - semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// ❌ Avoid - div soup
<div className="navigation">
  <div className="nav-item">Home</div>
  <div className="nav-item">About</div>
</div>
```

### Keyboard Navigation

#### Focus Management
```tsx
// ✅ Good - proper focus management
export const Modal = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      {/* modal content */}
    </div>
  );
};
```

### Color Contrast

#### Ensure Sufficient Contrast
```tsx
// ✅ Good - high contrast combinations
<div className="bg-background-primary text-text-primary"> // 4.5:1 ratio
<div className="bg-brand-primary text-white"> // 4.5:1 ratio

// ❌ Avoid - low contrast
<div className="bg-gray-400 text-gray-300"> // Poor contrast
```

## Testing Practices

### Component Testing

#### Test Structure
```tsx
// ✅ Good - comprehensive test structure
import { renderWithTheme } from '@/components/design-system/__tests__/setup';
import { Button } from '../Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      const { getByRole } = renderWithTheme(
        <Button>Click me</Button>
      );
      
      expect(getByRole('button')).toBeInTheDocument();
    });
  });
  
  describe('Variants', () => {
    it('applies primary variant styles', () => {
      const { getByRole } = renderWithTheme(
        <Button variant="primary">Primary</Button>
      );
      
      expect(getByRole('button')).toHaveClass('btn-primary');
    });
  });
  
  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = jest.fn();
      const { getByRole } = renderWithTheme(
        <Button onClick={handleClick}>Click me</Button>
      );
      
      fireEvent.click(getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      const { getByRole } = renderWithTheme(
        <Button aria-label="Custom label">Button</Button>
      );
      
      expect(getByRole('button')).toHaveAttribute('aria-label', 'Custom label');
    });
  });
});
```

### Visual Testing

#### Storybook Stories
```tsx
// ✅ Good - comprehensive stories
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Design System/Primitives/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
```

## Documentation Standards

### Component Documentation

#### JSDoc Comments
```tsx
/**
 * Button component for user interactions
 * 
 * Supports multiple variants, sizes, and states. Built with accessibility
 * in mind and follows the design system guidelines.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 * 
 * @example
 * ```tsx
 * <Button variant="ghost" disabled>
 *   Disabled button
 * </Button>
 * ```
 */
export interface ButtonProps extends InteractiveProps {
  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  
  /**
   * Button size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
}
```

### README Files

#### Component README Structure
```markdown
# Component Name

Brief description of the component.

## Usage

```tsx
import { ComponentName } from '@/components/design-system';

<ComponentName variant="primary">
  Content
</ComponentName>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Visual style variant |
| size | string | 'md' | Component size |

## Examples

### Basic Usage
[Example code]

### Advanced Usage
[Example code]

## Accessibility

- Supports keyboard navigation
- Proper ARIA attributes
- High contrast colors

## Related Components

- [RelatedComponent1]
- [RelatedComponent2]
```

## Code Review Checklist

### Before Submitting

- [ ] Component follows naming conventions
- [ ] Props extend appropriate base interfaces
- [ ] TypeScript types are strict and accurate
- [ ] Component is accessible (ARIA, keyboard, contrast)
- [ ] Tests cover main functionality and edge cases
- [ ] Documentation is complete and accurate
- [ ] Performance considerations addressed
- [ ] Design tokens used consistently
- [ ] No hardcoded values or magic numbers
- [ ] Error states handled appropriately

### Review Criteria

- [ ] Code is readable and maintainable
- [ ] Follows established patterns
- [ ] No unnecessary complexity
- [ ] Proper error handling
- [ ] Consistent with design system principles
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Well tested
- [ ] Properly documented

## Common Pitfalls

### 1. Hardcoded Values
```tsx
// ❌ Avoid
<div style={{ padding: '16px', color: '#D72323' }}>

// ✅ Good
<div className="p-spacing-md text-brand-primary">
```

### 2. Missing Accessibility
```tsx
// ❌ Avoid
<div onClick={handleClick}>Clickable div</div>

// ✅ Good
<button onClick={handleClick} aria-label="Action button">
  <Icon />
</button>
```

### 3. Poor TypeScript Usage
```tsx
// ❌ Avoid
const props: any = { variant: 'primary' };

// ✅ Good
const props: ButtonProps = { variant: 'primary' };
```

### 4. Inconsistent Patterns
```tsx
// ❌ Avoid - mixing patterns
<CustomButton className="btn-primary" />
<AnotherButton variant="primary" />

// ✅ Good - consistent patterns
<Button variant="primary" />
<Button variant="secondary" />
```

Remember: The design system is a living document. These practices should evolve as the system grows and improves.