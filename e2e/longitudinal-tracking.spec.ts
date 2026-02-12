import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-data';
import { loginAs } from './fixtures/setup';

test.describe('Longitudinal Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, testUser.email, testUser.password);
  });

  test('can switch to longitudinal mode', async ({ page }) => {
    await page.getByText('Longitudinal Tracking').click();
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('dashboard view loads', async ({ page }) => {
    await page.getByText('Longitudinal Tracking').click();
    await page.getByText('Dashboard').click();
    await expect(page.locator('main')).toBeVisible();
  });

  test('students view loads', async ({ page }) => {
    await page.getByText('Longitudinal Tracking').click();
    await page.getByText('Students').click();
    await expect(page.locator('main')).toBeVisible();
  });

  test('progress tab is disabled without enrollment', async ({ page }) => {
    await page.getByText('Longitudinal Tracking').click();
    const progressTab = page.getByText('Progress');
    await progressTab.hover();
    await expect(page.getByText(/select a student enrollment/i)).toBeVisible();
  });
});
