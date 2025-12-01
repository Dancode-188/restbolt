import {test as base} from '@playwright/test'
import { CollectionModel } from '../object-models/collection-model'
import { APImodel } from '../object-models/api-model'
import { EnvSettings } from '../object-models/environment-setting.model' 

export const test = base.extend<{
    collection: CollectionModel, 
    apiReq: APImodel,
    envSetup : EnvSettings
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
    }
}) 

export { expect} from '@playwright/test'