import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://petclinic.bondaracademy.com/');
  await page.getByRole('link', { name: 'Pet Types' }).click();
  //2. Add assertion of the "Pet Types" text displayed above the table with the list of pet types
  await expect(page.getByRole('heading', { name: 'Pet Types' })).toHaveText('Pet Types');
});


test('Validate selected specialties', async ({ page }) => {
// 1. Select the VETERINARIANS menu item in the navigation bar, then select "All"
// 2. Add assertion of the "Veterinarians" text displayed above the table with the list of Veterinarians
// 3. Select the veterinarian "Helen Leary" and click "Edit Vet" button
// 4. Add assertion of the "Specialties" field. The value "radiology" is displayed
// 5. Click on the "Specialties" drop-down menu
// 6. Add assertion that "radiology" specialty is checked
// 7. Add assertion that "surgery" and "dentistry" specialties are unchecked
// 8. Check the "surgery" item specialty and uncheck the "radiology" item speciality 
// 9. Add assertion of the "Specialties" field displayed value "surgery"
// 10. Check the "dentistry" item specialty
// 11. Add assertion of the "Specialties" field. The value "surgery, dentistry" is displayed


});

test('Select all specialties', async ({ page }) => {
// 1. Select the VETERINARIANS menu item in the navigation bar, then select "All"
// 2. Select the veterinarian "Rafael Ortega" and click "Edit Vet" button
// 3. Add assertion that "Specialties" field is displayed value "surgery"
// 4. Click on the "Specialties" drop-down menu
// 5. Check all specialties from the list
// 6. Add assertion that all specialties are checked
// 7. Add assertion that all checked specialities are displayed in the "Specialties" field
});

test('Unselect all specialties', async ({page}) => {
// 1. Select the VETERINARIANS menu item in the navigation bar, then select "All"
// 2. Select the veterinarian "Linda Douglas" and click "Edit Vet" button
// 3. Add assertion of the "Specialties" field displayed value "surgery, dentistry"
// 4. Click on the "Specialties" drop-down menu
// 5. Uncheck all specialties from the list
// 6. Add assertion that all specialties are unchecked
// 7. Add assertion that "Specialties" field is empty
})
