import { test, expect } from '@playwright/test';

test.describe('Dashboard & Integration Intelligence Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Login as Security Analyst for dashboard testing
    await page.goto('/login?perf=low');
    await page.waitForLoadState('networkidle');
    // Speed optimization: Hide the expensive WebGL background to avoid GPU stalls in headless mode
    await page.addStyleTag({ content: '.login-bg > div:first-child { display: none !important; }' });
    await page.fill('input[placeholder="Enter username..."]', 'analyst_david');
    await page.fill('input[placeholder="••••••••"]', 'SecurePass123!');
    await page.click('button:has-text("INITIALIZE ENCRYPTED UPLINK")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('TC-05: Real-time Telemetry Data Integration', async ({ page }) => {
    // Verify that the Telemetry components are rendered
    await expect(page.getByText('Total System Logs Analyzed')).toBeVisible();

    // Check if the counts are numeric (meaning they've been fetched from the API)
    // Using a context-aware locator to avoid picking up the wrong metric
    const logCard = page.locator('.card', { hasText: 'Total System Logs Analyzed' });
    const logCount = logCard.locator('.metric-value, .exec-metric-value');
    await expect(logCount).not.toHaveText('0'); // Should be seeded with > 5420

    // Verify the presence of the Deviation Chart (scoping to avoid strict mode violations)
    const activityChart = page.locator('.card', { hasText: 'System Activity Baseline' });
    await expect(activityChart.locator('.recharts-surface').first()).toBeVisible();
  });

  test('TC-06: Intelligence Sidebar Navigation', async ({ page }) => {
    // Navigate to Logs page via sidebar
    await page.click('a:has-text("Logs")');
    await expect(page).toHaveURL(/.*logs/);

    // Verify Log table is populated
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tr').nth(1)).toBeVisible(); // Header + at least one row
  });

  test('TC-07: Manual Analysis Interface', async ({ page }) => {
    // Navigate to Analyze page
    await page.click('a:has-text("Analyze")');
    await expect(page).toHaveURL(/.*analyze/);

    // Verify the UI components of the analysis engine
    await expect(page.getByRole('heading', { name: 'Manual Log Analysis' })).toBeVisible();
    await expect(page.locator('button:has-text("ANALYZE LOG")')).toBeVisible();
  });

});
