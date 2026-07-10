import { useEffect, useState } from 'react';

export function useSSE() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('/api/sse');
    eventSource.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => eventSource.close();
  }, []);

  return messages;
}
