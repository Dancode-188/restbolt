import {test as base, type Page} from '@playwright/test'


export const test = base.extend<{},{throtle:void}>({
    throtle : [ async({},use) => {
                        console.log('!!using new worker!')
            use()
        
    }, {scope:'worker'}],

    page : async({page},use) => {
        if(process.env.THROTLE) {
                    (async () => {
                        const context = await page.context()
                        const cdpSession = await context.newCDPSession(page);
                        await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 3 });
        
                    })()
                }
        await page.goto('/')
        await use(page)
    },


})

export {expect, type Page} from '@playwright/test'