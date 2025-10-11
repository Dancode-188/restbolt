# [Testing] Add Comprehensive Test Coverage

## Labels
`testing`, `quality`, `good first issue`

## Problem Statement
RestBolt currently has **no automated tests**. While the application works well, the lack of tests means:
- 😰 **Risk of regressions** - Changes might break existing features
- 🐛 **Harder to catch bugs** - Issues only discovered during manual testing
- 📉 **Lower confidence** - Difficult to refactor or add features safely
- 🤝 **Contributors hesitant** - Hard for others to contribute without tests

We need comprehensive test coverage across unit, integration, and E2E tests.

## Proposed Solution

### Testing Strategy

#### 1. **Unit Tests** (70% of tests)
Test individual functions and services in isolation
- Services (http-client, chain-service, etc.)
- Utilities and helpers
- Pure functions

#### 2. **Integration Tests** (20% of tests)
Test how components work together
- Component integration with services
- State management flows
- API interactions

#### 3. **E2E Tests** (10% of tests)
Test complete user workflows
- Send request → view response
- Create collection → save request
- Build chain → execute workflow

### Testing Stack

```typescript
// Recommended tools
{
  "unit": "Vitest",           // Fast, modern, works great with Vite/Next
  "component": "React Testing Library", // Standard for React
  "e2e": "Playwright",        // Better than Cypress for modern apps
  "coverage": "Vitest coverage"
}
```

## Test Coverage Goals

### Phase 1: Critical Path (Target: 40% coverage)
Focus on the most important features first:

```
Priority 1 - Core Features:
├── HTTP Client (lib/http-client.ts)
├── Request Execution
├── Response Handling
└── Variable Interpolation

Priority 2 - Data Layer:
├── Database operations (lib/db.ts)
├── Collections service
└── History service

Priority 3 - Chain Builder:
├── Chain execution (lib/chain-service.ts)
├── Variable extraction
└── Conflict detection
```

### Phase 2: Comprehensive (Target: 60% coverage)
Add tests for remaining features:
- Code generation
- Diffing service
- WebSocket handling
- Export/import
- Environment management

### Phase 3: E2E Scenarios (Target: 80% overall)
Complete user workflows:
- New user onboarding flow
- Complex chain execution
- Error handling scenarios

## Implementation Plan

### Step 1: Setup Testing Infrastructure (1 day)
```bash
# Install dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D @vitest/coverage-v8

# Update package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

Create test configuration files:
- `vitest.config.ts`
- `playwright.config.ts`
- `setupTests.ts`

### Step 2: Unit Tests - Services (2-3 days)

#### Example: HTTP Client Tests
```typescript
// lib/__tests__/http-client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { httpClient } from '../http-client';

