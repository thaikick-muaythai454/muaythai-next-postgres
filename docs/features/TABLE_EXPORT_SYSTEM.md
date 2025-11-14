# Table Export System

## ภาพรวม

Universal Export System ที่ให้ทุก table ในระบบสามารถ export ข้อมูลเป็น PDF และ CSV ได้อย่างง่ายดาย รองรับภาษาไทยและ formatting ที่สวยงาม

## Features

✅ **Export เป็น PDF**
- รองรับ Thai fonts
- Landscape/Portrait orientation
- Auto page numbers
- Custom headers และ footers
- Professional styling

✅ **Export เป็น CSV**
- UTF-8 BOM encoding (เพื่อให้ Excel อ่านภาษาไทยได้)
- Comma-separated values
- Auto escaping สำหรับ special characters
- Compatible กับ Excel, Google Sheets

✅ **Universal Components**
- `useTableExport` hook
- `TableExportButton` component
- `SimpleExportButtons` component
- Integration กับ DataTable และ ResponsiveTable

## การใช้งาน

### 1. ใช้ `useTableExport` Hook

```tsx
import { useTableExport } from '@/lib/hooks/useTableExport';

function MyComponent() {
  const bookings = [...]; // ข้อมูลของคุณ
  
  const { exportPDF, exportCSV, isExporting } = useTableExport({
    data: bookings,
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'customer_name', label: 'ชื่อลูกค้า' },
      { 
        key: 'created_at', 
        label: 'วันที่สร้าง',
        format: (value) => new Date(value).toLocaleDateString('th-TH')
      },
    ],
    filename: 'bookings-report',
    title: 'รายงานการจอง',
    subtitle: 'ข้อมูล ณ วันที่ 14 พฤศจิกายน 2568',
    options: {
      orientation: 'landscape',
      includeTimestamp: true,
    }
  });

  return (
    <div>
      <button onClick={exportPDF} disabled={isExporting}>
        Export PDF
      </button>
      <button onClick={exportCSV} disabled={isExporting}>
        Export CSV
      </button>
    </div>
  );
}
```

### 2. ใช้ `TableExportButton` Component

Component นี้จะแสดงปุ่ม dropdown ที่มีตัวเลือก PDF และ CSV

```tsx
import { TableExportButton } from '@/components/shared/TableExportButton';

<TableExportButton
  exportOptions={{
    data: bookings,
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'customer_name', label: 'ชื่อลูกค้า' },
    ],
    filename: 'bookings-report',
    title: 'รายงานการจอง',
  }}
  size="sm"
  variant="bordered"
  color="default"
/>
```

### 3. ใช้ `SimpleExportButtons` Component

Component นี้จะแสดง 2 ปุ่มแยกกัน (PDF และ CSV)

```tsx
import { SimpleExportButtons } from '@/components/shared/TableExportButton';

<SimpleExportButtons
  exportOptions={{
    data: bookings,
    columns: [...],
    filename: 'bookings-report',
    title: 'รายงานการจอง',
  }}
  size="sm"
  showLabels={true}
/>
```

### 4. ใช้กับ DataTable Component

```tsx
import { DataTable } from '@/components/compositions/data/DataTable';

<DataTable
  columns={[...]}
  data={bookings}
  exportConfig={{
    enabled: true,
    filename: 'bookings-export',
    title: 'รายงานการจอง',
    subtitle: 'ข้อมูลทั้งหมด',
    options: {
      orientation: 'landscape',
      includeTimestamp: true,
    }
  }}
/>
```

### 5. ใช้กับ ResponsiveTable Component

```tsx
import { ResponsiveTable } from '@/components/shared/ResponsiveTable';

<ResponsiveTable
  columns={[
    {
      key: 'name',
      label: 'ชื่อ',
      render: (item) => item.name,
      exportFormat: (item) => item.name, // สำหรับ export
    },
  ]}
  data={items}
  keyExtractor={(item) => item.id}
  ariaLabel="Items table"
  exportConfig={{
    enabled: true,
    filename: 'items-export',
    title: 'รายงานรายการ',
  }}
/>
```

## Column Configuration

### Basic Column

```tsx
{
  key: 'customer_name',
  label: 'ชื่อลูกค้า'
}
```

### Column with Custom Format

```tsx
{
  key: 'created_at',
  label: 'วันที่สร้าง',
  format: (value, row) => {
    return new Date(value).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
```

### Column with Complex Data

