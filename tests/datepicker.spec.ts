import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Owners' }).click();
  await page.getByRole('link', { name: ' Search' }).click();
  await expect(page.getByRole('heading')).toHaveText('Owners');
});

test('Select the desired date in the calendar', async ({ page }) => {
  await page.getByRole('link', { name: 'Harold Davis' }).click();

  await page.getByRole('button', { name: 'Add New Pet' }).click();
  const nameFieldIcon = page.locator('.form-group', { has: page.locator('#name') }).locator('.form-control-feedback');
  await expect(nameFieldIcon).toHaveClass(/glyphicon-remove/);
  await page.getByRole('textbox', { name: 'Name' }).fill('Tom');
  await expect(nameFieldIcon).toHaveClass(/glyphicon-ok/);

  await page.getByRole('button', { name: 'Open calendar' }).click();
  await page.getByRole('button', { name: 'Choose month and year' }).click();
  await page.getByRole('button', { name: 'Previous 24 years' }).click();
  await page.getByRole('button', { name: '2014' }).click();
  await page.getByRole('button', { name: '05' }).click();
  await page.getByRole('button', { name: '/05/02' }).click();

  await expect(page.locator('input[name="birthDate"]')).toHaveValue('2014/05/02');

  await page.getByLabel('Type').selectOption('dog');
  await page.getByRole('button', { name: 'Save Pet' }).click();

  const tomPetSection = page.locator('app-pet-list', { hasText: 'Tom' });
  await expect(tomPetSection.locator('dt:has-text("Name") + dd')).toHaveText('Tom');
  await expect(tomPetSection.locator('dt:has-text("Birth Date") + dd')).toHaveText('2014-05-02');
  await expect(tomPetSection.locator('dt:has-text("Type") + dd')).toHaveText('dog');

  await tomPetSection.getByRole('button', { name: 'Delete Pet' }).click();
  await expect(tomPetSection).toHaveCount(0);
});

test('Select the dates of visits and validate dates order.', async ({ page }) => {
  await page.getByRole('link', { name: 'Jean Coleman' }).click();

  const samanthaPetSection = page.locator('app-pet-list', { hasText: 'Samantha' });
  await samanthaPetSection.getByRole('button', { name: 'Add Visit' }).click();

  await expect(page.getByRole('heading')).toHaveText('New Visit');

  const petTable = page.locator('app-visit-add table').first();
  await expect(petTable.locator('td').first()).toHaveText('Samantha');
  await expect(petTable.locator('td').last()).toHaveText('Jean Coleman');

  await page.getByRole('button', { name: 'Open calendar' }).click();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.toLocaleString('en-US', { month: '2-digit' });
  const day = today.toLocaleString('en-US', { day: '2-digit' });
  const expectedDate = `${year}/${month}/${day}`;

  await page.locator('.mat-calendar-body-today').click();
  await expect(page.locator('input[name="date"]')).toHaveValue(expectedDate);

  await page.locator('#description').fill('dermatologists visit');
  await page.getByRole('button', { name: 'Add Visit' }).click();

  const lastVisit = samanthaPetSection.locator('app-visit-list').locator('td').first();
  const expectedLastVisit = `${year}-${month}-${day}`;
  await expect(lastVisit).toHaveText(expectedLastVisit);

  await samanthaPetSection.getByRole('button', { name: 'Add Visit' }).click();

  await page.getByRole('button', { name: 'Open calendar' }).click();
  today.setDate(today.getDate() - 45);
  const expectedYear = today.getFullYear();
  const expectedMonth = (today.getMonth() + 1).toString().toLocaleString('en-US', { month: '2-digit' });
  const expectedDay = today.getDate().toString().toLocaleString('en-US', { day: '2-digit' });
  const expectedDatePrevious = `${expectedYear}/${expectedMonth}/${expectedDay}`;
  const expectedMonthAndYear = `${expectedMonth} ${expectedYear}`;

  let currentMonthAndYear = await page.getByRole('button', { name: 'Choose month and year' }).textContent();

  while (!currentMonthAndYear?.includes(expectedMonthAndYear)) {
    await page.getByRole('button', { name: 'Previous month' }).click();
    currentMonthAndYear = await page.getByRole('button', { name: 'Choose month and year' }).textContent();
  }
  await page.getByText(today.getDate().toString(), { exact: true }).click();

  await page.locator('#description').fill('massage therapy');
  await page.getByRole('button', { name: 'Add Visit' }).click();

  const visitDates = samanthaPetSection.locator('app-visit-list tr > td:first-child');
  const lastVisitDateText = await visitDates.nth(0).innerText();
  const previousVisitDateText = await visitDates.nth(1).innerText();
  const lastVisitDate = new Date(lastVisitDateText.trim());
  const previousVisitDate = new Date(previousVisitDateText.trim());
  expect(lastVisitDate > previousVisitDate).toBeTruthy();

  const samanthaVisitRows = samanthaPetSection.locator('app-visit-list tr');
  await samanthaVisitRows
    .filter({ hasText: 'dermatologists visit' })
    .getByRole('button', { name: 'Delete Visit' })
    .click();
  await samanthaVisitRows.filter({ hasText: 'massage therapy' }).getByRole('button', { name: 'Delete Visit' }).click();

  const visits = samanthaPetSection.locator('app-visit-list');
  await expect(visits.getByRole('cell', { name: 'dermatologists visit' })).toHaveCount(0);
  await expect(visits.getByRole('cell', { name: 'massage therapy' })).toHaveCount(0);
});
