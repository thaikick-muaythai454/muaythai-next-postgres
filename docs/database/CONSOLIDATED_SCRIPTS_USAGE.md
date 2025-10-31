# Consolidated Database Scripts Usage Guide

This guide provides comprehensive usage instructions for all consolidated database scripts, including examples, best practices, and troubleshooting.

## 📋 Quick Reference

| Script | Purpose | Usage |
|--------|---------|-------|
| `admin-management.sql` | Admin user management | Run in SQL Editor |
| `database-utilities.js` | Database health & maintenance | `node scripts/database-utilities.js [command]` |
| `development-setup.sh` | Development environment setup | `./scripts/development-setup.sh [options]` |
| `storage-configuration.sql` | Storage bucket & policy setup | Run in SQL Editor |

## 🔧 1. Admin Management Script

### Overview
Complete admin user role management system with comprehensive error handling and validation.

### Setup
```sql
-- Run once to install all admin functions
\i scripts/admin-management.sql
```

### Core Functions

#### Promote User to Admin
```sql
-- By email (recommended)
SELECT public.promote_to_admin('user@example.com');

-- By user ID
SELECT public.promote_to_admin_by_id('550e8400-e29b-41d4-a716-446655440000');

-- Batch promotion
SELECT * FROM public.batch_promote_to_admin(ARRAY[
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
]);
```

#### Check User Roles
```sql
-- Check specific user
SELECT * FROM public.check_user_role('user@example.com');

-- List all admins
SELECT * FROM public.list_all_admins();

-- Validate admin system
SELECT * FROM public.validate_admin_setup();
```

#### Demote Admin Users
```sql
-- Demote admin to regular user
SELECT public.demote_from_admin('admin@example.com');
```

### Real-World Examples

#### Initial Admin Setup
```sql
-- Set up first admin user
SELECT public.promote_to_admin('your-email@company.com');

-- Verify admin was created
SELECT * FROM public.list_all_admins();

-- Check admin permissions
SELECT * FROM public.validate_admin_setup();
```

#### Team Admin Management
```sql
-- Promote multiple team members
SELECT * FROM public.batch_promote_to_admin(ARRAY[
    'team-lead@company.com',
    'senior-dev@company.com',
    'devops@company.com'
]);

-- Check all admin users
SELECT 
    email,
    username,
    role_created_at,
    role_updated_at
FROM public.list_all_admins()
ORDER BY role_created_at;
```

#### Admin Audit
```sql
-- Comprehensive admin audit
SELECT 
    u.email,
    u.created_at as user_created,
    ur.role,
    ur.created_at as role_assigned,
    ur.updated_at as role_updated,
    CASE 
        WHEN ur.updated_at > ur.created_at THEN 'Role Modified'
        ELSE 'Original Assignment'
    END as status
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

### Error Handling
The admin functions include comprehensive error handling:

```sql
-- Example error responses
SELECT public.promote_to_admin('nonexistent@example.com');
-- Returns: 'ERROR: User with email nonexistent@example.com not found. Please ensure the user is registered first.'

SELECT public.promote_to_admin('already-admin@example.com');
-- Returns: 'INFO: User already-admin@example.com is already an admin.'
```

## 🔍 2. Database Utilities Script

### Overview
Comprehensive database health checking, maintenance, and verification utilities.

### Basic Usage
```bash
# Default health check
node scripts/database-utilities.js
node scripts/database-utilities.js check

# Specific utilities
node scripts/database-utilities.js partners  # Partner role verification
node scripts/database-utilities.js slugs    # Gym slug management
node scripts/database-utilities.js storage  # Storage verification
node scripts/database-utilities.js all      # All utilities

# Help and information
node scripts/database-utilities.js help
```

### NPM Script Shortcuts
```bash
# Add to package.json
npm run db:check      # Health check
npm run db:partners   # Partner verification
npm run db:slugs      # Slug updates
npm run db:storage    # Storage verification
npm run db:utils      # All utilities
```

### Environment Configuration

#### Local Development
```bash
# Uses default local Supabase configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=<local_anon_key>
```

#### Production
```bash
# Set production environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your_anon_key

# Run utilities
node scripts/database-utilities.js check
```

### Detailed Command Examples

#### Database Health Check
```bash
# Basic health check
node scripts/database-utilities.js check

# Example output:
# ✅ Database connectivity: OK
# ✅ Core tables: All 8 tables accessible
# ✅ User roles table: OK (3 users with roles)
# ✅ Storage buckets: gym-images bucket exists and is public
# ✅ RLS policies: 15 policies configured
# 
# Database health check completed successfully!
```

#### Partner Role Verification
```bash
# Check partner role promotions
node scripts/database-utilities.js partners

