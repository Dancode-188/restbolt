import { test, expect } from '@playwright/test';

test('checking for basic workflow functionality', async ({page}) => {
  await page.goto('/')
  await page.getByPlaceholder('https://api.example.com/endpoint').fill('https://jsonplaceholder.typicode.com/todos/1')
  await page.getByRole('button', {name:'Send'}).click()
  await expect(page.getByRole('presentation')).toContainText('"userId": 1')
  await expect(page.getByRole('presentation')).toContainText('"id": 1')
  await expect(page.getByRole('presentation')).toContainText('"title"')})