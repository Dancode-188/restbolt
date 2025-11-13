import {expect, test} from '@playwright/test'
import { ChainModel } from './object-models/chain-object'



test('checking chain execution', async ({page}) => {
    await page.goto('/')
    const chain = new ChainModel(page)
    await chain.addNewChain('User Chain')
    await chain.addNewStep('Step 1',1, 'https://jsonplaceholder.typicode.com/users/1')
    await chain.addExtraction('userId', 1)
    await chain.addNewStep('Step 2', 2, 'https://jsonplaceholder.typicode.com/posts?userId={{userId}}')
    await chain.save()
    await expect(await chain.execute('User Chain')).toContainText('COMPLETED')
    
})

