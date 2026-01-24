import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Monitor, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Target,
  BarChart3,
  Facebook,
  Linkedin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PixelConfig {
  id: string;
  name: string;
  key: string;
  pixelId: string;
  isActive: boolean;
  icon: React.ElementType;
  color: string;
  description: string;
  events: string[];
}

const PIXEL_TEMPLATES: Omit<PixelConfig, "pixelId" | "isActive">[] = [
  {
    id: "meta",
    name: "Meta Pixel",
    key: "meta_pixel_id",
    icon: Facebook,
    color: "#1877F2",
    description: "Track conversions from Facebook & Instagram ads",
    events: ["PageView", "Lead", "CompleteRegistration", "InitiateCheckout"]
  },
  {
    id: "google",
    name: "Google Ads",
    key: "google_ads_id",
    icon: Target,
    color: "#4285F4",
    description: "Track Google Ads conversions and remarketing",
    events: ["conversion", "page_view", "sign_up", "begin_checkout"]
  },
  {
    id: "linkedin",
    name: "LinkedIn Insight",
    key: "linkedin_partner_id",
    icon: Linkedin,
    color: "#0A66C2",
    description: "Track LinkedIn ad conversions and retargeting",
    events: ["PageView", "Conversion", "SignUp"]
  },
  {
    id: "tiktok",
    name: "TikTok Pixel",
    key: "tiktok_pixel_id",
    icon: Monitor,
    color: "#000000",
    description: "Track TikTok advertising performance",
    events: ["PageView", "CompleteRegistration", "SubmitForm", "Contact"]
  },
  {
    id: "analytics",
    name: "Google Analytics 4",
    key: "ga4_measurement_id",
    icon: BarChart3,
    color: "#E37400",
    description: "Comprehensive website analytics and user behavior",
    events: ["page_view", "scroll", "click", "form_submit", "sign_up"]
  }
];

export const PixelManager = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pixels, setPixels] = useState<PixelConfig[]>([]);

  useEffect(() => {
    fetchPixelConfigs();
  }, []);

  const fetchPixelConfigs = async () => {
    setIsLoading(true);
    try {
      const configs: PixelConfig[] = [];
      
      for (const template of PIXEL_TEMPLATES) {
        // Get pixel ID
        const { data: pixelData } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", template.key)
          .single();
        
        // Get active status
        const { data: activeData } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", `${template.key}_active`)
          .single();
        
        configs.push({
          ...template,
          pixelId: pixelData?.value || "",
          isActive: activeData?.value === "true"
        });
      }
      
      setPixels(configs);
    } catch (error) {
      console.error("Failed to fetch pixel configs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePixelId = (id: string, value: string) => {
    setPixels(prev => prev.map(p => 
      p.id === id ? { ...p, pixelId: value } : p
    ));
  };

  const togglePixelActive = async (id: string) => {
    const pixel = pixels.find(p => p.id === id);
    if (!pixel) return;

    const newActive = !pixel.isActive;
    setPixels(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: newActive } : p
    ));

    try {
      await supabase.from("app_settings").upsert({
        key: `${pixel.key}_active`,
        value: newActive.toString(),
        description: `${pixel.name} active status`,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });

      toast({
        title: newActive ? "Pixel activated" : "Pixel deactivated",
        description: `${pixel.name} is now ${newActive ? "tracking" : "paused"}.`
      });
    } catch (error) {
      console.error("Failed to toggle pixel:", error);
    }
  };

  const savePixelConfig = async (pixel: PixelConfig) => {
    if (!pixel.pixelId.trim()) {
      toast({
        title: "Pixel ID required",
        description: "Please enter a valid pixel ID.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await supabase.from("app_settings").upsert({
        key: pixel.key,
        value: pixel.pixelId,
        description: `${pixel.name} tracking ID`,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });

      toast({
        title: "Pixel saved",
        description: `${pixel.name} configuration updated successfully.`
      });
    } catch (error) {
      console.error("Failed to save pixel:", error);
      toast({
        title: "Save failed",
        description: "Could not save pixel configuration.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-semibold">Retargeting Pixels</h2>
          <p className="text-muted-foreground">Manage tracking pixels for paid acquisition</p>
        </div>
        <Button variant="outline" onClick={fetchPixelConfigs}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pixels.filter(p => p.isActive && p.pixelId).length}</p>
                <p className="text-sm text-muted-foreground">Active Pixels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pixels.filter(p => !p.pixelId).length}</p>
                <p className="text-sm text-muted-foreground">Not Configured</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pixels.reduce((acc, p) => acc + p.events.length, 0)}</p>
                <p className="text-sm text-muted-foreground">Tracked Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pixel Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pixels.map((pixel, index) => (
          <motion.div
            key={pixel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={pixel.isActive && pixel.pixelId ? "border-green-500/30" : ""}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${pixel.color}15` }}
                    >
                      <pixel.icon className="w-5 h-5" style={{ color: pixel.color }} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{pixel.name}</CardTitle>
                      <CardDescription>{pixel.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`toggle-${pixel.id}`} className="text-sm text-muted-foreground">
                      {pixel.isActive ? "Active" : "Inactive"}
                    </Label>
                    <Switch
                      id={`toggle-${pixel.id}`}
                      checked={pixel.isActive}
                      onCheckedChange={() => togglePixelActive(pixel.id)}
                      disabled={!pixel.pixelId}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={`Enter ${pixel.name} ID`}
                    value={pixel.pixelId}
                    onChange={(e) => updatePixelId(pixel.id, e.target.value)}
                    className="font-mono text-sm"
                  />
                  <Button 
                    onClick={() => savePixelConfig(pixel)}
                    disabled={isSaving}
                    size="sm"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Events */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Tracked Events:</p>
                  <div className="flex flex-wrap gap-1">
                    {pixel.events.map(event => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Implementation Guide */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Active pixels will automatically fire PageView events on every page load.</p>
          <p>• Conversion events are tracked when users complete signup, trial applications, or membership inquiries.</p>
          <p>• All pixel firing respects GDPR consent via the CookieConsent component.</p>
          <p>• For custom event tracking, use the <code className="bg-muted px-1 rounded">firePixelEvent()</code> utility.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PixelManager;
