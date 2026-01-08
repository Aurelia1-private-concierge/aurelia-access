import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Eagerly load the homepage for best LCP
import Index from "./pages/Index";

// Lazy load all other pages to reduce initial bundle
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
const NotFound = lazy(() => import("./pages/NotFound"));

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
            path="/admin"
            element={
              <AdminRoute>
                <PageTransition>
                  <Admin />
                </PageTransition>
              </AdminRoute>
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
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
          <BackToTop />
          <CookieConsent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
