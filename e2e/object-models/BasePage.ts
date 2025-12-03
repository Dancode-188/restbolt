import { type Page, Locator } from '@playwright/test'

export class BasePage {
    constructor(protected page: Page) {
    }

    optionSection: Locator = this.page.locator('#_R_jklrlb_')
    reqBuilderMain: Locator = this.page.locator('#_R_5klrlb_')
    topHeader: Locator = this.page.getByRole('banner')

    protected button(btnName: string): Locator {
        return this.page.getByRole('button', { name: btnName })
    }

    protected fillBlock(input: string): Locator {
        return this.page.getByPlaceholder(input)
    }

    protected async clearall(locator: Locator) {
        await locator.press('Control+A')
        await locator.clear()
    }

}
