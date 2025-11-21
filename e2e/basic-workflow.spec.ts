import { test, expect } from './fixtures/api.fixture'


test('checking for basic workflow functionality', async ({api, page}) => {
  await page.goto('/')
  let result = await api.get('https://jsonplaceholder.typicode.com/todos/1')
  expect(result).toContain('"userId": 1')
  expect(result).toContain('"id": 1')
  expect(result).toContain('"title"')
})

test('post checking for postt request', async ({api,page}) => {
  await page.goto('/')
  const result = await api.post('https://jsonplaceholder.typicode.com/posts', postData)
  await expect(result).toContain('"title": "foo"')
  await expect(result).toContain('"body": "bar"')
})

test('checking for patch request', async ({api, page}) =>{
  await page.goto('/')
  const result = await api.patch('https://jsonplaceholder.typicode.com/posts/1', patchData)
  await expect(result).toContain('"title": "foo"')
  await expect(result).toContain('"id": 1')
})


const postData = `{  "title": "foo",  "body": "bar",  "userId" : 101}`


const patchData = `{  "id": 1,  "title": "foo"}`