import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://petclinic.bondaracademy.com/');
  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: ' All' }).click();
});

test('Validate selected specialties', async ({ page }) => {
  await expect(page.getByRole('heading')).toHaveText('Veterinarians');

  await page
    .getByRole('row')
    .filter({ hasText: 'Helen Leary' })
    .getByRole('button', { name: 'Edit Vet' })
    .click();

  const specialtiesDropdown = page
    .locator('.form-group')
    .filter({ hasText: 'Specialties' })
    .locator('.selected-specialties');

  await expect(specialtiesDropdown).toHaveText('radiology');

  await page.locator('.dropdown-display').click();

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
  await page
    .getByRole('row')
    .filter({ hasText: 'Rafael Ortega' })
    .getByRole('button', { name: 'Edit Vet' })
    .click();

  const specialtiesDropdown = page
    .locator('.form-group')
    .filter({ hasText: 'Specialties' })
    .locator('.selected-specialties');

  await expect(specialtiesDropdown).toHaveText('surgery');

  await page.locator('.dropdown-display').click();

  const allCheckBoxes = page.getByRole('checkbox');
  for (const checkedSpecialties of await allCheckBoxes.all()) {
    await checkedSpecialties.check();
    await expect(checkedSpecialties).toBeChecked();
  }

  await expect(specialtiesDropdown).toHaveText('surgery, radiology, dentistry');
});

test('Unselect all specialties', async ({ page }) => {
  await page
    .getByRole('row')
    .filter({ hasText: 'Linda Douglas' })
    .getByRole('button', { name: 'Edit Vet' })
    .click();

  const specialtiesDropdown = page
    .locator('.form-group')
    .filter({ hasText: 'Specialties' })
    .locator('.selected-specialties');

  await expect(specialtiesDropdown).toHaveText('dentistry, surgery');

  await page.locator('.dropdown-display').click();

  const allCheckBoxes = page.getByRole('checkbox');
  for (const checkedSpecialties of await allCheckBoxes.all()) {
    await checkedSpecialties.uncheck();
    await expect(checkedSpecialties).not.toBeChecked();
  }

  await expect(specialtiesDropdown).toBeEmpty();
});
