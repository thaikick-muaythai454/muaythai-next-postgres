'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';

export default function AuthPage() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const result = mode === 'signup' 
      ? await signUp({ email, password })
      : await signIn({ email, password });

    setMessage(result.message);
    
    if (result.success) {
      setEmail('');
      setPassword('');
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    setMessage(result.message);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-800 min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-800 py-12 min-h-screen">
      <div className="mx-auto px-4 max-w-md container">
        <Link 
          href="/"
          className="inline-flex items-center mb-6 text-blue-600 hover:text-blue-700"
        >
          ← กลับหน้าแรก
        </Link>

        <div className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded-xl">
          <h1 className="mb-6 font-bold text-gray-800 dark:text-white text-3xl text-center">
            🔐 Authentication
          </h1>

          {user ? (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="mb-2 font-medium text-green-800 dark:text-green-200">
                  ✅ เข้าสู่ระบบแล้ว
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  อีเมล: {user.email}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  ID: {user.id}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg w-full font-medium text-white transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <div>
              <div className="flex mb-6 border-gray-200 dark:border-gray-700 border-b">
                <button
                  onClick={() => setMode('signin')}
                  className={`flex-1 py-2 font-medium transition-colors ${
                    mode === 'signin'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className={`flex-1 py-2 font-medium transition-colors ${
                    mode === 'signup'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  ลงทะเบียน
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="dark:bg-gray-700 px-4 py-2 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    รหัสผ่าน
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="dark:bg-gray-700 px-4 py-2 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full dark:text-white"
                  />
                  <p className="mt-1 text-gray-500 dark:text-gray-400 text-xs">
                    รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
                  </p>
                </div>

                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg w-full font-medium text-white transition-colors"
                >
                  {mode === 'signin' ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
                </button>
              </form>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes('สำเร็จ')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/20 mt-6 p-4 rounded-lg">
            <p className="text-blue-900 dark:text-blue-200 text-sm">
              💡 <strong>หมายเหตุ:</strong> โดยปกติ Supabase จะส่งอีเมลยืนยัน
              หากคุณใช้งานในโหมด development อาจต้องปิดการยืนยันอีเมลใน
              Supabase Dashboard {'>'} Authentication {'>'} Settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
