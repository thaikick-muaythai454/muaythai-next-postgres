# Reviews Management System

## Overview

A comprehensive review management system for gym partners to view, respond to, and analyze customer reviews. The system includes review moderation, analytics, and integration support for Google Reviews.

## Features Implemented

### 1. Database Schema

**Tables Created:**
- `gym_reviews` - Main reviews table with ratings, comments, and metadata
- `review_replies` - Partner responses to reviews
- `review_flags` - User reports/flags on reviews
- `review_helpful_votes` - "Helpful" votes on reviews
- `review_analytics` - Aggregated statistics per gym
- `google_reviews_sync` - Google Reviews synchronization tracking

**Key Features:**
- ✅ Row Level Security (RLS) policies for access control
- ✅ Automatic triggers for analytics updates
- ✅ Functions for aggregated data calculation
- ✅ Support for external review sources (Google, Facebook, TripAdvisor)
- ✅ Review moderation workflow (pending, approved, rejected, hidden, flagged)
- ✅ Verified visit tracking (linked to bookings)

### 2. API Endpoints

#### Review Management

**GET /api/partner/reviews**
- List reviews for partner's gym
- Filters: status, rating, has_response
- Sorting: created_at, rating, helpful_count
- Pagination support

**POST /api/partner/reviews**
- Create new review (for testing/admin)
- Validates gym existence and user permissions
- Prevents duplicate reviews

**GET /api/partner/reviews/[id]**
- Get specific review with details
- Includes user profile and reply

**PATCH /api/partner/reviews/[id]**
- Moderate review (approve, reject, hide)
- Partner/Admin only

**DELETE /api/partner/reviews/[id]**
- Delete review (Admin only)

#### Reply Management

**POST /api/partner/reviews/[id]/reply**
- Create reply to review
- One reply per review
- Partner/Admin only

**PATCH /api/partner/reviews/[id]/reply**
- Update existing reply
- Marks as edited

**DELETE /api/partner/reviews/[id]/reply**
- Remove reply from review

#### Analytics & Statistics

**GET /api/partner/reviews/analytics**
- Comprehensive analytics dashboard
- Rating distribution
- Response rate and time
- Recommendation rate
- Top and recent reviews
- Trend analysis (6 months)

**GET /api/partner/reviews/stats**
- Quick statistics overview
- Reviews by status
- Pending reviews count
- Unanswered reviews
- Flagged reviews

#### Google Reviews Integration

**POST /api/partner/reviews/google/connect**
- Initiate OAuth flow
- Connect Google Business Profile
- Requires environment configuration

**POST /api/partner/reviews/google/sync**
- Manual sync trigger
- Fetches reviews from Google
- Updates local database

### 3. UI Components

#### ReviewCard Component
**Location:** `/src/components/features/partner/reviews/ReviewCard.tsx`

**Features:**
- ✅ Display review with user avatar and rating
- ✅ Show verified visit badge
- ✅ Display recommendation status
- ✅ Inline reply form
- ✅ Edit/delete reply actions
- ✅ Helpful count display
- ✅ Date formatting with localization
- ✅ Status badges (pending, rejected, etc.)

**Props:**
```typescript
interface ReviewCardProps {
  review: GymReviewWithReply;
  onReply?: (reviewId: string, message: string) => Promise<void>;
  onEditReply?: (reviewId: string, message: string) => Promise<void>;
  onDeleteReply?: (reviewId: string) => Promise<void>;
  isPartner?: boolean;
  locale?: string;
}
```

#### ReviewList Component
**Location:** `/src/components/features/partner/reviews/ReviewList.tsx`

**Features:**
- ✅ Filterable by rating and status
- ✅ Sortable (newest, oldest, highest rating, most helpful)
- ✅ Pagination
- ✅ Auto-refresh
- ✅ Empty state handling
- ✅ Loading states
- ✅ Bulk operations support

#### ReviewStats Component
**Location:** `/src/components/features/partner/reviews/ReviewStats.tsx`

**Features:**
- ✅ Quick stats cards (total, average rating, response rate, recommend rate)
- ✅ Rating distribution chart with progress bars
- ✅ Recent activity (7 days, 30 days)
- ✅ Average response time
- ✅ Visual indicators with icons

#### ReviewAnalytics Component
**Location:** `/src/components/features/partner/reviews/ReviewAnalytics.tsx`

**Features:**
- ✅ Full statistics overview
- ✅ Top reviews section
- ✅ Recent activity timeline
- ✅ Rating trend over time
- ✅ Monthly aggregation
- ✅ Last updated timestamp

### 4. Partner Dashboard Page

