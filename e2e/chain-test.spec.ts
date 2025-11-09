import {expect, test} from '@playwright/test'
import { ChainModel } from './object-models/chain-object'



test('checking chain execution', async ({page}) => {
    // 1. go to page
    await page.goto('/')
    // 2. add new chain
    const chain = new ChainModel(page)
    await chain.addNewChain('User Chain')
    // 3. add steps to chain
    await chain.addNewStep('Step 1',1, 'https://jsonplaceholder.typicode.com/users/1')
    await chain.addExtraction('userId', 1)
    await chain.addNewStep('Step 2', 2, 'https://jsonplaceholder.typicode.com/posts?userId={{userId}}')
    await chain.save()
    //4. check if collection saved
    await expect(await chain.execute('User Chain')).toContainText('COMPLETED')
    
})

