import {type Locator, type Page} from '@playwright/test'

export class ChainModel {

        page : Page
        chainSection : Locator
        newChainAdd : Locator
        chainName : Locator
        addStep : Locator
        stepName : Locator
        stepUrl : Locator
        extractAdd: Locator
        extractKey: Locator
        extractSave : Locator
        button : Function 
        fillBlock: Function

    constructor(page:Page) {

         this.page = page
         this.button = function (btnName:string):Locator {
                return this.page.getByRole('button', {name : btnName})
         }

         this.fillBlock = function (input:string):Locator {
                return page.getByPlaceholder(input)
         }
         this.chainSection=this.button('Chains')
         this.newChainAdd = this.button('New Chain')
         this.chainName =this.fillBlock('Chain Name')
         
         this.addStep=this.button('Add Step')
         this.stepName=this.fillBlock('Step name')
         this.stepUrl= this.fillBlock('https://api.example.com/endpoint')
         this.extractAdd= this.button('+ Add')
         this.extractKey = this.fillBlock('e.g., userId, postId, commentId')
         this.extractSave= this.button('Add Extraction')
    }

    async addNewChain(chainName:string) {
         await this.chainSection.click()
         await this.newChainAdd.click()
         await this.chainName.fill(chainName)
    }

    async addNewStep(stepName: string, stepNum: number, url: string) {
         await this.addStep.click()
         await this.stepName.nth(stepNum-1).fill(stepName)
         await this.stepUrl.nth(stepNum-1)
              .fill(url)
    }
    async addExtraction(key: string, stepNum:number) {
         await this.extractAdd.nth(stepNum-1).click()
         await this.extractKey.fill(key)
         await this.extractSave.click()
    }
    
    async save() {
        await this.button('Save').nth(0).click()
    }

    async execute(stepName:string ):Promise<Locator>{
        const step = this.page.getByText(stepName)
        const execute = this.page.getByRole('button', {name :'Execute'})
        const filteredDiv= this.page.locator('div')
                        .filter({has:step})
                        .filter({has:execute})
                        .last()
        await filteredDiv.getByRole('button', {name :'Execute'}).click()
        await filteredDiv.getByRole('button', {name : 'View Execution'}).click()
        return await filteredDiv.getByText('COMPLETED')
        
    }
}
 
