/**
 * Custom Hook for Authentication
 * React Hook สำหรับจัดการ Authentication
 */

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { signIn, signUp, signOut, getCurrentUser, onAuthStateChange } from '@/services/auth.service';
import type { SignInCredentials, SignUpCredentials } from '@/types/auth.types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check current user
  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error checking user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign up
  const handleSignUp = async (credentials: SignUpCredentials) => {
    try {
      setError(null);
      await signUp(credentials);
      return { success: true, message: 'ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(message);
      return { success: false, message };
    }
  };

  // Sign in
  const handleSignIn = async (credentials: SignInCredentials) => {
    try {
      setError(null);
      await signIn(credentials);
      return { success: true, message: 'เข้าสู่ระบบสำเร็จ!' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(message);
      return { success: false, message };
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      setError(null);
      await signOut();
      setUser(null);
      return { success: true, message: 'ออกจากระบบสำเร็จ' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด';
      setError(message);
      return { success: false, message };
    }
  };

  useEffect(() => {
    checkUser();

    const subscription = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refetch: checkUser,
  };
}

