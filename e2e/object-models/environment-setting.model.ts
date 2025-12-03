import { BasePage} from "./BasePage";
import { type Page, Locator } from "@playwright/test";

export class EnvSettings extends BasePage {
    constructor(page:Page) {
        super(page)
    }
    envSec            : Locator = this.page.getByRole('button',{name:'Environment'})
    envDiv            : Locator = this.page.locator('//div')
                                            .filter({has: this.envSec})
                                            .filter({has: this.page
                                            .getByRole('heading',{name:'Environment'})}).last()
    createNewEnvBtn   : Locator = this.envDiv.getByRole('button', {name:'+ New'})
    saveNewEnvBtn     : Locator = this.envDiv.getByRole('button',{name: 'Create'})
    envNameInput        : Locator = this.envDiv.getByPlaceholder('Environment name')
    addEnvVarBtn      : Locator = this.envDiv.getByRole('button', {name:'+ Add'})
    envVarNameInput     : Locator = this.envDiv.getByPlaceholder('Variable name', {exact: true})
    envVarValueInput    : Locator = this.envDiv.getByPlaceholder('Value')
    envVarSaveBtn     : Locator = this.envDiv.getByTitle('Add variable')
    envVarSaveConfirm : Locator = this.envDiv.getByRole('button', {name: 'Save'})
    
    async createNewEnv(envName:string) {
        await this.envSec.click()
        await this.createNewEnvBtn.click()
        await this.envNameInput.fill(envName)
        await this.saveNewEnvBtn.click()
    }

    async addEnvVariable(envName:string , varName:string, varValue: string) {
        await this.envDiv.locator('div', {hasText: envName})
                          .filter({hasText: 'Edit'}).last()
                          .getByRole('button', {name: 'Edit'}).click()
        await this.addEnvVarBtn.click()
        await this.envVarNameInput.fill(varName)
        await this.envVarValueInput.fill(varValue)
        await this.envVarSaveBtn.click()
        await this.envVarSaveConfirm.click()
    }

    async selectEnvironment(envName:string) {
        await this.topHeader.locator('button:right-of(h1:has-text("RestBolt"))').first().click()
        await this.topHeader.getByRole('button',{name:envName})
                         .last()
                         .click()
    }
}