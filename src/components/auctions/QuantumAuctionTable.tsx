import { motion } from "framer-motion";
import { Gavel, Eye, Heart, Clock, ArrowUpRight, CheckCircle } from "lucide-react";
import { QuantumTable, QuantumButton } from "@/components/quantum";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Auction {
  id: string;
  title: string;
  category: string;
  currentBid: number;
  startingPrice: number;
  currency: string;
  endsAt: Date;
  status: "active" | "upcoming" | "ended";
  imageUrl?: string;
  isWatched?: boolean;
  bidCount?: number;
}

interface QuantumAuctionTableProps {
  auctions: Auction[];
  onBid: (auctionId: string) => void;
  onWatch: (auctionId: string) => void;
  onView: (auctionId: string) => void;
  className?: string;
}

export const QuantumAuctionTable = ({
  auctions,
  onBid,
  onWatch,
  onView,
  className,
}: QuantumAuctionTableProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const columns = [
    {
      key: "title" as const,
      label: "Auction",
      sortable: true,
      render: (value: string, row: Auction) => (
        <div className="flex items-center gap-3">
          {row.imageUrl && (
            <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              <img src={row.imageUrl} alt={value} className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <p className="font-medium text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "currentBid" as const,
      label: "Current Bid",
      sortable: true,
      render: (value: number, row: Auction) => (
        <div>
          <p className="font-mono text-primary font-bold">
            {formatCurrency(value || row.startingPrice, row.currency)}
          </p>
          {row.bidCount && (
            <p className="text-xs text-muted-foreground font-mono">{row.bidCount} bids</p>
          )}
        </div>
      ),
    },
    {
      key: "endsAt" as const,
      label: "Ends In",
      sortable: true,
      render: (value: Date, row: Auction) => {
        const timeLeft = formatDistanceToNow(value, { addSuffix: false });
        const isEnding = new Date(value).getTime() - Date.now() < 3600000; // Less than 1 hour

        return (
          <div className="flex items-center gap-2">
            <motion.div
              animate={isEnding ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Clock className={cn("w-4 h-4", isEnding ? "text-amber-400" : "text-muted-foreground")} />
            </motion.div>
            <span className={cn("font-mono text-sm", isEnding && "text-amber-400")}>
              {timeLeft}
            </span>
          </div>
        );
      },
    },
    {
      key: "status" as const,
      label: "Status",
      render: (value: string) => (
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-xs",
            value === "active" && "border-emerald-500/50 text-emerald-400",
            value === "upcoming" && "border-primary/50 text-primary",
            value === "ended" && "border-muted text-muted-foreground"
          )}
        >
          {value === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
    {
      key: "id" as const,
      label: "Actions",
      render: (value: string, row: Auction) => (
        <div className="flex items-center gap-2">
          <QuantumButton
            size="sm"
            variant={row.isWatched ? "primary" : "ghost"}
            onClick={() => onWatch(value)}
            icon={<Heart className={cn("w-4 h-4", row.isWatched && "fill-current")} />}
          >
            {""}
          </QuantumButton>
          <QuantumButton
            size="sm"
            variant="ghost"
            onClick={() => onView(value)}
            icon={<Eye className="w-4 h-4" />}
          >
            {""}
          </QuantumButton>
          {row.status === "active" && (
            <QuantumButton
              size="sm"
              variant="primary"
              onClick={() => onBid(value)}
              icon={<Gavel className="w-4 h-4" />}
            >
              Bid
            </QuantumButton>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={className}>
      <QuantumTable
        data={auctions}
        columns={columns}
        selectable={false}
        expandable={false}
        animated
        stickyHeader
      />
    </div>
  );
};

export default QuantumAuctionTable;
