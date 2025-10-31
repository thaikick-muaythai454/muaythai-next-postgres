# User Creation Scripts

This directory contains scripts and tools for creating users in the Muay Thai platform database.

## 📁 Files

- `create-user.sql` - SQL functions for creating users directly in the database
- `create-user.js` - Node.js script for creating users via Supabase API
- `run-create-user.sh` - Bash script runner for easy command execution
- `src/app/api/users/create/route.ts` - API endpoint for creating users

## 🚀 Quick Start

### 1. Environment Setup

Make sure you have the following environment variables in your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url  # Optional, for SQL scripts
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Test Users (Recommended for Development)

```bash
# Using the bash script
./scripts/run-create-user.sh test-users

# Or using Node.js directly
node scripts/create-user.js --test-users
```

This will create 5 test users:
- `admin@muaythai.com` (admin role)
- `partner@muaythai.com` (partner role)
- `user@muaythai.com` (authenticated role)
- `gymowner@muaythai.com` (authenticated role)
- `trainer@muaythai.com` (authenticated role)

## 📖 Usage

### Bash Script (Recommended)

```bash
# Create test users
./scripts/run-create-user.sh test-users

# Create a single user
./scripts/run-create-user.sh single user@example.com password123

# Create a user with full details
./scripts/run-create-user.sh single user@example.com password123 "John Doe" johndoe +66812345678 admin

# List all users
./scripts/run-create-user.sh list

# Check if user exists
./scripts/run-create-user.sh check user@example.com

# Get user details
./scripts/run-create-user.sh details user@example.com

# Run SQL functions
./scripts/run-create-user.sh sql

# Show help
./scripts/run-create-user.sh help
```

### Node.js Script

```bash
# Create test users
node scripts/create-user.js --test-users

# Create a single user
node scripts/create-user.js --email user@example.com --password password123

# Create a user with full details
node scripts/create-user.js \
  --email user@example.com \
  --password password123 \
  --full-name "John Doe" \
  --username johndoe \
  --phone +66812345678 \
  --role admin

# List all users
node scripts/create-user.js --list-users

# Check if user exists
node scripts/create-user.js --check user@example.com

# Get user details
node scripts/create-user.js --details user@example.com
```

### API Endpoint

```bash
# Create a user via API
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "username": "johndoe",
    "phone": "+66812345678",
    "role": "authenticated"
  }'

# Get user details via API
curl "http://localhost:3000/api/users/create?email=user@example.com"
```

### SQL Functions

```sql
-- Create a single user
SELECT * FROM public.create_user_with_profile(
  'user@example.com',
  'password123',
  'John Doe',
  'johndoe',
  '+66812345678',
  'authenticated'
);

-- Create multiple users
SELECT * FROM public.create_multiple_users('[
  {
    "email": "user1@example.com",
    "password": "password123",
    "full_name": "User One",
    "username": "user1",
    "role": "authenticated"
  },
  {
    "email": "user2@example.com",
    "password": "password123",
    "full_name": "User Two",
    "username": "user2",
    "role": "authenticated"
  }
]'::JSONB);

-- Create test users
SELECT * FROM public.create_test_users();

-- Check if user exists
SELECT public.user_exists('user@example.com');

-- Get user details
SELECT * FROM public.get_user_details('user@example.com');
```

## 🔧 Configuration

### User Roles

- `authenticated` - Regular user (default)
- `partner` - Gym partner
- `admin` - System administrator

### Password Requirements

- Minimum 6 characters
- No special requirements (can be simple for development)

### Username Requirements

- 3-30 characters
- Only letters, numbers, underscores, and hyphens
- Must be unique

## 🛠️ Development

### Adding New User Types

1. Update the `createTestUsers()` function in `create-user.js`
2. Add new user data to the test users array
3. Update the SQL functions if needed

### Custom Validation

1. Modify the validation logic in `src/app/api/users/create/route.ts`
2. Update the Node.js script validation
3. Add new constraints to the SQL functions

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase configuration"**
   - Check your `.env` file
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

2. **"User already exists"**
   - Check if the user was created previously
   - Use `--check` to verify user existence

3. **"Permission denied"**
   - Ensure you're using the service role key
   - Check Supabase RLS policies

4. **"Database connection failed"**
   - Verify your `DATABASE_URL` is correct
   - Check if PostgreSQL is running

### Debug Mode

Set `NODE_ENV=development` for more detailed error messages:

```bash
NODE_ENV=development node scripts/create-user.js --test-users
```

## 📊 Database Schema

Users are created in the following tables:

- `auth.users` - Supabase authentication
- `public.profiles` - User profile information
- `public.user_roles` - User role assignments
- `public.user_points` - Gamification points

## 🔒 Security Notes

- Service role key has full database access
- Keep it secure and never commit to version control
- Use environment variables for all sensitive data
- Consider using RLS policies for production

## 📝 Examples

### Create Admin User

```bash
./scripts/run-create-user.sh single admin@example.com admin123 "Admin User" admin +66812345678 admin
```

### Create Partner User

```bash
./scripts/run-create-user.sh single partner@example.com partner123 "Partner User" partner +66887654321 partner
```

### Create Regular User

```bash
./scripts/run-create-user.sh single user@example.com user123 "Regular User" user +66811111111 authenticated
```

## 🎯 Next Steps

1. Run `./scripts/run-create-user.sh test-users` to create test users
2. Test login with the created users
3. Verify user roles and permissions
4. Customize user creation as needed for your use case
