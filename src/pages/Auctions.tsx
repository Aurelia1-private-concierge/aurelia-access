import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Gavel, Clock, Eye, Heart, TrendingUp, Filter, Search,
  ChevronRight, Award, Shield, Sparkles, ArrowUpRight
} from "lucide-react";
import { format, formatDistanceToNow, isPast, isFuture } from "date-fns";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  starting_price: number;
  current_bid: number;
  reserve_price: number | null;
  buy_now_price: number | null;
  currency: string;
  images: string[];
  specifications: Record<string, unknown>;
  starts_at: string;
  ends_at: string;
  status: string;
}

interface Bid {
  id: string;
  auction_id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

const categories = [
  { id: "all", label: "All Categories", icon: Sparkles },
  { id: "watches", label: "Timepieces", icon: Clock },
  { id: "art", label: "Fine Art", icon: Award },
  { id: "automobiles", label: "Automobiles", icon: TrendingUp },
  { id: "wine", label: "Wine & Spirits", icon: Sparkles },
  { id: "experiences", label: "Experiences", icon: Heart },
];

const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Auctions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showBidDialog, setShowBidDialog] = useState(false);

  // Fetch auctions
  const { data: auctions = [], isLoading } = useQuery({
    queryKey: ["auctions", selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("auctions")
        .select("*")
        .in("status", ["active", "upcoming"])
        .order("ends_at", { ascending: true });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Auction[];
    },
  });

  // Fetch user's watchlist
  const { data: watchlist = [] } = useQuery({
    queryKey: ["auction-watchlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("auction_watchlist")
        .select("auction_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map((w) => w.auction_id);
    },
    enabled: !!user,
  });

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async ({ auctionId, amount }: { auctionId: string; amount: number }) => {
      if (!user) throw new Error("Must be logged in to bid");

      // Insert bid
      const { error: bidError } = await supabase
        .from("auction_bids")
        .insert({
          auction_id: auctionId,
          user_id: user.id,
          amount,
        });

      if (bidError) throw bidError;

      // Update auction current_bid
      const { error: updateError } = await supabase
        .from("auctions")
        .update({ current_bid: amount })
        .eq("id", auctionId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      setShowBidDialog(false);
      setBidAmount("");
      toast({
        title: "Bid Placed Successfully",
        description: "Your bid has been recorded. Good luck!",
      });
    },
    onError: (error) => {
      toast({
        title: "Bid Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle watchlist mutation
  const toggleWatchlistMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      if (!user) throw new Error("Must be logged in");

      const isWatched = watchlist.includes(auctionId);

      if (isWatched) {
        const { error } = await supabase
          .from("auction_watchlist")
          .delete()
          .eq("auction_id", auctionId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("auction_watchlist")
          .insert({ auction_id: auctionId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auction-watchlist"] });
    },
  });

  const filteredAuctions = auctions.filter((auction) =>
    auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    auction.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAuctions = filteredAuctions.filter((a) => a.status === "active");
  const upcomingAuctions = filteredAuctions.filter((a) => a.status === "upcoming");

  const handlePlaceBid = () => {
    if (!selectedAuction || !bidAmount) return;
    const amount = parseFloat(bidAmount);
    const minBid = selectedAuction.current_bid > 0 
      ? selectedAuction.current_bid + 1000 
      : selectedAuction.starting_price;

    if (amount < minBid) {
      toast({
        title: "Bid Too Low",
        description: `Minimum bid is ${formatCurrency(minBid, selectedAuction.currency)}`,
        variant: "destructive",
      });
      return;
    }

    placeBidMutation.mutate({ auctionId: selectedAuction.id, amount });
  };

  const openBidDialog = (auction: Auction) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to place a bid",
        variant: "destructive",
      });
      return;
    }
    setSelectedAuction(auction);
    const minBid = auction.current_bid > 0 
      ? auction.current_bid + 1000 
      : auction.starting_price;
    setBidAmount(minBid.toString());
    setShowBidDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 border-primary/30">
              <Gavel className="w-3 h-3 mr-2" />
              Exclusive Auctions
            </Badge>
            <h1 
              className="text-4xl md:text-6xl font-light mb-6 tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Curated Treasures,{" "}
              <span className="text-primary">Exceptional Finds</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Access rare collectibles, extraordinary experiences, and investment-grade 
              assets through our private auction platform. Every lot is authenticated 
              and curated for discerning collectors.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-y border-border/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="whitespace-nowrap"
                >
                  <cat.icon className="w-4 h-4 mr-2" />
                  {cat.label}
                </Button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Active Auctions */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h2 
              className="text-2xl font-light"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Live Auctions
            </h2>
            <Badge variant="secondary">{activeAuctions.length}</Badge>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeAuctions.length === 0 ? (
            <Card className="p-12 text-center">
              <Gavel className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No active auctions in this category</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {activeAuctions.map((auction, index) => (
                  <AuctionCard
                    key={auction.id}
                    auction={auction}
                    index={index}
                    isWatched={watchlist.includes(auction.id)}
                    onBid={() => openBidDialog(auction)}
                    onToggleWatch={() => toggleWatchlistMutation.mutate(auction.id)}
                    isAuthenticated={!!user}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Auctions */}
      {upcomingAuctions.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h2 
                className="text-2xl font-light"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Coming Soon
              </h2>
              <Badge variant="outline">{upcomingAuctions.length}</Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingAuctions.map((auction, index) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  index={index}
                  isWatched={watchlist.includes(auction.id)}
                  onBid={() => {}}
                  onToggleWatch={() => toggleWatchlistMutation.mutate(auction.id)}
                  isAuthenticated={!!user}
                  isUpcoming
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Banner */}
      <section className="py-16 border-t border-border/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h3 className="font-medium">Authenticated</h3>
              <p className="text-sm text-muted-foreground">
                Every item verified by leading experts
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Award className="w-8 h-8 text-primary" />
              <h3 className="font-medium">Curated Selection</h3>
              <p className="text-sm text-muted-foreground">
                Only exceptional pieces make our auctions
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Heart className="w-8 h-8 text-primary" />
              <h3 className="font-medium">White Glove Service</h3>
              <p className="text-sm text-muted-foreground">
                Full support from bidding to delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Bid Dialog */}
      <Dialog open={showBidDialog} onOpenChange={setShowBidDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle 
              className="text-xl"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Place Your Bid
            </DialogTitle>
            <DialogDescription>
              {selectedAuction?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedAuction && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Current Bid
                  </p>
                  <p className="text-2xl font-light">
                    {formatCurrency(
                      selectedAuction.current_bid || selectedAuction.starting_price,
                      selectedAuction.currency
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Time Left
                  </p>
                  <p className="text-lg">
                    {formatDistanceToNow(new Date(selectedAuction.ends_at))}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Your Bid ({selectedAuction.currency})</label>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter bid amount"
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum bid: {formatCurrency(
                    selectedAuction.current_bid > 0 
                      ? selectedAuction.current_bid + 1000 
                      : selectedAuction.starting_price,
                    selectedAuction.currency
                  )}
                </p>
              </div>

              {selectedAuction.buy_now_price && (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Buy Now:</span>{" "}
                    {formatCurrency(selectedAuction.buy_now_price, selectedAuction.currency)}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowBidDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handlePlaceBid}
                  disabled={placeBidMutation.isPending}
                >
                  {placeBidMutation.isPending ? "Placing Bid..." : "Confirm Bid"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                By placing a bid, you agree to our auction terms and conditions.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Auction Card Component
interface AuctionCardProps {
  auction: Auction;
  index: number;
  isWatched: boolean;
  onBid: () => void;
  onToggleWatch: () => void;
  isAuthenticated: boolean;
  isUpcoming?: boolean;
}

const AuctionCard = ({
  auction,
  index,
  isWatched,
  onBid,
  onToggleWatch,
  isAuthenticated,
  isUpcoming = false,
}: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTimer = () => {
      const end = new Date(isUpcoming ? auction.starts_at : auction.ends_at);
      const now = new Date();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft(isUpcoming ? "Starting soon" : "Ended");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [auction.ends_at, auction.starts_at, isUpcoming]);

  const categoryLabel = categories.find((c) => c.id === auction.category)?.label || auction.category;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={auction.images[0] || "/placeholder.svg"}
            alt={auction.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {categoryLabel}
            </Badge>
            {!isUpcoming && auction.reserve_price && auction.current_bid >= auction.reserve_price && (
              <Badge className="bg-green-600">Reserve Met</Badge>
            )}
          </div>

          {/* Watchlist Button */}
          {isAuthenticated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatch();
              }}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isWatched 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-background/90 backdrop-blur-sm text-muted-foreground hover:text-primary"
              }`}
            >
              <Heart className={`w-4 h-4 ${isWatched ? "fill-current" : ""}`} />
            </button>
          )}

          {/* Timer */}
          <div className="absolute bottom-3 right-3">
            <Badge 
              variant="secondary" 
              className={`${
                isUpcoming 
                  ? "bg-blue-600 text-white" 
                  : timeLeft.includes("m") && !timeLeft.includes("d") && !timeLeft.includes("h")
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-background/90 backdrop-blur-sm"
              }`}
            >
              <Clock className="w-3 h-3 mr-1" />
              {isUpcoming ? `Starts ${timeLeft}` : timeLeft}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <h3 
            className="text-lg font-medium mb-2 line-clamp-1"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {auction.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {auction.description}
          </p>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {isUpcoming ? "Starting Bid" : auction.current_bid > 0 ? "Current Bid" : "Starting Bid"}
              </p>
              <p className="text-xl font-light">
                {formatCurrency(
                  auction.current_bid || auction.starting_price,
                  auction.currency
                )}
              </p>
            </div>

            {!isUpcoming && (
              <Button onClick={onBid} size="sm" className="gap-2">
                Place Bid
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          {auction.buy_now_price && !isUpcoming && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Buy Now: {formatCurrency(auction.buy_now_price, auction.currency)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Auctions;
