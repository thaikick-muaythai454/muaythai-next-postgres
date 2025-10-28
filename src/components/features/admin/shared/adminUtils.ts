/**
 * Shared utility functions for admin components
 * Provides common functionality and helpers
 */

import { showSuccessToast, showErrorToast } from '@/lib/utils';

// Common toast messages
export const ADMIN_TOAST_MESSAGES = {
  SAVE_SUCCESS: 'บันทึกข้อมูลสำเร็จ',
  DELETE_SUCCESS: 'ลบข้อมูลสำเร็จ',
  APPROVE_SUCCESS: 'อนุมัติสำเร็จ',
  REJECT_SUCCESS: 'ปฏิเสธสำเร็จ',
  GENERIC_ERROR: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
  NETWORK_ERROR: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
  PERMISSION_ERROR: 'คุณไม่มีสิทธิ์ในการดำเนินการนี้',
} as const;

// Status configurations for common admin entities
export const ADMIN_STATUS_CONFIG = {
  pending: { label: 'รอการตรวจสอบ', color: 'warning' as const },
  approved: { label: 'อนุมัติแล้ว', color: 'success' as const },
  rejected: { label: 'ไม่อนุมัติ', color: 'danger' as const },
  active: { label: 'ใช้งาน', color: 'success' as const },
  inactive: { label: 'ไม่ใช้งาน', color: 'default' as const },
  draft: { label: 'ร่าง', color: 'default' as const },
  published: { label: 'เผยแพร่แล้ว', color: 'success' as const },
} as const;

/**
 * Format date for Thai locale
 */
export function formatThaiDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date for short display
 */
export function formatShortDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Handle API response with consistent error handling
 */
export async function handleApiResponse<T>(
  response: Response,
  successMessage?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await response.json();
    
    if (result.success) {
      if (successMessage) {
        showSuccessToast(successMessage);
      }
      return { success: true, data: result.data };
    } else {
      const errorMessage = result.error || ADMIN_TOAST_MESSAGES.GENERIC_ERROR;
      showErrorToast(errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error) {
    console.error('API Response Error:', error);
    showErrorToast(ADMIN_TOAST_MESSAGES.NETWORK_ERROR);
    return { success: false, error: ADMIN_TOAST_MESSAGES.NETWORK_ERROR };
  }
}

/**
 * Generic API call wrapper with error handling
 */
export async function makeApiCall<T>(
  url: string,
  options: RequestInit,
  successMessage?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    return await handleApiResponse<T>(response, successMessage);
  } catch (error) {
    console.error('API Call Error:', error);
    showErrorToast(ADMIN_TOAST_MESSAGES.NETWORK_ERROR);
    return { success: false, error: ADMIN_TOAST_MESSAGES.NETWORK_ERROR };
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Filter array by search query
 */
export function filterBySearch<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  if (!query.trim()) return items;
  
  const lowerQuery = query.toLowerCase();
  
  return items.filter((item) =>
    searchFields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    })
  );
}

/**
 * Filter array by status
 */
export function filterByStatus<T extends { status?: string }>(
  items: T[],
  status: string
): T[] {
  if (status === 'all') return items;
  return items.filter((item) => item.status === status);
}

/**
 * Get stats from array of items
 */
export function getItemStats<T extends { status?: string }>(items: T[]) {
  const total = items.length;
  const approved = items.filter((item) => item.status === 'approved').length;
  const pending = items.filter((item) => item.status === 'pending').length;
  const rejected = items.filter((item) => item.status === 'rejected').length;
  
  return { total, approved, pending, rejected };
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Check if user has permission for action
 */
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Sort array by field
 */
export function sortBy<T>(
  items: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Paginate array
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

/**
 * Get pagination info
 */
export function getPaginationInfo(totalItems: number, page: number, pageSize: number) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalItems);
  
  return {
    totalPages,
    currentPage: page,
    startIndex,
    endIndex,
    totalItems,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}