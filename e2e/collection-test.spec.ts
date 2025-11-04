import {test, expect } from '@playwright/test'

test('check creation of new collection', async ({page}) => {
    await page.goto("/")
    await page.getByRole('button',{name: 'Collections'}).click()
    await page.getByRole('button', {name: '+ New'}).click()
    await page.getByPlaceholder('Collection name').fill('New Test Collection')
    await page.getByRole('button',{name: 'Create'}).click()
    await expect(page.getByText('New Test Collection')).toBeVisible()
    //can use object model here
    await page.getByPlaceholder('https://api.example.com/endpoint').fill('https://jsonplaceholder.typicode.com/todos/1')
    await page.getByRole('button', {name:'Send'}).click()
    await page.getByTitle('Save to collection').click()
    await page.getByPlaceholder('GET https://jsonplaceholder.typicode.com/todos/1')
              .fill('Post 1')
    await page.getByRole('button', {name:'New Test Collection 0 requests'}).click()
    await page.getByRole('button', { name: '▶ New Test Collection (1)' }).click()
    await expect(page.getByText('Post 1')).toBeVisible()
})