describe('HTTP Client', () => {
  it('should send GET request successfully', async () => {
    const response = await httpClient.send({
      method: 'GET',
      url: 'https://api.example.com/data'
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    await expect(
      httpClient.send({
        method: 'GET',
        url: 'https://invalid-url'
      })
    ).rejects.toThrow();
  });

  it('should interpolate variables in URL', async () => {
    const response = await httpClient.send({
      method: 'GET',
      url: 'https://api.example.com/users/{{userId}}'
    }, { userId: '123' });
    
    expect(response.config.url).toBe('https://api.example.com/users/123');
  });
});
```

#### Example: Chain Service Tests
```typescript
// lib/__tests__/chain-service.test.ts
import { describe, it, expect } from 'vitest';
import { chainService } from '../chain-service';

describe('Chain Service', () => {
  it('should execute steps in order', async () => {
    const chain = {
      steps: [
        { /* step 1 */ },
        { /* step 2 */ }
      ]
    };
    
    const result = await chainService.executeChain(chain.id);
    expect(result.status).toBe('completed');
  });

  it('should extract variables from responses', async () => {
    // Test variable extraction logic
  });

  it('should detect variable conflicts', async () => {
    // Test conflict detection
  });
});
```

### Step 3: Component Tests (2-3 days)

```typescript
// components/__tests__/RequestBuilder.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import RequestBuilder from '../RequestBuilder';

describe('RequestBuilder', () => {
  it('should render all input fields', () => {
    render(<RequestBuilder />);
    
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('should update URL on input change', () => {
    render(<RequestBuilder />);
    const urlInput = screen.getByLabelText('URL');
    
    fireEvent.change(urlInput, { 
      target: { value: 'https://api.example.com' } 
    });
    
    expect(urlInput.value).toBe('https://api.example.com');
  });

  it('should call send function on button click', async () => {
    const mockSend = vi.fn();
    render(<RequestBuilder onSend={mockSend} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    
    expect(mockSend).toHaveBeenCalled();
  });
});
```

### Step 4: E2E Tests (2-3 days)

```typescript
// e2e/basic-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('send request and view response', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Enter URL
  await page.fill('[data-testid="url-input"]', 'https://jsonplaceholder.typicode.com/posts/1');
  
  // Click send
  await page.click('[data-testid="send-button"]');
  
  // Wait for response
  await page.waitForSelector('[data-testid="response-viewer"]');
  
  // Verify response is visible
  const responseText = await page.textContent('[data-testid="response-viewer"]');
  expect(responseText).toContain('"userId"');
});

test('create and execute chain', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Navigate to Chains tab
  await page.click('text=Chains');
  
  // Create new chain
  await page.click('text=New Chain');
  
  // Add steps and configure
  await page.fill('[data-testid="chain-name"]', 'Test Chain');
  await page.click('text=Add Step');
  
  // Execute chain
  await page.click('text=Execute');
  
  // Verify execution completes
  await expect(page.locator('text=completed')).toBeVisible();
});
```

### Step 5: CI/CD Integration (1 day)

Create GitHub Actions workflow:
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Generate coverage
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Organization

```
restbolt/
├── src/
│   ├── lib/
│   │   ├── __tests__/
│   │   │   ├── http-client.test.ts
│   │   │   ├── chain-service.test.ts
│   │   │   └── db.test.ts
│   │   └── ...
│   ├── components/
│   │   ├── __tests__/
│   │   │   ├── RequestBuilder.test.tsx
│   │   │   ├── ResponseViewer.test.tsx
│   │   │   └── ChainBuilder.test.tsx
│   │   └── ...
├── e2e/
│   ├── basic-workflow.spec.ts
│   ├── chain-builder.spec.ts
│   └── collections.spec.ts
├── vitest.config.ts
└── playwright.config.ts
```

## Coverage Badges

Add to README:
```markdown
![Tests](https://github.com/Dancode-188/restbolt/actions/workflows/test.yml/badge.svg)
![Coverage](https://codecov.io/gh/Dancode-188/restbolt/branch/main/graph/badge.svg)
```

## Acceptance Criteria

### Phase 1 (Critical Path):
- [ ] Test infrastructure setup complete
- [ ] HTTP client has 80%+ coverage
- [ ] Chain service has 70%+ coverage
- [ ] Database operations have 60%+ coverage
- [ ] Tests run in CI/CD

### Phase 2 (Comprehensive):
- [ ] All services have 60%+ coverage
- [ ] Critical components have 70%+ coverage
- [ ] Overall project coverage: 60%+

### Phase 3 (E2E):
- [ ] 5+ E2E test scenarios
- [ ] E2E tests run in CI
- [ ] Overall project coverage: 80%+

## Benefits

✅ **Confidence** - Make changes without fear  
✅ **Quality** - Catch bugs before users do  
✅ **Documentation** - Tests serve as usage examples  
✅ **Contributors** - Easier for others to contribute  
✅ **Refactoring** - Safe to improve code  

## Priority
**High** - Essential for long-term project health and contributor confidence

## Estimated Effort
- **Phase 1:** 4-5 days (critical path coverage)
- **Phase 2:** 3-4 days (comprehensive coverage)
- **Phase 3:** 2-3 days (E2E scenarios)
- **Total:** 9-12 days

## Getting Started (Good First Issue!)

New contributors can start with easy tests:
1. Test pure utility functions
2. Test simple components
3. Add E2E test for basic workflow

## References
- Vitest: https://vitest.dev/
- React Testing Library: https://testing-library.com/react
- Playwright: https://playwright.dev/
- Testing best practices: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
