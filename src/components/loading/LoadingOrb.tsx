import { motion } from "framer-motion";

const LoadingOrb = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer rotating ring */}
      <motion.div
        className="absolute w-80 h-80"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.4" />
              <stop offset="50%" stopColor="hsl(var(--gold))" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="url(#ringGradient)"
            strokeWidth="0.5"
            strokeDasharray="5 10"
          />
        </svg>
      </motion.div>

      {/* Inner counter-rotating ring */}
      <motion.div
        className="absolute w-64 h-64"
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="hsl(var(--gold) / 0.15)"
            strokeWidth="0.5"
            strokeDasharray="2 15"
          />
        </svg>
      </motion.div>

      {/* Center glow orb */}
      <motion.div
        className="absolute w-40 h-40 rounded-full"
        style={{
          background: 'radial-gradient(circle, hsl(var(--gold) / 0.2) 0%, hsl(var(--gold) / 0.05) 50%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Pulsing inner ring */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-primary/20"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting dots */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary"
          style={{
            transformOrigin: 'center',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.5,
          }}
        >
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full bg-primary"
            style={{
              left: 80 + i * 15,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingOrb;
