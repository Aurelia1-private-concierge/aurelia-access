import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock Auth context
const mockUser = { id: "test-user-id", email: "test@example.com" };
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    session: { access_token: "test-token" },
  }),
}));

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() =>
                Promise.resolve({
                  data: table === "conversations" 
                    ? [{ id: "conv-123", user_id: mockUser.id, channel: "concierge" }]
                    : [],
                  error: null,
                })
              ),
            })),
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() =>
              Promise.resolve({ data: [], error: null })
            ),
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: "new-msg-id", content: "test", sender_role: "member" },
              error: null,
            })
          ),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        })),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    removeChannel: vi.fn(),
  },
}));

describe("useConciergeChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should initialize with loading state", async () => {
      const { useConciergeChat } = await import("@/hooks/useConciergeChat");
      const { result } = renderHook(() => useConciergeChat());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.messages).toEqual([]);
    });

    it("should expose all required methods", async () => {
      const { useConciergeChat } = await import("@/hooks/useConciergeChat");
      const { result } = renderHook(() => useConciergeChat());

      expect(typeof result.current.sendMessage).toBe("function");
      expect(typeof result.current.markAsRead).toBe("function");
      expect(typeof result.current.fetchMessages).toBe("function");
    });

    it("should have unread count initialized to zero", async () => {
      const { useConciergeChat } = await import("@/hooks/useConciergeChat");
      const { result } = renderHook(() => useConciergeChat());

      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe("message sending", () => {
    it("should track sending state", async () => {
      const { useConciergeChat } = await import("@/hooks/useConciergeChat");
      const { result } = renderHook(() => useConciergeChat());

      expect(result.current.isSending).toBe(false);
    });
  });

  describe("conversation management", () => {
    it("should track conversation state", async () => {
      const { useConciergeChat } = await import("@/hooks/useConciergeChat");
      const { result } = renderHook(() => useConciergeChat());

      // Initially null before conversation is loaded
      expect(result.current.conversation).toBeNull();
    });
  });
});
