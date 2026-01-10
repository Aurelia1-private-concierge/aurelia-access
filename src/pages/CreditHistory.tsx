import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, TrendingUp, TrendingDown, RefreshCw, Package, Gift, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCredits } from "@/hooks/useCredits";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string | null;
  balance_after: number;
  created_at: string;
}

const CreditHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, monthlyAllocation, isUnlimited, isLoading: creditsLoading, refetch } = useCredits();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "allocation":
        return <RefreshCw className="w-4 h-4" />;
      case "purchase":
        return <Package className="w-4 h-4" />;
      case "bonus":
        return <Gift className="w-4 h-4" />;
      case "refund":
        return <Undo className="w-4 h-4" />;
      case "usage":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Coins className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return "text-emerald-400";
    return "text-red-400";
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case "allocation":
        return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Monthly</Badge>;
      case "purchase":
        return <Badge variant="secondary" className="bg-primary/20 text-primary">Purchase</Badge>;
      case "bonus":
        return <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">Bonus</Badge>;
      case "refund":
        return <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">Refund</Badge>;
      case "usage":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Usage</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.created_at).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-serif text-foreground">Credit History</h1>
                <p className="text-muted-foreground">Track your credit transactions and usage</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      {creditsLoading ? (
                        <Skeleton className="h-8 w-20 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-primary">
                          {isUnlimited ? "∞" : balance}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Allocation</p>
                      {creditsLoading ? (
                        <Skeleton className="h-8 w-20 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-foreground">
                          {isUnlimited ? "Unlimited" : monthlyAllocation}
                        </p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-20 mt-1" />
                      ) : (
                        <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction List */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-serif">Transaction History</CardTitle>
                <Button variant="ghost" size="sm" onClick={refetch}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-48 mb-2" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                    ))}
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <Coins className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your credit activity will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(groupedTransactions).map(([date, txs]) => (
                      <div key={date}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4">{date}</h3>
                        <div className="space-y-3">
                          {txs.map((tx, index) => (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                tx.amount > 0 ? "bg-emerald-500/10" : "bg-red-500/10"
                              }`}>
                                <span className={getTransactionColor(tx.transaction_type, tx.amount)}>
                                  {getTransactionIcon(tx.transaction_type)}
                                </span>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-foreground truncate">
                                    {tx.description || `${tx.transaction_type} transaction`}
                                  </p>
                                  {getTransactionBadge(tx.transaction_type)}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(tx.created_at)} • Balance: {tx.balance_after}
                                </p>
                              </div>
                              
                              <div className={`text-lg font-bold ${getTransactionColor(tx.transaction_type, tx.amount)}`}>
                                {tx.amount > 0 ? "+" : ""}{tx.amount}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreditHistory;
