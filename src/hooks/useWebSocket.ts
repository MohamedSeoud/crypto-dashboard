import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ConnectionStatus,
  CryptoPair,
  StreamType,
  SubscribeMessage,
  WSMessage,
} from '../types';

const WS_URL = 'ws://localhost:3001';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

interface UseWebSocketOptions {
  onMessage: (message: WSMessage) => void;
  onStatusChange: (status: ConnectionStatus) => void;
}

export function useWebSocket({ onMessage, onStatusChange }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentSubscriptionRef = useRef<{ pair: CryptoPair; stream: StreamType } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    onStatusChange('connecting');

    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      onStatusChange('connected');
      setIsConnected(true);

      // Re-subscribe if we had a previous subscription
      if (currentSubscriptionRef.current) {
        const msg: SubscribeMessage = {
          type: 'subscribe',
          ...currentSubscriptionRef.current,
        };
        ws.send(JSON.stringify(msg));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as WSMessage;
        onMessage(message);
      } catch {
        console.error('Failed to parse WebSocket message');
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      onStatusChange('disconnected');

      // Attempt reconnection
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_DELAY);
      } else {
        onStatusChange('error');
      }
    };

    ws.onerror = () => {
      onStatusChange('error');
    };

    wsRef.current = ws;
  }, [onMessage, onStatusChange]);

  const subscribe = useCallback(
    (pair: CryptoPair, stream: StreamType) => {
      currentSubscriptionRef.current = { pair, stream };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const msg: SubscribeMessage = {
          type: 'subscribe',
          pair,
          stream,
        };
        wsRef.current.send(JSON.stringify(msg));
      }
    },
    [],
  );

  // Connect on mount, clean up on unmount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return { subscribe, isConnected };
}
