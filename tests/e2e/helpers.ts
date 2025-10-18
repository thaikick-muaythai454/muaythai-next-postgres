import { Page, expect } from '@playwright/test';

/**
 * Test Helpers for E2E Testing
 * Utility functions for common test operations
 */

export interface UserCredentials {
  username: string;
  fullName: string;
  email: string;
  password: string;
}

export interface GymApplicationData {
  gymName: string;
  contactName: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  description?: string;
  services?: string[];
}

export interface TestGymData {
  gym_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  location: string;
  gym_details: string;
  services: string[];
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
}

/**
 * Generate unique test user data with timestamp
 */
export function generateTestUser(role: 'user' | 'partner' | 'admin'): UserCredentials {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  return {
    username: `test_${role}_${timestamp}_${randomId}`,
    fullName: `Test ${role.charAt(0).toUpperCase() + role.slice(1)} ${timestamp}`,
    email: `test_${role}_${timestamp}_${randomId}@test.com`,
    password: 'Test@1234567890',
  };
}

/**
 * Generate gym application data for testing
 */
export function generateGymData(userEmail: string): GymApplicationData {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  return {
    gymName: `Test Gym ${timestamp}`,
    contactName: `Contact ${randomId}`,
    phone: '0812345678',
    email: userEmail,
    website: 'https://testgym.com',
    address: '123 Test Street, Bangkok, Thailand 10100',
    description: 'Test gym for automated testing purposes',
    services: ['มวยไทย', 'ฟิตเนส', 'Private Class'],
  };
}

/**
 * Sign up a new user
 */
export async function signupUser(page: Page, credentials: UserCredentials): Promise<void> {
  await page.goto('/signup');
  
  // Wait for the signup form to load completely
  await page.waitForSelector('input[name="username"]', { timeout: 15000, state: 'visible' });
  await page.waitForTimeout(1000); // Wait for client-side hydration
  
  // Fill in the signup form with locator (better auto-waiting)
  await page.locator('input[name="username"]').fill(credentials.username);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="fullName"]').fill(credentials.fullName);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="confirmPassword"]').fill(credentials.password);
  await page.waitForTimeout(300);
  
  // Submit the form
  await page.locator('button[type="submit"]').click();
  
  // Wait for navigation or success message
  // Note: In real scenario, you might need to verify email
  // For testing, we assume email verification is disabled or handled differently
  await page.waitForTimeout(3000);
}

/**
 * Login with credentials
 */
export async function loginUser(page: Page, identifier: string, password: string): Promise<void> {
  await page.goto('/login');
  
  // Wait for the login form to load completely
  await page.waitForSelector('input[name="identifier"]', { timeout: 15000, state: 'visible' });
  await page.waitForTimeout(1000); // Wait for client-side hydration
  
  // Fill in the login form with locator (better auto-waiting)
  await page.locator('input[name="identifier"]').fill(identifier);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="password"]').fill(password);
  await page.waitForTimeout(300);
  
  // Submit the form
  await page.locator('button[type="submit"]').click();
  
  // Wait for navigation
  await page.waitForTimeout(4000);
}

/**
 * Logout current user
 */
export async function logoutUser(page: Page): Promise<void> {
  // Look for logout button or link
  // This assumes there's a logout button in the header
  const logoutButton = page.locator('text=ออกจากระบบ').first();
  
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForTimeout(2000);
  } else {
    // Alternative: navigate directly to login page
    await page.goto('/login');
    await page.waitForTimeout(1000);
  }
}

/**
 * Apply for partner (gym application)
 */
export async function applyForPartner(page: Page, gymData: GymApplicationData): Promise<void> {
  await page.goto('/partner/apply');
  
  // Wait for the form to load completely
  await page.waitForSelector('input[name="gymName"]', { timeout: 15000, state: 'visible' });
  await page.waitForTimeout(1000); // Wait for any client-side hydration
  
  // Fill in basic information with locator (better auto-waiting)
  await page.locator('input[name="gymName"]').fill(gymData.gymName);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="contactName"]').fill(gymData.contactName);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="phone"]').fill(gymData.phone);
  await page.waitForTimeout(300);
  
  await page.locator('input[name="email"]').fill(gymData.email);
  await page.waitForTimeout(300);
  
  if (gymData.website) {
    await page.locator('input[name="website"]').fill(gymData.website);
    await page.waitForTimeout(300);
  }
  
  await page.locator('textarea[name="address"]').fill(gymData.address);
  await page.waitForTimeout(300);
  
  if (gymData.description) {
    await page.locator('textarea[name="description"]').fill(gymData.description);
    await page.waitForTimeout(300);
  }
  
  // Select services if provided
  if (gymData.services && gymData.services.length > 0) {
    for (const service of gymData.services) {
      try {
        const serviceCheckbox = page.locator(`text=${service}`).first();
        await serviceCheckbox.waitFor({ state: 'visible', timeout: 5000 });
        await serviceCheckbox.click();
        await page.waitForTimeout(200);
      } catch (error) {
        console.log(`Could not select service: ${service}, error: ${error}`); 
      }
    }
  }
  
  // Accept terms
  await page.locator('input[name="termsAccepted"]').check();
  await page.waitForTimeout(500);
  
  // Submit the form
  await page.locator('button[type="submit"]').click();
  
  // Wait for terms modal to appear
  await page.waitForTimeout(2000);
  
  // Accept terms in modal if it appears
  try {
    const acceptButton = page.locator('text=ยืนยันและสมัคร').or(page.locator('text=ยอมรับและดำเนินการต่อ'));
    await acceptButton.waitFor({ state: 'visible', timeout: 5000 });
    await acceptButton.click();
    await page.waitForTimeout(1000);
  } catch (error) {
    console.log('Terms modal did not appear or already accepted, error: ', error);
  }
  
  // Wait for submission to complete
  await page.waitForTimeout(3000);
}

