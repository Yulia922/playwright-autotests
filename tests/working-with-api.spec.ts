import { test, expect } from '@playwright/test';
import owners from '../test-data/owners.json';

test.describe('Owner tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/owners', async (route) => {
      await route.fulfill({
        json: owners,
      });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Owners' }).click();
    await page.getByRole('link', { name: ' Search' }).click();
  });
  test('mocking API request', async ({ page }) => {
    const ownerRows = page.locator('.ownerFullName');
    await expect(ownerRows).toHaveCount(2);
    const firstOwner = owners[0];
    await page.route(`**/api/owners/${firstOwner.id}`, async (route) => {
      await route.fulfill({
        json: firstOwner,
      });
    });
    await ownerRows.first().getByRole('link').click();
    const ownerInfo = page.locator('app-owner-detail table');
    await expect(ownerInfo.first().locator('td')).toHaveText([
      `${firstOwner.firstName} ${firstOwner.lastName}`,
      firstOwner.address,
      firstOwner.city,
      firstOwner.telephone,
    ]);
    const petList = page.locator('app-pet-list');
    await expect(petList).toHaveCount(2);
    await expect(petList.first().locator('dt:has-text("Name") + dd')).toHaveText(firstOwner.pets[0].name);
    await expect(petList.nth(1).locator('dt:has-text("Name") + dd')).toHaveText(firstOwner.pets[1].name);
    await expect(petList.first().locator('app-visit-list > table > tr')).toHaveCount(10);
  });
});

test.describe('Veterinarians and specialties test', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('*/**/api/vets', async (route) => {
      const vetSpecialties = await route.fetch();
      const vetSpecialtiesJSON = await vetSpecialties.json();
      vetSpecialtiesJSON.find((vet) => vet.firstName === 'Sharon' && vet.lastName === 'Jenkins')!.specialties = [
        { id: 5786, name: 'dentistry' },
        { id: 5785, name: 'surgery' },
        { id: 5784, name: 'radiology' },
        { id: 5783, name: 'dermatology' },
        { id: 5782, name: 'cardiology' },
        { id: 5781, name: 'ophthalmology' },
        { id: 5780, name: 'neurology' },
        { id: 5779, name: 'oncology' },
        { id: 5778, name: 'orthopedics' },
        { id: 5777, name: 'anesthesiology' },
      ];
      await route.fulfill({
        json: vetSpecialtiesJSON,
      });
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Veterinarians' }).click();
    await page.getByRole('link', { name: 'All' }).click();
  });

  test('Intercept API response', async ({ page }) => {
    await expect(page.getByRole('row', { name: 'Sharon Jenkins' }).locator('td div')).toHaveCount(10);
  });
});
