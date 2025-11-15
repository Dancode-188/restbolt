import {type Page, type Locator} from '@playwright/test'

export class APImodel {

    constructor(protected page:Page) {}
        fillUrl      : Locator = this.page.getByPlaceholder('https://api.example.com/endpoint')
        sendBtn      : Locator = this.page.getByRole('button', {name:'Send'})
        responseBody : Locator = this.page.locator('div').filter({hasText:'Body'}) 
                                                         .filter({hasText:'Compare'}).last()                   
                                                         .getByRole('presentation')
        reqType      : Locator = this.page.getByRole('combobox')
        reqBody      : Locator = this.page.locator('div',{hasText:'Request Body (JSON)',
                                                has: this.page.getByRole('presentation')}).last()
                                .getByRole('textbox') 

    async get(url:string):Promise<string> 
    {
        await this.fillUrl.fill(url)
        await this.reqType.selectOption('GET')
        await this.sendBtn.click()
        await this.page.waitForLoadState('load')
        let result = await this.responseBody.textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }

    async post(url: string, data : string) 
    {
        await this.fillUrl.fill(url)
        await this.reqType.selectOption('POST')
        await this.fillRequestBody(data)
        await this.sendBtn.click()
        return await this.getResponseResult()
    }

    async patch(url: string, data: string) 
    {
        await this.fillUrl.fill(url)
        await this.reqType.selectOption('PATCH')
        await this.fillRequestBody(data)
        await this.sendBtn.click()
        return await this.getResponseResult()
    }

    private async fillRequestBody (data: string) 
    {
        await this.reqBody.clear()
        await this.reqBody.clear()
        await this.reqBody.fill(data)
    }

    private async getResponseResult() 
    {
        let result = await this.responseBody.textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }
    
}