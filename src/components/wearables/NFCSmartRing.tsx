import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Fingerprint, ChevronRight, Shield, Smartphone,
  CheckCircle2, Radio, Key, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const NFCSmartRing = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const partnerVenues = [
    { name: "Nobu Malibu", type: "dining", status: "active" },
    { name: "Aman Tokyo", type: "hotel", status: "active" },
    { name: "Carbone NYC", type: "dining", status: "pending" },
    { name: "The Ritz Paris", type: "hotel", status: "active" },
    { name: "Core by Clare Smyth", type: "dining", status: "active" },
  ];

  const handleRegisterRing = async () => {
    if (!user) {
      toast.error("Please sign in to register your device");
      return;
    }

    setIsScanning(true);
    setScanProgress(0);

    // Simulate NFC scanning process
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setIsRegistered(true);
          toast.success("Smart ring registered successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleTapToVerify = () => {
    toast.success("Identity verified! Welcome to the venue.");
  };

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-5 py-3 bg-secondary/50 border border-border/30 rounded-xl hover:border-primary/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/30 to-violet-500/10 border border-violet-500/40 flex items-center justify-center">
          <Fingerprint className="w-5 h-5 text-violet-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">NFC Smart Ring</p>
          <p className="text-xs text-muted-foreground">Tap to Authenticate</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border/30 rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-violet-500/10 to-transparent border-b border-border/30">
                <div className="flex items-center gap-3 mb-2">
                  <Fingerprint className="w-6 h-6 text-violet-400" />
                  <h3 className="text-lg font-serif text-foreground">Smart Ring Authentication</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tap-to-verify member access at partner venues
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {!isRegistered ? (
                  <div className="text-center">
                    {/* Ring Visualization */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <motion.div
                        animate={isScanning ? { 
                          boxShadow: [
                            "0 0 20px rgba(139, 92, 246, 0.3)",
                            "0 0 60px rgba(139, 92, 246, 0.6)",
                            "0 0 20px rgba(139, 92, 246, 0.3)"
                          ]
                        } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-full h-full rounded-full border-[12px] border-zinc-700 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center"
                      >
                        {isScanning ? (
                          <Radio className="w-10 h-10 text-violet-400 animate-pulse" />
                        ) : (
                          <Key className="w-10 h-10 text-violet-400" />
                        )}
                      </motion.div>
                      
                      {isScanning && (
                        <svg className="absolute inset-0 -rotate-90 w-full h-full">
                          <circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="rgba(139, 92, 246, 0.2)"
                            strokeWidth="4"
                          />
                          <motion.circle
                            cx="64"
                            cy="64"
                            r="58"
                            fill="none"
                            stroke="rgba(139, 92, 246, 1)"
                            strokeWidth="4"
                            strokeDasharray={364}
                            strokeDashoffset={364 - (364 * scanProgress) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>

                    <h4 className="text-lg font-medium text-foreground mb-2">
                      {isScanning ? "Scanning for NFC device..." : "Register Your Smart Ring"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6">
                      {isScanning 
                        ? "Hold your ring near your phone's NFC reader"
                        : "Link your NFC-enabled ring or bracelet for seamless venue access"
                      }
                    </p>

                    {!isScanning && (
                      <div className="space-y-3">
                        <Button
                          onClick={handleRegisterRing}
                          className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400"
                        >
                          <Radio className="w-4 h-4 mr-2" />
                          Start NFC Registration
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Compatible with Oura Ring, Token Ring, McLear RingPay, and more
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Registered Status */}
                    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <div>
                        <p className="text-sm font-medium text-emerald-400">Ring Registered</p>
                        <p className="text-xs text-muted-foreground">Token Ring Gen 3</p>
                      </div>
                    </div>

                    {/* Partner Venues */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Partner Venues with Tap Access
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {partnerVenues.map((venue, i) => (
                          <div 
                            key={i}
                            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                          >
                            <div>
                              <p className="text-sm text-foreground">{venue.name}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">{venue.type}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                              venue.status === "active" 
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}>
                              {venue.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Test Tap */}
                    <Button
                      onClick={handleTapToVerify}
                      variant="outline"
                      className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Test Tap-to-Verify
                    </Button>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/30 bg-secondary/20 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                {isRegistered && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsRegistered(false);
                      toast.info("Ring unregistered");
                    }}
                    className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Unregister
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NFCSmartRing;