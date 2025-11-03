# Design System Migration Guide

This guide helps developers migrate from the old component patterns to the new standardized design system. The migration is designed to be gradual and backward-compatible.

## Overview

The new design system provides:
- **Consistent Design Tokens**: Centralized colors, typography, spacing, and animations
- **Standardized Components**: Unified prop interfaces and behavior patterns
- **Better TypeScript Support**: Comprehensive type definitions and validation
- **Improved Performance**: Tree-shaking optimizations and lazy loading
- **Enhanced Accessibility**: WCAG compliance and proper ARIA attributes

## Migration Strategy

### Phase 1: Update Imports (Immediate)
Replace old component imports with new design system imports.

### Phase 2: Update Props (Gradual)
Migrate component props to use new standardized interfaces.

### Phase 3: Adopt New Patterns (Feature Updates)
Use new composition patterns and design tokens when building new features.

## Component Migration Patterns

### Button Components

#### Old Pattern
```tsx
// ❌ Old import
import { Button } from '@/components/ui/button';

// ❌ Old usage
<Button 
  variant="primary" 
  size="large"
  className="custom-button"
>
  Click me
</Button>
```

#### New Pattern
```tsx
// ✅ New import
import { Button } from '@/components/design-system/primitives/Button';
// or via shared components
import { Button } from '@/components/shared';

// ✅ New usage
<Button 
  variant="primary" 
  size="lg"
  className="custom-button"
>
  Click me
</Button>
```

#### Migration Notes
- `size="large"` → `size="lg"`
- All other props remain the same
- Enhanced TypeScript support with better prop validation

### Input Components

#### Old Pattern
```tsx
// ❌ Old import and usage
import { Input } from '@/components/ui/input';

<Input 
  placeholder="Enter text"
  error="Error message"
  icon={<SearchIcon />}
/>
```

#### New Pattern
```tsx
// ✅ New import
import { BaseInput } from '@/components/design-system/primitives/BaseInput';
// or use the compatibility wrapper
import { CustomInput } from '@/components/shared/forms/CustomInput';

// ✅ New usage with BaseInput
<BaseInput 
  placeholder="Enter text"
  error="Error message"
  leftIcon={<SearchIcon />}
  label="Search"
/>

// ✅ Or use compatibility wrapper (maintains old API)
<CustomInput 
  placeholder="Enter text"
  error="Error message"
  icon={<SearchIcon />}
  label="Search"
/>
```

#### Migration Notes
- `icon` prop → `leftIcon` prop in BaseInput
- Added required `label` prop for accessibility
- CustomInput provides backward compatibility

### Card Components

#### Old Pattern
```tsx
// ❌ Old import and usage
import { Card } from '@/components/ui/card';

<Card className="p-4">
  <div className="card-header">Title</div>
  <div className="card-content">Content</div>
</Card>
```

#### New Pattern
```tsx
// ✅ New import
import { Card, CardHeader, CardContent } from '@/components/design-system/primitives/Card';

// ✅ New usage
<Card padding="md">
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

#### Migration Notes
- Use semantic subcomponents (CardHeader, CardContent, CardFooter)
- `padding` prop replaces manual padding classes
- Enhanced variants: `default`, `elevated`, `outlined`, `ghost`

### Layout Components

#### Old Pattern
```tsx
// ❌ Old layout patterns
<div className="container mx-auto px-4 max-w-6xl">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    Content
  </div>
</div>
```

#### New Pattern
```tsx
// ✅ New layout components
import { Container, Grid } from '@/components/shared';

<Container maxWidth="xl" padding>
  <Grid cols={{ base: 1, md: 2 }} gap="md">
    Content
  </Grid>
</Container>
```

#### Migration Notes
- Responsive props use object notation: `{ base: 1, md: 2 }`
- Standardized spacing with design tokens
- Better TypeScript support for responsive values

## Design Token Migration

### Colors

#### Old Pattern
```tsx
// ❌ Hardcoded colors or inconsistent variables
<div className="bg-red-600 text-white">
  Content
