import {test, expect } from '@playwright/test'

test('check creation of new collection', async ({page}) => {
    await page.goto("/")
    await page.getByRole('button',{name: 'Collections'}).click()
    await page.getByRole('button', {name: '+ New'}).click()
    await page.getByPlaceholder('Collection name').fill('New Test Collection')
    await page.getByRole('button',{name: 'Create'}).click()
    await expect(page.getByText('New Test Collection')).toBeVisible()
})