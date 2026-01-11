import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Heart, Sparkles, ArrowRight, ArrowLeft, Check,
  Sun, Moon, Zap, Feather, Crown, Compass, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface EQQuestion {
  id: string;
  category: "emotional" | "social" | "lifestyle" | "preferences";
  question: string;
  options: { value: string; label: string; icon?: any; description?: string }[];
}

const questions: EQQuestion[] = [
  {
    id: "pace",
    category: "lifestyle",
    question: "How do you prefer to experience luxury?",
    options: [
      { value: "immersive", label: "Deeply Immersive", icon: Moon, description: "Slow, meaningful experiences that linger" },
      { value: "dynamic", label: "Dynamic & Varied", icon: Zap, description: "Fast-paced, multiple experiences" },
      { value: "balanced", label: "Perfectly Balanced", icon: Feather, description: "A curated mix of both" },
    ],
  },
  {
    id: "social",
    category: "social",
    question: "Your ideal social setting for exclusive experiences?",
    options: [
      { value: "private", label: "Intimate Privacy", icon: Crown, description: "Just you or closest companions" },
      { value: "curated", label: "Curated Gatherings", icon: Star, description: "Small groups of like-minded individuals" },
      { value: "vibrant", label: "Vibrant Scenes", icon: Sparkles, description: "Where the world's elite converge" },
    ],
  },
  {
    id: "decision",
    category: "emotional",
    question: "When making significant decisions, you...",
    options: [
      { value: "intuitive", label: "Trust Your Instincts", icon: Heart, description: "Gut feeling guides you" },
      { value: "analytical", label: "Analyze Thoroughly", icon: Brain, description: "Data and logic first" },
      { value: "advisory", label: "Seek Expert Counsel", icon: Compass, description: "Value trusted opinions" },
    ],
  },
  {
    id: "time",
    category: "preferences",
    question: "Your relationship with time and spontaneity?",
    options: [
      { value: "planned", label: "Meticulously Planned", icon: Sun, description: "Every detail arranged in advance" },
      { value: "flexible", label: "Flexibly Structured", icon: Feather, description: "Framework with room for magic" },
      { value: "spontaneous", label: "Beautifully Spontaneous", icon: Zap, description: "Best moments are unplanned" },
    ],
  },
  {
    id: "value",
    category: "emotional",
    question: "What matters most in exceptional service?",
    options: [
      { value: "anticipation", label: "Anticipation", icon: Sparkles, description: "Needs met before expressed" },
      { value: "discretion", label: "Absolute Discretion", icon: Crown, description: "Privacy above all else" },
      { value: "personalization", label: "Deep Personalization", icon: Heart, description: "Knowing you intimately" },
    ],
  },
];

interface EQProfileModuleProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: Record<string, string>) => void;
}

const EQProfileModule = ({ isOpen, onClose, onComplete }: EQProfileModuleProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      setIsComplete(true);
      onComplete(newAnswers);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const getArchetype = () => {
    const values = Object.values(answers);
    if (values.includes("immersive") && values.includes("private")) {
      return { name: "The Connoisseur", emoji: "🎭", description: "You seek depth over breadth, valuing intimate, meaningful experiences that resonate with your refined sensibilities." };
    }
    if (values.includes("dynamic") && values.includes("vibrant")) {
      return { name: "The Luminary", emoji: "✨", description: "You thrive in exclusive circles, drawn to the energy of curated gatherings and exceptional moments." };
    }
    if (values.includes("spontaneous") && values.includes("intuitive")) {
      return { name: "The Adventurer", emoji: "🧭", description: "You follow your instincts to extraordinary places, embracing the magic of unplanned discoveries." };
    }
    return { name: "The Curator", emoji: "👑", description: "You orchestrate life with intention, balancing structure with spontaneity for optimal experiences." };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-2xl"
          >
            {!isComplete ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/30 to-primary flex items-center justify-center"
                  >
                    <Brain className="w-8 h-8 text-primary-foreground" />
                  </motion.div>
                  <h2 className="text-2xl font-serif text-foreground mb-2">Emotional Intelligence Profile</h2>
                  <p className="text-sm text-muted-foreground">Help us understand you for a truly personalized experience</p>
                </div>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-serif text-center text-foreground">
                      {question.question}
                    </h3>

                    <div className="grid gap-4">
                      {question.options.map((option, index) => {
                        const Icon = option.icon;
                        const isSelected = answers[question.id] === option.value;
                        
                        return (
                          <motion.button
                            key={option.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleAnswer(option.value)}
                            className={`group relative p-5 rounded-2xl border text-left transition-all ${
                              isSelected
                                ? "bg-primary/20 border-primary shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                                : "bg-secondary/30 border-border/30 hover:border-primary/50 hover:bg-secondary/50"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                isSelected ? "bg-primary/30" : "bg-secondary group-hover:bg-primary/10"
                              }`}>
                                {Icon && <Icon className={`w-6 h-6 ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`} />}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium mb-1 ${isSelected ? "text-primary" : "text-foreground"}`}>
                                  {option.label}
                                </p>
                                {option.description && (
                                  <p className="text-sm text-muted-foreground">{option.description}</p>
                                )}
                              </div>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                                >
                                  <Check className="w-4 h-4 text-primary-foreground" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button variant="ghost" onClick={onClose}>
                    Skip for now
                  </Button>
                </div>
              </>
            ) : (
              /* Results */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="text-6xl mb-6"
                >
                  {getArchetype().emoji}
                </motion.div>
                
                <h2 className="text-3xl font-serif text-foreground mb-2">
                  You are <span className="text-primary">{getArchetype().name}</span>
                </h2>
                
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  {getArchetype().description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto">
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <p className="text-2xl font-serif text-primary mb-1">98%</p>
                    <p className="text-xs text-muted-foreground">EQ Match Score</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-2xl font-serif text-emerald-400 mb-1">Elite</p>
                    <p className="text-xs text-muted-foreground">Service Tier</p>
                  </div>
                </div>

                <Button onClick={onClose} className="gap-2">
                  Begin Your Journey
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EQProfileModule;
