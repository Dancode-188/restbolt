# [Feature] Add GraphQL Support

## Labels
`enhancement`, `graphql`, `good first issue`

## Problem Statement
Currently, RestBolt focuses on REST APIs. However, many modern applications use GraphQL, and developers need a good tool to test GraphQL queries, mutations, and subscriptions.

## Proposed Solution

### Phase 1: Basic GraphQL Support
- Add a "GraphQL" tab in the Request Builder (next to Body, Headers, etc.)
- GraphQL query editor with syntax highlighting (Monaco editor)
- Variables input section (JSON format)
- Support for queries and mutations
- Formatted GraphQL response viewer

### Phase 2: Advanced Features
- **Introspection** - Auto-fetch schema from GraphQL endpoint
- **Autocomplete** - IntelliSense based on schema
- **Query Builder** - Visual query builder (like GraphiQL)
- **Subscriptions** - Real-time GraphQL subscriptions support
- **Schema Explorer** - Browse available types, queries, mutations

## Technical Approach

```typescript
// Add to Request type
interface Request {
  // ... existing fields
  graphql?: {
    query: string;
    variables?: Record<string, any>;
    operationName?: string;
  }
}

// GraphQL service
class GraphQLService {
  async executeQuery(endpoint: string, query: string, variables?: any) {
    // Implementation
  }
  
  async introspectSchema(endpoint: string) {
    // Fetch schema using introspection query
  }
}
```

## UI Mockup

```
┌─────────────────────────────────────────┐
│ Request Builder                         │
├─────────────────────────────────────────┤
│ [Params] [Headers] [Body] [GraphQL]    │ ← New tab
├─────────────────────────────────────────┤
│                                         │
│  Query:                                 │
│  ┌───────────────────────────────────┐ │
│  │ query GetUser($id: ID!) {         │ │
│  │   user(id: $id) {                 │ │
│  │     id                            │ │
│  │     name                          │ │
│  │     email                         │ │
│  │   }                               │ │
│  │ }                                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Variables:                             │
│  ┌───────────────────────────────────┐ │
│  │ {                                 │ │
│  │   "id": "123"                     │ │
│  │ }                                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [Introspect Schema] [Send Query]      │
└─────────────────────────────────────────┘
```

## Implementation Steps

1. **Phase 1 (2-3 days)**
   - [ ] Add GraphQL tab to Request Builder
   - [ ] Create GraphQL query editor with Monaco
   - [ ] Add variables input section
   - [ ] Implement query execution
   - [ ] Format GraphQL responses

2. **Phase 2 (3-4 days)** 
   - [ ] Add schema introspection
   - [ ] Implement autocomplete
   - [ ] Add schema explorer sidebar
   - [ ] Support GraphQL subscriptions

3. **Phase 3 (Optional - 2-3 days)**
   - [ ] Visual query builder
   - [ ] Query history specific to GraphQL
   - [ ] Save common queries as snippets

## Libraries to Consider
- `graphql` - Core GraphQL library
- `@graphiql/toolkit` - GraphiQL components (optional)
- `graphql-ws` - GraphQL subscriptions over WebSocket
- Monaco editor already supports GraphQL syntax highlighting

## Acceptance Criteria
- [ ] Can send GraphQL queries to any endpoint
- [ ] Can pass variables to queries
- [ ] Response is formatted and readable
- [ ] Syntax highlighting works
- [ ] Works with existing collections/history
- [ ] Can extract variables from GraphQL responses (for Chain Builder)

## Priority
**Medium** - Not critical for core functionality, but important for broader adoption

## Estimated Effort
**5-7 days** for full implementation with advanced features  
**2-3 days** for basic query execution only

## References
- GraphQL official docs: https://graphql.org/
- GraphiQL: https://github.com/graphql/graphiql
- Postman's GraphQL support: https://learning.postman.com/docs/sending-requests/graphql/graphql-overview/
