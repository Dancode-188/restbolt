import { test, expect } from './fixtures/collection.fixture'


test('checking for basic workflow functionality', async ({apiReq, page}) => {
  await page.goto('/')
  await apiReq.get('https://jsonplaceholder.typicode.com/todos/1')
  let result = await apiReq.getResponseResult()
  expect(result).toContain('"userId": 1')
  expect(result).toContain('"id": 1')
  expect(result).toContain('"title"')
})

test('post checking for postt request', async ({apiReq,page}) => {
  await page.goto('/')
  await apiReq.post('https://jsonplaceholder.typicode.com/posts', postData)
  const result = await apiReq.getResponseResult()
  await expect(result).toContain('"title": "foo"')
  await expect(result).toContain('"body": "bar"')
})

test('checking for patch request', async ({apiReq, page}) =>{
  await page.goto('/')
  await apiReq.patch('https://jsonplaceholder.typicode.com/posts/1', patchData)
  const result = await apiReq.getResponseResult()
  await expect(result).toContain('"title": "foo"')
  await expect(result).toContain('"id": 1')
})

test('environment select', async ({envSetup,page}) => {
  await page.goto('/')
  await envSetup.createNewEnv('QA1')
  await envSetup.selectEnvironment('QA1')
})

const postData  = `{  "title": "foo",  "body": "bar",  "userId" : 101}`
const patchData = `{  "id": 1,  "title": "foo"}`