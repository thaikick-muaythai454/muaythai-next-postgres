import React, { ReactNode } from 'react';
import { Card, CardBody } from '@heroui/react';

export interface ResponsiveTableColumn<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  /** Show column on mobile card (default: true for first 3 columns, false for rest) */
  showOnMobile?: boolean;
  /** CSS classes for desktop table cell */
  cellClassName?: string;
  /** Hide column label on mobile (useful for actions) */
  hideLabelOnMobile?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: ResponsiveTableColumn<T>[];
  data: T[];
  /** Unique key extractor */
  keyExtractor: (item: T) => string;
  emptyContent?: string;
  /** Additional CSS classes for table wrapper */
  className?: string;
  /** Additional CSS classes for mobile cards */
  mobileCardClassName?: string;
  /** Aria label for accessibility */
  ariaLabel: string;
}

/**
 * ResponsiveTable Component
 * 
 * A responsive table that displays as a traditional table on desktop
 * and converts to card view on mobile devices.
 * 
 * @example
 * ```tsx
 * <ResponsiveTable
 *   columns={[
 *     { key: 'name', label: 'Name', render: (item) => item.name },
 *     { key: 'email', label: 'Email', render: (item) => item.email },
 *   ]}
 *   data={users}
 *   keyExtractor={(user) => user.id}
 *   ariaLabel="Users table"
 * />
 * ```
 */
export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyContent = 'ไม่พบข้อมูล',
  className = '',
  mobileCardClassName = '',
  ariaLabel,
}: ResponsiveTableProps<T>) {
  // Auto-set showOnMobile for first 3 columns if not specified
  const processedColumns = columns.map((col, index) => ({
    ...col,
    showOnMobile: col.showOnMobile !== undefined ? col.showOnMobile : index < 3,
  }));

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className={`hidden md:block overflow-x-auto ${className}`}>
        <table className="w-full" aria-label={ariaLabel}>
          <thead>
            <tr className="bg-default-100/80 border-b border-default-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left font-semibold text-xs text-default-700 uppercase tracking-wide"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-default-500"
                >
                  {emptyContent}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="border-b border-default-200/50 hover:bg-default-50/50 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 text-sm align-middle ${column.cellClassName || ''}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View - Hidden on desktop */}
      <div className={`block md:hidden space-y-4 ${className}`}>
        {data.length === 0 ? (
          <Card className="bg-default-100/50">
            <CardBody className="py-8 text-center text-default-500">
              {emptyContent}
            </CardBody>
          </Card>
        ) : (
          data.map((item) => (
            <Card
              key={keyExtractor(item)}
              className={`bg-default-100/50 backdrop-blur-sm border border-default-200 ${mobileCardClassName}`}
            >
              <CardBody className="p-4 space-y-3">
                {processedColumns
                  .filter((col) => col.showOnMobile)
                  .map((column) => (
                    <div
                      key={column.key}
                      className={column.hideLabelOnMobile ? '' : 'flex justify-between items-start gap-4'}
                    >
                      {!column.hideLabelOnMobile && (
                        <span className="font-semibold text-sm text-default-600 shrink-0 min-w-[100px]">
                          {column.label}:
                        </span>
                      )}
                      <div className={column.hideLabelOnMobile ? 'w-full' : 'flex-1 text-right'}>
                        {column.render(item)}
                      </div>
                    </div>
                  ))}
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

export default ResponsiveTable;

