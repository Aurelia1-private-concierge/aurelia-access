import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  Ship,
  Home,
  Utensils,
  Ticket,
  ShoppingBag,
  Heart,
  Car,
  Sparkles,
  Loader2,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useServiceWorkflow } from "@/hooks/useServiceWorkflow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const categories = [
  { id: "travel", name: "Travel & Aviation", icon: Plane },
  { id: "yacht", name: "Yacht & Marine", icon: Ship },
  { id: "property", name: "Real Estate", icon: Home },
  { id: "dining", name: "Fine Dining", icon: Utensils },
  { id: "events", name: "Events & Entertainment", icon: Ticket },
  { id: "shopping", name: "Personal Shopping", icon: ShoppingBag },
  { id: "wellness", name: "Wellness & Spa", icon: Heart },
  { id: "transport", name: "Transportation", icon: Car },
  { id: "other", name: "Bespoke Request", icon: Sparkles },
];

const priorities = [
  { id: "low", name: "Standard", description: "Within 48 hours" },
  { id: "medium", name: "Priority", description: "Within 24 hours" },
  { id: "high", name: "Urgent", description: "Within 4 hours" },
  { id: "critical", name: "Immediate", description: "ASAP" },
];

interface ServiceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ServiceRequestForm = ({
  open,
  onOpenChange,
}: ServiceRequestFormProps) => {
  const { createRequest, isSubmitting } = useServiceWorkflow();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      await createRequest({
        title,
        description,
        category: selectedCategory,
        priority,
        deadline: deadline || undefined,
        budget_min: budgetMin ? parseFloat(budgetMin) : undefined,
        budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
      });

      setIsSuccess(true);
      toast({
        title: "Request Submitted",
        description: "Your concierge team will be in touch shortly.",
      });

      // Reset after delay
      setTimeout(() => {
        setIsSuccess(false);
        setStep(1);
        setSelectedCategory("");
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDeadline("");
        setBudgetMin("");
        setBudgetMax("");
        onOpenChange(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canProceedStep1 = selectedCategory !== "";
  const canProceedStep2 = title.trim() !== "" && description.trim() !== "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="font-serif text-2xl text-foreground mb-2">
              Request Submitted
            </h3>
            <p className="text-muted-foreground">
              Your dedicated concierge team is reviewing your request.
            </p>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                New Service Request
              </DialogTitle>
              <DialogDescription>
                Tell us how we can assist you today.
              </DialogDescription>
            </DialogHeader>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2 my-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Category Selection */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Label className="text-sm mb-4 block">
                  Select Service Category
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 mb-2 ${
                            isSelected ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            isSelected ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {cat.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Request Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Request Title</Label>
                  <input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Private Jet to Monaco"
                    className="w-full mt-1.5 bg-muted/30 border border-border/50 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide details about your request, including dates, preferences, and any special requirements..."
                    rows={4}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label>Priority Level</Label>
                  <div className="grid grid-cols-4 gap-2 mt-1.5">
                    {priorities.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPriority(p.id)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          priority === p.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <p
                          className={`text-sm font-medium ${
                            priority === p.id
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {p.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {p.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 justify-between mt-6">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Budget & Timeline */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Preferred Deadline (Optional)
                  </Label>
                  <input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full mt-1.5 bg-muted/30 border border-border/50 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Budget Range (Optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      placeholder="Minimum"
                      className="w-full bg-muted/30 border border-border/50 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      placeholder="Maximum"
                      className="w-full bg-muted/30 border border-border/50 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 flex items-start gap-3 mt-4">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Before You Submit
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Our concierge team will review your request and contact
                      you within the timeframe specified by your priority level.
                      Service credits will be deducted upon successful
                      fulfillment.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-between mt-6">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRequestForm;
