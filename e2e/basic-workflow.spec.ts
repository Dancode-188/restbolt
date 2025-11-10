import { test, expect } from '@playwright/test';
import { APImodel } from './object-models/api-model';


test('checking for basic workflow functionality', async ({page}) => {
  await page.goto('/')
  const api = new APImodel(page)
  let result = await api.get('https://jsonplaceholder.typicode.com/todos/1')
  expect(result).toContain('"userId": 1')
  expect(result).toContain('"id": 1')
  expect(result).toContain('"title"')
})

test('post checking for post request', async ({page}) => {
  await page.goto('/')
  const api = new APImodel(page)
  const result = await api.post('https://jsonplaceholder.typicode.com/posts', postData)
  console.log(result )
  await expect(result).toContain('"title": "foo"')
  await expect(result).toContain('"body": "bar"')
})

test('patch checking for put request', async ({page}) =>{
  await page.goto('/')
  const api = new APImodel(page)
  const result = await api.patch('https://jsonplaceholder.typicode.com/posts/1', patchData)
  console.log(result)
  await expect(result).toContain('"title": "foo"')
  await expect(result).toContain('"id": 1')
})


const postData = `{
  "title": "foo",
  "body": "bar",
  "userId" : 101`

const patchData = `{
  "id": 1,
  "title": "foo"`