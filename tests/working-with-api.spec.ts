import { test, expect } from '@playwright/test';
import owners from '../test-data/owners.json';

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
  const ownerRows = page.locator('#ownersTable > table > tbody > tr');
  await expect(ownerRows).toHaveCount(2);
  const owner = owners[0];
  await page.route('**/api/owners/2727', async (route) => {
    await route.fulfill({
      json: owner,
    });
  });
  await ownerRows.first().getByRole('link').click();
  const ownerInfo = page.locator('app-owner-detail table');
  await expect(ownerInfo.first().locator('td')).toHaveText([
    `${owner.firstName} ${owner.lastName}`,
    owner.address,
    owner.city,
    owner.telephone,
  ]);
  const petList = page.locator('app-pet-list');
  await expect(petList).toHaveCount(2);
  await expect(petList.first().locator('dt:has-text("Name") + dd')).toHaveText(owner.pets[0].name);
  await expect(petList.nth(1).locator('dt:has-text("Name") + dd')).toHaveText(owner.pets[1].name);
  await expect(petList.first().locator('app-visit-list > table > tr')).toHaveCount(10);
});
