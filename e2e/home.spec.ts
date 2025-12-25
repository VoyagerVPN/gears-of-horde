import { test, expect } from '@playwright/test';

test('homepage has title and navigation', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Gears of Horde/);

    // Check for the Navigation Bar
    await expect(page.locator('nav')).toBeVisible();

    // Check for the Logo (image now exists)
    await expect(page.locator('nav img[alt="Gears of Horde"]')).toBeVisible();

    // Check for the Filter Buttons (Updated, Featured, Top Rated)
    await expect(page.getByRole('button', { name: 'Updated' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Featured' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Top Rated' }).first()).toBeVisible();

    // Check for the Hero Section "Info" header
    await expect(page.getByText('Info').first()).toBeVisible();

    // Check for mod grid
    await expect(page.getByTestId('mod-grid')).toBeVisible();

    // Check for news section
    await expect(page.locator('h3:has-text("Latest News"), h3:has-text("Последние новости")')).toBeVisible();
});

test('sorting buttons work', async ({ page }) => {
    await page.goto('/');

    // Click on "Top Rated" button
    await page.getByRole('button', { name: 'Top Rated' }).first().click();

    // Verify URL has sort parameter
    await expect(page).toHaveURL(/sort=rating/);

    // Click on "Featured" button
    await page.getByRole('button', { name: 'Featured' }).first().click();
    await expect(page).toHaveURL(/sort=downloads/);
});

test('hero section is visible with key elements', async ({ page }) => {
    await page.goto('/');

    // Check for author avatar
    await expect(page.locator('img[alt="Ranazy"]')).toBeVisible();

    // Check for FAQ sections
    await expect(page.getByText('Who am I?')).toBeVisible();
    await expect(page.getByText('What is Gears of Horde?')).toBeVisible();

    // Check for mod wheel
    await expect(page.getByRole('button', { name: /Roll Random|Мне повезет/ })).toBeVisible();
});
