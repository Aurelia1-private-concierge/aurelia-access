import { useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Clock, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { QuantumInput, QuantumButton, QuantumProgress, QuantumModal } from "@/components/quantum";
import { cn } from "@/lib/utils";

interface QuantumBidPanelProps {
  auctionTitle: string;
  currentBid: number;
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  currency?: string;
  endsAt: Date;
  isOpen: boolean;
  onClose: () => void;
  onPlaceBid: (amount: number) => Promise<void>;
  isLoading?: boolean;
}

export const QuantumBidPanel = ({
  auctionTitle,
  currentBid,
  startingPrice,
  reservePrice,
  buyNowPrice,
  currency = "USD",
  endsAt,
  isOpen,
  onClose,
  onPlaceBid,
  isLoading = false,
}: QuantumBidPanelProps) => {
  const minBid = currentBid > 0 ? currentBid + 1000 : startingPrice;
  const [bidAmount, setBidAmount] = useState(minBid.toString());
  const [error, setError] = useState<string>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const diff = endsAt.getTime() - now.getTime();
    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleSubmit = async () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount)) {
      setError("Please enter a valid amount");
      return;
    }
    if (amount < minBid) {
      setError(`Minimum bid is ${formatCurrency(minBid)}`);
      return;
    }
    setError(undefined);
    await onPlaceBid(amount);
  };

  const reserveProgress = reservePrice
    ? Math.min((currentBid / reservePrice) * 100, 100)
    : 100;

  return (
    <QuantumModal
      isOpen={isOpen}
      onClose={onClose}
      title="Place Your Bid"
      size="md"
    >
      <div className="space-y-6">
        {/* Auction info */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h3 className="font-mono text-sm text-primary mb-1">Bidding on:</h3>
          <p className="text-foreground font-medium">{auctionTitle}</p>
        </div>

        {/* Current bid and time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Current Bid
            </p>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-2xl font-mono font-bold text-primary tabular-nums">
                {formatCurrency(currentBid || startingPrice)}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
              Time Remaining
            </p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-2xl font-mono font-bold text-foreground tabular-nums">
                {getTimeRemaining()}
              </span>
            </div>
          </div>
        </div>

        {/* Reserve price progress */}
        {reservePrice && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-muted-foreground">Reserve Progress</span>
              <span className={cn(
                "text-xs font-mono",
                reserveProgress >= 100 ? "text-emerald-400" : "text-amber-400"
              )}>
                {reserveProgress >= 100 ? "Reserve Met!" : `${Math.round(reserveProgress)}%`}
              </span>
            </div>
            <QuantumProgress
              value={reserveProgress}
              variant={reserveProgress >= 100 ? "success" : "warning"}
              showValue={false}
              size="sm"
            />
          </div>
        )}

        {/* Bid input */}
        <div className="space-y-2">
          <QuantumInput
            type="number"
            label={`Your Bid (${currency})`}
            value={bidAmount}
            onChange={(e) => {
              setBidAmount(e.target.value);
              setError(undefined);
            }}
            placeholder="Enter bid amount"
            error={error}
            icon={<Gavel className="w-4 h-4" />}
          />
          <p className="text-xs font-mono text-muted-foreground">
            Minimum bid: {formatCurrency(minBid)}
          </p>
        </div>

        {/* Buy now option */}
        {buyNowPrice && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-400">Buy Now Available</p>
                <p className="text-xs text-muted-foreground">Skip the auction and purchase immediately</p>
              </div>
              <span className="text-lg font-mono font-bold text-emerald-400">
                {formatCurrency(buyNowPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <QuantumButton
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </QuantumButton>
          <QuantumButton
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            className="flex-1"
            showParticles
          >
            {isLoading ? "Placing Bid..." : "Confirm Bid"}
          </QuantumButton>
        </div>

        {/* Trust indicator */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span className="font-mono">Secured by Aurelia Verified Bidding</span>
        </div>
      </div>
    </QuantumModal>
  );
};

export default QuantumBidPanel;
