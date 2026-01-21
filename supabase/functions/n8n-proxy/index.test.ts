import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/n8n-proxy`;

Deno.test("n8n-proxy: handles CORS preflight", async () => {
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

Deno.test("n8n-proxy: rejects non-POST methods", async () => {
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

Deno.test("n8n-proxy: rejects missing webhookUrl", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      body: { test: "data" },
    }),
  });

  assertEquals(response.status, 400);
  const data = await response.json();
  assertEquals(data.error, "webhookUrl is required");
});

Deno.test("n8n-proxy: rejects non-whitelisted domains", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      webhookUrl: "https://malicious-site.com/webhook",
      body: { test: "data" },
    }),
  });

  assertEquals(response.status, 403);
  const data = await response.json();
  assertEquals(data.error, "Domain not allowed");
});

Deno.test("n8n-proxy: rejects another non-whitelisted domain", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      webhookUrl: "https://example.com/webhook",
      body: { test: "data" },
    }),
  });

  assertEquals(response.status, 403);
  const data = await response.json();
  assertEquals(data.error, "Domain not allowed");
});

Deno.test("n8n-proxy: accepts valid n8n.cloud domain", async () => {
  // This will attempt to call the actual n8n webhook
  // It may fail at the target, but should not be blocked by our proxy
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      webhookUrl: "https://test.app.n8n.cloud/webhook-test/nonexistent",
      method: "POST",
      body: { test: "data" },
    }),
  });

  // The proxy should allow this through (not 403)
  // The response could be anything depending on the target
  const data = await response.json();
  
  // Should NOT be "Domain not allowed"
  if (response.status === 403) {
    assertEquals(data.error !== "Domain not allowed", true);
  }
  
  // If we get here, the domain was allowed through
  assertExists(data);
});

Deno.test("n8n-proxy: accepts valid hooks.n8n.cloud domain", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      webhookUrl: "https://hooks.n8n.cloud/webhook/test",
      method: "POST",
      body: { test: "data" },
    }),
  });

  const data = await response.json();
  
  // Should NOT be "Domain not allowed"
  if (response.status === 403) {
    assertEquals(data.error !== "Domain not allowed", true);
  }
  
  assertExists(data);
});

Deno.test("n8n-proxy: handles invalid webhook URL format", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      webhookUrl: "not-a-valid-url",
      body: { test: "data" },
    }),
  });

  // Should return an error (either 400 or 500)
  const data = await response.json();
  assertExists(data.error);
});
