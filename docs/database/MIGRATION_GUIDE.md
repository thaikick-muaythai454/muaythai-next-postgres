# Database Scripts Consolidation Migration Guide

This guide helps you migrate from the old scattered database scripts structure to the new consolidated, organized system.

## 📋 Overview

The database scripts consolidation project has transformed:
- **12+ individual script files** → **4 comprehensive scripts**
- **15+ migration files** → **6 optimized migrations**
- **Scattered functionality** → **Organized, documented system**

## 🎯 Benefits of Migration

### Before (Old Structure)
```
scripts/
├── admin-management.sql          # Partial admin functions
├── check-database.mjs           # Basic health check
├── check-partner-promotion.sql  # Partner role queries
├── create-admin.sql             # Single admin creation
├── create-test-users.sh         # Basic user creation
├── database-utilities.js        # Limited utilities
├── development-setup.sh         # Basic setup
├── set-admin-by-email.sql       # Email-based admin setting
├── set-admin-role.sql           # Role-based admin setting
├── setup-storage.sql            # Basic storage setup
├── storage-configuration.sql    # Storage policies
└── update-gym-slugs.sql         # Slug updates

supabase/migrations/
├── 20251018073856_initial_schema.sql
├── 20251019000000_add_gym_public_fields.sql
├── 20251019000001_remove_unique_user_gym.sql
├── 20251019000002_add_slug_generation.sql
├── 20251020000000_add_phone_to_profiles.sql
├── 20251020000001_create_gym_packages.sql
├── 20251020000002_seed_gym_packages.sql
├── 20251020000003_create_payments_tables.sql
├── 20251020000004_add_partner_booking_update_policy.sql
├── 20251020100000_refactor_remove_duplicates.sql
├── 20251020100001_optimize_triggers.sql
├── 20251020100002_add_helper_functions.sql
├── 20251020100003_optimize_indexes.sql
└── 20251020100004_test_refactoring.sql

supabase/migrations_backup/
├── add_username_support.sql
├── admin_helper_functions.sql
├── create_bucket_only.sql
├── create_gym_images_bucket.sql
├── fix_user_roles_rls.sql
└── partner_application_setup.sql
```

### After (New Structure)
```
scripts/
├── admin-management.sql          # Complete admin management system
├── database-utilities.js         # Comprehensive database utilities
├── development-setup.sh          # Full development environment setup
├── storage-configuration.sql     # Complete storage configuration
└── README.md                     # Comprehensive documentation

supabase/migrations/
├── 20251018073856_initial_schema.sql           # Core schema (unchanged)
├── 20251019000000_gym_enhancements.sql         # Consolidated gym features
├── 20251020000000_user_profiles_auth.sql       # Consolidated user/auth
├── 20251020000001_packages_payments.sql        # Consolidated packages/payments
├── 20251020000002_storage_policies.sql         # Consolidated storage setup
├── 20251020100000_optimization_final.sql       # Consolidated optimizations
└── README.md                                   # Updated documentation
```

## 🚀 Migration Steps

### Step 1: Backup Current State

```bash
# Create backup of current scripts and migrations
cp -r scripts scripts_backup_$(date +%Y%m%d_%H%M%S)
cp -r supabase/migrations supabase/migrations_backup_$(date +%Y%m%d_%H%M%S)

# Create database backup (recommended)
supabase db dump --local > database_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Verify Current Functionality

Before migrating, test that your current setup works:

```bash
# Test current database utilities
node scripts/check-database.mjs

# Test current admin functions (if you have them)
# Run any existing admin SQL scripts

# Test current user creation
./scripts/create-test-users.sh

# Test current storage setup
# Run existing storage SQL scripts
```

Document any custom modifications you've made to the scripts.

### Step 3: Update Scripts Directory

#### 3.1 Replace Individual Scripts

The new consolidated scripts replace multiple old scripts:

**Admin Management:**
```bash
# Old approach (multiple files)
# scripts/create-admin.sql
# scripts/set-admin-by-email.sql  
# scripts/set-admin-role.sql

# New approach (single comprehensive file)
# Use scripts/admin-management.sql with functions:
# - promote_to_admin(email)
# - promote_to_admin_by_id(user_id)
# - demote_from_admin(email)
# - check_user_role(email)
# - list_all_admins()
# - batch_promote_to_admin(emails[])
```

**Database Utilities:**
```bash
# Old approach
node scripts/check-database.mjs
# SQL queries from check-partner-promotion.sql
# SQL queries from update-gym-slugs.sql

