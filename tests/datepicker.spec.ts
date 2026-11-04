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
  await page.getByRole('textbox', { name: 'Name' }).fill('Tom');
  await expect(page.locator('.form-group', { has: page.locator('#name') }).locator('.glyphicon-ok')).toBeVisible();

  await page.getByRole('button', { name: 'Open calendar' }).click();
  await page.getByRole('button', { name: 'Choose month and year' }).click();
  await page.getByRole('button', { name: 'Previous 24 years' }).click();
  await page.getByRole('button', { name: '2014' }).click();
  await page.getByRole('button', { name: '05' }).click();
  await page.getByRole('button', { name: '/05/02' }).click();

  await expect(page.locator('input[name="birthDate"]')).toHaveValue('2014/05/02');

  await page.getByLabel('Type').selectOption('dog');
  await page.getByRole('button', { name: 'Save Pet' }).click();

  const tomPetSection = page.locator('app-pet-list').filter({ has: page.getByRole('cell', { name: 'Tom' }) });
  await expect(tomPetSection.getByRole('cell', { name: 'Tom' })).toBeVisible();
  await expect(tomPetSection.getByRole('cell', { name: '2014-05-02' })).toBeVisible();
  await expect(tomPetSection.getByRole('cell', { name: 'dog' })).toBeVisible();

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

  const openCalendarButton = page.getByRole('button', { name: 'Open calendar' });
  const calendarDate = page.locator('input[name="date"]');
  await openCalendarButton.click();
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const expectedDate = `${year}/${month}/${day}`;

  await page.locator('.mat-calendar-body-today').click();
  await expect(calendarDate).toHaveValue(expectedDate);

  await page.locator('#description').fill('dermatologists visit');
  await page.getByRole('button', { name: 'Add Visit' }).click();

  const lastVisit = samanthaPetSection.locator('app-visit-list').locator('td').first();
  const expectedLastVisit = `${year}-${month}-${day}`;
  await expect(lastVisit).toHaveText(expectedLastVisit);

  await samanthaPetSection.getByRole('button', { name: 'Add Visit' }).click();

  await openCalendarButton.click();
  const chosenDay = new Date();
  chosenDay.setDate(chosenDay.getDate() - 45);
  const expectedYear = chosenDay.getFullYear();
  const expectedMonth = (chosenDay.getMonth() + 1).toString().padStart(2, '0');
  const expectedDay = chosenDay.getDate().toString().padStart(2, '0');
  const expectedDatePrevious = `${expectedYear}/${expectedMonth}/${expectedDay}`;
  const expectedMonthAndYear = `${expectedMonth} ${expectedYear}`;

  let currentMonthAndYear = await page.locator('.mat-calendar-period-button').textContent();

  while (!currentMonthAndYear?.includes(expectedMonthAndYear)) {
    await page.getByRole('button', { name: 'Previous month' }).click();
    currentMonthAndYear = await page.locator('.mat-calendar-period-button').textContent();
  }
  await page.locator('.mat-calendar-body-cell-content').getByText(chosenDay.getDate().toString()).click();

  await page.locator('#description').fill('massage therapy');
  await page.getByRole('button', { name: 'Add Visit' }).click();

  const visitDates = samanthaPetSection.locator('app-visit-list tr > td:first-child');
  const lastVisitDateText = await visitDates.nth(0).innerText();
  const previousVisitDateText = await visitDates.nth(1).innerText();
  const lastVisitDate = new Date(lastVisitDateText.trim());
  const previousVisitDate = new Date(previousVisitDateText.trim());
  expect(lastVisitDate > previousVisitDate).toBeTruthy();

  await samanthaPetSection.getByRole('button', { name: 'Delete Visit' }).first().click();
  await samanthaPetSection.getByRole('button', { name: 'Delete Visit' }).nth(1).click();

  const visits = samanthaPetSection.locator('app-visit-list');
  await expect(visits.getByRole('cell', { name: 'dermatologists visit' })).toHaveCount(0);
  await expect(visits.getByRole('cell', { name: 'massage therapy' })).toHaveCount(0);
});
