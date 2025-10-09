import axios from 'axios';

export interface GraphQLRequest {
  endpoint: string;
  query: string;
  variables?: Record<string, any>;
  headers?: Record<string, string>;
}

export interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
}

export interface GraphQLResponse {
  data?: any;
  errors?: GraphQLError[];
}

export interface GraphQLExecutionResult {
  response?: GraphQLResponse;
  error?: string;
  duration: number;
  status?: number;
}

class GraphQLService {
  async executeQuery(request: GraphQLRequest): Promise<GraphQLExecutionResult> {
    const startTime = Date.now();

    try {
      const response = await axios.post(
        request.endpoint,
        {
          query: request.query,
          variables: request.variables,
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
        duration,
        status: response.status,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (error.response) {
        return {
          response: error.response.data,
          duration,
          status: error.response.status,
        };
      }

      return {
        error: error.message || 'Network error occurred',
        duration,
      };
    }
  }

  validateQuery(query: string): { valid: boolean; error?: string } {
    if (!query.trim()) {
      return { valid: false, error: 'Query cannot be empty' };
    }

    const trimmed = query.trim().toLowerCase();
    if (!trimmed.startsWith('query') && !trimmed.startsWith('mutation') && !trimmed.startsWith('{')) {
      return {
        valid: false,
        error: 'Query must start with query, mutation, or {',
      };
    }

    return { valid: true };
  }

  validateVariables(variables: string): { valid: boolean; error?: string; parsed?: any } {
    if (!variables.trim()) {
      return { valid: true, parsed: {} };
    }

    try {
      const parsed = JSON.parse(variables);
      return { valid: true, parsed };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
}

export const graphqlService = new GraphQLService();
