import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { httpClient } from "../http-client";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

describe("HttpClient", () => {
  // let httpClient: HttpClient;

  beforeEach(() => {
    // httpClient = new HttpClient();
    vi.clearAllMocks();
  });

  describe("sendRequest", () => {
    it("Should send GET request successfully", async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: { message: "Success" },
      };
      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await httpClient.sendRequest({
        method: "GET",
        url: "https://api.example.com/data",
      });

      // Assert
      expect(result.status).toBe(200);
      expect(result.data.message).toBe("Success");
    });

    it("should send a POST request with JSON body", async () => {
      // Arrange
      const mockResponse = {
        status: 201,
        data: { id: 1, name: "test1" },
      };

      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await httpClient.sendRequest({
        method: "POST",
        url: "https://api.example.com/create",
        body: JSON.stringify({ name: "test1" }),
        headers: { "Content-Type": "application/json" },
      });

      // Assert

      expect(mockedAxios).toHaveBeenCalledWith({
        method: "POST",
        url: "https://api.example.com/create",
        headers: { "Content-Type": "application/json" },
        params: {},
        data: { name: "test1" },
      });
      expect(result.data.id).toBe(1);
    });

    it("should send a PUT request successfully", async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        data: { updated: true },
      };

      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await httpClient.sendRequest({
        method: "PUT",
        url: "https://api.example.com/update",
        body: JSON.stringify({ key: "value" }),
      });

      // Assert

      expect(result.data.updated).toBe(true);
    });

    it("should send a PATCH request successfully", async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        data: { patched: true },
      };

      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await httpClient.sendRequest({
        method: "PATCH",
        url: "https://api.example.com/patch",
        body: JSON.stringify({ partial: "value" }),
      });

      // Assert

      expect(result.data.patched).toBe(true);
    });

    it("should send a DELETE request successfully", async () => {
      // Arrange
      const mockResponse = {
        status: 204,
        data: {},
      };

      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await httpClient.sendRequest({
        method: "DELETE",
        url: "https://api.example.com/delete/1",
      });

      // Assert

      expect(result.status).toBe(204);
    });

    it("should send a HEAD request successfully", async () => {
      // Arrange
      const mockResponse = { status: 200, headers: { "x-total": "5" } };

      mockedAxios.mockResolvedValueOnce(mockResponse);
      // Act
      const result = await httpClient.sendRequest({
        method: "HEAD",
        url: "https://api.example.com/head",
      });
      // Assert
      expect(result.headers["x-total"]).toBe("5");
    });

    it("should send an OPTIONS request successfully", async () => {
      // Arrange
      const mockResponse = { status: 204, headers: { allow: "GET,POST" } };

      mockedAxios.mockResolvedValueOnce(mockResponse);
      // Act
      const result = await httpClient.sendRequest({
        method: "OPTIONS",
        url: "https://api.example.com/options",
      });
      // Assert
      expect(result.headers.allow).toContain("GET");
    });

    it("should include herders and query params", async () => {
      // Arrange
      const mockResponse = {
        status: 201,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        data: { users: [{ id: 1, name: "test1" }] },
      };
      mockedAxios.mockResolvedValue(mockResponse);

      const headers = { "X-test": "1" };
      const params = { page: "1" };

      // Act
      const result = await httpClient.sendRequest({
        method: "GET",
        url: "https://api.example.com/users",
        headers,
        params,
      });

      // Assert
      expect(result.data).toEqual({ users: [{ id: 1, name: "test1" }] });

      expect(mockedAxios).toHaveBeenCalledWith({
        method: "GET",
        url: "https://api.example.com/users",
        headers,
        params,
      });
    });

    it("should include Authorization header for bearer token", async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        data: { ok: true },
      };

      mockedAxios.mockResolvedValue(mockResponse);

      const token = "jwt-token-123";
      const headers = { Authorization: `Bearer ${token}` };
      const params = {};
      // Act
      const result = await httpClient.sendRequest({
        method: "GET",
        url: "https://api.example.com/profile",
        headers,
        params,
      });

      // Assert

      expect(mockedAxios).toHaveBeenCalledWith({
        method: "GET",
        url: "https://api.example.com/profile",
        headers,
        params,
      });
      expect(result.data.ok).toBe(true);
    });

    it("should replace URL variables correctly", async () => {
      // Arrange
      const userId = 42;
      const mockResponse = {
        status: 200,
        data: { id: userId },
      };

      mockedAxios.mockResolvedValue(mockResponse);

      const headers = {};
      const params = {};

      // Act
      const result = await httpClient.sendRequest({
        method: "GET",
        url: "https://api.example.com/user/${userId}",
        headers,
        params,
      });

      // Assert
      expect(mockedAxios).toHaveBeenCalledWith({
        method: "GET",
        url: "https://api.example.com/user/${userId}",
        headers,
        params,
      });
      expect(result.data.id).toBe(42);
    });

    it("should handle 4xx/5xx error responses gracefully", async () => {
      // Arrange
      const mockError = {
        response: {
          status: 500,
          statusText: "Server Error",
          data: { message: "Internal Error" },
          headers: {},
        },
      };

      mockedAxios.mockRejectedValue(mockError);

      // Act
      const result = await httpClient.sendRequest({
        method: "GET",
        url: "https://api.example.com/error",
      });

      // Assert
      expect(result.status).toBe(500);
      expect(result.data.message).toBe("Internal Error");
    });

    it("should throw a network error if no response is received", async () => {
      // Arrange

      mockedAxios.mockRejectedValue(new Error("Network down"));

      // Act & Assert
      await expect(
        httpClient.sendRequest({
          method: "GET",
          url: "https://api.example.com/offline",
        })
      ).rejects.toThrow("Network down");
    });

    it("should throw default message if error has no message", async () => {
      // Arrange

      mockedAxios.mockRejectedValue({});

      // Act & Assert
      await expect(
        httpClient.sendRequest({
          method: "GET",
          url: "https://api.example.com/undefined-error",
        })
      ).rejects.toThrow("Network error occurred");
    });

    it("should send raw string body when JSON parsing fails", async () => {
      // Arrange
      const mockResponse = {
        status : 200,
        statusText : 'OK',
        headers : { 'content-type': 'text/plain' },
        data : 'done',
      }
      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await httpClient.sendRequest({
        method : 'POST',
        url : 'https://api.example.com/raw',
        body : '{invalid: json}'
      });
      // Assert
      expect(result.status).toBe(200)
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          data : '{invalid: json}',
        })
      ); 
    });

  });
});
