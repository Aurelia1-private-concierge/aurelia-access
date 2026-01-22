import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Car, Plane, Ship, Train } from "lucide-react";
import { TrackingLinkManager } from "./TrackingLinkManager";

interface ServiceTrackingCardProps {
  serviceRequest: {
    id: string;
    title: string;
    category?: string;
    tracking_link?: string | null;
    tracking_link_label?: string | null;
    tracking_link_expires_at?: string | null;
  };
  isPartner?: boolean;
  onUpdate?: () => void;
}

const getCategoryIcon = (category?: string) => {
  switch (category?.toLowerCase()) {
    case "transportation":
    case "chauffeur":
      return Car;
    case "aviation":
    case "private_aviation":
      return Plane;
    case "yacht":
    case "marine":
      return Ship;
    case "rail":
      return Train;
    default:
      return Navigation;
  }
};

export function ServiceTrackingCard({
  serviceRequest,
  isPartner = false,
  onUpdate,
}: ServiceTrackingCardProps) {
  const CategoryIcon = getCategoryIcon(serviceRequest.category);
  const hasActiveTracking = serviceRequest.tracking_link && 
    (!serviceRequest.tracking_link_expires_at || 
     new Date(serviceRequest.tracking_link_expires_at) > new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/50 bg-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            hasActiveTracking ? "bg-green-500/10" : "bg-muted"
          }`}>
            <CategoryIcon className={`w-5 h-5 ${
              hasActiveTracking ? "text-green-500" : "text-muted-foreground"
            }`} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{serviceRequest.title}</h4>
            <p className="text-xs text-muted-foreground capitalize">
              {serviceRequest.category?.replace("_", " ") || "Service"}
            </p>
          </div>
          {hasActiveTracking && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Live
            </div>
          )}
        </div>
      </div>

      {/* Tracking Section */}
      <div className="p-4">
        <TrackingLinkManager
          serviceRequestId={serviceRequest.id}
          currentLink={serviceRequest.tracking_link}
          currentLabel={serviceRequest.tracking_link_label}
          expiresAt={serviceRequest.tracking_link_expires_at}
          isPartner={isPartner}
          onUpdate={onUpdate}
        />
      </div>

      {/* Privacy Notice for Partners */}
      {isPartner && (
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            Location data is not stored. Link is shared directly with the client.
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default ServiceTrackingCard;
