import { test, expect } from '@playwright/test';

test.describe('Tabs Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/add-tab');
  });

  test('should load add tab page', async ({ page }) => {
    await expect(page).toHaveTitle(/Add Tab/);
    await expect(page.locator('h1')).toContainText('Add New Tab');
  });

  test('should create new tab', async ({ page }) => {
    // Fill form
    await page.fill('input[name="title"]', 'Test Tab');
    await page.fill('textarea[name="instructions"]', 'Test instructions');
    await page.fill('textarea[name="code"]', 'print("Hello World")');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to home page
    await expect(page).toHaveURL('/');
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
  });
});

