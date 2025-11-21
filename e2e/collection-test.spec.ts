import {test, expect} from './fixtures/collection' 

test('check creation of new collection', async ({collection, apiReq ,page}) => {
    const collectionName = 'New Test Collection'
    
    await page.goto("/")

    //1. make new collection
    await collection.createCollection(collectionName)
    await expect(page.getByText(collectionName)).toBeVisible()

    //2. create a new request for collection
    await apiReq.get('https://jsonplaceholder.typicode.com/todos/1')

    //3. Save the request to collection
    await collection.saveToCollection('Post 1', collectionName)

    //4. Check if the request got saved in the collection
    await page.locator('div')
              .filter({has: page.getByTitle('Delete collection')})
              .getByRole('button').filter({hasText:collectionName}).click()
    await expect(page.getByText('Post 1')).toBeVisible()
})