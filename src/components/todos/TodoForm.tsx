/**
 * TodoForm Component
 * Component สำหรับเพิ่ม Todo ใหม่
 */

import { useState, FormEvent } from 'react';

interface TodoFormProps {
  onSubmit: (task: string) => Promise<void>;
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [task, setTask] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit(task);
      setTask('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="เพิ่มงานใหม่..."
          disabled={submitting}
          className="flex-1 dark:bg-gray-700 disabled:opacity-50 px-4 py-2 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
        />
        <button
          type="submit"
          disabled={submitting || !task.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-medium text-white transition-colors disabled:cursor-not-allowed"
        >
          {submitting ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
        </button>
      </div>
    </form>
  );
}

