import {type Page, type Locator} from '@playwright/test'
import { ReqHelpers } from './request-assiters.model' 

export class APImodel extends  ReqHelpers {

    constructor(page:Page) 
        {super(page)
        }

        fillUrl         : Locator = this.reqBuilderMain.getByPlaceholder('https://api.example.com/endpoint')
        sendBtn         : Locator = this.reqBuilderMain.getByRole('button', {name:'Send'})
        responseSec     : Locator = this.page.locator('#_R_9klrlb_')
        responseBody    : Locator = this.responseSec.getByRole('presentation')
        reqType         : Locator = this.reqBuilderMain.getByRole('combobox')
        reqBodySection  : Locator = this.reqBuilderMain.locator('div',{hasText:'Headers'}).getByRole('button',{name: 'Body'})
        reqBody         : Locator = this.reqBuilderMain.locator('div').filter({has: this.page.getByRole('presentation')})
                                                        .filter({hasText:'Request Body (JSON)'}).last()
                                                        .getByRole('textbox') 
        

    async get(url:string):Promise<string> 
    {
        await this.fillUrl.fill(url)
        
        await this.reqType.selectOption('GET')
    }

    async post(url: string, data : string) 
        {await this.apiwrap('POST', url, data)}

    async patch(url: string, data: string) 
        {await this.apiwrap('PATCH', url, data)}

    private async fillRequestBody (data: string) {
        await this.clearall(this.reqBody)
        await this.reqBody.fill(data)
    }

    async getResponseResult(collectionName?:string, reqName?:string) {
        if(collectionName && reqName){
            const neededReq = await this.optionSection.getByRole('button',{name: reqName})
            if (await neededReq.isVisible()) {
                await neededReq.click()
            } else {
                await this.selectReq(collectionName, reqName)
            }
        }
        await this.sendBtn.click()
        await this.page.waitForLoadState('networkidle')
        await this.responseBody.locator('.view-line').last().textContent()
        let result = await this.responseBody.textContent()
        result = result.replace(/\u00A0/g, ' ')
        return result
    }

    private async apiwrap(method:string, url:string, data: string) {{
        await this.fillUrl.fill(url)
        await this.reqType.selectOption(method)
        await this.reqBodySection.click()
        await this.fillRequestBody(data)
        }
    }

    
    async selectReq(collName:string, reqName:string) {
        await this.optionSection.getByRole('button',{name:collName}).click()
        await this.optionSection.getByRole('button',{name: reqName}).click()
    }
}