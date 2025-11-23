'use client';

import Layout from '@/components/Layout';
import { useState, useEffect, useRef, useMemo } from 'react';
import { authAPI } from '@/lib/auth-api';
import { useAiHistory } from '@/lib/useAiHistory';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai' | 'system'; text: string; ts: string }>>([]);
  const [input, setInput] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { items: historyItems, loadMore, nextCursor } = useAiHistory(50);

  // Simple, safe-ish formatter: escape HTML, then allow **bold** and newlines
  const escapeHTML = (s: string) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const formatAI = (text: string) => {
    const escaped = escapeHTML(text);
    // Bold: **text**
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Newlines
    return withBold.replace(/\n/g, '<br/>');
  };

  useEffect(() => {
    setToken(authAPI.getToken());
  }, []);

  // Seed messages with AI history (prompt then response, oldest first)
  const mappedHistory = useMemo(() => {
    // historyItems are newest first; reverse to oldest first
    const chronological = [...historyItems].reverse();
    const pairs: Array<{ role: 'user' | 'ai'; text: string; ts: string }> = [];
    for (const it of chronological) {
      pairs.push({ role: 'user', text: it.prompt, ts: it.timestamp });
      pairs.push({ role: 'ai', text: it.response, ts: it.timestamp });
    }
    return pairs;
  }, [historyItems]);

  useEffect(() => {
    // Only seed once initially; if you prefer merge, we can dedupe by timestamp + text
    if (mappedHistory.length && messages.length === 0) {
      setMessages(mappedHistory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedHistory]);

  useEffect(() => {
    if (!token) return;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const wsUrl = backendUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/ws?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (e) => {
      console.log('WebSocket message received:', e.data);
      try {
        const data = JSON.parse(e.data);
        if (data?.type === 'ai.reply' && data?.answer) {
          setMessages((prev) => {
            const newMsg = { role: 'ai' as const, text: data.answer, ts: new Date().toISOString() };
            return [...prev, newMsg];
          });
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };
    
    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
    
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
    
    return () => ws.close();
  }, [token]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text, ts: new Date().toISOString() }]);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chat/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authAPI.getToken()}`,
        },
        body: JSON.stringify({ question: text }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API response:', data);
      
      // If response includes answer directly, add it immediately (fallback)
      if (data?.answer) {
        setMessages((prev) => [...prev, { role: 'ai', text: data.answer, ts: new Date().toISOString() }]);
      }
    } catch (e) {
      console.error('Send error:', e);
      setMessages((prev) => [...prev, { role: 'system', text: 'Failed to send question', ts: new Date().toISOString() }]);
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-3 sm:p-4 md:p-6 h-full flex flex-col min-h-0">
        <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 shrink-0">AI Chat</h1>
        <div className="border rounded bg-white p-2 sm:p-3 md:p-4 flex-1 min-h-0 overflow-y-auto">
          {nextCursor && (
            <div className="mb-3 flex justify-center">
              <button className="text-sm text-emerald-700 underline" onClick={() => loadMore()}>
                Load older
              </button>
            </div>
          )}
          {messages.map((m, i) => {
            const isUser = m.role === 'user';
            const isAI = m.role === 'ai';
            const align = isUser ? 'justify-end' : isAI ? 'justify-start' : 'justify-center';
            const bubble = isUser ? 'bg-blue-100 text-blue-900' : isAI ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-800';
            return (
              <div key={i} className={`mb-2 sm:mb-3 flex ${align}`}>
                <div className="max-w-[95%] sm:max-w-[90%]">
                  <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-400 mb-1">
                    {isUser ? 'You' : isAI ? 'AI' : 'System'} • {new Date(m.ts).toLocaleTimeString()}
                  </div>
                  {isAI ? (
                    <div
                      className={`px-3 py-2 rounded ${bubble}`}
                      dangerouslySetInnerHTML={{ __html: formatAI(m.text) }}
                    />
                  ) : (
                    <div className={`px-3 py-2 rounded whitespace-pre-wrap ${bubble}`}>{m.text}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 sm:mt-3 flex gap-1 sm:gap-2 shrink-0">
          <input
            className="flex-1 border rounded px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base"
            placeholder="Ask the AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
          />
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 text-white rounded text-sm sm:text-base" onClick={send}>Send</button>
        </div>
      </div>
    </Layout>
  );
}
