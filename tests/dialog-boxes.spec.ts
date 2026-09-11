import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Add and delete pet type', async ({ page }) => {
  await page.getByRole('link', { name: 'Pet Types' }).click();

  await expect(page.getByRole('heading')).toHaveText('Pet Types');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByRole('heading', { name: 'New Pet Type' })).toBeVisible();
  await expect(page.locator('label')).toBeVisible();
  await expect(page.locator('#name')).toBeVisible();

  await page.locator('#name').fill('pig');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.locator('[id="6"]')).toHaveValue('pig');

  await page.on('dialog', (dialog) => {
    expect(dialog.message()).toEqual('Delete the pet type?');
    dialog.accept();
  });
  const petRow = page.locator('tbody tr');
  await petRow.last().getByRole('button', { name: 'Delete', exact: true }).click();

  await expect(petRow.last().getByRole('textbox')).not.toHaveValue('pig');
});
