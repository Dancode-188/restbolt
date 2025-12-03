import {type Page, Locator} from '@playwright/test'
import { BasePage } from './BasePage'
import { all } from 'axios'

export class ReqHelpers extends BasePage {
    constructor(page:Page){
        super(page)
    }

    ////TAB
    newTabBtn: Locator = this.reqBuilderMain.getByTitle('new tab')
    closeTabBtn: Locator = this.reqBuilderMain.getByTitle('close tab')
    //HEADERS
    reqHeaderSection: Locator = this.reqBuilderMain.getByRole('button',{name:'Headers'})
    reqAddNewHeader : Locator = this.reqBuilderMain.getByRole('button',{name:'+ Add Header'})
    reqHeaderName   : Locator = this.reqBuilderMain.getByPlaceholder('Header name').last()
    reqHeaderValue  : Locator = this.reqBuilderMain.getByPlaceholder('Header value').last()
    //TESTS
    reqTestSec      : Locator = this.reqBuilderMain.getByRole('button',{name:'Tests'})
    reqTestTextBox  : Locator = this.page.locator('div').filter({has:this.page.getByRole('presentation')})
                                                        .filter({hasText:'Tests (Post-response Script)'}).last()
                                                        .getByRole('textbox')
    //VARIABLE
    reqVariableSection : Locator = this.page.getByRole('button', {name:'Variables', exact: true})
    reqAddNewVariableBtn  : Locator = this.page.getByRole('button', {name:'+ Add New'})
    reqChainVariableSec : Locator = this.page.getByRole('button', {name:'Chain Variables'})
    reqScriptVariableSec : Locator = this.page.getByRole('button',{name: 'Script Variables'})
    reqVariableNameBox : Locator = this.page.getByPlaceholder('Variable name')
    reqVariableValBox  : Locator = this.page.getByPlaceholder('Variable value (strings,')
    reqVariableAddBtn  : Locator = this.page.getByRole('button', {name: 'Add', exact: true})
    reqVariableCancelBtn : Locator = this.page.getByRole('button', {name:'Cancel'})
    reqVariableClearAllBtn : Locator = this.page.getByRole('button', {name:'Clear All'})
    //AUTH HELPER
    authHelperBtn :Locator = this.reqBuilderMain.getByRole('button', {name:'Auth Helper'})
    authHelperCloseBtn : Locator = this.reqBuilderMain.locator('div').filter({hasText: 'Authentication Helper'}).last().getByRole('button') 
    bearerSection : Locator = this.reqBuilderMain.locator('div').filter({hasText: 'Bearer Token'}).last()
    authSection: Locator = this.reqBuilderMain.locator('div').filter({hasText: 'Basic Authentication'}).last()
    apiKeySection: Locator = this.reqBuilderMain.locator('div').filter({hasText: 'API Key'}).last()
    bearerTokenBox:Locator = this.reqBuilderMain.getByPlaceholder('Enter token or {{variable}}')
    bearerTokenAppylyBtn:Locator = this.bearerSection.getByRole('button',{name:'Apply'})
    authUsernameBox:Locator = this.reqBuilderMain.getByPlaceholder('Username')
    authPasswordBox:Locator = this.reqBuilderMain.getByPlaceholder('Password')
    authApplyBtn:Locator = this.authSection.getByRole('button',{name:'Apply'})
    apiKeyHeaderBox:Locator = this.reqBuilderMain.getByPlaceholder('Header name (e.g., X-API-Key')
    apiKeyValueBox:Locator = this.reqBuilderMain.getByPlaceholder('API key value or {{variable}}')
    apiKeyApplyBtn:Locator = this.apiKeySection.getByRole('button',{name:'Apply'})
    

    async openTab(tabName:string) {
        await this.reqBuilderMain.getByRole('button', {name:tabName})
                                .filter({has: this.reqBuilderMain.getByTitle('close tab')}).click()
    }

    // async closeTab(tabName:string) {
    //     await this.reqBuilderMain.getByRole('button', {name:tabName})
    //                             .filter({has: this.page.getByTitle('close tab')})
    //                             .getByTitle('close tab').click()
    // }

    async fillHeader(hName:string, hValue: string) {
        await this.checkIfInheaderSection()  
        await this.reqAddNewHeader.click()
        await this.reqHeaderName.fill(hName)
        await this.reqHeaderValue.fill(hValue)
        
    }

