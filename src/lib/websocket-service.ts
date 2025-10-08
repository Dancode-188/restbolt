export type WebSocketMessage = {
  id: string;
  type: 'sent' | 'received' | 'error' | 'system';
  content: string;
  timestamp: Date;
};

export type WebSocketConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type WebSocketEventCallback = (event: {
  type: 'message' | 'open' | 'close' | 'error' | 'status';
  data?: any;
  status?: WebSocketConnectionStatus;
}) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string = '';
  private status: WebSocketConnectionStatus = 'disconnected';
  private listeners: Set<WebSocketEventCallback> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private shouldReconnect = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  connect(url: string, autoReconnect: boolean = false) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.notifyListeners({ type: 'error', data: 'Already connected' });
      return;
    }

    this.url = url;
    this.shouldReconnect = autoReconnect;
    this.reconnectAttempts = 0;
    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.notifyListeners({ type: 'open' });
        this.notifyListeners({
          type: 'message',
          data: {
            id: crypto.randomUUID(),
            type: 'system',
            content: `Connected to ${url}`,
            timestamp: new Date(),
          },
        });
      };

      this.ws.onmessage = (event) => {
        this.notifyListeners({
          type: 'message',
          data: {
            id: crypto.randomUUID(),
            type: 'received',
            content: event.data,
            timestamp: new Date(),
          },
        });
      };

      this.ws.onerror = (error) => {
        this.setStatus('error');
        this.notifyListeners({
          type: 'error',
          data: 'WebSocket error occurred',
        });
        this.notifyListeners({
          type: 'message',
          data: {
            id: crypto.randomUUID(),
            type: 'error',
            content: 'WebSocket error occurred',
            timestamp: new Date(),
          },
        });
      };

      this.ws.onclose = (event) => {
        this.setStatus('disconnected');
        this.notifyListeners({ type: 'close', data: event });
        this.notifyListeners({
          type: 'message',
          data: {
            id: crypto.randomUUID(),
            type: 'system',
            content: `Disconnected: ${event.reason || 'Connection closed'} (Code: ${event.code})`,
            timestamp: new Date(),
          },
        });

        // Auto-reconnect logic
        if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.notifyListeners({
            type: 'message',
            data: {
              id: crypto.randomUUID(),
              type: 'system',
              content: `Reconnecting... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
              timestamp: new Date(),
            },
          });

          this.reconnectTimer = setTimeout(() => {
            this.connect(this.url, this.shouldReconnect);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    } catch (error: any) {
      this.setStatus('error');
      this.notifyListeners({
        type: 'error',
        data: error.message || 'Failed to connect',
      });
    }
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  send(message: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.notifyListeners({ type: 'error', data: 'Not connected' });
      return false;
    }

    try {
      this.ws.send(message);
      this.notifyListeners({
        type: 'message',
        data: {
          id: crypto.randomUUID(),
          type: 'sent',
          content: message,
          timestamp: new Date(),
        },
      });
      return true;
    } catch (error: any) {
      this.notifyListeners({
        type: 'error',
        data: error.message || 'Failed to send message',
      });
      return false;
    }
  }

  getStatus(): WebSocketConnectionStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  subscribe(callback: WebSocketEventCallback) {
    this.listeners.add(callback);
    // Send current status to new subscriber
    callback({ type: 'status', status: this.status });
    return () => this.listeners.delete(callback);
  }

  private setStatus(status: WebSocketConnectionStatus) {
    this.status = status;
    this.notifyListeners({ type: 'status', status });
  }

  private notifyListeners(event: Parameters<WebSocketEventCallback>[0]) {
    this.listeners.forEach((listener) => listener(event));
  }
}

export const websocketService = new WebSocketService();
