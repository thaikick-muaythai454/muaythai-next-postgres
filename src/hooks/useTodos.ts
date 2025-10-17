/**
 * Custom Hook for Todos
 * React Hook สำหรับจัดการ Todos (Client-side)
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Todo } from '@/types/database.types';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Fetch todos
  const fetchTodos = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        if (fetchError.message.includes('relation') || fetchError.message.includes('does not exist')) {
          setError('ยังไม่มีตาราง todos ในฐานข้อมูล กรุณาสร้างตารางก่อน (ดู README.md)');
        } else {
          setError(fetchError.message);
        }
      } else {
        setTodos(data || []);
        setError(null);
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  // Add todo
  const addTodo = async (task: string) => {
    try {
      const { data, error: insertError } = await supabase
        .from('todos')
        .insert([{ task, is_complete: false }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      setTodos([data, ...todos]);
      return { success: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  // Toggle todo
  const toggleTodo = async (id: number, isComplete: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('todos')
        .update({ is_complete: !isComplete })
        .eq('id', id);

      if (updateError) throw updateError;

      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, is_complete: !isComplete } : todo
      ));
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    try {
      const { error: deleteError } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setTodos(todos.filter(todo => todo.id !== id));
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    fetchTodos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    refetch: fetchTodos,
  };
}

