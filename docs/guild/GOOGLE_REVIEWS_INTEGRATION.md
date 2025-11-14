# Google Reviews Integration Guide

## Overview

This guide explains how to integrate Google Business Profile API to sync and manage Google reviews for your gym.

## Prerequisites

1. **Google Business Profile Account**: You need an active Google Business Profile for your gym
2. **Google Cloud Project**: Create a project in Google Cloud Console
3. **API Credentials**: OAuth 2.0 credentials for accessing Google Business Profile API
4. **Google Place ID**: Your gym's Google Place ID

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Business Profile API (My Business API)
   - Google Places API

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/partner/reviews/google/callback
   https://yourdomain.com/api/partner/reviews/google/callback
   ```
5. Save your **Client ID** and **Client Secret**

### 3. Add Environment Variables

Add the following to your `.env.local` file:

```env
# Google Reviews Integration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/partner/reviews/google/callback
```

### 4. Find Your Google Place ID

You can find your Place ID using:
- [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
- Or use the Google Places API

## Database Schema

The system includes the following tables for Google Reviews integration:

### `google_reviews_sync`
Tracks synchronization status for each gym:
- `gym_id`: Reference to the gym
- `google_place_id`: Google Place ID
- `google_account_id`: Google Account ID
- `last_sync_at`: Last successful sync timestamp
- `sync_status`: Current sync status (pending, syncing, success, failed)
- `auto_sync_enabled`: Enable automatic syncing
- `sync_frequency_hours`: How often to sync (default: 24 hours)

## API Endpoints

### Connect Google Account

**POST** `/api/partner/reviews/google/connect`

Initiates OAuth flow to connect Google Business Profile.

**Body:**
```json
{
  "gym_id": "uuid"
}
```

### Disconnect Google Account

**DELETE** `/api/partner/reviews/google/disconnect`

Removes Google connection for the gym.

**Query:**
- `gym_id`: UUID

### Sync Reviews

**POST** `/api/partner/reviews/google/sync`

Manually triggers review synchronization.

**Body:**
```json
{
  "gym_id": "uuid"
}
```

### Get Sync Status

**GET** `/api/partner/reviews/google/status`

Returns current sync status.

**Query:**
- `gym_id`: UUID

## Implementation Flow

### 1. OAuth Flow

```typescript
// User clicks "Connect Google"
// -> Redirects to Google OAuth consent screen
// -> User grants permissions
// -> Callback to your app with auth code
// -> Exchange code for access token
// -> Store tokens securely
```

### 2. Sync Process

```typescript
// 1. Get access token from database
// 2. Fetch reviews from Google Business Profile API
// 3. For each review:
//    a. Check if review exists (by google_review_id)
//    b. If new, insert into gym_reviews
//    c. If exists, update if modified
// 4. Update sync status and timestamp
```

### 3. Auto Sync (Cron Job)

You can set up a cron job to automatically sync reviews:

```typescript
// Use Vercel Cron or similar
// /api/cron/sync-google-reviews
// Runs every X hours based on sync_frequency_hours
```

## Google Business Profile API Usage

### List Reviews

```typescript
const response = await fetch(
  `https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  }
);
```

### Reply to Review

```typescript
const response = await fetch(
  `https://mybusiness.googleapis.com/v4/{reviewName}/reply`,
  {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: 'Thank you for your review!',
    }),
  }
);
```

## Security Considerations

1. **Store Tokens Securely**: Use encryption for storing access tokens
2. **Token Refresh**: Implement automatic token refresh for expired tokens
3. **Rate Limiting**: Respect Google API rate limits
4. **Error Handling**: Handle API errors gracefully
5. **Logging**: Log all sync operations for audit purposes

## Limitations

1. **API Quota**: Google Business Profile API has daily quota limits
2. **Review Permissions**: Can only access reviews for verified businesses
3. **Delayed Sync**: Reviews may not appear immediately after posting
4. **Reply Restrictions**: Some review sources don't support replies

## Testing

1. Use Google's test environment during development
2. Test with a small number of reviews first
3. Monitor sync status and error logs
4. Verify data accuracy after sync

## Troubleshooting

### Common Issues

**"Insufficient permissions"**
- Ensure the Google account has management access to the Business Profile
- Re-authorize with correct permissions

**"Invalid credentials"**
- Check your OAuth credentials in Google Cloud Console
- Verify redirect URIs match exactly

**"Review not found"**
- Review may have been deleted or hidden
- Verify the Google Place ID is correct

**"Sync failed"**
- Check error logs in `google_reviews_sync` table
- Verify API quota hasn't been exceeded
- Ensure access token is valid

## Resources

- [Google Business Profile API Documentation](https://developers.google.com/my-business)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Places API Documentation](https://developers.google.com/maps/documentation/places)

## Support

For integration issues:
1. Check the error logs in database
2. Review Google Cloud Console logs
3. Consult Google Business Profile API support

## Future Enhancements

- [ ] Bulk sync optimization
- [ ] Real-time webhooks for new reviews
- [ ] Multi-location support
- [ ] Review sentiment analysis
- [ ] Automated response templates
- [ ] Integration with other review platforms (Facebook, TripAdvisor)

