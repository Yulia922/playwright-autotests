import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('Validate the pet name city of the owner', async ({ page }) => {
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: 'Search' }).click();
  const ownerName = page.getByRole('row', { name: 'Jeff Black' });
  await expect(ownerName.locator('td').nth(2)).toHaveText('Monona');
  await expect(ownerName.locator('td').last()).toHaveText('Lucky');
});

test('Validate owners count of the Madison city', async ({ page }) => {
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: 'Search' }).click();
  const ownerByCity = page.getByRole('row').filter({ has: page.getByRole('cell').nth(2).getByText('Madison') });
  await expect(ownerByCity).toHaveCount(4);
});

test('Validate search by Last Name', async ({ page }) => {
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: 'Search' }).click();
  await page.locator('#lastName').fill('Black');
  await page.getByRole('button', { name: 'Find Owner' }).click();

  const ownerNames = page.locator('tbody').getByRole('row').locator('td:first-child');

  await expect(ownerNames).not.toHaveCount(0);
  const ownersWithoutBlack = ownerNames.filter({ hasNotText: /\sBlack\s*$/ });
  await expect(ownersWithoutBlack).toHaveCount(0);

  await page.locator('#lastName').fill('Davis');
  await page.getByRole('button', { name: 'Find Owner' }).click();
  await expect(ownerNames).not.toHaveCount(0);
  const ownersWithoutsDavis = ownerNames.filter({ hasNotText: /\sDavis\s*$/ });

  await page.locator('#lastName').fill('Es');
  await page.getByRole('button', { name: 'Find Owner' }).click();
  await expect(ownerNames).not.toHaveCount(0);
  const ownersWithoutsEs = ownerNames.filter({ hasNotText: /\s\S*Es\S*\s*$/i });

  await page.locator('#lastName').fill('Playwright');
  await page.getByRole('button', { name: 'Find Owner' }).click();

  const errorMessage = page.getByText('No owners with LastName starting with "Playwright"');
  await expect(errorMessage).toHaveText('No owners with LastName starting with "Playwright"');
});

test('Validate phone number and pet name on the Owner Information page', async ({ page }) => {
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: 'Search' }).click();
  const phoneNumber = '6085552765';
  const ownerByPhoneNumber = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell').nth(3).getByText(phoneNumber) });
  const ownerName = await ownerByPhoneNumber.getByRole('cell').first().innerText();
  const ownerPetName = await ownerByPhoneNumber.getByRole('cell').nth(4).innerText();

  await page.getByRole('link', { name: 'Peter McTavish' }).click();
  const ownerInfoPhoneNumber = page.locator('table').first().locator('tr', { hasText: 'Telephone' });
  await expect(ownerInfoPhoneNumber.locator('td')).toHaveText(phoneNumber);

  const ownerInfoName = page.locator('table').first().locator('tr', { hasText: 'Name' });
  await expect(ownerInfoName.locator('td')).toHaveText(ownerName);
  const ownerInfoPetName = page.locator('dl').first().locator('dd').first();
  await expect(ownerInfoPetName).toHaveText(ownerPetName);
});

test('Validate pets of the Madison city', async ({ page }) => {
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: 'Search' }).click();
  const ownerByCity = page
    .locator('tbody')
    .getByRole('row')
    .filter({ has: page.getByRole('cell').getByText('Madison') });
  const petsNameFromMadison: string[] = [];
  await expect(ownerByCity).toHaveCount(4);
  const ownersCount = await ownerByCity.count();

  for (let i = 0; i < ownersCount; i++) {
    const petName = await ownerByCity.nth(i).getByRole('cell').last().innerText();
    petsNameFromMadison.push(petName);
  }

  expect(petsNameFromMadison).toEqual(['Leo', 'George', 'Mulligan', 'Freddy']);
});

test('Validate specialty update', async ({ page }) => {
  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();

  const veterinarianRafaelOrtega = page
    .locator('tr')
    .filter({ has: page.getByRole('cell', { name: 'Rafael Ortega' }) });
  await expect(veterinarianRafaelOrtega.getByRole('cell').nth(1)).toHaveText('surgery');

  await page.getByRole('link', { name: 'Specialties' }).click();
  await expect(page.getByRole('heading')).toHaveText('Specialties');

  const surgeryRow = page.locator('tbody tr').nth(1);
  await surgeryRow.getByRole('button', { name: 'Edit' }).click();

  await expect(page.getByRole('heading')).toHaveText('Edit Specialty');
  await expect(page.locator('#name')).toHaveValue('surgery');
  await page.locator('#name').fill('dermatology');
  await page.getByRole('button', { name: 'Update' }).click();

  await expect(surgeryRow.locator('[name="spec_name"]')).toHaveValue('dermatology');

  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();
  await expect(veterinarianRafaelOrtega.getByRole('cell').nth(1)).toHaveText('dermatology');

  await page.getByRole('link', { name: 'Specialties' }).click();
  await surgeryRow.getByRole('button', { name: 'Edit' }).click();
  await expect(page.locator('#name')).toHaveValue('dermatology');
  await page.locator('#name').fill('surgery');
  await page.getByRole('button', { name: 'Update' }).click();
  await expect(surgeryRow.locator('[name="spec_name"]')).toHaveValue('surgery');
});

test('Validate specialty lists', async ({ page }) => {
  const specialtyRow = page.locator('tbody tr');
  await page.getByRole('link', { name: 'Specialties' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await page.locator('#name').fill('oncology');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(specialtyRow.locator('[name="spec_name"]').last()).toHaveValue('oncology');

  const allSpecialties: string[] = [];
  const specialtiesCount = await specialtyRow.count();

  for (let i = 0; i < specialtiesCount; i++) {
    const specialty = await specialtyRow.nth(i).locator('[name="spec_name"]').inputValue();
    allSpecialties.push(specialty);
  }

  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();
  const vetSharonJenkins = page.getByRole('row').filter({ has: page.getByRole('cell').getByText('Sharon Jenkins') });
  await vetSharonJenkins.getByRole('button', { name: 'Edit Vet' }).click();

  const specialtyDropdown = page.locator('.dropdown-display');
  await specialtyDropdown.click();
  const arrayOfSpecialtiesDropdown = await page.locator('.dropdown-content label').allInnerTexts();

  expect(arrayOfSpecialtiesDropdown).toEqual(allSpecialties);

  await page.getByRole('checkbox', { name: 'oncology' }).check();
  await specialtyDropdown.click();
  await page.getByRole('button', { name: 'Save Vet' }).click();

  await expect(vetSharonJenkins.locator('td').nth(1)).toHaveText('oncology');

  await page.getByRole('link', { name: 'Specialties' }).click();
  await page.getByRole('button', { name: 'Delete' }).last().click();

  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();
  await expect(vetSharonJenkins.locator('td').nth(1)).toBeEmpty();
});
