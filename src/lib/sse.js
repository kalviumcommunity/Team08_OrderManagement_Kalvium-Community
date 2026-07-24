const globalForSSE = global;

if (!globalForSSE.sseClients) {
  globalForSSE.sseClients = new Set();
}

const clients = globalForSSE.sseClients;

export function addSSEClient(client) {
  clients.add(client);
  return () => clients.delete(client);
}

export function broadcastSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      client.enqueue(new TextEncoder().encode(payload));
    } catch (error) {
      console.error("Error broadcasting to SSE client:", error);
      clients.delete(client);
    }
  }
}
