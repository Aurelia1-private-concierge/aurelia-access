import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSocialAdvertising, PLATFORM_INFO, AUDIENCE_PRESETS } from "@/hooks/useSocialAdvertising";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() =>
            Promise.resolve({ data: [], error: null })
          ),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: "test-id" }, error: null })),
        })),
      })),
    })),
    functions: {
      invoke: vi.fn(() => Promise.resolve({ data: { message: "Success" }, error: null })),
    },
  },
}));

// Mock toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe("useSocialAdvertising", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("PLATFORM_INFO", () => {
    it("should contain all supported platforms", () => {
      expect(PLATFORM_INFO).toHaveProperty("twitter");
      expect(PLATFORM_INFO).toHaveProperty("linkedin");
      expect(PLATFORM_INFO).toHaveProperty("instagram");
      expect(PLATFORM_INFO).toHaveProperty("facebook");
      expect(PLATFORM_INFO).toHaveProperty("reddit");
      expect(PLATFORM_INFO).toHaveProperty("threads");
    });

    it("should have correct max lengths for platforms", () => {
      expect(PLATFORM_INFO.twitter.maxLength).toBe(280);
      expect(PLATFORM_INFO.linkedin.maxLength).toBe(3000);
      expect(PLATFORM_INFO.reddit.maxLength).toBe(10000);
    });

    it("should have audience descriptions for UHNWI targeting", () => {
      expect(PLATFORM_INFO.linkedin.audience).toContain("C-Suite");
      expect(PLATFORM_INFO.reddit.audience).toContain("fatFIRE");
    });
  });

  describe("AUDIENCE_PRESETS", () => {
    it("should have c-suite preset with LinkedIn", () => {
      expect(AUDIENCE_PRESETS["c-suite"].platforms).toContain("linkedin");
      expect(AUDIENCE_PRESETS["c-suite"].targeting.titles).toContain("CEO");
    });

    it("should have family-office preset", () => {
      expect(AUDIENCE_PRESETS["family-office"].targeting.netWorth).toBe("$30M+");
    });

    it("should have tech-wealth preset with reddit", () => {
      expect(AUDIENCE_PRESETS["tech-wealth"].platforms).toContain("reddit");
      expect(AUDIENCE_PRESETS["tech-wealth"].targeting.subreddits).toContain("r/fatFIRE");
    });
  });

  describe("hook initialization", () => {
    it("should initialize with loading state", () => {
      const { result } = renderHook(() => useSocialAdvertising());
      expect(result.current.loading).toBe(true);
    });

    it("should initialize with empty arrays", () => {
      const { result } = renderHook(() => useSocialAdvertising());
      expect(result.current.accounts).toEqual([]);
      expect(result.current.campaigns).toEqual([]);
      expect(result.current.posts).toEqual([]);
      expect(result.current.templates).toEqual([]);
    });

    it("should expose all required methods", () => {
      const { result } = renderHook(() => useSocialAdvertising());
      expect(typeof result.current.fetchData).toBe("function");
      expect(typeof result.current.createCampaign).toBe("function");
      expect(typeof result.current.createPost).toBe("function");
      expect(typeof result.current.publishPost).toBe("function");
      expect(typeof result.current.generateContent).toBe("function");
      expect(typeof result.current.saveTemplate).toBe("function");
      expect(typeof result.current.getAnalyticsSummary).toBe("function");
    });
  });

  describe("getAnalyticsSummary", () => {
    it("should return analytics summary with correct structure", () => {
      const { result } = renderHook(() => useSocialAdvertising());
      const summary = result.current.getAnalyticsSummary();

      expect(summary).toHaveProperty("totalPosts");
      expect(summary).toHaveProperty("publishedPosts");
      expect(summary).toHaveProperty("scheduledPosts");
      expect(summary).toHaveProperty("failedPosts");
      expect(summary).toHaveProperty("totalEngagement");
      expect(summary).toHaveProperty("platformBreakdown");
      expect(summary).toHaveProperty("activeCampaigns");
      expect(summary).toHaveProperty("connectedAccounts");
    });

    it("should return zero values for empty state", () => {
      const { result } = renderHook(() => useSocialAdvertising());
      const summary = result.current.getAnalyticsSummary();

      expect(summary.totalPosts).toBe(0);
      expect(summary.publishedPosts).toBe(0);
      expect(summary.totalEngagement).toBe(0);
    });
  });
});
