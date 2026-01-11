import { motion } from "framer-motion";
import { Watch, Heart, Fingerprint, Glasses, Sparkles } from "lucide-react";
import AppleWatchWidget from "./AppleWatchWidget";
import HealthWearableSync from "./HealthWearableSync";
import NFCSmartRing from "./NFCSmartRing";
import VisionProExperience from "./VisionProExperience";

const WearablesHub = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Apple Watch */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-6 bg-secondary/20 border border-border/30 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center">
                <Watch className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Apple Watch</h3>
                <p className="text-xs text-muted-foreground">Companion Widget</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Quick requests, notifications, and credit balance right on your wrist. 
              Haptic alerts keep you informed of service updates.
            </p>
            <AppleWatchWidget />
          </motion.div>

          {/* Vision Pro */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-6 bg-secondary/20 border border-border/30 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
                <Glasses className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Vision Pro</h3>
                <p className="text-xs text-muted-foreground">Spatial Experiences</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Immersive property tours, yacht walkthroughs, and spatial experiences 
              with gesture control and eye tracking.
            </p>
            <VisionProExperience />
          </motion.div>

          {/* Health Wearables */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-secondary/20 border border-border/30 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/30 to-rose-500/10 border border-rose-500/40 flex items-center justify-center">
                <Heart className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">Health Wearables</h3>
                <p className="text-xs text-muted-foreground">Oura Ring / WHOOP</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Wellness-aware recommendations based on your sleep, recovery, and 
              readiness scores. Let Orla optimize your experiences.
            </p>
            <HealthWearableSync />
          </motion.div>

          {/* NFC Smart Ring */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="p-6 bg-secondary/20 border border-border/30 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/30 to-violet-500/10 border border-violet-500/40 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-foreground">NFC Smart Ring</h3>
                <p className="text-xs text-muted-foreground">Tap to Authenticate</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Seamless member verification at partner venues. Simply tap your ring 
              or bracelet for instant VIP access.
            </p>
            <NFCSmartRing />
          </motion.div>
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            <span className="text-primary">Coming Soon:</span> CarPlay Integration, 
            Yacht Bridge Controls, Private Jet Cabin Management
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default WearablesHub;