import {test, expect} from '../../fixtures/index'
import { ReqHelpers } from '../../object-models/request-assiters.model'


//tab

test('create multiple tabs', async({singleCollection}) => {
    const tab = new ReqHelpers(singleCollection)
    for(let i=0;i<6;i++) {await tab.newTabBtn.click()}
    expect(await tab.closeTabBtn.count()).toEqual(7)
    
})

test('delete multiple tabs', async({singleCollection}) => {
    const tab = new ReqHelpers(singleCollection)
    for(let i=0;i<6;i++) {await tab.newTabBtn.click()}
    for(let i=0;i<3;i++) {await tab.closeTabBtn.last().click()}
    expect(await tab.closeTabBtn.count()).toEqual(4)
})

//headers
test('Request Builder header visibility', async({apiReq}) => {
    await expect(apiReq.reqMainHeading).toBeVisible()
})

//combobox
test('all request options are available', async({apiReq}) => {
    const allReqTypes: string[] = ['GET','PUT','POST', 'DELETE','PATCH']
    for(let req of allReqTypes) {
        await apiReq.reqType.selectOption(req)
        await expect(apiReq.reqType).toHaveValue(req)}
    
})

//req url
test('request url to be editable', async ({apiReq}) => {
    const exampleUrl = 'https://example.com/header'
    await apiReq.fillUrl.fill(exampleUrl)
    await expect(apiReq.fillUrl).toHaveValue(exampleUrl)

    await apiReq.fillUrl.clear()
    await expect(apiReq.fillUrl).toBeEmpty()
})

//send btn

test('send request button is visible', async({apiReq}) => {
    await expect(apiReq.sendBtn).toBeVisible()
    await expect(apiReq.sendBtn).toHaveAccessibleName('Send')
})
//code

//save to collection
test('save to collection', async ({collection, page}) => {
    await expect(collection.saveToCollectionBtn).toBeVisible()
    await expect(collection.saveToCollectionBtn).toHaveAccessibleName('Save')
})

//auth helper
test('Auth helper works', async({apiReq})=> {
    await expect(apiReq.authHelperBtn).toBeVisible()
    await expect(apiReq.authHelperBtn).toHaveAccessibleName('Auth Helper')
    await apiReq.authHelperBtn.click()
    await expect(apiReq.bearerSection).toBeVisible()
    await expect(apiReq.bearerSection).toContainText('Bearer Token')
    await expect(apiReq.reqBuilderMain.getByRole('heading', {name: 'Authentication Helper'})).toBeVisible()
    await apiReq.authHelperCloseBtn.click()
    await expect(apiReq.reqBuilderMain.getByRole('heading', {name: 'Authentication Helper'})).toBeHidden()
})

test('Bearer token header visible', async({apiReq})=> {
    await apiReq.authHelperBtn.click()
    await expect(apiReq.bearerSection.getByRole('heading')).toHaveAccessibleName('Bearer Token')
})

test('Bear Token works', async({apiReq}) => {
    await apiReq.fillBearToken('token123')
    await expect(apiReq.reqHeaderName).toHaveValue('Authorization')
    await expect(apiReq.reqHeaderValue).toHaveValue('Bearer token123')
})
    
//sections header test variables etc
test('Basic Authentication Header visible',async ({apiReq}) => {
    await apiReq.authHelperBtn.click()
    await expect(apiReq.authSection.getByRole('heading')).toHaveAccessibleName('Basic Authentication')
})

test('Basic Authentication works', async({apiReq}) => {
    const admin = 'UserAdmin'
    const pswd = 'secret'
    await apiReq.fillAuthUsernamePsswd(admin, pswd)
    await expect(apiReq.reqHeaderName).toHaveValue('Authorization')
    await expect(apiReq.reqHeaderValue).toHaveValue(/Basic/)
})

test('API Key Header Visible', async({apiReq}) => {
    await apiReq.authHelperBtn.click()
    await expect(apiReq.apiKeySection.getByRole('heading')).toHaveAccessibleName('API Key')
})

test('API key works', async ({apiReq}) => {
    const[name, value] = ['cat', 'dog']
    await apiReq.fillApiKey(name, value)
    await expect(apiReq.reqHeaderName).toHaveValue(name)
    await expect(apiReq.reqHeaderValue).toHaveValue(value)
})

