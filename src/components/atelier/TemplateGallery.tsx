import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Lock, Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TEMPLATE_CATEGORIES } from "@/lib/atelier-templates";
import type { SiteTemplate } from "@/hooks/useAtelier";

interface TemplateGalleryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: SiteTemplate[];
  onSelect: (templateId: string) => void;
  currentTier: "gold" | "platinum" | null;
}

const TemplateGallery = ({
  open,
  onOpenChange,
  templates,
  onSelect,
  currentTier,
}: TemplateGalleryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const canAccessTemplate = (minTier: string) => {
    if (!currentTier) return false;
    if (currentTier === "platinum") return true;
    return minTier === "gold";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Choose Your Template
          </DialogTitle>
          <DialogDescription>
            Select a luxury template to start building your microsite
          </DialogDescription>
        </DialogHeader>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b">
          <Button
            variant={selectedCategory === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Templates
          </Button>
          {TEMPLATE_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredTemplates.map((template) => {
                const isLocked = !canAccessTemplate(template.min_tier);
                const isHovered = hoveredTemplate === template.id;

                return (
                  <motion.div
                    key={template.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative"
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                  >
                    <button
                      onClick={() => !isLocked && onSelect(template.id)}
                      disabled={isLocked}
                      className={cn(
                        "w-full text-left rounded-lg border overflow-hidden transition-all duration-200",
                        isLocked
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:border-primary/50 hover:shadow-lg cursor-pointer",
                        isHovered && !isLocked && "ring-2 ring-primary/30"
                      )}
                    >
                      {/* Template Preview */}
                      <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative">
                        {/* Template icon/preview */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-12 rounded bg-background/80 border shadow-sm" />
                        </div>

                        {/* Tier badge */}
                        {template.min_tier === "platinum" && (
                          <Badge 
                            className="absolute top-2 right-2 bg-amber-500/20 text-amber-400 border-amber-500/30"
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Platinum
                          </Badge>
                        )}

                        {/* Lock overlay */}
                        {isLocked && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="w-6 h-6 mx-auto text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">Platinum Only</span>
                            </div>
                          </div>
                        )}

                        {/* Selection indicator */}
                        <AnimatePresence>
                          {isHovered && !isLocked && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-primary/10 flex items-center justify-center"
                            >
                              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-5 h-5 text-primary-foreground" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Template Info */}
                      <div className="p-4 bg-card">
                        <h3 className="font-medium text-foreground">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        <Badge variant="secondary" className="mt-3 text-xs">
                          {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.name || template.category}
                        </Badge>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates in this category</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGallery;
