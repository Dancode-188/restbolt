import {test as base } from '@playwright/test'
import {ChainModel}  from '../object-models/chain-object'

interface myFixtures {
    singleChain: ChainModel,
    multiChain : ChainModel
}

export const test = base.extend<myFixtures>
({
    singleChain : async ({page},use) => {
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
            await use(chain)
        
    },

    multiChain : async({page},use) => {
            await page.goto('/')
            const chain = new ChainModel(page)
            for(let i=1; i<11; i++) {
                await chain.addNewChain(`User Chain ${i}`)
                await chain.addNewStep('Step 1', 1, `https://jsonplaceholder.typicode.com/users/${i}`)
                await chain.save()
            }
            await use(chain)
    }


})  

export {expect} from '@playwright/test'
