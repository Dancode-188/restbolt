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

     async execute(chainName: string): Promise<Locator> {
          const chainDiv = await this.getCollection(chainName)
          await chainDiv.getByRole('button', { name: 'Execute' }).click()
          await chainDiv.getByRole('button', { name: 'View Execution' }).click()
          await chainDiv.getByText('COMPLETED').waitFor({ state: 'attached' })
          return await chainDiv.getByText('COMPLETED')
     }

     async delete(chainNam: string) {
          const chainDiv= await this.getCollection(chainNam)
          await chainDiv.getByRole('button', {name:'Delete'}).click()
          await this.page.locator('div',
               {hasText:`you want to delete "${chainNam}"?`})
               .last()
               .getByRole('button',{name: 'Delete'}).click()
     }

     async getCollection(chainName: string): Promise<Locator> {
          const chain    = await this.page.getByText(chainName, {exact: true})
          const execute = await this.page.getByRole('button', { name: 'Execute' })
          const chainDiv = await this.page.locator('div')
               .filter({ has: chain })
               .filter({ has: execute })
               .last()
          return chainDiv
     }
}

