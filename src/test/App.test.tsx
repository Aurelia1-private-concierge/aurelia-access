import React from "react";
import { render } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...(actual as object),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: any) => <div ref={ref} {...props}>{children}</div>),
      section: React.forwardRef(({ children, ...props }: any, ref: any) => <section ref={ref} {...props}>{children}</section>),
      header: React.forwardRef(({ children, ...props }: any, ref: any) => <header ref={ref} {...props}>{children}</header>),
      p: React.forwardRef(({ children, ...props }: any, ref: any) => <p ref={ref} {...props}>{children}</p>),
      video: React.forwardRef((props: any, ref: any) => <video ref={ref} {...props} />),
      a: React.forwardRef(({ children, ...props }: any, ref: any) => <a ref={ref} {...props}>{children}</a>),
    },
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
    useTransform: () => 0,
  };
});

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: () => null,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
    useLocation: () => ({ pathname: "/", search: "", hash: "" }),
    useNavigate: () => vi.fn(),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  };
});

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
  },
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "hero.title": "Aurelia Private Concierge",
        "hero.subtitle": "The world's most exclusive AI-powered concierge for UHNWI",
        "hero.badge": "By Invitation Only",
        "hero.joinButton": "Begin Your Journey",
        "hero.discoverButton": "Discover",
      };
      return translations[key] || key;
    },
    i18n: { language: "en", changeLanguage: vi.fn() },
  }),
  I18nextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  initReactI18next: { type: "3rdParty", init: vi.fn() },
}));

// Mock @tanstack/react-query
vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn().mockImplementation(() => ({
    defaultOptions: {},
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useQuery: () => ({ data: null, isLoading: false, error: null }),
  useQueryClient: () => ({}),
}));

// Mock react-helmet-async
vi.mock("react-helmet-async", () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Helmet: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

// Simple test for HeroSection directly (more focused)
import HeroSection from "@/components/HeroSection";

describe("HeroSection Critical Render", () => {
  test("renders without crashing", () => {
    const { container } = render(<HeroSection />);
    expect(container).toBeTruthy();
  });

  test("has permanent background gradient (no blank screen)", () => {
    const { container } = render(<HeroSection />);
    const header = container.querySelector("header");
    expect(header).toBeTruthy();
    
    // Check that the header has inline style with background
    const style = header?.getAttribute("style");
    expect(style).toContain("background");
    expect(style).toContain("linear-gradient");
  });

  test("renders heading element", () => {
    const { container } = render(<HeroSection />);
    const heading = container.querySelector("h1");
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain("Aurelia");
  });

  test("renders CTA buttons", () => {
    const { container } = render(<HeroSection />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });
});
