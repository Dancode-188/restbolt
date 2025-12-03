import {test as base} from './base.fixture'
import { APImodel } from '../object-models/api-model'

interface MyFixtures {
    apiReq : APImodel,
    preHeaders : void,
    preVariables : void
}


export const test = base.extend<MyFixtures>(
    {
        apiReq : async({page},use) => {
            use(new APImodel(page))
        },
        preVariables : async({page, apiReq},use) => {
            await apiReq.chainVariableAdd('chainVar1', 'val1')
            await apiReq.chainVariableAdd('chainVar2', 'val2')
            await apiReq.scriptVariableAdd('scriptVar1', 'val1')
            await apiReq.scriptVariableAdd('scriptVar2', 'val2')
            await use()
        },
        preHeaders  : async ({page, apiReq},use) => {
            const[name1, name2, name3] = ['author1', 'author2','author3']
            const[value1, value2, value3] = ['val1', 'val2', 'val3']
            await apiReq.fillHeader(name1, value1)
            await apiReq.fillHeader(name2, value2)
            await apiReq.fillHeader(name3, value3)
            await use()
        }
    }
)

    

export {expect} from '@playwright/test'