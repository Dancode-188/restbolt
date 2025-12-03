import {test as base} from '@playwright/test'
import { CollectionModel } from '../object-models/collection-model'
import { APImodel } from '../object-models/api-model'
import { EnvSettings } from '../object-models/environment-setting.model'

export const test = base.extend<{
    collection: CollectionModel, 
    apiReq: APImodel,
    envSetup : EnvSettings,
    singleCollection: any
}>
({
    collection : async({page}, use) => {
        await use(new CollectionModel(page))
    },
    apiReq : async ({page},use) => {
        await use(new APImodel(page))
    },
    envSetup: async({page},use) => {
        use(new EnvSettings(page))
    },
    singleCollection : async({collection, apiReq, page},use) => {
        await page.goto('/')
        await collection.createCollection('User Collection')
        await apiReq.get('https://jsonplaceholder.typicode.com/todos/1')
        await collection.saveToCollection('Req 1', 'User Collection')
        await use(page)
    }

}) 

export { expect} from '@playwright/test'