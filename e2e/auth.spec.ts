import { test, expect } from '@playwright/test';
import { testAdmin, testUser } from './fixtures/test-data';
import { loginAs } from './fixtures/setup';

test.describe('Authentication', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('invalid@test.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible();
  });

  test('admin can log in successfully', async ({ page }) => {
    await loginAs(page, testAdmin.email, testAdmin.password);
    await expect(page).toHaveURL('/');
  });

  test('user can log in successfully', async ({ page }) => {
    await loginAs(page, testUser.email, testUser.password);
    await expect(page).toHaveURL('/');
  });

  test('user can log out', async ({ page }) => {
    await loginAs(page, testUser.email, testUser.password);
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
