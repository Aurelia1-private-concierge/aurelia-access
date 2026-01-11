import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Copy, Check, Users, DollarSign, Share2, Mail, MessageCircle, Linkedin, Twitter, ExternalLink, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const ReferralProgram = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, earned: 0 });
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [displayName, setDisplayName] = useState("A friend");

  // Generate referral link using user ID
  const referralLink = user?.id 
    ? `${window.location.origin}/referral?ref=${user.id}`
    : "";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch stats
        const { data } = await supabase
          .from("referrals")
          .select("status")
          .eq("referrer_id", user.id);
        
        if (data) {
          const total = data.length;
          const pending = data.filter(r => r.status === "pending").length;
          const subscribed = data.filter(r => ["subscribed", "rewarded"].includes(r.status)).length;
          setStats({ total, pending, earned: subscribed * 50 });
        }

        // Fetch display name
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();
        
        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        }
      } catch {
        // Silently fail
      }
    };

    fetchData();
  }, [user]);

  const handleSendInvitation = async () => {
    if (!inviteEmail || !user) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      // Create referral record
      const referralCode = `${user.id.slice(0, 8)}-${Date.now().toString(36)}`;
      
      await supabase.from("referrals").insert({
        referrer_id: user.id,
        referred_email: inviteEmail,
        referral_code: referralCode,
        status: "pending",
      });

      // Send invitation email
      const { error } = await supabase.functions.invoke("referral-email", {
        body: {
          type: "invitation",
          referredEmail: inviteEmail,
          referrerName: displayName,
          referralLink: `${referralLink}&code=${referralCode}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      
      setInviteEmail("");
      setStats(prev => ({ ...prev, total: prev.total + 1, pending: prev.pending + 1 }));
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Failed to send invitation",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Share your referral link with friends",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(`Join me on Aurelia, the world's most exclusive private concierge service: ${referralLink}`)}`,
      color: "text-emerald-500"
    },
    {
      name: "Email",
      icon: Mail,
      href: `mailto:?subject=${encodeURIComponent("You're Invited to Aurelia")}&body=${encodeURIComponent(`I'd like to invite you to Aurelia, the world's most exclusive private concierge service.\n\nJoin here: ${referralLink}`)}`,
      color: "text-blue-500"
    },
    {
      name: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent("Join me on Aurelia, the world's most exclusive private concierge service")}&url=${encodeURIComponent(referralLink)}`,
      color: "text-sky-500"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      color: "text-blue-600"
    }
  ];

  const statItems = [
    { label: "Referrals", value: stats.total.toString(), icon: Users },
    { label: "Pending", value: stats.pending.toString(), icon: Gift },
    { label: "Earned", value: `$${stats.earned}`, icon: DollarSign },
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-foreground">Refer & Earn</h3>
            <p className="text-xs text-muted-foreground">Invite friends, earn rewards</p>
          </div>
        </div>
        <Link to="/dashboard?tab=referrals">
          <Button variant="ghost" size="sm" className="text-xs">
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
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

      {/* Send Invitation */}
      <div className="space-y-3 mb-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">
          Send Invitation
        </label>
        <div className="flex gap-2">
          <Input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Enter email address"
            className="bg-muted/30 border-border/50 text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleSendInvitation()}
          />
          <Button
            onClick={handleSendInvitation}
            disabled={isSending || !inviteEmail}
            size="sm"
            className="shrink-0"
          >
            {isSending ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="space-y-3 mb-4">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">
          Or Share Your Link
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={referralLink}
              readOnly
              className="bg-muted/30 border-border/50 text-xs pr-10 truncate"
            />
            <button
              onClick={handleCopy}
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

      {/* Quick Share Buttons */}
      <div className="flex items-center gap-2 mb-4">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex-1 flex items-center justify-center p-2.5 rounded-lg border border-border/30",
              "bg-card/30 hover:bg-muted/30 transition-colors",
              link.color
            )}
            title={`Share on ${link.name}`}
          >
            <link.icon className="w-4 h-4" />
          </a>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/30">
        {statItems.map((stat) => (
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
