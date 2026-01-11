import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Command, Check, X, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceCommand {
  phrase: string;
  action: () => void;
  description: string;
}

interface VoiceCommandsProps {
  onNavigate?: (section: string) => void;
  onToggleMusic?: () => void;
  onToggleNarrator?: () => void;
  onToggleDarkMode?: () => void;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({
  onNavigate,
  onToggleMusic,
  onToggleNarrator,
  onToggleDarkMode,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Define voice commands
  const commands: VoiceCommand[] = [
    {
      phrase: 'go to top',
      action: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      description: 'Scroll to top',
    },
    {
      phrase: 'scroll down',
      action: () => window.scrollBy({ top: 500, behavior: 'smooth' }),
      description: 'Scroll down',
    },
    {
      phrase: 'scroll up',
      action: () => window.scrollBy({ top: -500, behavior: 'smooth' }),
      description: 'Scroll up',
    },
    {
      phrase: 'go to experiences',
      action: () => document.getElementById('experiences')?.scrollIntoView({ behavior: 'smooth' }),
      description: 'Navigate to experiences',
    },
    {
      phrase: 'go to services',
      action: () => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }),
      description: 'Navigate to services',
    },
    {
      phrase: 'go to membership',
      action: () => document.getElementById('membership')?.scrollIntoView({ behavior: 'smooth' }),
      description: 'Navigate to membership',
    },
    {
      phrase: 'go to contact',
      action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
      description: 'Navigate to contact',
    },
    {
      phrase: 'play music',
      action: () => onToggleMusic?.(),
      description: 'Toggle ambient music',
    },
    {
      phrase: 'stop music',
      action: () => onToggleMusic?.(),
      description: 'Stop ambient music',
    },
    {
      phrase: 'start tour',
      action: () => onToggleNarrator?.(),
      description: 'Start audio tour',
    },
    {
      phrase: 'stop tour',
      action: () => onToggleNarrator?.(),
      description: 'Stop audio tour',
    },
    {
      phrase: 'toggle theme',
      action: () => onToggleDarkMode?.(),
      description: 'Toggle dark/light mode',
    },
  ];

  // Check for speech recognition support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current];
        const text = result[0].transcript.toLowerCase();
        setTranscript(text);

        if (result.isFinal) {
          processCommand(text);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        showCommandFeedback('error', 'Could not understand. Please try again.');
      };
    }
  }, []);

  const showCommandFeedback = (type: 'success' | 'error', message: string) => {
    setFeedbackType(type);
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  const processCommand = useCallback((text: string) => {
    const matchedCommand = commands.find(cmd => 
      text.includes(cmd.phrase.toLowerCase())
    );

    if (matchedCommand) {
      matchedCommand.action();
      showCommandFeedback('success', matchedCommand.description);
      toast({
        title: 'Voice Command',
        description: matchedCommand.description,
      });
    } else {
      showCommandFeedback('error', 'Command not recognized');
    }
    
    setTranscript('');
  }, [commands]);

  const toggleListening = useCallback(() => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Voice commands are not supported in this browser.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast({
          title: 'Listening...',
          description: 'Say a command like "go to experiences"',
        });
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  }, [isListening, isSupported]);

  if (!isSupported) return null;

  return (
    <>
      {/* Voice Command Button - Hidden on small mobile for cleaner UI */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
        className={`
          fixed bottom-4 right-20 sm:bottom-6 sm:right-24 z-50 p-3 sm:p-4 rounded-full shadow-lg transition-all duration-300 hidden sm:flex items-center justify-center
          ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-card/95 backdrop-blur-xl border border-primary/30 text-primary hover:bg-primary/10'
          }
        `}
        title="Voice Commands"
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        
        {/* Listening animation */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Transcript Display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 bg-card/95 backdrop-blur-xl border border-primary/30 rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-xl max-w-[200px] sm:max-w-xs"
          >
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
              <p className="text-sm text-foreground">{transcript}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Display */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 rounded-xl px-3 py-2 sm:px-4 sm:py-3 shadow-xl flex items-center gap-2 text-sm ${
              feedbackType === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}
          >
            {feedbackType === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command Help Tooltip */}
      <AnimatePresence>
        {isListening && !transcript && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 bg-card/95 backdrop-blur-xl border border-primary/30 rounded-xl p-3 sm:p-4 shadow-xl max-w-[200px] sm:max-w-xs"
          >
            <div className="flex items-center gap-2 mb-3">
              <Command className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-medium text-foreground">Voice Commands</h4>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li>"Go to top" - Scroll to top</li>
              <li>"Go to experiences" - Navigate</li>
              <li>"Play music" - Toggle music</li>
              <li>"Start tour" - Audio tour</li>
              <li>"Scroll down/up" - Scroll page</li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Add type declarations for SpeechRecognition
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

export default VoiceCommands;
