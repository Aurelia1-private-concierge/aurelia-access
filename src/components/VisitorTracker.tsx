import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { forwardRef } from "react";

/**
 * Invisible component that tracks page visits.
 * Must be rendered inside a Router context.
 */
const VisitorTracker = forwardRef<HTMLDivElement>((props, ref) => {
  // This hook automatically tracks page visits on route changes
  useVisitorTracking();
  
  return null;
});

VisitorTracker.displayName = "VisitorTracker";

export default VisitorTracker;
