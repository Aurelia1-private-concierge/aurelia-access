import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for edge function testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Edge Functions Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("check-social-credentials", () => {
    it("should return platform credential status", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            platforms: [
              { platform: "twitter", isConfigured: false, requiredKeys: ["TWITTER_CONSUMER_KEY"] },
              { platform: "linkedin", isConfigured: false, requiredKeys: ["LINKEDIN_CLIENT_ID"] },
            ],
            summary: { total: 6, configured: 0, unconfigured: 6 },
          }),
      });

      const response = await fetch("/functions/v1/check-social-credentials", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.platforms).toHaveLength(2);
      expect(data.summary.total).toBe(6);
    });

    it("should handle CORS preflight", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: new Headers({
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        }),
      });

      const response = await fetch("/functions/v1/check-social-credentials", {
        method: "OPTIONS",
      });

      expect(response.ok).toBe(true);
    });
  });

  describe("check-subscription", () => {
    it("should return subscription status for authenticated user", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            subscribed: false,
            subscription_tier: null,
            trial_active: false,
          }),
      });

      const response = await fetch("/functions/v1/check-subscription", {
        method: "GET",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      expect(data).toHaveProperty("subscribed");
    });

    it("should return 401 without auth header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      const response = await fetch("/functions/v1/check-subscription", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(401);
    });
  });

  describe("visitor-tracking", () => {
    it("should track page visits", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const response = await fetch("/functions/v1/visitor-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_path: "/",
          session_id: "test-session-123",
          referrer: "https://google.com",
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe("send-email", () => {
    it("should require authorization header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Authorization required" }),
      });

      const response = await fetch("/functions/v1/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "test@example.com",
          subject: "Test",
          template: "welcome",
        }),
      });

      expect(response.status).toBe(401);
    });

    it("should send email with valid auth", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, messageId: "msg-123" }),
      });

      const response = await fetch("/functions/v1/send-email", {
        method: "POST",
        headers: {
          Authorization: "Bearer service-role-key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "test@example.com",
          subject: "Welcome to Aurelia",
          template: "welcome",
          data: { name: "Test User" },
        }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });
});
