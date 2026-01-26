import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";

// Mock Supabase auth
const mockSignUp = vi.fn();
const mockSignIn = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn(() => Promise.resolve({ data: { session: null }, error: null }));
const mockOnAuthStateChange = vi.fn(() => ({
  data: {
    subscription: {
      unsubscribe: vi.fn(),
    },
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: mockSignUp,
      signInWithPassword: mockSignIn,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

describe("useAuth (via AuthContext)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignUp.mockResolvedValue({ error: null });
    mockSignIn.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  describe("signUp", () => {
    it("should call supabase signUp with email and password", async () => {
      const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(AuthProvider, null, children)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signUp("test@example.com", "password123");
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: expect.objectContaining({
          emailRedirectTo: expect.stringContaining("/auth/callback"),
        }),
      });
    });

    it("should return error if signUp fails", async () => {
      const mockError = new Error("Email already registered");
      mockSignUp.mockResolvedValueOnce({ error: mockError });

      const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(AuthProvider, null, children)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.signUp("existing@example.com", "password123");
      });

      expect(response?.error).toBe(mockError);
    });
  });

  describe("signIn", () => {
    it("should call supabase signInWithPassword", async () => {
      const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(AuthProvider, null, children)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signIn("test@example.com", "password123");
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should return error on invalid credentials", async () => {
      const mockError = new Error("Invalid login credentials");
      mockSignIn.mockResolvedValueOnce({ error: mockError });

      const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(AuthProvider, null, children)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      let response;
      await act(async () => {
        response = await result.current.signIn("wrong@example.com", "wrongpassword");
      });

      expect(response?.error).toBe(mockError);
    });
  });

  describe("signOut", () => {
    it("should call supabase signOut", async () => {
      const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(AuthProvider, null, children)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("initial state", () => {
    it("should start with null user and session", async () => {
      const { AuthProvider, useAuth } = await import("@/contexts/AuthContext");

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        React.createElement(AuthProvider, null, children)
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should throw when useAuth is used outside provider", async () => {
      const { useAuth } = await import("@/contexts/AuthContext");

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");
    });
  });
});
