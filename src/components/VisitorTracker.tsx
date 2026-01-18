import { useVisitorTracking } from "@/hooks/useVisitorTracking";

/**
 * Invisible component that tracks page visits.
 * Must be rendered inside a Router context.
 */
const VisitorTracker = () => {
  // This hook automatically tracks page visits on route changes
  useVisitorTracking();
  
  return null;
};

export default VisitorTracker;