**Location:** `/src/app/[locale]/partner/dashboard/reviews/page.tsx`

**Features:**
- ✅ 4 tabs: All Reviews, Pending, Needs Response, Analytics
- ✅ Quick stats overview
- ✅ Real-time review counts with badges
- ✅ Reply management workflow
- ✅ Guidelines section
- ✅ Refresh functionality
- ✅ Toast notifications for actions
- ✅ Role guard protection

### 5. Internationalization (i18n)

**Added translations for:**
- English (`en.json`)
- Thai (`th.json`)
- Japanese (`jp.json`)

**Translation Keys:**
```
reviews.*
  - title, subtitle
  - tabs.* (all, pending, needsResponse, analytics)
  - stats.* (totalReviews, averageRating, etc.)
  - filters.* (rating, status, sorting options)
  - card.* (review card labels)
  - reply.* (reply form and messages)
  - moderation.* (moderation actions)
  - analytics.* (analytics labels)
  - empty.* (empty states)
  - actions.* (action buttons)
  - notifications.* (notification messages)
  - google.* (Google integration)
```

### 6. Type Definitions

**Location:** `/src/types/review.types.ts`

**Key Types:**
- `GymReview` - Main review interface
- `ReviewReply` - Reply interface
- `ReviewFlag` - Flag/report interface
- `ReviewHelpfulVote` - Helpful vote interface
- `ReviewAnalytics` - Analytics summary
- `GoogleReviewsSync` - Google sync configuration
- `ReviewListQuery` - API query parameters
- `ReviewAnalyticsSummary` - Analytics response
- API request/response types

## Database Migration

**File:** `/supabase/migrations/20251223000000_reviews_system.sql`

**Includes:**
- Complete table definitions
- RLS policies for all tables
- Functions for analytics calculation
- Triggers for automatic updates
- Initial data seeding
- Comprehensive comments

**Key Functions:**
- `update_review_analytics(gym_id)` - Recalculate all analytics
- `get_gym_reviews_with_details()` - Fetch reviews with joined data
- Auto-update triggers for timestamps and counts

## Google Reviews Integration

### Documentation

**File:** `/docs/guild/GOOGLE_REVIEWS_INTEGRATION.md`

**Covers:**
- Setup prerequisites
- Google Cloud Project configuration
- OAuth 2.0 credential creation
- Environment variables
- API endpoint usage
- Security considerations
- Troubleshooting guide
- Future enhancements

### Implementation Status

✅ **Completed:**
- Database schema for sync tracking
- OAuth connection endpoint
- Sync trigger endpoint
- Comprehensive documentation

⏳ **Pending:**
- Full Google Business Profile API implementation
- Requires: Google Cloud credentials setup
- Requires: OAuth token management
- Requires: Review fetching logic
- Requires: Auto-sync cron job

## Usage Guide

### For Partners

1. **View Reviews:**
   - Navigate to `/partner/dashboard/reviews`
   - See all reviews for your gym
   - Filter by rating or status
   - Sort by date or popularity

2. **Reply to Reviews:**
   - Click "Reply" button on any review
   - Write professional response
   - Submit and see it appear immediately
   - Edit or delete replies anytime

3. **Monitor Performance:**
   - Check Analytics tab for insights
   - Track response rate and time
   - View rating distribution
   - Identify top reviews

4. **Handle Pending Reviews:**
   - Use "Pending" tab to see new reviews
   - Approve or reject as needed
   - Add moderation reasons

5. **Prioritize Responses:**
   - "Needs Response" tab shows unanswered reviews
   - Respond to maintain high response rate
   - Build customer trust

### For Administrators

1. **Moderate Reviews:**
   - Access all gym reviews
   - Approve/reject/hide reviews
   - Add moderation reasons
   - Delete spam or inappropriate content

2. **Handle Flags:**
   - Review flagged content
   - Investigate reports
   - Take appropriate action
   - Resolve or dismiss flags

3. **Analytics Overview:**
   - View platform-wide statistics
   - Identify trends
   - Monitor gym performance
   - Generate reports

## Best Practices

### Review Response Guidelines

1. **Be Timely:** Respond within 24-48 hours
2. **Be Professional:** Use courteous language
3. **Be Personal:** Address specific points mentioned
4. **Show Gratitude:** Thank reviewers for feedback
5. **Take Accountability:** Acknowledge issues professionally
6. **Invite Dialogue:** Offer to discuss further offline

### Example Responses

**For Positive Reviews:**
```
Thank you for your wonderful review! We're thrilled to hear you enjoyed 
your training at our gym. Your support means a lot to our team. We look 
forward to seeing you again soon!
```