```tsx
{
  key: 'price',
  label: 'ราคา',
  format: (value) => {
    return `฿${Number(value).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
}
```

## Export Options

### PDF Options

```tsx
{
  orientation: 'landscape' | 'portrait',  // Default: 'landscape'
  pageSize: 'a4' | 'letter' | 'legal',   // Default: 'a4'
  includeTimestamp: true,                 // เพิ่ม timestamp ในรายงาน
  includeRowNumbers: true,                // เพิ่มเลขลำดับแถว
}
```

### CSV Options

```tsx
{
  includeTimestamp: true,  // เพิ่ม timestamp ในชื่อไฟล์
}
```

## Examples

### Example 1: Partner Bookings Export

```tsx
<SimpleExportButtons
  exportOptions={{
    data: filteredBookings,
    columns: [
      { key: 'booking_number', label: 'รหัสจอง' },
      { key: 'customer_name', label: 'ลูกค้า' },
      { key: 'customer_phone', label: 'โทรศัพท์' },
      { 
        key: 'start_date', 
        label: 'วันที่เริ่ม',
        format: (_, row) => new Date(row.start_date).toLocaleDateString('th-TH')
      },
      { 
        key: 'price_paid', 
        label: 'ยอดเงิน',
        format: (_, row) => `฿${Number(row.price_paid).toLocaleString()}`
      },
    ],
    filename: `${gymName}-bookings-${status}`,
    title: `รายงานการจอง - ${gymName}`,
    subtitle: `สถานะ: ${status} (${filteredBookings.length} รายการ)`,
    options: {
      orientation: 'landscape',
      includeTimestamp: true,
    },
  }}
  size="sm"
/>
```

### Example 2: Admin Gyms Export

```tsx
<ResponsiveTable
  columns={[
    {
      key: 'gym_name',
      label: 'ชื่อยิม',
      render: (gym) => <span>{gym.gym_name}</span>,
      exportFormat: (gym) => gym.gym_name,
    },
    {
      key: 'contact_name',
      label: 'ผู้ติดต่อ',
      render: (gym) => <span>{gym.contact_name}</span>,
      exportFormat: (gym) => gym.contact_name,
    },
    {
      key: 'status',
      label: 'สถานะ',
      render: (gym) => <Chip>{gym.status}</Chip>,
      exportFormat: (gym) => gym.status,
    },
  ]}
  data={filteredGyms}
  keyExtractor={(gym) => gym.id}
  ariaLabel="Gyms table"
  exportConfig={{
    enabled: true,
    filename: `admin-gyms-${selectedTab}`,
    title: 'รายงานยิม - Admin Dashboard',
    subtitle: `สถานะ: ${selectedTab} (${filteredGyms.length} รายการ)`,
    options: {
      orientation: 'landscape',
      includeTimestamp: true,
    },
  }}
/>
```

## Technical Details

### Export Utilities (`src/lib/utils/export.ts`)

```typescript
// Export เป็น PDF
export async function exportToPDF<T>({
  data,
  columns,
  filename,
  title,
  subtitle,
  orientation,
  pageSize,
  includeTimestamp,
  includeRowNumbers,
}: ExportPDFOptions<T>): Promise<void>

// Export เป็น CSV
export async function exportToCSV<T>({
  data,
  columns,
  filename,
  includeTimestamp,
}: ExportCSVOptions<T>): Promise<void>

// Export เป็น JSON (bonus)
export async function exportToJSON<T>({
  data,
  filename,
  prettify,
}: ExportJSONOptions<T>): Promise<void>
```

### Hook (`src/lib/hooks/useTableExport.ts`)

```typescript
export function useTableExport<T>({
  data,
  columns,
  filename,
  title,
  subtitle,
  options,
}: UseTableExportOptions<T>): UseTableExportReturn {
  // Returns: { exportPDF, exportCSV, isExporting, error }
}
```

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Client-side processing (ไม่ต้องใช้ server)
- Fast export สำหรับข้อมูล < 10,000 rows
- ข้อมูลมากกว่า 10,000 rows อาจใช้เวลาประมาณ 2-5 วินาที

## Known Limitations

1. **PDF Thai Fonts**: ใช้ default fonts ที่รองรับภาษาไทยจาก jsPDF (Helvetica)
2. **Large Datasets**: ข้อมูลมากกว่า 50,000 rows อาจทำให้ browser ช้า
3. **Complex Formatting**: ReactNode ที่ซับซ้อนจะถูกแปลงเป็น plain text ใน export

## Future Enhancements

- [ ] Custom Thai fonts (THSarabunNew, Kanit)
- [ ] Excel format (.xlsx) support
- [ ] Chart/Graph exports
- [ ] Email export results
- [ ] Scheduled exports
- [ ] Export templates

## Related Files

```
src/
├── lib/
│   ├── hooks/
│   │   └── useTableExport.ts          # Export hook
│   └── utils/
│       └── export.ts                   # Export utilities
├── components/
│   ├── shared/
│   │   └── TableExportButton.tsx      # Export button components
│   ├── compositions/
│   │   └── data/
│   │       ├── DataTable.tsx          # DataTable with export
│   │       └── types.ts               # Export types
│   └── shared/
│       └── ResponsiveTable.tsx        # ResponsiveTable with export
```

## Support

หากมีปัญหาหรือข้อสงสัยเกี่ยวกับการใช้งาน Export System กรุณาติดต่อ development team

