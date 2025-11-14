import { useState, useEffect } from 'react';

/**
 * Hook to debounce a value
 * Returns the debounced value and a loading state
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns Object containing debouncedValue and isDebouncing state
 * 
 * @example
 * const { debouncedValue, isDebouncing } = useDebouncedValue(searchQuery, 300);
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): { debouncedValue: T; isDebouncing: boolean } {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState<boolean>(false);

  useEffect(() => {
    // Set debouncing to true when value changes
    setIsDebouncing(true);

    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { debouncedValue, isDebouncing };
}