# New approach
node scripts/database-utilities.js check     # Health check
node scripts/database-utilities.js partners # Partner verification
node scripts/database-utilities.js slugs    # Slug updates
node scripts/database-utilities.js all      # All utilities
```

**Development Setup:**
```bash
# Old approach
./scripts/create-test-users.sh

# New approach
./scripts/development-setup.sh              # Full setup
./scripts/development-setup.sh --users-only # Users only
./scripts/development-setup.sh --seed-only  # Seed data only
./scripts/development-setup.sh --check-only # Environment check
```

**Storage Configuration:**
```bash
# Old approach (multiple files)
# scripts/setup-storage.sql
# migrations_backup/create_gym_images_bucket.sql

# New approach (single comprehensive file)
# Use scripts/storage-configuration.sql with:
# - Complete bucket setup
# - All policies in one place
# - Verification functions
# - Rollback procedures
```

#### 3.2 Update NPM Scripts

Update your `package.json`:

```json
{
  "scripts": {
    "db:check": "node scripts/database-utilities.js check",
    "db:partners": "node scripts/database-utilities.js partners", 
    "db:slugs": "node scripts/database-utilities.js slugs",
    "db:storage": "node scripts/database-utilities.js storage",
    "db:utils": "node scripts/database-utilities.js all",
    "dev:setup": "./scripts/development-setup.sh",
    "dev:users": "./scripts/development-setup.sh --users-only",
    "dev:seed": "./scripts/development-setup.sh --seed-only",
    "dev:check": "./scripts/development-setup.sh --check-only"
  }
}
```

### Step 4: Test New Scripts

#### 4.1 Test Admin Management

```sql
-- Run the consolidated admin script
\i scripts/admin-management.sql

-- Test admin promotion
SELECT public.promote_to_admin('your-email@example.com');

-- Verify admin was created
SELECT * FROM public.list_all_admins();

-- Test role checking
SELECT * FROM public.check_user_role('your-email@example.com');

-- Test validation
SELECT * FROM public.validate_admin_setup();
```

#### 4.2 Test Database Utilities

```bash
# Test all utilities
node scripts/database-utilities.js all

# Test individual utilities
node scripts/database-utilities.js check
node scripts/database-utilities.js partners
node scripts/database-utilities.js slugs
node scripts/database-utilities.js storage

# Test help
node scripts/database-utilities.js help
```

#### 4.3 Test Development Setup

```bash
# Test environment check
./scripts/development-setup.sh --check-only

# Test user creation (be careful in production!)
./scripts/development-setup.sh --users-only

# Test full setup (local development only)
./scripts/development-setup.sh
```

#### 4.4 Test Storage Configuration

```sql
-- Run storage configuration
\i scripts/storage-configuration.sql

-- Test health check
SELECT * FROM check_storage_bucket_health();

-- Verify bucket exists
SELECT id, name, public FROM storage.buckets WHERE id = 'gym-images';

-- Check policies
SELECT policyname FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%gym images%';
```

### Step 5: Migration Validation

#### 5.1 Functionality Checklist

- [ ] Admin users can be created and managed
- [ ] Database health checks work correctly
- [ ] Partner role verification functions properly
- [ ] Gym slug updates work as expected
- [ ] Storage buckets and policies are configured
- [ ] Test users can be created in development
- [ ] Environment detection works correctly
- [ ] All error handling functions properly

#### 5.2 Performance Verification

```bash
# Check database performance
node scripts/database-utilities.js check

# Verify no regressions in query performance
# Run your application's critical paths

# Check storage access
# Test image uploads and access through your application
```

#### 5.3 Security Validation

```sql
-- Verify admin permissions
SELECT * FROM public.validate_admin_setup();

-- Check storage policies
SELECT * FROM check_storage_bucket_health();

-- Verify RLS policies are working
-- Test access controls through your application
```

### Step 6: Clean Up Old Files

**⚠️ Only after thorough testing and validation!**

```bash
# Remove old individual scripts
rm scripts/create-admin.sql
rm scripts/set-admin-by-email.sql
rm scripts/set-admin-role.sql
rm scripts/check-database.mjs
rm scripts/check-partner-promotion.sql
rm scripts/update-gym-slugs.sql
rm scripts/create-test-users.sh
rm scripts/setup-storage.sql

# Remove old migration backups (optional)
# rm -rf supabase/migrations_backup
# rm -rf supabase/migrations_consolidated_backup

