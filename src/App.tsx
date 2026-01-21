import { Suspense, lazy, forwardRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalProvider } from "@/contexts/GlobalContext";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import GlobalElements from "./components/GlobalElements";
import ErrorBoundary from "./components/ErrorBoundary";
import SessionTimeoutProvider from "./components/auth/SessionTimeoutProvider";
import SkipLink from "./components/a11y/SkipLink";
import { ReducedMotionProvider } from "./components/a11y/ReducedMotionProvider";
import VisitorTracker from "./components/VisitorTracker";
import "@/i18n";

// Eagerly load the landing page for best LCP
import Index from "./pages/Index";

// Lazy load all other pages to reduce initial bundle
const Waitlist = lazy(() => import("./pages/Waitlist"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Services = lazy(() => import("./pages/Services"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const PartnerApply = lazy(() => import("./pages/PartnerApply"));
const PartnerPortal = lazy(() => import("./pages/PartnerPortal"));
const PartnerServiceForm = lazy(() => import("./pages/PartnerServiceForm"));
const Orla = lazy(() => import("./pages/Orla"));
const Admin = lazy(() => import("./pages/Admin"));
const Membership = lazy(() => import("./pages/Membership"));
const Discover = lazy(() => import("./pages/Discover"));
const Referral = lazy(() => import("./pages/Referral"));
const PartnerRecruitment = lazy(() => import("./pages/PartnerRecruitment"));

const TrialApplication = lazy(() => import("./pages/TrialApplication"));
const CreditHistory = lazy(() => import("./pages/CreditHistory"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Contact = lazy(() => import("./pages/Contact"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Social = lazy(() => import("./pages/Social"));
const Campaign = lazy(() => import("./pages/Campaign"));
const MarketingHub = lazy(() => import("./pages/MarketingHub"));
const LinkedInProfile = lazy(() => import("./pages/LinkedInProfile"));
const InstagramProfile = lazy(() => import("./pages/InstagramProfile"));
const FacebookProfile = lazy(() => import("./pages/FacebookProfile"));
const TikTokProfile = lazy(() => import("./pages/TikTokProfile"));
const TwitterProfile = lazy(() => import("./pages/TwitterProfile"));
const YouTubeProfile = lazy(() => import("./pages/YouTubeProfile"));
const MediaKit = lazy(() => import("./pages/MediaKit"));
const Blog = lazy(() => import("./pages/Blog"));
const Security = lazy(() => import("./pages/Security"));
const AdCreatives = lazy(() => import("./pages/AdCreatives"));
const DirectorySubmissions = lazy(() => import("./pages/DirectorySubmissions"));
const Status = lazy(() => import("./pages/Status"));
const VideoRoom = lazy(() => import("./pages/VideoRoom"));
const Boardroom = lazy(() => import("./pages/Boardroom"));
const BoardroomSession = lazy(() => import("./pages/BoardroomSession"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const PartnerDetail = lazy(() => import("./pages/PartnerDetail"));
const SurpriseMe = lazy(() => import("./pages/SurpriseMe"));
const PartnerPlatform = lazy(() => import("./pages/PartnerPlatform"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const PartnerInventory = lazy(() => import("./pages/PartnerInventory"));
const Auctions = lazy(() => import("./pages/Auctions"));

// Production debugging
const log = (msg: string) => console.log(`[App ${Date.now()}] ${msg}`);
log("App.tsx module loading");

// Simple CSS-only loading fallback (no framer-motion to prevent any potential blocking)
const PageLoader = () => {
  log("PageLoader rendering");
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border border-primary/30 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-xs text-muted-foreground/50 uppercase tracking-widest">Loading</p>
    </div>
  );
};

const queryClient = new QueryClient();
log("QueryClient created");

const AnimatedRoutes = forwardRef<HTMLDivElement>((props, ref) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Main landing page */}
          <Route
            path="/"
            element={
              <PageTransition>
                <Index />
              </PageTransition>
            }
          />
          <Route
            path="/waitlist"
            element={
              <PageTransition>
                <Waitlist />
              </PageTransition>
            }
          />
          <Route
            path="/auth"
            element={
              <PageTransition>
                <Auth />
              </PageTransition>
            }
          />
          <Route
            path="/auth/callback"
            element={
              <PageTransition>
                <AuthCallback />
              </PageTransition>
            }
          />
          <Route
            path="/reset-password"
            element={
              <PageTransition>
                <ResetPassword />
              </PageTransition>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Discover />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <PageTransition>
                <Services />
              </PageTransition>
            }
          />
          <Route
            path="/terms"
            element={
              <PageTransition>
                <Terms />
              </PageTransition>
            }
          />
          <Route
            path="/privacy"
            element={
              <PageTransition>
                <Privacy />
              </PageTransition>
            }
          />
          <Route
            path="/partner/apply"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <PartnerApply />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <PartnerPortal />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/services/new"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <PartnerServiceForm />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner/inventory"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <PartnerInventory />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/marketplace"
            element={
              <PageTransition>
                <Marketplace />
              </PageTransition>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orla"
            element={
              <PageTransition>
                <Orla />
              </PageTransition>
            }
          />
          <Route
            path="/membership"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Membership />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/referral"
            element={
              <PageTransition>
                <Referral />
              </PageTransition>
            }
          />
          <Route
            path="/partners/join"
            element={
              <PageTransition>
                <PartnerRecruitment />
              </PageTransition>
            }
          />
          <Route
            path="/partner-platform"
            element={
              <PageTransition>
                <PartnerPlatform />
              </PageTransition>
            }
          />
          <Route
            path="/partners/:partnerId"
            element={
              <PageTransition>
                <PartnerDetail />
              </PageTransition>
            }
          />
          <Route
            path="/surprise-me"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <SurpriseMe />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trial"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <TrialApplication />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/credits"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <CreditHistory />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <PageTransition>
                  <Admin />
                </PageTransition>
              </AdminRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <Contact />
              </PageTransition>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Onboarding />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/social"
            element={
              <PageTransition>
                <Social />
              </PageTransition>
            }
          />
          <Route
            path="/campaign/:campaignId?"
            element={
              <PageTransition>
                <Campaign />
              </PageTransition>
            }
          />
          <Route
            path="/marketing"
            element={
              <AdminRoute>
                <PageTransition>
                  <MarketingHub />
                </PageTransition>
              </AdminRoute>
            }
          />
          <Route
            path="/linkedin"
            element={
              <PageTransition>
                <LinkedInProfile />
              </PageTransition>
            }
          />
          <Route
            path="/instagram"
            element={
              <PageTransition>
                <InstagramProfile />
              </PageTransition>
            }
          />
          <Route
            path="/tiktok"
            element={
              <PageTransition>
                <TikTokProfile />
              </PageTransition>
            }
          />
          <Route
            path="/facebook"
            element={
              <PageTransition>
                <FacebookProfile />
              </PageTransition>
            }
          />
          <Route
            path="/twitter"
            element={
              <PageTransition>
                <TwitterProfile />
              </PageTransition>
            }
          />
          <Route
            path="/youtube"
            element={
              <PageTransition>
                <YouTubeProfile />
              </PageTransition>
            }
          />
          <Route
            path="/media-kit"
            element={
              <PageTransition>
                <MediaKit />
              </PageTransition>
            }
          />
          <Route
            path="/blog"
            element={
              <PageTransition>
                <Blog />
              </PageTransition>
            }
          />
          <Route
            path="/security"
            element={
              <PageTransition>
                <Security />
              </PageTransition>
            }
          />
          <Route
            path="/ad-creatives"
            element={
              <PageTransition>
                <AdCreatives />
              </PageTransition>
            }
          />
          <Route
            path="/directories"
            element={
              <AdminRoute>
                <PageTransition>
                  <DirectorySubmissions />
                </PageTransition>
              </AdminRoute>
            }
          />
          <Route
            path="/status"
            element={
              <PageTransition>
                <Status />
              </PageTransition>
            }
          />
          <Route
            path="/room/:roomId"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <VideoRoom />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/boardroom"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Boardroom />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/boardroom/:roomCode"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <BoardroomSession />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/auctions"
            element={
              <PageTransition>
                <Auctions />
              </PageTransition>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
});

AnimatedRoutes.displayName = "AnimatedRoutes";

const App = () => {
  log("App component rendering");
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <GlobalProvider>
            <ReducedMotionProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner position="top-right" richColors closeButton />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AuthProvider>
                  <SessionTimeoutProvider timeoutMinutes={30} warningMinutes={5}>
                    <VisitorTracker />
                    <SkipLink />
                    <main id="main-content">
                      <AnimatedRoutes />
                    </main>
                    <GlobalElements />
                    <BackToTop />
                    <CookieConsent />
                  </SessionTimeoutProvider>
                </AuthProvider>
              </BrowserRouter>
            </TooltipProvider>
          </ReducedMotionProvider>
        </GlobalProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
  );
};

export default App;
