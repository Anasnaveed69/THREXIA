import { test, expect } from '@playwright/test';

test.describe('Authentication Security Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page with performance optimization enabled
    await page.goto('/login?perf=low');
    await page.waitForLoadState('networkidle');
    // Speed optimization: Hide the expensive WebGL background to avoid GPU stalls in headless mode
    await page.addStyleTag({ content: '.login-bg > div:first-child { display: none !important; }' });
  });

  test('TC-01: Unauthorized access redirection', async ({ page }) => {
    // Attempting to access dashboard without login (appending perf flag to ensure stability after redirect)
    await page.goto('/dashboard?perf=low');
    
    // Should be redirected back to login, preserving the perf flag
    await page.waitForURL(/.*login.*/);
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('TC-02: Validate login with valid Administrator credentials', async ({ page }) => {
    // Fill in the credentials found in seed_data.py
    await page.fill('input[placeholder="Enter username..."]', 'admin_anas');
    await page.fill('input[placeholder="••••••••"]', 'AdminPass123!');

    // Click the "INITIALIZE ENCRYPTED UPLINK" button
    await page.click('button:has-text("INITIALIZE ENCRYPTED UPLINK")');
    await page.waitForLoadState('networkidle');

    // Should redirect to dashboard or overview based on permissions
    // Admin has access to all, usually redirects to dashboard or first permitted route
    await expect(page).toHaveURL(/.*(dashboard|overview|admin)/);

    // Verify user profile badge contains 'ADM' (Admin)
    await expect(page.locator('.profile-badge')).toContainText('ADM');

    // Verify brand identity is present
    await expect(page.locator('.brand-text')).toContainText('THREXIA');
  });

  test('TC-03: Validate error handling for invalid Neural Passcode', async ({ page }) => {
    await page.fill('input[placeholder="Enter username..."]', 'admin_anas');
    await page.fill('input[placeholder="••••••••"]', 'WrongPassword123');
    await page.click('button:has-text("INITIALIZE ENCRYPTED UPLINK")');

    // Verify error message is visible (matching the text from main.py detail)
    await expect(page.getByText('Invalid username or password.')).toBeVisible();
  });

  test('TC-04: Secure Logout verification', async ({ page }) => {
    // First Login
    await page.fill('input[placeholder="Enter username..."]', 'admin_anas');
    await page.fill('input[placeholder="••••••••"]', 'AdminPass123!');
    await page.click('button:has-text("INITIALIZE ENCRYPTED UPLINK")');

    // Click Logout button (title="Secure Logout")
    await page.click('button[title="Secure Logout"]');

    // Should be back at landing page or login
    await expect(page).toHaveURL(/\/$/);

    // Verify localStorage is cleared
    const auth = await page.evaluate(() => localStorage.getItem('threxia_auth'));
    expect(auth).toBeNull();
  });

});