# Keep your backup directories for safety
# rm -rf scripts_backup_*  # Only after extended testing period
```

## 🔧 Migration Troubleshooting

### Common Issues and Solutions

#### Issue: Functions Not Found
```
ERROR: function public.promote_to_admin(text) does not exist
```
**Solution:**
```sql
-- Ensure admin-management.sql was run completely
\i scripts/admin-management.sql

-- Check if functions exist
\df public.promote_to_admin
```

#### Issue: Environment Variables Not Found
```
❌ Missing Supabase credentials
```
**Solution:**
```bash
# Check environment files exist
ls -la .env*

# Verify variables are set
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# For local development, ensure Supabase is running
supabase status
```

#### Issue: Permission Denied
```
⚠️ Table "user_roles" exists but access denied
```
**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_roles';

-- Verify user permissions
SELECT auth.uid(), auth.role();

-- Use service role for admin operations
-- Ensure you're using SUPABASE_SERVICE_ROLE_KEY for admin functions
```

#### Issue: Storage Bucket Missing
```
❌ Storage bucket "gym-images" does NOT exist
```
**Solution:**
```sql
-- Run storage configuration script
\i scripts/storage-configuration.sql

-- Check bucket creation
SELECT * FROM storage.buckets WHERE id = 'gym-images';

-- Verify storage extension
SELECT * FROM pg_extension WHERE extname = 'supabase_storage';
```

#### Issue: Migration Conflicts
```
ERROR: relation already exists
```
**Solution:**
```bash
# Check migration status
supabase migration list

# Reset and reapply if needed (local development only)
supabase db reset

# For production, check for conflicting migrations
# and resolve manually
```

### Rollback Procedures

If you need to rollback the migration:

#### 1. Restore Scripts
```bash
# Restore from backup
cp -r scripts_backup_YYYYMMDD_HHMMSS/* scripts/

# Restore package.json scripts section
# (restore from your version control)
```

#### 2. Restore Database Functions
```sql
-- Remove new functions if needed
DROP FUNCTION IF EXISTS public.promote_to_admin(TEXT);
DROP FUNCTION IF EXISTS public.promote_to_admin_by_id(UUID);
DROP FUNCTION IF EXISTS public.demote_from_admin(TEXT);
DROP FUNCTION IF EXISTS public.check_user_role(TEXT);
DROP FUNCTION IF EXISTS public.list_all_admins();
DROP FUNCTION IF EXISTS public.batch_promote_to_admin(TEXT[]);
DROP FUNCTION IF EXISTS public.validate_admin_setup();

-- Remove storage functions
DROP FUNCTION IF EXISTS check_storage_bucket_health(TEXT);
DROP FUNCTION IF EXISTS recreate_storage_policies(TEXT);
```

#### 3. Restore Database State
```bash
# Restore from database backup (if needed)
supabase db reset
psql -f database_backup_YYYYMMDD_HHMMSS.sql
```

## 📚 Post-Migration Best Practices

### 1. Update Documentation

- Update your project README to reference new script locations
- Update deployment documentation with new script commands
- Update team onboarding guides with new setup procedures

### 2. Update CI/CD Pipelines

```yaml
# Example GitHub Actions update
- name: Check Database Health
  run: node scripts/database-utilities.js check

- name: Setup Development Environment  
  run: ./scripts/development-setup.sh --check-only
```

### 3. Team Training

- Share this migration guide with your team
- Update development setup documentation
- Conduct training sessions on new script usage

### 4. Monitoring

- Monitor application performance after migration
- Set up alerts for database health checks
- Regularly run validation functions

## 🎉 Migration Complete!

After successful migration, you should have:

✅ **Reduced Complexity:** 4 comprehensive scripts instead of 12+ individual files  
✅ **Better Documentation:** Clear usage instructions and examples  
✅ **Improved Maintainability:** Consolidated functionality with error handling  
✅ **Enhanced Developer Experience:** Easier setup and troubleshooting  
✅ **Consistent Patterns:** Standardized approach across all scripts  

### Next Steps

1. **Update your team:** Share the new script locations and usage patterns
2. **Update documentation:** Ensure all project docs reference the new structure
3. **Monitor performance:** Watch for any issues in the first few days
4. **Gather feedback:** Get input from team members on the new structure
5. **Iterate:** Make improvements based on real-world usage

## 📞 Support

If you encounter issues during migration:

1. **Check the troubleshooting section** in this guide
2. **Run validation functions** to identify specific problems
3. **Review the backup files** to understand what changed
4. **Contact the development team** with specific error messages
5. **Use the rollback procedures** if necessary

Remember: The backup files are your safety net. Don't delete them until you're confident the migration is successful and stable.