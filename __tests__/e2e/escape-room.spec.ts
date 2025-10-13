import { test, expect } from '@playwright/test';

test.describe('Escape Room Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/escape-rooms');
  });

  test('should load escape room page', async ({ page }) => {
    await expect(page).toHaveTitle(/Escape Room/);
    await expect(page.locator('h1')).toContainText('Escape Room');
  });

  test('should start game with player name', async ({ page }) => {
    // Enter player name
    await page.fill('input[placeholder*="name"]', 'Test Player');
    
    // Set timer
    await page.fill('input[type="number"]', '30');
    
    // Start game
    await page.click('button:has-text("Start Challenge")');
    
    // Should show question selection
    await expect(page.locator('text=Choose Your Challenge')).toBeVisible();
  });

  test('should display timer and progress', async ({ page }) => {
    // Start game
    await page.fill('input[placeholder*="name"]', 'Test Player');
    await page.click('button:has-text("Start Challenge")');
    
    // Check timer is visible
    await expect(page.locator('text=00:30:00')).toBeVisible();
    
    // Check progress counter
    await expect(page.locator('text=0/4')).toBeVisible();
  });

  test('should allow question selection', async ({ page }) => {
    // Start game
    await page.fill('input[placeholder*="name"]', 'Test Player');
    await page.click('button:has-text("Start Challenge")');
    
    // Click on first question
    await page.click('button:has-text("1")');
    
    // Should show coding interface
    await expect(page.locator('text=Code Editor')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('should submit code solution', async ({ page }) => {
    // Start game and select question
    await page.fill('input[placeholder*="name"]', 'Test Player');
    await page.click('button:has-text("Start Challenge")');
    await page.click('button:has-text("1")');
    
    // Enter some code
    await page.fill('textarea', 'print("Hello World")');
    
    // Submit solution
    await page.click('button:has-text("Submit Solution")');
    
    // Should show feedback
    await expect(page.locator('text=Incorrect')).toBeVisible();
  });

  test('should use hint functionality', async ({ page }) => {
    // Start game and select question
    await page.fill('input[placeholder*="name"]', 'Test Player');
    await page.click('button:has-text("Start Challenge")');
    await page.click('button:has-text("1")');
    
    // Click hint button
    await page.click('button:has-text("Hint")');
    
    // Should show hint
    await expect(page.locator('text=Hint:')).toBeVisible();
  });

  test('should show leaderboard', async ({ page }) => {
    // Click leaderboard button
    await page.click('button:has-text("View Leaderboard")');
    
    // Should show leaderboard modal
    await expect(page.locator('text=Leaderboard')).toBeVisible();
  });
});

