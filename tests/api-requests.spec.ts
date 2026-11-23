import { test, expect } from '@playwright/test';

const vetsUrl = `https://petclinic-api.bondaracademy.com/petclinic/api/vets`;
const specialtiesUrl = `https://petclinic-api.bondaracademy.com/petclinic/api/specialties`;

test('Validation of delete specialty', async ({ page, request }) => {
  const createSpecialtyResponse = await request.post(specialtiesUrl, {
    data: { name: 'api testing expert' },
  });
  expect(createSpecialtyResponse.status()).toEqual(201);

  await page.goto('/');
  await page.getByRole('link', { name: ' Specialties' }).click();
  const newSpecialty = page.getByRole('row', { name: 'api testing expert' });
  await expect(newSpecialty.getByRole('textbox')).toHaveValue('api testing expert');
  await newSpecialty.getByRole('button', { name: 'Delete' }).click();
  await page.waitForResponse(`${specialtiesUrl}/*`);
  await expect(page.locator('#specialties')).not.toContainText('api testing expert');
});

test('Add and delete veterinarian', async ({ page, request }) => {
  const createNewVeterinarianResponse = await request.post(vetsUrl, {
    data: { firstName: 'Jane', lastName: 'Rock', specialties: [] },
  });
  expect(createNewVeterinarianResponse.status()).toEqual(201);
  const createNewVeterinarianResponseJSON = await createNewVeterinarianResponse.json();
  const vetId = createNewVeterinarianResponseJSON.id;

  await page.goto('/');
  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();

  const lastCreatedVeterinarianRow = page.getByRole('row').filter({
    has: page.getByRole('cell', {
      name: `${createNewVeterinarianResponseJSON.firstName} ${createNewVeterinarianResponseJSON.lastName}`,
    }),
  });
  await expect(lastCreatedVeterinarianRow).toBeVisible();
  await expect(lastCreatedVeterinarianRow.getByRole('cell').nth(1)).toBeEmpty();

  await lastCreatedVeterinarianRow.getByRole('button', { name: 'Edit Vet' }).click();
  const specialtiesDropdown = page.locator('.dropdown-display');
  await specialtiesDropdown.click();
  await page.getByRole('checkbox', { name: 'dentistry' }).check();
  await specialtiesDropdown.click();
  await page.getByRole('button', { name: 'Save vet' }).click();
  await expect(lastCreatedVeterinarianRow.getByRole('cell').nth(1)).toHaveText('dentistry');

  const deleteVeterinarianResponse = await request.delete(`${vetsUrl}/${vetId}`);
  expect(deleteVeterinarianResponse.status()).toEqual(204);

  const getVeterinariansResponse = await request.get(vetsUrl);
  expect(getVeterinariansResponse.status()).toEqual(200);
  const vetListJSON = await getVeterinariansResponse.json();
  expect(vetListJSON).not.toContainEqual(expect.objectContaining({ id: vetId }));
});

test('New specialty is displayed', async ({ page, request }) => {
  const createSpecialtyResponse = await request.post(specialtiesUrl, { data: { name: 'api testing ninja' } });
  expect(createSpecialtyResponse.status()).toEqual(201);
  const createdSpecialtyResponseJSON = await createSpecialtyResponse.json();
  const specialtyId = createdSpecialtyResponseJSON.id;

  const getSpecialtiesResponse = await request.get(specialtiesUrl);
  expect(getSpecialtiesResponse.status()).toBe(200);
  const specialtiesJSON = await getSpecialtiesResponse.json();
  const surgery = specialtiesJSON.find((s: { name: string }) => s.name === 'surgery');

  const createNewVeterinarianResponse = await request.post(vetsUrl, {
    data: { firstName: 'Max', lastName: 'Slow', specialties: [surgery] },
  });
  expect(createNewVeterinarianResponse.status()).toEqual(201);

  await page.goto('/');
  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();

  const newVet = await createNewVeterinarianResponse.json();
  const vetId = newVet.id;
  const lastCreatedVeterinarian = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: `${newVet.firstName} ${newVet.lastName}` }) });
  await expect(lastCreatedVeterinarian).toBeVisible();
  await expect(lastCreatedVeterinarian.getByRole('cell').nth(1)).toHaveText('surgery');

  await lastCreatedVeterinarian.getByRole('button', { name: 'Edit Vet' }).click();

  const specialtiesDropdown = page.locator('.dropdown-display');
  await specialtiesDropdown.click();
  await page.getByRole('checkbox', { name: 'surgery' }).uncheck();
  await page.getByRole('checkbox', { name: 'api testing ninja' }).check();
  await specialtiesDropdown.click();
  await page.getByRole('button', { name: 'Save vet' }).click();

  await expect(lastCreatedVeterinarian.getByRole('cell').nth(1)).toHaveText('api testing ninja');

  const deleteVeterinarianResponse = await request.delete(`${vetsUrl}/${vetId}`);
  expect(deleteVeterinarianResponse.status()).toEqual(204);

  const deleteOfSpecialty = await request.delete(`${specialtiesUrl}/${specialtyId}`);
  expect(deleteOfSpecialty.status()).toEqual(204);

  await page.getByRole('link', { name: ' Specialties' }).click();
  await page.waitForResponse(specialtiesUrl);
  await expect(page.locator('#specialties')).not.toContainText('api testing ninja');
});
