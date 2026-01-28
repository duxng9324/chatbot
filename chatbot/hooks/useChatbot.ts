'use client'

import { useState } from 'react';

interface Props {
  userId?: string;
  apiBaseUrl: string;
}

export function useChatbot({ userId, apiBaseUrl }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    if (!message) return;

    setMessages(prev => [...prev, { role: 'user', message }]);
    setLoading(true);

    const res = await fetch(`${apiBaseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message,
        user_id: userId ?? null,
      }),
    }).then(r => r.json());

    setMessages(prev => [...prev, { role: 'bot', message: res.reply }]);
    setLoading(false);
  };

  return { messages, sendMessage, loading };
}
