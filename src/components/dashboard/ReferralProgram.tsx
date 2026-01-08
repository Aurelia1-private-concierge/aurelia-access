import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Users, DollarSign, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ReferralProgram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate referral code from user ID
  const referralCode = user?.id 
    ? `AURELIA-${user.id.slice(0, 8).toUpperCase()}`
    : "AURELIA-MEMBER";
  
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Share your referral link with friends",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Aurelia",
          text: "Get exclusive access to luxury concierge services with Aurelia. Use my referral link:",
          url: referralLink,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy(referralLink);
    }
  };

  const stats = [
    { label: "Referrals", value: "0", icon: Users },
    { label: "Pending", value: "0", icon: Gift },
    { label: "Earned", value: "$0", icon: DollarSign },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="p-6 bg-card/50 border border-border/30 backdrop-blur-sm rounded-lg"
      data-tour="referral-program"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-serif text-lg text-foreground">Refer & Earn</h3>
          <p className="text-xs text-muted-foreground">Invite friends, earn rewards</p>
        </div>
      </div>

      {/* Reward Info */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 mb-4">
        <p className="text-sm text-foreground mb-1">
          Earn <span className="text-primary font-medium">1 month free</span> for each friend who subscribes
        </p>
        <p className="text-xs text-muted-foreground">
          Your friend also receives 20% off their first month
        </p>
      </div>

      {/* Referral Code */}
      <div className="space-y-3 mb-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">
          Your Referral Code
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={referralCode}
              readOnly
              className="bg-muted/30 border-border/50 font-mono text-sm pr-10"
            />
            <button
              onClick={() => handleCopy(referralCode)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Share Button */}
      <Button
        onClick={handleShare}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gold-glow-hover mb-4"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share Referral Link
      </Button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/30">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <stat.icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-light text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default ReferralProgram;
