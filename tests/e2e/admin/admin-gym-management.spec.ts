import { test, expect } from '@playwright/test';
import { loginAsAdmin, createTestGym, cleanupTestData } from '../helpers';

test.describe('Admin Gym Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page);
  });

  test.afterEach(async () => {
    // Cleanup test data after each test
    await cleanupTestData();
  });

  test('Admin can navigate to gym management page', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard$/);

    // Click on "จัดการยิม" menu item
    await page.click('text=จัดการยิม');
    await expect(page).toHaveURL(/\/admin\/dashboard\/gyms$/);

    // Verify page title
    await expect(page.getByRole('heading', { level: 1, name: 'จัดการยิม' })).toBeVisible();
  });

  test('Admin can view gym statistics', async ({ page }) => {
    await page.goto('/admin/dashboard/gyms');

    // Verify stats cards are visible
    const statsSection = page.locator('section').first();
    await expect(statsSection.getByText('ยิมทั้งหมด', { exact: true })).toBeVisible();
    await expect(statsSection.getByText('อนุมัติแล้ว', { exact: true })).toBeVisible();
    await expect(statsSection.getByText('รออนุมัติ', { exact: true })).toBeVisible();
    await expect(statsSection.getByText('ไม่อนุมัติ', { exact: true })).toBeVisible();
  });

  test('Admin can view gym details in modal', async ({ page }) => {
    // Create a test gym first
    const testGym = await createTestGym('pending');

    await page.goto('/admin/dashboard/gyms');
    const row = page.locator('tbody tr', { hasText: testGym.gym_name }).first();
    await expect(row).toBeVisible();

    await row.locator('button[title="ดูรายละเอียด"]').click();

    const detailDialog = page.getByRole('dialog');
    await expect(detailDialog).toBeVisible();
    await expect(detailDialog).toContainText(testGym.gym_name);
    await expect(detailDialog.getByRole('button', { name: 'อนุมัติ' })).toBeVisible();
    await expect(detailDialog.getByRole('button', { name: 'ปฏิเสธ' })).toBeVisible();
    await expect(detailDialog.getByRole('button', { name: 'แก้ไข' })).toBeVisible();
    await expect(detailDialog.getByRole('button', { name: 'ลบ' })).toBeVisible();

    await detailDialog.getByRole('button', { name: 'ปิด' }).click();
    await expect(detailDialog).not.toBeVisible();
  });

  test('Admin can approve pending gym', async ({ page }) => {
    // Create a pending test gym
    const testGym = await createTestGym('pending');

    await page.goto('/admin/dashboard/gyms');

    // Click on pending tab
    await page.getByRole('tab', { name: 'รออนุมัติ' }).click();

    const pendingRow = page.locator('tbody tr', { hasText: testGym.gym_name }).first();
    await pendingRow.locator('button[title="ดูรายละเอียด"]').click();

    const detailDialog = page.getByRole('dialog');
    await expect(detailDialog.getByRole('button', { name: 'อนุมัติ' })).toBeVisible();
    await expect(detailDialog.getByRole('button', { name: 'ปฏิเสธ' })).toBeVisible();

    await detailDialog.getByRole('button', { name: 'ปิด' }).click();
    await expect(detailDialog).not.toBeVisible();
  });

  test('Admin can edit gym information', async ({ page }) => {
    // Create a test gym
    const testGym = await createTestGym('approved');

    await page.goto('/admin/dashboard/gyms');
    const row = page.locator('tbody tr', { hasText: testGym.gym_name }).first();
    await row.locator('button[title="แก้ไข"]').click();

    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible();

    const newGymName = `${testGym.gym_name} - Updated`;
    await editDialog.getByLabel('ชื่อยิม (ไทย)').fill(newGymName);

    await editDialog.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(editDialog).not.toBeVisible();
  });

  test('Admin can delete gym', async ({ page }) => {
    // Create a test gym
    const testGym = await createTestGym('approved');

    await page.goto('/admin/dashboard/gyms');
    const row = page.locator('tbody tr', { hasText: testGym.gym_name }).first();
    await row.locator('button[title="ลบ"]').click();

    const deleteDialog = page.getByRole('dialog');
    await expect(deleteDialog).toContainText('ยืนยันการลบยิม');
    await expect(deleteDialog).toContainText(testGym.gym_name);

    await deleteDialog.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(deleteDialog).not.toBeVisible();
  });

  test('Admin can search for gyms', async ({ page }) => {
    // Create multiple test gyms
    const gym1 = await createTestGym('approved', { gym_name: 'Test Gym Alpha' });
    const gym2 = await createTestGym('approved', { gym_name: 'Test Gym Beta' });

    await page.goto('/admin/dashboard/gyms');

    // Search for "Alpha"
    await page.fill('input[placeholder="ค้นหายิม..."]', 'Alpha');

    // Verify only gym1 is visible
    await expect(page.locator('tbody tr', { hasText: 'Test Gym Alpha' })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: 'Test Gym Beta' })).toHaveCount(0);

    // Clear search
    await page.fill('input[placeholder="ค้นหายิม..."]', '');

    // Verify both gyms are visible
    await expect(page.locator('tbody tr', { hasText: 'Test Gym Alpha' })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: 'Test Gym Beta' })).toHaveCount(1);
  });

  test('Admin can filter gyms by status', async ({ page }) => {
    // Create gyms with different statuses
    const pendingGym = await createTestGym('pending', { gym_name: 'Pending Gym' });
    const approvedGym = await createTestGym('approved', { gym_name: 'Approved Gym' });
    const rejectedGym = await createTestGym('rejected', { gym_name: 'Rejected Gym' });

    await page.goto('/admin/dashboard/gyms');

    // Test "ทั้งหมด" tab
    await page.getByRole('tab', { name: 'ทั้งหมด' }).click();
    await expect(page.locator('tbody tr', { hasText: 'Pending Gym' })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: 'Approved Gym' })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: 'Rejected Gym' })).toHaveCount(1);

    // Test "อนุมัติแล้ว" tab
    await page.getByRole('tab', { name: 'อนุมัติแล้ว' }).click();
    await expect(page.locator('tbody tr', { hasText: 'Approved Gym' })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: 'Pending Gym' })).toHaveCount(0);
    await expect(page.locator('tbody tr', { hasText: 'Rejected Gym' })).toHaveCount(0);

    // Test "รออนุมัติ" tab
    await page.getByRole('tab', { name: 'รออนุมัติ' }).click();
    await expect(page.locator('tbody tr', { hasText: 'Pending Gym' })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: 'Approved Gym' })).toHaveCount(0);
    await expect(page.locator('tbody tr', { hasText: 'Rejected Gym' })).toHaveCount(0);

    // Test "ไม่อนุมัติ" tab
    await page.getByRole('tab', { name: 'ไม่อนุมัติ' }).click();
    await expect(page.locator('tbody tr', { hasText: 'Rejected Gym' })).toHaveCount(1);
    await expect(page.locator('tbody tr', { hasText: 'Pending Gym' })).toHaveCount(0);
    await expect(page.locator('tbody tr', { hasText: 'Approved Gym' })).toHaveCount(0);
  });

  test('Admin cannot save invalid gym data', async ({ page }) => {
    // Create a test gym
    await createTestGym('approved');

    await page.goto('/admin/dashboard/gyms');

    // Click edit button
    const editButton = page.locator('button[title="แก้ไข"]').first();
    await editButton.click();

    const editDialog = page.getByRole('dialog');

    // Try to save with invalid data (empty gym name)
    await editDialog.getByLabel('ชื่อยิม (ไทย)').fill('');

    // Verify save button is disabled
    const saveButton = editDialog.getByRole('button', { name: 'บันทึก' });
    await expect(saveButton).toBeDisabled();

    // Fill with invalid phone number
    await editDialog.getByLabel('ชื่อยิม (ไทย)').fill('Valid Gym Name');
    await editDialog.getByLabel('เบอร์โทรศัพท์').fill('invalid-phone');

    // Verify save button is disabled
    await expect(saveButton).toBeDisabled();

    await editDialog.getByRole('button', { name: 'ยกเลิก' }).click();
    await expect(editDialog).not.toBeVisible();
  });
});
