# Database Performance Optimization Deployment Guide

**Migration:** `20251224000001_add_missing_foreign_key_indexes.sql`  
**Priority:** High (Performance Impact)  
**Risk Level:** Low (Adding indexes only)  
**Estimated Duration:** 2-5 minutes

---

## Overview

This migration adds 16 missing indexes on foreign key columns to improve query performance across multiple tables. These indexes are critical for JOIN operations and foreign key constraint checks.

---

## Pre-Deployment Checklist

- [ ] Review the migration file
- [ ] Verify no conflicting migrations
- [ ] Ensure database backup is recent
- [ ] Schedule during low-traffic period (recommended)
- [ ] Notify team of deployment

---

## Deployment Steps

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project: https://supabase.com/dashboard/project/[your-project]
   - Navigate to **SQL Editor**

2. **Run Migration**
   ```sql
   -- Copy and paste the contents of:
   -- supabase/migrations/20251224000001_add_missing_foreign_key_indexes.sql
   ```

3. **Verify Success**
   ```sql
   -- Check that indexes were created
   SELECT 
       schemaname,
       tablename,
       indexname
   FROM pg_indexes
   WHERE schemaname = 'public'
       AND indexname LIKE 'idx_%_created_by'
       OR indexname LIKE 'idx_%_package_id'
       OR indexname LIKE 'idx_%_sender_id'
   ORDER BY tablename, indexname;
   ```

### Option 2: Supabase CLI

```bash
# Apply the migration
npx supabase db push

# Or if using local development
npx supabase migration up
```

### Option 3: Direct SQL Connection

```bash
# Using psql
psql -h [your-db-host] -U postgres -d postgres -f supabase/migrations/20251224000001_add_missing_foreign_key_indexes.sql

# Using local Supabase
psql -h localhost -p 54322 -U postgres -d postgres -f supabase/migrations/20251224000001_add_missing_foreign_key_indexes.sql
```

---

## Post-Deployment Verification

### 1. Check Index Creation

```sql
-- Should return 16 rows
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelname::regclass)) as size
FROM pg_indexes
JOIN pg_class ON pg_class.relname = indexname
WHERE schemaname = 'public'
    AND indexname IN (
        'idx_article_versions_created_by',
        'idx_bookings_package_id',
        'idx_conversations_last_message_sender_id',
        'idx_events_created_by',
        'idx_gallery_views_viewer_id',
        'idx_gym_gallery_uploaded_by',
        'idx_gym_reviews_booking_id',
        'idx_gym_reviews_moderated_by',
        'idx_messages_read_by',
        'idx_messages_reply_to_message_id',
        'idx_payment_disputes_responded_by',
        'idx_product_orders_shipping_method_id',
        'idx_promotions_created_by',
        'idx_review_flags_flagged_by',
        'idx_review_flags_resolved_by',
        'idx_shipping_history_updated_by'
    )
ORDER BY tablename, indexname;
```

### 2. Monitor Performance

```sql
-- Check index usage after deployment (wait a few hours/days)
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as times_used,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE indexname IN (
    'idx_article_versions_created_by',
    'idx_bookings_package_id',
    'idx_conversations_last_message_sender_id',
    'idx_events_created_by',
    'idx_gallery_views_viewer_id',
    'idx_gym_gallery_uploaded_by',
    'idx_gym_reviews_booking_id',
    'idx_gym_reviews_moderated_by',
    'idx_messages_read_by',
    'idx_messages_reply_to_message_id',
    'idx_payment_disputes_responded_by',
    'idx_product_orders_shipping_method_id',
    'idx_promotions_created_by',
    'idx_review_flags_flagged_by',
    'idx_review_flags_resolved_by',
    'idx_shipping_history_updated_by'
)
ORDER BY idx_scan DESC;
```

### 3. Check Linter Results

After deployment, run Supabase linter again to verify the warnings are resolved:

1. Go to **Database** > **Linter** in Supabase Dashboard
2. Run the linter
3. Confirm "unindexed_foreign_keys" warnings are gone for the 16 fixed columns

---

## Expected Impact

### Performance Improvements

✅ **Faster JOIN queries** on affected tables  
✅ **Improved foreign key constraint checks**  
✅ **Better query planning** by PostgreSQL optimizer  
✅ **Reduced table scan operations**

