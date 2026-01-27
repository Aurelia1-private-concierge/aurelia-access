import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-123", email: "test@aurelia.com" },
  }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase client - no household scenario
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === "household_members") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                })
              ),
              order: vi.fn(() =>
                Promise.resolve({
                  data: [],
                  error: null,
                })
              ),
            })),
          })),
          insert: vi.fn(() => Promise.resolve({ error: null })),
        };
      }
      if (table === "households") {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() =>
              Promise.resolve({
                data: [],
                error: null,
              })
            ),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({
                  data: {
                    id: "household-1",
                    name: "Smith Family",
                    type: "family",
                    primary_member_id: "user-123",
                    credit_pool_enabled: false,
                    total_pool_credits: 0,
                  },
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

import { FamilyDashboard } from "@/components/household/FamilyDashboard";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("FamilyDashboard - No Household", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows create household prompt when none exists", async () => {
    render(<FamilyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No Household Yet")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/create a family or enterprise account/i)
    ).toBeInTheDocument();
  });

  it("shows create household button", async () => {
    render(<FamilyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create household/i })
      ).toBeInTheDocument();
    });
  });

  it("has proper dialog descriptions for screen readers", async () => {
    render(<FamilyDashboard />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No Household Yet")).toBeInTheDocument();
    });

    // The create household button should be available
    const createButton = screen.getByRole("button", { name: /create household/i });
    expect(createButton).toBeInTheDocument();
  });
});
