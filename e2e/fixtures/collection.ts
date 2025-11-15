import {test as base} from '@playwright/test'
import { CollectionModel } from '../object-models/collection-model'
import { APImodel } from '../object-models/api-model'

export const test = base.extend<{collection: CollectionModel, apiReq: APImodel}>
({
    collection : async({page}, use) => {
        await use(new CollectionModel(page))
    },
    apiReq : async ({page},use) => {
        await use(new APImodel(page))
    }
}) 

export { expect} from '@playwright/test'