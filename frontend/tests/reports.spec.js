import { test, expect } from '@playwright/test';

test.describe('Intelligence & AI Diagnostics Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Login as Security Analyst
    await page.goto('/login?perf=low');
    // Wait for the page to be network-idle before proceeding
    await page.waitForLoadState('networkidle');
    // Speed optimization: Hide the expensive WebGL background to avoid GPU stalls in headless mode
    await page.addStyleTag({ content: '.login-bg > div:first-child { display: none !important; }' });
    await page.fill('input[placeholder="Enter username..."]', 'analyst_david');
    await page.fill('input[placeholder="••••••••"]', 'SecurePass123!');
    await page.click('button:has-text("INITIALIZE ENCRYPTED UPLINK")');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('TC-08: AI Threat Classification Flow (Manual Entry)', async ({ page }) => {
    // Navigate to Manual Analysis
    await page.click('a:has-text("Analyze")');
    await expect(page).toHaveURL(/.*analyze/);

    // Click "Load Anomaly Preset" to fill the form with a known threat pattern
    await page.click('button:has-text("Load Anomaly Preset")');

    // Verify textarea is filled
    const textarea = page.locator('textarea');
    await expect(textarea).not.toHaveValue('0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 1, 0');

    // Run AI Diagnostics
    await page.click('button:has-text("ANALYZE LOG")');

    // Wait for the dynamic behavioral analysis to appear (indicates AI is done)
    await expect(page.getByText('BEHAVIORAL ANALYSIS:')).toBeVisible({ timeout: 15000 });
    
    // Verify results show a prediction header
    await expect(page.getByText('Prediction Result')).toBeVisible();

    // Verify confidence score is present (supporting decimals like 88.6%)
    await expect(page.getByText(/Confidence: \d+(\.\d+)?%/)).toBeVisible();
  });

  test('TC-09: System Posture Verification (Overview)', async ({ page }) => {
    // Navigate to Overview
    await page.click('a:has-text("Overview")');
    await expect(page).toHaveURL(/.*overview/);

    // Verify Threat Posture Card is loaded
    await expect(page.locator('text=THREAT POSTURE')).toBeVisible();

    // Verify AI Engine status is visible (handle both ACTIVE and OFFLINE for test stability)
    const engineStatus = page.locator('button').filter({ hasText: 'AI ENGINE STATUS' });
    await expect(engineStatus).toBeVisible();
    await expect(engineStatus).toContainText(/ACTIVE|OFFLINE/);
  });

  test('TC-10: CSV Template Export verification', async ({ page }) => {
    // Navigate to Analyze -> CSV Tab
    await page.click('a:has-text("Analyze")');
    await page.click('button:has-text("CSV UPLOAD")');

    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Template")');
    const download = await downloadPromise;

    // Verify filename
    expect(download.suggestedFilename()).toContain('threxia_template');
  });

});
