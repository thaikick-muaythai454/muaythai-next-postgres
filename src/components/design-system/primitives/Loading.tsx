"use client";

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { FeedbackComponentProps } from '@/components/design-system/types/component-props';
import { ComponentSize } from '@/components/design-system/types/variants';

/**
 * Loading Props
 */
export interface LoadingProps extends Omit<FeedbackComponentProps, 'variant'> {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  size?: ComponentSize;
  text?: string;
  centered?: boolean;
  overlay?: boolean;
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
 * Loading Component
 * 
 * A versatile loading component with multiple variants and customization options.
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
      return <Spinner size={size} color={color} />;
    };

    const loadingContent = (
      <div
        className={cn(
          'flex items-center gap-3',
          centered && 'justify-center'
        )}
      >
        {renderLoadingIndicator()}
        {text && (
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