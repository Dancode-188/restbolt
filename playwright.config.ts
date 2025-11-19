import { defineConfig, devices } from '@playwright/test';
import { getenv, useProject } from './e2e/helpers/env-setup';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */



export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2: parseInt(getenv('RETRIES')),
   workers: process.env.CI ? 1 : parseInt(getenv('WORKERS')),
  reporter: 'html',

  use: {
    baseURL: process.env.CI? 'http://localhost:3000': getenv('BASE_URL'),
    trace: 'on-first-retry',
  },

  projects: [
    useProject
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: process.env.CI ? 'http://localhost:3000' : getenv('BASE_URL'),
    reuseExistingServer: !process.env.CI,
  },
});





    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
