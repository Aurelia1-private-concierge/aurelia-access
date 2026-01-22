import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Link2, Clock, ExternalLink, X, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TrackingLinkManagerProps {
  serviceRequestId: string;
  currentLink?: string | null;
  currentLabel?: string | null;
  expiresAt?: string | null;
  onUpdate?: () => void;
  isPartner?: boolean;
}

const TRACKING_PROVIDERS = [
  { value: "google_maps", label: "Google Maps Live Location", placeholder: "https://maps.google.com/..." },
  { value: "whatsapp", label: "WhatsApp Live Location", placeholder: "Shared via WhatsApp" },
  { value: "fleet_tracker", label: "Fleet Tracker", placeholder: "https://tracker.example.com/..." },
  { value: "uber", label: "Uber/Lyft Tracking", placeholder: "https://..." },
  { value: "custom", label: "Custom Link", placeholder: "https://..." },
];

const EXPIRY_OPTIONS = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "4", label: "4 hours" },
  { value: "8", label: "8 hours" },
  { value: "24", label: "24 hours" },
  { value: "none", label: "No expiry" },
];

export function TrackingLinkManager({
  serviceRequestId,
  currentLink,
  currentLabel,
  expiresAt,
  onUpdate,
  isPartner = false,
}: TrackingLinkManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingLink, setTrackingLink] = useState(currentLink || "");
  const [provider, setProvider] = useState("google_maps");
  const [expiryHours, setExpiryHours] = useState("4");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!trackingLink.trim()) {
      toast({
        title: "Link required",
        description: "Please enter a tracking link",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(trackingLink)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid tracking URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const selectedProvider = TRACKING_PROVIDERS.find(p => p.value === provider);
    const expiresAtDate = expiryHours !== "none" 
      ? new Date(Date.now() + parseInt(expiryHours) * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from("service_requests")
      .update({
        tracking_link: trackingLink,
        tracking_link_label: selectedProvider?.label || "Live Location",
        tracking_link_added_at: new Date().toISOString(),
        tracking_link_expires_at: expiresAtDate,
      })
      .eq("id", serviceRequestId);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update tracking link",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tracking link shared",
      description: "Your client can now view your live location",
    });

    setIsOpen(false);
    onUpdate?.();
  };

  const handleRemoveLink = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("service_requests")
      .update({
        tracking_link: null,
        tracking_link_label: null,
        tracking_link_added_at: null,
        tracking_link_expires_at: null,
      })
      .eq("id", serviceRequestId);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove tracking link",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Tracking link removed",
      description: "Location sharing has been stopped",
    });

    setTrackingLink("");
    onUpdate?.();
  };

  const copyToClipboard = async () => {
    if (currentLink) {
      await navigator.clipboard.writeText(currentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  // Client view - show tracking link if available
  if (!isPartner) {
    if (!currentLink || isExpired) {
      return null;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border border-primary/20 bg-primary/5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {currentLabel || "Live Location"}
            </p>
            <p className="text-xs text-muted-foreground">
              Driver is sharing their location
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-2"
            onClick={() => window.open(currentLink, "_blank")}
          >
            <ExternalLink className="w-4 h-4" />
            View Location
          </Button>
        </div>
        {expiresAt && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Expires {new Date(expiresAt).toLocaleTimeString()}
          </div>
        )}
      </motion.div>
    );
  }

  // Partner/Driver view - manage tracking link
  return (
    <div className="space-y-3">
      {currentLink && !isExpired ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl border border-border/50 bg-card"
        >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-accent-foreground" />
                </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Location Sharing Active
                </p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {currentLink}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={handleRemoveLink}
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          {expiresAt && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Expires {new Date(expiresAt).toLocaleTimeString()}
            </div>
          )}
        </motion.div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <MapPin className="w-4 h-4" />
              Share Live Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Share Location with Client
              </DialogTitle>
              <DialogDescription>
                Paste a tracking link from Google Maps, your fleet tracker, or another service. 
                The client will see this link in their service timeline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Tracking Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRACKING_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tracking Link</Label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={trackingLink}
                    onChange={(e) => setTrackingLink(e.target.value)}
                    placeholder={TRACKING_PROVIDERS.find(p => p.value === provider)?.placeholder}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Paste the shareable link from your tracking service
                </p>
              </div>

              <div className="space-y-2">
                <Label>Link Expiry</Label>
                <Select value={expiryHours} onValueChange={setExpiryHours}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPIRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Sharing..." : "Share Location"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {isExpired && currentLink && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Previous tracking link has expired
        </p>
      )}
    </div>
  );
}

export default TrackingLinkManager;
