import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, TrendingUp, Clock, Sparkles, ArrowRight, Infinity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useCredits } from "@/hooks/useCredits";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import CreditPurchaseModal from "./CreditPurchaseModal";

const CreditsCard = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { balance, monthlyAllocation, isUnlimited, isLoading, transactions, refetch } = useCredits();
  const { tier, subscribed } = useSubscription();

  const usagePercentage = monthlyAllocation > 0 
    ? Math.min(100, ((monthlyAllocation - balance) / monthlyAllocation) * 100)
    : 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "allocation":
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case "usage":
        return <Clock className="w-3 h-3 text-amber-500" />;
      case "purchase":
        return <Coins className="w-3 h-3 text-primary" />;
      case "bonus":
        return <Sparkles className="w-3 h-3 text-purple-500" />;
      default:
        return <Coins className="w-3 h-3 text-muted-foreground" />;
    }
  };

  if (!subscribed) {
    return (
      <Card className="border-border/30 bg-card/50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Coins className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">Service Credits</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to receive monthly service credits
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/membership">View Plans <ArrowRight className="w-4 h-4 ml-2" /></a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-border/30 bg-card/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/30 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            Service Credits
          </div>
          {tier && (
            <Badge variant="outline" className="capitalize border-primary/30 text-primary">
              {tier}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Balance Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            {isUnlimited ? (
              <div className="flex items-center gap-2">
                <Infinity className="w-8 h-8 text-primary" />
                <span className="text-3xl font-light text-foreground">Unlimited</span>
              </div>
            ) : (
              <>
                <span className="text-4xl font-light text-foreground">{balance}</span>
                <span className="text-muted-foreground text-sm">/ {monthlyAllocation} credits</span>
              </>
            )}
          </div>
          
          {!isUnlimited && (
            <>
              <Progress value={100 - usagePercentage} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {balance} credits remaining this month
              </p>
            </>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
            <p className="text-xs text-muted-foreground mb-1">Monthly Allocation</p>
            <p className="text-lg font-medium text-foreground">
              {isUnlimited ? "∞" : monthlyAllocation}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
            <p className="text-xs text-muted-foreground mb-1">Used This Month</p>
            <p className="text-lg font-medium text-foreground">
              {isUnlimited ? "—" : monthlyAllocation - balance}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Recent Activity
            </p>
            <div className="space-y-2">
              {transactions.slice(0, 5).map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/10"
                >
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(tx.transaction_type)}
                    <div>
                      <p className="text-xs text-foreground line-clamp-1">
                        {tx.description || tx.transaction_type}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(tx.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    tx.amount > 0 ? "text-emerald-500" : "text-muted-foreground"
                  )}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Buy More Credits */}
        {!isUnlimited && (
          <div className="mt-6 pt-4 border-t border-border/30">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => setShowPurchaseModal(true)}
            >
              <Coins className="w-4 h-4 mr-2" />
              Purchase Additional Credits
            </Button>
          </div>
        )}
      </CardContent>

      {/* Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={refetch}
      />
    </Card>
  );
};

export default CreditsCard;