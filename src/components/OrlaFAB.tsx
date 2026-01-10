import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import orlaAvatar from "@/assets/orla-avatar.png";

const OrlaFAB = () => {
  return (
    <Link to="/orla">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-28 right-6 md:right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary/90 to-primary overflow-hidden border-2 border-primary/60 shadow-[0_0_40px_rgba(212,175,55,0.4)] flex items-center justify-center transition-all duration-300 group cursor-pointer"
      >
        {/* Animated glow ring */}
        <motion.span 
          animate={{ 
            scale: [1, 1.4, 1], 
            opacity: [0.4, 0, 0.4],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary/40"
        />
        <motion.span 
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="absolute inset-0 rounded-full bg-primary/30"
        />
        
        {/* Notification Dot */}
        <motion.span 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-background rounded-full z-10 flex items-center justify-center shadow-lg shadow-emerald-500/40"
        >
          <span className="text-[9px] font-bold text-white">1</span>
        </motion.span>

        {/* Orla Avatar */}
        <img 
          src={orlaAvatar} 
          alt="Speak with Orla"
          className="w-full h-full object-cover"
        />

        {/* Tooltip on hover */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
          className="absolute right-full mr-3 bg-secondary/95 backdrop-blur-xl border border-border/30 rounded-lg px-3 py-2 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <p className="text-xs text-foreground font-medium">Speak with Orla</p>
          <p className="text-[10px] text-muted-foreground">Voice conversation</p>
        </motion.div>
      </motion.div>
    </Link>
  );
};

export default OrlaFAB;
