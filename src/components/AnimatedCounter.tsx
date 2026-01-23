import { useEffect, useRef, useState } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  glowOnComplete?: boolean;
}

const AnimatedCounter = ({
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 2,
  className = "",
  glowOnComplete = true,
}: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [isComplete, setIsComplete] = useState(false);

  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  });

  const display = useTransform(spring, (current) => {
    return current.toFixed(decimals);
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
      
      // Mark as complete after animation
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, value, spring, duration]);

  return (
    <motion.span
      ref={ref}
      className={`relative inline-block ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {/* Glow effect on complete */}
      {glowOnComplete && isComplete && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 1.4] }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl pointer-events-none"
        />
      )}
      
      <span className="relative z-10">
        {prefix}
        <motion.span>{display}</motion.span>
        {suffix}
      </span>
    </motion.span>
  );
};

// Slot machine style counter for dramatic effect
export const SlotCounter = ({
  value,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);
  const digits = value.toString().split("");
  
  useEffect(() => {
    if (!isInView) return;
    
    let current = 0;
    const increment = value / 50;
    const interval = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(interval);
      }
      setDisplayValue(Math.floor(current));
    }, 30);
    
    return () => clearInterval(interval);
  }, [isInView, value]);

  return (
    <div ref={ref} className={`inline-flex items-center ${className}`}>
      {prefix && <span className="mr-1">{prefix}</span>}
      
      <div className="flex overflow-hidden">
        {digits.map((_, index) => {
          const digitValue = Math.floor(displayValue / Math.pow(10, digits.length - 1 - index)) % 10;
          
          return (
            <motion.div
              key={index}
              className="relative h-[1.2em] w-[0.6em] overflow-hidden"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: index * 0.1 }}
            >
              <motion.div
                animate={{ y: isInView ? -digitValue * 1.2 + "em" : 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: index * 0.05 
                }}
                className="flex flex-col"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <span key={num} className="h-[1.2em] leading-[1.2em]">
                    {num}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </div>
  );
};

export default AnimatedCounter;
