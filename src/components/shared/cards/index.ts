/**
 * Card Components
 * 
 * Unified card system with consistent styling and behavior patterns.
 * Includes base card components and specialized cards for different content types.
 */

// Base Card System (from design system)
export { Card, CardHeader, CardContent, CardFooter } from '@/components/design-system/primitives/Card';

// Legacy Card (deprecated - use Card directly)
export { BaseCard } from './BaseCard';

// Specialized Cards
export { GymCard } from './GymCard';
export { EventCard } from './EventCard';
export { ProductCard } from './ProductCard';

// Type Exports
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from '@/components/design-system/primitives/Card';

// Re-export design system types for convenience
export type {
  InteractiveProps,
  LayoutComponentProps,
} from '@/components/design-system/types';
