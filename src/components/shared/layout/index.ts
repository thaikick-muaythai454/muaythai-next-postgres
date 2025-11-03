/**
 * Layout Components
 * 
 * Responsive layout components for consistent spacing and structure.
 */

// Existing layout components
export { default as AuthLayout } from './AuthLayout';
export { default as CenteredLoading } from './CenteredLoading';
export { default as DashboardLayout } from './DashboardLayout';
export { default as EmptyState } from './EmptyState';
export { default as Footer } from './Footer';
export { default as Header } from './Header';
export { default as LayoutWrapper } from './LayoutWrapper';
export { default as SidebarContent } from './SidebarContent';

// New responsive layout components
export { default as Container, type ContainerProps } from './Container';
export { default as Grid, type GridProps } from './Grid';
export { default as Stack, type StackProps } from './Stack';
export { default as Flex, type FlexProps } from './Flex';

// Re-export layout-related types
export type {
  LayoutComponentProps,
} from '@/components/design-system/types/component-props';

export type {
  ResponsiveValue,
  SpacingVariant,
  AlignmentVariant,
} from '@/components/design-system/types/variants';