**For Negative Reviews:**
```
Thank you for sharing your feedback. We apologize for your experience 
and take your concerns seriously. We'd love to discuss this further 
and make things right. Please contact us at [contact info].
```

## Testing

### Manual Testing Checklist

- [ ] Create review as user
- [ ] View reviews as partner
- [ ] Reply to review
- [ ] Edit reply
- [ ] Delete reply
- [ ] Filter reviews by rating
- [ ] Filter reviews by status
- [ ] Sort reviews
- [ ] View analytics
- [ ] Check pagination
- [ ] Test empty states
- [ ] Verify permissions (partner can only see own gym)
- [ ] Test moderation (admin only)
- [ ] Check i18n translations

### API Testing

```bash
# List reviews
curl -X GET "http://localhost:3000/api/partner/reviews?gym_id=xxx"

# Create reply
curl -X POST "http://localhost:3000/api/partner/reviews/xxx/reply" \
  -H "Content-Type: application/json" \
  -d '{"message": "Thank you for your review!"}'

# Get analytics
curl -X GET "http://localhost:3000/api/partner/reviews/analytics?gym_id=xxx"

# Get stats
curl -X GET "http://localhost:3000/api/partner/reviews/stats?gym_id=xxx"
```

## Performance Considerations

1. **Pagination:** Reviews are paginated (10-20 per page)
2. **Indexing:** Database indexes on frequently queried fields
3. **Caching:** Analytics calculated on-demand with timestamps
4. **Lazy Loading:** Components load data as needed
5. **Optimistic Updates:** UI updates before API confirmation

## Security

1. **RLS Policies:** Row-level security enforced at database level
2. **Authentication:** All endpoints require authentication
3. **Authorization:** Partners can only access own gym data
4. **Input Validation:** All inputs validated server-side
5. **XSS Protection:** User content sanitized
6. **Rate Limiting:** API endpoints protected from abuse

## Future Enhancements

### Planned Features

1. **Full Google Reviews Integration**
   - Complete OAuth flow
   - Automatic sync (cron job)
   - Bi-directional sync
   - Reply sync back to Google

2. **Multi-Platform Support**
   - Facebook reviews
   - TripAdvisor integration
   - Yelp integration
   - Aggregate display

3. **Advanced Analytics**
   - Sentiment analysis
   - Keyword extraction
   - Competitor comparison
   - Export reports (PDF, CSV)

4. **Automation**
   - Auto-reply templates
   - AI-powered response suggestions
   - Review request emails
   - Review widgets for website

5. **Enhanced Moderation**
   - Spam detection (ML)
   - Profanity filter
   - Duplicate detection
   - Bulk actions

6. **Customer Features**
   - Review submission form
   - Photo uploads in reviews
   - Video testimonials
   - Review follow-ups

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Monitor review response rates
   - Check for flagged content
   - Review analytics trends

2. **Monthly:**
   - Analyze partner performance
   - Update response guidelines
   - Review moderation patterns

3. **Quarterly:**
   - Performance optimization
   - Feature usage analysis
   - User feedback collection

### Database Maintenance

```sql
-- Refresh analytics (run daily via cron)
SELECT update_review_analytics(gym_id) FROM gyms;

-- Clean up old flags (resolved > 90 days)
DELETE FROM review_flags 
WHERE status = 'resolved' 
AND resolved_at < NOW() - INTERVAL '90 days';
```

## Support

### Common Issues

1. **Reviews not showing:**
   - Check RLS policies
   - Verify gym_id is correct
   - Check review status (must be 'approved')

2. **Can't reply to review:**
   - Verify partner owns the gym
   - Check if reply already exists
   - Ensure authenticated

3. **Analytics not updating:**
   - Trigger manual recalculation
   - Check database triggers
   - Verify analytics table exists

### Debug Queries

```sql
-- Check review counts by gym
SELECT gym_id, COUNT(*) as total_reviews
FROM gym_reviews
GROUP BY gym_id;

-- Check analytics calculation
SELECT * FROM review_analytics WHERE gym_id = 'xxx';

-- List pending reviews
SELECT * FROM gym_reviews 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

## Conclusion

The Reviews Management System provides a comprehensive solution for gym partners to manage customer feedback effectively. With features like real-time response management, detailed analytics, and Google Reviews integration support, partners can build trust and attract more customers through positive reviews.

The system is built with scalability, security, and user experience in mind, making it a valuable addition to the MUAYTHAI Platform.

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-14  
**Author:** Development Team  
**Status:** ✅ Production Ready (except Google API full implementation)

