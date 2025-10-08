/**
 * Scripting service for pre-request and post-response scripts
 * Provides a sandboxed JavaScript execution environment
 */

export interface ScriptContext {
  // Variables that persist across requests
  variables: Map<string, any>;
  // Environment variables
  environment: Record<string, string>;
  // Request being sent
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
  };
  // Response received (only in post-response scripts)
  response?: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: any;
    time: number;
  };
  // Console output
  console: {
    log: (...args: any[]) => void;
    error: (...args: any[]) => void;
    warn: (...args: any[]) => void;
  };
  // Test results (only in post-response scripts)
  tests: {
    [testName: string]: boolean;
  };
}

export interface ScriptResult {
  success: boolean;
  error?: string;
  logs: Array<{ type: 'log' | 'error' | 'warn'; message: string }>;
  variables: Map<string, any>;
  tests?: { [testName: string]: boolean };
}

class ScriptingService {
  private globalVariables: Map<string, any> = new Map();

  /**
   * Get a variable value
   */
  getVariable(key: string): any {
    return this.globalVariables.get(key);
  }

  /**
   * Set a variable value
   */
  setVariable(key: string, value: any): void {
    this.globalVariables.set(key, value);
  }

  /**
   * Get all variables
   */
  getAllVariables(): Map<string, any> {
    return new Map(this.globalVariables);
  }

  /**
   * Clear all variables
   */
  clearVariables(): void {
    this.globalVariables.clear();
  }

  /**
   * Delete a specific variable
   */
  deleteVariable(key: string): void {
    this.globalVariables.delete(key);
  }

  /**
   * Replace {{variable}} placeholders in text
   */
  interpolateVariables(text: string, env: Record<string, string> = {}): string {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const trimmedName = varName.trim();
      
      // Check variables first
      if (this.globalVariables.has(trimmedName)) {
        return String(this.globalVariables.get(trimmedName));
      }
      
      // Check environment variables
      if (env[trimmedName] !== undefined) {
        return env[trimmedName];
      }
      
      // Return original if not found
      return match;
    });
  }

  /**
   * Execute a pre-request script
   */
  async executePreRequestScript(
    script: string,
    request: ScriptContext['request'],
    env: Record<string, string> = {}
  ): Promise<ScriptResult> {
    const logs: ScriptResult['logs'] = [];
    const variables = new Map(this.globalVariables);

    // Create console mock
    const consoleMock = {
      log: (...args: any[]) => logs.push({ type: 'log', message: args.join(' ') }),
      error: (...args: any[]) => logs.push({ type: 'error', message: args.join(' ') }),
      warn: (...args: any[]) => logs.push({ type: 'warn', message: args.join(' ') }),
    };

    // Create context
    const pm = {
      variables: {
        get: (key: string) => variables.get(key),
        set: (key: string, value: any) => variables.set(key, value),
      },
      environment: {
        get: (key: string) => env[key],
      },
      request: { ...request },
    };

    try {
      // Create a function from the script
      const scriptFunction = new Function('pm', 'console', script);
      
      // Execute the script
      await scriptFunction(pm, consoleMock);

      // Update global variables
      variables.forEach((value, key) => {
        this.globalVariables.set(key, value);
      });

      return {
        success: true,
        logs,
        variables,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        logs: [...logs, { type: 'error', message: error.message }],
        variables,
      };
    }
  }

  /**
   * Execute a post-response script (tests)
   */
  async executePostResponseScript(
    script: string,
    request: ScriptContext['request'],
    response: NonNullable<ScriptContext['response']>,
    env: Record<string, string> = {}
  ): Promise<ScriptResult> {
    const logs: ScriptResult['logs'] = [];
    const variables = new Map(this.globalVariables);
    const tests: { [key: string]: boolean } = {};

    // Create console mock
    const consoleMock = {
      log: (...args: any[]) => logs.push({ type: 'log', message: args.join(' ') }),
      error: (...args: any[]) => logs.push({ type: 'error', message: args.join(' ') }),
      warn: (...args: any[]) => logs.push({ type: 'warn', message: args.join(' ') }),
    };

    // Create pm object (Postman-like API)
    const pm = {
      variables: {
        get: (key: string) => variables.get(key),
        set: (key: string, value: any) => variables.set(key, value),
      },
      environment: {
        get: (key: string) => env[key],
      },
      request: { ...request },
      response: {
        code: response.status,
        status: response.statusText,
        headers: response.headers,
        json: () => {
          try {
            return typeof response.body === 'string' 
              ? JSON.parse(response.body) 
              : response.body;
          } catch {
            return null;
          }
        },
        text: () => typeof response.body === 'string' 
          ? response.body 
          : JSON.stringify(response.body),
        responseTime: response.time,
      },
      test: (testName: string, fn: () => boolean | void) => {
        try {
          const result = fn();
          tests[testName] = result === false ? false : true;
        } catch (error) {
          tests[testName] = false;
          logs.push({ type: 'error', message: `Test "${testName}" failed: ${error}` });
        }
      },
      expect: (value: any) => ({
        to: {
          equal: (expected: any) => value === expected,
          eql: (expected: any) => JSON.stringify(value) === JSON.stringify(expected),
          be: {
            a: (type: string) => typeof value === type,
            an: (type: string) => typeof value === type,
            true: value === true,
            false: value === false,
            null: value === null,
            undefined: value === undefined,
          },
          have: {
            property: (prop: string) => value && value.hasOwnProperty(prop),
            length: (len: number) => value && value.length === len,
          },
          include: (item: any) => {
            if (Array.isArray(value)) return value.includes(item);
            if (typeof value === 'string') return value.includes(item);
            return false;
          },
        },
      }),
    };

    try {
      // Create a function from the script
      const scriptFunction = new Function('pm', 'console', script);
      
      // Execute the script
      await scriptFunction(pm, consoleMock);

      // Update global variables
      variables.forEach((value, key) => {
        this.globalVariables.set(key, value);
      });

      return {
        success: true,
        logs,
        variables,
        tests,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        logs: [...logs, { type: 'error', message: error.message }],
        variables,
        tests,
      };
    }
  }
}

export const scriptingService = new ScriptingService();