# Example output:
# 📊 Partner Role Analysis:
# ✅ Total users: 25
# ✅ Users with partner role: 3
# ✅ Gym applications: 5 (2 approved, 1 pending, 2 rejected)
# ⚠️  Users who should be partners but aren't: 1
#    - user@example.com (approved gym application but no partner role)
```

#### Gym Slug Management
```bash
# Update gym slugs
node scripts/database-utilities.js slugs

# Example output:
# 🏋️  Gym Slug Management:
# ✅ Total gyms: 12
# ✅ Gyms with slugs: 11
# ⚠️  Gyms missing slugs: 1
#    - Updating slug for "Bangkok Muay Thai Gym" → "bangkok-muay-thai-gym"
# ✅ Slug generation trigger: Active
# ✅ All gym slugs updated successfully!
```

#### Storage Verification
```bash
# Check storage configuration
node scripts/database-utilities.js storage

# Example output:
# 🗄️  Storage Configuration:
# ✅ gym-images bucket: Exists and is public
# ✅ Storage policies: 5 policies configured
# ✅ Bucket permissions: Properly configured
# ✅ Storage extension: Available
```

### Advanced Usage

#### Automated Health Monitoring
```bash
#!/bin/bash
# health-monitor.sh - Run every 5 minutes via cron

LOG_FILE="/var/log/database-health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Running database health check..." >> $LOG_FILE

if node scripts/database-utilities.js check >> $LOG_FILE 2>&1; then
    echo "[$TIMESTAMP] Health check passed" >> $LOG_FILE
else
    echo "[$TIMESTAMP] Health check FAILED - sending alert" >> $LOG_FILE
    # Send alert (email, Slack, etc.)
fi
```

#### CI/CD Integration
```yaml
# .github/workflows/database-check.yml
name: Database Health Check
on: [push, pull_request]

jobs:
  database-health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Check database health
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: node scripts/database-utilities.js check
```

## 🚀 3. Development Setup Script

### Overview
Complete development environment setup including user creation, data seeding, and environment validation.

### Basic Usage
```bash
# Full development setup (recommended for new developers)
./scripts/development-setup.sh

# Specific operations
./scripts/development-setup.sh --users-only    # Create test users only
./scripts/development-setup.sh --seed-only     # Seed sample data only
./scripts/development-setup.sh --check-only    # Environment check only
./scripts/development-setup.sh --help          # Show help
```

### Environment Detection
The script automatically detects your environment:

```bash
# Local development (default)
SUPABASE_URL=http://127.0.0.1:54321

# Production (when URL contains production domain)
SUPABASE_URL=https://your-project.supabase.co
```

### Test Users Created

| Email | Password | Role | Username | Full Name |
|-------|----------|------|----------|-----------|
| `admin@muaythai.com` | `password123` | Admin | `admin` | Admin User |
| `user@muaythai.com` | `password123` | User | `regular_user` | ผู้ใช้ทั่วไป |
| `partner@muaythai.com` | `password123` | Partner | `somchai_gym` | สมชาย มวยไทย |
| `partner2@muaythai.com` | `password123` | Partner | `somying_fitness` | สมหญิง ฟิตเนส |

### Detailed Examples

#### New Developer Onboarding
```bash
# Complete setup for new team member
./scripts/development-setup.sh

# Example output:
# ================================================
# DEVELOPMENT ENVIRONMENT SETUP
# ================================================
# Environment: LOCAL
# Supabase URL: http://127.0.0.1:54321
# ================================================
# 
# [INFO] Checking required dependencies...
# [SUCCESS] All required dependencies are installed
# [INFO] Validating environment configuration...
# [SUCCESS] Environment configuration is valid
# [INFO] Checking database connectivity and migration status...
# [SUCCESS] Database is accessible and properly migrated
# [INFO] Creating test users...
# [SUCCESS] Created user: admin@muaythai.com (ID: 550e8400-e29b-41d4-a716-446655440000)
# [SUCCESS] Created user: user@muaythai.com (ID: 6ba7b810-9dad-11d1-80b4-00c04fd430c8)
# [SUCCESS] User creation completed: 4 created, 0 failed
# [INFO] Seeding sample data...
# [SUCCESS] Sample data seeded successfully using Supabase CLI
# [SUCCESS] Development setup completed successfully!
```

#### Production User Creation (Careful!)
```bash
# Production environment requires confirmation
SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_ANON_KEY=your_anon_key \
SUPABASE_SERVICE_ROLE_KEY=your_service_key \
./scripts/development-setup.sh --users-only

# Output includes safety prompt:
# [WARNING] You are about to create test users in PRODUCTION!
# Are you sure you want to continue? (type 'yes' to confirm): yes
```

#### Environment Health Check
```bash
# Check development environment without making changes
./scripts/development-setup.sh --check-only

