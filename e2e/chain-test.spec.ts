import {expect, test} from '@playwright/test'
import { ChainModel } from './object-models/chain-object'
import { channel } from 'diagnostics_channel'



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

test('can user delete chain', async ({page}) => {
     await page.goto('/')
    // 2. add new chain
    const chain = new ChainModel(page)
    await chain.addNewChain('Demo User Chain')
    // 3. add steps to chain
    await chain.addNewStep('Step 1',1, 'https://jsonplaceholder.typicode.com/users/1')
    await chain.addExtraction('userId', 1)
    await chain.addNewStep('Step 2', 2, 'https://jsonplaceholder.typicode.com/posts?userId={{userId}}')
    await chain.save()
    await chain.execute('Demo User Chain')
    await chain.delete('Demo User Chain')
    await expect(await chain.getCollection('Demo User Chain')).toBeVisible({visible:false})
})

test('can user add multiple chains', async ({page}) =>{
    await page.goto('/')
    const chain = new ChainModel(page)
    for(let i=1; i<11; i++) {
        await chain.addNewChain(`User Chain ${i}`)
        await chain.addNewStep('Step 1', 1, `https://jsonplaceholder.typicode.com/users/${i}`)
        await chain.save()
    }

    for(let i=1; i<11; i++) {
        await expect((await chain.getCollection(`User Chain ${i}`)).getByText(`User Chain ${i}`)).toBeVisible()
    }
})

test('can user delete multiple chains', async ({page}) => {
    await page.goto('/')
    const chain = new ChainModel(page)
    for(let i=1; i<11; i++) {
        await chain.addNewChain(`User Chain ${i}`)
        await chain.addNewStep(`Step 1`, 1, `https://jsonplaceholder.typicode.com/users/${i}`)
        await chain.save()
    }

    for(let i=1; i<11; i++) {
        await chain.delete(`User Chain ${i}`)
        await expect((await chain.getCollection(`User Chain ${i}`)).getByText(`User Chain ${i}`))
        .toBeVisible({visible: false})
    }
})
