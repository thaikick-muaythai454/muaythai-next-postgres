"use client";

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { LayoutComponentProps } from '@/components/design-system/types/component-props';
import { ResponsiveValue, SpacingVariant, AlignmentVariant } from '@/components/design-system/types/variants';

/**
 * Stack Props
 * 
 * Props for the Stack component with responsive spacing and alignment.
 */
export interface StackProps extends LayoutComponentProps {
  /**
   * Stack direction
   */
  direction?: ResponsiveValue<'vertical' | 'horizontal'>;
  
  /**
   * Gap between stack items
   */
  gap?: ResponsiveValue<SpacingVariant>;
  
  /**
   * Alignment of items along the cross axis
   */
  align?: ResponsiveValue<AlignmentVariant>;
  
  /**
   * Justification of items along the main axis
   */
  justify?: ResponsiveValue<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
  
  /**
   * Whether items should wrap
   */
  wrap?: boolean;
  
  /**
   * Whether to reverse the order of items
   */
  reverse?: boolean;
  
  /**
   * Whether to fill the available height (for vertical stacks)
   */
  fillHeight?: boolean;
  
  /**
   * Whether to fill the available width (for horizontal stacks)
   */
  fillWidth?: boolean;
}

/**
 * Get direction classes
 */
const getDirectionClasses = (direction: string, reverse: boolean = false): string => {
  const directionMap: Record<string, string> = {
    'vertical': reverse ? 'flex-col-reverse' : 'flex-col',
    'horizontal': reverse ? 'flex-row-reverse' : 'flex-row',
  };
  
  return directionMap[direction] || 'flex-col';
};

/**
 * Get gap classes
 */
const getGapClasses = (gap: SpacingVariant): string => {
  const gapMap: Record<SpacingVariant, string> = {
    'none': 'gap-0',
    'xs': 'gap-1',      // 4px
    'sm': 'gap-2',      // 8px
    'md': 'gap-4',      // 16px
    'lg': 'gap-6',      // 24px
    'xl': 'gap-8',      // 32px
    '2xl': 'gap-12',    // 48px
    '3xl': 'gap-16',    // 64px
  };
  
  return gapMap[gap] || 'gap-4';
};

/**
 * Get alignment classes
 */
const getAlignClasses = (align: AlignmentVariant): string => {
  const alignMap: Record<AlignmentVariant, string> = {
    'start': 'items-start',
    'center': 'items-center',
    'end': 'items-end',
    'stretch': 'items-stretch',
    'justify': 'items-stretch', // fallback for justify
  };
  
  return alignMap[align] || 'items-start';
};

/**
 * Get justify classes
 */
const getJustifyClasses = (justify: string): string => {
  const justifyMap: Record<string, string> = {
    'start': 'justify-start',
    'center': 'justify-center',
    'end': 'justify-end',
    'between': 'justify-between',
    'around': 'justify-around',
    'evenly': 'justify-evenly',
  };
  
  return justifyMap[justify] || 'justify-start';
};

/**
 * Get responsive classes for a responsive value
 */
const getResponsiveClasses = <T extends string>(
  value: ResponsiveValue<T>,
  getClasses: (val: T) => string
): string => {
  if (typeof value === 'string') {
    return getClasses(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    const classes: string[] = [];
    
    // Base value (mobile-first)
    if (value.sm !== undefined) classes.push(getClasses(value.sm));
    
    // Responsive breakpoints
    if (value.md !== undefined) {
      const baseClass = getClasses(value.md);
      classes.push(`md:${baseClass.replace(/^[a-z-]+:/, '')}`);
    }
    if (value.lg !== undefined) {
      const baseClass = getClasses(value.lg);
      classes.push(`lg:${baseClass.replace(/^[a-z-]+:/, '')}`);
    }
    if (value.xl !== undefined) {
      const baseClass = getClasses(value.xl);
      classes.push(`xl:${baseClass.replace(/^[a-z-]+:/, '')}`);
    }
    if (value['2xl'] !== undefined) {
      const baseClass = getClasses(value['2xl']);
      classes.push(`2xl:${baseClass.replace(/^[a-z-]+:/, '')}`);
    }
    
    return classes.join(' ');
  }
  
  return '';
};

/**
 * Stack Component
 * 
 * A flexible layout component that arranges children in a vertical or horizontal stack.
 * Provides consistent spacing, alignment, and responsive behavior.
 * 
 * @example
 * ```tsx
 * // Vertical stack (default)
 * <Stack gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 * 
 * // Horizontal stack
 * <Stack direction="horizontal" gap="lg" align="center">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 * 
 * // Responsive stack
 * <Stack 
 *   direction={{ sm: 'vertical', md: 'horizontal' }}
 *   gap={{ sm: 'sm', md: 'md', lg: 'lg' }}
 *   align={{ sm: 'start', md: 'center' }}
 * >
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 * ```
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      children,
      className,
      direction = 'vertical',
      gap = 'md',
      align = 'start',
      justify = 'start',
      wrap = false,
      reverse = false,
      fillHeight = false,
      fillWidth = false,
      as: Component = 'div',
      testId,
      ...props
    },
    ref
  ) => {
    // Generate responsive classes
    const directionClasses = getResponsiveClasses(direction, (dir) => getDirectionClasses(dir, reverse));
    const gapClasses = getResponsiveClasses(gap, getGapClasses);
    const alignClasses = getResponsiveClasses(align, getAlignClasses);
    const justifyClasses = getResponsiveClasses(justify, getJustifyClasses);
    
    const stackClasses = cn(
      // Base flex styles
      'flex',
      
      // Direction
      directionClasses,
      
      // Gap
      gapClasses,
      
      // Alignment
      alignClasses,
      
      // Justification
      justifyClasses,
      
      // Wrap
      wrap && 'flex-wrap',
      
      // Fill dimensions
      fillHeight && 'h-full',
      fillWidth && 'w-full',
      
      // Custom classes
      className
    );

    return (
      <Component
        ref={ref}
        className={stackClasses}
        data-testid={testId}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Stack.displayName = 'Stack';

export default Stack;