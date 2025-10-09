import { JSONPath } from 'jsonpath-plus';

export interface VariableExtraction {
  name: string;
  path: string; // JSONPath expression
  description?: string;
}

export interface ExtractedVariable {
  name: string;
  value: any;
  source: 'response' | 'manual' | 'environment';
  extractedAt: Date;
}

export interface ChainContext {
  variables: Record<string, any>;
  responses: Array<{
    step: number;
    data: any;
    status: number;
  }>;
}

class VariableExtractionService {
  /**
   * Extract variables from a JSON response using JSONPath
   */
  extractVariables(
    response: any,
    extractions: VariableExtraction[]
  ): Record<string, any> {
    const extracted: Record<string, any> = {};

    extractions.forEach((extraction) => {
      try {
        const result = JSONPath({
          path: extraction.path,
          json: response,
          wrap: false,
        });

        extracted[extraction.name] = result;
      } catch (error) {
        console.error(`Failed to extract variable ${extraction.name}:`, error);
        extracted[extraction.name] = null;
      }
    });

    return extracted;
  }

  /**
   * Extract a single variable from response
   */
  extractSingleVariable(response: any, path: string): any {
    try {
      return JSONPath({
        path: path,
        json: response,
        wrap: false,
      });
    } catch (error) {
      console.error('Variable extraction failed:', error);
      return null;
    }
  }

  /**
   * Interpolate variables in a string
   * Supports {{variableName}} syntax
   */
  interpolateVariables(text: string, variables: Record<string, any>): string {
    if (!text) return text;

    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      
      // Support nested paths like {{user.id}}
      const value = this.getNestedValue(variables, trimmedName);
      
      if (value === undefined || value === null) {
        console.warn(`Variable ${trimmedName} not found`);
        return match; // Keep original if not found
      }

      return String(value);
    });
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, prop) => {
      return current?.[prop];
    }, obj);
  }

  /**
   * Validate JSONPath expression
   */
  validateJSONPath(path: string): { valid: boolean; error?: string } {
    try {
      // Test with sample data
      JSONPath({
        path: path,
        json: { test: 'data' },
        wrap: false,
      });
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  /**
   * Get common JSONPath examples for user guidance
   */
  getExamples(): Array<{ path: string; description: string }> {
    return [
      { path: '$.id', description: 'Extract top-level id' },
      { path: '$.data.id', description: 'Extract nested id from data' },
      { path: '$.user.name', description: 'Extract user name' },
      { path: '$.items[0].id', description: 'Extract id from first item in array' },
      { path: '$.items[*].id', description: 'Extract all ids from items array' },
      { path: '$..id', description: 'Extract all ids recursively' },
      { path: '$.token', description: 'Extract authentication token' },
      { path: '$.data.attributes.email', description: 'Extract deeply nested email' },
    ];
  }

  /**
   * Create a chain context for storing variables across requests
   */
  createContext(): ChainContext {
    return {
      variables: {},
      responses: [],
    };
  }

  /**
   * Add response to context
   */
  addResponseToContext(
    context: ChainContext,
    step: number,
    response: any,
    status: number
  ): void {
    context.responses.push({
      step,
      data: response,
      status,
    });
  }

  /**
   * Merge variables into context
   */
  mergeVariables(context: ChainContext, variables: Record<string, any>): void {
    context.variables = {
      ...context.variables,
      ...variables,
    };
  }

  /**
   * Get all variables from context
   */
  getVariables(context: ChainContext): Record<string, any> {
    return context.variables;
  }

  /**
   * Auto-detect common variables in response
   */
  autoDetectVariables(response: any): VariableExtraction[] {
    const suggestions: VariableExtraction[] = [];
    const commonKeys = ['id', 'token', 'userId', 'email', 'accessToken', 'refreshToken', 'uuid'];

    const findKeys = (obj: any, prefix: string = '$') => {
      if (!obj || typeof obj !== 'object') return;

      Object.keys(obj).forEach((key) => {
        const path = `${prefix}.${key}`;
        
        // If it's a common key, suggest it
        if (commonKeys.some(common => key.toLowerCase().includes(common.toLowerCase()))) {
          suggestions.push({
            name: key,
            path: path,
            description: `Auto-detected: ${key}`,
          });
        }

        // Recurse for nested objects (limit depth to avoid infinite loops)
        if (typeof obj[key] === 'object' && prefix.split('.').length < 4) {
          findKeys(obj[key], path);
        }
      });
    };

    findKeys(response);
    return suggestions;
  }

  /**
   * Format variable value for display
   */
  formatVariableValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }
}

export const variableExtractionService = new VariableExtractionService();
