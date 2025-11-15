import {test, expect} from './fixtures/collection' 

test('check creation of new collection', async ({collection, apiReq ,page}) => {
    await page.goto("/")

    //1. make new collection
    await collection.createCollection('New Test Collection')
    await expect(page.getByText('New Test Collection')).toBeVisible()

    //2. create a new request for collection
    await apiReq.get('https://jsonplaceholder.typicode.com/todos/1')

    //3. Save the request to collection
    await collection.saveToCollection('Post 1', 'New Test Collection')

    //4. Check if the request got saved in the collection
    await page.locator('div')
              .filter({has: page.getByTitle('Delete collection')})
              .getByRole('button').filter({hasText:'New Test Collection'}).click()
    await expect(page.getByText('Post 1')).toBeVisible()
})