import { ReactNode } from 'react';
import { BaseComponentProps } from '@/components/design-system/types';

export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = Record<string, unknown>> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T, index: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
}

export interface ListItem {
  id: string | number;
  title: string;
  description?: string;
  avatar?: ReactNode;
  actions?: ReactNode;
  metadata?: Record<string, unknown>;
}

export interface DataListProps extends BaseComponentProps {
  items: ListItem[];
  loading?: boolean;
  emptyText?: string;
  onItemClick?: (item: ListItem, index: number) => void;
  showDividers?: boolean;
}

export interface GridItem {
  id: string | number;
  content: ReactNode;
  metadata?: Record<string, unknown>;
}

export interface DataGridProps extends BaseComponentProps {
  items: GridItem[];
  loading?: boolean;
  emptyText?: string;
  columns?: number;
  gap?: 'sm' | 'md' | 'lg';
  onItemClick?: (item: GridItem, index: number) => void;
}

export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'search' | 'error';
}