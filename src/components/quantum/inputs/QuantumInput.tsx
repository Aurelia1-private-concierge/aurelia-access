import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, forwardRef, InputHTMLAttributes, useEffect } from "react";
import { Check, X, AlertCircle, Mic, MicOff } from "lucide-react";

interface QuantumInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "minimal";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  voiceInput?: boolean;
  onVoiceInput?: (transcript: string) => void;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}

export const QuantumInput = forwardRef<HTMLInputElement, QuantumInputProps>(({
  label,
  error,
  success,
  hint,
  size = "md",
  variant = "default",
  icon,
  iconPosition = "left",
  voiceInput = false,
  onVoiceInput,
  loading = false,
  suggestions = [],
  onSuggestionSelect,
  className,
  disabled,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const sizeStyles = {
    sm: "h-8 text-xs px-3",
    md: "h-10 text-sm px-4",
    lg: "h-12 text-base px-5",
  };

  const iconPadding = {
    sm: iconPosition === "left" ? "pl-8" : "pr-8",
    md: iconPosition === "left" ? "pl-10" : "pr-10",
    lg: iconPosition === "left" ? "pl-12" : "pr-12",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setShowSuggestions(suggestions.length > 0);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 200);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlaceholderVisible(e.target.value === "");
    onChange?.(e);
  };

  // Voice input handling
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onVoiceInput?.(transcript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  useEffect(() => {
    setPlaceholderVisible(!value || value === "");
  }, [value]);

  const filteredSuggestions = suggestions.filter(s => 
    String(value).length > 0 && 
    s.toLowerCase().includes(String(value).toLowerCase())
  );

  return (
    <div className={cn("relative w-full", className)}>
      {/* Label */}
      {label && (
        <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Background glow */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-cyan-400/10 to-cyan-500/20 rounded-lg blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Input wrapper */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 text-slate-500 z-10",
              iconPosition === "left" ? "left-3" : "right-3",
              isFocused && "text-cyan-400"
            )}>
              {icon}
            </div>
          )}

          {/* Holographic placeholder */}
          <AnimatePresence>
            {placeholder && placeholderVisible && !isFocused && (
              <motion.span
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 pointer-events-none font-mono text-slate-500",
                  icon && iconPosition === "left" ? "left-10" : "left-4"
                )}
              >
                {placeholder}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Input */}
          <input
            ref={ref || inputRef}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={isFocused ? placeholder : ""}
            className={cn(
              "relative w-full rounded-lg bg-slate-900/90 border font-mono",
              "transition-all duration-300",
              "focus:outline-none focus:ring-2 focus:ring-cyan-500/30",
              variant === "default" && "border-cyan-500/20 hover:border-cyan-500/40",
              variant === "filled" && "border-transparent bg-slate-800",
              variant === "minimal" && "border-transparent bg-transparent hover:bg-slate-900/50",
              error && "border-red-500/50 focus:ring-red-500/30",
              success && "border-emerald-500/50 focus:ring-emerald-500/30",
              disabled && "opacity-50 cursor-not-allowed",
              sizeStyles[size],
              icon && iconPadding[size],
              voiceInput && "pr-12",
              "text-slate-100 placeholder:text-slate-500"
            )}
            {...props}
          />

          {/* Scanning line animation */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ left: "0%", opacity: 0 }}
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Status icons */}
          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-2",
            voiceInput && "right-12"
          )}>
            {loading && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
              />
            )}
            {success && !loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-emerald-400"
              >
                <Check className="w-4 h-4" />
              </motion.div>
            )}
            {error && !loading && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-red-400"
              >
                <X className="w-4 h-4" />
              </motion.div>
            )}
          </div>

          {/* Voice input button */}
          {voiceInput && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded transition-colors",
                isListening 
                  ? "text-red-400 bg-red-500/20" 
                  : "text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10"
              )}
            >
              {isListening ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <MicOff className="w-4 h-4" />
                </motion.div>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-lg border border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl overflow-hidden"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  type="button"
                  onClick={() => {
                    onSuggestionSelect?.(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm font-mono text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error/Hint messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1 mt-1.5 text-xs font-mono text-red-400"
          >
            <AlertCircle className="w-3 h-3" />
            {error}
          </motion.p>
        )}
        {hint && !error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 text-xs font-mono text-slate-500"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

QuantumInput.displayName = "QuantumInput";

export default QuantumInput;
