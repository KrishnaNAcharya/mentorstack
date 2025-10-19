import { useCallback, useRef, useState } from 'react';
import { WS_BASE_URL } from './ws-constants';
import { authAPI } from './auth-api';

export type DiscussionMessage = {
  type: 'community.message' | 'system';
  communityId: number;
  content?: string;
  senderId?: number;
  senderRole?: string;
  timestamp: string;
  message?: string; // for system messages
};

export function useDiscussions() {
  const wsRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [connected, setConnected] = useState(false);

  const connect = useCallback(async (communityId: number) => {
    const token = authAPI.getToken();
    if (!token) return;
    const url = `${WS_BASE_URL}/ws/discussions?communityId=${communityId}&token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        setMessages((prev) => [...prev, data]);
      } catch {}
    };
  }, []);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const sendMessage = useCallback((content: string) => {
    const text = content.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ content: text }));
  }, []);

  return { messages, sendMessage, connect, disconnect, connected };
}
