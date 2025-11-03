"use client";

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { FeedbackComponentProps } from '@/components/design-system/types/component-props';
import { ComponentSize } from '@/components/design-system/types/variants';

/**
 * Loading Props
 * 
 * Props for the Loading component with different variants and sizes.
 */
export interface LoadingProps extends Omit<FeedbackComponentProps, 'variant'> {
  /**
   * Loading variant/style
   */
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  
  /**
   * Size of the loading indicator
   */
  size?: ComponentSize;
  
  /**
   * Loading text to display
   */
  text?: string;
  
  /**
   * Whether to center the loading indicator
   */
  centered?: boolean;
  
  /**
   * Whether to show as overlay
   */
  overlay?: boolean;
  
  /**
   * Custom color for the loading indicator
   */
  color?: 'primary' | 'secondary' | 'neutral';
}

/**
 * Get size classes for loading indicators
 */
const getSizeClasses = (size: ComponentSize, variant: string): string => {
  const sizeMap: Record<ComponentSize, Record<string, string>> = {
    xs: {
      spinner: 'w-4 h-4',
      dots: 'gap-1',
      pulse: 'w-8 h-8',
      skeleton: 'h-4',
    },
    sm: {
      spinner: 'w-5 h-5',
      dots: 'gap-1.5',
      pulse: 'w-12 h-12',
      skeleton: 'h-5',
    },
    md: {
      spinner: 'w-6 h-6',
      dots: 'gap-2',
      pulse: 'w-16 h-16',
      skeleton: 'h-6',
    },
    lg: {
      spinner: 'w-8 h-8',
      dots: 'gap-2.5',
      pulse: 'w-20 h-20',
      skeleton: 'h-8',
    },
    xl: {
      spinner: 'w-10 h-10',
      dots: 'gap-3',
      pulse: 'w-24 h-24',
      skeleton: 'h-10',
    },
  };
  
  return sizeMap[size]?.[variant] || sizeMap.md[variant] || '';
};

/**
 * Get color classes
 */
const getColorClasses = (color: string): string => {
  const colorMap: Record<string, string> = {
    primary: 'text-red-500 border-red-500',
    secondary: 'text-gray-500 border-gray-500',
    neutral: 'text-gray-400 border-gray-400',
  };
  
  return colorMap[color] || colorMap.primary;
};

/**
 * Spinner Component
 */
const Spinner: React.FC<{ size: ComponentSize; color: string; className?: string }> = ({ 
  size, 
  color, 
  className 
}) => {
  const sizeClasses = getSizeClasses(size, 'spinner');
  const colorClasses = getColorClasses(color);
  
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-transparent border-t-current',
        sizeClasses,
        colorClasses,
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * Dots Component
 */
const Dots: React.FC<{ size: ComponentSize; color: string; className?: string }> = ({ 
  size, 
  color, 
  className 
}) => {
  const gapClasses = getSizeClasses(size, 'dots');
  const colorClasses = getColorClasses(color);
  
  const dotSize = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3',
  }[size];
  
  return (
    <div
      className={cn('flex items-center', gapClasses, className)}
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current animate-pulse',
            dotSize,
            colorClasses
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  );
};

/**
 * Pulse Component
 */
const Pulse: React.FC<{ size: ComponentSize; color: string; className?: string }> = ({ 
  size, 
  color, 
  className 
}) => {
  const sizeClasses = getSizeClasses(size, 'pulse');
  const colorClasses = getColorClasses(color);
  
  return (
    <div
      className={cn(
        'rounded-full bg-current animate-pulse opacity-75',
        sizeClasses,
        colorClasses,
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * Skeleton Component
 */
const Skeleton: React.FC<{ size: ComponentSize; className?: string; lines?: number }> = ({ 
  size, 
  className,
  lines = 3
}) => {
  const heightClasses = getSizeClasses(size, 'skeleton');
  
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
            heightClasses,
            i === lines - 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  );
};

/**
 * Loading Component
 * 
 * A versatile loading component with multiple variants and customization options.
 * Supports spinner, dots, pulse, and skeleton loading states.
 * 
 * @example
 * ```tsx
 * // Basic spinner
 * <Loading />
 * 
 * // Loading with text
 * <Loading variant="spinner" text="Loading..." size="lg" />
 * 
 * // Dots loading
 * <Loading variant="dots" color="primary" />
 * 
 * // Skeleton loading
 * <Loading variant="skeleton" size="md" />
 * 
 * // Overlay loading
 * <Loading overlay centered text="Please wait..." />
 * ```
 */
export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      variant = 'spinner',
      size = 'md',
      text,
      centered = false,
      overlay = false,
      color = 'primary',
      className,
      testId,
      ...props
    },
    ref
  ) => {
    const renderLoadingIndicator = () => {
      switch (variant) {
        case 'dots':
          return <Dots size={size} color={color} />;
        case 'pulse':
          return <Pulse size={size} color={color} />;
        case 'skeleton':
          return <Skeleton size={size} />;
        case 'spinner':
        default:
          return <Spinner size={size} color={color} />;
      }
    };

    const loadingContent = (
      <div
        className={cn(
          'flex items-center gap-3',
          centered && 'justify-center',
          variant === 'skeleton' && 'flex-col items-stretch gap-0'
        )}
      >
        {renderLoadingIndicator()}
        {text && variant !== 'skeleton' && (
          <span className={cn(
            'text-sm font-medium',
            getColorClasses(color)
          )}>
            {text}
          </span>
        )}
      </div>
    );

    if (overlay) {
      return (
        <div
          ref={ref}
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center',
            'bg-black/20 backdrop-blur-sm',
            className
          )}
          data-testid={testId}
          {...props}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            {loadingContent}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center',
          centered && 'justify-center',
          className
        )}
        data-testid={testId}
        {...props}
      >
        {loadingContent}
      </div>
    );
  }
);

Loading.displayName = 'Loading';

export default Loading;