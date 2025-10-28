// Shared Components Barrel Export
// Optimized for tree-shaking with focused exports

// Most commonly used components (exported directly for better tree-shaking)
export { default as DashboardLayout } from './layout/DashboardLayout';
export { PageHeader } from './ui/PageHeader';
export { Button } from './ui/Button';
export { default as LayoutWrapper } from './layout/LayoutWrapper';
export { ErrorBoundary } from './ui/ErrorBoundary';

// Layout Components (less frequently used)
export { default as CenteredLoading } from './layout/CenteredLoading';
export { default as EmptyState } from './layout/EmptyState';
export { default as Footer } from './layout/Footer';
export { default as Header } from './layout/Header';
export { default as SidebarContent } from './layout/SidebarContent';

// Card Components (frequently used)
export { GymCard } from './cards/GymCard';
export { EventCard } from './cards/EventCard';
export { ProductCard } from './cards/ProductCard';
export { BaseCard } from './cards/BaseCard';

// Form Components (frequently used)
export { CustomInput } from './forms/CustomInput';
export { CustomSelect } from './forms/CustomSelect';
export { CustomTextarea } from './forms/CustomTextarea';

// Types
export type { MenuItem } from './layout/DashboardLayout';
