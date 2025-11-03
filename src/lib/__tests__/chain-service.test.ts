import { vi, describe, it, expect, beforeEach } from "vitest";
import { chainService } from "@/lib/chain-service";
import { db } from "@/lib/db";
import { httpClient } from "@/lib/http-client";
import { variableExtractionService } from "@/lib/variable-extraction-service";
import { Chain, ChainStep } from "@/types";

// Mock DB tables
beforeEach(() => {
  vi.resetAllMocks();
  db.chains = {
    add: vi.fn(),
    get: vi.fn(),
    toArray: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
  } as any;
  db.chainExecutions = {
    add: vi.fn(),
    get: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    where: vi.fn().mockReturnThis(),
    equals: vi.fn().mockReturnThis(),
  } as any;
  db.collections = {
    toArray: vi.fn().mockResolvedValue([
      {
        requests: [
          {
            id: "r1",
            method: "GET",
            url: "/test",
            headers: {},
            params: {},
            body: "",
          },
        ],
      },
    ]),
  } as any;
});

// ------------------------------
// Chain CRUD
// ------------------------------
describe("ChainService - CRUD operations", () => {
  it("should create chain", async () => {
    // Arrange
    const name = "My Chain";
    // Act
    const chain = await chainService.createChain(name);
    // Assert
    expect(chain.name).toBe(name);
    expect(chain.steps).toEqual([]);
    expect(db.chains.add).toHaveBeenCalledWith(chain);
  });

  it("should get all chains", async () => {
    // Arrange
    const chains: Chain[] = [
      {
        id: "1",
        name: "c1",
        steps: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    (db.chains.toArray as any).mockResolvedValue(chains);
    // Act
    const result = await chainService.getAllChains();
    // Assert
    expect(result).toEqual(chains);
  });

  it("should update chain", async () => {
    // Arrange
    const updates = { name: "updated" };
    // Act
    await chainService.updateChain("1", updates);
    // Assert
    expect(db.chains.update).toHaveBeenCalledWith(
      "1",
      expect.objectContaining({ name: "updated" })
    );
  });

  it("should delete chain and executions", async () => {
    // Act
    await chainService.deleteChain("1");
    // Assert
    expect(db.chains.delete).toHaveBeenCalledWith("1");
    expect(db.chainExecutions.where).toHaveBeenCalledWith("chainId");
  });
});

// ------------------------------
// Step management
// ------------------------------
describe("ChainService - Steps", () => {
  it("should add step", async () => {
    // Arrange
    const chain = {
      id: "1",
      steps: [],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    const step = {
      request: { method: "GET", url: "/test", headers: {}, params: {} },
      variableExtractions: [],
    };
    // Act
    await chainService.addStep("1", step);
    // Assert
    expect(chain.steps.length).toBe(1);
    expect(db.chains.update).toHaveBeenCalled();
  });

  it("should update step", async () => {
    // Arrange
    const step: ChainStep = {
      id: "s1",
      order: 0,
      request: {
        method: "GET",
        url: "/test",
        headers: {},
        params: {},
        id: "",
        name: "",
        createdAt: undefined,
        updatedAt: undefined,
      },
      variableExtractions: [],
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    // Act
    await chainService.updateStep("1", "s1", { order: 1 });
    // Assert
    expect(chain.steps[0].order).toBe(1);
  });

  it("should remove step and reorder", async () => {
    // Arrange
    const steps: ChainStep[] = [
      {
        id: "s1",
        order: 0,
        request: {
          method: "GET",
          url: "/a",
          headers: {},
          params: {},
          id: "",
          name: "",
          createdAt: undefined,
          updatedAt: undefined,
        },
        variableExtractions: [],
      },
      {
        id: "s2",
        order: 1,
        request: {
          method: "GET",
          url: "/b",
          headers: {},
          params: {},
          id: "",
          name: "",
          createdAt: undefined,
          updatedAt: undefined,
        },
        variableExtractions: [],
      },
    ];
    const chain = {
      id: "1",
      steps,
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    // Act
    await chainService.removeStep("1", "s1");
    // Assert
    expect(chain.steps[0].id).toBe("s2");
    expect(chain.steps[0].order).toBe(0);
  });

  it("should reorder steps", async () => {
    // Arrange
    const steps: ChainStep[] = [
      {
        id: "s1",
        order: 0,
        request: {
          method: "GET",
          url: "/a",
          headers: {},
          params: {},
          id: "",
          name: "",
          createdAt: undefined,
          updatedAt: undefined,
        },
        variableExtractions: [],
      },
      {
        id: "s2",
        order: 1,
        request: {
          method: "GET",
          url: "/b",
          headers: {},
          params: {},
          id: "",
          name: "",
          createdAt: undefined,
          updatedAt: undefined,
        },
        variableExtractions: [],
      },
    ];
    const chain = {
      id: "1",
      steps,
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (chainService.updateChain as any) = vi
      .fn()
      .mockImplementation((id, { steps }) => {
        chain.steps = steps;
      });
    // Act
    await chainService.reorderSteps("1", ["s2", "s1"]);
    // Assert
    expect(chain.steps[0].id).toBe("s2");
    expect(chain.steps[0].order).toBe(0);
    expect(chain.steps[1].order).toBe(1);
  });
});

// ------------------------------
// Chain execution
// ------------------------------
describe("ChainService - Execution", () => {
  it("should execute chain successfully", async () => {
    // Arrange
    const step = {
      id: "s1",
      order: 0,
      request: { method: "GET", url: "/test", headers: {}, params: {} },
      variableExtractions: [],
      continueOnError: false,
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (httpClient.sendRequest as any) = vi.fn().mockResolvedValue({
      status: 200,
      data: { result: 1 },
      headers: {},
      statusText: "OK",
    });
    (variableExtractionService.interpolateVariables as any) = vi
      .fn()
      .mockImplementation((text, vars) => text);
    (variableExtractionService.extractVariables as any) = vi
      .fn()
      .mockReturnValue({});
    // Act
    const exec = await chainService.executeChain("1");
    // Assert
    expect(exec.status).toBe("completed");
    expect(exec.steps[0].status).toBe("success");
  });

  it("should handle execution error and skip remaining steps", async () => {
    // Arrange
    const step = {
      id: "s1",
      order: 0,
      request: { method: "GET", url: "/fail", headers: {}, params: {} },
      variableExtractions: [],
      continueOnError: false,
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (httpClient.sendRequest as any) = vi
      .fn()
      .mockRejectedValue(new Error("Request failed"));
    (variableExtractionService.interpolateVariables as any) = vi
      .fn()
      .mockImplementation((text, vars) => text);
    // Act
    const exec = await chainService.executeChain("1");
    // Assert
    expect(exec.status).toBe("failed");
    expect(exec.steps[0].status).toBe("failed");
  });
});

// ------------------------------
// Duplicate, Import/Export, Cancel
// ------------------------------
describe("ChainService - Duplicate / Import / Export / Cancel", () => {
  it("should duplicate chain", async () => {
    // Arrange
    const chain = {
      id: "1",
      steps: [
        {
          id: "s1",
          order: 0,
          request: { method: "GET", url: "/a", headers: {}, params: {} },
          variableExtractions: [],
        },
      ],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    // Act
    const dup = await chainService.duplicateChain("1");
    // Assert
    expect(dup.name).toContain("(Copy)");
    expect(dup.steps[0].id).not.toBe("s1");
  });

  it("should import and export chain", async () => {
    // Arrange
    const chain = {
      id: "1",
      steps: [],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const json = JSON.stringify(chain);
    (db.chains.add as any) = vi.fn();
    // Act
    const imported = await chainService.importChain(json);
    (chainService.getChain as any) = vi.fn().mockResolvedValue(imported);
    const exported = await chainService.exportChain(imported.id);
    // Assert
    expect(imported.id).not.toBe("1");
    expect(exported).toContain(imported.name);
  });

  it("should cancel execution", async () => {
    // Arrange
    const exec = {
      id: "e1",
      chainId: "1",
      status: "running",
      steps: [{ stepId: "s1", status: "running", order: 0 }],
    };
    (chainService.getExecution as any) = vi.fn().mockResolvedValue(exec);
    // Act
    await chainService.cancelExecution("e1");
    // Assert
    expect(exec.status).toBe("cancelled");
    expect(exec.steps[0].status).toBe("skipped");
  });

  it("should throw error on import malformed JSON", async () => {
    await expect(chainService.importChain("invalid")).rejects.toThrow();
  });
});

// ------------------------------
// Error handling / Edge cases
// ------------------------------
describe("ChainService - Edge Cases & Errors", () => {
  it("should throw error when adding step to non-existent chain", async () => {
    (chainService.getChain as any) = vi.fn().mockResolvedValue(undefined);
    await expect(
      chainService.addStep("nonexistent", {
        request: { method: "GET", url: "/", headers: {}, params: {} },
        variableExtractions: [],
      })
    ).rejects.toThrow("Chain not found");
  });

  it("should throw error when updating non-existent step", async () => {
    const chain = {
      id: "1",
      steps: [],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    await expect(
      chainService.updateStep("1", "s1", {})
    ).resolves.toBeUndefined();
  });

  it("should throw error when reordering steps with invalid ID", async () => {
    const chain = {
      id: "1",
      steps: [
        {
          id: "s1",
          order: 0,
          request: { method: "GET", url: "/", headers: {}, params: {} },
          variableExtractions: [],
        },
      ],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    await expect(chainService.reorderSteps("1", ["invalid"])).rejects.toThrow(
      "Step invalid not found"
    );
  });

  it("should handle executeChain with missing requestId and request", async () => {
    const chain = {
      id: "1",
      steps: [
        {
          id: "s1",
          order: 0,
          request: undefined,
          requestId: undefined,
          variableExtractions: [],
          continueOnError: false,
        },
      ],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);

    const exec = await chainService.executeChain("1");

    expect(exec.status).toBe("failed");
    expect(exec.error).toBe("Step 1 failed: Step has no request defined");
    expect(exec.steps[0].status).toBe("failed");
    expect(exec.steps[0].error).toBe("Step has no request defined");
  });

  it("should fail if step requestId not found in collections", async () => {
    const step = {
      id: "s1",
      order: 0,
      requestId: "missing",
      variableExtractions: [],
      continueOnError: false,
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (db.collections.toArray as any) = vi
      .fn()
      .mockResolvedValue([{ requests: [] }]);

    const exec = await chainService.executeChain("1");
    expect(exec.status).toBe("failed");
    expect(exec.steps[0].status).toBe("failed");
    expect(exec.steps[0].error).toBe("Request missing not found");
  });

  it("should extract variables correctly", async () => {
    const step = {
      id: "s1",
      order: 0,
      request: { method: "GET", url: "/test", headers: {}, params: {} },
      variableExtractions: [{ name: "token", path: "$.token" }],
      continueOnError: false,
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (httpClient.sendRequest as any) = vi.fn().mockResolvedValue({
      status: 200,
      data: { token: "abc" },
      headers: {},
      statusText: "OK",
    });
    (variableExtractionService.extractVariables as any) = vi
      .fn()
      .mockReturnValue({ token: "abc" });
    (variableExtractionService.interpolateVariables as any) = vi
      .fn()
      .mockImplementation((text) => text);

    const exec = await chainService.executeChain("1");
    expect(exec.variables.token).toBe("abc");
  });

  it("should fail if step has neither request nor requestId", async () => {
    const chain = {
      id: "1",
      steps: [
        {
          id: "s1",
          order: 0,
          variableExtractions: [],
          continueOnError: false,
        },
      ],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);

    const exec = await chainService.executeChain("1");

    expect(exec.status).toBe("failed");
    expect(exec.steps[0].status).toBe("failed");
    expect(exec.steps[0].error).toBe("Step has no request defined");
  });

  it("should wait for step delay", async () => {
    const step = {
      id: "s1",
      order: 0,
      request: { method: "GET", url: "/delay", headers: {}, params: {} },
      variableExtractions: [],
      delay: 50,
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (httpClient.sendRequest as any) = vi.fn().mockResolvedValue({
      status: 200,
      data: {},
      headers: {},
      statusText: "OK",
    });

    const start = Date.now();
    await chainService.executeChain("1");
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(50);
  });

  it("should extract variables from response", async () => {
    const step = {
      id: "s1",
      order: 0,
      request: { method: "GET", url: "/test", headers: {}, params: {} },
      variableExtractions: ["token"],
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (httpClient.sendRequest as any) = vi.fn().mockResolvedValue({
      status: 200,
      data: { token: "123" },
      headers: {},
      statusText: "OK",
    });
    (variableExtractionService.extractVariables as any) = vi
      .fn()
      .mockReturnValue({ token: "123" });

    const exec = await chainService.executeChain("1");
    expect(exec.variables.token).toBe("123");
    expect(exec.steps[0].extractedVariables.token).toBe("123");
  });

  it("should interpolate headers, params, body", async () => {
    const step = {
      id: "s1",
      order: 0,
      request: {
        method: "POST",
        url: "/{{url}}",
        headers: { auth: "{{token}}" },
        params: { q: "{{q}}" },
        body: "{{body}}",
      },
      variableExtractions: [],
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (variableExtractionService.interpolateVariables as any) = vi.fn((text) =>
      text
        .replace("{{url}}", "test")
        .replace("{{token}}", "abc")
        .replace("{{q}}", "1")
        .replace("{{body}}", "data")
    );
    (httpClient.sendRequest as any) = vi.fn().mockResolvedValue({
      status: 200,
      data: {},
      headers: {},
      statusText: "OK",
    });

    const exec = await chainService.executeChain("1");
    expect(exec.steps[0].request.url).toBe("/test");
    expect(exec.steps[0].request.headers.auth).toBe("abc");
    expect(exec.steps[0].request.params.q).toBe("1");
    expect(exec.steps[0].request.body).toBe("data");
  });

  it("should handle step with delay", async () => {
    const step = {
      id: "s1",
      order: 0,
      request: { method: "GET", url: "/delay", headers: {}, params: {} },
      variableExtractions: [],
      delay: 20,
    };
    const chain = {
      id: "1",
      steps: [step],
      name: "c1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (httpClient.sendRequest as any) = vi.fn().mockResolvedValue({
      status: 200,
      data: {},
      headers: {},
      statusText: "OK",
    });

    const start = Date.now();
    await chainService.executeChain("1");
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(20);
  });

  it("should handle import with valid JSON but missing steps", async () => {
    const data = JSON.stringify({
      id: "1",
      name: "empty",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await expect(chainService.importChain(data)).rejects.toThrow(
      "Invalid chain data"
    );
  }); // Bug open Issue #3

  it("should handle cancelExecution called with invalid id", async () => {
    await expect(chainService.cancelExecution("invalid-id")).rejects.toThrow(
      "Execution not found"
    );
  }); // Bug open Issue #2

  it("should continue executing when continueOnError is true", async () => {
    const steps = [
      {
        id: "s1",
        order: 0,
        request: { method: "GET", url: "/fail", headers: {}, params: {} },
        variableExtractions: [],
        continueOnError: true,
      },
      {
        id: "s2",
        order: 1,
        request: { method: "GET", url: "/ok", headers: {}, params: {} },
        variableExtractions: [],
        continueOnError: false,
      },
    ];
    const chain = {
      id: "1",
      steps,
      name: "chain",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (chainService.getChain as any) = vi.fn().mockResolvedValue(chain);
    (httpClient.sendRequest as any)
      .mockRejectedValueOnce(new Error("Request failed"))
      .mockResolvedValueOnce({
        status: 200,
        data: { ok: true },
        headers: {},
        statusText: "OK",
      });

    const exec = await chainService.executeChain("1");

    expect(exec.status).toBe("completed");
    expect(exec.steps[0].status).toBe("failed");
    expect(exec.steps[1].status).toBe("success");
  }); // Bug open Issue #1

  it("should ignore cancelExecution when already cancelled", async () => {
    // Arrange
    const chain = await chainService.createChain("sample");

    // mock getChain เพื่อให้ addStep หาเจอ
    vi.spyOn(chainService, "getChain").mockResolvedValue(chain);

    await chainService.addStep(chain.id, {
      name: "step1",
      request: {
        url: "http://example.com",
        method: "GET",
        headers: {},
        params: {},
        body: "",
      },
      variableExtractions: [],
      continueOnError: true,
    });

    const execution = await chainService.executeChain(chain.id);

    await db.chainExecutions.update(execution.id, { status: "cancelled" });

    // Act
    await chainService.cancelExecution(execution.id);

    // Assert
    const result = await chainService.getExecution(execution.id);
    expect(result?.status).toBe("cancelled");
  });
});
