import {test, type Page, type Locator} from '@playwright/test'
import { buttonFn} from './chain-object'


export class CollectionModel{
    readonly page : Page
    private button : Function

    constructor (page: Page) {
        this.page= page
        this.button = buttonFn.bind(this)
    
    }
    async createCollection(colName:string) {
    await this.button('Collections').click()
    await this.button('+ New').click()
    await this.page.getByPlaceholder('Collection name').fill(colName)
    await this.button('Create').click()
    }

    async saveToCollection(postNam:string, collNam:string) {
        await this.page.getByTitle('Save to collection').click()

        const collDiv = await this.page.locator('div')
                        .filter({hasText:'Request Name (optional)'})
                        .filter({hasText:'Select Collection'}).last()

        await collDiv.getByRole('textbox').fill(postNam)
        await collDiv.getByRole('button').filter({hasText:collNam}).click()
        await collDiv.getByLabel('Request Name (optional)').waitFor({state:'hidden'})
    }   
}
 