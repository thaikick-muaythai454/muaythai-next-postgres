import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// Force dynamic rendering since we're testing Supabase connection
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  
  // Test Supabase connection
  const { error } = await supabase.from('_test').select('*').limit(1);
  const isConnected = !error || error.message.includes('relation');
  
  return (
    <div className="bg-gradient-to-b from-gray-50 dark:from-gray-900 to-gray-100 dark:to-gray-800 min-h-screen">
      <div className="mx-auto px-4 py-16 container">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 font-bold text-transparent text-5xl">
              Muaythai Next.js + Supabase
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-xl">
              โครงการที่พร้อมใช้งานด้วย Next.js และ Supabase
            </p>
          </div>

          {/* Status Card */}
          <div className="bg-white dark:bg-gray-800 shadow-lg mb-8 p-8 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-semibold text-gray-800 dark:text-white text-2xl">
                สถานะระบบ
              </h2>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isConnected 
                  ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                  : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              }`}>
                <span className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}></span>
                <span className="font-medium">
                  {isConnected ? 'เชื่อมต่อ Supabase สำเร็จ' : 'รอการตั้งค่า Supabase'}
                </span>
              </div>
            </div>

            <div className="gap-6 grid md:grid-cols-2">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-200">
                  ✅ Next.js 15
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  App Router พร้อม TypeScript
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="mb-2 font-semibold text-purple-900 dark:text-purple-200">
                  ✅ Supabase Client
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  พร้อมใช้งานทั้ง Client และ Server
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="mb-2 font-semibold text-green-900 dark:text-green-200">
                  ✅ Tailwind CSS
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Responsive และ Modern UI
                </p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg">
                <h3 className="mb-2 font-semibold text-pink-900 dark:text-pink-200">
                  ✅ TypeScript
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Type-safe development
                </p>
              </div>
            </div>
          </div>

          {/* Quick Start Guide */}
          <div className="bg-white dark:bg-gray-800 shadow-lg mb-8 p-8 rounded-xl">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-white text-2xl">
              🚀 เริ่มต้นใช้งาน
            </h2>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8 font-bold text-white">
                  1
                </span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">สร้าง Supabase Project</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    ไปที่ <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://app.supabase.com</a> และสร้างโปรเจกต์ใหม่ (ฟรี)
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8 font-bold text-white">
                  2
                </span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">คัดลอก API Keys</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    จาก Project Settings {'>'} API ให้คัดลอก URL และ anon key
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8 font-bold text-white">
                  3
                </span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">อัปเดต .env.local</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    แก้ไขไฟล์ <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.env.local</code> ใส่ค่าจริง
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex flex-shrink-0 justify-center items-center bg-blue-600 rounded-full w-8 h-8 font-bold text-white">
                  4
                </span>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">Restart Dev Server</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    รัน <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">npm run dev</code> ใหม่
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Example Links */}
          <div className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded-xl">
            <h2 className="mb-4 font-semibold text-gray-800 dark:text-white text-2xl">
              📚 ตัวอย่างการใช้งาน
            </h2>
            <div className="gap-4 grid md:grid-cols-2">
              <Link 
                href="/examples/todos"
                className="p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-lg transition-colors"
              >
                <h3 className="mb-2 font-semibold text-gray-800 dark:text-white text-lg">
                  📝 Todo App
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  CRUD operations with Supabase
                </p>
              </Link>
              <Link 
                href="/examples/auth"
                className="p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-lg transition-colors"
              >
                <h3 className="mb-2 font-semibold text-gray-800 dark:text-white text-lg">
                  🔐 Authentication
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  User login & registration
                </p>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-gray-600 dark:text-gray-400 text-center">
            <p>Built with ❤️ using Next.js and Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
