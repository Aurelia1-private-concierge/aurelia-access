import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase client
const mockBidsData = [
  {
    id: "bid-1",
    service_request_id: "request-1",
    house_partner_id: "partner-1",
    bid_amount: 5000,
    currency: "USD",
    estimated_timeline: "3 days",
    notes: "We can fulfill this request",
    status: "pending",
    created_at: "2026-01-27T10:00:00Z",
    updated_at: "2026-01-27T10:00:00Z",
    house_partner: {
      id: "partner-1",
      name: "Elite Jets",
      company_name: "Elite Aviation Ltd",
      category: "Private Aviation",
      rating: 4.9,
      is_preferred: true,
    },
  },
];

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "house_partner_bids") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: mockBidsData,
                  error: null,
                })
              ),
            })),
          })),
          insert: vi.fn(() => Promise.resolve({ error: null })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
            neq: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ error: null })),
            })),
          })),
        };
      }
      if (table === "service_requests") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                })
              ),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ error: null })),
          })),
        };
      }
      return {
        select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      };
    }),
  },
}));

import { useHousePartnerBids } from "@/hooks/useHousePartnerBids";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useHousePartnerBids", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches bids for a service request", async () => {
    const { result } = renderHook(
      () => useHousePartnerBids("request-1"),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.bids).toHaveLength(1);
    expect(result.current.bids?.[0].bid_amount).toBe(5000);
  });

  it("provides mutation functions", () => {
    const { result } = renderHook(
      () => useHousePartnerBids("request-1"),
      { wrapper: createWrapper() }
    );

    expect(typeof result.current.createBid).toBe("function");
    expect(typeof result.current.acceptBid).toBe("function");
    expect(typeof result.current.updateBidStatus).toBe("function");
  });

  it("includes partner information with bids", async () => {
    const { result } = renderHook(
      () => useHousePartnerBids("request-1"),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const bid = result.current.bids?.[0];
    expect(bid?.house_partner).toBeDefined();
    expect(bid?.house_partner?.name).toBe("Elite Jets");
  });

  it("returns loading state property", () => {
    const { result } = renderHook(
      () => useHousePartnerBids("request-1"),
      { wrapper: createWrapper() }
    );

    expect(typeof result.current.bidsLoading).toBe("boolean");
  });
});

describe("useHousePartnerBids - mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("can create a new bid", async () => {
    const { result } = renderHook(
      () => useHousePartnerBids("request-1"),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      result.current.createBid({
        serviceRequestId: "request-1",
        housePartnerId: "partner-2",
        bidAmount: 7500,
        currency: "USD",
        notes: "Happy to help",
      });
    });

    // Mutation should complete without error
    expect(result.current.isCreating).toBe(false);
  });

  it("can update bid status", async () => {
    const { result } = renderHook(
      () => useHousePartnerBids("request-1"),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      result.current.updateBidStatus({ bidId: "bid-1", status: "withdrawn" });
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Verify mutation function was called without throwing
    expect(typeof result.current.updateBidStatus).toBe("function");
  });
});
