import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { HttpClient } from '../http-client';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient();
    vi.clearAllMocks();
  });

  describe('sendRequest', () => {
    it('should send a GET request successfully', async () => {
      // Arrange
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        data: { message: 'Success' },
      };
      mockedAxios.mockResolvedValue(mockResponse);

      // Act
      const result = await httpClient.sendRequest({
        method: 'GET',
        url: 'https://api.example.com/data',
      });

      // Assert
      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      expect(result.data).toEqual({ message: 'Success' });
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.example.com/data',
        headers: {},
        params: {},
      });
    });

    it('should send a POST request with JSON body', async () => {
      // Arrange
      const mockResponse = {
        status: 201,
        statusText: 'Created',
        headers: {},
        data: { id: 1 },
      };
      mockedAxios.mockResolvedValue(mockResponse);

      const requestBody = JSON.stringify({ name: 'Test' });

      // Act
      const result = await httpClient.sendRequest({
        method: 'POST',
        url: 'https://api.example.com/users',
        body: requestBody,
      });

      // Assert
      expect(result.status).toBe(201);
      expect(result.data).toEqual({ id: 1 });
      expect(mockedAxios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'https://api.example.com/users',
          data: { name: 'Test' },
        })
      );
    });

    it('should include headers and params when provided', async () => {
      // Arrange
      mockedAxios.mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: {},
      });

      // Act
      await httpClient.sendRequest({
        method: 'GET',
        url: 'https://api.example.com/data',
        headers: { Authorization: 'Bearer token123' },
        params: { page: '1', limit: '10' },
      });

      // Assert
      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.example.com/data',
        headers: { Authorization: 'Bearer token123' },
        params: { page: '1', limit: '10' },
      });
    });

    it('should handle error responses gracefully', async () => {
      // Arrange
      const errorResponse = {
        response: {
          status: 404,
          statusText: 'Not Found',
          headers: {},
          data: { error: 'Resource not found' },
        },
      };
      mockedAxios.mockRejectedValue(errorResponse);

      // Act
      const result = await httpClient.sendRequest({
        method: 'GET',
        url: 'https://api.example.com/missing',
      });

      // Assert
      expect(result.status).toBe(404);
      expect(result.statusText).toBe('Not Found');
      expect(result.data).toEqual({ error: 'Resource not found' });
    });

    it('should handle network errors', async () => {
      // Arrange
      const networkError = {
        message: 'Network Error',
        code: 'ECONNREFUSED',
      };
      mockedAxios.mockRejectedValue(networkError);

      // Act
      const result = await httpClient.sendRequest({
        method: 'GET',
        url: 'https://api.example.com/data',
      });

      // Assert
      expect(result.status).toBe(0);
      // Add more assertions based on your error handling logic
    });
  });
});
