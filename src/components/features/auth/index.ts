/**
 * Auth Feature Components
 * 
 * Authentication and authorization components for the application.
 * These components handle user authentication, role-based access control,
 * and authentication-related UI patterns.
 */

// Authentication Components
export { RoleGuard } from './RoleGuard';

// Type Exports
export type { RoleGuardProps } from './RoleGuard';

// Re-export auth types for convenience
export type { UserRole } from '@/lib/auth';
