const clients = new Set();

export function addSSEClient(client) {
  clients.add(client);
  return () => clients.delete(client);
}

export function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.enqueue(new TextEncoder().encode(payload));
  }
}
