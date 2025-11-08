import {type Page, type Locator} from '@playwright/test'

export class APImodel {
        readonly page : Page
        readonly fillUrl:Locator
        readonly sendBtn:Locator
        readonly reqBody : Locator
        readonly reqType : Locator

    constructor(page:Page) {
        this.page = page
        this.fillUrl = this.page.getByPlaceholder('https://api.example.com/endpoint')
        this.sendBtn = this.page.getByRole('button', {name:'Send'})
        this.reqBody = this.page.getByRole('presentation')
        this.reqType = this.page.getByRole('combobox')
    }

    async get(url:string):Promise<string> {
        await this.fillUrl.fill(url)
        await this.reqType.selectOption('GET')
        await this.sendBtn.click()
        let result = await this.page.getByRole('presentation').textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }
        
}