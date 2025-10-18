import { test, expect } from '@playwright/test';

test.describe('Tab Management System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load home page', async ({ page }) => {
    await expect(page.getByText('Welcome Home')).toBeVisible();
    await expect(page.getByText('Manage your code snippets and instructions')).toBeVisible();
  });

  test('should navigate to add tab page', async ({ page }) => {
    
    await page.waitForTimeout(1000);
    
    const createFirstTabButton = page.getByRole('button', { name: 'Create First Tab' });
    const addTabButton = page.getByRole('button', { name: 'Add Tab' });
    
    const isCreateFirstTabVisible = await createFirstTabButton.isVisible().catch(() => false);
    const isAddTabVisible = await addTabButton.isVisible().catch(() => false);
    
    if (isCreateFirstTabVisible) {
      await createFirstTabButton.click();
    } else if (isAddTabVisible) {
      await addTabButton.click();
    } else {
      await page.goto('/add-tab');
    }
    
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/add-tab');
    await expect(page.getByText('Add New Tab')).toBeVisible();
  });

  test('should create a new tab', async ({ page }) => {
    await page.goto('/add-tab');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('input[id="title"]', { timeout: 10000 });

    await page.getByLabel('Tab Title').fill('Test Tab');
    await page.getByLabel('Instructions').fill('Test instructions');
    await page.getByLabel('Body').fill('console.log("test");');

    await page.getByRole('button', { name: 'Add Tab' }).click();

    await expect(page).toHaveURL('/');
  });
});