</div>

// ❌ Custom CSS variables
<div style={{ backgroundColor: 'var(--primary-color)' }}>
  Content
</div>
```

#### New Pattern
```tsx
// ✅ Design system colors
import { useTheme } from '@/components/design-system';

const { colors } = useTheme();

<div className="bg-brand-primary text-text-primary">
  Content
</div>

// ✅ Or programmatic access
<div style={{ backgroundColor: colors.brand.primary }}>
  Content
</div>
```

#### Available Color Tokens
```tsx
// Background colors
bg-background-primary    // #0F0F0F
bg-background-secondary  // #3E3636
bg-background-card       // #1A1A1A

// Text colors
text-text-primary        // #F5EDED
text-text-secondary      // #A1A1AA
text-text-muted         // #71717A

// Brand colors
bg-brand-primary        // #D72323
bg-brand-secondary      // #B91C1C
bg-brand-accent         // #EF4444

// Semantic colors
bg-semantic-success     // #10B981
bg-semantic-warning     // #F59E0B
bg-semantic-error       // #EF4444
bg-semantic-info        // #3B82F6
```

### Typography

#### Old Pattern
```tsx
// ❌ Inconsistent font sizes
<h1 className="text-3xl font-bold">Title</h1>
<p className="text-base">Content</p>
```

#### New Pattern
```tsx
// ✅ Design system typography
<h1 className="text-typography-3xl font-typography-bold">Title</h1>
<p className="text-typography-base">Content</p>

// ✅ Or use semantic classes
<h1 className="heading-1">Title</h1>
<p className="body-text">Content</p>
```

### Spacing

#### Old Pattern
```tsx
// ❌ Arbitrary spacing values
<div className="p-4 m-6 gap-3">
  Content
</div>
```

#### New Pattern
```tsx
// ✅ Design system spacing
<div className="p-spacing-md m-spacing-lg gap-spacing-sm">
  Content
</div>

// ✅ Available spacing tokens
// spacing-xs   (0.25rem)
// spacing-sm   (0.5rem)
// spacing-md   (1rem)
// spacing-lg   (1.5rem)
// spacing-xl   (2rem)
// spacing-2xl  (3rem)
```

## Feature Component Migration

### Authentication Components

#### Old Pattern
```tsx
// ❌ Direct role checking
import { useAuth } from '@/contexts/AuthContext';

const { user } = useAuth();
if (user?.role !== 'admin') {
  return <div>Access denied</div>;
}
```

#### New Pattern
```tsx
// ✅ Use RoleGuard component
import { RoleGuard } from '@/components/features/auth';

<RoleGuard allowedRole="admin">
  <AdminContent />
</RoleGuard>
```

### Form Components

#### Old Pattern
```tsx
// ❌ Manual form layout
<form className="space-y-4">
  <div>
    <label>Name</label>
    <input type="text" />
  </div>
  <div>
    <label>Email</label>
    <input type="email" />
  </div>
  <button type="submit">Submit</button>
</form>
```

#### New Pattern
```tsx
// ✅ Use form compositions
import { FormLayout, FormField, FormActions } from '@/components/compositions/forms';
import { BaseInput, Button } from '@/components/shared';

<FormLayout>
  <FormField>
    <BaseInput 
      label="Name" 
      type="text" 
      name="name"
    />
  </FormField>
  <FormField>
    <BaseInput 
      label="Email" 
      type="email" 
      name="email"
    />
  </FormField>
  <FormActions>
    <Button type="submit" variant="primary">
      Submit
    </Button>
  </FormActions>
</FormLayout>
```

## TypeScript Migration

### Component Props

#### Old Pattern
```tsx
// ❌ Inconsistent prop interfaces
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}
```

#### New Pattern
```tsx
// ✅ Extend base component props
import { InteractiveProps } from '@/components/design-system/types';

