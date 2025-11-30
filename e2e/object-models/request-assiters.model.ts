import {type Page, Locator} from '@playwright/test'
import { BasePage } from './BasePage'

export class ReqHelpers extends BasePage {
    constructor(page:Page){
        super(page)
    }
    
    reqHeaderSection: Locator = this.reqBuilderMain.getByRole('button',{name:'Headers'})
    reqAddNewHeader : Locator = this.reqBuilderMain.getByRole('button',{name:'+ Add Header'})
    reqHeaderName   : Locator = this.reqBuilderMain.getByPlaceholder('Header name').last()
    reqHeaderValue  : Locator = this.reqBuilderMain.getByPlaceholder('Header value').last()
    reqTestSec      : Locator = this.reqBuilderMain.getByRole('button',{name:'Tests'})
    reqTestTextBox  : Locator = this.page.locator('div').filter({has:this.page.getByRole('presentation')})
                                                        .filter({hasText:'Tests (Post-response Script)'}).last()
                                                        .getByRole('textbox')
    bearerSection : Locator = this.reqBuilderMain.locator('div').filter({hasText: 'Bearer Token'}).last()
    authSection: Locator = this.reqBuilderMain.locator('div').filter({hasText: 'Basic Authentication'}).last()
    apiKeySection: Locator = this.reqBuilderMain.locator('div').filter({hasText: 'API Key'}).last()
    authHelperBtn :Locator = this.reqBuilderMain.getByRole('button', {name:'Auth Helper'})
    bearerTokenBox:Locator = this.reqBuilderMain.getByPlaceholder('Enter token or {{variable}}')
    bearerTokenAppylyBtn:Locator = this.bearerSection.getByRole('button',{name:'Apply'})
    authUsernameBox:Locator = this.reqBuilderMain.getByPlaceholder('Username')
    authPasswordBox:Locator = this.reqBuilderMain.getByPlaceholder('Password')
    authApplyBtn:Locator = this.authSection.getByRole('button',{name:'Apply'})
    apiKeyHeaderBox:Locator = this.reqBuilderMain.getByPlaceholder('Header name (e.g., X-API-Key')
    apiKeyValueBox:Locator = this.reqBuilderMain.getByPlaceholder('API key value or {{variable}}')
    apiKeyApplyBtn:Locator = this.apiKeySection.getByRole('button',{name:'Apply'})

    
    async fillHeader(hName:string, hValue: string) {
        await this.reqHeaderSection.click()
        await this.reqAddNewHeader.click()
        await this.reqHeaderName.fill(hName)
        await this.reqHeaderValue.fill(hValue)
    }
    
    async writeTest(testData:string) {
        await this.reqTestSec.click()
        await this.clearall(this.reqTestTextBox)
        await this.reqTestTextBox.fill(testData)
    }

    async fillBearToken(token:string) {
        await this.authHelperBtn.click()
        await this.bearerTokenBox.fill(token)
        await this.bearerTokenAppylyBtn.click()
    }

    async fillAuthUsernamePsswd(userName: string, password: string) {
        await this.authHelperBtn.click()
        await this.authUsernameBox.fill(userName)
        await this.authPasswordBox.fill(password)
        await this.authApplyBtn.click()
    }

    async fillApiKey(header: string, value: string) {
        await this.authHelperBtn.click()
        await this.apiKeyHeaderBox.fill(header)
        await this.apiKeyValueBox.fill(value)
        await this.apiKeyApplyBtn.click()
    }

}  