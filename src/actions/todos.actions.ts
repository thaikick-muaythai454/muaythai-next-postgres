'use server';

/**
 * Server Actions for Todo Operations
 * ฟังก์ชัน Backend สำหรับจัดการ Todos
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Todo, CreateTodoInput, ApiResponse } from '@/types/database.types';

/**
 * ดึงรายการ Todos ทั้งหมด
 */
export async function getTodos(): Promise<ApiResponse<Todo[]>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: message };
  }
}

/**
 * สร้าง Todo ใหม่
 */
export async function createTodo(input: CreateTodoInput): Promise<ApiResponse<Todo>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('todos')
      .insert([{ task: input.task, is_complete: false }])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    // Revalidate the path to update the UI
    revalidatePath('/examples/todos');

    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: message };
  }
}

/**
 * อัปเดตสถานะ Todo
 */
export async function toggleTodo(id: number, isComplete: boolean): Promise<ApiResponse<Todo>> {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('todos')
      .update({ is_complete: !isComplete })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath('/examples/todos');

    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: message };
  }
}

/**
 * ลบ Todo
 */
export async function deleteTodo(id: number): Promise<ApiResponse<boolean>> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error: error.message };
    }

    revalidatePath('/examples/todos');

    return { data: true, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { data: null, error: message };
  }
}