interface ButtonProps extends InteractiveProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
```

### Available Base Types

```tsx
// Base component props
interface BaseComponentProps {
  className?: string;
  testId?: string;
  'aria-label'?: string;
}

// Interactive component props
interface InteractiveProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

// Form component props
interface FormComponentProps extends BaseComponentProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// Layout component props
interface LayoutComponentProps extends BaseComponentProps {
  children: React.ReactNode;
  padding?: boolean | 'sm' | 'md' | 'lg';
  margin?: boolean | 'sm' | 'md' | 'lg';
}
```

## Performance Optimizations

### Tree Shaking

#### Old Pattern
```tsx
// ❌ Imports entire component library
import * as Components from '@/components';
```

#### New Pattern
```tsx
// ✅ Import only what you need
import { Button, Card } from '@/components/shared';
import { FormLayout } from '@/components/compositions/forms';
```

### Lazy Loading

#### Old Pattern
```tsx
// ❌ All components loaded upfront
import { HeavyComponent } from '@/components/heavy';
```

#### New Pattern
```tsx
// ✅ Lazy load heavy components
import { lazy } from 'react';
const HeavyComponent = lazy(() => import('@/components/heavy'));

// ✅ Or use design system lazy utilities
import { lazyComponent } from '@/components/design-system/utils/lazy';
const HeavyComponent = lazyComponent(() => import('@/components/heavy'));
```

## Testing Migration

### Component Testing

#### Old Pattern
```tsx
// ❌ Basic testing without theme
import { render } from '@testing-library/react';

test('renders button', () => {
  render(<Button>Click me</Button>);
});
```

#### New Pattern
```tsx
// ✅ Testing with theme provider
import { renderWithTheme } from '@/components/design-system/__tests__/setup';

test('renders button', () => {
  renderWithTheme(<Button>Click me</Button>);
});
```

## Migration Checklist

### For Each Component File

- [ ] Update imports to use design system components
- [ ] Replace hardcoded colors with design tokens
- [ ] Update prop interfaces to extend base types
- [ ] Add proper TypeScript types
- [ ] Update tests to use theme provider
- [ ] Add accessibility attributes
- [ ] Optimize imports for tree shaking

### For Each Feature

- [ ] Audit component usage patterns
- [ ] Update to use composition components where appropriate
- [ ] Ensure consistent error handling
- [ ] Add loading states
- [ ] Validate responsive behavior
- [ ] Test accessibility compliance

## Common Migration Issues

### Issue: Missing CSS Variables
**Problem**: Components not styled correctly after migration.
**Solution**: Ensure ThemeProvider wraps your app root.

```tsx
// ✅ App root with ThemeProvider
import { ThemeProvider } from '@/components/design-system';

export default function App({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
```

### Issue: TypeScript Errors
**Problem**: Props not matching new interfaces.
**Solution**: Use migration utilities or update prop names.

```tsx
// ✅ Use migration helper
import { migrateButtonProps } from '@/components/design-system/utils/migration';

const newProps = migrateButtonProps(oldProps);
```

### Issue: Styling Conflicts
**Problem**: Old styles conflicting with new design system.
**Solution**: Remove custom styles and use design tokens.

```tsx
// ❌ Custom styles
<Button className="bg-red-500 hover:bg-red-600">

// ✅ Design system variant
<Button variant="danger">
```

## Getting Help

- **Documentation**: Check component Storybook stories for examples
- **Types**: Use TypeScript IntelliSense for prop suggestions
- **Testing**: Use `dev.validateSetup()` to check design system setup
- **Issues**: Check the migration troubleshooting section

## Next Steps

1. Start with high-frequency components (Button, Input, Card)
2. Migrate one feature at a time
3. Update tests as you go
4. Remove deprecated components after migration
5. Validate accessibility and responsive behavior

Remember: Migration is gradual. The old components will continue to work during the transition period.