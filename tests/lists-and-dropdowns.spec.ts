import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://petclinic.bondaracademy.com/');
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: ' Search' }).click();
  await expect(page.getByRole('heading')).toHaveText('Owners');
});

test('Validate selected pet types from the list', async ({ page }) => {
  await page.waitForResponse('https://petclinic-api.bondaracademy.com/petclinic/api/owners');

  await page.getByRole('link', { name: 'George Franklin' }).click();
  await expect(page.getByRole('cell', { name: 'George Franklin' })).toHaveText('George Franklin');

  await page.getByRole('button', { name: 'Edit Pet' }).click();
  await expect(page.getByRole('heading', { name: 'Pet' })).toHaveText('Pet');

  await expect(page.locator('#owner_name')).toHaveValue('George Franklin');

  await expect(page.locator('#type1')).toHaveValue('cat');

  const dropdownPetTypeSelection = await page.locator('form-control').getByRole('combobox');
  const allListValue = await dropdownPetTypeSelection.allTextContents();
  for (const listValue of allListValue) {
    await page.locator('form-control').getByRole('combobox').selectOption(listValue);
    await expect(dropdownPetTypeSelection).toHaveText(listValue);
    await expect(page.locator('#type1')).toHaveValue(listValue);
  }
});

test('Validate pet type update', async ({ page }) => {
  await page.waitForResponse('https://petclinic-api.bondaracademy.com/petclinic/api/owners');
  await page.getByRole('link', { name: 'Eduardo Rodriquez' }).click();

  const rosyPet = page.locator('app-pet-list').filter({has: page.getByText('Rosy', { exact: true })});
  await rosyPet.getByRole('button', { name: 'Edit Pet' }).click();

  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveValue('Rosy');
  await expect(page.locator('#type1')).toHaveValue('dog');

  await page.locator('.form-group').getByRole('combobox').selectOption('bird');
  await expect(page.getByLabel('Type')).toHaveValue('bird');
  await expect(page.locator('#type1')).toHaveValue('bird');

  await page.getByRole('button', { name: 'Update Pet' }).click();

  await expect(rosyPet.getByText('bird')).toHaveText('bird');
  
  await page.getByRole('button', { name: 'Edit Pet' }).nth(1).click();
  await expect(page.locator('#type1')).toHaveValue('bird');

  await page.locator('.form-group').getByRole('combobox').selectOption('dog');

  await expect(page.getByLabel('Type')).toHaveValue('dog');
  await expect(page.locator('#type1')).toHaveValue('dog');

  await page.getByRole('button', { name: 'Update Pet' }).click();
  await expect(rosyPet.getByText('dog')).toHaveText('dog');
});
