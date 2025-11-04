import {expect, test} from '@playwright/test'

test('checking chain execution', async ({page}) => {
    await page.goto('/')
    await page.getByRole('button',{name : 'Chains'}).click()
    await page.getByRole('button',{name: 'New Chain'}).click()
    await page.getByPlaceholder('Chain Name').fill('User Chain')
    await page.getByRole('button',{name: 'Add Step'}).click()
    await page.getByPlaceholder('Step name').clear()
    await page.getByPlaceholder('Step name').fill('Step 1')
    await page.getByPlaceholder('https://api.example.com/endpoint').first()
              .fill('https://jsonplaceholder.typicode.com/users/1')
    await page.getByRole('button', {name : '+ Add'}).click()
    await page.waitForTimeout(400) //same as below without this it fails
    //also chain step  one naming seems to revert back no idea why
    await page.getByPlaceholder('e.g., userId, postId, commentId').fill('userId')
    await page.getByRole('button', {name : 'Add Extraction'}).click()
    await page.getByRole('button',{name: 'Add Step'}).click()
    
    await page.getByPlaceholder('Step name').nth(1).clear()
    await page.getByPlaceholder('Step name').nth(1).fill('Step 2')
    await page.getByPlaceholder('https://api.example.com/endpoint').nth(1)
              .fill('https://jsonplaceholder.typicode.com/posts?userId={{userId}}')
    await page.waitForTimeout(320) // there seems to be some error with loading
    // it runs normal in debug and trace mode, 
    await page.getByPlaceholder('Description (optional)').click()
    await page.getByRole('button', {name: 'Save'}).nth(0).click()
    await page.getByRole('button', {name :'Execute'}).click()
    await page.getByRole('button', {name : 'View Execution'}).click()
    await page.getByText('Recent Executions')
    await expect(page.locator('.space-y-2').first()).toContainText(['COMPLETED'])


})