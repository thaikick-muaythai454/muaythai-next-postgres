// General Utilities Barrel Export
// Optimized for tree-shaking with focused exports

// Most commonly used utilities
export { cn } from './cn';
export { showSuccessToast, showErrorToast } from './toast';

// Formatting utilities
export { 
  formatDate, 
  formatPhoneNumber 
} from './formatters';

// Slug utilities
export { generateSlug, previewSlug, isValidSlug } from './slug';

// Text utilities
export { 
  truncateText, 
  slugify,
  getInitials
} from './text-utils';
