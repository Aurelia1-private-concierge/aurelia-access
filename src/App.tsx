import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
import "@/i18n";

// Eagerly load the waitlist/under construction page for best LCP
import Waitlist from "./pages/Waitlist";

// Lazy load all other pages to reduce initial bundle
const Index = lazy(() => import("./pages/Index"));
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

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Waitlist />
              </PageTransition>
            }
          />
          <Route
            path="/home"
            element={
              <PageTransition>
                <Index />
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
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GlobalProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AnimatedRoutes />
            <GlobalElements />
            <BackToTop />
            <CookieConsent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </GlobalProvider>
  </QueryClientProvider>
);

export default App;
