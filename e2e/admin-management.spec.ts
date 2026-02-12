import { test, expect } from '@playwright/test';
import { testAdmin, testUser } from './fixtures/test-data';
import { loginAs } from './fixtures/setup';

test.describe('Admin Management', () => {
  test('admin sees admin nav section', async ({ page }) => {
    await loginAs(page, testAdmin.email, testAdmin.password);
    await expect(page.getByText('Administration')).toBeVisible();
  });

  test('regular user does not see admin nav', async ({ page }) => {
    await loginAs(page, testUser.email, testUser.password);
    await expect(page.getByText('Administration')).not.toBeVisible();
  });

  test('admin can navigate to clerkship management', async ({ page }) => {
    await loginAs(page, testAdmin.email, testAdmin.password);
    await page.getByText('Clerkships').click();
    await expect(page.locator('main')).toBeVisible();
  });

  test('admin can navigate to user management', async ({ page }) => {
    await loginAs(page, testAdmin.email, testAdmin.password);
    await page.getByText('Users').click();
    await expect(page.locator('main')).toBeVisible();
  });
});
