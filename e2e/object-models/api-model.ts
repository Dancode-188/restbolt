import {type Page, type Locator} from '@playwright/test'

export class APImodel {
        readonly page : Page
        readonly fillUrl:Locator
        readonly sendBtn:Locator
        readonly responseBody : Locator
        readonly reqType : Locator
        readonly reqBody : Locator

    constructor(page:Page) {
        this.page = page
        this.fillUrl = this.page.getByPlaceholder('https://api.example.com/endpoint')
        this.sendBtn = this.page.getByRole('button', {name:'Send'})
        this.responseBody = this.page.locator('div')
                                .filter({hasText:'Body'})
                                .filter({hasText:'Compare'}).last()
                                .getByRole('presentation')
        this.reqType = this.page.getByRole('combobox')
        this.reqBody = this.page.locator('div',{hasText:'Request Body (JSON)',
                                                has: this.page.getByRole('presentation')}).last()
                                .getByRole('textbox') 
    }

    async get(url:string):Promise<string> {
        await this.fillUrl.fill(url)
        await this.reqType.selectOption('GET')
        await this.sendBtn.click()
        let result = await this.responseBody.textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }

    async post(url: string, data : string) {
        await this.fillUrl.fill(url)
        await this.reqType.selectOption('POST')
        await this.reqBody.clear()
        await this.reqBody.clear()
        await this.reqBody.fill(data)
        await this.sendBtn.click()
        let result = await this.responseBody.textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }

    async patch(url: string, data: string) {
        await this.fillUrl.fill(url)
        await this.reqType.selectOption('PATCH')
        await this.reqBody.clear()
        await this.reqBody.clear()
        await this.reqBody.fill(data)
        await this.sendBtn.click()
        let result = await this.responseBody.textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }
}