import { test, expect } from '@playwright/test';

test.describe('Escape Room Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/escape-rooms');
    await page.waitForLoadState('networkidle');
  });

  test('should load escape room page', async ({ page }) => {
    await expect(page.getByText('Code Escape Room')).toBeVisible();
    await expect(page.getByText('Can you code your way out?')).toBeVisible();
  });

  test('should start game with player name', async ({ page }) => {

    await page.getByPlaceholder('Your name for the leaderboard').fill('Test Player');
    
    await page.getByRole('button', { name: 'Start Challenge' }).click();

    await page.waitForTimeout(2000);

    const stillOnStartScreen = await page.getByText('Code Escape Room').isVisible().catch(() => false);
    expect(stillOnStartScreen).toBeFalsy();
  });

  test('should not start without player name', async ({ page }) => {
    
    const startButton = page.getByRole('button', { name: 'Enter your name to start' });
    await expect(startButton).toBeDisabled();
  });
});
