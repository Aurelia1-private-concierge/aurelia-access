import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Watch, Bell, CreditCard, Calendar, Mic, 
  ChevronRight, Sparkles, Battery, Wifi
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCredits } from "@/hooks/useCredits";

const AppleWatchWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"home" | "requests" | "balance" | "events">("home");
  const { balance } = useCredits();
  const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  const quickRequests = [
    { icon: "✈️", label: "Book Jet", action: "private_aviation" },
    { icon: "🍽️", label: "Reserve", action: "dining" },
    { icon: "🚗", label: "Car", action: "chauffeur" },
    { icon: "🛥️", label: "Yacht", action: "yacht_charter" },
  ];

  const upcomingEvents = [
    { time: "14:00", title: "Private Jet to Monaco" },
    { time: "19:30", title: "Dinner at Nobu" },
    { time: "Tomorrow", title: "Art Basel Preview" },
  ];

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 px-5 py-3 bg-secondary/50 border border-border/30 rounded-xl hover:border-primary/30 transition-all group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/40 flex items-center justify-center">
          <Watch className="w-5 h-5 text-primary" />
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">Apple Watch</p>
          <p className="text-xs text-muted-foreground">Companion Widget</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.button>

      {/* Watch Modal */}
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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative"
            >
              {/* Watch Frame */}
              <div className="relative w-[200px] h-[240px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[50px] p-2 shadow-2xl border border-zinc-700">
                {/* Crown */}
                <div className="absolute -right-2 top-1/3 w-3 h-8 bg-gradient-to-b from-zinc-600 to-zinc-700 rounded-full border border-zinc-500" />
                
                {/* Screen */}
                <div className="w-full h-full bg-black rounded-[42px] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center px-4 py-2 text-[8px]">
                    <Wifi className="w-2.5 h-2.5 text-primary" />
                    <span className="text-white font-medium">{time}</span>
                    <Battery className="w-3 h-2.5 text-green-500" />
                  </div>

                  {/* Content */}
                  <AnimatePresence mode="wait">
                    {currentScreen === "home" && (
                      <motion.div
                        key="home"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-3 pb-3"
                      >
                        {/* Logo */}
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-[9px] text-primary font-serif tracking-wider">AURELIA</span>
                        </div>

                        {/* Quick Actions Grid */}
                        <div className="grid grid-cols-2 gap-1.5 mb-3">
                          {quickRequests.map((req, i) => (
                            <motion.button
                              key={i}
                              whileTap={{ scale: 0.95 }}
                              className="flex flex-col items-center justify-center py-2 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-primary/30 transition-all"
                            >
                              <span className="text-base mb-0.5">{req.icon}</span>
                              <span className="text-[7px] text-zinc-400">{req.label}</span>
                            </motion.button>
                          ))}
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => setCurrentScreen("balance")}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary/20 rounded-xl border border-primary/30"
                          >
                            <CreditCard className="w-2.5 h-2.5 text-primary" />
                            <span className="text-[8px] text-primary">{balance || 0}</span>
                          </button>
                          <button 
                            onClick={() => setCurrentScreen("events")}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-zinc-900 rounded-xl border border-zinc-800"
                          >
                            <Calendar className="w-2.5 h-2.5 text-zinc-400" />
                            <span className="text-[8px] text-zinc-400">3</span>
                          </button>
                        </div>

                        {/* Voice Button */}
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="w-full mt-2 py-2 bg-gradient-to-r from-primary/30 to-primary/20 rounded-xl border border-primary/40 flex items-center justify-center gap-1"
                        >
                          <Mic className="w-3 h-3 text-primary" />
                          <span className="text-[8px] text-primary">Hey Orla</span>
                        </motion.button>
                      </motion.div>
                    )}

                    {currentScreen === "balance" && (
                      <motion.div
                        key="balance"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-3 pb-3"
                      >
                        <button 
                          onClick={() => setCurrentScreen("home")}
                          className="text-[8px] text-primary mb-2"
                        >
                          ← Back
                        </button>
                        <div className="text-center">
                          <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
                          <p className="text-[10px] text-zinc-400 mb-1">Credit Balance</p>
                          <p className="text-2xl font-serif text-white">{balance || 0}</p>
                          <p className="text-[8px] text-primary mt-2">Unlimited Tier</p>
                        </div>
                      </motion.div>
                    )}

                    {currentScreen === "events" && (
                      <motion.div
                        key="events"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="px-3 pb-3"
                      >
                        <button 
                          onClick={() => setCurrentScreen("home")}
                          className="text-[8px] text-primary mb-2"
                        >
                          ← Back
                        </button>
                        <p className="text-[9px] text-zinc-400 mb-2">Upcoming</p>
                        <div className="space-y-1.5">
                          {upcomingEvents.map((event, i) => (
                            <div key={i} className="flex items-center gap-2 py-1.5 px-2 bg-zinc-900 rounded-lg">
                              <span className="text-[7px] text-primary w-10">{event.time}</span>
                              <span className="text-[8px] text-white truncate">{event.title}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Band */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[180px] h-8 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-b-2xl" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[180px] h-8 bg-gradient-to-t from-zinc-800 to-zinc-900 rounded-t-2xl" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AppleWatchWidget;