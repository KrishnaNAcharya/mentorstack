'use client';

import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useDiscussions, type DiscussionMessage } from '@/lib/useDiscussions';
import { useEffect, useRef, useState } from 'react';
import { authAPI } from '@/lib/auth-api';

export default function CommunityDiscussionsPage() {
  const params = useParams();
  const router = useRouter();
  const communityId = parseInt(params.id as string);

  const [isMember, setIsMember] = useState(false);
  const [message, setMessage] = useState('');
  const { messages, sendMessage, connect, disconnect, connected } = useDiscussions();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!communityId) return;
    // verify membership
    authAPI.checkCommunityMembership(communityId)
      .then(res => setIsMember(res.isMember))
      .catch(() => setIsMember(false));
  }, [communityId]);

  useEffect(() => {
    if (isMember && communityId) {
      connect(communityId);
      return () => disconnect();
    }
  }, [isMember, communityId, connect, disconnect]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isMember) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl p-6 h-full">
          <button onClick={() => router.push(`/community/${communityId}`)} className="text-blue-600 mb-4">← Back</button>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
            Join this community to access discussions.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-6xl p-6 h-full flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button onClick={() => router.push(`/community/${communityId}`)} className="text-blue-600">← Back</button>
          <div className={connected ? 'text-emerald-600' : 'text-gray-500'}>
            {connected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
        <div className="bg-white border rounded-lg flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
            {messages.map((m: DiscussionMessage, i: number) => (
              <div key={i} className="flex flex-col">
                <div className="text-sm text-gray-500">{new Date(m.timestamp).toLocaleTimeString()} • {m.senderRole} #{m.senderId}</div>
                <div className="bg-gray-100 rounded px-3 py-2 inline-block max-w-[90%]">{m.content}</div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="border-t p-3 flex gap-2 shrink-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { sendMessage(message); setMessage(''); } }}
              placeholder="Type a message"
              className="flex-1 border rounded px-3 py-2"
            />
            <button
              onClick={() => { sendMessage(message); setMessage(''); }}
              className="px-4 py-2 bg-emerald-500 text-white rounded disabled:opacity-60"
              disabled={!message.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
