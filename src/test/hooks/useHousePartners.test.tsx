import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            order: vi.fn(() =>
              Promise.resolve({
                data: [
                  {
                    id: "partner-1",
                    name: "Elite Jets",
                    company_name: "Elite Aviation Ltd",
                    email: "contact@elitejets.com",
                    phone: "+1234567890",
                    category: "Private Aviation",
                    subcategories: ["Charter", "Fractional"],
                    description: "Premium jet charter services",
                    service_regions: ["London", "Dubai", "New York"],
                    pricing_tier: "premium",
                    rating: 4.9,
                    is_preferred: true,
                    is_active: true,
                  },
                  {
                    id: "partner-2",
                    name: "Yacht Masters",
                    company_name: "YM International",
                    email: "bookings@yachtmasters.com",
                    phone: "+0987654321",
                    category: "Yacht Charter",
                    subcategories: ["Motor Yachts", "Sailing"],
                    description: "Luxury yacht charter worldwide",
                    service_regions: ["Monaco", "Caribbean"],
                    pricing_tier: "ultra",
                    rating: 4.7,
                    is_preferred: false,
                    is_active: true,
                  },
                ],
                error: null,
              })
            ),
          })),
          contains: vi.fn(() => ({
            order: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({
                  data: [
                    {
                      id: "partner-1",
                      name: "Elite Jets",
                      category: "Private Aviation",
                      service_regions: ["London"],
                      is_preferred: true,
                      is_active: true,
                      rating: 4.9,
                    },
                  ],
                  error: null,
                })
              ),
            })),
          })),
        })),
      })),
    })),
  },
}));

import { useHousePartners, useHousePartnersByRegion } from "@/hooks/useHousePartners";

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

describe("useHousePartners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches house partners successfully", async () => {
    const { result } = renderHook(() => useHousePartners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].name).toBe("Elite Jets");
    expect(result.current.data?.[0].is_preferred).toBe(true);
  });

  it("returns partners sorted by preferred status and rating", async () => {
    const { result } = renderHook(() => useHousePartners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.[0].is_preferred).toBe(true);
    expect(result.current.data?.[0].rating).toBe(4.9);
  });

  it("includes all expected partner fields", async () => {
    const { result } = renderHook(() => useHousePartners(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const partner = result.current.data?.[0];
    expect(partner).toHaveProperty("id");
    expect(partner).toHaveProperty("name");
    expect(partner).toHaveProperty("company_name");
    expect(partner).toHaveProperty("email");
    expect(partner).toHaveProperty("category");
    expect(partner).toHaveProperty("service_regions");
    expect(partner).toHaveProperty("pricing_tier");
    expect(partner).toHaveProperty("rating");
    expect(partner).toHaveProperty("is_preferred");
    expect(partner).toHaveProperty("is_active");
  });
});

describe("useHousePartnersByRegion", () => {
  it("is disabled when region is empty", () => {
    const { result } = renderHook(() => useHousePartnersByRegion(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetching).toBe(false);
  });

  it("fetches partners by region when provided", async () => {
    const { result } = renderHook(() => useHousePartnersByRegion("London"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
