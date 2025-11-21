import { test, type Page, type Locator } from '@playwright/test'
import { BasePage } from './BasePage'


export class CollectionModel extends BasePage {

    constructor(page: Page) {
        super(page)
    }
    

    async createCollection(colName: string) 
    {
        await this.button('Collections').click()
        await this.button('+ New').click()
        await this.page.getByPlaceholder('Collection name').fill(colName)
        await this.button('Create').click()
    }

    async saveToCollection(postNam: string, collNam: string) 
    {
        await this.page.getByTitle('Save to collection').click()
        // get the collection block
        const collDiv = await this.page.locator('div')
                                       .filter({ hasText: 'Request Name (optional)' })
                                       .filter({ hasText: 'Select Collection' }).last()
        await collDiv.getByRole('textbox').fill(postNam)
        await collDiv.getByRole('button').filter({ hasText: collNam }).click()
        await collDiv.getByLabel('Request Name (optional)').waitFor({ state: 'hidden' })
    }
}
