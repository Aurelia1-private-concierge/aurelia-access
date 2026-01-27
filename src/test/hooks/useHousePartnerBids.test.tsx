import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

// Mock Supabase client
const mockInsert = vi.fn(() => Promise.resolve({ error: null }));
const mockUpdate = vi.fn(() => ({
  eq: vi.fn(() => ({
    neq: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
  })),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "house_partner_bids") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: "bid-1",
                      service_request_id: "req-1",
                      house_partner_id: "partner-1",
                      bid_amount: 5000,
                      currency: "USD",
                      estimated_timeline: "3-5 days",
                      notes: "Express delivery available",
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
                    {
                      id: "bid-2",
                      service_request_id: "req-1",
                      house_partner_id: "partner-2",
                      bid_amount: 7500,
                      currency: "USD",
                      estimated_timeline: "1-2 days",
                      notes: null,
                      status: "pending",
                      created_at: "2026-01-27T11:00:00Z",
                      updated_at: "2026-01-27T11:00:00Z",
                      house_partner: {
                        id: "partner-2",
                        name: "Premium Air",
                        company_name: null,
                        category: "Private Aviation",
                        rating: 4.5,
                        is_preferred: false,
                      },
                    },
                  ],
                  error: null,
                })
              ),
            })),
          })),
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      if (table === "service_requests") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: "req-1",
                      title: "Private Jet to Monaco",
                      description: "Need a jet for 4 passengers",
                      category: "Private Aviation",
                      budget_min: 5000,
                      budget_max: 10000,
                      bidding_enabled: true,
                      bidding_deadline: "2026-02-01T12:00:00Z",
                      selected_bid_id: null,
                    },
                  ],
                  error: null,
                })
              ),
            })),
          })),
          update: mockUpdate,
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      };
    }),
  },
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useHousePartnerBids } from "@/hooks/useHousePartnerBids";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
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

  it("fetches bids for a specific service request", async () => {
    const { result } = renderHook(() => useHousePartnerBids("req-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.bidsLoading).toBe(false);
    });

    expect(result.current.bids).toHaveLength(2);
    expect(result.current.bids?.[0].bid_amount).toBe(5000);
    expect(result.current.bids?.[0].house_partner?.name).toBe("Elite Jets");
  });

  it("returns bids sorted by amount ascending", async () => {
    const { result } = renderHook(() => useHousePartnerBids("req-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.bidsLoading).toBe(false);
    });

    expect(result.current.bids?.[0].bid_amount).toBe(5000);
    expect(result.current.bids?.[1].bid_amount).toBe(7500);
  });

  it("fetches bidding requests for admin view", async () => {
    const { result } = renderHook(() => useHousePartnerBids(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.requestsLoading).toBe(false);
    });

    expect(result.current.biddingRequests).toBeDefined();
    expect(result.current.biddingRequests?.[0].bidding_enabled).toBe(true);
  });

  it("includes partner details with each bid", async () => {
    const { result } = renderHook(() => useHousePartnerBids("req-1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.bidsLoading).toBe(false);
    });

    const bid = result.current.bids?.[0];
    expect(bid?.house_partner).toBeDefined();
    expect(bid?.house_partner?.is_preferred).toBe(true);
    expect(bid?.house_partner?.rating).toBe(4.9);
  });

  it("provides mutation functions", () => {
    const { result } = renderHook(() => useHousePartnerBids("req-1"), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.createBid).toBe("function");
    expect(typeof result.current.acceptBid).toBe("function");
    expect(typeof result.current.updateBidStatus).toBe("function");
    expect(typeof result.current.enableBidding).toBe("function");
    expect(typeof result.current.disableBidding).toBe("function");
  });
});
