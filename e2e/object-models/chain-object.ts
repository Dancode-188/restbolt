import { type Locator, type Page } from '@playwright/test'

export interface Parent {
     page: Page
}

export function buttonFn(this: Parent, btnName: string): Locator {
     //only use this function inside a class with this.page
     return this.page.getByRole('button', { name: btnName })
}
export class ChainModel {

     constructor(readonly page: Page) {}
          button       : Function = buttonFn.bind(this)

          fillBlock    : Function = function (this: ChainModel ,input: string): Locator {
               return this.page.getByPlaceholder(input)
          }
          chainSection : Locator  = this.button('Chains')
          newChainAdd  : Locator  = this.button('New Chain')
          chainName    : Locator  = this.fillBlock('Chain Name')
 
          addStep      : Locator  = this.button('Add Step')
          stepName     : Locator  = this.fillBlock('Step name')
          stepUrl      : Locator  = this.fillBlock('https://api.example.com/endpoint')
          extractAdd   : Locator  = this.button('+ Add')
          extractKey   : Locator  = this.fillBlock('e.g., userId, postId, commentId')
          extractSave  : Locator  = this.button('Add Extraction')



     async addNewChain(chainName: string) {
          await this.chainSection.click()
          await this.newChainAdd.click()
          await this.chainName.fill(chainName)
     }

     async addNewStep(stepName: string, stepNum: number, url: string) {
          await this.addStep.click()
          await this.stepName.nth(stepNum - 1).fill(stepName)
          await this.stepUrl.nth(stepNum - 1)
               .fill(url)
     }
     async addExtraction(key: string, stepNum: number) {
          await this.extractAdd.nth(stepNum - 1).click()
          await this.extractKey.fill(key)
          await this.extractSave.click()
     }

     async save() {
          await this.button('Save').nth(0).click()
     }

     async execute(collName: string): Promise<Locator> {
          const collDiv = await this.getCollection(collName)
          await this.page.waitForTimeout(500)
          await collDiv.getByRole('button', { name: 'Execute' }).click()
          await collDiv.getByRole('button', { name: 'View Execution' }).click()
          await collDiv.getByText('COMPLETED').waitFor({ state: 'attached' })
          return await collDiv.getByText('COMPLETED')
     }

     async delete(collNam: string) {
          const collDIv= await this.getCollection(collNam)
          await collDIv.getByRole('button', {name:'Delete'}).click()
          await this.page.locator('div',
               {hasText:`you want to delete "${collNam}"?`})
               .last()
               .getByRole('button',{name: 'Delete'}).click()
     }

     async getCollection(collName: string): Promise<Locator> {
          const coll    = await this.page.getByText(collName, {exact: true})
          const execute = await this.page.getByRole('button', { name: 'Execute' })
          const collDiv = await this.page.locator('div')
               .filter({ has: coll })
               .filter({ has: execute })
               .last()
          return collDiv
     }
}

