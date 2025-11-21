import {test, expect} from './fixtures/chain.fixtures'

test('checking chain execution', async ({singleChain}) => {
    await expect(await singleChain.execute('User Chain')).toContainText('COMPLETED')   
})

test('can user delete chain', async ({singleChain}) => {
    await singleChain.execute('User Chain')
    await singleChain.delete('User Chain')
    await expect(await singleChain.getCollection('User Chain')).toBeVisible({visible:false})
})

test('can user add multiple chains', async ({multiChain}) =>{
    for(let i=1; i<11; i++) {
        await expect((await multiChain.getCollection(`User Chain ${i}`)).getByText(`User Chain ${i}`)).toBeVisible()
    }
})

test('can user delete multiple chains', async ({multiChain}) => {
    for(let i=1; i<11; i++) {
        await multiChain.delete(`User Chain ${i}`)
        await expect((await multiChain.getCollection(`User Chain ${i}`)).getByText(`User Chain ${i}`))
        .toBeVisible({visible: false})
    }
})
