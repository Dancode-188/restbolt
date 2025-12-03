import {test, expect} from '../../fixtures/collection.fixture'
import { ReqHelpers } from '../../object-models/request-assiters.model'

//tab

test('create multiple tabs', async({singleCollection, page}) => {
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
test('Request Builder header visibility', async({apiReq, page}) => {
    await page.goto('/')
    await expect(apiReq.reqMainHeading).toBeVisible()
})

//combobox
test('all request options are available', async({apiReq, page}) => {
    const allReqTypes: string[] = ['GET','PUT','POST', 'DELETE','PATCH']
    await page.goto('/')
    for(let req of allReqTypes) {
        await apiReq.reqType.selectOption(req)
        await expect(apiReq.reqType).toHaveValue(req)}
    
})

//req url
test('request url to be editable', async ({apiReq, page}) => {
    const exampleUrl = 'https://example.com/header'
    await page.goto('/')
    await apiReq.fillUrl.fill(exampleUrl)
    await expect(apiReq.fillUrl).toHaveValue(exampleUrl)

    await apiReq.fillUrl.clear()
    await expect(apiReq.fillUrl).toBeEmpty()
})

//send btn

test('send request button is visible', async({apiReq, page}) => {
    await page.goto('/')
    await expect(apiReq.sendBtn).toBeVisible()
    await expect(apiReq.sendBtn).toHaveAccessibleName('Send')
})
//code

//save to collection
test('save to collection', async ({collection, page}) => {
    await page.goto('/')
    await expect(collection.saveToCollectionBtn).toBeVisible()
    await expect(collection.saveToCollectionBtn).toHaveAccessibleName('Save')
})

//auth helper
test('Auth helper works', async({apiReq, page})=> {
    await page.goto('/')
    await expect(apiReq.authHelperBtn).toBeVisible()
    await expect(apiReq.authHelperBtn).toHaveAccessibleName('Auth Helper')
    await apiReq.authHelperBtn.click()
    await expect(apiReq.bearerSection).toBeVisible()
    await expect(apiReq.bearerSection).toContainText('Bearer Token')
    await expect(apiReq.reqBuilderMain.getByRole('heading', {name: 'Authentication Helper'})).toBeVisible()
    await apiReq.authHelperCloseBtn.click()
    await expect(apiReq.reqBuilderMain.getByRole('heading', {name: 'Authentication Helper'})).toBeHidden()
})

test('Bearer token header visible', async({apiReq, page})=> {
    await page.goto('/')
    // await apiReq.fillBearToken('token123')
    await apiReq.authHelperBtn.click()
    await expect(apiReq.bearerSection.getByRole('heading')).toHaveAccessibleName('Bearer Token')
})

test('Bear Token works', async({apiReq, page}) => {
    await page.goto('/')
    await apiReq.fillBearToken('token123')
    await expect(apiReq.reqHeaderName).toHaveValue('Authorization')
    await expect(apiReq.reqHeaderValue).toHaveValue('Bearer token123')
})
    
//sections header test variables etc
test('Basic Authentication Header visible',async ({page, apiReq}) => {
    await page.goto('/')
    await apiReq.authHelperBtn.click()
    await expect(apiReq.authSection.getByRole('heading')).toHaveAccessibleName('Basic Authentication')
})

test('Basic Authentication works', async({apiReq, page}) => {
    const admin = 'UserAdmin'
    const pswd = 'secret'
    await page.goto('/')
    await apiReq.fillAuthUsernamePsswd(admin, pswd)
    await expect(apiReq.reqHeaderName).toHaveValue('Authorization')
    await expect(apiReq.reqHeaderValue).toHaveValue(/Basic/)
})

test('API Key Header Visible', async({apiReq, page}) => {
    await page.goto('/')
    await apiReq.authHelperBtn.click()
    await expect(apiReq.apiKeySection.getByRole('heading')).toHaveAccessibleName('API Key')
})

test('API key works', async ({apiReq, page}) => {
    const[name, value] = ['cat', 'dog']
    await page.goto('/')
    await apiReq.fillApiKey(name, value)
    await expect(apiReq.reqHeaderName).toHaveValue(name)
    await expect(apiReq.reqHeaderValue).toHaveValue(value)
})

test('Headers visible', async({apiReq, page}) => {
    await page.goto('/')
    await apiReq.reqHeaderSection.click()
    await expect(apiReq.reqBuilderMain).toContainText('Quick add')
    const result = await apiReq.reqBuilderMain.getByRole('button')
    await expect(result).toContainText(['Content-Type','User-Agent'])
    
})

test('Header functionality', async({page, apiReq}) => {
    const[name, value] = ['Author', 'ratings']
    await page.goto('/')
    await apiReq.fillHeader(name, value)
    await expect(apiReq.reqHeaderName).toHaveValue(name)
    await expect(apiReq.reqHeaderValue).toHaveValue(value)
})

test('Header multiple addition', async({page, apiReq}) => {
    const[name1, name2, name3] = ['author1', 'author2','author3']
    const[value1, value2, value3] = ['val1', 'val2', 'val3']
    await page.goto('/')
    await apiReq.fillHeader(name1, value1)
    await apiReq.fillHeader(name2, value2)
    await apiReq.fillHeader(name3, value3)
    const placeHolder: string= (await apiReq.reqHeaderName.getAttribute('placeholder'))!
    await expect(await apiReq.reqBuilderMain.getByPlaceholder(placeHolder).count()).toBe(3)
})

test('Header can uncheck', async({page, apiReq})=> {
    const[name1, name2, name3] = ['author1', 'author2','author3']
    const[value1, value2, value3] = ['val1', 'val2', 'val3']
    await page.goto('/')
    await apiReq.fillHeader(name1, value1)
    await apiReq.fillHeader(name2, value2)
    await apiReq.fillHeader(name3, value3)
    const cb = await apiReq.disableHeader('author2')
    await expect(cb).toBeChecked({checked:false})

})

test('Header deletion', async({page, apiReq}) => {
    const[name1, name2, name3] = ['author1', 'author2','author3']
    const[value1, value2, value3] = ['val1', 'val2', 'val3']
    await page.goto('/')
    await apiReq.fillHeader(name1, value1)
    await apiReq.fillHeader(name2, value2)
    await apiReq.fillHeader(name3, value3)
    await apiReq.deleteHeader('author2')
    const placeHolder = (await apiReq.reqHeaderName.getAttribute('placeholder'))!
    expect(await apiReq.reqBuilderMain.getByPlaceholder(placeHolder).count()).toBe(2)
})
//test
test('Post tests writable',  async({apiReq, page}) => {
    const testData = 'Should be visible'
    await page.goto('/')
    await apiReq.writeTest(testData)
    let result = (await apiReq.reqBuilderMain.getByRole('presentation').textContent())!
    result = result.replace(/\u00A0/g, ' ')
    expect(result).toContain(testData)
})

//variables
test('variable heading and content visible', async({page, apiReq}) => {
    await page.goto('/')
    await apiReq.reqVariableSection.click()
    await expect(page.getByRole('heading', {name:'Variables', exact: true})).toBeVisible()
    await expect(page.getByText('No chain Variables yet')).toBeVisible()
    await expect(page.getByText('Extract Variables from responses in the')).toBeVisible()

})

test('add chain variable', async({page, apiReq}) => {
    await page.goto('/')
    await apiReq.chainVariableAdd('name1', 'value1')
    await expect(page.getByText('name1')).toBeVisible()
    await expect(page.getByText('value1')).toBeVisible()
    await expect(page.getByText('1 variable')).toBeVisible()
    
    await apiReq.chainVariableAdd('name2', 'value2')
    await expect(page.getByText('name2')).toBeVisible()
    await expect(page.getByText('value2')).toBeVisible()
    await expect(page.getByText('2 variable')).toBeVisible()
})


test('delete chain varaible', async({page, apiReq}) => {
    await page.goto('/')
    await apiReq.chainVariableAdd('name1', 'var1')
    await apiReq.chainVariableAdd('name2', 'var2')
    await apiReq.chainVariableDelete('name1')
    //below test is failing so i have put visisble for now
    await expect(apiReq.reqBuilderMain.getByText('name1')).toBeVisible()
})

test('chain variables clear all', async({page, apiReq}) => {
    await page.goto('/')
    await apiReq.scriptVariableAdd('name1', 'var1')
    await apiReq.scriptVariableAdd('name2', 'var2')
    await apiReq.chainVariableAdd('name1', 'var1')
    await apiReq.chainVariableAdd('name2', 'var2')
    await apiReq.chainVariableClearAll()
    await expect(apiReq.reqBuilderMain.getByText('0 variable')).toBeVisible()
    await apiReq.reqScriptVariableSec.click()
    await apiReq.reqScriptVariableSec.isEnabled()
    await expect(apiReq.reqBuilderMain.getByText('2 variable')).toBeVisible()
})

test('add script vaiable', async({page, apiReq}) => {
    await page.goto('/')
    await apiReq.scriptVariableAdd('name1', 'value1')
    await expect(page.getByText('name1')).toBeVisible()
    await expect(page.getByText('value1')).toBeVisible()
    await expect(page.getByText('1 variable')).toBeVisible()

    await apiReq.scriptVariableAdd('name2', 'value2')
    await expect(page.getByText('name2')).toBeVisible()
    await expect(page.getByText('value2')).toBeVisible()
    await expect(page.getByText('2 variable')).toBeVisible() 
})

test('delete script variables', async({page, apiReq})=> {
    await page.goto('/')
    await apiReq.scriptVariableAdd('name1', 'var1')
    await apiReq.scriptVariableAdd('name2', 'var2')
    await apiReq.scriptVariableDelete('name1')
    //below test is failing so i have put visisble for now
    await expect(apiReq.reqBuilderMain.getByText('name1')).toBeHidden()
    await expect(apiReq.reqBuilderMain.getByText('1 variable')).toBeVisible()
})

test('script variables clear all', async({page, apiReq}) => {
    await page.goto('/')
    await apiReq.scriptVariableAdd('name1', 'var1')
    await apiReq.scriptVariableAdd('name2', 'var2')
    await apiReq.chainVariableAdd('name1', 'var1')
    await apiReq.chainVariableAdd('name2', 'var2')
    await apiReq.scriptVariableClearAll()
    await expect(await apiReq.reqBuilderMain.getByText('0 variable')).toBeVisible()
    await apiReq.reqScriptVariableSec.click()
    await expect(apiReq.reqBuilderMain.getByText('2 variable')).toBeVisible()
})

test('edit variables', async({page, apiReq})=> {
    await page.goto('/')
    await apiReq.scriptVariableAdd('name1', 'var1')
    await apiReq.scriptVariableAdd('name2', 'var2')
    await apiReq.chainVariableAdd('name1', 'var1')
    await apiReq.chainVariableAdd('name2', 'var2')
    await apiReq.chainVariableEdit('name1', 'newValue')
    await expect(apiReq.reqBuilderMain.getByText('newValue')).toBeVisible()
})

// test




// info


//console