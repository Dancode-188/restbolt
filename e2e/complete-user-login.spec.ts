import {test, expect} from './fixtures/collection.fixture'

const postData1: string = '{ "email": "eve.holt@reqres.in", "password": "cityslicka" }'
const postData2: string = '{ "name": "morpheus", "job": "leader"}'
const testData1 : string = `const varb = pm.response.json()
pm.variables.set('toki',varb.token)
console.log(pm.variables.get('toki'))`
const testData2 : string =`const varb = pm.response.json()
pm.variables.set('userId', varb.id)
console.log(pm.variables.get('userId'))`


test('testing miniproject', async({collection, apiReq, envSetup, page}) => {
    await page.goto('/')
    
    await apiReq.fillHeader('x-api-key', 'reqres-free-v1')
    
    await envSetup.createNewEnv('QA')
    await envSetup.addEnvVariable('QA', 'baseURL', 'reqres.in')
    await apiReq.post('https://{{baseURL}}/api/login', postData1 )
    await expect(page).toHaveURL('/')
    await apiReq.writeTest(testData1)
    await collection.createCollection('User Collection')
    await collection.saveToCollection('login token', 'User Collection')
    await apiReq.getResponseResult()

    await apiReq.fillHeader('Authorization', '{{toki}}')
    await apiReq.post('https://{{baseURL}}/api/users', postData2)
    await apiReq.writeTest(testData2)
    await collection.saveToCollection('login user', 'User Collection')
    await apiReq.getResponseResult()

})