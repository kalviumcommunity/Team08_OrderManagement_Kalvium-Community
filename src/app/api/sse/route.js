export const dynamic = "force-dynamic";

import { addSSEClient } from "@/lib/sse";

/**
 * GET /api/sse
 * Establishes a long-lived Server-Sent Events (SSE) stream with the client.
 * Registers the client stream controller with the SSE broadcast manager,
 * sends periodic heartbeats (pings) every 30 seconds to prevent timeout,
 * and handles client disconnect cleanup.
 */
export async function GET(req) {
  const encoder = new TextEncoder();
  let cleanup;

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connection confirmation event
      controller.enqueue(encoder.encode("event: ping\ndata: connected\n\n"));

      // 2. Keep connection alive with periodic 30-second ping heartbeats
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode("event: ping\ndata: ping\n\n"));
        } catch (error) {
          // If connection is broken or closed, cleanup resources
          clearInterval(pingInterval);
          if (cleanup) cleanup();
        }
      }, 30000);

      // 3. Register client controller into the global broadcast set
      cleanup = addSSEClient(controller);

      // 4. Wrap cleanup function to also cancel ping intervals
      const originalCleanup = cleanup;
      cleanup = () => {
        clearInterval(pingInterval);
        originalCleanup();
      };
    },
    // Called when the client terminates the connection
    cancel() {
      if (cleanup) cleanup();
    },
  });

  // Return standard EventStream response headers
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable response buffering in reverse proxies (e.g., Nginx)
    },
  });
}
