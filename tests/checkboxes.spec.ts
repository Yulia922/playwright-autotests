import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: ' All' }).click();
});

test('Validate selected specialties', async ({ page }) => {
  await expect(page.getByRole('heading')).toHaveText('Veterinarians');

  await page.getByRole('row', { name: 'Helen Leary' }).getByRole('button', { name: 'Edit Vet' }).click();

  const specialtiesDropdown = page.locator('.selected-specialties');

  await expect(specialtiesDropdown).toHaveText('radiology');

  await specialtiesDropdown.click();

  await expect(page.getByRole('checkbox', { name: 'radiology' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'surgery' })).not.toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'dentistry' })).not.toBeChecked();

  await page.getByRole('checkbox', { name: 'surgery' }).check();
  await page.getByRole('checkbox', { name: 'radiology' }).uncheck();

  await expect(specialtiesDropdown).toHaveText('surgery');

  await page.getByRole('checkbox', { name: 'dentistry' }).check();

  await expect(specialtiesDropdown).toHaveText('surgery, dentistry');
});

test('Select all specialties', async ({ page }) => {
  await page.getByRole('row', { name: 'Rafael Ortega' }).click();

  const specialtiesDropdown = page.locator('.selected-specialties');

  await expect(specialtiesDropdown).toHaveText('surgery');

  await specialtiesDropdown.click();

  const allCheckBoxes = page.getByRole('checkbox');
  for (const chechbox of await allCheckBoxes.all()) {
    await chechbox.check();
    await expect(chechbox).toBeChecked();
  }

  await expect(specialtiesDropdown).toHaveText('surgery, radiology, dentistry');
});

test('Unselect all specialties', async ({ page }) => {
  await page.getByRole('row', { name: 'Linda Douglas' }).click();

  const specialtiesDropdown = page.locator('.selected-specialties');

  await expect(specialtiesDropdown).toHaveText('dentistry, surgery');

  await specialtiesDropdown.click();

  const allCheckBoxes = page.getByRole('checkbox');
  for (const chechbox of await allCheckBoxes.all()) {
    await chechbox.uncheck();
    await expect(chechbox).not.toBeChecked();
  }

  await expect(specialtiesDropdown).toBeEmpty();
});
