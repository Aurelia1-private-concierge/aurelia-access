import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import OrlaMiniAvatar from "@/components/orla/OrlaMiniAvatar";
import { useAvatarStyle } from "@/hooks/useAvatarStyle";

const OrlaCompanion = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentStyle } = useAvatarStyle();
  
  const suggestions = [
    "Review your pending service requests",
    "Check latest portfolio valuations",
    "Schedule a private consultation",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ 
              boxShadow: [
                `0 0 15px ${currentStyle.colors.glow}`,
                `0 0 25px ${currentStyle.colors.glow}`,
                `0 0 15px ${currentStyle.colors.glow}`
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50 overflow-hidden"
          >
            <OrlaMiniAvatar size={56} isActive={isExpanded} showSparkles={false} />
            <motion.div 
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card shadow-lg shadow-emerald-500/50" 
            />
            
            {/* Style-matched accent particles */}
            {currentStyle.effects.sparkles && isExpanded && (
              <>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full"
                    style={{ 
                      backgroundColor: currentStyle.colors.primary,
                      left: "50%",
                      top: "50%",
                    }}
                    animate={{
                      x: Math.cos((i / 3) * Math.PI * 2 + Date.now() / 1000) * 20,
                      y: Math.sin((i / 3) * Math.PI * 2 + Date.now() / 1000) * 20,
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>
          
          <div>
            <h3 className="font-serif text-lg text-foreground">Orla</h3>
            <p className="text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-1.5" style={{ color: currentStyle.colors.primary }}>
              <Sparkles className="w-3 h-3" />
              Your Private Liaison
            </p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
      
      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-border/20">
              <p className="text-sm text-muted-foreground mb-4">
                Good to see you. Here are some things I can help with:
              </p>
              
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full text-left p-3 bg-secondary/30 hover:bg-primary/10 border border-border/30 hover:border-primary/30 rounded-xl text-sm text-foreground/80 hover:text-foreground transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <span 
                        className="w-1.5 h-1.5 rounded-full transition-colors"
                        style={{ 
                          backgroundColor: currentStyle.colors.primary,
                          opacity: 0.5,
                        }}
                      />
                      {suggestion}
                    </span>
                  </motion.button>
                ))}
              </div>
              
              <Link 
                to="/orla" 
                className="block mt-4 text-center text-xs hover:opacity-80 transition-colors"
                style={{ color: currentStyle.colors.primary }}
              >
                Open full voice conversation →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrlaCompanion;
