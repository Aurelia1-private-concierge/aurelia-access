import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  FileText,
  Users,
  ListChecks,
  CheckCircle,
  ChevronDown,
  Clock,
  Zap,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
}

const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Initiate Request",
    description: "Via Orla AI assistant or Dashboard",
    icon: MessageSquare,
    details: [
      "Speak naturally with Orla, your AI concierge",
      "Or use the structured request form in your dashboard",
      "Available 24/7 across all time zones",
    ],
  },
  {
    number: 2,
    title: "Details & Preferences",
    description: "Describe your requirements",
    icon: FileText,
    details: [
      "Select service category and priority level",
      "Provide specific requirements and preferences",
      "Set budget range and timeline (optional)",
    ],
  },
  {
    number: 3,
    title: "Concierge Review",
    description: "Team reviews within tier timeframe",
    icon: Users,
    details: [
      "Dedicated concierge assigned to your request",
      "Initial research and partner coordination",
      "Clarifying questions if needed",
    ],
  },
  {
    number: 4,
    title: "Curated Options",
    description: "Receive 2-3 personalized choices",
    icon: ListChecks,
    details: [
      "Hand-selected options tailored to you",
      "Detailed information on each option",
      "Transparent pricing and availability",
    ],
  },
  {
    number: 5,
    title: "Confirmation",
    description: "Credits deducted on completion",
    icon: CheckCircle,
    details: [
      "Review and approve your selection",
      "Seamless booking and coordination",
      "Credits charged only upon fulfillment",
    ],
  },
];

const tierTimelines = [
  {
    tier: "Signature",
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-border/50",
    times: {
      initial: "48 hours",
      options: "72 hours",
      fulfillment: "Standard",
    },
  },
  {
    tier: "Prestige",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    times: {
      initial: "24 hours",
      options: "48 hours",
      fulfillment: "Priority",
    },
  },
  {
    tier: "Black Card",
    icon: Crown,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    times: {
      initial: "4 hours",
      options: "24 hours",
      fulfillment: "Immediate",
    },
  },
];

export const ServiceProcessSteps = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  return (
    <section className="py-12 px-6 border-t border-b border-border/20">
      <div className="max-w-7xl mx-auto">
        {/* Header with toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group inline-flex flex-col items-center gap-2"
          >
            <h2 className="text-xl font-serif text-foreground group-hover:text-primary transition-colors">
              How It Works
            </h2>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
          </button>
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Steps - Horizontal on desktop, vertical on mobile */}
              <div className="relative mb-12">
                {/* Connection line - desktop */}
                <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4">
                  {processSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = activeStep === index;

                    return (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        <button
                          onClick={() => setActiveStep(isActive ? null : index)}
                          className="w-full text-left group"
                        >
                          {/* Step circle */}
                          <div className="flex md:flex-col md:items-center gap-4 md:gap-3">
                            <div
                              className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                isActive
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-card group-hover:border-primary/50"
                              }`}
                            >
                              <Icon
                                className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${
                                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                }`}
                              />
                              <span
                                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-medium flex items-center justify-center ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {step.number}
                              </span>
                            </div>

                            <div className="flex-1 md:text-center">
                              <h3
                                className={`text-sm font-medium transition-colors ${
                                  isActive ? "text-primary" : "text-foreground"
                                }`}
                              >
                                {step.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {step.description}
                              </p>
                            </div>
                          </div>

                          {/* Expanded details - mobile shows inline, desktop shows below */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 md:mt-4 pl-16 md:pl-0"
                              >
                                <ul className="space-y-1.5">
                                  {step.details.map((detail, i) => (
                                    <li
                                      key={i}
                                      className="text-xs text-muted-foreground flex items-start gap-2"
                                    >
                                      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                      {detail}
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Tier timelines */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card/50 border border-border/30 rounded-xl p-6"
              >
                <h3 className="text-sm font-medium text-foreground mb-4 text-center">
                  Response Times by Membership Tier
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {tierTimelines.map((tier) => {
                    const TierIcon = tier.icon;
                    return (
                      <div
                        key={tier.tier}
                        className={`p-4 rounded-lg border ${tier.borderColor} ${tier.bgColor}`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <TierIcon className={`w-4 h-4 ${tier.color}`} />
                          <span className={`text-sm font-medium ${tier.color}`}>
                            {tier.tier}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Initial Response</span>
                            <span className="text-foreground font-medium">{tier.times.initial}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Options Presented</span>
                            <span className="text-foreground font-medium">{tier.times.options}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Fulfillment</span>
                            <span className="text-foreground font-medium">{tier.times.fulfillment}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8"
              >
                <Link to="/dashboard?view=services">
                  <Button className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Start a Request
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ServiceProcessSteps;