    async checkHeader(hName:string) {
        await this.checkIfInheaderSection()
        const placeHolder :string = (await this.reqHeaderName.getAttribute('placeholder'))!
        const allph =  await this.reqBuilderMain.getByPlaceholder(placeHolder).all()
        for(let i=0; i < allph.length; i++) {
            if(await allph[i].inputValue() == hName) {
                await this.reqBuilderMain.getByRole('checkbox').nth(i).check()
            }
        }
    }
    
    async uncheckHeader(hName:string):Promise<Locator> {
        await this.checkIfInheaderSection()
        let cb: Locator
        const placeHolder :string = (await this.reqHeaderName.getAttribute('placeholder'))!
        const allph =  await this.reqBuilderMain.getByPlaceholder(placeHolder).all()
        for(let i=0; i < allph.length; i++) {
            if(await allph[i].inputValue() == hName) {
                cb = await this.reqBuilderMain.getByRole('checkbox').nth(i)
                await cb.uncheck()
            }
        } return cb
    }
    
    async deleteHeader(hName: string) {
        await this.checkIfInheaderSection()
        const placeholder = (await this.reqHeaderName.getAttribute('placeholder'))!
        const allph = await this.reqBuilderMain.getByPlaceholder(placeholder).all()
        for(let i=0; i< allph.length; i++) {
            if(await allph[i].inputValue() == hName) {
                await this.page.locator('div')
                .filter({has: this.page.getByPlaceholder(placeholder).nth(i)}).last()
                .getByRole('button').nth(i).click()
                break
            }
        }

    }   

    private async checkIfInheaderSection(){
        if(await this.reqAddNewHeader.isHidden()) {
        await this.reqHeaderSection.click()
        } 
    }

    async chainVariableAdd(varName: string, varVal: string) {
        await this.varaibleAddWrapper(this.reqChainVariableSec, varName, varVal)
    }

    async scriptVariableAdd(varName: string, varVal: string) {
        await this.varaibleAddWrapper(this.reqScriptVariableSec, varName, varVal)
    }

    protected async varaibleAddWrapper(varType: Locator, varName:string, varVal:string) {
        await this.checkIfInVariableSection()
        await this.reqAddNewVariableBtn.click()
        await varType.click()
        await this.reqVariableNameBox.fill(varName)
        await this.reqVariableValBox.fill(varVal)
        await this.reqVariableAddBtn.click()
    }

    async chainVariableDelete(varName:string) {
        await this.variableDeleteWrap(this.reqChainVariableSec, varName)
    }

    async scriptVariableDelete(varName:string) {
        await this.variableDeleteWrap(this.reqScriptVariableSec, varName)
    }

    protected async variableDeleteWrap(varType:Locator, varName:string) {
        await this.checkIfInVariableSection()
        await varType.click()
        await varType.isEnabled()
        const varDiv = await this.page.locator('div')
                                        .filter({has: this.page.getByText(varName)})
                                        .filter({has: this.page.getByTitle('delete')})
                                        .last()
        await varDiv.getByTitle('Delete').click()
        await this.reqBuilderMain.locator('button:has-text("Delete"):right-of(:text("cancel"))').click()
    }  
    
    async chainVariableClearAll(){
        await this.variableclearAllWrap(this.reqChainVariableSec)
    }

    async scriptVariableClearAll(){
        await this.variableclearAllWrap(this.reqScriptVariableSec)
    }

    protected async variableclearAllWrap(varType: Locator) {
        await this.checkIfInVariableSection()
        await varType.click()
        await this.reqBuilderMain.getByRole('button', {name: 'Clear All'}).click()
        await this.reqBuilderMain.locator('button:has-text("CLear all"):right-of(:text("cancel"))').click()

    }

    async chainVariableEdit(varName : string, newVal: string) {
        await this.checkIfInVariableSection()
        await this.reqChainVariableSec.click()
        await this.page.locator(`button[title="Edit"]:near(:text("${varName}"))`).click()
        await this.page.locator(`textarea:near(:text("${varName}"))`).fill(newVal)
        await this.page.locator('button:has-text("Save"):left-of(button:has-text("cancel"))').click()
    }

    private async checkIfInVariableSection() {
        if(await this.reqBuilderMain.getByText('Chain Variable').isHidden() ||
            await this.reqBuilderMain.getByText('Script Variable').isHidden()) {
                this.reqVariableSection.click()
            }
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