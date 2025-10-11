# [Feature] Add Mock Server

## Labels
`enhancement`, `mock-server`, `testing`

## Problem Statement
When developing frontend applications, developers often need to:
- Test API integrations before the backend is ready
- Simulate error responses and edge cases
- Work offline without real API access
- Create reproducible test scenarios

Currently, RestBolt can only call real APIs. A built-in mock server would let developers simulate API responses locally.

## Proposed Solution

### Core Features
1. **Mock Response Builder**
   - Define mock responses for any endpoint
   - Set custom status codes (200, 404, 500, etc.)
   - Add custom headers
   - Define response body (JSON, XML, HTML, etc.)
   - Add response delay to simulate network latency

2. **Mock Server Manager**
   - Start/stop local mock server
   - Configure port (default: 3001)
   - List all active mocks
   - Enable/disable individual mocks
   - Import/export mock configurations

3. **Integration with Collections**
   - Turn any saved request into a mock
   - One-click "Mock this response"
   - Organize mocks in collections

## UI Mockup

```
┌─────────────────────────────────────────────────┐
│ Mock Server                                     │
│                                                 │
│ Status: ● Running on http://localhost:3001     │
│ [Stop Server]  [Settings]                      │
├─────────────────────────────────────────────────┤
│                                                 │
│ Active Mocks (3):                               │
│                                                 │
│ ✓ GET  /api/users          → 200 (50ms delay) │
│ ✓ POST /api/users          → 201              │
│ ✓ GET  /api/users/:id      → 200              │
│                                                 │
│ [+ New Mock]  [Import]  [Export]               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Create Mock Response                            │
├─────────────────────────────────────────────────┤
│ Method: [GET ▼]                                │
│                                                 │
│ Path:                                           │
│ /api/users/:id                                  │
│                                                 │
│ Status Code:                                    │
│ [200 ▼]  OK                                    │
│                                                 │
│ Response Headers:                               │
│ Content-Type: application/json                  │
│ [+ Add Header]                                  │
│                                                 │
│ Response Body:                                  │
│ ┌─────────────────────────────────────────────┐│
│ │ {                                           ││
│ │   "id": "{{userId}}",                       ││
│ │   "name": "John Doe",                       ││
│ │   "email": "john@example.com"               ││
│ │ }                                           ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ Delay (ms): [50]                                │
│                                                 │
│ [Cancel]  [Create Mock]                        │
└─────────────────────────────────────────────────┘
```

## Technical Architecture

```typescript
// Mock definition type
interface MockResponse {
  id: string;
  method: string;
  path: string;
  pathPattern: RegExp; // For dynamic paths like /users/:id
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  delay?: number; // milliseconds
  enabled: boolean;
}

// Mock server service
class MockServerService {
  private server: any; // Express or similar
  private mocks: MockResponse[] = [];
  
  async start(port: number = 3001) {
    // Start local server
  }
  
  async stop() {
    // Stop server
  }
  
  addMock(mock: MockResponse) {
    // Add new mock endpoint
  }
  
  removeMock(id: string) {
    // Remove mock
  }
  
  matchRequest(method: string, path: string): MockResponse | null {
    // Find matching mock for incoming request
  }
}
```

## Implementation Approach

### Option 1: Embedded HTTP Server (Recommended)
- Use lightweight HTTP server (e.g., `express` or `fastify`)
- Run in-process with Next.js app
- Simple to implement and manage
- **Pros:** Full control, easy debugging
- **Cons:** Port management

### Option 2: Service Worker
- Use Service Worker API to intercept requests
- No separate server needed
- **Pros:** No port configuration needed
- **Cons:** More complex, browser-only

### Option 3: Next.js API Routes
- Use Next.js built-in API routes
- Dynamic route matching
- **Pros:** Native to Next.js
- **Cons:** Requires app restart for changes

**Recommendation:** Start with Option 1 (embedded server) for simplicity and control.

## Implementation Steps

1. **Phase 1: Basic Mock Server (2-3 days)**
   - [ ] Create mock server service
   - [ ] Start/stop server functionality
   - [ ] Basic mock response matching
   - [ ] Simple UI to create mocks
   - [ ] Store mocks in IndexedDB

2. **Phase 2: Advanced Features (2-3 days)**
   - [ ] Dynamic path parameters (e.g., `/users/:id`)
   - [ ] Response templating with variables
   - [ ] Response delay configuration
   - [ ] Import/export mocks
   - [ ] Mock collections

3. **Phase 3: Integration (1-2 days)**
   - [ ] "Mock this response" button in Response Viewer
   - [ ] Auto-generate mocks from requests
   - [ ] Integration with Chain Builder
   - [ ] Mock request logs/analytics

## Libraries to Consider
- `express` or `fastify` - HTTP server
- `path-to-regexp` - Path pattern matching (for dynamic routes)
- `json-server` - Inspiration for API design

## Acceptance Criteria
- [ ] Can start/stop mock server from UI
- [ ] Can create mock responses with custom status/body
- [ ] Can match requests to mocks (including dynamic paths)
- [ ] Mocks persist across sessions
- [ ] Can export/import mock configurations
- [ ] Can convert real responses to mocks
- [ ] Response delay simulation works

## Use Cases

### Use Case 1: Frontend Development
Developer is building a React app but backend isn't ready yet:
1. Creates mock for `GET /api/users` returning user list
2. Creates mock for `POST /api/users` returning 201 Created
3. Frontend team can develop against mocks
4. Switch to real API when ready

### Use Case 2: Error Testing
Developer wants to test error handling:
1. Create mock for `GET /api/data` with 500 status
2. Add 2-second delay to simulate slow network
3. Test app's error handling
4. Switch back to 200 success to test happy path

### Use Case 3: Demos
Developer needs to demo app without internet:
1. Create mocks for all API endpoints
2. Export mock configuration
3. Import on demo machine
4. App works offline perfectly

## Priority
**Medium-Low** - Nice to have, but not critical for core API testing functionality

## Estimated Effort
**5-7 days** for full implementation with advanced features  
**2-3 days** for basic mock server only

## References
- json-server: https://github.com/typicode/json-server
- Mockoon: https://mockoon.com/
- Postman Mock Servers: https://learning.postman.com/docs/designing-and-developing-your-api/mocking-data/setting-up-mock/
