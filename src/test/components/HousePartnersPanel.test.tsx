import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          order: vi.fn(() =>
            Promise.resolve({
              data: [],
              error: null,
            })
          ),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

import { HousePartnersPanel } from "@/components/admin/HousePartnersPanel";

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

describe("HousePartnersPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the panel header", async () => {
    render(<HousePartnersPanel />, { wrapper: createWrapper() });

    expect(screen.getByText("House Partners")).toBeInTheDocument();
    expect(
      screen.getByText("Pre-vetted vendors you manage directly for member services")
    ).toBeInTheDocument();
  });

  it("shows add partner button", async () => {
    render(<HousePartnersPanel />, { wrapper: createWrapper() });

    expect(screen.getByRole("button", { name: /add partner/i })).toBeInTheDocument();
  });

  it("shows empty state when no partners exist", async () => {
    render(<HousePartnersPanel />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("No house partners yet.")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Add your trusted vendors to start fulfilling member requests.")
    ).toBeInTheDocument();
  });

  it("opens dialog when add partner button is clicked", async () => {
    render(<HousePartnersPanel />, { wrapper: createWrapper() });

    const addButton = screen.getByRole("button", { name: /add partner/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Add House Partner")).toBeInTheDocument();
    });

    // Check form fields exist
    expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
  });

  it("displays dialog description for accessibility", async () => {
    render(<HousePartnersPanel />, { wrapper: createWrapper() });

    const addButton = screen.getByRole("button", { name: /add partner/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByText(/add or edit house partner vendor details/i)
      ).toBeInTheDocument();
    });
  });

  it("has required form fields", async () => {
    render(<HousePartnersPanel />, { wrapper: createWrapper() });

    const addButton = screen.getByRole("button", { name: /add partner/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/contact name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
});
