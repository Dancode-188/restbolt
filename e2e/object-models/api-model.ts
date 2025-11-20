import {type Page, type Locator} from '@playwright/test'
import { BasePage } from './BasePage'

export class APImodel extends  BasePage {

    constructor(page:Page) 
        {super(page)
        }

        fillUrl      : Locator = this.page.getByPlaceholder('https://api.example.com/endpoint')
        sendBtn      : Locator = this.page.getByRole('button', {name:'Send'})
        responseBody : Locator = this.page.locator('div').filter({hasText:'Body'}) 
                                                         .filter({hasText:'Compare'}).last()                   
                                                         .getByRole('presentation')
        reqType      : Locator = this.page.getByRole('combobox')
        reqBody      : Locator = this.page.locator('div',{hasText:'Request Body (JSON)',
                                                has: this.page.getByRole('presentation')})
                                            .last()
                                            .getByRole('textbox') 

    async get(url:string):Promise<string> 
    {
        await this.fillUrl.fill(url)
        
        await this.reqType.selectOption('GET')
        await this.sendBtn.click()
        return await this.getResponseResult()
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
        await this.clearall(this.reqBody)
        await this.reqBody.fill(data)
    }

    private async getResponseResult() 
    {
        await this.page.waitForLoadState('domcontentloaded')
        await this.responseBody.locator('.view-line').last().textContent()
        let result = await this.responseBody.textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }
    
}