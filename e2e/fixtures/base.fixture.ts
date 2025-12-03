import {test as base, type Page} from '@playwright/test'


export const test = base.extend({
    page : async({page},use) => {
        await page.goto('/')
        use(page)
    }
})

export {expect, type Page} from '@playwright/test'