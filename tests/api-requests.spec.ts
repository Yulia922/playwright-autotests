import { test, expect } from '@playwright/test';

const vetsUrl = `https://petclinic-api.bondaracademy.com/petclinic/api/vets`;
const specialtiesUrl = `https://petclinic-api.bondaracademy.com/petclinic/api/specialties`;
const headers = { authorization: `Bearer ${process.env.ACCESS_TOKEN}` };

test('Validation of delete specialty', async ({ page, request }) => {
  const newSpecialtyCreation = await request.post(specialtiesUrl, {
    data: { name: 'api testing expert' },
    headers,
  });
  expect(newSpecialtyCreation.status()).toEqual(201);

  await page.goto('/');
  await page.getByRole('link', { name: ' Specialties' }).click();
  const newSpecialty = page.getByRole('row', { name: 'api testing expert' });
  await expect(newSpecialty.getByRole('textbox')).toHaveValue('api testing expert');
  await newSpecialty.getByRole('button', { name: 'Delete' }).click();
  await page.waitForResponse(`${specialtiesUrl}/*`);
  await expect(page.locator('#specialties')).not.toContainText('api testing expert');
});

test('Add and delete veterinarian', async ({ page, request }) => {
  const newVeterinarianCreation = await request.post(vetsUrl, {
    headers,
    data: { firstName: 'Jane', lastName: 'Rock', specialties: [] },
  });
  expect(newVeterinarianCreation.status()).toEqual(201);
  const newVet = await newVeterinarianCreation.json();
  expect(newVet).toMatchObject({ firstName: 'Jane', lastName: 'Rock' });
  const vetId = newVet.id;

  await page.goto('/');
  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();

  const lastCreatedVeterinarian = page
    .getByRole('row')
    .filter({ has: page.getByRole('cell', { name: `${newVet.firstName} ${newVet.lastName}` }) });
  await expect(lastCreatedVeterinarian).toBeVisible();
  await expect(lastCreatedVeterinarian.getByRole('cell').nth(1)).toBeEmpty();

  await lastCreatedVeterinarian.getByRole('button', { name: 'Edit Vet' }).click();
  const specialtiesDropdown = page.locator('.dropdown-display');
  await specialtiesDropdown.click();
  await page.getByRole('checkbox', { name: 'dentistry' }).check();
  await specialtiesDropdown.click();
  await page.getByRole('button', { name: 'Save vet' }).click();
  await expect(lastCreatedVeterinarian.getByRole('cell').nth(1)).toHaveText('dentistry');

  const deleteOfVeterinarian = await request.delete(`${vetsUrl}/${vetId}`, { headers });
  expect(deleteOfVeterinarian.status()).toEqual(204);

  const getListOfVeterinarians = await request.get(vetsUrl, { headers });
  expect(getListOfVeterinarians.status()).toEqual(200);
  const vetList = await getListOfVeterinarians.json();
  expect(vetList).not.toContainEqual(expect.objectContaining({ id: vetId }));
});

test('New specialty is displayed', async ({ page, request }) => {
  const newSpecialtyCreation = await request.post(specialtiesUrl, {
    data: { name: 'api testing ninja' },
    headers,
  });
  expect(newSpecialtyCreation.status()).toEqual(201);
  const newSpecialty = await newSpecialtyCreation.json();
  const specialtyId = newSpecialty.id;

  const specialtyList = await request.get(specialtiesUrl, { headers });
  expect(specialtyList.status()).toBe(200);
  const specialtiesJSON = await specialtyList.json();
  const surgery = specialtiesJSON.find((s: { name: string }) => s.name === 'surgery');

  const newVeterinarianCreation = await request.post(vetsUrl, {
    headers,
    data: { firstName: 'Max', lastName: 'Slow', specialties: [surgery] },
  });
  expect(newVeterinarianCreation.status()).toEqual(201);

  await page.goto('/');
  await page.getByRole('button', { name: 'Veterinarians' }).click();
  await page.getByRole('link', { name: 'All' }).click();

  const newVet = await newVeterinarianCreation.json();
  expect(newVet).toMatchObject({ firstName: 'Max', lastName: 'Slow' });
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

  const deleteOfVeterinarian = await request.delete(`${vetsUrl}/${vetId}`, { headers });
  expect(deleteOfVeterinarian.status()).toEqual(204);

  const deleteOfSpecialty = await request.delete(`${specialtiesUrl}/${specialtyId}`, { headers });
  expect(deleteOfSpecialty.status()).toEqual(204);

  await page.getByRole('link', { name: ' Specialties' }).click();
  await expect(page.locator('#specialties')).not.toContainText('api testing ninja');
});
