import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bell, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type NotificationType = "system" | "portfolio" | "message" | "document";

const notificationTypes: { value: NotificationType; label: string; description: string }[] = [
  { value: "system", label: "System Update", description: "Platform announcements and updates" },
  { value: "portfolio", label: "Portfolio Alert", description: "Investment and portfolio updates" },
  { value: "message", label: "Message", description: "General communications" },
  { value: "document", label: "Document", description: "Document-related notifications" },
];

const BroadcastNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<NotificationType>("system");
  const [sendEmail, setSendEmail] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ notifications: number; emails: number } | null>(null);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter a title and message.",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("broadcast-notification", {
        body: {
          title: title.trim(),
          message: message.trim(),
          type,
          sendEmail,
        },
      });

      if (error) throw error;

      setLastResult({
        notifications: data.notificationsSent || 0,
        emails: data.emailsSent || 0,
      });

      toast({
        title: "Broadcast Sent",
        description: `Sent to ${data.notificationsSent} members${sendEmail ? ` (${data.emailsSent} emails)` : ""}.`,
      });

      // Clear form
      setTitle("");
      setMessage("");
      setSendEmail(false);
    } catch (err) {
      console.error("Broadcast error:", err);
      toast({
        title: "Broadcast Failed",
        description: "Failed to send notifications. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-xl p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-foreground">Broadcast Notification</h3>
          <p className="text-sm text-muted-foreground">Send updates to all members</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Notification Type */}
        <div className="space-y-2">
          <Label>Notification Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
            <SelectTrigger className="bg-background border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {notificationTypes.map((nt) => (
                <SelectItem key={nt.value} value={nt.value}>
                  <div>
                    <span>{nt.label}</span>
                    <span className="text-muted-foreground text-xs ml-2">— {nt.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="e.g., Exclusive Event Access Available"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background border-border/50"
          />
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label>Message</Label>
          <Textarea
            placeholder="Enter your notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-background border-border/50 min-h-24 resize-none"
          />
        </div>

        {/* Email Toggle */}
        <div className="flex items-center justify-between py-3 px-4 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-foreground">Also send via email</p>
              <p className="text-xs text-muted-foreground">Deliver to member inboxes</p>
            </div>
          </div>
          <Switch checked={sendEmail} onCheckedChange={setSendEmail} />
        </div>

        {/* Result Display */}
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-3 py-3 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div className="text-sm">
              <span className="text-emerald-400 font-medium">
                {lastResult.notifications} notifications sent
              </span>
              {lastResult.emails > 0 && (
                <span className="text-muted-foreground"> • {lastResult.emails} emails delivered</span>
              )}
            </div>
          </motion.div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleBroadcast}
          disabled={sending || !title.trim() || !message.trim()}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Broadcasting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Broadcast to All Members
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default BroadcastNotifications;
