# 🏗️ โครงสร้างโปรเจกต์ (Project Architecture)

## 📁 โครงสร้าง Folder

```
muaythai-next-postgres/
├── src/
│   ├── actions/              # Backend - Server Actions
│   │   └── todos.actions.ts
│   │
│   ├── app/                  # Next.js App Router (Pages)
│   │   ├── examples/
│   │   │   ├── auth/
│   │   │   │   └── page.tsx  # Authentication Page
│   │   │   └── todos/
│   │   │       └── page.tsx  # Todo App Page
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Homepage
│   │   └── globals.css
│   │
│   ├── components/           # Frontend - UI Components
│   │   ├── todos/
│   │   │   ├── TodoForm.tsx  # ฟอร์มเพิ่ม Todo
│   │   │   └── TodoList.tsx  # แสดงรายการ Todo
│   │   └── ui/
│   │       ├── Loading.tsx   # Loading Component
│   │       └── ErrorMessage.tsx # Error Display
│   │
│   ├── hooks/                # Frontend - Custom React Hooks
│   │   ├── useAuth.ts        # Authentication Hook
│   │   └── useTodos.ts       # Todos Management Hook
│   │
│   ├── lib/                  # Backend - Core Libraries
│   │   └── supabase/
│   │       ├── client.ts     # Supabase Client (Browser)
│   │       ├── server.ts     # Supabase Client (Server)
│   │       └── middleware.ts # Auth Middleware Helper
│   │
│   ├── services/             # Frontend - Business Logic Services
│   │   └── auth.service.ts   # Authentication Service
│   │
│   ├── types/                # TypeScript Type Definitions
│   │   ├── auth.types.ts     # Authentication Types
│   │   └── database.types.ts # Database Schema Types
│   │
│   └── middleware.ts         # Next.js Middleware (Auth)
│
├── public/                   # Static Assets
├── .env.local                # Environment Variables (local)
├── .env.example              # Environment Variables Template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🔀 การแยก Frontend และ Backend

### Backend (Server-Side)

#### 1. **Server Actions** (`src/actions/`)
- ฟังก์ชัน Server-side ที่ทำงานฝั่ง server
- ใช้ `'use server'` directive
- สำหรับ CRUD operations และ business logic

```typescript
// src/actions/todos.actions.ts
'use server';

export async function getTodos() {
  const supabase = await createClient();
  // ... database operations
}
```

**ข้อดี:**
- ✅ Secure - ไม่ expose database credentials
- ✅ Performance - server-side rendering
- ✅ SEO-friendly

#### 2. **Supabase Server Client** (`src/lib/supabase/server.ts`)
- Supabase client สำหรับ Server Components
- ใช้ใน Server Actions และ Server Components
- จัดการ cookies และ authentication

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  // ...
}
```

#### 3. **Middleware** (`src/middleware.ts`)
- จัดการ authentication state
- อัปเดต session cookies
- ทำงานทุก request

---

### Frontend (Client-Side)

#### 1. **Custom Hooks** (`src/hooks/`)
- React Hooks สำหรับจัดการ state และ logic
- Reusable และ testable
- แยก business logic ออกจาก UI

```typescript
// src/hooks/useTodos.ts
export function useTodos() {
  const [todos, setTodos] = useState([]);
  // ...
  return { todos, addTodo, toggleTodo, deleteTodo };
}
```

**ตัวอย่างการใช้:**
```tsx
function TodosPage() {
  const { todos, addTodo } = useTodos();
  // ...
}
```

#### 2. **Services** (`src/services/`)
- Business logic สำหรับ client-side
- API calls และ data transformations
- ใช้ร่วมกับ hooks

```typescript
// src/services/auth.service.ts
export async function signIn(credentials) {
  const supabase = createClient();
  // ...
}
```

#### 3. **Components** (`src/components/`)
- Pure UI components
- Reusable และมี props ชัดเจน
- ไม่มี business logic

```tsx
// src/components/todos/TodoList.tsx
interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  // ... render UI only
}
```

#### 4. **Pages** (`src/app/`)
- เชื่อม hooks, services และ components เข้าด้วยกัน
- จัดการ routing และ layout
- ใช้ Server Components เมื่อเป็นไปได้

---

## 📊 Data Flow

### Client-Side Pattern (useTodos Hook)

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook Function (useTodos)
    ↓
Supabase Client (browser)
    ↓
Supabase Database
    ↓
Update Local State
    ↓
