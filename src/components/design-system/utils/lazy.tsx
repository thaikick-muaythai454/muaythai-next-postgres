/**
 * Lazy Loading Utilities
 * 
 * Utilities for lazy loading heavy components and optimizing bundle size.
 */

import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Create a lazy-loaded component with better error handling
 */
export function createLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  displayName?: string
): LazyExoticComponent<T> {
  const LazyComponent = lazy(async () => {
    try {
      const importedModule = await importFn();
      return importedModule;
    } catch (error) {
      console.error(`Failed to load lazy component ${displayName || 'Unknown'}:`, error);
      // Return a fallback component
      return {
        default: (() => (
          <div className="p-4 text-center text-red-400">
            Failed to load component
          </div>
        )) as T,
      };
    }
  });

  if (displayName) {
    LazyComponent.displayName = `Lazy(${displayName})`;
  }

  return LazyComponent;
}

/**
 * Create a lazy-loaded component with preloading capability
 */
export function createPreloadableLazyComponent<T extends ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>,
  displayName?: string
) {
  let preloadPromise: Promise<{ default: T }> | null = null;

  const preload = () => {
    if (!preloadPromise) {
      preloadPromise = importFn();
    }
    return preloadPromise;
  };

  const LazyComponent = createLazyComponent(
    () => preloadPromise || importFn(),
    displayName
  );

  return {
    Component: LazyComponent,
    preload,
  };
}

/**
 * Lazy load compositions that are typically heavy
 */
export const LazyCompositions = {
  // Modal compositions
  Modal: createLazyComponent(
    () => import('@/components/compositions/modals/Modal'),
    'Modal'
  ),
  ConfirmationModal: createLazyComponent(
    () => import('@/components/compositions/modals/ConfirmationModal'),
    'ConfirmationModal'
  ),
  FormModal: createLazyComponent(
    () => import('@/components/compositions/modals/FormModal'),
    'FormModal'
  ),
  InfoModal: createLazyComponent(
    () => import('@/components/compositions/modals/InfoModal'),
    'InfoModal'
  ),

  // Data display compositions
  DataTable: createLazyComponent(
    () => import('@/components/compositions/data/DataTable'),
    'DataTable'
  ),
  DataList: createLazyComponent(
    () => import('@/components/compositions/data/DataList'),
    'DataList'
  ),
  DataGrid: createLazyComponent(
    () => import('@/components/compositions/data/DataGrid'),
    'DataGrid'
  ),

  // Page compositions
  DashboardPage: createLazyComponent(
    () => import('@/components/compositions/pages/DashboardPage'),
    'DashboardPage'
  ),
  AuthPage: createLazyComponent(
    () => import('@/components/compositions/pages/AuthPage'),
    'AuthPage'
  ),
};

/**
 * Preloadable compositions for better UX
 */
export const PreloadableCompositions = {
  Modal: createPreloadableLazyComponent(
    () => import('@/components/compositions/modals/Modal'),
    'Modal'
  ),
  DataTable: createPreloadableLazyComponent(
    () => import('@/components/compositions/data/DataTable'),
    'DataTable'
  ),
  FormModal: createPreloadableLazyComponent(
    () => import('@/components/compositions/modals/FormModal'),
    'FormModal'
  ),
};