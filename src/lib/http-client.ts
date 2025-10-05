import axios, { AxiosRequestConfig } from 'axios';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
}

interface HttpClientResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
}

class HttpClient {
  async sendRequest(options: RequestOptions): Promise<HttpClientResponse> {
    const config: AxiosRequestConfig = {
      method: options.method,
      url: options.url,
      headers: options.headers || {},
      params: options.params || {},
    };

    // Add body for methods that support it
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
      try {
        config.data = JSON.parse(options.body);
      } catch {
        config.data = options.body;
      }
    }

    try {
      const response = await axios(config);
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
        data: response.data,
      };
    } catch (error: any) {
      // Handle error responses
      if (error.response) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers as Record<string, string>,
          data: error.response.data,
        };
      }
      
      // Handle network errors
      throw new Error(error.message || 'Network error occurred');
    }
  }
}

export const httpClient = new HttpClient();
