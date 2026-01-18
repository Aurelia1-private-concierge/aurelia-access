import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, Sparkles, Crown, Lock, Calendar, Clock, Heart, History, ArrowRight,
  Plane, Utensils, Palette, Diamond, Globe, Star, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";
import { useSurpriseMe, SURPRISE_PACKAGES } from "@/hooks/useSurpriseMe";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
  taste: <Utensils className="w-8 h-8" />,
  escape: <Plane className="w-8 h-8" />,
  culture: <Palette className="w-8 h-8" />,
  extraordinary: <Crown className="w-8 h-8" />,
  monthly: <Calendar className="w-8 h-8" />,
};

const PACKAGE_GRADIENTS: Record<string, { gradient: string; bg: string }> = {
  taste: { gradient: "from-amber-500 to-orange-600", bg: "from-amber-500/10 to-transparent" },
  escape: { gradient: "from-blue-500 to-cyan-600", bg: "from-blue-500/10 to-transparent" },
  culture: { gradient: "from-violet-500 to-purple-600", bg: "from-violet-500/10 to-transparent" },
  extraordinary: { gradient: "from-primary to-amber-500", bg: "from-primary/10 to-transparent" },
  monthly: { gradient: "from-emerald-500 to-teal-600", bg: "from-emerald-500/10 to-transparent" },
};

const SurpriseMe = () => {
  const { tier, subscribed } = useSubscription();
  const { packages, requests, isProcessing, bookSurprise, canAfford, getStats } = useSurpriseMe();
  
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"packages" | "history">("packages");

  const stats = getStats();

  const canAccessPackage = (pkgTier: string) => {
    if (!subscribed) return false;
    if (pkgTier === "all" || pkgTier === "silver") return true;
    if (pkgTier === "gold" && (tier === "gold" || tier === "platinum")) return true;
    if (pkgTier === "platinum" && tier === "platinum") return true;
    return false;
  };

  const handleBookSurprise = async (pkgId: string) => {
    setSelectedPackage(pkgId);
    const success = await bookSurprise(pkgId);
    if (success) setShowSuccess(true);
    setSelectedPackage(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Gift className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Premium Experience</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6"><span className="text-gradient-gold">Surprise Me</span></h1>
            <p className="text-xl text-muted-foreground mb-8">Trust Orla to curate unforgettable experiences tailored to your tastes.</p>
            
            <div className="flex justify-center gap-8 md:gap-16">
              {[{ value: "98%", label: "Satisfaction" }, { value: `${stats.totalRequests}`, label: "Surprises" }, { value: "4.9★", label: "Rating" }].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-xl bg-muted/50 border border-border/50">
            {[{ id: "packages", label: "Packages", icon: Gift }, { id: "history", label: "My History", icon: History }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <tab.icon className="w-4 h-4" /><span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "packages" && (
            <motion.div key="packages" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg, index) => {
                const accessible = canAccessPackage(pkg.tier);
                const affordable = canAfford(pkg.creditCost);
                const gradients = PACKAGE_GRADIENTS[pkg.id] || PACKAGE_GRADIENTS.taste;

                return (
                  <motion.div key={pkg.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className={`relative group rounded-2xl border overflow-hidden ${accessible ? "border-primary/20 hover:border-primary/50" : "border-border/50 opacity-70"}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bg}`} />
                    <div className="relative p-6 z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradients.gradient} text-white`}>{PACKAGE_ICONS[pkg.id]}</div>
                        {!accessible && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="w-3 h-3" />{pkg.tier}</div>}
                      </div>
                      <h3 className="text-xl font-semibold mb-1">{pkg.name}</h3>
                      <p className="text-sm text-primary mb-3">{pkg.tagline}</p>
                      <p className="text-sm text-muted-foreground mb-4">{pkg.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pkg.categories.map((cat) => <span key={cat} className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">{cat}</span>)}
                      </div>
                      <div className="flex items-center gap-4 mb-6 text-sm">
                        <div className="flex items-center gap-1"><Diamond className="w-4 h-4 text-primary" />${pkg.minValue.toLocaleString()} - ${pkg.maxValue.toLocaleString()}</div>
                        <div className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" />{pkg.frequency}</div>
                      </div>
                      <Button onClick={() => handleBookSurprise(pkg.id)} disabled={!accessible || !affordable || isProcessing}
                        className={`w-full ${accessible ? `bg-gradient-to-r ${gradients.gradient} hover:opacity-90` : "bg-muted"}`}>
                        {!subscribed ? "Membership Required" : !accessible ? `Requires ${pkg.tier}` : !affordable ? `Need ${pkg.creditCost} Credits` : isProcessing && selectedPackage === pkg.id ? (
                          <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 animate-spin" />Processing...</span>
                        ) : (<span className="flex items-center gap-2">Surprise Me <span className="text-xs opacity-75">({pkg.creditCost} cr)</span><ArrowRight className="w-4 h-4" /></span>)}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto">
              {requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="p-6 rounded-2xl border border-primary/20 bg-card">
                      <div className="flex items-start justify-between mb-4">
                        <div><span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">{req.package_name}</span>
                          <h3 className="text-lg font-semibold mt-2">{req.experience_title || "Pending..."}</h3></div>
                        <span className={`text-xs px-2 py-1 rounded-full ${req.status === "fulfilled" ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>{req.status}</span>
                      </div>
                      <p className="text-muted-foreground mb-4">{req.experience_description || "Your surprise is being curated..."}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />{req.credits_spent} credits</span>
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No surprises yet</h3>
                  <p className="text-muted-foreground mb-6">Book your first surprise experience!</p>
                  <Button onClick={() => setActiveTab("packages")}>Browse Packages<ArrowRight className="w-4 h-4 ml-2" /></Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md p-4" onClick={() => setShowSuccess(false)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-card border border-primary/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Magic in Progress</h2>
              <p className="text-muted-foreground mb-6">Orla is crafting your unique experience. Details within 24-48 hours.</p>
              <Button onClick={() => setShowSuccess(false)} className="w-full">Continue</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default SurpriseMe;