/**
 * Admin: Get first pending gym application
 */
export async function getFirstPendingApplication(page: Page): Promise<string | null> {
  await page.goto('/admin/dashboard/approvals');
  
  // Wait for the approvals page to load
  await page.waitForTimeout(2000);
  
  // Find the first "ดูรายละเอียด" (View Details) button
  const viewButton = page.locator('text=ดูรายละเอียด').first();
  
  if (await viewButton.isVisible({ timeout: 5000 })) {
    return 'found';
  }
  
  return null;
}

/**
 * Admin: Approve the first pending gym application
 */
export async function approveFirstApplication(page: Page): Promise<void> {
  // Open the first application
  const viewButton = page.locator('text=ดูรายละเอียด').first();
  await viewButton.click();
  
  // Wait for modal to open
  await page.waitForTimeout(2000);
  
  // Click approve button
  const approveButton = page.locator('text=อนุมัติ').first();
  await approveButton.click();
  
  // Wait for approval to complete
  await page.waitForTimeout(2000);
  
  // Handle alert if present
  page.on('dialog', async dialog => {
    await dialog.accept();
  });
}

/**
 * Verify user is on dashboard
 */
export async function verifyOnDashboard(page: Page, expectedText?: string): Promise<void> {
  // Wait for dashboard to load
  await page.waitForTimeout(2000);
  
  // Check if we're on a dashboard page
  const isDashboard = 
    page.url().includes('/dashboard') ||
    page.url().includes('/admin/dashboard') ||
    page.url().includes('/partner/dashboard');
  
  expect(isDashboard).toBeTruthy();
  
  if (expectedText) {
    await expect(page.locator(`text=${expectedText}`).first()).toBeVisible({ timeout: 10000 });
  }
}

/**
 * Take screenshot for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ 
    path: `tests/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Wait for specific text to appear
 */
export async function waitForText(page: Page, text: string, timeout: number = 10000): Promise<void> {
  await page.waitForSelector(`text=${text}`, { timeout });
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}


/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  // Use predefined admin credentials or create one
  // For testing, assume admin account exists
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@1234567890';
  
  await loginUser(page, adminEmail, adminPassword);
  
  // Verify we're on admin dashboard
  await page.waitForTimeout(2000);
  expect(page.url()).toContain('/admin/dashboard');
}

/**
 * Create a test gym in database
 */
export async function createTestGym(
  status: 'pending' | 'approved' | 'rejected',
  overrides?: Partial<{
    gym_name: string;
    contact_name: string;
    phone: string;
    email: string;
    location: string;
  }>
): Promise<TestGymData> {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  
  const gymData = {
    gym_name: overrides?.gym_name || `Test Gym ${timestamp}`,
    contact_name: overrides?.contact_name || `Contact ${randomId}`,
    phone: overrides?.phone || '0812345678',
    email: overrides?.email || `testgym_${timestamp}@test.com`,
    website: 'https://testgym.com',
    location: overrides?.location || '123 Test Street, Bangkok, Thailand 10100',
    gym_details: 'Test gym for automated testing',
    services: ['มวยไทย', 'ฟิตเนส'],
    images: [],
    status: status,
    user_id: '00000000-0000-0000-0000-000000000000', // Placeholder user ID
  };
  
  // In a real scenario, you would insert this into the database
  // For now, we'll return the data structure
  // You may need to implement actual database insertion via API or direct DB access
  
  return gymData;
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(): Promise<void> {
  // In a real scenario, you would clean up test gyms from database
  // This could be done via API calls or direct database access
  // For now, this is a placeholder
  
  // Example: Delete all gyms with "Test Gym" in the name
  // await fetch('/api/test/cleanup', { method: 'POST' });
}
