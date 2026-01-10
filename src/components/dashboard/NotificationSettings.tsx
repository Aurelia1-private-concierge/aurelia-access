import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Clock, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotificationSettings {
  sms_enabled: boolean;
  email_enabled: boolean;
  daily_digest_enabled: boolean;
  digest_time: string;
  phone_number: string | null;
  alert_types: string[];
}

const alertTypeOptions = [
  { value: "service_update", label: "Service Updates" },
  { value: "new_offer", label: "New Offers & Experiences" },
  { value: "request_status", label: "Request Status Changes" },
  { value: "partner_message", label: "Partner Messages" },
];

const digestTimeOptions = [
  { value: "07:00:00", label: "7:00 AM" },
  { value: "08:00:00", label: "8:00 AM" },
  { value: "09:00:00", label: "9:00 AM" },
  { value: "10:00:00", label: "10:00 AM" },
  { value: "12:00:00", label: "12:00 PM" },
];

const NotificationSettings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    sms_enabled: false,
    email_enabled: true,
    daily_digest_enabled: true,
    digest_time: "09:00:00",
    phone_number: null,
    alert_types: ["service_update", "new_offer", "request_status"],
  });

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching settings:", error);
        return;
      }

      if (data) {
        setSettings({
          sms_enabled: data.sms_enabled,
          email_enabled: data.email_enabled,
          daily_digest_enabled: data.daily_digest_enabled,
          digest_time: data.digest_time,
          phone_number: data.phone_number,
          alert_types: data.alert_types || [],
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("notification_settings")
        .upsert({
          user_id: user.id,
          sms_enabled: settings.sms_enabled,
          email_enabled: settings.email_enabled,
          daily_digest_enabled: settings.daily_digest_enabled,
          digest_time: settings.digest_time,
          phone_number: settings.phone_number,
          alert_types: settings.alert_types,
        }, {
          onConflict: "user_id",
        });

      if (error) throw error;

      toast.success("Notification preferences saved");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAlertType = (type: string) => {
    setSettings(prev => ({
      ...prev,
      alert_types: prev.alert_types.includes(type)
        ? prev.alert_types.filter(t => t !== type)
        : [...prev.alert_types, type],
    }));
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-secondary/50 rounded w-1/3" />
        <div className="h-24 bg-secondary/50 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you'd like to receive updates
          </p>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="bg-card/50 border border-border/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
          </div>
          <Switch
            checked={settings.email_enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_enabled: checked }))}
          />
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-card/50 border border-border/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">SMS Alerts</p>
              <p className="text-sm text-muted-foreground">Get instant text message alerts</p>
            </div>
          </div>
          <Switch
            checked={settings.sms_enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, sms_enabled: checked }))}
          />
        </div>

        {settings.sms_enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-4 border-t border-border/30"
          >
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={settings.phone_number || ""}
              onChange={(e) => setSettings(prev => ({ ...prev, phone_number: e.target.value }))}
              className="mt-1.5"
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              <span>SMS alerts require Twilio configuration</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Daily Digest */}
      <div className="bg-card/50 border border-border/30 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Daily Digest</p>
              <p className="text-sm text-muted-foreground">Summary of your notifications</p>
            </div>
          </div>
          <Switch
            checked={settings.daily_digest_enabled}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, daily_digest_enabled: checked }))}
          />
        </div>

        {settings.daily_digest_enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-4 border-t border-border/30"
          >
            <Label>Preferred Time</Label>
            <Select
              value={settings.digest_time}
              onValueChange={(value) => setSettings(prev => ({ ...prev, digest_time: value }))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {digestTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}
      </div>

      {/* Alert Types */}
      <div className="bg-card/50 border border-border/30 rounded-xl p-5 space-y-4">
        <div>
          <p className="font-medium text-foreground mb-1">Alert Types</p>
          <p className="text-sm text-muted-foreground">Select which notifications you want to receive</p>
        </div>
        <div className="space-y-3">
          {alertTypeOptions.map((option) => (
            <div key={option.value} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{option.label}</span>
              <Switch
                checked={settings.alert_types.includes(option.value)}
                onCheckedChange={() => toggleAlertType(option.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? "Saving..." : "Save Preferences"}
      </Button>
    </motion.div>
  );
};

export default NotificationSettings;
