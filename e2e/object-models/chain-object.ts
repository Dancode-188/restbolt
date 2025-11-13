import { type Locator, type Page } from '@playwright/test'

export interface Parent {
     page: Page
}

export function buttonFn(this: Parent, btnName: string): Locator {
     //only use this function inside a class with this.page
     return this.page.getByRole('button', { name: btnName })
}
export class ChainModel {

     page: Page
     chainSection: Locator
     newChainAdd: Locator
     chainName: Locator
     addStep: Locator
     stepName: Locator
     stepUrl: Locator
     extractAdd: Locator
     extractKey: Locator
     extractSave: Locator
     button: Function
     fillBlock: Function

     constructor(page: Page) {

          this.page = page
          this.button = buttonFn.bind(this)

          this.fillBlock = function (input: string): Locator {
               return page.getByPlaceholder(input)
          }
          this.chainSection = this.button('Chains')
          this.newChainAdd = this.button('New Chain')
          this.chainName = this.fillBlock('Chain Name')

          this.addStep = this.button('Add Step')
          this.stepName = this.fillBlock('Step name')
          this.stepUrl = this.fillBlock('https://api.example.com/endpoint')
          this.extractAdd = this.button('+ Add')
          this.extractKey = this.fillBlock('e.g., userId, postId, commentId')
          this.extractSave = this.button('Add Extraction')
     }



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
          const coll = await this.page.getByText(collName, {exact: true})
          const execute = await this.page.getByRole('button', { name: 'Execute' })
          const collDiv = await this.page.locator('div')
               .filter({ has: coll })
               .filter({ has: execute })
               .last()
          return collDiv
     }
}

