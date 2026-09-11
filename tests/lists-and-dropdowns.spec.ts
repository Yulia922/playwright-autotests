import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: ' Search' }).click();
  await expect(page.getByRole('heading')).toHaveText('Owners');
});

test('Validate selected pet types from the list', async ({ page }) => {
  await page.getByRole('link', { name: 'George Franklin' }).click();
  await expect(page.locator('.ownerFullName')).toHaveText('George Franklin');

  await page.getByRole('button', { name: 'Edit Pet' }).click();
  await expect(page.getByRole('heading')).toHaveText('Pet');

  await expect(page.locator('#owner_name')).toHaveValue('George Franklin');

  await expect(page.locator('#type1')).toHaveValue('cat');

  const dropdownPetTypeSelection = page.locator('form-control').getByRole('combobox');
  const allListValue = await dropdownPetTypeSelection.allTextContents();
  for (const listValue of allListValue) {
    await dropdownPetTypeSelection.selectOption(listValue);
    await expect(page.locator('#type1')).toHaveValue(listValue);
  }
});

test('Validate pet type update', async ({ page }) => {
  await page.getByRole('link', { name: 'Eduardo Rodriquez' }).click();

  const rosyPetSection = page.locator('app-pet-list', { hasText: 'Rosy' });
  await rosyPetSection.getByRole('button', { name: 'Edit Pet' }).click();

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Rosy');
  await expect(page.locator('#type1')).toHaveValue('dog');

  await page.locator('.form-group').getByRole('combobox').selectOption('bird');
  await expect(page.getByLabel('Type')).toHaveValue('bird');
  await expect(page.locator('#type1')).toHaveValue('bird');

  await page.getByRole('button', { name: 'Update Pet' }).click();

  await expect(rosyPetSection.locator('.dl-horizontal dd').last()).toHaveText('bird');

  await rosyPetSection.getByRole('button', { name: 'Edit Pet' }).click();
  await expect(page.locator('#type1')).toHaveValue('bird');

  await page.locator('.form-group').getByRole('combobox').selectOption('dog');

  await expect(page.getByLabel('Type')).toHaveValue('dog');
  await expect(page.locator('#type1')).toHaveValue('dog');

  await page.getByRole('button', { name: 'Update Pet' }).click();
  await expect(rosyPetSection.locator('.dl-horizontal dd').last()).toHaveText('dog');
});
