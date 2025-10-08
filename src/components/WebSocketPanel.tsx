'use client';

import { useState, useEffect, useRef } from 'react';
import { websocketService, WebSocketMessage, WebSocketConnectionStatus } from '@/lib/websocket-service';
import { useStore } from '@/lib/store';

export default function WebSocketPanel() {
  const { theme } = useStore();
  const [url, setUrl] = useState('wss://echo.websocket.org');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [status, setStatus] = useState<WebSocketConnectionStatus>('disconnected');
  const [autoReconnect, setAutoReconnect] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe((event) => {
      if (event.type === 'message' && event.data) {
        setMessages((prev) => [...prev, event.data]);
      } else if (event.type === 'status' && event.status) {
        setStatus(event.status);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConnect = () => {
    if (status === 'connected') {
      websocketService.disconnect();
    } else {
      if (!url.trim()) {
        alert('Please enter a WebSocket URL');
        return;
      }
      websocketService.connect(url.trim(), autoReconnect);
    }
  };

  const handleSend = () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    const success = websocketService.send(message.trim());
    if (success) {
      setMessage('');
    }
  };

  const handleClear = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  const formatMessage = (msg: WebSocketMessage) => {
    try {
      const parsed = JSON.parse(msg.content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return msg.content;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  const getMessageStyle = (type: WebSocketMessage['type']) => {
    switch (type) {
      case 'sent':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'received':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'system':
        return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              WebSocket
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {getStatusText()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                disabled={status === 'connected'}
                className="rounded"
              />
              Auto-reconnect
            </label>
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Connection URL */}
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="wss://echo.websocket.org"
            disabled={status === 'connected' || status === 'connecting'}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && status === 'disconnected') {
                handleConnect();
              }
            }}
          />
          <button
            onClick={handleConnect}
            className={`px-6 py-2 text-sm font-medium rounded transition-colors ${
              status === 'connected'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            } disabled:opacity-50`}
            disabled={status === 'connecting'}
          >
            {status === 'connected' ? 'Disconnect' : status === 'connecting' ? 'Connecting...' : 'Connect'}
          </button>
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={status !== 'connected'}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && status === 'connected') {
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={status !== 'connected' || !message.trim()}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              No messages yet
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
              Connect to a WebSocket server and start sending messages to see them here
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg border ${getMessageStyle(msg.type)}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">
                    {msg.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all font-mono">
                  {formatMessage(msg)}
                </pre>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
