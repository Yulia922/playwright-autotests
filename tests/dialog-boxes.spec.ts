import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Add and delete pet type', async ({ page }) => {
  await page.getByRole('link', { name: 'Pet Types' }).click();

  await expect(page.getByRole('heading')).toHaveText('Pet Types');
  await page.getByRole('button', { name: 'Add' }).click();

  await expect(page.getByRole('heading', { name: 'New Pet Type' })).toBeVisible();
  await expect(page.locator('label')).toHaveText('Name');
  await expect(page.locator('#name')).toBeVisible();

  await page.locator('#name').fill('pig');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.locator('[name="pettype_name"]').last()).toHaveValue('pig');

  page.on('dialog', (dialog) => {
    expect(dialog.message()).toEqual('Delete the pet type?');
    dialog.accept();
  });
  const lastPetRow = page.locator('tbody tr').last();
  await lastPetRow.last().getByRole('button', { name: 'Delete' }).click();

  await page.waitForResponse('**/pettypes/*');
  await expect(lastPetRow.getByRole('textbox')).not.toHaveValue('pig');
});
