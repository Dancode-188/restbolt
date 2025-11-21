import {test as base} from '@playwright/test'
import { APImodel } from '../object-models/api-model'

interface MyFixtures {
    api : APImodel
}


export const test = base.extend<MyFixtures>(
    {
        api : async({page},use) => {
            use(new APImodel(page))
        }
    })

export {expect} from '@playwright/test'