### Tables Affected

- `article_versions` - Article versioning
- `bookings` - Gym bookings
- `conversations` - Messaging system
- `events` - Event management
- `gallery_views` - Gallery analytics
- `gym_gallery` - Gym photos
- `gym_reviews` - Review system
- `messages` - Chat messages
- `payment_disputes` - Payment disputes
- `product_orders` - E-commerce orders
- `promotions` - Promotional campaigns
- `review_flags` - Content moderation
- `shipping_history` - Order tracking

### Storage Impact

- Estimated index size: 1-5 MB total (minimal)
- Each index: ~50-500 KB depending on table size
- Write performance: Negligible impact (< 1%)

---

## Rollback Plan

If any issues arise, you can remove the indexes:

```sql
-- Rollback migration (use only if necessary)
DROP INDEX IF EXISTS idx_article_versions_created_by;
DROP INDEX IF EXISTS idx_bookings_package_id;
DROP INDEX IF EXISTS idx_conversations_last_message_sender_id;
DROP INDEX IF EXISTS idx_events_created_by;
DROP INDEX IF EXISTS idx_gallery_views_viewer_id;
DROP INDEX IF EXISTS idx_gym_gallery_uploaded_by;
DROP INDEX IF EXISTS idx_gym_reviews_booking_id;
DROP INDEX IF EXISTS idx_gym_reviews_moderated_by;
DROP INDEX IF EXISTS idx_messages_read_by;
DROP INDEX IF EXISTS idx_messages_reply_to_message_id;
DROP INDEX IF EXISTS idx_payment_disputes_responded_by;
DROP INDEX IF EXISTS idx_product_orders_shipping_method_id;
DROP INDEX IF EXISTS idx_promotions_created_by;
DROP INDEX IF EXISTS idx_review_flags_flagged_by;
DROP INDEX IF EXISTS idx_review_flags_resolved_by;
DROP INDEX IF EXISTS idx_shipping_history_updated_by;
```

**Note:** Rollback is unlikely to be needed. These indexes only improve performance and have no breaking changes.

---

## Troubleshooting

### Issue: Migration Fails with "Index already exists"

**Solution:** Indexes already exist (possibly from manual creation). Safe to ignore or use `CREATE INDEX IF NOT EXISTS`.

### Issue: Long Running Time

**Solution:** Normal for large tables. Wait for completion. Do not interrupt.

**Progress Check:**
```sql
SELECT 
    pid,
    query,
    state,
    wait_event,
    query_start
FROM pg_stat_activity
WHERE query LIKE '%CREATE INDEX%'
    AND state = 'active';
```

### Issue: Performance Degradation After Deployment

**Solution:** 
1. Check if indexes are being used (see verification queries)
2. Run `ANALYZE` on affected tables
3. Consider `VACUUM ANALYZE` if needed

```sql
-- Analyze affected tables
ANALYZE article_versions, bookings, conversations, events, gallery_views, 
        gym_gallery, gym_reviews, messages, payment_disputes, product_orders,
        promotions, review_flags, shipping_history;
```

---

## Next Steps After Deployment

1. ✅ **Monitor query performance** for 1-2 weeks
2. 📊 **Review unused indexes** (see DATABASE_PERFORMANCE_ANALYSIS.md)
3. 🗑️ **Plan index cleanup** for confirmed unused indexes
4. 📈 **Track performance metrics** in production

---

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard
2. Review PostgreSQL logs for errors
3. Consult DATABASE_PERFORMANCE_ANALYSIS.md for detailed information
4. Contact support with migration file and error details

---

## Deployment History

| Date | Environment | Status | Notes |
|------|------------|--------|-------|
| TBD | Production | Pending | 16 foreign key indexes |
| TBD | Staging | Pending | Testing required |

---

## References

- **Migration File:** `supabase/migrations/20251224000001_add_missing_foreign_key_indexes.sql`
- **Analysis Report:** `docs/reports/DATABASE_PERFORMANCE_ANALYSIS.md`
- **Supabase Docs:** https://supabase.com/docs/guides/database/database-linter

---

**Status:** Ready for Deployment ✅  
**Recommended:** Deploy during low-traffic hours  
**Backup:** Ensure recent backup before deployment

