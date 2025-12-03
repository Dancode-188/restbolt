import {test as base} from './base.fixture'
import { APImodel } from '../object-models/api-model'

interface MyFixtures {
    apiReq : APImodel,

}


export const test = base.extend<MyFixtures>(
    {
        apiReq : async({page},use) => {
            use(new APImodel(page))
        },
    }
)

    

export {expect} from '@playwright/test'