import axios from 'axios';

export interface GraphQLRequest {
  endpoint: string;
  query: string;
  variables?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface GraphQLResponse {
  data?: any;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

export interface GraphQLExecutionResult {
  response?: GraphQLResponse;
  error?: string;
  status?: number;
  duration: number;
}

class GraphQLService {
  async executeQuery(request: GraphQLRequest): Promise<GraphQLExecutionResult> {
    const startTime = Date.now();

    try {
      const response = await axios.post(
        request.endpoint,
        {
          query: request.query,
          variables: request.variables || {},
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...request.headers,
          },
        }
      );

      const duration = Date.now() - startTime;

      return {
        response: response.data,
        status: response.status,
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (error.response) {
        // Server responded with error
        return {
          response: error.response.data,
          status: error.response.status,
          duration,
          error: error.message,
        };
      } else if (error.request) {
        // Request made but no response
        return {
          error: 'No response from server',
          duration,
        };
      } else {
        // Error setting up request
        return {
          error: error.message,
          duration,
        };
      }
    }
  }

  // Introspection query for schema exploration (optional feature)
  getIntrospectionQuery(): string {
    return `
      query IntrospectionQuery {
        __schema {
          queryType { name }
          mutationType { name }
          subscriptionType { name }
          types {
            ...FullType
          }
        }
      }

      fragment FullType on __Type {
        kind
        name
        description
        fields(includeDeprecated: true) {
          name
          description
          args {
            ...InputValue
          }
          type {
            ...TypeRef
          }
          isDeprecated
          deprecationReason
        }
        inputFields {
          ...InputValue
        }
        interfaces {
          ...TypeRef
        }
        enumValues(includeDeprecated: true) {
          name
          description
          isDeprecated
          deprecationReason
        }
        possibleTypes {
          ...TypeRef
        }
      }

      fragment InputValue on __InputValue {
        name
        description
        type { ...TypeRef }
        defaultValue
      }

      fragment TypeRef on __Type {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
  }

  // Helper to validate GraphQL syntax
  validateQuery(query: string): { valid: boolean; error?: string } {
    if (!query.trim()) {
      return { valid: false, error: 'Query cannot be empty' };
    }

    // Basic validation - check for query/mutation/subscription keywords
    const hasOperation = /^(query|mutation|subscription|\{)/i.test(query.trim());
    if (!hasOperation) {
      return { valid: false, error: 'Query must start with query, mutation, subscription, or {' };
    }

    return { valid: true };
  }

  // Helper to validate variables JSON
  validateVariables(variablesString: string): { valid: boolean; error?: string; parsed?: any } {
    if (!variablesString.trim()) {
      return { valid: true, parsed: {} };
    }

    try {
      const parsed = JSON.parse(variablesString);
      if (typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { valid: false, error: 'Variables must be a JSON object' };
      }
      return { valid: true, parsed };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
}

export const graphqlService = new GraphQLService();
