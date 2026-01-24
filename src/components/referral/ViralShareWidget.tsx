import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Share2, 
  MessageCircle, 
  Twitter, 
  Linkedin, 
  Mail, 
  Copy, 
  Check,
  Gift,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ViralShareWidgetProps {
  referralCode?: string;
  variant?: "compact" | "full";
  className?: string;
}

type ShareChannel = "whatsapp" | "twitter" | "linkedin" | "email" | "sms" | "copy";

const SHARE_MESSAGES = {
  default: "I just discovered Aurelia – the ultimate private concierge for extraordinary experiences. Join the waitlist and get priority access!",
  whatsapp: "I just discovered Aurelia – the ultimate private concierge! ✨ From private jets to impossible reservations, they handle it all. Join me on the waitlist:",
  twitter: "Just discovered @AureliaHQ – the future of luxury concierge services. Private aviation, exclusive access, AI-powered assistance 24/7. This is next level. 🌟",
  linkedin: "Excited to share Aurelia – a revolutionary private concierge service combining AI technology with white-glove service for extraordinary experiences. Worth checking out for those who value their time.",
  email: "I thought you'd be interested in Aurelia – a private concierge service that handles everything from private aviation to exclusive event access. They're currently accepting waitlist applications."
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem("share_session");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("share_session", sessionId);
  }
  return sessionId;
};

export const ViralShareWidget = ({ 
  referralCode, 
  variant = "full",
  className = ""
}: ViralShareWidgetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = referralCode 
    ? `${baseUrl}/waitlist?ref=${referralCode}`
    : `${baseUrl}/waitlist`;

  const trackShare = useCallback(async (channel: ShareChannel) => {
    try {
      await supabase.from("referral_shares").insert({
        user_id: user?.id || null,
        session_id: getSessionId(),
        channel,
        referral_code: referralCode || null,
        page_path: window.location.pathname
      });
      setShareCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to track share:", error);
    }
  }, [user, referralCode]);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`${SHARE_MESSAGES.whatsapp} ${shareUrl}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
    trackShare("whatsapp");
  };

  const handleTwitter = () => {
    const text = encodeURIComponent(SHARE_MESSAGES.twitter);
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
    trackShare("twitter");
  };

  const handleLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent("Aurelia – Private Concierge Reimagined");
    const summary = encodeURIComponent(SHARE_MESSAGES.linkedin);
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`, "_blank");
    trackShare("linkedin");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Check out Aurelia – Extraordinary Concierge Services");
    const body = encodeURIComponent(`${SHARE_MESSAGES.email}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    trackShare("email");
  };

  const handleSMS = () => {
    const message = encodeURIComponent(`${SHARE_MESSAGES.default} ${shareUrl}`);
    window.location.href = `sms:?body=${message}`;
    trackShare("sms");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare("copy");
      toast({
        title: "Link copied!",
        description: "Share it with friends to earn rewards.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={handleWhatsApp}
          className="p-2 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] transition-colors"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={handleTwitter}
          className="p-2 rounded-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] transition-colors"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={handleLinkedIn}
          className="p-2 rounded-full bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] transition-colors"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </button>
        <button
          onClick={handleCopy}
          className="p-2 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
          aria-label="Copy link"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-card to-muted/50 border border-border rounded-2xl p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
          <Share2 className="w-5 h-5 text-gold" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Share & Earn Rewards</h3>
          <p className="text-sm text-muted-foreground">Invite friends to unlock exclusive perks</p>
        </div>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Button
          variant="outline"
          onClick={handleWhatsApp}
          className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-[#25D366]/10 hover:border-[#25D366]/30"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          <span className="text-xs">WhatsApp</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleTwitter}
          className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-[#1DA1F2]/10 hover:border-[#1DA1F2]/30"
        >
          <Twitter className="w-5 h-5 text-[#1DA1F2]" />
          <span className="text-xs">Twitter</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleLinkedIn}
          className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/30"
        >
          <Linkedin className="w-5 h-5 text-[#0A66C2]" />
          <span className="text-xs">LinkedIn</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleEmail}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <Mail className="w-5 h-5" />
          <span className="text-xs">Email</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleSMS}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs">SMS</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="flex flex-col items-center gap-1 h-auto py-3"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
          <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
        </Button>
      </div>

      {/* Progress indicator */}
      {shareCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-gold/5 border border-gold/20 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium">Share Progress</span>
            </div>
            <span className="text-sm text-gold font-semibold">{shareCount}/5</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((shareCount / 5) * 100, 100)}%` }}
              className="bg-gradient-to-r from-gold to-gold/70 h-2 rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {shareCount >= 5 
              ? "🎉 You've unlocked founding member perks!" 
              : `Share ${5 - shareCount} more times to unlock rewards`}
          </p>
        </motion.div>
      )}

      {/* Referral stats */}
      {referralCode && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Your referral code:</span>
            </div>
            <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
              {referralCode}
            </code>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ViralShareWidget;
