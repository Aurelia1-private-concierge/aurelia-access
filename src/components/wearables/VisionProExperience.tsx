import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Glasses, ChevronRight, Play, Maximize2,
  Volume2, Hand, Eye, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const VisionProExperience = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const experiences = [
    {
      id: "penthouse",
      title: "Manhattan Penthouse",
      location: "New York, USA",
      price: "$45M",
      duration: "8 min",
      preview: "🏙️",
      description: "Tour a 12,000 sq ft penthouse overlooking Central Park with floor-to-ceiling windows and private terrace.",
    },
    {
      id: "yacht",
      title: "Oceanco Yacht",
      location: "Monaco",
      price: "$180M",
      duration: "12 min",
      preview: "🛥️",
      description: "Experience 110 meters of pure luxury with helipad, pool, and 8 guest suites.",
    },
    {
      id: "jet",
      title: "Gulfstream G700",
      location: "Private Aviation",
      price: "Charter from $25K/hr",
      duration: "6 min",
      preview: "✈️",
      description: "Step inside the world's largest purpose-built business jet with unmatched cabin comfort.",
    },
    {
      id: "villa",
      title: "Santorini Villa",
      location: "Greece",
      price: "$12M",
      duration: "10 min",
      preview: "🏛️",
      description: "Cliffside estate with infinity pool overlooking the caldera and private beach access.",
    },
  ];

  const handleLaunchExperience = (id: string) => {
    setSelectedExperience(id);
    setIsPlaying(true);
    toast.success("Launching spatial experience...", {
      description: "Put on your Vision Pro headset",
    });
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
          <Glasses className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Vision Pro</p>
          <p className="text-xs text-muted-foreground">Spatial Experiences</p>
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
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card border border-border/30 rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border-b border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border border-cyan-500/40 flex items-center justify-center">
                      <Glasses className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-serif text-foreground">Spatial Experiences</h3>
                      <p className="text-sm text-muted-foreground">Apple Vision Pro Compatible</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-lg">
                      <Hand className="w-3 h-3" /> Gesture
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-lg">
                      <Eye className="w-3 h-3" /> Eye Tracking
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-lg">
                      <Volume2 className="w-3 h-3" /> Spatial Audio
                    </span>
                  </div>
                </div>
              </div>

              {/* Experiences Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  {experiences.map((exp) => (
                    <motion.div
                      key={exp.id}
                      whileHover={{ scale: 1.02 }}
                      className={`relative group cursor-pointer rounded-xl overflow-hidden border transition-all ${
                        selectedExperience === exp.id && isPlaying
                          ? "border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                          : "border-border/30 hover:border-cyan-500/30"
                      }`}
                      onClick={() => handleLaunchExperience(exp.id)}
                    >
                      {/* Preview */}
                      <div className="relative h-32 bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center">
                        <span className="text-5xl">{exp.preview}</span>
                        
                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 rounded-full bg-cyan-500/80 flex items-center justify-center"
                          >
                            <Play className="w-5 h-5 text-white fill-white" />
                          </motion.div>
                        </div>

                        {/* Playing Indicator */}
                        {selectedExperience === exp.id && isPlaying && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute top-2 right-2 px-2 py-1 bg-cyan-500 rounded-md text-[10px] text-white font-medium flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            LIVE
                          </motion.div>
                        )}

                        {/* Duration */}
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-white">
                          {exp.duration}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="p-3 bg-secondary/20">
                        <h4 className="text-sm font-medium text-foreground mb-0.5">{exp.title}</h4>
                        <p className="text-[10px] text-muted-foreground mb-2">{exp.location}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-primary font-medium">{exp.price}</span>
                          <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Selected Experience Info */}
                {selectedExperience && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-xl"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground mb-1">
                          {experiences.find(e => e.id === selectedExperience)?.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {experiences.find(e => e.id === selectedExperience)?.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border/30 bg-secondary/20 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Requires Apple Vision Pro or Meta Quest 3
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </Button>
                  {selectedExperience && (
                    <Button
                      className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400"
                    >
                      <Glasses className="w-4 h-4 mr-2" />
                      Open in Headset
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VisionProExperience;