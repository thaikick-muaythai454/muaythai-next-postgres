/**
 * TodoList Component
 * Component สำหรับแสดงรายการ Todos
 */

import type { Todo } from '@/types/database.types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number, isComplete: boolean) => void;
  onDelete: (id: number) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="py-8 text-gray-500 text-center">
        ยังไม่มีรายการ Todo
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 p-4 rounded-lg transition-colors"
        >
          <input
            type="checkbox"
            checked={todo.is_complete}
            onChange={() => onToggle(todo.id, todo.is_complete)}
            className="border-gray-300 rounded focus:ring-blue-500 w-5 h-5 text-blue-600"
          />
          <span
            className={`flex-1 ${
              todo.is_complete
                ? 'line-through text-gray-400'
                : 'text-gray-800 dark:text-white'
            }`}
          >
            {todo.task}
          </span>
          <button
            onClick={() => onDelete(todo.id)}
            className="hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded text-red-600 hover:text-red-700 transition-colors"
          >
            ลบ
          </button>
        </li>
      ))}
    </ul>
  );
}