# Example output:
# [INFO] Running development environment health check...
# [SUCCESS] Node.js: v18.17.0
# [SUCCESS] npm: 9.6.7
# [SUCCESS] node_modules directory exists
# [SUCCESS] package.json found
# [SUCCESS] Script available: npm run dev
# [SUCCESS] Script available: npm run build
# [SUCCESS] TypeScript configuration found
# [SUCCESS] Next.js configuration found
# [SUCCESS] Tailwind CSS configuration found
# [SUCCESS] Development environment health check passed!
```

### Advanced Usage

#### Custom Environment Variables
```bash
# Use custom Supabase instance
SUPABASE_URL=https://custom.supabase.co \
SUPABASE_ANON_KEY=custom_anon_key \
SUPABASE_SERVICE_ROLE_KEY=custom_service_key \
./scripts/development-setup.sh
```

#### Docker Integration
```dockerfile
# Dockerfile for development
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm install
RUN chmod +x scripts/development-setup.sh

# Run setup during container build
RUN ./scripts/development-setup.sh --check-only

CMD ["npm", "run", "dev"]
```

## 🗄️ 4. Storage Configuration Script

### Overview
Complete storage bucket and policy configuration with comprehensive error handling and verification.

### Setup
```sql
-- Run once to configure all storage
\i scripts/storage-configuration.sql
```

### Features Configured

#### Gym Images Bucket
- Public access enabled
- Comprehensive access policies
- Error handling for existing configurations

#### Storage Policies Created
1. **Upload Policy**: Authenticated users can upload gym images
2. **Read Policy**: Public read access for gym images
3. **Update Policy**: Users can update their own gym images
4. **Delete Policy**: Users can delete their own gym images
5. **Admin Policy**: Admins can manage all gym images

### Utility Functions

#### Health Check
```sql
-- Check storage bucket health
SELECT * FROM check_storage_bucket_health();

-- Example output:
-- status  | bucket_exists | is_public | policy_count | last_updated
-- HEALTHY | true          | true      | 5            | 2024-10-24 10:30:00
```

#### Policy Recreation
```sql
-- Recreate storage policies (if needed)
SELECT recreate_storage_policies();

-- Returns: 'Storage policies recreated successfully for bucket: gym-images'

-- For custom bucket
SELECT recreate_storage_policies('custom-bucket');
```

### Verification Queries

#### Check Bucket Configuration
```sql
-- View bucket details
SELECT 
    id as bucket_id,
    name as bucket_name,
    public as is_public,
    created_at,
    updated_at
FROM storage.buckets 
WHERE id = 'gym-images';
```

#### Check Storage Policies
```sql
-- List all storage policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%gym images%'
ORDER BY policyname;
```

#### Test Storage Access
```sql
-- Test storage access (requires actual file upload)
SELECT 
    name,
    bucket_id,
    owner,
    created_at,
    updated_at,
    last_accessed_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'gym-images'
LIMIT 5;
```

### Rollback Procedures

If you need to remove storage configuration:

```sql
-- WARNING: This will remove all storage configuration!
-- Uncomment and run carefully

/*
-- Drop all gym image policies
DROP POLICY IF EXISTS "Authenticated users can upload gym images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view gym images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own gym images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own gym images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all gym images" ON storage.objects;

-- Drop utility functions
DROP FUNCTION IF EXISTS check_storage_bucket_health(TEXT);
DROP FUNCTION IF EXISTS recreate_storage_policies(TEXT);

-- WARNING: Uncomment to DELETE bucket and ALL contents
-- DELETE FROM storage.buckets WHERE id = 'gym-images';
*/
```

## 🔧 Integration Examples

### Complete Project Setup

#### New Project Setup
```bash
#!/bin/bash
# complete-setup.sh - Full project setup script

echo "🚀 Starting complete project setup..."

# 1. Install dependencies
npm install

# 2. Start Supabase (local development)
supabase start

# 3. Apply migrations
supabase db reset

# 4. Configure storage
echo "📦 Configuring storage..."
supabase db sql --file scripts/storage-configuration.sql

# 5. Set up admin functions
echo "👤 Setting up admin management..."
supabase db sql --file scripts/admin-management.sql

# 6. Create development users and seed data
echo "🌱 Setting up development environment..."
./scripts/development-setup.sh

# 7. Create first admin user
echo "🔑 Creating admin user..."
supabase db sql --command "SELECT public.promote_to_admin('admin@muaythai.com');"

# 8. Verify everything works
echo "✅ Running health checks..."
node scripts/database-utilities.js all

echo "🎉 Project setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start development server: npm run dev"
echo "  2. Login with: admin@muaythai.com / password123"
echo "  3. Check admin dashboard functionality"
```

#### Production Deployment
```bash
#!/bin/bash
# production-deploy.sh - Production deployment script

echo "🚀 Starting production deployment..."

