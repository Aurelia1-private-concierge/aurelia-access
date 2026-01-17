import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  CategoryIntake,
  IntakeQuestion,
  getIntakeConfigByCategory,
} from "@/lib/discovery-intake-config";

interface DiscoveryIntakeQuestionsProps {
  categoryId: string;
  onComplete: (answers: Record<string, string | string[]>) => void;
  onBack: () => void;
}

export const DiscoveryIntakeQuestions = ({
  categoryId,
  onComplete,
  onBack,
}: DiscoveryIntakeQuestionsProps) => {
  const config = getIntakeConfigByCategory(categoryId);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!config) {
    // If no specialized intake, proceed immediately
    onComplete({});
    return null;
  }

  const questions = config.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleSelectOption = (questionId: string, option: string, isMulti: boolean) => {
    if (isMulti) {
      const current = (answers[questionId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: option });
    }
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const canProceed = () => {
    const answer = answers[currentQuestion.id];
    if (!currentQuestion.required) return true;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer && answer.trim() !== "";
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  const renderQuestion = (question: IntakeQuestion) => {
    const answer = answers[question.id];

    switch (question.type) {
      case "select":
        return (
          <div className="grid grid-cols-1 gap-2">
            {question.options?.map((option) => {
              const isSelected = answer === option;
              return (
                <button
                  key={option}
                  onClick={() => handleSelectOption(question.id, option, false)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm ${
                        isSelected ? "text-foreground font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {option}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        );

      case "multiselect":
        const selectedOptions = (answer as string[]) || [];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options?.map((option) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <button
                  key={option}
                  onClick={() => handleSelectOption(question.id, option, true)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span
                      className={`text-sm ${
                        isSelected ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        );

      case "text":
        return (
          <input
            type="text"
            value={(answer as string) || ""}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full bg-muted/30 border border-border/50 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(answer as string) || ""}
            onChange={(e) => handleTextChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
          />
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
          {config.categoryName}
        </p>
        <p className="text-sm text-muted-foreground">
          Specialized intake questions
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          {!currentQuestion.required && <span className="text-primary">Optional</span>}
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <Label className="text-base font-medium text-foreground">
          {currentQuestion.question}
          {currentQuestion.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {renderQuestion(currentQuestion)}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 justify-between pt-4">
        <Button variant="ghost" onClick={handlePrevious}>
          Back
        </Button>
        <div className="flex gap-2">
          {!currentQuestion.required && currentQuestionIndex < totalQuestions - 1 && (
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
            >
              Skip
            </Button>
          )}
          <Button onClick={handleNext} disabled={!canProceed()}>
            {currentQuestionIndex === totalQuestions - 1 ? "Complete" : "Next"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscoveryIntakeQuestions;
