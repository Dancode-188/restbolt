import { describe, it, expect, beforeEach, vi } from "vitest";
import { collectionsService } from "../collections-service";
import { db } from "../db";
import { Request, Collection } from "@/types";

vi.mock("../db", () => ({
  db: {
    collections: {
      add: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn(),
    },
  },
}));

describe("collectionsService (AAA pattern)", () => {
  const mockCollection: Collection = {
    id: "col-1",
    name: "Test Collection",
    requests: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest: Request = {
      id: "req-1",
      name: "Test Request",
      method: "GET",
      url: "https://api.test.com",
      headers: undefined,
      params: undefined,
      createdAt: undefined,
      updatedAt: undefined
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ✅ createCollection
  it("should create a new collection and return id", async () => {
    // Arrange
    const mockId = "uuid-123";
    vi.spyOn(global.crypto, "randomUUID").mockReturnValue(mockId);
    (db.collections.add as any).mockResolvedValue(undefined);

    // Act
    const id = await collectionsService.createCollection("My Collection");

    // Assert
    expect(db.collections.add).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockId,
        name: "My Collection",
        requests: [],
      })
    );
    expect(id).toBe(mockId);
  });

  // ✅ addRequestToCollection
  it("should add a request to existing collection", async () => {
    // Arrange
    (db.collections.get as any).mockResolvedValue({ ...mockCollection });
    (db.collections.update as any).mockResolvedValue(undefined);

    // Act
    await collectionsService.addRequestToCollection(
      mockCollection.id,
      mockRequest
    );

    // Assert
    expect(db.collections.update).toHaveBeenCalledWith(
      mockCollection.id,
      expect.objectContaining({
        requests: expect.arrayContaining([
          expect.objectContaining({ id: "req-1" }),
        ]),
      })
    );
  });

  it("should generate a new ID if request has no id", async () => {
    // Arrange
    const mockCollectionCopy = { ...mockCollection };
    (db.collections.get as any).mockResolvedValue(mockCollectionCopy);
    (db.collections.update as any).mockResolvedValue(undefined);
    const mockUuid = "generated-uuid";
    vi.spyOn(global.crypto, "randomUUID").mockReturnValue(mockUuid);

    const requestWithoutId = {
      name: "No ID Request",
      method: "POST",
      url: "https://api.noid.com",
    } as Request;

    // Act
    await collectionsService.addRequestToCollection(
      mockCollectionCopy.id,
      requestWithoutId
    );

    // Assert
    expect(db.collections.update).toHaveBeenCalledWith(
      mockCollectionCopy.id,
      expect.objectContaining({
        requests: expect.arrayContaining([
          expect.objectContaining({ id: mockUuid }), 
        ]),
      })
    );
  });

  it("should throw error if collection not found when adding request", async () => {
    // Arrange
    (db.collections.get as any).mockResolvedValue(undefined);

    // Act + Assert
    await expect(
      collectionsService.addRequestToCollection("not-exist", mockRequest)
    ).rejects.toThrow("Collection not found");
  });

  // ✅ removeRequestFromCollection
  it("should remove a request from collection", async () => {
    // Arrange
    const collectionWithRequests = {
      ...mockCollection,
      requests: [mockRequest],
    };
    (db.collections.get as any).mockResolvedValue(collectionWithRequests);
    (db.collections.update as any).mockResolvedValue(undefined);

    // Act
    await collectionsService.removeRequestFromCollection(
      mockCollection.id,
      mockRequest.id
    );

    // Assert
    expect(db.collections.update).toHaveBeenCalledWith(
      mockCollection.id,
      expect.objectContaining({
        requests: [],
      })
    );
  });

  it("should throw error if collection not found when removing request", async () => {
    // Arrange
    (db.collections.get as any).mockResolvedValue(undefined);

    // Act + Assert
    await expect(
      collectionsService.removeRequestFromCollection("not-exist", "req-1")
    ).rejects.toThrow("Collection not found");
  });

  // ✅ updateCollection
  it("should update collection fields", async () => {
    // Arrange
    (db.collections.update as any).mockResolvedValue(undefined);
    const updates = { name: "Updated Name" };

    // Act
    await collectionsService.updateCollection("col-1", updates);

    // Assert
    expect(db.collections.update).toHaveBeenCalledWith(
      "col-1",
      expect.objectContaining({
        name: "Updated Name",
        updatedAt: expect.any(Date),
      })
    );
  });

  // ✅ deleteCollection
  it("should delete collection by id", async () => {
    // Arrange
    (db.collections.delete as any).mockResolvedValue(undefined);

    // Act
    await collectionsService.deleteCollection("col-1");

    // Assert
    expect(db.collections.delete).toHaveBeenCalledWith("col-1");
  });

  // ✅ getAllCollections
  it("should return all collections", async () => {
    // Arrange
    const mockList = [mockCollection];
    (db.collections.toArray as any).mockResolvedValue(mockList);

    // Act
    const result = await collectionsService.getAllCollections();

    // Assert
    expect(result).toEqual(mockList);
    expect(db.collections.toArray).toHaveBeenCalled();
  });
});
