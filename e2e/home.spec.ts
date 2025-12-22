import { test, expect } from '@playwright/test';

test('homepage has title and navigation', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Gears of Horde/); // Adjust based on actual title if known, or generic check

    // Check for the Navigation Bar
    await expect(page.locator('nav')).toBeVisible();

    // Check for the Logo Text
    await expect(page.getByText('GEARS OF HORDE')).toBeVisible();

    // Check for the Filter Buttons in the center column
    await expect(page.getByRole('button', { name: 'Updated' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Featured' }).first()).toBeVisible();

    // Check for the "Latest News" header in the right column
    // Note: Text might vary by locale, but default is English usually or checking specific class/structure
    // Using a loose text match or selector if text depends on translation
    // Based on the code: {t('latestNews')}
    // If we assume default en locale, it should be "LATEST NEWS" or similar.
    // Let's check for the news column container generally if text is uncertain, 
    // but looking at page.tsx line 110: <h3 ...>{t('latestNews')}</h3>
    // We can just check for valid page load by looking for the grid container.

    const modGrid = page.locator('.grid.grid-cols-1.md\\:grid-cols-2');
    await expect(modGrid.first()).toBeVisible();
});
