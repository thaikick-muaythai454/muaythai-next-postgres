import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Auth Callback Route Handler
 * 
 * This route redirects to the locale-aware callback route for backwards compatibility.
 * The middleware will redirect /auth/callback to /th/auth/callback (or user's locale),
 * but we keep this route to handle any direct requests and ensure proper locale handling.
 * 
 * @deprecated Use /[locale]/auth/callback instead
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const type = requestUrl.searchParams.get('type');
  
  // Default to 'th' locale for backwards compatibility
  // The middleware will handle locale detection and redirect if needed
  const defaultLocale = 'th';
  
  // Build the locale-aware callback URL
  const localeCallbackUrl = new URL(`/${defaultLocale}/auth/callback`, request.url);
  
  // Preserve all query parameters
  if (code) localeCallbackUrl.searchParams.set('code', code);
  if (next) localeCallbackUrl.searchParams.set('next', next);
  if (type) localeCallbackUrl.searchParams.set('type', type);
  
  // Copy any other query parameters
  requestUrl.searchParams.forEach((value, key) => {
    if (!['code', 'next', 'type'].includes(key)) {
      localeCallbackUrl.searchParams.set(key, value);
    }
  });
  
  // Redirect to locale-aware callback route
  return NextResponse.redirect(localeCallbackUrl);
}
