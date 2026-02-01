import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEADLINE = new Date("2026-04-30T23:59:59");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TriptychCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [prevSeconds, setPrevSeconds] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = DEADLINE.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setPrevSeconds(timeLeft.seconds);
      setTimeLeft(newTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft.seconds]);

  if (isExpired) {
    return (
      <div className="text-center">
        <p className="text-primary text-sm uppercase tracking-widest">Applications Closed</p>
      </div>
    );
  }

  const timeBlocks = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="mt-8"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-6 text-center">
        Applications Close April 30, 2026
      </p>
      <div className="flex items-center justify-center gap-2 md:gap-4">
        {timeBlocks.map((block, index) => (
          <div key={block.label} className="flex items-center gap-2 md:gap-4">
            <div className="text-center">
              <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden">
                {/* Background frame */}
                <div className="absolute inset-0 border border-primary/20 bg-gradient-to-b from-card/50 to-card/30 backdrop-blur-sm" />
                
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/40" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/40" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40" />
                
                {/* Number with flip animation for seconds */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <AnimatePresence mode="popLayout">
                    <motion.span 
                      key={block.value}
                      initial={index === 3 ? { y: -10, opacity: 0 } : false}
                      animate={{ y: 0, opacity: 1 }}
                      exit={index === 3 ? { y: 10, opacity: 0 } : undefined}
                      transition={{ duration: 0.3 }}
                      className="text-2xl md:text-4xl text-foreground"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300 }}
                    >
                      {String(block.value).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                </div>
                
                {/* Subtle shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              </div>
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-2 block">
                {block.label}
              </span>
            </div>
            {index < timeBlocks.length - 1 && (
              <motion.span 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-primary text-xl md:text-2xl mb-6"
              >
                :
              </motion.span>
            )}
          </div>
        ))}
      </div>
      
      {/* Urgency indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-6 flex justify-center"
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Limited to 200 positions
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TriptychCountdown;
