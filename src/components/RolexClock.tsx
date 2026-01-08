import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const RolexClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDegrees = (hours * 30) + (minutes * 0.5);
  const minuteDegrees = minutes * 6;
  const secondDegrees = seconds * 6;

  const hourMarkers = Array.from({ length: 12 }, (_, i) => i);
  const minuteMarkers = Array.from({ length: 60 }, (_, i) => i);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-48 h-48 md:w-64 md:h-64"
    >
      {/* Outer bezel */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold to-gold-muted shadow-[0_0_40px_rgba(212,175,55,0.3)] p-1">
        {/* Fluted bezel effect */}
        <div className="absolute inset-1 rounded-full overflow-hidden">
          {Array.from({ length: 120 }, (_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 h-full w-px origin-bottom"
              style={{
                transform: `rotate(${i * 3}deg)`,
                background: i % 2 === 0 
                  ? 'linear-gradient(to bottom, hsl(var(--gold)) 0%, transparent 10%, transparent 90%, hsl(var(--gold)) 100%)'
                  : 'linear-gradient(to bottom, hsl(var(--gold-muted)) 0%, transparent 10%, transparent 90%, hsl(var(--gold-muted)) 100%)'
              }}
            />
          ))}
        </div>
        
        {/* Inner case */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-navy-deep via-background to-navy-light p-2">
          {/* Dial */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-background via-navy-deep to-background border border-gold/20">
            
            {/* Minute markers */}
            {minuteMarkers.map((i) => (
              <div
                key={`minute-${i}`}
                className="absolute top-1/2 left-1/2 origin-left"
                style={{
                  transform: `rotate(${i * 6}deg) translateX(-50%)`,
                }}
              >
                <div
                  className={`absolute right-2 md:right-3 h-px ${
                    i % 5 === 0 ? 'w-0' : 'w-1 bg-gold/40'
                  }`}
                  style={{ transform: 'translateY(-50%)' }}
                />
              </div>
            ))}

            {/* Hour markers */}
            {hourMarkers.map((i) => (
              <div
                key={`hour-${i}`}
                className="absolute top-1/2 left-1/2 origin-left"
                style={{
                  transform: `rotate(${i * 30}deg) translateX(-50%)`,
                }}
              >
                <div
                  className="absolute right-2 md:right-3 w-3 md:w-4 h-1 bg-gradient-to-r from-gold-muted to-gold rounded-sm shadow-[0_0_4px_rgba(212,175,55,0.5)]"
                  style={{ transform: 'translateY(-50%)' }}
                />
              </div>
            ))}

            {/* Crown logo position */}
            <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <svg 
                viewBox="0 0 24 24" 
                className="w-4 h-4 md:w-5 md:h-5 text-gold fill-current"
              >
                <path d="M12 2L9 8L2 9L7 14L5.5 22L12 18L18.5 22L17 14L22 9L15 8L12 2Z" />
              </svg>
              <span className="text-[6px] md:text-[8px] text-gold font-serif tracking-widest mt-0.5">AURELIA</span>
            </div>

            {/* Date window */}
            <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 bg-foreground text-background text-[8px] md:text-[10px] font-mono px-1 py-0.5 rounded-sm border border-gold/30">
              {time.getDate()}
            </div>

            {/* Center cap base */}
            <div className="absolute top-1/2 left-1/2 w-4 h-4 md:w-5 md:h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-gold to-gold-muted z-20" />

            {/* Hour hand */}
            <motion.div
              className="absolute top-1/2 left-1/2 origin-bottom"
              style={{
                width: '4px',
                height: '25%',
                marginLeft: '-2px',
                marginTop: '-25%',
              }}
              animate={{ rotate: hourDegrees }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            >
              <div className="w-full h-full bg-gradient-to-t from-gold via-gold to-gold-muted rounded-full shadow-lg" />
            </motion.div>

            {/* Minute hand */}
            <motion.div
              className="absolute top-1/2 left-1/2 origin-bottom"
              style={{
                width: '3px',
                height: '35%',
                marginLeft: '-1.5px',
                marginTop: '-35%',
              }}
              animate={{ rotate: minuteDegrees }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            >
              <div className="w-full h-full bg-gradient-to-t from-gold via-gold to-foreground rounded-full shadow-lg" />
            </motion.div>

            {/* Second hand */}
            <motion.div
              className="absolute top-1/2 left-1/2 origin-[50%_80%]"
              style={{
                width: '1px',
                height: '42%',
                marginLeft: '-0.5px',
                marginTop: '-34%',
              }}
              animate={{ rotate: secondDegrees }}
              transition={{ type: "tween", ease: "linear", duration: 0.1 }}
            >
              <div className="w-full h-full bg-primary rounded-full">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
              </div>
            </motion.div>

            {/* Center cap */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 md:w-3 md:h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-gold to-gold-muted z-30 shadow-lg" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RolexClock;
