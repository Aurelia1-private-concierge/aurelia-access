import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PWAInstallPrompt from "./PWAInstallPrompt";
import MusicPlayer from "./MusicPlayer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import OrlaFAB from "./OrlaFAB";
import SystemHealthIndicator from "./SystemHealthIndicator";
import OfflineBanner from "./OfflineBanner";
import NotificationPermissionPrompt from "./NotificationPermissionPrompt";
import { useOfflineAI } from "@/hooks/useOfflineAI";

// Lazy load heavy components
const AmbientParticles = lazy(() => import("./AmbientParticles"));
const GlowingOrb = lazy(() => import("./GlowingOrb"));

interface GlobalElementsProps {
  showParticles?: boolean;
  showOrb?: boolean;
  showMusic?: boolean;
  showWhatsApp?: boolean;
  showOrla?: boolean;
  showHealthIndicator?: boolean;
  showNotificationPrompt?: boolean;
}

const GlobalElements = ({
  showParticles = false,
  showOrb = false,
  showMusic = true,
  showWhatsApp = true,
  showOrla = true,
  showHealthIndicator = true,
  showNotificationPrompt = true,
}: GlobalElementsProps) => {
  const location = useLocation();
  const { toggleOfflineMode } = useOfflineAI();
  
  // Enable offline mode on mount
  useEffect(() => {
    toggleOfflineMode(true);
  }, []);
  
  // Don't show global elements on certain pages
  const hideOnPages = ["/auth", "/admin", "/orla"];
  const isHiddenPage = hideOnPages.some(path => location.pathname.startsWith(path));
  
  // Hide offline banner on public-facing pages (landing, waitlist)
  const hideOfflineBannerOn = ["/", "/coming-soon"];
  const shouldHideOfflineBanner = hideOfflineBannerOn.includes(location.pathname);

  if (isHiddenPage) {
    return null;
  }

  return (
    <>
      {/* Offline Banner - shown on dashboard/app pages only */}
      {!shouldHideOfflineBanner && <OfflineBanner />}
      
      {/* PWA Install Prompt - shown on all pages */}
      <PWAInstallPrompt />
      
      {/* Push Notification Permission Prompt */}
      {showNotificationPrompt && <NotificationPermissionPrompt />}
      
      {/* System Health Indicator - AI Self-Healing */}
      {showHealthIndicator && <SystemHealthIndicator />}
      
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
      {showMusic && <MusicPlayer />}
      {showWhatsApp && <FloatingWhatsApp />}
      {showOrla && <OrlaFAB />}
    </>
  );
};

export default GlobalElements;
