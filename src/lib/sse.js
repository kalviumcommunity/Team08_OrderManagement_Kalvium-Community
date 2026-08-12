/**
 * Server-Sent Events (SSE) Manager
 * Maintains a global set of active client stream controllers to broadcast real-time updates.
 */

// Access NodeJS global scope to preserve connections across Next.js reloads
const globalForSSE = global;

if (!globalForSSE.sseClients) {
  globalForSSE.sseClients = new Set();
}

const clients = globalForSSE.sseClients;

/**
 * Register a new SSE client controller into the active broadcast pool.
 * 
 * @param {ReadableStreamDefaultController} client - The stream controller for the connected client
 * @returns {Function} - Cleanup function to unregister client upon disconnection
 */
export function addSSEClient(client) {
  clients.add(client);
  // Return unregister callback for connection closing
  return () => clients.delete(client);
}

/**
 * Broadcast an event payload to all connected SSE clients.
 * 
 * @param {string} event - The name of the event (e.g., "order:created", "inventory:restocked")
 * @param {object|any} data - The payload data to serialize as JSON and send
 */
export function broadcastSSE(event, data) {
  // Format message according to Server-Sent Events specification: event: <name>\ndata: <json>\n\n
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  
  // Deliver message to each connected client
  for (const client of clients) {
    try {
      client.enqueue(new TextEncoder().encode(payload));
    } catch (error) {
      console.error("Error broadcasting to SSE client:", error);
      // Remove dead or broken client connection
      clients.delete(client);
    }
  }
}
