import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://petclinic.bondaracademy.com/');
  //1. Select the PET TYPES menu item in the navigation bar
  await page.getByRole('link', { name: 'Pet Types' }).click();
  //2. Add assertion of the "Pet Types" text displayed above the table with the list of pet types
  await expect(page.getByRole('heading', { name: 'Pet Types' })).toHaveText('Pet Types');
});

test('Update pet type', async ({ page }) => {
  //3. Click on "Edit" button for the "cat" pet type
  await page.getByRole('button', { name: 'Edit' }).first().click();

  //4. Add assertion of the "Edit Pet Type" text displayed
  await expect(page.getByRole('heading', { name: 'Edit Pet Type' })).toHaveText('Edit Pet Type');

  //5. Change the pet type name from "cat" to "rabbit" and click "Update" button
  await expect(page.getByRole('textbox')).toHaveValue('cat');
  await page.getByRole('textbox').fill('rabbit');
  await page.getByRole('button', { name: 'Update' }).click();

  //6. Add the assertion that the first pet type in the list of types has a value "rabbit"
  await expect(page.locator('input[name="pettype_name"]').first()).toHaveValue('rabbit');

  //7. Click on "Edit" button for the same "rabbit" pet type
  await page.getByRole('button', { name: 'Edit' }).first().click();

  //8. Change the pet type name back from "rabbit" to "cat" and click "Update" button
  await expect(page.getByRole('textbox')).toHaveValue('rabbit');
  await page.locator('#name').fill('cat');
  await page.getByRole('button', { name: 'Update' }).click();

  //9. Add the assertion that the first pet type in the list of names has a value "cat"
  await expect(page.locator('input[name="pettype_name"]').first()).toHaveValue('cat');
});

test('Cancel pet type update', async ({ page }) => {
  // 3. Click on "Edit" button for the "dog" pet type
  await page.getByRole('button', { name: 'Edit' }).nth(1).click();

  // 4. Type the new pet type name "moose"
  await expect(page.getByRole('textbox')).toHaveValue('dog');

  await page.getByRole('textbox').fill('moose');
  // 5. Add assertion the value "moose" is displayed in the input field of the "Edit Pet Type" page
  await expect(page.getByRole('textbox')).toHaveValue('moose');

  // 6. Click on "Cancel" button
  await page.getByRole('button', { name: 'Cancel' }).click();

  // 7. Add the assertion the value "dog" is still displayed in the list of pet types
  await expect(page.locator('input[name="pettype_name"]').nth(1)).toHaveValue('dog');
});

test('Validation of Pet type name is required', async ({ page }) => {
  // 3. Click on "Edit" button for the "lizard" pet type
  await page.getByRole('button', { name: 'Edit' }).nth(2).click();

  // 4. On the Edit Pet Type page, clear the input field
  await expect(page.getByRole('textbox')).toHaveValue('lizard');
  await page.getByRole('textbox').clear();

  // 5. Add the assertion for the "Name is required" message below the input field
  await expect(page.getByText('Name is required')).toHaveText('Name is required');

  // 6. Click on "Update" button
  await page.getByRole('button', { name: 'Update' }).click();

  // 7. Add assertion that "Edit Pet Type" page is still displayed
  await expect(page.getByText('Name is required')).toHaveText('Name is required');

  // 8. Click on the "Cancel" button
  await page.getByRole('button', { name: 'Cancel' }).click();

  // 9. Add assertion that "Pet Types" page is displayed
  await expect(page.getByRole('heading', { name: 'Pet Types' })).toHaveText('Pet Types');
});
