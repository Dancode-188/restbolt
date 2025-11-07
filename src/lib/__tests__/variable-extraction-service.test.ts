import { describe, it, expect, beforeEach, vi } from "vitest";
import { variableExtractionService } from "../variable-extraction-service";
import type {
  VariableExtraction,
  ChainContext,
} from "../variable-extraction-service";
import { JSONPath } from "jsonpath-plus";

// Mock JSONPath globally
vi.mock("jsonpath-plus", () => ({
  JSONPath: vi.fn(),
}));

describe("VariableExtractionService", () => {
  const mockResponse = {
    id: 1,
    token: "abc123",
    user: {
      id: 42,
      name: "Jane",
      profile: { email: "jane@example.com" },
    },
    items: [
      { id: 10, name: "itemA" },
      { id: 20, name: "itemB" },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("extractVariables", () => {
    it("should extract variables using JSONPath", () => {
      // Arrange
      (JSONPath as any).mockImplementation(({ path, json }) => {
        if (path === "$.id") return json.id;
        if (path === "$.user.name") return json.user.name;
      });
      const extractions: VariableExtraction[] = [
        { name: "id", path: "$.id" },
        { name: "username", path: "$.user.name" },
      ];

      // Act
      const result = variableExtractionService.extractVariables(
        mockResponse,
        extractions
      );

      // Assert
      expect(result).toEqual({ id: 1, username: "Jane" });
    });

    it("should handle extraction errors gracefully", () => {
      // Arrange
      (JSONPath as any).mockImplementation(() => {
        throw new Error("Invalid path");
      });
      const extractions: VariableExtraction[] = [
        { name: "invalid", path: "$.bad.path" },
      ];

      // Act
      const result = variableExtractionService.extractVariables(
        mockResponse,
        extractions
      );

      // Assert
      expect(result.invalid).toBeNull();
    });
  });

  describe("extractSingleVariable", () => {
    it("should return a single value from JSONPath", () => {
      // Arrange
      (JSONPath as any).mockImplementation(({ json }) => json.user.id);

      // Act
      const result = variableExtractionService.extractSingleVariable(
        mockResponse,
        "$.user.id"
      );

      // Assert
      expect(result).toBe(42);
    });

    it("should return null on error", () => {
      // Arrange
      (JSONPath as any).mockImplementation(() => {
        throw new Error("bad");
      });

      // Act
      const result = variableExtractionService.extractSingleVariable(
        mockResponse,
        "$.wrong"
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("interpolateVariables", () => {
    it("should replace {{variable}} placeholders", () => {
      // Arrange
      const text = "User: {{user.name}}, Token: {{token}}";
      const vars = { user: { name: "Jane" }, token: "abc123" };

      // Act
      const result = variableExtractionService.interpolateVariables(text, vars);

      // Assert
      expect(result).toBe("User: Jane, Token: abc123");
    });

    it("should leave unknown variables unchanged", () => {
      // Arrange
      const text = "Hello {{unknown}}";

      // Act
      const result = variableExtractionService.interpolateVariables(text, {});

      // Assert
      expect(result).toBe("Hello {{unknown}}");
    });
  });

  describe("getNestedValue", () => {
    it("should return nested value by dot path", () => {
      // Arrange
      const obj = { a: { b: { c: 10 } } };

      // Act
      const result = (variableExtractionService as any).getNestedValue(
        obj,
        "a.b.c"
      );

      // Assert
      expect(result).toBe(10);
    });

    it("should return undefined for missing path", () => {
      // Arrange
      const obj = { a: 1 };

      // Act
      const result = (variableExtractionService as any).getNestedValue(
        obj,
        "a.b.c"
      );

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe("validateJSONPath", () => {
    it("should return valid true for correct path", () => {
      // Arrange
      (JSONPath as any).mockImplementation(() => "ok");

      // Act
      const result = variableExtractionService.validateJSONPath("$.id");

      // Assert
      expect(result.valid).toBe(true);
    });

    it("should return valid false for invalid path", () => {
      // Arrange
      (JSONPath as any).mockImplementation(() => {
        throw new Error("Invalid");
      });

      // Act
      const result = variableExtractionService.validateJSONPath("invalid path");

      // Assert
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("getExamples", () => {
    it("should return an array of examples", () => {
      // Act
      const examples = variableExtractionService.getExamples();

      // Assert
      expect(examples.length).toBeGreaterThan(3);
      expect(examples[0]).toHaveProperty("path");
    });
  });

  describe("createContext", () => {
    it("should return empty context", () => {
      // Act
      const context = variableExtractionService.createContext();

      // Assert
      expect(context).toEqual({ variables: {}, responses: [] });
    });
  });

  describe("addResponseToContext", () => {
    it("should add response to context", () => {
      // Arrange
      const context = variableExtractionService.createContext();

      // Act
      variableExtractionService.addResponseToContext(
        context,
        1,
        { ok: true },
        200
      );

      // Assert
      expect(context.responses.length).toBe(1);
      expect(context.responses[0].status).toBe(200);
    });
  });

  describe("mergeVariables", () => {
    it("should merge variables into context", () => {
      // Arrange
      const context: ChainContext = { variables: { a: 1 }, responses: [] };

      // Act
      variableExtractionService.mergeVariables(context, { b: 2 });

      // Assert
      expect(context.variables).toEqual({ a: 1, b: 2 });
    });
  });

  describe("getVariables", () => {
    it("should return variables from context", () => {
      // Arrange
      const context: ChainContext = { variables: { x: 5 }, responses: [] };

      // Act
      const vars = variableExtractionService.getVariables(context);

      // Assert
      expect(vars.x).toBe(5);
    });
  });

  describe("autoDetectVariables", () => {
    it("should detect common keys like id and token", () => {
      // Arrange
      const response = mockResponse;

      // Act
      const result = variableExtractionService.autoDetectVariables(response);

      // Assert
      const names = result.map((r) => r.name);
      expect(names).toContain("id");
      expect(names).toContain("token");
    });
  });

  describe("formatVariableValue", () => {
    it("should format objects as JSON", () => {
      // Arrange
      const value = { a: 1 };

      // Act
      const result = variableExtractionService.formatVariableValue(value);

      // Assert
      expect(result).toContain('"a": 1');
    });

    it('should return "null" or "undefined" for those values', () => {
      // Arrange
      const val1 = null;
      const val2 = undefined;

      // Act
      const result1 = variableExtractionService.formatVariableValue(val1);
      const result2 = variableExtractionService.formatVariableValue(val2);

      // Assert
      expect(result1).toBe("null");
      expect(result2).toBe("undefined");
    });

    it("should return string when value is a number", () => {
      // Arrange
      const service = variableExtractionService;
      const value = 42;

      // Act
      const result = service.formatVariableValue(value);

      // Assert
      expect(result).toBe("42");
    });

    it("should return same string when value is a string", () => {
      // Arrange
      const service = variableExtractionService;
      const value = "hello";

      // Act
      const result = service.formatVariableValue(value);

      // Assert
      expect(result).toBe("hello");
    });
  });

  describe("edge cases", () => {
    it("should return null when JSONPath returns undefined", () => {
      (JSONPath as any).mockImplementation(() => undefined);
      const extractions = [{ name: "missing", path: "$.not.exist" }];
      const result = variableExtractionService.extractVariables(
        {},
        extractions
      );
      expect(result.missing).toBeNull();
    });

    it("should replace variable with 'undefined' string if value is undefined", () => {
      const text = "Value: {{missing}}";
      const vars = { missing: undefined };
      const result = variableExtractionService.interpolateVariables(text, vars);
      expect(result).toBe("Value: undefined");
    });
  });
});
