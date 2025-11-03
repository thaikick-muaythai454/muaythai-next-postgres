/**
 * Shared Components Barrel Export
 * 
 * Optimized for tree-shaking with focused exports.
 * Components are organized by frequency of use and category.
 */

// === MOST COMMONLY USED COMPONENTS ===
// UI Components (exported directly for better tree-shaking)
export { Button, buttonVariants } from '@/components/design-system/primitives/Button';
export { PageHeader } from './ui/PageHeader';

// Form Components (frequently used)
export { BaseInput } from '@/components/design-system/primitives/BaseInput';
export { CustomInput } from './forms/CustomInput';
export { TextInput } from './forms/TextInput';
export { NumberInput } from './forms/NumberInput';
export { CustomSelect } from './forms/CustomSelect';
export { CustomTextarea } from './forms/CustomTextarea';

// Card Components (frequently used)
export { Card, CardHeader, CardContent, CardFooter } from '@/components/design-system/primitives/Card';
export { BaseCard } from './cards/BaseCard';
export { GymCard } from './cards/GymCard';
export { EventCard } from './cards/EventCard';
export { ProductCard } from './cards/ProductCard';

// === LAYOUT COMPONENTS ===
// Core Layout Components
export { default as DashboardLayout } from './layout/DashboardLayout';
export { default as LayoutWrapper } from './layout/LayoutWrapper';

// Responsive Layout Components (design system)
export { Container } from '@/components/design-system/primitives/Container';
export { Grid } from './layout/Grid';
export { Stack } from './layout/Stack';
export { Flex } from './layout/Flex';

// Legacy Layout Components (less frequently used)
export { default as CenteredLoading } from './layout/CenteredLoading';
export { default as EmptyState } from './layout/EmptyState';
export { default as Footer } from './layout/Footer';
export { default as Header } from './layout/Header';
export { default as SidebarContent } from './layout/SidebarContent';

// === FEEDBACK COMPONENTS ===
export { Loading } from '@/components/design-system/primitives/Loading';
export { ErrorDisplay } from './feedback/ErrorDisplay';
export { ErrorBoundary } from './feedback/ErrorBoundary';
export { ErrorBoundary as UIErrorBoundary } from './ui/ErrorBoundary';

// === TYPE EXPORTS ===
// Component Types
export type { ButtonProps } from '@/components/design-system/primitives/Button';
export type { BaseInputProps } from '@/components/design-system/primitives/BaseInput';
export type { CardProps } from '@/components/design-system/primitives/Card';

// Layout Types
export type { MenuItem } from './layout/DashboardLayout';

// Re-export commonly used types from design system
export type {
  BaseComponentProps,
  InteractiveProps,
  FormComponentProps,
  LayoutComponentProps,
} from '@/components/design-system/types';
