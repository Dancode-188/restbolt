import {test, expect } from '@playwright/test'
import { CollectionModel } from './object-models/collection-model'
import { APImodel } from './object-models/api-model'

test('check creation of new collection', async ({page}) => {
    await page.goto("/")

    //1. make new collection
    const collect = new CollectionModel(page)
    await collect.createCollection('New Test Collection')
    await expect(page.getByText('New Test Collection')).toBeVisible()

    //2. create a new request for collection
    const request = new APImodel(page)
    await request.get('https://jsonplaceholder.typicode.com/todos/1')

    //3. Save the request to collection
    await collect.saveToCollection('Post 1', 'New Test Collection')

    //4. Check if the request got saved in the collection
    await page.locator('div')
              .filter({has: page.getByTitle('Delete collection')})
            //   .filter({hasText: '▼'}).last().click()
            .getByRole('button').filter({hasText:'New Test Collection'}).click()
    await expect(page.getByText('Post 1')).toBeVisible()
})