import { useState } from "react";
import { MessageSquare, X, Minus, Crown, Lock, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 right-6 md:right-8 z-50 w-80 sm:w-96 h-[500px] bg-card/95 backdrop-blur-xl border border-border/30 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden origin-bottom-right"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-border/30 bg-background/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border/30 overflow-hidden flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                </div>
                <div>
                  <h4 className="font-serif text-foreground text-sm tracking-wide">Private Liaison</h4>
                  <p className="text-[10px] text-primary uppercase tracking-widest font-medium">Concierge Active</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 space-y-6 overflow-y-auto">
              {/* Time separator */}
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground/50 font-light uppercase tracking-widest">
                  Today 9:41 AM
                </span>
              </div>

              {/* Bot Message */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-background border border-border/30 flex-shrink-0 flex items-center justify-center mt-1">
                  <Crown className="w-3 h-3 text-primary" strokeWidth={1.5} />
                </div>
                <div className="bg-secondary/50 border border-border/30 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                  <p className="text-xs text-foreground/80 font-light leading-relaxed">
                    Good morning, Mr. Anderson. I have confirmed your acquisition of the Patek Philippe reference. The item is being moved to the vault.
                  </p>
                </div>
              </div>

              {/* Bot Message 2 */}
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-background border border-border/30 flex-shrink-0 flex items-center justify-center mt-1">
                  <Crown className="w-3 h-3 text-primary" strokeWidth={1.5} />
                </div>
                <div className="bg-secondary/50 border border-border/30 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                  <p className="text-xs text-foreground/80 font-light leading-relaxed">
                    Shall I arrange transport to the terminal for your 14:00 departure?
                  </p>
                </div>
              </div>

              {/* User Reply */}
              <div className="flex justify-end">
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tr-none max-w-[85%]">
                  <p className="text-xs text-primary font-light leading-relaxed">
                    Yes, please. Have the car ready in 20 minutes.
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border/30 bg-background/50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type your request securely..."
                  className="w-full bg-secondary/50 border border-border/30 rounded-lg py-3 pl-4 pr-12 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 focus:bg-secondary transition-all font-light"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-primary hover:text-foreground hover:bg-secondary rounded-md transition-all">
                  <ArrowRight className="w-[18px] h-[18px]" />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <p className="text-[9px] text-muted-foreground/50 flex items-center">
                  <Lock className="w-2.5 h-2.5 mr-1" />
                  E2E Encrypted
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Trigger Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-6 md:right-8 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground gold-glow flex items-center justify-center hover:scale-105 transition-all duration-300 group"
      >
        {/* Notification Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-background rounded-full z-10 animate-pulse" />

        <MessageSquare
          className={`w-6 h-6 absolute transition-all duration-300 ${
            isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        />
        <X
          className={`w-6 h-6 absolute transition-all duration-300 ${
            isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
          }`}
        />
      </motion.button>
    </>
  );
};

export default ChatWidget;
