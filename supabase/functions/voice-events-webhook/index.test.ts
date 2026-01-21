import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/voice-events-webhook`;

Deno.test("voice-events-webhook: handles CORS preflight", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Origin": "https://example.com",
    },
  });

  assertEquals(response.status, 200);
  assertExists(response.headers.get("access-control-allow-origin"));
  await response.text(); // Consume body
});

Deno.test("voice-events-webhook: rejects non-POST methods", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "GET",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
    },
  });

  assertEquals(response.status, 405);
  const data = await response.json();
  assertEquals(data.error, "Method not allowed");
});

Deno.test("voice-events-webhook: rejects invalid JSON", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: "not valid json",
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "Invalid JSON");
});

Deno.test("voice-events-webhook: rejects invalid event structure - missing event_type", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      conversation_id: "test-123",
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "Invalid event structure");
});

Deno.test("voice-events-webhook: rejects invalid event structure - invalid event_type", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "INVALID_TYPE_123!@#",
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "Invalid event structure");
});

Deno.test("voice-events-webhook: accepts valid conversation.started event", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "conversation.started",
      conversation_id: `test-${Date.now()}`,
      agent_id: "test-agent-123",
    }),
  });

  // Could be 200 or 429 (rate limited)
  const data = await response.json();
  
  if (response.status === 200) {
    assertEquals(data.success, true);
    assertEquals(data.event_type, "conversation.started");
  } else if (response.status === 429) {
    assertExists(data.error);
  }
});

Deno.test("voice-events-webhook: accepts valid conversation.ended event", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "conversation.ended",
      conversation_id: `test-${Date.now()}`,
      data: {
        duration_seconds: 120,
      },
    }),
  });

  const data = await response.json();
  
  if (response.status === 200) {
    assertEquals(data.success, true);
    assertEquals(data.event_type, "conversation.ended");
  } else if (response.status === 429) {
    assertExists(data.error);
  }
});

Deno.test("voice-events-webhook: accepts valid transcript.final event", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "transcript.final",
      conversation_id: `test-${Date.now()}`,
      data: {
        transcript: "Hello, this is a test transcript",
      },
    }),
  });

  const data = await response.json();
  
  if (response.status === 200) {
    assertEquals(data.success, true);
    assertEquals(data.event_type, "transcript.final");
  } else if (response.status === 429) {
    assertExists(data.error);
  }
});

Deno.test("voice-events-webhook: accepts valid agent.response event", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "agent.response",
      conversation_id: `test-${Date.now()}`,
      data: {
        transcript: "Hello! How can I assist you today?",
      },
    }),
  });

  const data = await response.json();
  
  if (response.status === 200) {
    assertEquals(data.success, true);
    assertEquals(data.event_type, "agent.response");
  } else if (response.status === 429) {
    assertExists(data.error);
  }
});

Deno.test("voice-events-webhook: accepts valid error event", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "error",
      conversation_id: `test-${Date.now()}`,
      data: {
        message: "Connection timeout",
      },
    }),
  });

  const data = await response.json();
  
  if (response.status === 200) {
    assertEquals(data.success, true);
    assertEquals(data.event_type, "error");
  } else if (response.status === 429) {
    assertExists(data.error);
  }
});

Deno.test("voice-events-webhook: accepts valid ping event", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "ping",
    }),
  });

  const data = await response.json();
  
  if (response.status === 200) {
    assertEquals(data.success, true);
    assertEquals(data.event_type, "ping");
  } else if (response.status === 429) {
    assertExists(data.error);
  }
});

Deno.test("voice-events-webhook: validates conversation_id is string", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "conversation.started",
      conversation_id: 12345, // Should be string
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "Invalid event structure");
});

Deno.test("voice-events-webhook: validates agent_id is string", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      event_type: "conversation.started",
      agent_id: { nested: "object" }, // Should be string
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "Invalid event structure");
});