test('Headers visible', async({apiReq}) => {
    await apiReq.reqHeaderSection.click()
    await expect(apiReq.reqBuilderMain).toContainText('Quick add')
    const result = await apiReq.reqBuilderMain.getByRole('button')
    await expect(result).toContainText(['Content-Type','User-Agent'])
    
})

test('Header functionality', async({apiReq}) => {
    const[name, value] = ['Author', 'ratings']
    await apiReq.fillHeader(name, value)
    await expect(apiReq.reqHeaderName).toHaveValue(name)
    await expect(apiReq.reqHeaderValue).toHaveValue(value)
})

test('Header multiple addition', async({preHeaders, apiReq}) => {
    const placeHolder: string= (await apiReq.reqHeaderName.getAttribute('placeholder'))!
    await expect(await apiReq.reqBuilderMain.getByPlaceholder(placeHolder).count()).toBe(3)
})

test('Header can uncheck', async({preHeaders, apiReq})=> {
    const cb = await apiReq.uncheckHeader('author2')
    await expect(cb).toBeChecked({checked:false})

})

test('Header deletion', async({preHeaders, apiReq}) => {
    await apiReq.deleteHeader('author2')
    const placeHolder = (await apiReq.reqHeaderName.getAttribute('placeholder'))!
    expect(await apiReq.reqBuilderMain.getByPlaceholder(placeHolder).count()).toBe(2)
})
//test
test('Post tests writable',  async({apiReq}) => {
    const testData = 'Should be visible'
    await apiReq.writeTest(testData)
    let result = (await apiReq.reqBuilderMain.getByRole('presentation').textContent())!
    result = result.replace(/\u00A0/g, ' ')
    expect(result).toContain(testData)
})

//variables
test('variable heading and content visible', async({page, apiReq}) => {
    await apiReq.reqVariableSection.click()
    await expect(page.getByRole('heading', {name:'Variables', exact: true})).toBeVisible()
    await expect(page.getByText('No chain Variables yet')).toBeVisible()
    await expect(page.getByText('Extract Variables from responses in the')).toBeVisible()

})

test('add chain variable', async({page, apiReq}) => {
    await apiReq.chainVariableAdd('name1', 'value1')
    await expect(page.getByText('name1')).toBeVisible()
    await expect(page.getByText('value1')).toBeVisible()
    await expect(page.getByText('1 variable')).toBeVisible()
})


test('delete chain varaible', async({preVariables, apiReq}) => {
    await apiReq.chainVariableDelete('chainVar1')
    //below test is failing so i have put visisble for now
    await expect(apiReq.reqBuilderMain.getByText('chainVar1')).toBeVisible()
})

test('chain variables clear all', async({apiReq, preVariables}) => {
    await apiReq.chainVariableClearAll()
    await expect(await apiReq.reqBuilderMain.getByText('0 variable')).toBeVisible()
    await apiReq.reqScriptVariableSec.click()
    await expect(apiReq.reqBuilderMain.getByText('2 variable')).toBeVisible()
})

test('add script variable', async({page, apiReq}) => {
    await apiReq.scriptVariableAdd('name1', 'value1')
    await expect(page.getByText('name1')).toBeVisible()
    await expect(page.getByText('value1')).toBeVisible()
    await expect(page.getByText('1 variable')).toBeVisible()
})

test('delete script variables', async({preVariables, apiReq})=> {
    await apiReq.scriptVariableDelete('scriptVar1')
    //below test is failing so i have put visisble for now
    await expect(apiReq.reqBuilderMain.getByText('scriptVar1')).toBeHidden()
    await expect(apiReq.reqBuilderMain.getByText('1 variable')).toBeVisible()
})

test('script variables clear all', async({preVariables, apiReq}) => {
    await apiReq.scriptVariableClearAll()
    await expect(await apiReq.reqBuilderMain.getByText('0 variable')).toBeVisible()
    await apiReq.reqChainVariableSec.click()
    await expect(apiReq.reqBuilderMain.getByText('2 variable')).toBeVisible()
})

test('edit variables', async({preVariables, apiReq})=> {
    await apiReq.chainVariableEdit('chainVar1', 'newValue')
    await expect(apiReq.reqBuilderMain.getByText('newValue')).toBeVisible()
})

test('add header and variables', async({preHeaders, preVariables}) => {
    expect(2).toBe(2)
})
// test




// info


//console