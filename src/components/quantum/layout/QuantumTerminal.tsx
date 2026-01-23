import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Copy, Check, Terminal, ChevronRight } from "lucide-react";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "success" | "info" | "system";
  content: string;
  timestamp?: Date;
}

interface QuantumTerminalProps {
  title?: string;
  theme?: "cyan" | "amber" | "emerald" | "purple";
  height?: string;
  className?: string;
  initialLines?: TerminalLine[];
  onCommand?: (command: string) => Promise<string | TerminalLine[]>;
  readOnly?: boolean;
  showTimestamps?: boolean;
  welcomeMessage?: string;
  prompt?: string;
}

export const QuantumTerminal = ({
  title = "Terminal",
  theme = "cyan",
  height = "400px",
  className,
  initialLines = [],
  onCommand,
  readOnly = false,
  showTimestamps = false,
  welcomeMessage = "Quantum Terminal v2.0 - Ready",
  prompt = "→",
}: QuantumTerminalProps) => {
  const [lines, setLines] = useState<TerminalLine[]>(() => [
    { id: "welcome", type: "system", content: welcomeMessage, timestamp: new Date() },
    ...initialLines,
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeColors = {
    cyan: {
      primary: "text-cyan-400",
      secondary: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
      glow: "shadow-cyan-500/20",
    },
    amber: {
      primary: "text-amber-400",
      secondary: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      glow: "shadow-amber-500/20",
    },
    emerald: {
      primary: "text-emerald-400",
      secondary: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
    },
    purple: {
      primary: "text-purple-400",
      secondary: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
    },
  };

  const colors = themeColors[theme];

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click
  const handleContainerClick = () => {
    if (!readOnly) {
      inputRef.current?.focus();
    }
  };

  const addLine = useCallback((line: Omit<TerminalLine, "id">) => {
    setLines((prev) => [
      ...prev,
      { ...line, id: `line-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
    ]);
  }, []);

  const handleSubmit = async () => {
    if (!input.trim() || isProcessing) return;

    const command = input.trim();
    setInput("");
    setHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    // Add input line
    addLine({ type: "input", content: command, timestamp: new Date() });

    if (onCommand) {
      setIsProcessing(true);
      try {
        const result = await onCommand(command);
        
        if (Array.isArray(result)) {
          result.forEach((line) => {
            addLine({ ...line, timestamp: new Date() });
          });
        } else {
          addLine({ type: "output", content: result, timestamp: new Date() });
        }
      } catch (error) {
        addLine({ 
          type: "error", 
          content: error instanceof Error ? error.message : "Command failed",
          timestamp: new Date(),
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  const copyToClipboard = async () => {
    const text = lines.map((l) => l.content).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "input":
        return "text-slate-200";
      case "output":
        return "text-slate-400";
      case "error":
        return "text-red-400";
      case "success":
        return "text-emerald-400";
      case "info":
        return colors.primary;
      case "system":
        return colors.secondary;
      default:
        return "text-slate-400";
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden bg-slate-950",
        colors.border,
        className
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-2 border-b", colors.border, colors.bg)}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <Terminal className={cn("w-4 h-4", colors.primary)} />
          <span className={cn("text-xs font-mono uppercase tracking-wider", colors.primary)}>
            {title}
          </span>
        </div>
        
        <button
          onClick={copyToClipboard}
          className={cn(
            "p-1.5 rounded transition-colors",
            "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
          )}
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Terminal content */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="overflow-y-auto font-mono text-sm p-4 cursor-text"
        style={{ height }}
      >
        {/* Lines */}
        <AnimatePresence mode="popLayout">
          {lines.map((line) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 mb-1"
            >
              {/* Timestamp */}
              {showTimestamps && line.timestamp && (
                <span className="text-slate-600 text-xs flex-shrink-0">
                  [{line.timestamp.toLocaleTimeString()}]
                </span>
              )}
              
              {/* Prompt for input lines */}
              {line.type === "input" && (
                <ChevronRight className={cn("w-4 h-4 flex-shrink-0 mt-0.5", colors.primary)} />
              )}
              
              {/* Content with typewriter effect for output */}
              <span className={cn("whitespace-pre-wrap break-all", getLineColor(line.type))}>
                {line.type === "output" || line.type === "system" ? (
                  <TypewriterText text={line.content} />
                ) : (
                  line.content
                )}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Input line */}
        {!readOnly && (
          <div className="flex items-center gap-2 mt-2">
            <span className={colors.primary}>{prompt}</span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isProcessing}
                className={cn(
                  "w-full bg-transparent border-none outline-none text-slate-200 font-mono",
                  "caret-cyan-400",
                  isProcessing && "opacity-50"
                )}
                spellCheck={false}
                autoComplete="off"
              />
              
              {/* Processing indicator */}
              {isProcessing && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={cn("absolute right-0 top-0", colors.primary)}
                >
                  ▋
                </motion.span>
              )}
            </div>
          </div>
        )}

        {/* Scanning line effect */}
        <motion.div
          animate={{ y: [0, 100, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none"
        />
      </div>
    </div>
  );
};

// Typewriter effect component
const TypewriterText = ({ text, speed = 10 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (text.length <= 50) {
      // Short text - display immediately
      setDisplayedText(text);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <>{displayedText}</>;
};

export default QuantumTerminal;
