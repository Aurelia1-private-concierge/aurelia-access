import { useState } from "react";
import { MessageSquare, X, Minus, Crown, Lock, ArrowRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-28 right-6 md:right-8 z-50 w-80 sm:w-96 h-[520px] bg-card/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-border/30 bg-gradient-to-r from-background/80 to-secondary/30 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 overflow-hidden flex items-center justify-center"
                  >
                    <Crown className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </motion.div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" 
                  />
                </div>
                <div>
                  <h4 className="font-serif text-foreground text-sm tracking-wide">Private Liaison</h4>
                  <p className="text-[10px] text-primary uppercase tracking-widest font-medium flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Concierge Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 space-y-5 overflow-y-auto">
              {/* Time separator */}
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground/50 font-light uppercase tracking-widest bg-background/50 px-3 py-1 rounded-full">
                  Today 9:41 AM
                </span>
              </div>

              {/* Bot Message */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start space-x-3"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-background border border-border/30 flex-shrink-0 flex items-center justify-center mt-1">
                  <Crown className="w-3 h-3 text-primary" strokeWidth={1.5} />
                </div>
                <div className="bg-secondary/40 border border-border/20 p-4 rounded-2xl rounded-tl-none max-w-[85%] backdrop-blur-sm">
                  <p className="text-xs text-foreground/90 font-light leading-relaxed">
                    Good morning, Mr. Anderson. I have confirmed your acquisition of the Patek Philippe reference. The item is being moved to the vault.
                  </p>
                </div>
              </motion.div>

              {/* Bot Message 2 */}
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start space-x-3"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-background border border-border/30 flex-shrink-0 flex items-center justify-center mt-1">
                  <Crown className="w-3 h-3 text-primary" strokeWidth={1.5} />
                </div>
                <div className="bg-secondary/40 border border-border/20 p-4 rounded-2xl rounded-tl-none max-w-[85%] backdrop-blur-sm">
                  <p className="text-xs text-foreground/90 font-light leading-relaxed">
                    Shall I arrange transport to the terminal for your 14:00 departure?
                  </p>
                </div>
              </motion.div>

              {/* User Reply */}
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-end"
              >
                <div className="bg-primary/15 border border-primary/25 p-4 rounded-2xl rounded-tr-none max-w-[85%]">
                  <p className="text-xs text-primary font-light leading-relaxed">
                    Yes, please. Have the car ready in 20 minutes.
                  </p>
                </div>
              </motion.div>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-background border border-border/30 flex-shrink-0 flex items-center justify-center mt-1">
                      <Crown className="w-3 h-3 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="bg-secondary/40 border border-border/20 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border/30 bg-gradient-to-t from-background/80 to-transparent">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your request securely..."
                  className="w-full bg-secondary/40 border border-border/30 rounded-xl py-3.5 pl-4 pr-12 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40 focus:bg-secondary/60 transition-all font-light"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg transition-all"
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="flex justify-between items-center mt-2.5 px-1">
                <p className="text-[9px] text-muted-foreground/50 flex items-center">
                  <Lock className="w-2.5 h-2.5 mr-1" />
                  End-to-End Encrypted
                </p>
                <p className="text-[9px] text-primary/60">Powered by Aurelia AI</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Trigger Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2.5, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-6 md:right-8 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground gold-glow flex items-center justify-center transition-all duration-300 group"
      >
        {/* Pulsing ring */}
        <motion.span 
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-primary/30"
        />
        
        {/* Notification Dot */}
        <motion.span 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 border-2 border-background rounded-full z-10 flex items-center justify-center"
        >
          <span className="text-[8px] font-bold text-white">1</span>
        </motion.span>

        <MessageSquare
          className={`w-6 h-6 absolute transition-all duration-300 ${
            isOpen ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
          }`}
        />
        <X
          className={`w-6 h-6 absolute transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90"
          }`}
        />
      </motion.button>
    </>
  );
};

export default ChatWidget;
