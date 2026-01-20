import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";

// Lazy load all floating UI components to reduce initial bundle and FID
const PWAInstallPrompt = lazy(() => import("./PWAInstallPrompt"));
const FloatingWhatsApp = lazy(() => import("./FloatingWhatsApp"));
const OrlaFAB = lazy(() => import("./OrlaFAB"));
const SystemHealthIndicator = lazy(() => import("./SystemHealthIndicator"));
const OfflineBanner = lazy(() => import("./OfflineBanner"));
const NotificationPermissionPrompt = lazy(() => import("./NotificationPermissionPrompt"));

// Lazy load heavy components
const AmbientParticles = lazy(() => import("./AmbientParticles"));
const GlowingOrb = lazy(() => import("./GlowingOrb"));

interface GlobalElementsProps {
  showParticles?: boolean;
  showOrb?: boolean;
  showWhatsApp?: boolean;
  showOrla?: boolean;
  showHealthIndicator?: boolean;
  showNotificationPrompt?: boolean;
}

const GlobalElements = ({
  showParticles = false,
  showOrb = false,
  showWhatsApp = true,
  showOrla = true,
  showHealthIndicator = true,
  showNotificationPrompt = true,
}: GlobalElementsProps) => {
  const location = useLocation();
  
  // Don't show global elements on certain pages
  const hideOnPages = ["/auth", "/admin", "/orla"];
  const isHiddenPage = hideOnPages.some(path => location.pathname.startsWith(path));
  
  // Hide offline banner on public-facing pages (landing, waitlist)
  const hideOfflineBannerOn = ["/"];
  const shouldHideOfflineBanner = hideOfflineBannerOn.includes(location.pathname);

  if (isHiddenPage) {
    return null;
  }

  return (
    <>
      {/* Offline Banner - shown on dashboard/app pages only */}
      <Suspense fallback={null}>
        {!shouldHideOfflineBanner && <OfflineBanner />}
      </Suspense>
      
      {/* PWA Install Prompt - shown on all pages */}
      <Suspense fallback={null}>
        <PWAInstallPrompt />
      </Suspense>
      
      {/* Push Notification Permission Prompt */}
      <Suspense fallback={null}>
        {showNotificationPrompt && <NotificationPermissionPrompt />}
      </Suspense>
      
      {/* System Health Indicator - AI Self-Healing */}
      <Suspense fallback={null}>
        {showHealthIndicator && <SystemHealthIndicator />}
      </Suspense>
      
      {/* Ambient Effects */}
      {showParticles && (
        <Suspense fallback={null}>
          <AmbientParticles />
        </Suspense>
      )}
      
      {showOrb && (
        <Suspense fallback={null}>
          <GlowingOrb />
        </Suspense>
      )}
      
      {/* Floating Controls */}
      <Suspense fallback={null}>
        {showWhatsApp && <FloatingWhatsApp />}
        {showOrla && <OrlaFAB />}
      </Suspense>
    </>
  );
};

export default GlobalElements;
