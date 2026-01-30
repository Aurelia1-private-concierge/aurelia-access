import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const DEADLINE = new Date("2025-04-30T23:59:59");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TriptychCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

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
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
      <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4 text-center">
        Applications Close April 30, 2025
      </p>
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {timeBlocks.map((block, index) => (
          <div key={block.label} className="flex items-center gap-3 md:gap-4">
            <div className="text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 border border-primary/30 bg-card/30 backdrop-blur-sm flex items-center justify-center">
                <span 
                  className="text-2xl md:text-3xl text-foreground font-light"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {String(block.value).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-muted-foreground mt-1 block">
                {block.label}
              </span>
            </div>
            {index < timeBlocks.length - 1 && (
              <span className="text-primary/50 text-lg mb-4">:</span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TriptychCountdown;
