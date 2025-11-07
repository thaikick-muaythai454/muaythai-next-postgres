import { test, expect } from '@playwright/test';
import {
  generateTestUser,
  signupUser,
  loginUser,
  logoutUser,
  applyForPartner,
  generateGymData,
  loginAsAdmin,
} from '../helpers';

test.describe('End-to-End Partner Approval Flow', () => {
  test('User can signup, apply as partner, and get approved by admin', async ({ page }) => {
    // ----- User signup -----
    const user = generateTestUser('user');
    await signupUser(page, user);

    // Explicitly login to ensure session is established (signup may require separate login)
    // Supabase needs a moment to activate the freshly created account
    await page.waitForTimeout(5000);

    await loginUser(page, user.email, user.password);

    // ----- Partner application -----
    const gymData = generateGymData(user.email);
    const applicationResult = await applyForPartner(page, gymData);
    expect(applicationResult).toBeTruthy();

    // Logout user before admin actions
    await logoutUser(page);

    // ----- Admin approval -----
    await loginAsAdmin(page);

    await page.goto('/admin/dashboard/gyms');
    await expect(page).toHaveURL(/\/admin\/dashboard\/gyms/);

    // Show pending applications
    const pendingTab = page.locator('text=รออนุมัติ');
    if (await pendingTab.isVisible()) {
      await pendingTab.click();
    }

    // Wait for the specific gym to appear in the pending list
    const pendingRow = page.locator('table tr').filter({ hasText: gymData.gymName });
    await expect(pendingRow).toBeVisible({ timeout: 20000 });

    // Open details and approve
    await pendingRow.locator('button[title="ดูรายละเอียด"], button:has-text("ดูรายละเอียด")').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("อนุมัติ")').first().click();

    // Wait for success feedback
    await expect(page.locator('text=อนุมัติยิมสำเร็จ').first()).toBeVisible({ timeout: 10000 });

    // Close modal if present
    const closeButton = page.locator('button:has-text("ปิด")').first();
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    }

    // Verify the gym no longer appears in pending list
    await expect(page.locator('table tr').filter({ hasText: gymData.gymName })).not.toBeVisible({ timeout: 10000 });

    // Logout admin
    await logoutUser(page);

    // ----- Partner verification -----
    await loginUser(page, user.email, user.password);

    // Partner dashboard should now be accessible
    await page.goto('/partner/dashboard');
    await expect(page).toHaveURL(/\/partner\/dashboard/);
    await expect(
      page.locator('text=แดชบอร์ดพาร์ทเนอร์, text=Partner Dashboard, text=จัดการยิม').first()
    ).toBeVisible({ timeout: 10000 });
  });
});

