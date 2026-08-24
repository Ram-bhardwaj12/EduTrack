import { useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const EVENTS_URL = API_BASE.replace(/\/api\/?$/, "") + "/api/events";

let channel = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    channel = new BroadcastChannel("edutrack_realtime");
  }
} catch {
  // BroadcastChannel not available or restricted
}

export function broadcastLocalUpdate(type, payload = {}) {
  if (channel) {
    try {
      channel.postMessage({ type, payload, timestamp: Date.now() });
    } catch {
      // Ignore postMessage error
    }
  }
}

export function useRealtimeSync(onUpdate) {
  useEffect(() => {
    let eventSource = null;

    // 1. Cross-tab BroadcastChannel listener (0ms intra-browser latency)
    function handleChannelMessage(e) {
      if (e.data && onUpdate) {
        onUpdate(e.data);
      }
    }

    if (channel) {
      channel.addEventListener("message", handleChannelMessage);
    }

    // 2. Server-Sent Events (SSE) listener (real-time server updates)
    try {
      eventSource = new EventSource(EVENTS_URL);
      eventSource.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (onUpdate) onUpdate(data);
        } catch {
          // JSON parse fallback
        }
      };
    } catch {
      // EventSource fallback
    }

    // 3. Tab Visibility / Focus listener (auto-refresh on tab switch)
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && onUpdate) {
        onUpdate({ type: "TAB_FOCUSED", timestamp: Date.now() });
      }
    }

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      if (channel) {
        channel.removeEventListener("message", handleChannelMessage);
      }
      if (eventSource) {
        eventSource.close();
      }
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [onUpdate]);
}
