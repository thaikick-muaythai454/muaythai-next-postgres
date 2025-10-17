/**
 * Loading Component
 * Component สำหรับแสดงสถานะ Loading
 */

interface LoadingProps {
  message?: string;
}

export function Loading({ message = 'กำลังโหลด...' }: LoadingProps) {
  return (
    <div className="flex flex-col justify-center items-center gap-4 py-12">
      <div className="border-4 border-t-transparent border-blue-600 rounded-full w-12 h-12 animate-spin" />
      <p className="text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

