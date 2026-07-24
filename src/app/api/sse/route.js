import { addSSEClient } from "@/lib/sse";

export async function GET(req) {
  const encoder = new TextEncoder();
  let cleanup;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode("event: ping\ndata: connected\n\n"));

      // Keep connection alive with periodic pings
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode("event: ping\ndata: ping\n\n"));
        } catch (error) {
          // If connection is dead, cleanup
          clearInterval(pingInterval);
          if (cleanup) cleanup();
        }
      }, 30000); // Send ping every 30 seconds

      // Add the controller to the SSE registry
      cleanup = addSSEClient(controller);

      // Save custom function on client cleanup to clear ping interval as well
      const originalCleanup = cleanup;
      cleanup = () => {
        clearInterval(pingInterval);
        originalCleanup();
      };
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Disable buffering in Nginx/Vercel
    },
  });
}
