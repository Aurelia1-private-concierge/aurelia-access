import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, X, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
}

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreditPurchaseModal = ({ isOpen, onClose, onSuccess }: CreditPurchaseModalProps) => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsFetching(true);
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("is_active", true)
        .order("credits", { ascending: true });

      if (error) {
        console.error("Error fetching packages:", error);
        toast({
          title: "Error",
          description: "Failed to load credit packages",
          variant: "destructive",
        });
      } else {
        setPackages(data || []);
        if (data && data.length > 1) {
          setSelectedPackage(data[1].id); // Select second option by default (Value Pack)
        }
      }
      setIsFetching(false);
    };

    if (isOpen) {
      fetchPackages();
    }
  }, [isOpen]);

  const handlePurchase = async () => {
    if (!selectedPackage || !user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("purchase-credits", {
        body: { packageId: selectedPackage },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to initiate purchase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getPricePerCredit = (pkg: CreditPackage) => {
    return (pkg.price_cents / pkg.credits / 100).toFixed(2);
  };

  const getBestValue = () => {
    if (packages.length === 0) return null;
    let bestPkg = packages[0];
    let bestPricePerCredit = packages[0].price_cents / packages[0].credits;
    
    packages.forEach(pkg => {
      const ppc = pkg.price_cents / pkg.credits;
      if (ppc < bestPricePerCredit) {
        bestPricePerCredit = ppc;
        bestPkg = pkg;
      }
    });
    
    return bestPkg.id;
  };

  const bestValueId = getBestValue();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-foreground">Purchase Credits</h2>
                    <p className="text-sm text-muted-foreground">
                      Add service credits to your account
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Packages Grid */}
            <div className="p-6">
              {isFetching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {packages.map((pkg) => (
                    <motion.button
                      key={pkg.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all",
                        selectedPackage === pkg.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 bg-card"
                      )}
                    >
                      {/* Best Value Badge */}
                      {pkg.id === bestValueId && (
                        <div className="absolute -top-2 -right-2">
                          <span className="flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3" />
                            Best
                          </span>
                        </div>
                      )}

                      {/* Selected Check */}
                      {selectedPackage === pkg.id && (
                        <div className="absolute top-2 left-2">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        </div>
                      )}

                      <div className="text-center pt-4">
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Coins className="w-5 h-5 text-primary" />
                          <span className="text-2xl font-light text-foreground">{pkg.credits}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{pkg.name}</p>
                        <p className="text-lg font-medium text-foreground">
                          {formatPrice(pkg.price_cents)}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          ${getPricePerCredit(pkg)}/credit
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Purchase Button */}
              <Button
                onClick={handlePurchase}
                disabled={!selectedPackage || isLoading}
                className="w-full py-6 text-sm tracking-widest uppercase"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    Purchase Credits
                  </>
                )}
              </Button>

              {/* Info */}
              <p className="text-center text-xs text-muted-foreground mt-4">
                Credits never expire and can be used for any service request.
                <br />
                Secure payment powered by Stripe.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreditPurchaseModal;