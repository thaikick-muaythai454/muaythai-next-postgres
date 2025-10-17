/**
 * ErrorMessage Component
 * Component สำหรับแสดง Error Message
 */

interface ErrorMessageProps {
  message: string;
  details?: React.ReactNode;
}

export function ErrorMessage({ message, details }: ErrorMessageProps) {
  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/30 mb-6 p-4 border border-yellow-400 dark:border-yellow-700 rounded-lg">
      <p className="text-yellow-800 dark:text-yellow-200">
        ⚠️ {message}
      </p>
      {details && (
        <div className="mt-2">
          {details}
        </div>
      )}
    </div>
  );
}

