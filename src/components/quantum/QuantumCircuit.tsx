import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface QuantumCircuitProps {
  qubits?: number;
  gates?: number;
  className?: string;
  animated?: boolean;
}

export const QuantumCircuit = ({
  qubits = 4,
  gates = 6,
  className,
  animated = true,
}: QuantumCircuitProps) => {
  const gateTypes = ["H", "X", "Y", "Z", "T", "S", "CX"];

  return (
    <div
      className={cn(
        "relative p-6 rounded-lg border border-cyan-500/20 bg-slate-950/80 overflow-hidden",
        className
      )}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Qubit lines */}
      <div className="relative space-y-6">
        {[...Array(qubits)].map((_, qubitIndex) => (
          <div key={qubitIndex} className="flex items-center">
            {/* Qubit label */}
            <div className="w-12 flex-shrink-0 font-mono text-xs text-cyan-400">
              |q{qubitIndex}⟩
            </div>

            {/* Wire */}
            <div className="flex-1 relative h-8 flex items-center">
              {/* Base wire */}
              <div className="absolute inset-x-0 h-px bg-cyan-500/30" />

              {/* Gates */}
              <div className="relative flex justify-around w-full">
                {[...Array(gates)].map((_, gateIndex) => {
                  const showGate = Math.random() > 0.3;
                  const gateType = gateTypes[Math.floor(Math.random() * gateTypes.length)];
                  const isControl = gateType === "CX" && qubitIndex < qubits - 1;

                  if (!showGate) return <div key={gateIndex} className="w-8" />;

                  return (
                    <motion.div
                      key={gateIndex}
                      initial={animated ? { scale: 0, opacity: 0 } : undefined}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: (qubitIndex * gates + gateIndex) * 0.02 }}
                      className="relative"
                    >
                      {isControl ? (
                        <>
                          {/* Control dot */}
                          <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                          {/* Connection line to target */}
                          <div className="absolute top-3 left-1/2 w-px h-8 bg-cyan-400/50 -translate-x-1/2" />
                        </>
                      ) : (
                        <div
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center",
                            "bg-slate-800 border border-cyan-500/30",
                            "font-mono text-xs font-bold text-cyan-400",
                            "shadow-lg shadow-cyan-500/20"
                          )}
                        >
                          {gateType}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Measurement */}
            <motion.div
              initial={animated ? { opacity: 0 } : undefined}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + qubitIndex * 0.1 }}
              className="w-10 flex-shrink-0 ml-4"
            >
              <div className="w-8 h-8 rounded-md border border-cyan-500/30 bg-slate-800 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3v18M3 12h18M7 17l5-5 5 5" />
                </svg>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Scanning effect */}
      {animated && (
        <motion.div
          animate={{ x: ["-10%", "110%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none"
        />
      )}
    </div>
  );
};

export default QuantumCircuit;
