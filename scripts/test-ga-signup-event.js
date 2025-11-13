#!/usr/bin/env node

/**
 * Test Script for GA Signup Event Verification
 * 
 * This script helps verify that trackUserSignup is working correctly
 * by checking the implementation and providing instructions for manual testing.
 * 
 * Usage:
 *   node scripts/test-ga-signup-event.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🧪 Google Analytics Signup Event Verification Helper\n');
console.log('='.repeat(60));

// Check if NEXT_PUBLIC_GA_MEASUREMENT_ID is set
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
if (!gaId) {
  console.log('⚠️  WARNING: NEXT_PUBLIC_GA_MEASUREMENT_ID is not set');
  console.log('   Please set it in .env.local or environment variables\n');
} else {
  console.log('✅ NEXT_PUBLIC_GA_MEASUREMENT_ID is set:', gaId);
  if (!gaId.startsWith('G-')) {
    console.log('⚠️  WARNING: GA Measurement ID should start with "G-"');
  }
  console.log('');
}

// Check if analytics.ts file exists and has trackUserSignup
const analyticsPath = path.join(__dirname, '../src/lib/utils/analytics.ts');
if (fs.existsSync(analyticsPath)) {
  const content = fs.readFileSync(analyticsPath, 'utf-8');
  
  console.log('📄 Checking analytics.ts implementation...');
  
  // Check for trackUserSignup function
  if (content.includes('export function trackUserSignup')) {
    console.log('✅ trackUserSignup function found');
    
    // Extract function signature
    const match = content.match(/export function trackUserSignup\([^)]+\)/);
    if (match) {
      console.log('   Signature:', match[0]);
    }
    
    // Check if it calls trackEvent with 'sign_up'
    if (content.includes("trackEvent('sign_up'")) {
      console.log('✅ Uses correct event name: sign_up');
    } else {
      console.log('⚠️  Event name might be incorrect');
    }
    
    // Check for user_id parameter
    if (content.includes('user_id:')) {
      console.log('✅ user_id parameter included');
    }
    
    // Check for method parameter
    if (content.includes('method:')) {
      console.log('✅ method parameter included');
    }
  } else {
    console.log('❌ trackUserSignup function not found');
  }
  
  // Check for window.trackUserSignup exposure
  if (content.includes('window.trackUserSignup')) {
    console.log('✅ Exposed on window.trackUserSignup');
  } else {
    console.log('⚠️  Not exposed on window object');
  }
  
  console.log('');
} else {
  console.log('❌ analytics.ts file not found at:', analyticsPath);
  console.log('');
}

// Check if signup page uses trackUserSignup
const signupPagePath = path.join(__dirname, '../src/app/[locale]/signup/page.tsx');
if (fs.existsSync(signupPagePath)) {
  const content = fs.readFileSync(signupPagePath, 'utf-8');
  
  console.log('📄 Checking signup page implementation...');
  
  if (content.includes('trackUserSignup')) {
    console.log('✅ trackUserSignup is called in signup page');
    
    // Check if it's in a try-catch (good practice)
    if (content.includes('trackUserSignup') && content.includes('try')) {
      console.log('✅ Wrapped in try-catch (error handling)');
    }
  } else {
    console.log('⚠️  trackUserSignup not found in signup page');
  }
  
  console.log('');
} else {
  console.log('⚠️  Signup page not found at:', signupPagePath);
  console.log('');
}

// Check for unit tests
const testPath = path.join(__dirname, '../tests/unit/analytics/track-user-signup.test.ts');
if (fs.existsSync(testPath)) {
  console.log('✅ Unit tests found: tests/unit/analytics/track-user-signup.test.ts');
  console.log('   Run: npm test -- tests/unit/analytics/track-user-signup.test.ts\n');
} else {
  console.log('⚠️  Unit tests not found\n');
}

// Instructions
console.log('='.repeat(60));
console.log('📋 Manual Testing Instructions:\n');
console.log('1. Open Google Analytics Dashboard:');
console.log('   https://analytics.google.com/');
console.log('   → Reports → Real-time\n');
console.log('2. Open your app in a browser (another tab)');
console.log('3. Perform a signup (email or google)');
console.log('4. Check Real-Time dashboard for "sign_up" event');
console.log('5. Click on the event to see details:');
console.log('   - user_id: should match the user who signed up');
console.log('   - method: should be "email" or "google"\n');
console.log('='.repeat(60));
console.log('\n💡 Browser Console Test:');
console.log('   Open browser console and run:');
console.log('   window.trackUserSignup("test-user-123", "email");');
console.log('   Then check Network tab for requests to google-analytics.com\n');
console.log('📚 For detailed instructions, see:');
console.log('   docs/guild/GA_REALTIME_VERIFICATION.md\n');

