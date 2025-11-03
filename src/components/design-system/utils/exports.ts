/**
 * Optimized Export Utilities
 * 
 * Utilities for creating tree-shakable exports and optimizing bundle size.
 */

/**
 * Create tree-shakable exports for component libraries
 */
export function createOptimizedExports<T extends Record<string, unknown>>(
  components: T,
  options?: {
    lazy?: boolean;
    memo?: boolean;
  }
): T {
  const { lazy = false, memo = false } = options || {};

  if (!lazy && !memo) {
    return components;
  }

  const optimizedComponents = {} as T;

  Object.entries(components).forEach(([key, Component]) => {
    if (typeof Component === 'function') {
      let OptimizedComponent = Component;

      if (memo && Component.$$typeof !== Symbol.for('react.memo')) {
        OptimizedComponent = React.memo(Component);
        OptimizedComponent.displayName = `Memo(${Component.displayName || Component.name || key})`;
      }

      if (lazy) {
        // For lazy loading, we'd need to restructure how components are imported
        // This is more complex and would require build-time optimization
      }

      optimizedComponents[key as keyof T] = OptimizedComponent;
    } else {
      optimizedComponents[key as keyof T] = Component;
    }
  });

  return optimizedComponents;
}

/**
 * Bundle size analysis utilities
 */
export const bundleAnalysis = {
  /**
   * Log component bundle impact (development only)
   */
  logComponentSize: (componentName: string, size?: number) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 ${componentName}${size ? ` (~${size}kb)` : ''} loaded`);
    }
  },

  /**
   * Track component usage for bundle optimization
   */
  trackUsage: (componentName: string) => {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const usage = (window as Window & { __COMPONENT_USAGE__?: Record<string, number> }).__COMPONENT_USAGE__ || {};
      usage[componentName] = (usage[componentName] || 0) + 1;
      (window as Window & { __COMPONENT_USAGE__?: Record<string, number> }).__COMPONENT_USAGE__ = usage;
    }
  },

  /**
   * Get component usage statistics
   */
  getUsageStats: () => {
    if (typeof window !== 'undefined') {
      return (window as Window & { __COMPONENT_USAGE__?: Record<string, number> }).__COMPONENT_USAGE__ || {};
    }
    return {};
  },
};

// Import React for memo
import React from 'react';