# 1. Link to production project
supabase link --project-ref $SUPABASE_PROJECT_REF

# 2. Push migrations
supabase db push

# 3. Configure storage (run manually in dashboard)
echo "📦 Configure storage manually in Supabase dashboard:"
echo "   - Run scripts/storage-configuration.sql in SQL Editor"

# 4. Set up admin functions (run manually in dashboard)
echo "👤 Set up admin management manually in Supabase dashboard:"
echo "   - Run scripts/admin-management.sql in SQL Editor"

# 5. Create production admin (manual step)
echo "🔑 Create production admin manually:"
echo "   - Run: SELECT public.promote_to_admin('your-admin@company.com');"

# 6. Verify deployment
echo "✅ Verify deployment:"
echo "   - Run: node scripts/database-utilities.js check"

echo "⚠️  Remember to:"
echo "  1. Set production environment variables"
echo "  2. Configure proper RLS policies"
echo "  3. Set up monitoring and backups"
echo "  4. Test all functionality thoroughly"
```

### Monitoring and Maintenance

#### Daily Health Check
```bash
#!/bin/bash
# daily-health-check.sh - Run via cron daily

DATE=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE="/var/log/database-health-$(date '+%Y-%m-%d').log"

echo "[$DATE] Starting daily health check..." >> $LOG_FILE

# Run all database utilities
if node scripts/database-utilities.js all >> $LOG_FILE 2>&1; then
    echo "[$DATE] All health checks passed ✅" >> $LOG_FILE
else
    echo "[$DATE] Health check FAILED ❌" >> $LOG_FILE
    # Send alert notification
    curl -X POST -H 'Content-type: application/json' \
        --data '{"text":"Database health check failed! Check logs for details."}' \
        $SLACK_WEBHOOK_URL
fi

# Cleanup old logs (keep 30 days)
find /var/log -name "database-health-*.log" -mtime +30 -delete

echo "[$DATE] Daily health check completed" >> $LOG_FILE
```

#### Weekly Admin Audit
```bash
#!/bin/bash
# weekly-admin-audit.sh - Run via cron weekly

DATE=$(date '+%Y-%m-%d')
REPORT_FILE="/var/log/admin-audit-$DATE.log"

echo "Weekly Admin Audit Report - $DATE" > $REPORT_FILE
echo "=================================" >> $REPORT_FILE

# Get admin count and details
supabase db sql --command "
SELECT 
    'Admin Users: ' || COUNT(*) as summary
FROM public.user_roles 
WHERE role = 'admin';

SELECT 
    u.email,
    ur.created_at as admin_since,
    CASE 
        WHEN ur.updated_at > ur.created_at THEN 'Modified'
        ELSE 'Original'
    END as status
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY ur.created_at;
" >> $REPORT_FILE

# Email report to administrators
mail -s "Weekly Admin Audit Report" admin@company.com < $REPORT_FILE
```

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### 1. Permission Denied Errors
```bash
# Error: permission denied for table user_roles
# Solution: Use service role key for admin operations

export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
node scripts/database-utilities.js check
```

#### 2. Functions Not Found
```sql
-- Error: function public.promote_to_admin(text) does not exist
-- Solution: Run admin management script

\i scripts/admin-management.sql

-- Verify functions exist
\df public.promote_to_admin
```

#### 3. Storage Bucket Missing
```sql
-- Error: Storage bucket "gym-images" does NOT exist
-- Solution: Run storage configuration script

\i scripts/storage-configuration.sql

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'gym-images';
```

#### 4. Environment Variables Not Found
```bash
# Error: Missing Supabase credentials
# Solution: Check environment configuration

# For local development
cat .env.local

# For production
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

#### 5. Migration Conflicts
```bash
# Error: relation already exists
# Solution: Check migration status and reset if needed

supabase migration list
supabase db reset  # Local development only
```

### Debug Commands

#### Check Database Connection
```bash
# Test basic connectivity
curl -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/"
```

#### Verify Table Access
```sql
-- Check if tables exist and are accessible
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

#### Check RLS Policies
```sql
-- List all RLS policies
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

#### Verify Functions
```sql
-- List all custom functions
SELECT routine_name, routine_type, data_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
```

## 📚 Best Practices

### 1. Security
- Always use service role key for admin operations
- Regularly audit admin users
- Monitor storage access patterns
- Keep environment variables secure

### 2. Maintenance
- Run health checks regularly
- Monitor database performance
- Keep backups current
- Update documentation when making changes

### 3. Development
- Use local Supabase for development
- Test all scripts before production deployment
- Follow the migration guide when updating
- Document any custom modifications

### 4. Monitoring
- Set up automated health checks
- Monitor storage usage
- Track admin user changes
- Alert on failures

This comprehensive guide should help you effectively use all consolidated database scripts. Remember to always test in a development environment before applying changes to production!