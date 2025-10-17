# Supabase Setup Guide

This project supports both **local self-hosted Supabase** and **production Supabase Cloud**.

## 🔧 Environment Variable Priority

The system checks environment variables in this order:

```
1. NEXT_PUBLIC_SUPABASE_LOCAL_URL (Local/Self-hosted)
   ↓ (if not found)
2. NEXT_PUBLIC_SUPABASE_URL (Production/Cloud)
   ↓ (if not found)
3. Skip Supabase (App still works with hardcoded data)
```

---

## 🏠 Option 1: Local Development (Self-Hosting)

### Prerequisites
- Docker Desktop installed and running

### Steps

1. **Start local Supabase:**
   ```bash
   npx supabase start
   ```

2. **Copy the output values:**
   ```
   API URL: http://127.0.0.1:54321
   anon key: eyJhb...
   ```

3. **Create `.env.local` file:**
   ```env
   # Server-side
   SUPABASE_LOCAL_URL=http://127.0.0.1:54321
   SUPABASE_LOCAL_ANON_KEY=eyJhb...
   
   # Client-side
   NEXT_PUBLIC_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY=eyJhb...
   ```

4. **Run your app:**
   ```bash
   npm run dev
   ```

### Stop Supabase
```bash
npx supabase stop
```

---

## ☁️ Option 2: Production (Supabase Cloud)

### Steps

1. **Create a Supabase project:**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details

2. **Get your credentials:**
   - Go to Project Settings > API
   - Copy "Project URL" and "anon/public" key

3. **Create `.env.local` file:**
   ```env
   # Server-side
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=eyJhb...
   
   # Client-side
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
   ```

4. **Run your app:**
   ```bash
   npm run dev
   ```

---

## 🚀 Option 3: No Supabase (Hardcoded Data Only)

**You can run the app WITHOUT Supabase!**

Most pages use hardcoded data from `src/lib/data.ts`:
- ✅ `/gyms` - Gym listings
- ✅ `/events` - Events
- ✅ `/shop` - Products
- ✅ All info pages (about, contact, faq, etc.)

**Supabase is only needed for:**
- `/examples/auth` - Authentication examples
- `/examples/todos` - Database CRUD examples

### To run without Supabase:
```bash
# Just run the dev server - no .env.local needed!
npm run dev
```

---

## 🔀 Hybrid Setup (Recommended for Development)

Use **local** for development and **production** for deployment:

```env
# .env.local (for local development)
SUPABASE_LOCAL_URL=http://127.0.0.1:54321
SUPABASE_LOCAL_ANON_KEY=your-local-key
NEXT_PUBLIC_SUPABASE_LOCAL_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY=your-local-key

# .env.production (for deployment)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-production-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

The app will automatically use:
- **Local** when running `npm run dev` (if configured)
- **Production** when deployed or if local is not available

---

## 🧪 Testing Your Setup

1. **Check if Supabase is working:**
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Test authentication:**
   - Go to http://localhost:3000/examples/auth
   - Try signing up/signing in

3. **Test database:**
   - Go to http://localhost:3000/examples/todos
   - Try creating/updating todos

---

## ❓ Troubleshooting

### "Cannot connect to Docker daemon"
- Make sure Docker Desktop is installed and running
- Try: `docker ps` to verify Docker is running

### "Invalid supabaseUrl"
- Check your `.env.local` file exists
- Verify URL format: `http://127.0.0.1:54321` or `https://xxx.supabase.co`
- Restart dev server: `npm run dev`

### "Failed to fetch"
- Local: Make sure `npx supabase start` is running
- Production: Check your internet connection and Supabase project status

### App works but auth doesn't
- This is normal! Auth pages require Supabase
- Other pages (gyms, events, shop) work without it

---

## 📝 Summary

| Environment | Variable | Purpose |
|-------------|----------|---------|
| Local (Server) | `SUPABASE_LOCAL_URL` | Self-hosted Supabase (server-side) |
| Local (Server) | `SUPABASE_LOCAL_ANON_KEY` | Local anon key (server-side) |
| Local (Client) | `NEXT_PUBLIC_SUPABASE_LOCAL_URL` | Self-hosted Supabase (client-side) |
| Local (Client) | `NEXT_PUBLIC_SUPABASE_LOCAL_ANON_KEY` | Local anon key (client-side) |
| Production (Server) | `SUPABASE_URL` | Supabase Cloud URL (server-side) |
| Production (Server) | `SUPABASE_ANON_KEY` | Production anon key (server-side) |
| Production (Client) | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Cloud URL (client-side) |
| Production (Client) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key (client-side) |

**Priority:** Local → Production → Skip (hardcoded data)

