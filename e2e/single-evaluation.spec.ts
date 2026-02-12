import { test, expect } from '@playwright/test';
import { testUser } from './fixtures/test-data';
import { loginAs } from './fixtures/setup';

test.describe('Single Evaluation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, testUser.email, testUser.password);
  });

  test('can navigate to template selection', async ({ page }) => {
    await expect(page.getByText('Templates')).toBeVisible();
  });

  test('can select a clerkship template', async ({ page }) => {
    await page.getByText('Templates').click();
    const templateCard = page.locator('[class*="card"]').first();
    await expect(templateCard).toBeVisible();
  });

  test('disabled tabs show tooltip when no template selected', async ({ page }) => {
    const evaluationTab = page.getByText('Evaluation');
    await evaluationTab.hover();
    await expect(page.getByText(/select a template/i)).toBeVisible();
  });
});
