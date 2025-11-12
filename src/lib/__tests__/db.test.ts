import "fake-indexeddb/auto";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { RestBoltDB, db } from "../db";
import Dexie from "dexie";

describe("RestBoltDB", () => {
  let testDB: RestBoltDB;

  beforeAll(async () => {
    // Arrange: Create DB instance
    testDB = new RestBoltDB();
    await testDB.open();
  });

  afterAll(async () => {
    // Cleanup
    await testDB.delete();
  });

  it("should extend Dexie", () => {
    // Arrange
    // Act
    const isDexie = testDB instanceof Dexie;
    // Assert
    expect(isDexie).toBe(true);
  });

  it("should have all defined tables", () => {
    // Arrange
    // Act
    const tables = [
      testDB.collections,
      testDB.history,
      testDB.environments,
      testDB.chains,
      testDB.chainExecutions,
    ];
    // Assert
    tables.forEach((table) => expect(table).toBeDefined());
  });

  it("should create and retrieve collection item", async () => {
    // Arrange
    const data = {
      name: "MyCollection",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Act
    const id = await testDB.collections.add(data);
    const result = await testDB.collections.get(id);
    // Assert
    expect(result?.name).toBe("MyCollection");
  });

  it("should create and retrieve history item", async () => {
    // Arrange
    const data = {
      timestamp: new Date(),
      method: "GET",
      url: "https://api.example.com",
    };
    // Act
    const id = await testDB.history.add(data);
    const result = await testDB.history.get(id);
    // Assert
    expect(result?.url).toContain("example.com");
  });

  it("should create and retrieve environment item", async () => {
    // Arrange
    const data = { name: "Local", isActive: true };
    // Act
    const id = await testDB.environments.add(data);
    const result = await testDB.environments.get(id);
    // Assert
    expect(result?.isActive).toBe(true);
  });

  it("should create and retrieve chain item", async () => {
    // Arrange
    const data = {
      name: "TestChain",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Act
    const id = await testDB.chains.add(data);
    const result = await testDB.chains.get(id);
    // Assert
    expect(result?.name).toBe("TestChain");
  });

  it("should create and retrieve chainExecution item", async () => {
    // Arrange
    const data = { chainId: 1, startedAt: new Date(), status: "success" };
    // Act
    const id = await testDB.chainExecutions.add(data);
    const result = await testDB.chainExecutions.get(id);
    // Assert
    expect(result?.status).toBe("success");
  });

  it("should support version upgrade correctly", async () => {
    // Arrange
    const upgradedDB = new RestBoltDB();
    // Act
    await upgradedDB.open();
    const version = upgradedDB.verno;
    // Assert
    expect(version).toBe(3);
    await upgradedDB.delete();
  });

  it("should export singleton db instance", () => {
    // Arrange & Act
    const instance = db;
    // Assert
    expect(instance).toBeInstanceOf(RestBoltDB);
  });
});
