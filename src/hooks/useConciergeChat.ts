import { useState, useCallback } from 'react';
import { useRealtimeCrowd, useRealtimeMatches } from '@/hooks/useRealtimeData';

export function useConciergeChat() {
  const [messages, setMessages] = useState<{role: 'user'|'agent', content: string}[]>([
    { role: 'agent', content: "Welcome! I'm your AI Concierge. How can I help you navigate the stadium or find match info today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const crowdData = useRealtimeCrowd().data;
  const matchData = useRealtimeMatches().data;

  const sendMessage = useCallback(async (userMsg: string) => {
    if (!userMsg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          // Inject real-time localized state context
          context: { crowd: crowdData, matches: matchData }
        })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'agent', content: data.reply || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(prev => [...prev, { role: 'agent', content: "An error occurred connecting to the control room." }]);
    } finally {
      setIsLoading(false);
    }
  }, [crowdData, matchData]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage
  };
}
