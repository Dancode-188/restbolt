# [Testing] Add E2E Tests with Playwright

## 🎯 Goal
Add end-to-end (E2E) tests using Playwright to test complete user workflows in RestBolt. E2E tests ensure the entire application works correctly from the user's perspective.

## 📌 Labels
`testing`, `e2e`, `good first issue`, `playwright`

## 🔍 Problem Statement
RestBolt currently has unit tests for services but lacks E2E tests that verify complete user workflows. E2E tests are crucial for:
- ✅ Testing real user scenarios
- ✅ Catching integration bugs
- ✅ Verifying UI interactions work correctly
- ✅ Ensuring features work end-to-end

## 🛠️ Proposed Solution

### Testing Framework: Playwright
We'll use [Playwright](https://playwright.dev/) for E2E testing because:
- Fast and reliable
- Cross-browser testing (Chromium, Firefox, WebKit)
- Great debugging tools
- Excellent documentation
- Used by industry leaders

### Priority Test Scenarios

#### Phase 1: Core Workflows (Start Here)

**1. Send Basic HTTP Request**
```typescript
test('should send GET request and display response', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Enter URL
  await page.fill('[data-testid="url-input"]', 'https://jsonplaceholder.typicode.com/posts/1');
  
  // Select GET method
  await page.selectOption('[data-testid="method-select"]', 'GET');
  
  // Click Send
  await page.click('[data-testid="send-button"]');
  
  // Wait for response
  await page.waitForSelector('[data-testid="response-viewer"]');
  
  // Verify response contains expected data
  const responseText = await page.textContent('[data-testid="response-viewer"]');
  expect(responseText).toContain('"userId"');
  expect(responseText).toContain('"id": 1');
});
```

**2. Create and Save Collection**
```typescript
test('should create collection and save request', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Navigate to Collections
  await page.click('text=Collections');
  
  // Create new collection
  await page.click('text=New Collection');
  await page.fill('[data-testid="collection-name"]', 'Test API');
  await page.click('[data-testid="create-collection"]');
  
  // Verify collection appears
  await expect(page.locator('text=Test API')).toBeVisible();
  
  // Save a request to collection
  await page.fill('[data-testid="url-input"]', 'https://api.example.com/users');
  await page.click('[data-testid="save-request"]');
  await page.fill('[data-testid="request-name"]', 'Get Users');
  await page.click('[data-testid="confirm-save"]');
  
  // Verify request saved
  await expect(page.locator('text=Get Users')).toBeVisible();
});
```

**3. Build and Execute Chain**
```typescript
test('should create and execute request chain', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Navigate to Chains
  await page.click('text=Chains');
  
  // Create new chain
  await page.click('text=New Chain');
  await page.fill('[data-testid="chain-name"]', 'User Workflow');
  
  // Add first step
  await page.click('text=Add Step');
  await page.fill('[data-testid="step-url"]', 'https://jsonplaceholder.typicode.com/users/1');
  await page.fill('[data-testid="variable-name"]', 'userId');
  await page.fill('[data-testid="variable-path"]', '$.id');
  
  // Add second step
  await page.click('text=Add Step');
  await page.fill('[data-testid="step-url"]', 'https://jsonplaceholder.typicode.com/posts?userId={{userId}}');
  
  // Execute chain
  await page.click('[data-testid="execute-chain"]');
  
  // Wait for completion
  await page.waitForSelector('text=Completed', { timeout: 10000 });
  
  // Verify both steps executed
  const step1Status = await page.textContent('[data-testid="step-1-status"]');
  const step2Status = await page.textContent('[data-testid="step-2-status"]');
  expect(step1Status).toBe('Success');
  expect(step2Status).toBe('Success');
});
```

#### Phase 2: Advanced Scenarios

**4. Handle Request Errors**
- Test network failures
- Test invalid URLs
- Test timeout scenarios
- Verify error messages display correctly

**5. Test Offline Functionality**
- Save requests while offline
- Verify IndexedDB storage
- Test sync when back online

**6. Test History Feature**
- Execute multiple requests
- Navigate to history
- Replay previous requests
- Clear history

## 📁 Project Structure

```
restbolt/
├── e2e/
│   ├── basic-workflow.spec.ts      # Core user workflows
│   ├── collections.spec.ts         # Collection management
│   ├── chains.spec.ts              # Chain builder tests
│   ├── error-handling.spec.ts      # Error scenarios
│   ├── offline.spec.ts             # Offline functionality
│   └── fixtures/
│       └── test-data.ts            # Shared test data
├── playwright.config.ts            # Playwright configuration
└── package.json                    # Add Playwright scripts
```

## 🚀 Implementation Steps

### Step 1: Install Playwright (10 minutes)

```bash
npm install -D @playwright/test
npx playwright install
```

### Step 2: Create Playwright Config (10 minutes)

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 3: Add Test Scripts (5 minutes)

**File:** `package.json`

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

### Step 4: Write First Test (30 minutes)

**File:** `e2e/basic-workflow.spec.ts`

Start with the "Send Basic HTTP Request" test from Phase 1 above.

### Step 5: Add Data Test IDs (20 minutes)

Add `data-testid` attributes to key UI elements:

```tsx
// Example: RequestBuilder component
<input 
  data-testid="url-input"
  placeholder="Enter URL"
  value={url}
/>

<button 
  data-testid="send-button"
  onClick={handleSend}
>
  Send
</button>

<div data-testid="response-viewer">
  {response}
</div>
```

### Step 6: Run Tests Locally (5 minutes)

```bash
npm run test:e2e
```

### Step 7: Document & Submit PR

- Update README with E2E test instructions
- Add screenshots of test results
- Document any UI changes needed for testability

## ✅ Acceptance Criteria

### Phase 1 (Priority):
- [ ] Playwright installed and configured
- [ ] At least 3 core workflow tests passing
- [ ] Tests run in CI (optional for Phase 1)
- [ ] Basic documentation in README

### Phase 2 (Nice to Have):
- [ ] 6+ test scenarios covered
- [ ] Error handling tests
- [ ] Offline functionality tests
- [ ] Cross-browser testing
- [ ] Test coverage report

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Writing E2E Tests Guide](https://playwright.dev/docs/writing-tests)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## 🎯 Getting Started

1. Fork the repo and create a new branch: `git checkout -b add-e2e-tests`
2. Install Playwright: `npm install -D @playwright/test`
3. Create `playwright.config.ts` with the config above
4. Create `e2e/` directory
5. Write your first test (basic-workflow.spec.ts)
6. Run tests: `npm run test:e2e`
7. Submit PR when Phase 1 criteria are met

## 💬 Questions?

Comment on this issue if you need:
- Help with Playwright setup
- Clarification on test scenarios
- Guidance on adding test IDs to components
- Assistance debugging tests

Let's make RestBolt rock-solid with great E2E coverage! 🚀

---

**Estimated Effort:** 4-6 hours for Phase 1, 8-10 hours for Phase 2
**Difficulty:** Intermediate (experience with React and testing helpful)
**Priority:** High - Essential for production readiness
