import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Globe, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { validatePrimaryDomains, validateSingleDomain, hasDuplicateDomains } from "@/lib/domain-validation";

const MAX_DOMAINS = 5;

interface ApolloDomainFormProps {
  onSave?: (domains: string[]) => void;
}

const ApolloDomainForm = ({ onSave }: ApolloDomainFormProps) => {
  const [domains, setDomains] = useState<string[]>([""]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const validateAll = (): boolean => {
    const filledDomains = domains.filter(d => d.trim());
    
    if (filledDomains.length === 0) {
      setGlobalError("Please enter at least one domain.");
      return false;
    }

    if (hasDuplicateDomains(domains)) {
      setGlobalError("Duplicate domains are not allowed.");
      return false;
    }

    const newErrors: string[] = [];
    let hasError = false;

    domains.forEach((domain, index) => {
      const error = validateSingleDomain(domain);
      newErrors[index] = error || "";
      if (error && domain.trim()) hasError = true;
    });

    setErrors(newErrors);
    setGlobalError(null);
    
    // Final validation using the shared utility
    if (!hasError && !validatePrimaryDomains(filledDomains)) {
      setGlobalError("Invalid domain configuration.");
      return false;
    }
    
    return !hasError;
  };

  const handleDomainChange = (index: number, value: string) => {
    const newDomains = [...domains];
    newDomains[index] = value;
    setDomains(newDomains);

    // Clear errors on change
    const newErrors = [...errors];
    newErrors[index] = "";
    setErrors(newErrors);
    setGlobalError(null);
  };

  const addDomain = () => {
    if (domains.length >= MAX_DOMAINS) {
      setGlobalError(`Maximum ${MAX_DOMAINS} domains allowed.`);
      return;
    }
    setDomains([...domains, ""]);
  };

  const removeDomain = (index: number) => {
    if (domains.length === 1) return;
    const newDomains = domains.filter((_, i) => i !== index);
    const newErrors = errors.filter((_, i) => i !== index);
    setDomains(newDomains);
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) return;

    setIsSubmitting(true);
    
    try {
      const validDomains = domains.filter(d => d.trim());
      
      // Save to app_settings
      const { error } = await supabase
        .from("app_settings")
        .upsert({
          key: "apollo_allowed_domains",
          value: JSON.stringify(validDomains),
          description: "Apollo.io allowed form domains",
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });

      if (error) throw error;

      toast.success("Apollo domains saved successfully");
      onSave?.(validDomains);
    } catch (error) {
      console.error("Failed to save domains:", error);
      toast.error("Failed to save domains");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Globe className="h-5 w-5 text-primary" />
          Apollo.io Domain Configuration
        </CardTitle>
        <CardDescription>
          Add up to {MAX_DOMAINS} website domains where your forms are hosted.
          <br />
          <span className="text-muted-foreground/80">
            Use only the primary domain (e.g., https://apollo.io). No subdomains or paths.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3" role="group" aria-label="Domain list">
            <AnimatePresence mode="popLayout">
              {domains.map((domain, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2 items-start"
                >
                  <div className="flex-1">
                    <Input
                      type="url"
                      value={domain}
                      onChange={(e) => handleDomainChange(index, e.target.value)}
                      placeholder="https://example.com"
                      aria-label={`Domain ${index + 1}`}
                      className={`bg-background/50 border-primary/30 focus:border-primary ${
                        errors[index] ? "border-destructive" : ""
                      }`}
                    />
                    {errors[index] && (
                      <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors[index]}
                      </p>
                    )}
                  </div>
                  {domains.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDomain(index)}
                      aria-label={`Remove domain ${index + 1}`}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {globalError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" />
              {globalError}
            </motion.p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {domains.length < MAX_DOMAINS && (
              <Button
                type="button"
                variant="outline"
                onClick={addDomain}
                className="border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Domains
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            {domains.filter(d => d.trim()).length} of {MAX_DOMAINS} domains configured
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApolloDomainForm;
