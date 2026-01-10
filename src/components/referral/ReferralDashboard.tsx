import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Gift, 
  Users, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Mail,
  ArrowRight,
  Trophy,
  Sparkles,
  TrendingUp,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import SocialShareButtons from "./SocialShareButtons";
import { cn } from "@/lib/utils";

interface Referral {
  id: string;
  referred_email: string;
  status: string;
  reward_amount: number | null;
  created_at: string;
  signed_up_at: string | null;
  subscribed_at: string | null;
}

interface Reward {
  id: string;
  reward_type: string;
  reward_value: number | null;
  description: string | null;
  status: string;
  expires_at: string | null;
  created_at: string;
}

const ReferralDashboard = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate referral link
  const referralLink = user?.id 
    ? `${window.location.origin}/referral?ref=${user.id}`
    : "";

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch referrals
        const { data: referralsData } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        if (referralsData) {
          setReferrals(referralsData as Referral[]);
        }

        // Fetch rewards
        const { data: rewardsData } = await supabase
          .from("referral_rewards")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (rewardsData) {
          setRewards(rewardsData as Reward[]);
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Calculate stats
  const totalReferrals = referrals.length;
  const pendingReferrals = referrals.filter(r => r.status === "pending").length;
  const signedUpReferrals = referrals.filter(r => ["signed_up", "subscribed", "rewarded"].includes(r.status)).length;
  const subscribedReferrals = referrals.filter(r => ["subscribed", "rewarded"].includes(r.status)).length;
  const totalEarned = rewards
    .filter(r => r.status === "applied")
    .reduce((sum, r) => sum + (r.reward_value || 0), 0);
  const pendingRewards = rewards.filter(r => r.status === "pending").length;

  // Progress to next tier
  const referralsToNextTier = 5;
  const progress = Math.min((subscribedReferrals / referralsToNextTier) * 100, 100);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500/30">Pending</Badge>;
      case "signed_up":
        return <Badge variant="outline" className="text-blue-500 border-blue-500/30">Signed Up</Badge>;
      case "subscribed":
        return <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Subscribed</Badge>;
      case "rewarded":
        return <Badge className="bg-primary/10 text-primary border-primary/30">Rewarded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "free_month":
        return <Calendar className="w-4 h-4" />;
      case "discount":
        return <DollarSign className="w-4 h-4" />;
      case "credit":
        return <Sparkles className="w-4 h-4" />;
      case "tier_upgrade":
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">Referral Program</h2>
          <p className="text-sm text-muted-foreground">
            Invite friends and earn exclusive rewards
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {subscribedReferrals} of {referralsToNextTier} referrals to next tier
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/30 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-serif text-foreground">{totalReferrals}</p>
              <p className="text-xs text-muted-foreground">Total Invites</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="border-border/30 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <p className="text-2xl font-serif text-foreground">{pendingReferrals}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/30 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-2xl font-serif text-foreground">{subscribedReferrals}</p>
              <p className="text-xs text-muted-foreground">Subscribed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className="border-border/30 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-serif text-foreground">
                {pendingRewards > 0 ? pendingRewards : totalEarned > 0 ? `$${totalEarned}` : "0"}
              </p>
              <p className="text-xs text-muted-foreground">
                {pendingRewards > 0 ? "Pending Rewards" : "Earned"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress to Next Tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Ambassador Status</span>
              </div>
              <Badge variant="outline" className="border-primary/30 text-primary">
                {subscribedReferrals >= referralsToNextTier ? "Unlocked" : "In Progress"}
              </Badge>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {subscribedReferrals >= referralsToNextTier 
                ? "Congratulations! You've unlocked Ambassador perks"
                : `${referralsToNextTier - subscribedReferrals} more subscribed referrals to unlock exclusive Ambassador perks`}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Share Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="border-border/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Share Your Invitation
            </CardTitle>
            <CardDescription>
              Earn 1 free month for each friend who subscribes. They get 20% off their first month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SocialShareButtons 
              url={referralLink}
              title="Join Aurelia Private Concierge"
              description="You've been invited to the world's most exclusive private concierge service. Get priority access to luxury experiences."
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Referrals List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border/30 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Referrals
            </CardTitle>
            <CardDescription>
              Track the status of your invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No referrals yet</p>
                <p className="text-sm text-muted-foreground">
                  Share your referral link to start earning rewards
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.slice(0, 10).map((referral, index) => (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {referral.referred_email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Invited {format(new Date(referral.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(referral.status)}
                  </motion.div>
                ))}
                {referrals.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    And {referrals.length - 10} more...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Rewards History */}
      {rewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="border-border/30 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Your Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rewards.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      reward.status === "pending" 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-muted/20 border-border/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        reward.status === "pending" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                      )}>
                        {getRewardIcon(reward.reward_type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {reward.description || reward.reward_type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(reward.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={reward.status === "pending" ? "default" : "outline"}
                      className={reward.status === "pending" ? "bg-primary text-primary-foreground" : ""}
                    >
                      {reward.status === "pending" ? "Ready to Use" : reward.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ReferralDashboard;