Re-render Component
```

### Server-Side Pattern (Server Actions)

```
Form Submission
    ↓
Server Action (todos.actions.ts)
    ↓
Supabase Server Client
    ↓
Supabase Database
    ↓
revalidatePath() - Update cache
    ↓
Re-render page with new data
```

---

## 🔐 Authentication Flow

### 1. Sign Up / Sign In

```
User submits form
    ↓
useAuth hook
    ↓
auth.service (signIn/signUp)
    ↓
Supabase Auth API
    ↓
Set auth cookies
    ↓
Middleware updates session
    ↓
User state updated
```

### 2. Protected Routes (ถ้ามีการเพิ่ม)

```
Request to /protected
    ↓
Middleware checks auth
    ↓
Valid session? → Allow
Invalid? → Redirect to /auth
```

---

## 📦 TypeScript Types

### Database Types (`src/types/database.types.ts`)

```typescript
export interface Todo {
  id: number;
  task: string;
  is_complete: boolean;
  created_at: string;
}

export interface CreateTodoInput {
  task: string;
}
```

### Auth Types (`src/types/auth.types.ts`)

```typescript
export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
```

**ข้อดี:**
- ✅ Type safety ทั้งโปรเจกต์
- ✅ Autocomplete ใน IDE
- ✅ Catch errors ตอน compile time

---

## 🎯 Best Practices

### 1. **Component Design**

**❌ ไม่ดี - ปนกันทั้งหมด:**
```tsx
function TodoPage() {
  const [todos, setTodos] = useState([]);
  const supabase = createClient();
  
  const fetchTodos = async () => { /* ... */ };
  const addTodo = async () => { /* ... */ };
  
  return (
    <div>
      <form onSubmit={addTodo}>...</form>
      <ul>
        {todos.map(todo => <li>...</li>)}
      </ul>
    </div>
  );
}
```

**✅ ดี - แยกชัดเจน:**
```tsx
function TodoPage() {
  const { todos, addTodo } = useTodos(); // Hook
  
  return (
    <div>
      <TodoForm onSubmit={addTodo} />  {/* Component */}
      <TodoList todos={todos} />        {/* Component */}
    </div>
  );
}
```

### 2. **Server vs Client Components**

**Server Components (default):**
- ดึงข้อมูลจาก database
- Access environment variables
- ไม่ใช้ React hooks
- SEO-friendly

```tsx
// app/page.tsx (Server Component)
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from('todos').select();
  return <div>{/* render data */}</div>;
}
```

**Client Components (`'use client'`):**
- ใช้ React hooks (useState, useEffect)
- Event handlers (onClick, onChange)
- Browser APIs
- Interactive UI

```tsx
// app/examples/todos/page.tsx
'use client';

export default function TodosPage() {
  const { todos } = useTodos(); // ใช้ hooks ได้
  return <TodoList todos={todos} />;
}
```

### 3. **Error Handling**

```typescript
// ในทุก service/hook ควรมี error handling
export async function createTodo(task: string) {
  try {
    const { data, error } = await supabase.from('todos').insert({ task });
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

---

## 🔄 เมื่อต้องการเพิ่ม Feature ใหม่

### ตัวอย่าง: เพิ่ม "Posts" Feature

#### 1. สร้าง Types
```typescript
// src/types/database.types.ts
export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: string;
}
```

#### 2. สร้าง Server Actions (ถ้าต้องการ SSR)
```typescript
// src/actions/posts.actions.ts
'use server';

export async function getPosts() {
  const supabase = await createClient();
  return await supabase.from('posts').select();
}
```

#### 3. สร้าง Custom Hook (ถ้าต้องการ Client-side)
```typescript
// src/hooks/usePosts.ts
export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  // ... logic
  return { posts, createPost, deletePost };
}
```

#### 4. สร้าง Components
```typescript
// src/components/posts/PostCard.tsx
export function PostCard({ post }: { post: Post }) {
  return <div>{post.title}</div>;
}
```

#### 5. สร้าง Page
```typescript
// src/app/posts/page.tsx
'use client';

export default function PostsPage() {
  const { posts } = usePosts();
  return <div>{posts.map(p => <PostCard post={p} />)}</div>;
}
```

---

## 📚 เรียนรู้เพิ่มเติม

- [Next.js App Router](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Supabase with Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [React Hooks](https://react.dev/reference/react)

---

มีคำถามเกี่ยวกับโครงสร้าง? สร้าง Issue บน GitHub! 🚀

