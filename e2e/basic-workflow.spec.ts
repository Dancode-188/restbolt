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