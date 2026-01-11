import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Watch, Heart, Fingerprint, Glasses, Sparkles, Play,
  Mail, Bell, Car, Anchor, Plane, ChevronRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import AppleWatchWidget from "./AppleWatchWidget";
import HealthWearableSync from "./HealthWearableSync";
import NFCSmartRing from "./NFCSmartRing";
import VisionProExperience from "./VisionProExperience";

// Demo video modal component
const VideoPreviewModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string;
  description: string;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl bg-card border border-border/30 rounded-2xl overflow-hidden"
        >
          {/* Video Player Placeholder */}
          <div className="relative aspect-video bg-gradient-to-br from-secondary to-background flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto mb-4"
              >
                <Play className="w-8 h-8 text-primary fill-primary" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Demo video coming soon</p>
            </div>
            
            {/* Demo Badge */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-primary/20 border border-primary/40 rounded-full">
              <span className="text-xs text-primary font-medium">DEMO PREVIEW</span>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Info */}
          <div className="p-6">
            <h3 className="text-xl font-serif text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Coming Soon Card with Waitlist
const ComingSoonCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color,
  launchDate 
}: { 
  icon: any; 
  title: string; 
  description: string;
  color: string;
  launchDate: string;
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    toast.success(`You'll be notified when ${title} launches!`);
  };

  const colorClasses: Record<string, string> = {
    emerald: "from-emerald-500/30 to-emerald-500/10 border-emerald-500/40 text-emerald-400",
    blue: "from-blue-500/30 to-blue-500/10 border-blue-500/40 text-blue-400",
    amber: "from-amber-500/30 to-amber-500/10 border-amber-500/40 text-amber-400",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-5 bg-secondary/20 border border-border/30 rounded-xl relative overflow-hidden group"
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} border flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">{title}</h4>
            <span className="text-[10px] text-muted-foreground">{launchDate}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Email for early access"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-8 text-xs bg-secondary/50 border-border/30"
          />
          <Button type="submit" size="sm" variant="outline" className="h-8 px-3 text-xs border-primary/30 text-primary hover:bg-primary/10">
            <Bell className="w-3 h-3" />
          </Button>
        </form>
      ) : (
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">✓</span>
          You're on the list!
        </div>
      )}
    </motion.div>
  );
};

const WearablesHub = () => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const wearableItems = [
    {
      id: "watch",
      icon: Watch,
      title: "Apple Watch",
      subtitle: "Companion Widget",
      description: "Quick requests, notifications, and credit balance right on your wrist. Haptic alerts keep you informed of service updates.",
      color: "primary",
      component: AppleWatchWidget,
      videoTitle: "Apple Watch Companion Demo",
      videoDescription: "See how Aurelia's Apple Watch widget lets you make quick requests, view your credit balance, and receive haptic notifications for service updates.",
    },
    {
      id: "vision",
      icon: Glasses,
      title: "Vision Pro",
      subtitle: "Spatial Experiences",
      description: "Immersive property tours, yacht walkthroughs, and spatial experiences with gesture control and eye tracking.",
      color: "cyan",
      component: VisionProExperience,
      videoTitle: "Vision Pro Spatial Tours Demo",
      videoDescription: "Experience immersive property tours and yacht walkthroughs in stunning spatial reality with gesture and eye tracking controls.",
    },
    {
      id: "health",
      icon: Heart,
      title: "Health Wearables",
      subtitle: "Oura Ring / WHOOP",
      description: "Wellness-aware recommendations based on your sleep, recovery, and readiness scores. Let Orla optimize your experiences.",
      color: "rose",
      component: HealthWearableSync,
      videoTitle: "Health Integration Demo",
      videoDescription: "Discover how Aurelia uses your wellness data to provide personalized recommendations for travel, dining, and experiences.",
    },
    {
      id: "nfc",
      icon: Fingerprint,
      title: "NFC Smart Ring",
      subtitle: "Tap to Authenticate",
      description: "Seamless member verification at partner venues. Simply tap your ring or bracelet for instant VIP access.",
      color: "violet",
      component: NFCSmartRing,
      videoTitle: "NFC Authentication Demo",
      videoDescription: "Watch how a simple tap of your smart ring grants instant VIP access at Aurelia's exclusive partner venues worldwide.",
    },
  ];

  const colorClasses: Record<string, string> = {
    primary: "from-primary/30 to-primary/10 border-primary/40",
    cyan: "from-cyan-500/30 to-cyan-500/10 border-cyan-500/40",
    rose: "from-rose-500/30 to-rose-500/10 border-rose-500/40",
    violet: "from-violet-500/30 to-violet-500/10 border-violet-500/40",
  };

  const iconColors: Record<string, string> = {
    primary: "text-primary",
    cyan: "text-cyan-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden" id="wearables">
      {/* Background Effects */}
      <div className="absolute inset-0 marble-bg opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-primary tracking-wider uppercase">Wearable Technology</span>
            <span className="text-[10px] text-primary/60 ml-1 px-2 py-0.5 bg-primary/10 rounded-full">DEMO</span>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
            Luxury at Your 
            <span className="text-gradient-gold"> Fingertips</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Seamlessly integrate Aurelia with your favorite wearable devices for 
            personalized experiences, instant access, and wellness-aware recommendations.
          </p>
        </motion.div>

        {/* Wearables Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {wearableItems.map((item, index) => {
            const Component = item.component;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-secondary/20 border border-border/30 rounded-2xl relative group"
              >
                {/* Demo Badge */}
                <div className="absolute top-4 right-4 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
                  <span className="text-[9px] text-primary/70 font-medium">INTERACTIVE DEMO</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[item.color]} border flex items-center justify-center`}>
                    <item.icon className={`w-6 h-6 ${iconColors[item.color]}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Component />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveVideo(item.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-secondary/50 border border-border/30 rounded-xl hover:border-primary/30 transition-all text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Watch Demo
                  </motion.button>
                </div>

                {/* Video Modal */}
                <VideoPreviewModal
                  isOpen={activeVideo === item.id}
                  onClose={() => setActiveVideo(null)}
                  title={item.videoTitle}
                  description={item.videoDescription}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-serif text-foreground mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">Join the waitlist for early access</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <ComingSoonCard
              icon={Car}
              title="CarPlay Integration"
              description="In-vehicle concierge with voice commands"
              color="emerald"
              launchDate="Q2 2026"
            />
            <ComingSoonCard
              icon={Anchor}
              title="Yacht Bridge Controls"
              description="Smart vessel management interface"
              color="blue"
              launchDate="Q3 2026"
            />
            <ComingSoonCard
              icon={Plane}
              title="Private Jet Cabin"
              description="In-flight experience management"
              color="amber"
              launchDate="Q3 2026"
            />
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-muted-foreground/60">
            All demos use simulated data. Connect your real devices in the member dashboard.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WearablesHub;